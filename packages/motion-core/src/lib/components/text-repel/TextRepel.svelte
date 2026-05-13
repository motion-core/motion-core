<script lang="ts">
	import { gsap } from "gsap";
	import { SplitText } from "gsap/SplitText";
	import { tick } from "svelte";
	import type { Snippet } from "svelte";
	import { registerPluginOnce } from "../../helpers/gsap";
	import { cn } from "../../utils/cn";

	type SplitMode = "words" | "chars";

	interface ComponentProps {
		/**
		 * The text/content to split and repel from the cursor.
		 */
		children?: Snippet;
		/**
		 * Whether to split and animate words or characters.
		 * @default "words"
		 */
		mode?: SplitMode;
		/**
		 * Maximum translation distance in pixels for the item closest to the cursor.
		 * @default 18
		 */
		strength?: number;
		/**
		 * Cursor influence radius in pixels.
		 * @default 160
		 */
		radius?: number;
		/**
		 * Controls the curve of the distance falloff. Higher values make the effect tighter.
		 * @default 1.5
		 */
		falloffPower?: number;
		/**
		 * Animation duration in seconds.
		 * @default 0.45
		 */
		duration?: number;
		/**
		 * GSAP easing function string.
		 * @default "power3.out"
		 */
		ease?: string;
		/**
		 * Optional external element that should drive pointer movement.
		 * @default null
		 */
		hoverTarget?: HTMLElement | null;
		/**
		 * Additional CSS classes for the wrapper.
		 */
		class?: string;
		[prop: string]: unknown;
	}

	type RepelItem = {
		node: HTMLElement;
		centerX: number;
		centerY: number;
		xTo: gsap.QuickToFunc;
		yTo: gsap.QuickToFunc;
	};

	let {
		children,
		mode = "words",
		strength = 18,
		radius = 160,
		falloffPower = 1.5,
		duration = 0.45,
		ease = "power3.out",
		hoverTarget = null,
		class: className = "",
		...restProps
	}: ComponentProps = $props();

	let wrapperRef: HTMLSpanElement | undefined;
	let splitInstance: SplitText | null = null;
	let repelItems: RepelItem[] = [];

	const attachWrapperRef = (node: HTMLSpanElement) => {
		wrapperRef = node;
		return () => {
			if (wrapperRef === node) {
				wrapperRef = undefined;
			}
		};
	};

	const waitForLayout = async () => {
		await document.fonts.ready;
		await tick();
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
	};

	const resetItems = () => {
		repelItems.forEach(({ xTo, yTo }) => {
			xTo(0);
			yTo(0);
		});
	};

	$effect(() => {
		if (typeof window === "undefined") return;
		if (!wrapperRef) return;

		const node = wrapperRef;
		const target = hoverTarget ?? node;
		if (!target) return;

		registerPluginOnce(SplitText);

		let cancelled = false;
		let ctx: gsap.Context | null = null;
		let resizeObserver: ResizeObserver | null = null;

		const measureItems = () => {
			repelItems = repelItems.map((item) => {
				const rect = item.node.getBoundingClientRect();
				return {
					...item,
					centerX: rect.left + rect.width / 2,
					centerY: rect.top + rect.height / 2,
				};
			});
		};

		const init = async () => {
			await waitForLayout();
			if (cancelled || !wrapperRef) return;

			ctx?.revert();
			ctx = null;
			repelItems = [];
			splitInstance?.revert();
			splitInstance = null;

			ctx = gsap.context(() => {
				splitInstance = SplitText.create(node, {
					type: "words, chars",
					reduceWhiteSpace: false,
					wordsClass: "text-repel-item",
					charsClass: "text-repel-item",
				});

				const targets = (
					mode === "words"
						? (splitInstance.words ?? [])
						: (splitInstance.chars ?? [])
				) as HTMLElement[];

				targets.forEach((targetNode) => {
					targetNode.style.display = "inline-block";
					targetNode.style.willChange = "transform";

					if (!targetNode.textContent?.trim()) {
						targetNode.style.whiteSpace = "pre";
						targetNode.style.pointerEvents = "none";
					}
				});

				repelItems = targets.map((targetNode) => {
					const rect = targetNode.getBoundingClientRect();
					return {
						node: targetNode,
						centerX: rect.left + rect.width / 2,
						centerY: rect.top + rect.height / 2,
						xTo: gsap.quickTo(targetNode, "x", { duration, ease }),
						yTo: gsap.quickTo(targetNode, "y", { duration, ease }),
					};
				});
			}, node);

			resizeObserver?.disconnect();
			resizeObserver = new ResizeObserver(measureItems);
			resizeObserver.observe(node);
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (!repelItems.length) return;
			measureItems();

			repelItems.forEach(({ centerX, centerY, xTo, yTo }) => {
				const dx = centerX - event.clientX;
				const dy = centerY - event.clientY;
				const distance = Math.hypot(dx, dy);

				if (distance <= 0 || distance > radius) {
					xTo(0);
					yTo(0);
					return;
				}

				const normalized = Math.max(0, 1 - distance / radius);
				const influence = Math.pow(normalized, falloffPower);
				const displacement = strength * influence;

				xTo((dx / distance) * displacement);
				yTo((dy / distance) * displacement);
			});
		};

		void init();

		target.addEventListener("pointermove", handlePointerMove);
		target.addEventListener("pointerenter", measureItems);
		target.addEventListener("pointerleave", resetItems);
		window.addEventListener("scroll", measureItems, true);
		window.addEventListener("resize", measureItems);

		return () => {
			cancelled = true;
			target.removeEventListener("pointermove", handlePointerMove);
			target.removeEventListener("pointerenter", measureItems);
			target.removeEventListener("pointerleave", resetItems);
			window.removeEventListener("scroll", measureItems, true);
			window.removeEventListener("resize", measureItems);
			resizeObserver?.disconnect();
			ctx?.revert();
			ctx = null;
			splitInstance?.revert();
			splitInstance = null;
			repelItems = [];
		};
	});
</script>

<span
	{...restProps}
	class={cn("font-inherit inline-block align-baseline text-inherit", className)}
	{@attach attachWrapperRef}
>
	{@render children?.()}
</span>
