<script lang="ts">
	import Scene from "./GlassPaneScene.svelte";
	import { cn } from "../../utils/cn";
	import type { ComponentProps } from "svelte";

	type SceneProps = ComponentProps<typeof Scene>;

	interface Props {
		/**
		 * The image source URL.
		 */
		image: SceneProps["image"];
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		/**
		 * Scale multiplier for the glass field.
		 * @default 1
		 */
		scale?: SceneProps["scale"];
		/**
		 * Glass field rotation in degrees.
		 * @default 0
		 */
		rotation?: SceneProps["rotation"];
		/**
		 * Horizontal glass field offset.
		 * @default 0
		 */
		offsetX?: SceneProps["offsetX"];
		/**
		 * Vertical glass field offset.
		 * @default 0
		 */
		offsetY?: SceneProps["offsetY"];
		/**
		 * Strength of the glass refraction.
		 * @default 1
		 */
		refraction?: SceneProps["refraction"];
		/**
		 * Amount of chromatic aberration (color splitting).
		 * @default 1
		 */
		chromaticAberration?: SceneProps["chromaticAberration"];
		/**
		 * Width of the diagonal glass panels.
		 * @default 0.82
		 */
		panelWidth?: SceneProps["panelWidth"];
		/**
		 * Frequency of the panel wave.
		 * @default 0.0
		 */
		waveFrequency?: SceneProps["waveFrequency"];
		/**
		 * Amplitude of the panel wave.
		 * @default 0.0
		 */
		waveAmplitude?: SceneProps["waveAmplitude"];
		/**
		 * Animation speed multiplier.
		 * @default 0.65
		 */
		speed?: SceneProps["speed"];
		[key: string]: unknown;
	}

	let {
		image,
		class: className = "",
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
		...rest
	}: Props = $props();
</script>

<div class={cn("relative h-full w-full overflow-hidden", className)} {...rest}>
	<div class="absolute inset-0 z-0">
		<Scene
			{image}
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
	</div>
</div>
