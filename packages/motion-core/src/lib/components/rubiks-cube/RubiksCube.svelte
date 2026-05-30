<script lang="ts">
	import Scene from "./RubiksCubeScene.svelte";
	import { cn } from "../../utils/cn";
	import type { ComponentProps } from "svelte";

	type SceneProps = ComponentProps<typeof Scene>;

	interface Props {
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		/**
		 * Scale multiplier for the cube.
		 * @default 1
		 */
		scale?: SceneProps["scale"];
		/**
		 * Horizontal cube offset in normalized viewport units.
		 * @default 0
		 */
		offsetX?: SceneProps["offsetX"];
		/**
		 * Vertical cube offset in normalized viewport units.
		 * @default 0
		 */
		offsetY?: SceneProps["offsetY"];
		/**
		 * Cube rotation in degrees.
		 * @default 0
		 */
		rotation?: SceneProps["rotation"];
		/**
		 * Duration of the rotation animation in seconds.
		 * @default 1.5
		 */
		duration?: SceneProps["duration"];
		/**
		 * Gap between the cubelets.
		 * @default 0.015
		 */
		gap?: SceneProps["gap"];
		/**
		 * Corner radius of the cubelets.
		 * @default 0.125
		 */
		radius?: SceneProps["radius"];
		/**
		 * Configuration for the Fresnel shader uniforms.
		 */
		fresnelConfig?: SceneProps["fresnelConfig"];

		[key: string]: unknown;
	}

	let {
		class: className = "",
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		duration = 1.5,
		gap = 0.015,
		radius = 0.125,
		fresnelConfig,
		...rest
	}: Props = $props();
</script>

<div class={cn("relative h-full w-full overflow-hidden", className)} {...rest}>
	<div class="absolute inset-0 z-0">
		<Scene
			{scale}
			{offsetX}
			{offsetY}
			{rotation}
			{duration}
			{gap}
			{radius}
			{fresnelConfig}
		/>
	</div>
</div>
