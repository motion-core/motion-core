<script lang="ts">
	import { Halo } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof Halo>>;

	let {
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		rotationSpeed = 0.5,
		backgroundColor = "#17181A",
		cameraDistance = 3,
		intensity = 2.2,
	}: Props = $props();
</script>

<Halo
	class="h-full min-h-96 w-full"
	{scale}
	{offsetX}
	{offsetY}
	{rotation}
	{rotationSpeed}
	{backgroundColor}
	{cameraDistance}
	{intensity}
/>
