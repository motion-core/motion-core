<script lang="ts">
	import { page } from "$app/state";
	import { slide } from "svelte/transition";
	import { docsNavigation } from "$lib/config/navigation";
	import { brandingConfig } from "$lib/config/branding";
	import { docsUiConfig } from "$lib/config/docs-ui";
	import { siteConfig } from "$lib/config/site";
	import { isNewComponentDoc } from "$lib/docs/new-badges";
	import { cn } from "$lib/utils/cn";
	import SearchTrigger from "../search/SearchTrigger.svelte";
	import ScrollArea from "$lib/components/ui/ScrollArea.svelte";
	import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";
	import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";
	import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";

	const currentPath = $derived(
		page.url.pathname.length > 1
			? page.url.pathname.replace(/\/+$/, "")
			: page.url.pathname,
	);
	const currentHash = $derived(page.url.hash);
	const githubUrl = siteConfig.links.github;
	const docsSectionSlugs = new Set(["getting-started", "resources"]);
	const navigationGroups = $derived(
		[
			{
				label: docsUiConfig.sidebar.navigationLabel,
				items: docsNavigation.filter((doc) => docsSectionSlugs.has(doc.slug)),
			},
			{
				label: "Components",
				items: docsNavigation.filter((doc) => !docsSectionSlugs.has(doc.slug)),
			},
		].filter((group) => group.items.length > 0),
	);

	let expandedGroups = $state<Record<string, boolean>>({});
	let navElement = $state<HTMLElement | null>(null);
	let hoverIndicatorTop = $state(0);
	let hoverIndicatorHeight = $state(0);
	let hoverIndicatorVisible = $state(false);
	let hoveredElement: HTMLElement | null = null;
	let activeIndicatorLeft = $state(0);
	let activeIndicatorTop = $state(0);
	let activeIndicatorHeight = $state(0);
	let activeIndicatorVisible = $state(false);
	let activeIndicatorFollowsLayout = $state(false);
	let activeChildElement: HTMLElement | null = null;
	let pendingHoverRestoreFrame: number | null = null;
	let pendingActiveIndicatorFrame: number | null = null;
	let activeIndicatorFollowFrame: number | null = null;
	let lastAutoExpandedPath = "";

	const docHref = (slug: string) => (slug ? `/docs/${slug}` : "/docs");
	const getGroupSlideDuration = (node: Element) => {
		const height = Math.max(0, node.scrollHeight);
		return Math.min(420, Math.max(160, height / 1.2));
	};
	const groupSlide = (node: Element) =>
		slide(node, { duration: getGroupSlideDuration(node) });

	function toggleGroup(slug: string) {
		expandedGroups[slug] = !expandedGroups[slug];
		followActiveIndicatorLayoutShift();
	}

	function showHoverIndicator(node: HTMLElement) {
		if (!navElement) return;

		hoveredElement = node;
		const navRect = navElement.getBoundingClientRect();
		const nodeRect = node.getBoundingClientRect();

		hoverIndicatorTop = nodeRect.top - navRect.top;
		hoverIndicatorHeight = nodeRect.height;
		hoverIndicatorVisible = true;
	}

	function hideHoverIndicator() {
		hoveredElement = null;
		hoverIndicatorVisible = false;
	}

	function restoreHoverIndicator() {
		if (typeof document === "undefined" || !navElement) return;

		const focusedElement =
			document.activeElement instanceof HTMLElement &&
			navElement.contains(document.activeElement)
				? document.activeElement
				: null;
		const hoveredTarget =
			hoveredElement?.isConnected &&
			navElement.contains(hoveredElement) &&
			hoveredElement.matches(":hover")
				? hoveredElement
				: Array.from(
						navElement.querySelectorAll<HTMLElement>("a[href], button"),
					).find((node) => node.matches(":hover"));
		const target = hoveredTarget ?? focusedElement;

		if (target) {
			showHoverIndicator(target);
		}
	}

	function scheduleHoverIndicatorRestore() {
		if (typeof window === "undefined") {
			restoreHoverIndicator();
			return;
		}

		if (pendingHoverRestoreFrame !== null) {
			window.cancelAnimationFrame(pendingHoverRestoreFrame);
		}

		pendingHoverRestoreFrame = window.requestAnimationFrame(() => {
			pendingHoverRestoreFrame = null;
			restoreHoverIndicator();
		});
	}

	function handleNavFocusOut(event: FocusEvent) {
		if (!navElement) return;
		if (
			event.relatedTarget instanceof Node &&
			navElement.contains(event.relatedTarget)
		)
			return;
		hideHoverIndicator();
	}

	function updateActiveIndicator() {
		if (!navElement || !activeChildElement) {
			activeIndicatorVisible = false;
			return;
		}

		const navRect = navElement.getBoundingClientRect();
		const nodeRect = activeChildElement.getBoundingClientRect();
		const groupPanel = activeChildElement.closest("[data-sidebar-group-panel]");
		const clipRect =
			groupPanel instanceof HTMLElement
				? groupPanel.getBoundingClientRect()
				: nodeRect;
		const visibleTop = Math.max(nodeRect.top, clipRect.top);
		const visibleBottom = Math.min(nodeRect.bottom, clipRect.bottom);
		const visibleHeight = Math.max(0, visibleBottom - visibleTop);

		activeIndicatorLeft = nodeRect.left - navRect.left - 8;
		activeIndicatorTop = visibleTop - navRect.top;
		activeIndicatorHeight = visibleHeight;
		activeIndicatorVisible = visibleHeight > 0;
	}

	function scheduleActiveIndicatorUpdate() {
		if (typeof window === "undefined") {
			updateActiveIndicator();
			return;
		}

		if (pendingActiveIndicatorFrame !== null) {
			window.cancelAnimationFrame(pendingActiveIndicatorFrame);
		}

		pendingActiveIndicatorFrame = window.requestAnimationFrame(() => {
			pendingActiveIndicatorFrame = null;
			updateActiveIndicator();
		});
	}

	function followActiveIndicatorLayoutShift() {
		if (typeof window === "undefined") {
			updateActiveIndicator();
			return;
		}

		if (activeIndicatorFollowFrame !== null) {
			window.cancelAnimationFrame(activeIndicatorFollowFrame);
		}

		activeIndicatorFollowsLayout = true;
		const startedAt = window.performance.now();
		const duration = 460;

		const follow = (now: number) => {
			updateActiveIndicator();

			if (now - startedAt < duration) {
				activeIndicatorFollowFrame = window.requestAnimationFrame(follow);
				return;
			}

			activeIndicatorFollowFrame = null;
			activeIndicatorFollowsLayout = false;
			scheduleActiveIndicatorUpdate();
		};

		activeIndicatorFollowFrame = window.requestAnimationFrame(follow);
	}

	function registerActiveChild(node: HTMLElement, isActive: boolean) {
		if (isActive) {
			activeChildElement = node;
			scheduleActiveIndicatorUpdate();
		}

		return {
			update(nextIsActive: boolean) {
				if (nextIsActive) {
					activeChildElement = node;
					scheduleActiveIndicatorUpdate();
				} else if (activeChildElement === node) {
					activeChildElement = null;
					scheduleActiveIndicatorUpdate();
				}
			},
			destroy() {
				if (activeChildElement === node) {
					activeChildElement = null;
					scheduleActiveIndicatorUpdate();
				}
			},
		};
	}

	$effect(() => {
		const path = currentPath;
		void path;

		if (lastAutoExpandedPath === path) return;

		const allDocs = [...docsNavigation];
		for (const doc of allDocs) {
			if (doc.items?.length) {
				const isChildActive = doc.items.some(
					(item) => docHref(item.slug) === currentPath,
				);
				if (isChildActive && expandedGroups[doc.slug] !== true) {
					expandedGroups[doc.slug] = true;
					followActiveIndicatorLayoutShift();
				}
			}
		}

		lastAutoExpandedPath = path;
	});

	$effect(() => {
		const path = currentPath;
		const hash = currentHash;
		void path;
		void hash;

		scheduleHoverIndicatorRestore();
		scheduleActiveIndicatorUpdate();

		if (typeof window === "undefined") return;

		window.addEventListener("resize", scheduleActiveIndicatorUpdate);

		return () => {
			window.removeEventListener("resize", scheduleActiveIndicatorUpdate);
			if (pendingActiveIndicatorFrame !== null) {
				window.cancelAnimationFrame(pendingActiveIndicatorFrame);
				pendingActiveIndicatorFrame = null;
			}
			if (pendingHoverRestoreFrame !== null) {
				window.cancelAnimationFrame(pendingHoverRestoreFrame);
				pendingHoverRestoreFrame = null;
			}
		};
	});
