<script lang="ts">
	import { GlassLogo } from "motion-core";
	import type { ComponentProps } from "svelte";
	import defaultLogoSvg from "$lib/assets/motion-core-logo.svg?raw";

	type Props = Partial<ComponentProps<typeof GlassLogo>>;

	let {
		svgSource = defaultLogoSvg,
		speed = 1,
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		refraction = 1,
		chromaticAberration = 1,
		blur = 1,
		swirlColorA = "#222326",
		swirlColorB = "#ff6900",
	}: Props = $props();
</script>

<GlassLogo
	class="h-full min-h-96 w-full"
	{svgSource}
	{speed}
	{scale}
	{offsetX}
	{offsetY}
	{rotation}
	{refraction}
	{chromaticAberration}
	{blur}
	{swirlColorA}
	{swirlColorB}
/>
