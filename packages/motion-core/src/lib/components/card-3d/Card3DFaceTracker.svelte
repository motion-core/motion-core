<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
	import { portal } from "../../utils/use-portal";

	interface HeadPosition {
		x: number;
		y: number;
		z: number;
	}

	interface Props {
		/**
		 * Callback fired when head position changes.
		 */
		onHeadMove: (position: HeadPosition) => void;
		/**
		 * Whether to show the video preview.
		 * @default true
		 */
		showPreview?: boolean;
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
	}

	let {
		onHeadMove,
		showPreview = true,
		class: className = "",
	}: Props = $props();

	let isRunning = $state(false);
	let error = $state<string | null>(null);

	const attachVideo: Attachment<HTMLVideoElement> = (targetVideo) => {
		let disposed = false;
		let animationFrameId = 0;
		let stream: MediaStream | null = null;
		let faceLandmarker: FaceLandmarker | null = null;

		const detectFace = () => {
			if (disposed) return;
			if (!faceLandmarker || targetVideo.readyState < 2) {
				animationFrameId = requestAnimationFrame(detectFace);
				return;
			}

			const results = faceLandmarker.detectForVideo(
				targetVideo,
				performance.now(),
			);
			const landmarks = results.faceLandmarks?.[0];
			if (landmarks) {
				const nose = landmarks[1];
				const leftEar = landmarks[234];
				const rightEar = landmarks[454];
				onHeadMove({
					x: (nose.x - 0.5) * 2,
					y: (nose.y - 0.5) * 2,
					z: (0.4 - Math.abs(rightEar.x - leftEar.x)) * 5,
				});
			}

			animationFrameId = requestAnimationFrame(detectFace);
		};

		const initialize = async () => {
			try {
				const filesetResolver = await FilesetResolver.forVisionTasks(
					"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
				);
				const nextFaceLandmarker = await FaceLandmarker.createFromOptions(
					filesetResolver,
					{
						baseOptions: {
							modelAssetPath:
								"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
							delegate: "GPU",
						},
						runningMode: "VIDEO",
						numFaces: 1,
						outputFaceBlendshapes: false,
						outputFacialTransformationMatrixes: true,
					},
				);
				if (disposed) {
					nextFaceLandmarker.close();
					return;
				}
				faceLandmarker = nextFaceLandmarker;

				const nextStream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "user", width: 640, height: 480 },
				});
				if (disposed) {
					nextStream.getTracks().forEach((track) => track.stop());
					return;
				}
				stream = nextStream;
				targetVideo.srcObject = stream;
				await targetVideo.play();
				if (disposed) return;
				isRunning = true;
				detectFace();
			} catch (cause) {
				if (disposed) return;
				error =
					cause instanceof Error
						? cause.message
						: "Failed to initialize face tracking";
				console.error("FaceTracker init error:", cause);
			}
		};

		void initialize();

		return () => {
			disposed = true;
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			stream?.getTracks().forEach((track) => track.stop());
			targetVideo.srcObject = null;
			faceLandmarker?.close();
		};
	};
</script>

{#if showPreview}
	<div use:portal class="fixed right-4 bottom-4 z-50 rounded-lg {className}">
		<video
			{@attach attachVideo}
			playsinline
			muted
			class="h-30 w-40 -scale-x-100 rounded-lg"
		></video>
		{#if error}
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-accent"
			>
				{error}
			</div>
		{/if}
		{#if !isRunning && !error}
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-foreground"
			>
				Initializing camera...
			</div>
		{/if}
	</div>
{:else}
	<video {@attach attachVideo} playsinline muted class="hidden"></video>
{/if}
