<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import { themeStore } from "$lib/stores/theme.svelte";
	import { AppMoonIcon, AppSunIcon } from "$lib/components/icons";

	type Props = {
		class?: string;
	};

	const props = $props();
	const className = $derived((props as Props).class ?? "");
</script>

<button
	type="button"
	class={cn(
		"group transition-scale inset-shadow relative inline-flex size-7 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95]",
		className,
	)}
	onclick={themeStore.toggle}
	aria-label={themeStore.isDark
		? "Switch to light mode"
		: "Switch to dark mode"}
>
	<span class="sr-only"
		>{themeStore.isDark ? "Switch to light mode" : "Switch to dark mode"}</span
	>
	<span class="theme-toggle-icon theme-toggle-sun">
		<AppSunIcon size={16} />
	</span>
	<span class="theme-toggle-icon theme-toggle-moon">
		<AppMoonIcon size={16} />
	</span>
</button>

<style>
	.theme-toggle-icon {
		position: absolute;
		opacity: 0;
		filter: blur(4px);
		scale: 0.25;
		transition:
			opacity 150ms ease-out,
			filter 150ms ease-out,
			scale 150ms ease-out;
		will-change: opacity, filter, scale;
	}

	.theme-toggle-sun {
		opacity: 1;
		filter: blur(0);
		scale: 1;
	}

	:global(.dark) .theme-toggle-sun {
		opacity: 0;
		filter: blur(4px);
		scale: 0.25;
	}

	:global(.dark) .theme-toggle-moon {
		opacity: 1;
		filter: blur(0);
		scale: 1;
	}
</style>
