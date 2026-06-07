<script lang="ts">
	import { ImageTrail } from "motion-core";

	type Props = {
		mouseThreshold?: number;
		imageLifespan?: number;
		inDuration?: number;
		outDuration?: number;
		baseRotation?: number;
		maxRotationFactor?: number;
		minImageSize?: number;
		maxImageSize?: number;
	};

	const demoImages = [
		"/images/photos/sample-image-12.webp",
		"/images/photos/sample-image-13.webp",
		"/images/photos/sample-image-14.webp",
		"/images/photos/sample-image-15.webp",
		"/images/photos/sample-image-16.webp",
		"/images/photos/sample-image-17.webp",
		"/images/photos/sample-image-18.webp",
	];

	let {
		mouseThreshold = 40,
		imageLifespan = 600,
		inDuration = 600,
		outDuration = 800,
		baseRotation = 30,
		maxRotationFactor = 3,
		minImageSize = 260,
		maxImageSize = 340,
	}: Props = $props();
</script>

<ImageTrail
	images={demoImages}
	class="absolute inset-0 flex h-full w-full items-center justify-center"
	config={{
		mouseThreshold,
		imageLifespan,
		inDuration,
		outDuration,
		baseRotation,
		maxRotationFactor,
		minImageSize,
		maxImageSize,
	}}
/>
