<script lang="ts">
	import { FlipGrid, FlipGridItem } from "motion-core";

	type Props = {
		columns?: number;
		duration?: number;
		stagger?: number;
		ease?: string;
	};

	const images = [
		"/images/photos/sample-image-8.webp",
		"/images/photos/sample-image-9.webp",
		"/images/photos/sample-image-10.webp",
		"/images/photos/sample-image-11.webp",
	];

	let {
		columns = 4,
		duration = 0.5,
		stagger = 0.1,
		ease = "power2.inOut",
	}: Props = $props();
</script>

<div class="relative h-full min-h-96 w-full">
	<div class="h-full p-4">
		<FlipGrid class="w-full gap-4" {columns} {duration} {stagger} {ease}>
			{#each images as src, i (src)}
				<FlipGridItem
					id={`img-${i}`}
					class="relative aspect-square w-full overflow-hidden rounded-lg shadow-md"
				>
					<img {src} alt="Demo {i}" class="h-full w-full object-cover" />
				</FlipGridItem>
			{/each}
		</FlipGrid>
	</div>
</div>
