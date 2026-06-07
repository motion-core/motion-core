<script lang="ts">
	import { PixelatedImage } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof PixelatedImage>>;

	let { initialGridSize = 2, stepDuration = 0.2 }: Props = $props();
</script>

<PixelatedImage
	src="/images/photos/sample-image-14.webp"
	class="h-full min-h-96 w-full"
	{initialGridSize}
	{stepDuration}
/>
