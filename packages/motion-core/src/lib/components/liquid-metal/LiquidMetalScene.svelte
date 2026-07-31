<script lang="ts">
	import { onMount } from "svelte";
	import {
		Camera,
		Mesh,
		Program,
		Renderer,
		Transform,
		Triangle,
		Vec2,
		Vec3,
	} from "ogl";
	import { type ColorRepresentation, toRgb } from "../../helpers/color";

	interface Props {
		/**
		 * Light color reflected through the liquid-metal surface.
		 * @default "#FFFFFF"
		 */
		color?: ColorRepresentation;
		/**
		 * Dark color reflected through the liquid-metal surface.
		 * @default "#17181A"
		 */
		backgroundColor?: ColorRepresentation;
		/**
		 * Animation speed multiplier.
		 * @default 1.0
		 */
		speed?: number;
		/**
		 * Scale multiplier for the distorted field.
		 * @default 1.0
		 */
		scale?: number;
		/**
		 * Spatial frequency of the distorted folds.
		 * @default 3.5
		 */
		frequency?: number;
		/**
		 * Strength of the liquid-metal refraction.
		 * @default 2.0
		 */
		refraction?: number;
		/**
		 * Strength of the RGB separation inside the refracted surface.
		 * @default 3.0
		 */
		chromaticAberration?: number;
		/**
		 * Radius multiplier for the internal blur sampling.
		 * @default 1.0
		 */
		blur?: number;
	}

	let {
		color = "#FFFFFF",
		backgroundColor = "#17181A",
		speed = 1.0,
		scale = 1.0,
		frequency = 3.5,
		refraction = 2.0,
		chromaticAberration = 3.0,
		blur = 1.0,
	}: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	let uniforms = $state.raw<{
		uTime: { value: number };
		uResolution: { value: Vec2 };
		uColor: { value: Vec3 };
		uBackgroundColor: { value: Vec3 };
		uSpeed: { value: number };
		uScale: { value: number };
		uFrequency: { value: number };
		uRefraction: { value: number };
		uChromaticAberration: { value: number };
		uBlur: { value: number };
	}>();

	const applyColor = (
		target: Vec3,
		value: ColorRepresentation,
		fallback: [number, number, number],
	) => {
		const [r, g, b] = toRgb(value, fallback);
		target.set(r, g, b);
	};

	const vertexShader = `
		attribute vec2 uv;
		attribute vec2 position;
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = vec4(position, 0.0, 1.0);
		}
	`;

	const fragmentShader = `
		precision highp float;
		varying vec2 vUv;

		uniform float uTime;
		uniform vec2 uResolution;
		uniform vec3 uColor;
		uniform vec3 uBackgroundColor;
		uniform float uSpeed;
		uniform float uScale;
		uniform float uFrequency;
		uniform float uRefraction;
		uniform float uChromaticAberration;
		uniform float uBlur;

		vec2 distort(vec2 point, float offset, float time) {
			point += offset;
			for (int i = 1; i < 4; i++) {
				float harmonic = float(i);
				point.x += 0.3 / harmonic * sin(harmonic * 2.8 * point.y + time);
				point.y += 0.3 / harmonic * cos(harmonic * 2.8 * point.x + time);
			}
			return point;
		}

		vec3 swirl(vec2 uv, float time) {
			float t = time * 0.5;
			float detail = 4.2;
			vec2 d1 = vec2(
				uv.x + sin(uv.y * detail * 1.7 + t * 0.8) * 0.12 + cos(uv.x * detail * 0.9 - t * 0.5) * 0.05,
				uv.y + cos(uv.x * detail * 1.3 - t * 0.6) * 0.12 + sin(uv.y * detail * 1.1 + t * 0.7) * 0.05
			);
			float p1 = sin(d1.x * detail * 2.1 + d1.y * detail * 1.8 + t * 0.4);
			vec2 d2 = vec2(
				d1.x + cos(d1.y * detail * 2.7 - t * 0.45) * 0.07 + sin(d1.x * detail * 1.9 + t * 0.6) * 0.04,
				d1.y + sin(d1.x * detail * 2.3 + t * 0.65) * 0.07 + cos(d1.y * detail * 1.6 - t * 0.4) * 0.04
			);
			float p2 = cos(d2.x * detail * 1.4 - d2.y * detail * 1.9 + t * 0.35);
			float combined = p1 * 0.45 + p2 * 0.35;
			float blendFactor = smoothstep(0.3, 0.7, combined * 0.5 + 0.5 - 0.192);
			float shimmer = sin(t * 2.5 + combined * 8.0) * 0.015 + 1.0;
			return mix(uBackgroundColor, uColor, blendFactor) * shimmer;
		}

		vec3 blurredSwirl(vec2 uv, float time) {
			vec2 pixel = 1.0 / uResolution;
			float blurRadius = 40.0 * uBlur;
			vec3 acc = vec3(0.0);
			acc += swirl(uv + pixel * vec2(0.0, 0.0) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(-0.737, 0.675) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(0.087, -0.996) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(0.608, 0.794) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(-0.985, -0.174) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(0.844, -0.537) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(-0.259, 0.966) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(-0.460, -0.888) * blurRadius, time);
			acc += swirl(uv + pixel * vec2(0.940, 0.342) * blurRadius, time);
			return acc / 9.0;
		}

		float metalDepthField(vec2 point, float time) {
			float wave = sin(distort(point, 0.0, time).x * uFrequency) * 0.5 + 0.5;
			float depth = pow(wave, 1.1);
			return -depth * 0.3;
		}

		void mainImage(out vec4 fragColor, vec2 fragCoord) {
			vec2 uv = fragCoord / uResolution;
			float minResolution = min(uResolution.x, uResolution.y);
			vec2 point = (fragCoord * 2.0 - uResolution.xy) / minResolution;
			point /= max(uScale, 0.001);
			float time = uTime * uSpeed;
			float surfaceDepth = metalDepthField(point, time);

			float epsilon = 0.004;
			float gradX = (metalDepthField(point + vec2(epsilon, 0.0), time) - surfaceDepth) / epsilon;
			float gradY = (metalDepthField(point + vec2(0.0, epsilon), time) - surfaceDepth) / epsilon;
			float sharp = 0.05;
			float surfaceMask = clamp(-surfaceDepth / sharp * 32.0, 0.0, 1.0);
			vec2 lightDirection = vec2(cos(radians(300.0)), sin(radians(300.0)));
			float depthNorm = clamp(-surfaceDepth / 0.3, 0.0, 1.0);
			float refractionStrength = (1.0 - depthNorm) * (1.0 - depthNorm);
			float aspect = uResolution.x / uResolution.y;
			vec2 offset = vec2(-gradX / aspect, -gradY) * 1.57 * 0.15 *
				refractionStrength * uRefraction;
			vec2 lensUv = uv + offset;
			vec2 chroma = offset * 0.06 * uChromaticAberration;
			vec3 blurred = vec3(
				blurredSwirl(lensUv + chroma, time).r,
				blurredSwirl(lensUv, time).g,
				blurredSwirl(lensUv - chroma, time).b
			);
			vec3 normal = normalize(vec3(gradX, gradY, 2.0));
			vec3 halfDirection = normalize(vec3(lightDirection, 2.0));
			float shininess = 64.0;
			float specular = pow(clamp(dot(normal, halfDirection), 0.0, 1.0), shininess) *
				0.16 * refractionStrength;
			float fresnelDepth = clamp(-surfaceDepth / max(0.31 * 0.06, 0.001), 0.0, 1.0);
			float fresnel = pow(1.0 - fresnelDepth, 2.0) * 0.012 * surfaceMask;
			vec3 lighting = blurred + vec3(specular + fresnel);
			fragColor = vec4(lighting, 1.0);
		}

		void main() {
			vec4 fragColor;
			vec2 fragCoord = vUv * uResolution;
			mainImage(fragColor, fragCoord);
			gl_FragColor = fragColor;
		}
	`;

	$effect(() => {
		if (!uniforms) return;
		applyColor(uniforms.uColor.value, color, [1, 1, 1]);
		applyColor(uniforms.uBackgroundColor.value, backgroundColor, [
			23 / 255,
			24 / 255,
			26 / 255,
		]);
		uniforms.uSpeed.value = speed;
		uniforms.uScale.value = scale;
		uniforms.uFrequency.value = frequency;
		uniforms.uRefraction.value = refraction;
		uniforms.uChromaticAberration.value = chromaticAberration;
		uniforms.uBlur.value = blur;
	});

	onMount(() => {
		const targetCanvas = canvas;
		if (!targetCanvas) return;

		const renderer = new Renderer({
			canvas: targetCanvas,
			alpha: true,
			dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1,
		});
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, 0);

		targetCanvas.style.width = "100%";
		targetCanvas.style.height = "100%";

		const camera = new Camera(gl);
		camera.position.z = 1;

		const scene = new Transform();
		const geometry = new Triangle(gl);

		const initialColor = toRgb(color, [1, 1, 1]);
		const initialBackgroundColor = toRgb(backgroundColor, [
			23 / 255,
			24 / 255,
			26 / 255,
		]);

		const localUniforms = {
			uTime: { value: 0 },
			uResolution: { value: new Vec2(1, 1) },
			uColor: {
				value: new Vec3(initialColor[0], initialColor[1], initialColor[2]),
			},
			uBackgroundColor: {
				value: new Vec3(
					initialBackgroundColor[0],
					initialBackgroundColor[1],
					initialBackgroundColor[2],
				),
			},
			uSpeed: { value: speed },
			uScale: { value: scale },
			uFrequency: { value: frequency },
			uRefraction: { value: refraction },
			uChromaticAberration: { value: chromaticAberration },
			uBlur: { value: blur },
		};

		uniforms = localUniforms;

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: localUniforms,
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
			localUniforms.uTime.value += delta;

			renderer.render({ scene, camera });
			raf = window.requestAnimationFrame(tick);
		};

		raf = window.requestAnimationFrame(tick);

		return () => {
			window.cancelAnimationFrame(raf);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="absolute inset-0 block h-full w-full"
	style="width:100%;height:100%;"
	aria-hidden="true"
></canvas>
