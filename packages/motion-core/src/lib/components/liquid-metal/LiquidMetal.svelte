<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Scene from "./LiquidMetalScene.svelte";
	import { cn } from "../../utils/cn";

	type SceneProps = ComponentProps<typeof Scene>;

	interface Props {
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		/**
		 * Light color reflected through the liquid-metal surface.
		 * @default "#FFFFFF"
		 */
		color?: SceneProps["color"];
		/**
		 * Dark color reflected through the liquid-metal surface.
		 * @default "#17181A"
		 */
		backgroundColor?: SceneProps["backgroundColor"];
		/**
		 * Animation speed multiplier.
		 * @default 1.0
		 */
		speed?: SceneProps["speed"];
		/**
		 * Scale multiplier for the distorted field.
		 * @default 1.0
		 */
		scale?: SceneProps["scale"];
		/**
		 * Spatial frequency of the distorted folds.
		 * @default 3.5
		 */
		frequency?: SceneProps["frequency"];
		/**
		 * Strength of the liquid-metal refraction.
		 * @default 2.0
		 */
		refraction?: SceneProps["refraction"];
		/**
		 * Strength of the RGB separation inside the refracted surface.
		 * @default 3.0
		 */
		chromaticAberration?: SceneProps["chromaticAberration"];
		/**
		 * Radius multiplier for the internal blur sampling.
		 * @default 1.0
		 */
		blur?: SceneProps["blur"];
		[key: string]: unknown;
	}

	let {
		class: className = "",
		color = "#FFFFFF",
		backgroundColor = "#17181A",
		speed = 1.0,
		scale = 1.0,
		frequency = 3.5,
		refraction = 2.0,
		chromaticAberration = 3.0,
		blur = 1.0,
		...rest
	}: Props = $props();
</script>

<div class={cn("relative h-full w-full overflow-hidden", className)} {...rest}>
	<div class="absolute inset-0 z-0">
		<Scene
			{color}
			{backgroundColor}
			{speed}
			{scale}
			{frequency}
			{refraction}
			{chromaticAberration}
			{blur}
		/>
	</div>
</div>
