<script lang="ts">
	import { GlassPane } from "motion-core";
	import type { ComponentProps } from "svelte";

	const demoImage = "/images/photos/sample-image-7.webp";
	type Props = Partial<ComponentProps<typeof GlassPane>>;

	let {
		rotation = 0,
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
	{rotation}
	{refraction}
	{chromaticAberration}
	{panelWidth}
	{waveFrequency}
	{waveAmplitude}
	{speed}
/>
