<script lang="ts">
	import { untrack } from "svelte";
	import type { Attachment } from "svelte/attachments";
	import {
		Camera,
		Mesh,
		Program,
		Renderer,
		Texture,
		Transform,
		Triangle,
		Vec2,
		Vec3,
	} from "ogl";
	import { type ColorRepresentation, toRgb } from "../../helpers/color";
	import { buildSvgSdf, defaultLogoSvg } from "../../helpers/svg-sdf";

	interface Props {
		/**
		 * Inline SVG markup used as the logo silhouette.
		 */
		svgSource?: string;
		/**
		 * Animation speed multiplier.
		 * @default 1
		 */
		speed?: number;
		/**
		 * Scale multiplier for the logo silhouette.
		 * @default 1
		 */
		scale?: number;
		/**
		 * Horizontal logo offset in normalized viewport units.
		 * @default 0
		 */
		offsetX?: number;
		/**
		 * Vertical logo offset in normalized viewport units.
		 * @default 0
		 */
		offsetY?: number;
		/**
		 * Logo rotation in degrees.
		 * @default 0
		 */
		rotation?: number;
		/**
		 * Strength of the glass refraction.
		 * @default 1
		 */
		refraction?: number;
		/**
		 * Strength of the RGB separation inside the glass.
		 * @default 1
		 */
		chromaticAberration?: number;
		/**
		 * Radius multiplier for the internal blur sampling.
		 * @default 1
		 */
		blur?: number;
		/**
		 * Dark color used by the procedural swirl.
		 * @default "#222326"
		 */
		swirlColorA?: ColorRepresentation;
		/**
		 * Light color used by the procedural swirl.
		 * @default "#ff6900"
		 */
		swirlColorB?: ColorRepresentation;
	}

	let {
		svgSource = defaultLogoSvg,
		speed = 1,
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		refraction = 1,
		chromaticAberration = 1,
		blur = 1,
		swirlColorA = "#222326",
		swirlColorB = "#ff6900",
	}: Props = $props();

	type UniformState = {
		uResolution: { value: Vec2 };
		uTime: { value: number };
		uSdf: { value: Texture };
		uSpeed: { value: number };
		uScale: { value: number };
		uOffset: { value: Vec2 };
		uRotation: { value: number };
		uRefraction: { value: number };
		uChromaticAberration: { value: number };
		uBlur: { value: number };
		uSwirlColorA: { value: Vec3 };
		uSwirlColorB: { value: Vec3 };
	};

	let uniforms = $state.raw<UniformState>();
	let setSvgSource = $state<(source: string) => void>();

	const DEFAULT_SWIRL_COLOR_A: [number, number, number] = [0.006, 0.006, 0.005];
	const DEFAULT_SWIRL_COLOR_B: [number, number, number] = [1, 105 / 255, 0];

	const applyColor = (
		target: Vec3,
		value: ColorRepresentation,
		fallback: [number, number, number],
	) => {
		const [r, g, b] = toRgb(value, fallback);
		target.set(r, g, b);
	};

	const vertexShader = `#version 300 es
		in vec2 uv;
		in vec2 position;
		out vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = vec4(position, 0.0, 1.0);
		}
	`;

	const fragmentShader = `#version 300 es
		precision highp float;

		uniform vec2 uResolution;
		uniform float uTime;
		uniform sampler2D uSdf;
		uniform float uSpeed;
		uniform float uScale;
		uniform vec2 uOffset;
		uniform float uRotation;
		uniform float uRefraction;
		uniform float uChromaticAberration;
		uniform float uBlur;
		uniform vec3 uSwirlColorA;
		uniform vec3 uSwirlColorB;

		in vec2 vUv;
		out vec4 outColor;

		vec3 swirl(vec2 uv) {
			float t = uTime * 0.5;
			float detail = 4.2;
			vec2 d1 = vec2(
				uv.x + sin(uv.y * detail * 1.7 + t * 0.8) * 0.12 + cos(uv.x * detail * 0.9 - t * 0.5) * 0.05,
				uv.y + cos(uv.x * detail * 1.3 - t * 0.6) * 0.12 + sin(uv.y * detail * 1.1 + t * 0.7) * 0.05
			);
			float p1 = sin(d1.x * detail * 2.1 + d1.y * detail * 1.8 + t * 0.4);
			float freq2 = detail;
			vec2 d2 = vec2(
				d1.x + cos(d1.y * freq2 * 2.7 - t * 0.45) * 0.07 + sin(d1.x * freq2 * 1.9 + t * 0.6) * 0.04,
				d1.y + sin(d1.x * freq2 * 2.3 + t * 0.65) * 0.07 + cos(d1.y * freq2 * 1.6 - t * 0.4) * 0.04
			);
			float p2 = cos(d2.x * freq2 * 1.4 - d2.y * freq2 * 1.9 + t * 0.35);
			float combined = p1 * 0.45 + p2 * 0.35;
			float blendFactor = smoothstep(0.3, 0.7, combined * 0.5 + 0.5 - 0.192);
			float shimmer = sin(t * 2.5 + combined * 8.0) * 0.015 + 1.0;
			return mix(uSwirlColorA, uSwirlColorB, blendFactor) * shimmer;
		}

		float sdfAt(vec2 uv) {
			if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
				return 1.0;
			}

			vec2 size = vec2(textureSize(uSdf, 0));
			vec2 texel = uv * size - 0.5;
			vec2 base = floor(texel);
			vec2 f = fract(texel);
			ivec2 p0 = ivec2(clamp(base, vec2(0.0), size - 1.0));
			ivec2 p1 = ivec2(clamp(base + vec2(1.0, 0.0), vec2(0.0), size - 1.0));
			ivec2 p2 = ivec2(clamp(base + vec2(0.0, 1.0), vec2(0.0), size - 1.0));
			ivec2 p3 = ivec2(clamp(base + vec2(1.0, 1.0), vec2(0.0), size - 1.0));
			float a = texelFetch(uSdf, p0, 0).r;
			float b = texelFetch(uSdf, p1, 0).r;
			float c = texelFetch(uSdf, p2, 0).r;
			float d = texelFetch(uSdf, p3, 0).r;
			return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
		}

		vec3 blurredSwirl(vec2 uv) {
			vec2 pixel = 1.0 / uResolution;
			float blurRadius = 40.0 * uBlur;
			vec3 acc = vec3(0.0);
			acc += swirl(uv + pixel * vec2(0.0, 0.0) * blurRadius);
			acc += swirl(uv + pixel * vec2(-0.737, 0.675) * blurRadius);
			acc += swirl(uv + pixel * vec2(0.087, -0.996) * blurRadius);
			acc += swirl(uv + pixel * vec2(0.608, 0.794) * blurRadius);
			acc += swirl(uv + pixel * vec2(-0.985, -0.174) * blurRadius);
			acc += swirl(uv + pixel * vec2(0.844, -0.537) * blurRadius);
			acc += swirl(uv + pixel * vec2(-0.259, 0.966) * blurRadius);
			acc += swirl(uv + pixel * vec2(-0.460, -0.888) * blurRadius);
			acc += swirl(uv + pixel * vec2(0.940, 0.342) * blurRadius);
			return acc / 9.0;
		}

		vec4 glass(vec2 uv) {
			float aspect = uResolution.x / uResolution.y;
			vec2 center = vec2(0.5);
			vec2 logoUv = uv - center - uOffset;
			logoUv.x *= aspect;
			float angle = radians(uRotation);
			mat2 inverseRotation = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
			logoUv = inverseRotation * logoUv / max(uScale, 0.0001);
			vec2 sdfUv = vec2(logoUv.x + 0.5, 1.0 - (logoUv.y + 0.5));
			float rawSdf = sdfAt(sdfUv);
			float pxH = 1.0 / uResolution.y;

			if (rawSdf > pxH * 2.0) {
				return vec4(0.0);
			}

			float eps = 0.01;
			float gradX = (sdfAt(sdfUv + vec2(eps, 0.0)) - rawSdf) / eps;
			float gradY = (sdfAt(sdfUv + vec2(0.0, eps)) - rawSdf) / eps;
			float sharp = 0.05;
			float rb1 = clamp(-rawSdf / sharp * 32.0, 0.0, 1.0);
			float rb2Base = clamp(-(rawSdf - pxH) / sharp * 16.0, 0.0, 1.0) - clamp(-rawSdf / sharp * 16.0, 0.0, 1.0);
			vec2 lightDir = vec2(cos(radians(300.0)), sin(radians(300.0)));
			float lightFacing = dot(vec2(gradX, gradY), lightDir) * 0.5 + 0.5;
			float rb2 = rb2Base * lightFacing * 0.3;
			float depthNorm = clamp(-rawSdf / 0.3, 0.0, 1.0);
			float refrStrength = (1.0 - depthNorm) * (1.0 - depthNorm);
			vec2 offset = vec2(-gradX / aspect, -gradY) * 1.57 * 0.15 * refrStrength * uRefraction;
			vec2 lensUv = center + (uv - center) + offset;
			vec2 chroma = offset * 0.06 * uChromaticAberration;
			vec3 blurred = vec3(
				blurredSwirl(lensUv + chroma).r,
				blurredSwirl(lensUv).g,
				blurredSwirl(lensUv - chroma).b
			);
			vec3 n = normalize(vec3(gradX, gradY, 2.0));
			vec3 h = normalize(vec3(lightDir, 2.0));
			float shininess = exp2(8.0 - 0.5 * 7.0);
            float spec = pow(clamp(dot(n, h), 0.0, 1.0), shininess) * 0.3 * refrStrength;
            float fresnelDepth = clamp(-rawSdf / max(0.31 * 0.06, 0.001), 0.0, 1.0);
            float fresnel = pow(1.0 - fresnelDepth, 2.0) * 0.02 * rb1;
            vec3 lighting = blurred + vec3(rb2 + spec + fresnel);
			float transition = smoothstep(0.0, 1.0, rb1);
			return vec4(mix(swirl(uv), lighting, transition), transition);
		}

		void main() {
			vec4 lens = glass(vUv);
			outColor = lens;
		}
	`;

	$effect(() => {
		if (!uniforms) return;
		uniforms.uSpeed.value = speed;
		uniforms.uScale.value = scale;
		uniforms.uOffset.value.set(offsetX, offsetY);
		uniforms.uRotation.value = rotation;
		uniforms.uRefraction.value = refraction;
		uniforms.uChromaticAberration.value = chromaticAberration;
		uniforms.uBlur.value = blur;
		applyColor(uniforms.uSwirlColorA.value, swirlColorA, DEFAULT_SWIRL_COLOR_A);
		applyColor(uniforms.uSwirlColorB.value, swirlColorB, DEFAULT_SWIRL_COLOR_B);
	});

	$effect(() => {
		if (!setSvgSource) return;
		setSvgSource(svgSource);
	});

	const setupScene = (targetCanvas: HTMLCanvasElement) => {
		const renderer = new Renderer({
			canvas: targetCanvas,
			alpha: true,
			antialias: true,
			dpr: Math.min(
				typeof window !== "undefined" ? window.devicePixelRatio : 1,
				2,
			),
			webgl: 2,
		});
		const gl = renderer.gl;
		const webgl2 = gl as WebGL2RenderingContext;
		gl.clearColor(0, 0, 0, 0);

		targetCanvas.style.width = "100%";
		targetCanvas.style.height = "100%";

		const camera = new Camera(gl);
		camera.position.z = 1;

		const scene = new Transform();
		const geometry = new Triangle(gl);
		const sdfTexture = new Texture(gl, {
			image: new Float32Array([1]),
			width: 1,
			height: 1,
			format: webgl2.RED,
			internalFormat: webgl2.R32F,
			type: gl.FLOAT,
			minFilter: gl.NEAREST,
			magFilter: gl.NEAREST,
			wrapS: gl.CLAMP_TO_EDGE,
			wrapT: gl.CLAMP_TO_EDGE,
			generateMipmaps: false,
			flipY: false,
			unpackAlignment: 1,
		});

		const localUniforms: UniformState = {
			uResolution: { value: new Vec2(1, 1) },
			uTime: { value: 0 },
			uSdf: { value: sdfTexture },
			uSpeed: { value: speed },
			uScale: { value: scale },
			uOffset: { value: new Vec2(offsetX, offsetY) },
			uRotation: { value: rotation },
			uRefraction: { value: refraction },
			uChromaticAberration: { value: chromaticAberration },
			uBlur: { value: blur },
			uSwirlColorA: { value: new Vec3(...DEFAULT_SWIRL_COLOR_A) },
			uSwirlColorB: { value: new Vec3(...DEFAULT_SWIRL_COLOR_B) },
		};
		applyColor(
			localUniforms.uSwirlColorA.value,
			swirlColorA,
			DEFAULT_SWIRL_COLOR_A,
		);
		applyColor(
			localUniforms.uSwirlColorB.value,
			swirlColorB,
			DEFAULT_SWIRL_COLOR_B,
		);
		uniforms = localUniforms;

		let svgToken = 0;
		let currentSvgSource = "";
		const loadSvg = async (source: string) => {
			if (source === currentSvgSource) return;

			currentSvgSource = source;
			svgToken += 1;
			const token = svgToken;

			try {
				const sdf = await buildSvgSdf(source);
				if (token !== svgToken) return;
				sdfTexture.image = sdf.data;
				sdfTexture.width = sdf.width;
				sdfTexture.height = sdf.height;
				sdfTexture.needsUpdate = true;
			} catch (error) {
				console.error("Failed to build GlassLogo SDF", error);
			}
		};
		setSvgSource = loadSvg;

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: localUniforms,
			transparent: true,
			depthTest: false,
			depthWrite: false,
		});

		const mesh = new Mesh(gl, { geometry, program });
		mesh.setParent(scene);

		let raf = 0;
		let previous = 0;
		const tick = (now: number) => {
			const w = Math.max(1, targetCanvas.clientWidth);
			const h = Math.max(1, targetCanvas.clientHeight);
			const bufW = Math.round(w * renderer.dpr);
			const bufH = Math.round(h * renderer.dpr);
			if (targetCanvas.width !== bufW || targetCanvas.height !== bufH) {
				targetCanvas.width = bufW;
				targetCanvas.height = bufH;
				renderer.width = w;
				renderer.height = h;
				renderer.state.viewport = { x: 0, y: 0, width: null, height: null };
				localUniforms.uResolution.value.set(w, h);
			}

			const delta = previous ? (now - previous) / 1000 : 0;
			previous = now;
			localUniforms.uTime.value += delta * localUniforms.uSpeed.value;
			renderer.render({ scene, camera });
			raf = window.requestAnimationFrame(tick);
		};

		void loadSvg(svgSource);
		raf = window.requestAnimationFrame(tick);

		return () => {
			svgToken += 1;
			window.cancelAnimationFrame(raf);
			mesh.setParent(null);
			setSvgSource = undefined;
			if (sdfTexture.texture) gl.deleteTexture(sdfTexture.texture);
			program.remove();
			geometry.remove();
		};
	};

	const mountScene: Attachment<HTMLCanvasElement> = (targetCanvas) =>
		untrack(() => setupScene(targetCanvas));
</script>

<canvas
	{@attach mountScene}
	class="absolute inset-0 block h-full w-full"
	style="width:100%;height:100%;"
	aria-hidden="true"
></canvas>
