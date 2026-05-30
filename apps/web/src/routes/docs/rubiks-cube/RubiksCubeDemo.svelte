<script lang="ts">
	import { RubiksCube } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof RubiksCube>>;

	let {
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		duration = 1.5,
		gap = 0.015,
		radius = 0.125,
	}: Props = $props();
</script>

<RubiksCube
	class="h-full min-h-96 w-full"
	{scale}
	{offsetX}
	{offsetY}
	{rotation}
	{duration}
	{gap}
	{radius}
/>
