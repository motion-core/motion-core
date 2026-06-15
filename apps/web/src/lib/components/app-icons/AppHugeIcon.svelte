<script module lang="ts">
	import type { SVGAttributes } from "svelte/elements";

	export type AppIconSvgElement = readonly (readonly [
		string,
		{
			readonly [key: string]: string | number;
		},
	])[];

	export type AppHugeIconProps = SVGAttributes<SVGSVGElement> & {
		size?: string | number;
		strokeWidth?: number;
		color?: string;
	};

	export type AppHugeIconInternalProps = AppHugeIconProps & {
		icon: AppIconSvgElement;
	};
</script>

<script lang="ts">
	let {
		icon,
		size = 24,
		strokeWidth = 1.5,
		color = "currentColor",
		class: className = "",
		...restProps
	}: AppHugeIconInternalProps = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width={strokeWidth}
	class={className}
	{...restProps}
>
	{#each icon as [tag, attrs], index (attrs.key ?? index)}
		<svelte:element this={tag} {...attrs} />
	{/each}
</svg>
