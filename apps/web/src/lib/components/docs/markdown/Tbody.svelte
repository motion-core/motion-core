<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils/cn";

	type ComponentProps = {
		class?: string;
		children?: Snippet;
		[prop: string]: unknown;
	};

	const {
		children,
		class: className = "",
		...restProps
	}: ComponentProps = $props();
</script>

<tbody
	{...restProps}
	class={cn(
		"[&>tr]:relative [&>tr]:after:absolute [&>tr]:after:inset-x-0 [&>tr]:after:bottom-0 [&>tr]:after:h-px [&>tr]:after:bg-border [&>tr]:after:shadow-2xs [&>tr]:after:shadow-white [&>tr]:after:content-[''] dark:[&>tr]:after:bg-background-inset dark:[&>tr]:after:shadow-border [&>tr:last-child]:after:hidden",
		className,
	)}
>
	{@render children?.()}
</tbody>
