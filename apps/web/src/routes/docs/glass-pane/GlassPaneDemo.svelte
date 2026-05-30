<script lang="ts">
	import { GlassPane } from "motion-core";
	import type { ComponentProps } from "svelte";

	const demoImage = "/images/demos/sample-6.jpg";
	type Props = Partial<ComponentProps<typeof GlassPane>>;

	let {
		scale = 1,
		rotation = 0,
		offsetX = 0,
		offsetY = 0,
		refraction = 1,
		chromaticAberration = 1,
		panelWidth = 0.82,
		waveFrequency = 0.0,
		waveAmplitude = 0.0,
		speed = 0.65,
	}: Props = $props();
</script>

<GlassPane
	image={demoImage}
	class="h-full min-h-96 w-full"
	{scale}
	{rotation}
	{offsetX}
	{offsetY}
	{refraction}
	{chromaticAberration}
	{panelWidth}
	{waveFrequency}
	{waveAmplitude}
	{speed}
/>
