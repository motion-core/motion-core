<script lang="ts">
	import { InfiniteGallery } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof InfiniteGallery>>;

	let { speed = 1, visibleCount = 8 }: Props = $props();

	const images = [
		"/images/photos/sample-image-19.webp",
		"/images/photos/sample-image-20.webp",
		"/images/photos/sample-image-1.webp",
		"/images/photos/sample-image-2.webp",
		"/images/photos/sample-image-3.webp",
		"/images/photos/sample-image-4.webp",
		"/images/photos/sample-image-5.webp",
		"/images/photos/sample-image-6.webp",
	];
</script>

<InfiniteGallery
	class="h-full min-h-96 w-full"
	{images}
	{speed}
	{visibleCount}
/>
