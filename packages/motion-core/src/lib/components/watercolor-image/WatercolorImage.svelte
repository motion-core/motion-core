<script lang="ts">
	import Scene from "./WatercolorImageScene.svelte";
	import { cn } from "../../utils/cn";
	import type { ComponentProps } from "svelte";

	type SceneProps = ComponentProps<typeof Scene>;

	interface Props {
		/**
		 * The image source URL.
		 */
		src: SceneProps["image"];
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		/**
		 * Radius of the anisotropic watercolor filter.
		 * @default 6
		 */
		radius?: SceneProps["radius"];
		[key: string]: unknown;
	}

	let { src, class: className = "", radius = 6, ...rest }: Props = $props();
</script>

<div class={cn("relative h-full w-full overflow-hidden", className)} {...rest}>
	<div class="absolute inset-0 z-0">
		<Scene image={src} {radius} />
	</div>
</div>
