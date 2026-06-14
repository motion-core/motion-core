<script lang="ts">
	import { WatercolorImage } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof WatercolorImage>>;

	let { radius = 6 }: Props = $props();
</script>

<WatercolorImage
	src="/images/photos/sample-image-16.webp"
	class="h-full min-h-96 w-full"
	{radius}
/>
