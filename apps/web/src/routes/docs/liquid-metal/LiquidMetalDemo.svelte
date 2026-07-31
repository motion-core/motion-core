<script lang="ts">
	import { LiquidMetal } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof LiquidMetal>>;

	let {
		color = "#FFFFFF",
		backgroundColor = "#17181A",
		speed = 1,
		scale = 1,
		frequency = 3.5,
		refraction = 2,
		chromaticAberration = 3,
		blur = 1,
	}: Props = $props();
</script>

<LiquidMetal
	class="h-full min-h-96 w-full"
	{color}
	{backgroundColor}
	{speed}
	{scale}
	{frequency}
	{refraction}
	{chromaticAberration}
	{blur}
/>
