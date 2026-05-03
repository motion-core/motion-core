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

<tr
	{...restProps}
	class={cn(
		"text-base leading-loose font-normal [&_code]:text-sm [&strong]:text-base",
		className,
	)}
>
	{@render children?.()}
</tr>
