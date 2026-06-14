<script lang="ts">
	import type { Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import { getHighlighter } from "$lib/utils/highlighter";
	import ScrollArea from "../../ui/ScrollArea.svelte";
	import ShikiCodeBlock from "../ShikiCodeBlock.svelte";
	import CopyCodeButton from "../markdown/CopyCodeButton.svelte";
	import type { SourceTab } from "./types";
	import { cn } from "$lib/utils/cn";

	type Props = {
		tabs: SourceTab[];
		codeSlot?: Snippet;
	};

	let { tabs, codeSlot }: Props = $props();
	let activeTab = $state(0);
	let tabList = $state<HTMLDivElement | null>(null);
	let activeIndicatorLeft = $state(0);
	let activeIndicatorWidth = $state(0);
	let pendingIndicatorFrame: number | null = null;

	const tabRefs = new SvelteMap<number, HTMLButtonElement>();

	const highlightedSources = $derived.by(() => {
		const highlighter = getHighlighter();
		const highlighted: Record<string, { light: string; dark: string }> = {};

		tabs.forEach((tab) => {
			const lang = tab.language ?? "typescript";
			const light = highlighter.codeToHtml(tab.code, {
				lang,
				theme: "github-light",
			});
			const dark = highlighter.codeToHtml(tab.code, {
				lang,
				theme: "github-dark",
			});
			highlighted[tab.name] = { light, dark };
		});

		return highlighted;
	});

	$effect(() => {
		void tabs;
		if (activeTab > tabs.length - 1) {
			activeTab = 0;
		}
	});

	function registerTab(node: HTMLElement, index: number) {
		tabRefs.set(index, node as HTMLButtonElement);

		return {
			update(nextIndex: number) {
				if (nextIndex === index) return;
				tabRefs.delete(index);
				index = nextIndex;
				tabRefs.set(index, node as HTMLButtonElement);
			},
			destroy() {
				tabRefs.delete(index);
			},
		};
	}

	function updateActiveIndicator() {
		const activeTabElement = tabRefs.get(activeTab);

		if (!tabList || !activeTabElement) {
			activeIndicatorLeft = 0;
			activeIndicatorWidth = 0;
			return;
		}

		activeIndicatorLeft = activeTabElement.offsetLeft;
		activeIndicatorWidth = activeTabElement.offsetWidth;
	}

	function scheduleActiveIndicatorUpdate() {
		if (typeof window === "undefined") {
			updateActiveIndicator();
			return;
		}

		if (pendingIndicatorFrame !== null) {
			window.cancelAnimationFrame(pendingIndicatorFrame);
		}

		pendingIndicatorFrame = window.requestAnimationFrame(() => {
			pendingIndicatorFrame = null;
			updateActiveIndicator();
		});
	}

	$effect(() => {
		const currentActiveTab = activeTab;
		const currentTabList = tabList;
		const currentTabsLength = tabs.length;
		void currentActiveTab;
		void currentTabList;
		void currentTabsLength;

		scheduleActiveIndicatorUpdate();

		if (typeof window === "undefined") return;

		window.addEventListener("resize", scheduleActiveIndicatorUpdate);

		return () => {
			window.removeEventListener("resize", scheduleActiveIndicatorUpdate);
			if (pendingIndicatorFrame !== null) {
				window.cancelAnimationFrame(pendingIndicatorFrame);
				pendingIndicatorFrame = null;
			}
		};
	});

	const activeSource = $derived(
		(tabs.at(activeTab) ?? null) as SourceTab | null,
	);
</script>

<div
	class="mt-2 flex flex-1 flex-col overflow-hidden rounded-md rounded-b-md bg-background card"
>
	{#if tabs.length}
		<div
			class="relative flex items-center bg-background text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:shadow-2xs after:shadow-white after:content-[''] dark:after:bg-background-inset dark:after:shadow-border"
		>
			<div
				class="relative flex flex-1 items-center overflow-x-auto"
				bind:this={tabList}
			>
				{#if activeIndicatorWidth > 0}
					<div
						class="tab-active-line pointer-events-none absolute bottom-0 left-0 z-10 h-0.5 transition-[transform,width] duration-150 ease-out"
						style={`
								width: ${activeIndicatorWidth}px;
								transform: translateX(${activeIndicatorLeft}px);
							`}
					></div>
				{/if}

				{#each tabs as tab, index (tab.name)}
					<button
						type="button"
						class={cn(
							"relative z-20 px-4 py-2.5 text-sm font-medium tracking-normal whitespace-nowrap transition-colors duration-150 ease-out",
							index === activeTab
								? "text-accent"
								: "text-foreground-muted hover:text-foreground",
						)}
						onclick={() => (activeTab = index)}
						use:registerTab={index}
					>
						{tab.name}
					</button>
				{/each}
			</div>
			<div class="mr-2 w-fit flex-none">
				{#if activeSource}
					<CopyCodeButton class="size-6" code={activeSource.code} />
				{/if}
			</div>
		</div>
	{/if}
	<ScrollArea id="component-preview" class="relative max-h-96 flex-1">
		<div
			class="p-4 text-sm *:mt-0 *:rounded-none *:border-0 *:bg-transparent *:p-0 *:inset-shadow-none"
		>
			{#if activeSource}
				<ShikiCodeBlock
					code=""
					htmlLight={highlightedSources[activeSource.name].light}
					htmlDark={highlightedSources[activeSource.name].dark}
					unstyled={true}
				/>
			{:else}
				{@render codeSlot?.()}
			{/if}
		</div>
	</ScrollArea>

	<style>
		.tab-active-line {
			background-image: linear-gradient(
				to right,
				transparent,
				oklch(from var(--color-accent) l c h / 0.68) 18%,
				var(--color-accent) 50%,
				oklch(from var(--color-accent) l c h / 0.68) 82%,
				transparent
			);
			filter: drop-shadow(0 0 6px oklch(from var(--color-accent) l c h / 0.38));
		}
	</style>
</div>
