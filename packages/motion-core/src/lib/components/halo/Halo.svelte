<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Scene from "./HaloScene.svelte";
	import { cn } from "../../utils/cn";

	type SceneProps = ComponentProps<typeof Scene>;

	interface Props {
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		/**
		 * Scale multiplier for the halo field.
		 * @default 1
		 */
		scale?: SceneProps["scale"];
		/**
		 * Horizontal halo offset in normalized viewport units.
		 * @default 0
		 */
		offsetX?: SceneProps["offsetX"];
		/**
		 * Vertical halo offset in normalized viewport units.
		 * @default 0
		 */
		offsetY?: SceneProps["offsetY"];
		/**
		 * Halo rotation in degrees.
		 * @default 0
		 */
		rotation?: SceneProps["rotation"];
		/**
		 * Camera rotation speed multiplier.
		 * @default 0.5
		 */
		rotationSpeed?: SceneProps["rotationSpeed"];
		/**
		 * Color of the background.
		 * @default "#17181A"
		 */
		backgroundColor?: SceneProps["backgroundColor"];
		/**
		 * Distance of the camera from the center.
		 * @default 3.0
		 */
		cameraDistance?: SceneProps["cameraDistance"];
		/**
		 * Sun light direction vector (X).
		 * @default 0.0
		 */
		sunX?: SceneProps["sunX"];
		/**
		 * Sun light direction vector (Y).
		 * @default 0.0
		 */
		sunY?: SceneProps["sunY"];
		/**
		 * Sun light direction vector (Z).
		 * @default 1.0
		 */
		sunZ?: SceneProps["sunZ"];
		/**
		 * Overall intensity/brightness of the scattering effect.
		 * @default 1.0
		 */
		intensity?: SceneProps["intensity"];
		[key: string]: unknown;
	}

	let {
		class: className = "",
		scale = 1,
		offsetX = 0,
		offsetY = 0,
		rotation = 0,
		rotationSpeed = 0.5,
		backgroundColor = "#17181A",
		cameraDistance = 3.0,
		sunX = 0.0,
		sunY = 0.0,
		sunZ = 1.0,
		intensity = 1.0,
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
			{rotationSpeed}
			{backgroundColor}
			{cameraDistance}
			{sunX}
			{sunY}
			{sunZ}
			{intensity}
		/>
	</div>
</div>
