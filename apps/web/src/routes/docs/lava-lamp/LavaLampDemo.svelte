<script lang="ts">
	import { LavaLamp } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof LavaLamp>>;

	let {
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		color = "#17181A",
		fresnelColor = "#ff6900",
		speed = 1,
		fresnelPower = 3,
		radius = 1,
		smoothness = 0.1,
	}: Props = $props();
</script>

<LavaLamp
	class="h-full min-h-96 w-full"
	{scale}
	{offsetX}
	{offsetY}
	{rotation}
	{color}
	{fresnelColor}
	{speed}
	{fresnelPower}
	{radius}
	{smoothness}
/>
