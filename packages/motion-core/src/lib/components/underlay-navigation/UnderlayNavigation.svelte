<script lang="ts">
	import { untrack } from "svelte";
	import { gsap } from "gsap";
	import { onMount } from "svelte";
	import type { ClassValue } from "clsx";
	import type { Snippet } from "svelte";
	import { ensureMotionCoreEase } from "../../helpers/gsap";
	import { cn } from "../../utils/cn";

	interface NavigationLink {
		/**
		 * The text displayed for the link.
		 */
		label: string;
		/**
		 * Destination URL.
		 */
		href: string;
		/**
		 * Marks the link as active.
		 */
		active?: boolean;
		/**
		 * Optional link target.
		 */
		target?: string;
		/**
		 * Optional rel attribute.
		 */
		rel?: string;
	}

	interface FooterGroup {
		/**
		 * Group title.
		 */
		title: string;
		/**
		 * Links rendered inside the group.
		 */
		links: NavigationLink[];
	}

	interface UnderlayNavigationClasses {
		root?: ClassValue;
		underlay?: ClassValue;
		panel?: ClassValue;
		toggleButton?: ClassValue;
		toggleLine?: ClassValue;
		navList?: ClassValue;
		navLink?: ClassValue;
		activeLink?: ClassValue;
		footer?: ClassValue;
		footerGroup?: ClassValue;
		footerTitle?: ClassValue;
		footerLink?: ClassValue;
		foreground?: ClassValue;
		header?: ClassValue;
		brand?: ClassValue;
		content?: ClassValue;
	}

	interface Props {
		/**
		 * Primary navigation links.
		 */
		links: NavigationLink[];
		/**
		 * Optional footer link groups shown below the primary navigation.
		 */
		footerGroups?: FooterGroup[];
		/**
		 * Snippet rendered in the foreground header.
		 */
		brand?: Snippet;
		/**
		 * Foreground content that slides over the underlay panel.
		 */
		children?: Snippet;
		/**
		 * Currently active href. Used when links do not set active directly.
		 */
		activeHref?: string;
		/**
		 * Label for the menu trigger.
		 * @default "Menu"
		 */
		menuLabel?: string;
		/**
		 * Label for the close trigger.
		 * @default "Close"
		 */
		closeLabel?: string;
		/**
		 * Accessible label for the navigation region.
		 * @default "Primary navigation"
		 */
		ariaLabel?: string;
		/**
		 * Width of the underlay panel as a CSS length.
		 * @default "clamp(18rem, 32vw, 24rem)"
		 */
		panelWidth?: string;
		/**
		 * Target border radius for the foreground content while the menu is open.
		 * @default "1rem"
		 */
		foregroundRadius?: string;
		/**
		 * Controlled open state. Supports bind:open.
		 * @default false
		 */
		open?: boolean;
		/**
		 * Additional classes for the root container.
		 */
		class?: string;
		/**
		 * Additional classes for specific slots.
		 */
		classes?: UnderlayNavigationClasses;
	}

	let {
		links,
		footerGroups = [],
		brand,
		children,
		activeHref,
		menuLabel = "Menu",
		closeLabel = "Close",
		ariaLabel = "Primary navigation",
		panelWidth = "clamp(18rem, 32vw, 24rem)",
		foregroundRadius = "1rem",
		open = $bindable(false),
		class: className = "",
		classes,
	}: Props = $props();

	let rootRef: HTMLElement;
	let panelRef: HTMLElement;
	let foregroundRef: HTMLElement;
	let buttonLabelRef: HTMLElement;
	let menuLabelRef: HTMLElement;
	let closeLabelRef: HTMLElement;
	let line1Ref: HTMLElement;
	let line2Ref: HTMLElement;
	let timeline: gsap.core.Timeline | null = null;

	const attachRootRef = (node: HTMLElement) => {
		rootRef = node;
	};

	const attachPanelRef = (node: HTMLElement) => {
		panelRef = node;
	};

	const attachForegroundRef = (node: HTMLElement) => {
		foregroundRef = node;
	};

	const attachButtonLabelRef = (node: HTMLElement) => {
		buttonLabelRef = node;
	};

	const attachMenuLabelRef = (node: HTMLElement) => {
		menuLabelRef = node;
	};

	const attachCloseLabelRef = (node: HTMLElement) => {
		closeLabelRef = node;
	};

	const attachLine1Ref = (node: HTMLElement) => {
		line1Ref = node;
	};

	const attachLine2Ref = (node: HTMLElement) => {
		line2Ref = node;
	};

	const toggle = () => {
		open = !open;
	};

	const getLinkRel = (link: NavigationLink) =>
		link.rel ?? (link.target === "_blank" ? "noreferrer" : undefined);

	const isActiveLink = (link: NavigationLink) =>
		link.active || (activeHref !== undefined && link.href === activeHref);

	onMount(() => {
		ensureMotionCoreEase();
	});

	$effect(() => {
		if (!rootRef || !panelRef || !foregroundRef || !line1Ref || !line2Ref) {
			return;
		}
		if (!buttonLabelRef || !menuLabelRef || !closeLabelRef) return;
		const linkCount = links.length;
		const footerItemCount = footerGroups.reduce(
			(total, group) => total + group.links.length + 1,
			0,
		);
		const hasAnimatedItems = linkCount > 0 || footerItemCount > 0;

		let ctx: gsap.Context | null = null;
		ensureMotionCoreEase();

		ctx = gsap.context(() => {
			const navItems = gsap.utils.toArray(
				'[data-slot="nav-item"]',
				rootRef,
			) as HTMLElement[];
			const footerItems = gsap.utils.toArray(
				'[data-animate="footer-item"]',
				rootRef,
			) as HTMLElement[];

			gsap.set(foregroundRef, {
				x: 0,
				scaleX: 1,
				scaleY: 1,
				borderRadius: 0,
				transformOrigin: "50% 50%",
				force3D: true,
			});
			gsap.set(navItems, { autoAlpha: 0 });
			gsap.set(footerItems, { autoAlpha: 0 });
			gsap.set(line1Ref, { y: 4, rotation: 0 });
			gsap.set(line2Ref, { y: -4, rotation: 0 });
			gsap.set(menuLabelRef, { yPercent: 0 });
			gsap.set(closeLabelRef, { yPercent: 100 });

			timeline = gsap.timeline({
				paused: true,
				defaults: { duration: 0.7, ease: "motion-core-ease" },
			});

			timeline
				.to(
					foregroundRef,
					{
						x: () => -panelRef.getBoundingClientRect().width,
						scaleX: () => {
							const width = rootRef.getBoundingClientRect().width;
							return width > 0 ? (width - 32) / width : 1;
						},
						scaleY: () => {
							const height = rootRef.getBoundingClientRect().height;
							return height > 0 ? (height - 32) / height : 1;
						},
						borderRadius: () => foregroundRadius,
					},
					0,
				)
				.to([line1Ref, line2Ref], { y: 0, duration: 0.4 }, 0)
				.to(line1Ref, { rotation: 45, duration: 0.4 }, 0)
				.to(line2Ref, { rotation: -45, duration: 0.4 }, 0)
				.to(menuLabelRef, { yPercent: -100, duration: 0.35 }, 0)
				.to(closeLabelRef, { yPercent: 0, duration: 0.35 }, 0)
				.to(
					navItems,
					{
						autoAlpha: 1,
						duration: 0.5,
						stagger: 0.045,
					},
					0.15,
				);

			if (hasAnimatedItems && footerItems.length) {
				timeline.to(
					footerItems,
					{
						autoAlpha: 1,
						duration: 0.45,
						stagger: 0.03,
					},
					0.32,
				);
			}

			if (untrack(() => open)) {
				timeline.progress(1);
			}
		}, rootRef);

		return () => {
			ctx?.revert();
			ctx = null;
			timeline = null;
		};
	});

	$effect(() => {
		const shouldOpen = open;

		if (!timeline) return;

		if (shouldOpen) {
			timeline.invalidate().play();
		} else {
			timeline.reverse();
		}
	});
