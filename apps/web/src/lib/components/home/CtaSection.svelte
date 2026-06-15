<script lang="ts">
	import { SvelteMap } from "svelte/reactivity";
	import { cn } from "$lib/utils/cn";
	import { getHighlighter } from "$lib/utils/highlighter";
	import {
		packageManagers,
		packageManagerStore,
		type PackageManager,
	} from "$lib/stores/package-manager.svelte";
	import CopyCodeButton from "$lib/components/docs/markdown/CopyCodeButton.svelte";
	import ShikiCodeBlock from "$lib/components/docs/ShikiCodeBlock.svelte";

	const commands: Record<PackageManager, string> = {
		npm: "npx @motion-core/cli init",
		pnpm: "pnpm dlx @motion-core/cli init",
		bun: "bunx @motion-core/cli init",
		yarn: "yarn dlx @motion-core/cli init",
	};

	const activeCommand = $derived(commands[packageManagerStore.active]);
	let tabList = $state<HTMLDivElement | null>(null);
	let activeIndicatorLeft = $state(0);
	let activeIndicatorWidth = $state(0);
	let pendingIndicatorFrame: number | null = null;

	const tabRefs = new SvelteMap<PackageManager, HTMLButtonElement>();

	function registerTab(node: HTMLElement, pm: PackageManager) {
		tabRefs.set(pm, node as HTMLButtonElement);

		return {
			update(nextPm: PackageManager) {
				if (nextPm === pm) return;
				tabRefs.delete(pm);
				pm = nextPm;
				tabRefs.set(pm, node as HTMLButtonElement);
			},
			destroy() {
				tabRefs.delete(pm);
			},
		};
	}

	function updateActiveIndicator() {
		const activeTab = tabRefs.get(packageManagerStore.active);

		if (!tabList || !activeTab) {
			activeIndicatorLeft = 0;
			activeIndicatorWidth = 0;
			return;
		}

		activeIndicatorLeft = activeTab.offsetLeft;
		activeIndicatorWidth = activeTab.offsetWidth;
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
			document.documentElement.dataset.docsPackageManagerReady = "true";
		});
	}

	$effect(() => {
		const activePackageManager = packageManagerStore.active;
		const currentTabList = tabList;
		void activePackageManager;
		void currentTabList;

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

	const highlightedCommands = $derived.by(() => {
		const highlighter = getHighlighter();
		const highlighted = {} as Record<
			PackageManager,
			{ light: string; dark: string }
		>;

		for (const pm of packageManagers) {
			const cmd = commands[pm];
			highlighted[pm] = {
				light: highlighter.codeToHtml(cmd, {
					lang: "bash",
					theme: "github-light",
				}),
				dark: highlighter.codeToHtml(cmd, {
					lang: "bash",
					theme: "github-dark",
				}),
			};
		}

		return highlighted;
	});
</script>

<section
	aria-labelledby="cta-heading"
	class="relative z-10 w-full px-4 sm:px-6 lg:px-8"
>
	<div class="mx-auto max-w-6xl">
		<div
			class="grid gap-8 rounded-md lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.72fr)] lg:items-center"
		>
			<div class="grid max-w-2xl gap-4">
				<div class="grid gap-3">
					<h2
						id="cta-heading"
						class="text-3xl font-medium tracking-tight text-balance text-foreground sm:text-4xl"
					>
						Start building motion-rich <span class="text-accent">Svelte</span> interfaces.
					</h2>
					<p class="max-w-xl text-base text-balance text-foreground-muted">
						Browse the component docs, copy the install command, and bring
						production-ready animation patterns into your project.
					</p>
				</div>
			</div>

			<div class="inset-shadow min-w-0 rounded-lg bg-background-inset p-1.5">
				<div
					class="relative w-full overflow-hidden rounded-md bg-background card"
				>
					<div
						class="relative flex items-center justify-between rounded-t-md after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:shadow-2xs after:shadow-white after:content-[''] dark:after:bg-background-inset dark:after:shadow-border"
					>
						<div
							class="relative flex min-w-0 items-center overflow-x-auto"
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

							{#each packageManagers as pm (pm)}
								<button
									type="button"
									onclick={() => (packageManagerStore.active = pm)}
									class={cn(
										"package-manager-tab relative z-20 px-4 py-2.5 text-sm font-medium tracking-normal transition-colors duration-150 ease-out outline-none select-none",
										packageManagerStore.active === pm
											? "text-accent"
											: "text-foreground-muted hover:text-foreground",
									)}
									data-package-manager={pm}
									use:registerTab={pm}
								>
									{pm}
								</button>
							{/each}
						</div>

						<CopyCodeButton code={activeCommand} class="mr-2 flex-none" />
					</div>

					<div
						class="min-h-12.5 p-4 [&>div]:mt-0 [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none [&>div]:[box-shadow:none]!"
					>
						<ShikiCodeBlock
							code=""
							htmlLight={highlightedCommands[packageManagerStore.active].light}
							htmlDark={highlightedCommands[packageManagerStore.active].dark}
							unstyled={true}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

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

		.package-manager-tab::after {
			position: absolute;
			right: 0;
			bottom: 0;
			left: 0;
			height: 2px;
			pointer-events: none;
			content: "";
			background-image: linear-gradient(
				to right,
				transparent,
				oklch(from var(--color-accent) l c h / 0.68) 18%,
				var(--color-accent) 50%,
				oklch(from var(--color-accent) l c h / 0.68) 82%,
				transparent
			);
			filter: drop-shadow(0 0 6px oklch(from var(--color-accent) l c h / 0.38));
			opacity: 0;
		}

		:global(
				html[data-docs-package-manager]:not([data-docs-package-manager-ready])
			)
			.tab-active-line {
			opacity: 0;
		}

		:global(
				html[data-docs-package-manager]:not([data-docs-package-manager-ready])
			)
			.package-manager-tab {
			color: var(--color-foreground-muted);
		}

		:global(
				html[data-docs-package-manager="npm"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="npm"],
		:global(
				html[data-docs-package-manager="pnpm"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="pnpm"],
		:global(
				html[data-docs-package-manager="bun"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="bun"],
		:global(
				html[data-docs-package-manager="yarn"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="yarn"] {
			color: var(--color-accent);
		}

		:global(
				html[data-docs-package-manager="npm"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="npm"]::after,
		:global(
				html[data-docs-package-manager="pnpm"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="pnpm"]::after,
		:global(
				html[data-docs-package-manager="bun"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="bun"]::after,
		:global(
				html[data-docs-package-manager="yarn"]:not(
						[data-docs-package-manager-ready]
					)
			)
			.package-manager-tab[data-package-manager="yarn"]::after {
			opacity: 1;
		}
	</style>
</section>
