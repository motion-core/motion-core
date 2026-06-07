<script lang="ts">
	import { onMount } from "svelte";
	import {
		Mesh,
		Program,
		Renderer,
		RenderTarget,
		Texture,
		Triangle,
		Vec2,
	} from "ogl";

	interface Props {
		/**
		 * The image source URL.
		 */
		image: string;
		/**
		 * Radius of the anisotropic watercolor filter.
		 * @default 6
		 */
		radius?: number;
		/**
		 * Enables the structure tensor pass.
		 * @default true
		 */
		tensorPass?: boolean;
		/**
		 * Enables the anisotropic Kuwahara pass.
		 * @default true
		 */
		kuwaharaPass?: boolean;
	}

	let {
		image,
		radius = 6,
		tensorPass = true,
		kuwaharaPass = true,
	}: Props = $props();

	type TensorUniformState = {
		uTexture: { value: Texture };
		uResolution: { value: Vec2 };
		uTextureSize: { value: Vec2 };
	};

	type WatercolorUniformState = {
		uTensor: { value: Texture };
		uTexture: { value: Texture };
		uResolution: { value: Vec2 };
		uTextureSize: { value: Vec2 };
		uRadius: { value: number };
	};

	let canvas = $state<HTMLCanvasElement>();
	let setImageSource = $state<(source: string) => void>();
	let uniforms = $state.raw<{
		tensor: TensorUniformState;
		watercolor: WatercolorUniformState;
	}>();

	const resolutionUniform = new Vec2(1, 1);
	const textureSizeUniform = new Vec2(1, 1);

	const vertexShader = `
		attribute vec2 uv;
		attribute vec2 position;
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = vec4(position, 0.0, 1.0);
		}
	`;

	const tensorFragmentShader = `
		precision highp float;

		uniform sampler2D uTexture;
		uniform vec2 uResolution;
		uniform vec2 uTextureSize;
		varying vec2 vUv;

		const mat3 Gx = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1);
		const mat3 Gy = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1);

		vec2 getCoverUV(vec2 uv, vec2 textureSize) {
			vec2 safeTexture = max(textureSize, vec2(1.0));
			vec2 s = uResolution / safeTexture;
			float scale = max(s.x, s.y);
			vec2 scaledSize = safeTexture * scale;
			vec2 offset = (uResolution - scaledSize) * 0.5;
			return (uv * uResolution - offset) / scaledSize;
		}

		vec3 sourceColor(vec2 uv) {
			return texture2D(uTexture, getCoverUV(uv, uTextureSize)).rgb;
		}

		vec4 computeStructureTensor(vec2 uv) {
			vec3 tx0y0 = sourceColor(uv + vec2(-1.0, -1.0) / uResolution);
			vec3 tx0y1 = sourceColor(uv + vec2(-1.0, 0.0) / uResolution);
			vec3 tx0y2 = sourceColor(uv + vec2(-1.0, 1.0) / uResolution);
			vec3 tx1y0 = sourceColor(uv + vec2(0.0, -1.0) / uResolution);
			vec3 tx1y1 = sourceColor(uv + vec2(0.0, 0.0) / uResolution);
			vec3 tx1y2 = sourceColor(uv + vec2(0.0, 1.0) / uResolution);
			vec3 tx2y0 = sourceColor(uv + vec2(1.0, -1.0) / uResolution);
			vec3 tx2y1 = sourceColor(uv + vec2(1.0, 0.0) / uResolution);
			vec3 tx2y2 = sourceColor(uv + vec2(1.0, 1.0) / uResolution);

			vec3 Sx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
				Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
				Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

			vec3 Sy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
				Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
				Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

			return vec4(dot(Sx, Sx), dot(Sy, Sy), dot(Sx, Sy), 1.0);
		}

		void main() {
			gl_FragColor = computeStructureTensor(vUv);
		}
	`;

	const sourceFragmentShader = `
		precision highp float;

		uniform sampler2D uTexture;
		uniform vec2 uResolution;
		uniform vec2 uTextureSize;
		varying vec2 vUv;

		vec2 getCoverUV(vec2 uv, vec2 textureSize) {
			vec2 safeTexture = max(textureSize, vec2(1.0));
			vec2 s = uResolution / safeTexture;
			float scale = max(s.x, s.y);
			vec2 scaledSize = safeTexture * scale;
			vec2 offset = (uResolution - scaledSize) * 0.5;
			return (uv * uResolution - offset) / scaledSize;
		}

		void main() {
			gl_FragColor = texture2D(uTexture, getCoverUV(vUv, uTextureSize));
		}
	`;

	const watercolorFragmentShader = `
		#define SECTOR_COUNT 8
		#define MAX_RADIUS 12

		precision highp float;

		uniform sampler2D uTensor;
		uniform sampler2D uTexture;
		uniform vec2 uResolution;
		uniform vec2 uTextureSize;
		uniform float uRadius;
		varying vec2 vUv;

		vec2 getCoverUV(vec2 uv, vec2 textureSize) {
			vec2 safeTexture = max(textureSize, vec2(1.0));
			vec2 s = uResolution / safeTexture;
			float scale = max(s.x, s.y);
			vec2 scaledSize = safeTexture * scale;
			vec2 offset = (uResolution - scaledSize) * 0.5;
			return (uv * uResolution - offset) / scaledSize;
		}

		float luminance(vec3 colorValue) {
			return dot(colorValue, vec3(0.299, 0.587, 0.114));
		}

		vec3 sampleColor(vec2 offset) {
			vec2 uv = (gl_FragCoord.xy + offset) / uResolution;
			return texture2D(uTexture, getCoverUV(uv, uTextureSize)).rgb;
		}

		vec4 getDominantOrientation(vec4 structureTensor) {
			float Jxx = structureTensor.r;
			float Jyy = structureTensor.g;
			float Jxy = structureTensor.b;
			float trace = Jxx + Jyy;
			float determinant = Jxx * Jyy - Jxy * Jxy;
			float discriminant = max(0.0, trace * trace * 0.25 - determinant);
			float lambda1 = trace * 0.5 + sqrt(discriminant);
			float lambda2 = trace * 0.5 - sqrt(discriminant);
			float jxyStrength = abs(Jxy) / (abs(Jxx) + abs(Jyy) + abs(Jxy) + 1e-7);
			vec2 v = jxyStrength > 0.0 ? normalize(vec2(-Jxy, Jxx - lambda1)) : vec2(0.0, 1.0);
			return vec4(normalize(v), lambda1, lambda2);
		}

		float polynomialWeight(float x, float y, float eta, float lambda) {
			float polyValue = (x + eta) - lambda * (y * y);
			return max(0.0, polyValue * polyValue);
		}

		void getSectorVarianceAndAverageColor(
			mat2 anisotropyMat,
			float angle,
			float radius,
			out vec3 avgColor,
			out float variance
		) {
			vec3 weightedColorSum = vec3(0.0);
			vec3 weightedSquaredColorSum = vec3(0.0);
			float totalWeight = 0.0;
			float eta = 0.1;
			float lambda = 0.5;

			for (int ri = 1; ri <= MAX_RADIUS; ri++) {
				float r = float(ri);
				if (r > radius) {
					continue;
				}

				for (int ai = -2; ai <= 2; ai++) {
					float a = float(ai) * 0.196349;
					vec2 sampleOffset = r * vec2(cos(angle + a), sin(angle + a));
					sampleOffset = anisotropyMat * sampleOffset;
					vec3 color = sampleColor(sampleOffset);
					float weight = polynomialWeight(sampleOffset.x, sampleOffset.y, eta, lambda);
					weightedColorSum += color * weight;
					weightedSquaredColorSum += color * color * weight;
					totalWeight += weight;
				}
			}

			avgColor = weightedColorSum / max(totalWeight, 1e-5);
			vec3 varianceRes = (weightedSquaredColorSum / max(totalWeight, 1e-5)) - (avgColor * avgColor);
			variance = luminance(max(varianceRes, vec3(0.0)));
		}

		void main() {
			vec4 structureTensor = texture2D(uTensor, vUv);
			vec3 sectorAvgColors[SECTOR_COUNT];
			float sectorVariances[SECTOR_COUNT];
			vec4 orientationAndAnisotropy = getDominantOrientation(structureTensor);
			vec2 orientation = orientationAndAnisotropy.xy;
			float anisotropy = (orientationAndAnisotropy.z - orientationAndAnisotropy.w) /
				(orientationAndAnisotropy.z + orientationAndAnisotropy.w + 1e-7);

			float alpha = 25.0;
			float scaleX = alpha / (anisotropy + alpha);
			float scaleY = (anisotropy + alpha) / alpha;
			mat2 anisotropyMat = mat2(orientation.x, -orientation.y, orientation.y, orientation.x) *
				mat2(scaleX, 0.0, 0.0, scaleY);

			float safeRadius = clamp(uRadius, 1.0, float(MAX_RADIUS));
			for (int i = 0; i < SECTOR_COUNT; i++) {
				float angle = float(i) * 6.2831853 / float(SECTOR_COUNT);
				getSectorVarianceAndAverageColor(
					anisotropyMat,
					angle,
					safeRadius,
					sectorAvgColors[i],
					sectorVariances[i]
				);
			}

			float minVariance = sectorVariances[0];
			vec3 watercolor = sectorAvgColors[0];
			for (int i = 1; i < SECTOR_COUNT; i++) {
				if (sectorVariances[i] < minVariance) {
					minVariance = sectorVariances[i];
					watercolor = sectorAvgColors[i];
				}
			}

			gl_FragColor = vec4(watercolor, 1.0);
		}
	`;

	const disposeTarget = (gl: Renderer["gl"], target: RenderTarget) => {
		target.textures.forEach((texture) => {
			if (texture.texture) gl.deleteTexture(texture.texture);
		});
		if (target.depthTexture?.texture)
			gl.deleteTexture(target.depthTexture.texture);
		if (target.depthBuffer) gl.deleteRenderbuffer(target.depthBuffer);
		if (target.stencilBuffer) gl.deleteRenderbuffer(target.stencilBuffer);
		if (target.depthStencilBuffer)
			gl.deleteRenderbuffer(target.depthStencilBuffer);
		if (target.buffer) gl.deleteFramebuffer(target.buffer);
	};

	$effect(() => {
		if (!uniforms) return;
		uniforms.watercolor.uRadius.value = Math.max(1, Math.min(12, radius));
	});

	$effect(() => {
		if (!setImageSource) return;
		setImageSource(image);
	});

	onMount(() => {
		const targetCanvas = canvas;
		if (!targetCanvas) return;

		const renderer = new Renderer({
			canvas: targetCanvas,
			alpha: true,
			dpr:
				typeof window !== "undefined"
					? Math.min(window.devicePixelRatio, 2)
					: 1,
		});
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, 0);

		targetCanvas.style.width = "100%";
		targetCanvas.style.height = "100%";

		const geometry = new Triangle(gl);
		const imageTexture = new Texture(gl, {
			image: new Uint8Array([0, 0, 0, 255]),
			width: 1,
			height: 1,
			format: gl.RGBA,
			type: gl.UNSIGNED_BYTE,
			minFilter: gl.LINEAR,
			magFilter: gl.LINEAR,
			wrapS: gl.CLAMP_TO_EDGE,
			wrapT: gl.CLAMP_TO_EDGE,
			generateMipmaps: false,
			flipY: true,
		});

		const tensorTarget = new RenderTarget(gl, {
			width: 1,
			height: 1,
			minFilter: gl.LINEAR,
			magFilter: gl.LINEAR,
			format: gl.RGBA,
			type: gl.UNSIGNED_BYTE,
			depth: false,
		});

		const tensorUniforms: TensorUniformState = {
			uTexture: { value: imageTexture },
			uResolution: { value: resolutionUniform },
			uTextureSize: { value: textureSizeUniform },
		};

		const watercolorUniforms: WatercolorUniformState = {
			uTensor: { value: tensorTarget.texture },
			uTexture: { value: imageTexture },
			uResolution: { value: resolutionUniform },
			uTextureSize: { value: textureSizeUniform },
			uRadius: { value: Math.max(1, Math.min(12, radius)) },
		};
		uniforms = { tensor: tensorUniforms, watercolor: watercolorUniforms };

		const tensorProgram = new Program(gl, {
			vertex: vertexShader,
			fragment: tensorFragmentShader,
			uniforms: tensorUniforms,
			depthTest: false,
			depthWrite: false,
		});
		const sourceProgram = new Program(gl, {
			vertex: vertexShader,
			fragment: sourceFragmentShader,
			uniforms: tensorUniforms,
			transparent: true,
			depthTest: false,
			depthWrite: false,
		});
		const watercolorProgram = new Program(gl, {
			vertex: vertexShader,
			fragment: watercolorFragmentShader,
			uniforms: watercolorUniforms,
			transparent: true,
			depthTest: false,
			depthWrite: false,
		});

		const tensorMesh = new Mesh(gl, {
			geometry,
			program: tensorProgram,
			frustumCulled: false,
		});
		const watercolorMesh = new Mesh(gl, {
			geometry,
			program: watercolorProgram,
			frustumCulled: false,
		});
		const sourceMesh = new Mesh(gl, {
			geometry,
			program: sourceProgram,
			frustumCulled: false,
		});

		let imageToken = 0;
		let disposed = false;
		const loadImage = (source: string) => {
			imageToken += 1;
			const token = imageToken;
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.decoding = "async";
			img.onload = () => {
				if (disposed || token !== imageToken) return;
				imageTexture.image = img;
				textureSizeUniform.set(
					img.naturalWidth || img.width || 1,
					img.naturalHeight || img.height || 1,
				);
			};
			img.src = source;
		};
		setImageSource = loadImage;
		loadImage(image);

		let raf = 0;
		const tick = () => {
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
				resolutionUniform.set(bufW, bufH);
				tensorTarget.setSize(bufW, bufH);
			}

			if (tensorPass) {
				renderer.render({
					scene: tensorMesh,
					target: tensorTarget,
					clear: true,
				});
			}
			renderer.render({
				scene: tensorPass
					? kuwaharaPass
						? watercolorMesh
						: tensorMesh
					: sourceMesh,
				clear: true,
			});
			raf = window.requestAnimationFrame(tick);
		};

		raf = window.requestAnimationFrame(tick);

		return () => {
			disposed = true;
			imageToken += 1;
			window.cancelAnimationFrame(raf);
			setImageSource = undefined;
			uniforms = undefined;
			tensorProgram.remove();
			sourceProgram.remove();
			watercolorProgram.remove();
			geometry.remove();
			if (imageTexture.texture) gl.deleteTexture(imageTexture.texture);
			disposeTarget(gl, tensorTarget);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="absolute inset-0 block h-full w-full"
	style="width:100%;height:100%;"
	aria-hidden="true"
></canvas>
