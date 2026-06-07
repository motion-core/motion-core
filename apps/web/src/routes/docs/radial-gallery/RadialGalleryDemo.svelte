<script lang="ts">
	import { RadialGallery } from "motion-core";

	type Props = {
		radius?: number;
		duration?: number;
		reversed?: boolean;
		offset?: number;
		gap?: number;
		elementSize?: number;
	};

	const images = [
		"/images/photos/sample-image-6.webp",
		"/images/photos/sample-image-7.webp",
		"/images/photos/sample-image-8.webp",
		"/images/photos/sample-image-9.webp",
		"/images/photos/sample-image-10.webp",
		"/images/photos/sample-image-11.webp",
		"/images/photos/sample-image-12.webp",
		"/images/photos/sample-image-13.webp",
	];

	let {
		radius = 850,
		duration = 70,
		reversed = false,
		offset = -600,
		gap = 100,
		elementSize = 160,
	}: Props = $props();
</script>

<RadialGallery
	class="h-full min-h-96 w-full"
	items={images}
	{radius}
	{duration}
	{reversed}
	{offset}
	{gap}
	{elementSize}
>
	{#snippet children(item)}
		<div
			class="inset-shadow relative h-48 w-48 rounded-lg bg-background-inset p-1.5 group-data-[fullscreen=true]/preview:h-96 group-data-[fullscreen=true]/preview:w-96"
		>
			<div class="h-full overflow-hidden rounded-md bg-background card">
				<img src={item} class="h-full w-full object-cover" alt="Gallery item" />
			</div>
		</div>
	{/snippet}
</RadialGallery>
