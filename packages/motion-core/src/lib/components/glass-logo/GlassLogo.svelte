<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { cn } from "../../utils/cn";
	import Scene from "./GlassLogoScene.svelte";

	type SceneProps = ComponentProps<typeof Scene>;

	interface Props {
		/**
		 * Inline SVG markup used as the logo silhouette.
		 */
		svgSource?: SceneProps["svgSource"];
		/**
		 * Animation speed multiplier.
		 * @default 1
		 */
		speed?: SceneProps["speed"];
		/**
		 * Scale multiplier for the logo silhouette.
		 * @default 1
		 */
		scale?: SceneProps["scale"];
		/**
		 * Horizontal logo offset in normalized viewport units.
		 * @default 0
		 */
		offsetX?: SceneProps["offsetX"];
		/**
		 * Vertical logo offset in normalized viewport units.
		 * @default 0
		 */
		offsetY?: SceneProps["offsetY"];
		/**
		 * Logo rotation in degrees.
		 * @default 0
		 */
		rotation?: SceneProps["rotation"];
		/**
		 * Strength of the glass refraction.
		 * @default 1
		 */
		refraction?: SceneProps["refraction"];
		/**
		 * Strength of the RGB separation inside the glass.
		 * @default 1
		 */
		chromaticAberration?: SceneProps["chromaticAberration"];
		/**
		 * Radius multiplier for the internal blur sampling.
		 * @default 1
		 */
		blur?: SceneProps["blur"];
		/**
		 * Dark color used by the procedural swirl.
		 * @default "#222326"
		 */
		swirlColorA?: SceneProps["swirlColorA"];
		/**
		 * Light color used by the procedural swirl.
		 * @default "#ff6900"
		 */
		swirlColorB?: SceneProps["swirlColorB"];
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		[key: string]: unknown;
	}

	let {
		svgSource,
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
		class: className = "",
		...rest
	}: Props = $props();
</script>

<div class={cn("relative h-full w-full overflow-hidden", className)} {...rest}>
	<div class="absolute inset-0 z-0">
		<Scene
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
	</div>
</div>