</script>

<div
	{@attach attachRootRef}
	data-slot="root"
	data-open={open}
	class={cn(
		"relative isolate h-full min-h-96 w-full overflow-hidden bg-background text-foreground",
		className,
		classes?.root,
	)}
	style:--underlay-navigation-panel-width={panelWidth}
>
	<div
		data-slot="underlay"
		class={cn(
			"absolute inset-0 z-0 flex justify-end rounded-lg bg-background text-foreground",
			classes?.underlay,
		)}
	>
		<nav
			{@attach attachPanelRef}
			data-slot="panel"
			aria-label={ariaLabel}
			class={cn(
				"relative z-10 flex h-full w-(--underlay-navigation-panel-width) flex-col justify-between rounded-r-lg bg-background px-4 py-4 sm:px-6 sm:py-6",
				classes?.panel,
			)}
		>
			<div class="flex min-h-0 flex-1 flex-col">
				<div class="h-18 shrink-0"></div>

				<ul
					data-slot="nav-list"
					class={cn("space-y-1 overflow-hidden", classes?.navList)}
				>
					{#each links as link (link.href + link.label)}
						<li data-slot="nav-item" class="opacity-0">
							<a
								href={link.href}
								target={link.target}
								rel={getLinkRel(link)}
								aria-current={isActiveLink(link) ? "page" : undefined}
								data-slot="nav-link"
								class={cn(
									"block rounded-sm px-3 py-1 text-4xl leading-[0.95] font-medium tracking-normal text-foreground transition-[background-color,color] duration-200 ease-out hover:bg-accent/10 hover:text-accent md:text-5xl",
									isActiveLink(link) &&
										"bg-accent text-background hover:bg-accent hover:text-background",
									classes?.navLink,
									isActiveLink(link) && classes?.activeLink,
								)}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			{#if footerGroups.length}
				<div
					data-slot="footer"
					class={cn(
						"mt-8 grid gap-6 border-t border-border pt-5 sm:grid-cols-2",
						classes?.footer,
					)}
				>
					{#each footerGroups as group (group.title)}
						<div
							data-slot="footer-group"
							class={cn("min-w-0", classes?.footerGroup)}
						>
							<h3
								data-slot="footer-title"
								data-animate="footer-item"
								class={cn(
									"mb-3 text-xs font-medium tracking-normal text-foreground-muted opacity-0",
									classes?.footerTitle,
								)}
							>
								{group.title}
							</h3>
							<ul class="space-y-2">
								{#each group.links as link (link.href + link.label)}
									<li data-animate="footer-item" class="opacity-0">
										<a
											href={link.href}
											target={link.target}
											rel={getLinkRel(link)}
											data-slot="footer-link"
											class={cn(
												"inline-flex min-h-6 items-center text-sm text-foreground-muted transition-colors duration-150 ease-out hover:text-foreground",
												classes?.footerLink,
											)}
										>
											{link.label}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}
		</nav>
	</div>

	<button
		type="button"
		data-slot="toggle-button"
		data-open={open}
		onclick={toggle}
		class={cn(
			"group absolute top-5 right-5 z-30 inline-flex min-h-10 items-center gap-2 rounded-sm px-2 text-sm font-medium text-fixed-light transition-[background-color,color] duration-150 ease-out hover:bg-fixed-light/10 data-[open=true]:text-foreground data-[open=true]:hover:bg-background-inset sm:top-6 sm:right-7",
			classes?.toggleButton,
		)}
		aria-expanded={open}
		aria-label={open ? closeLabel : menuLabel}
	>
		<span
			{@attach attachButtonLabelRef}
			class="grid overflow-hidden leading-none"
		>
			<span {@attach attachMenuLabelRef} class="col-start-1 row-start-1 block">
				{menuLabel}
			</span>
			<span
				{@attach attachCloseLabelRef}
				class="pointer-events-none col-start-1 row-start-1 block"
				aria-hidden="true"
			>
				{closeLabel}
			</span>
		</span>
		<span
			aria-hidden="true"
			class="relative flex h-10 w-10 items-center justify-center"
		>
			<span
				{@attach attachLine1Ref}
				data-slot="toggle-line"
				class={cn(
					"absolute h-px w-6 bg-current transition-[background-color] duration-400 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:text-accent",
					classes?.toggleLine,
				)}
			></span>
			<span
				{@attach attachLine2Ref}
				data-slot="toggle-line"
				class={cn(
					"absolute h-px w-6 bg-current transition-[background-color] duration-400 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:text-accent",
					classes?.toggleLine,
				)}
			></span>
		</span>
	</button>

	<div
		{@attach attachForegroundRef}
		data-slot="foreground"
		data-open={open}
		class={cn(
			"bg-fixed-dark absolute inset-0 z-20 flex flex-col overflow-hidden text-fixed-light shadow-sm will-change-transform",
			classes?.foreground,
		)}
	>
		<header
			data-slot="header"
			class={cn(
				"pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-7 sm:py-6",
				classes?.header,
			)}
		>
			<div data-slot="brand" class={cn("pointer-events-auto", classes?.brand)}>
				{@render brand?.()}
			</div>
		</header>

		<div
			data-slot="content"
			class={cn(
				"relative z-10 min-h-0 flex-1",
				open ? "overflow-hidden" : "overflow-y-auto",
				classes?.content,
			)}
		>
			{@render children?.()}
		</div>
	</div>
</div>