</script>

<aside class="flex h-dvh flex-col bg-background">
	<div class="flex flex-col gap-8 p-4">
		<a href="/" class="flex items-center gap-2">
			<span
				class="[&>svg:w-auto inline-flex shrink-0 items-center text-accent [&>svg]:h-6 [&>svg]:fill-current"
				aria-hidden="true"
			>
				{@html brandingConfig.logoRaw}
			</span>
			<span class="pt-0.5 text-xl font-medium tracking-tight text-foreground"
				>{brandingConfig.name}</span
			>
		</a>

		{#if docsUiConfig.search.enabled}
			<SearchTrigger />
		{/if}
	</div>

	<ScrollArea
		class="flex-1"
		viewportClass="p-4 [overflow-anchor:none]"
		viewportStyle="mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent);"
	>
		<nav
			class="sidebar-nav relative flex flex-col gap-1"
			class:sidebar-nav-layout-shift={activeIndicatorFollowsLayout}
			bind:this={navElement}
			onmouseleave={hideHoverIndicator}
			onfocusout={handleNavFocusOut}
			style={`
						--sidebar-hover-top: ${hoverIndicatorTop}px;
						--sidebar-hover-height: ${hoverIndicatorHeight}px;
						--sidebar-hover-opacity: ${hoverIndicatorVisible ? 1 : 0};
						--sidebar-active-left: ${activeIndicatorLeft}px;
						--sidebar-active-top: ${activeIndicatorTop}px;
						--sidebar-active-height: ${activeIndicatorHeight}px;
						--sidebar-active-opacity: ${activeIndicatorVisible ? 1 : 0};
					`}
		>
			{#each navigationGroups as group, groupIndex (group.label)}
				<h4
					class={cn(
						"relative z-10 mb-2 ml-2 text-xs font-medium tracking-wide text-foreground-muted/70 uppercase",
						groupIndex > 0 && "mt-8",
					)}
				>
					{group.label}
				</h4>
				{#each group.items as doc (doc.slug)}
					{#if doc.items?.length}
						{@const isGroupActive =
							expandedGroups[doc.slug] ??
							doc.items.some((item) => docHref(item.slug) === currentPath)}
						<div class="flex flex-col">
							<button
								onclick={() => toggleGroup(doc.slug)}
								onmouseenter={(event) =>
									showHoverIndicator(event.currentTarget)}
								onfocus={(event) => showHoverIndicator(event.currentTarget)}
								class={cn(
									"relative z-10 flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-sm font-medium tracking-normal transition-colors duration-150 ease-out hover:text-foreground",
									isGroupActive ? "text-foreground" : "text-foreground-muted",
								)}
							>
								<span>{doc.name}</span>
								<ChevronRight
									class={cn(
										"size-4 transition-transform duration-150",
										isGroupActive && "rotate-90",
									)}
								/>
							</button>
							{#if isGroupActive}
								<div
									data-sidebar-group-panel
									transition:groupSlide
									class="overflow-hidden"
								>
									<div
										class="relative z-10 flex flex-col gap-0 pl-5 before:absolute before:top-0 before:bottom-0 before:left-3 before:w-px before:bg-border"
									>
										{#each doc.items as item (item.slug)}
											{@const href = docHref(item.slug)}
											{@const isActive = currentPath === href}
											{@const isNew = isNewComponentDoc(item.slug)}
											<a
												{href}
												onmouseenter={(event) =>
													showHoverIndicator(event.currentTarget)}
												onfocus={(event) =>
													showHoverIndicator(event.currentTarget)}
												use:registerActiveChild={isActive}
												class={cn(
													"relative flex items-center justify-between gap-2 rounded-sm px-3 py-1.5 text-sm font-medium tracking-normal transition-colors duration-150 ease-out",
													isActive
														? "sidebar-active-child text-accent"
														: "text-foreground-muted hover:text-foreground",
												)}
											>
												<span>{item.name}</span>
												{#if isNew}
													<div
														class="inset-shadow relative inline-flex rounded-sm bg-background-inset p-1 text-[10px] font-medium text-foreground"
													>
														<span
															class="rounded-[calc(var(--radius-base)*1.25)] bg-background px-1 py-0.5 card"
														>
															{docsUiConfig.sidebar.newBadge.label}
														</span>
													</div>
												{/if}
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{:else}
						{@const href = docHref(doc.slug)}
						{@const isActive = currentPath === href}
						{@const isNew = isNewComponentDoc(doc.slug)}
						<a
							{href}
							onmouseenter={(event) => showHoverIndicator(event.currentTarget)}
							onfocus={(event) => showHoverIndicator(event.currentTarget)}
							class={cn(
								"relative z-10 flex items-center justify-between gap-2 rounded-sm px-3 py-1.5 text-sm tracking-normal transition-colors duration-150 ease-out",
								isActive
									? "text-accent"
									: "text-foreground-muted hover:text-foreground",
							)}
						>
							<span>{doc.name}</span>
							{#if isNew}
								<div
									class="inset-shadow relative inline-flex w-fit rounded-sm bg-background-inset p-1 text-[10px] font-medium whitespace-nowrap text-foreground"
								>
									<span
										class="bg-backgroundp-1 rounded-[calc(var(--radius-base)*1.25)] card"
									>
										{docsUiConfig.sidebar.newBadge.label}
									</span>
								</div>
							{/if}
						</a>
					{/if}
				{/each}
			{/each}
		</nav>
	</ScrollArea>

	<div class="flex items-center gap-1 p-4">
		{#if docsUiConfig.sidebar.showThemeToggle}
			<ThemeToggle />
		{/if}
		{#if docsUiConfig.sidebar.showRepositoryLink}
			<a
				class="group transition-scale inset-shadow relative inline-flex size-7 cursor-pointer items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95]"
				href={githubUrl}
				target="_blank"
				rel="noreferrer"
				aria-label={docsUiConfig.sidebar.repositoryAriaLabel}
			>
				<LogoGithub class="size-4 flex-none" />
			</a>
		{/if}
	</div>
</aside>

<style>
	.sidebar-nav::before {
		content: "";
		position: absolute;
		inset-inline: 0px;
		top: 0;
		height: var(--sidebar-hover-height);
		border-radius: var(--radius-sm);
		background: var(--color-background-muted);
		opacity: var(--sidebar-hover-opacity);
		pointer-events: none;
		transform: translateY(var(--sidebar-hover-top));
		transition:
			transform 150ms ease-out,
			height 150ms ease-out,
			opacity 150ms ease-out;
		will-change: transform, height, opacity;
		z-index: 0;
	}

	.sidebar-nav::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: var(--sidebar-active-height);
		border-radius: 9999px;
		background-image: linear-gradient(
			to bottom,
			transparent,
			oklch(from var(--color-accent) l c h / 0.68) 18%,
			var(--color-accent) 50%,
			oklch(from var(--color-accent) l c h / 0.68) 82%,
			transparent
		);
		filter: drop-shadow(0 0 6px oklch(from var(--color-accent) l c h / 0.38));
		opacity: var(--sidebar-active-opacity);
		pointer-events: none;
		transform: translate(var(--sidebar-active-left), var(--sidebar-active-top));
		transition:
			transform 150ms ease-out,
			height 150ms ease-out,
			opacity 150ms ease-out;
		will-change: transform, height, opacity;
		z-index: 20;
	}

	.sidebar-nav-layout-shift::after {
		transition: opacity 150ms ease-out;
	}
</style>
