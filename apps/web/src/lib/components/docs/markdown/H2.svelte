<script lang="ts">
	import { onDestroy } from "svelte";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils/cn";

	import { AppCheckIcon, AppCopyIcon } from "$lib/components/icons";

	type ComponentProps = {
		id?: string;
		class?: string;
		children?: Snippet;
		[prop: string]: unknown;
	};

	const {
		children,
		id,
		class: className = "",
		...restProps
	}: ComponentProps = $props();

	let copied = $state(false);
	let timeoutId: number | null = null;

	async function copyHeadingUrl(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (!id || typeof window === "undefined") return;

		const hash = `#${encodeURIComponent(id)}`;
		const url = `${window.location.origin}${window.location.pathname}${window.location.search}${hash}`;

		window.history.pushState(null, "", hash);

		try {
			await navigator.clipboard.writeText(url);

			copied = true;

			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}

			timeoutId = window.setTimeout(() => {
				copied = false;
				timeoutId = null;
			}, 2000);
		} catch (error) {
			console.error("Failed to copy heading link", error);
		}
	}

	onDestroy(() => {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}
	});
</script>

<h2
	{id}
	{...restProps}
	class={cn(
		"group mt-12 w-fit scroll-m-24 text-2xl font-medium tracking-tight text-foreground [&_code]:text-xl",
		className,
	)}
>
	<span class="inline-flex items-center gap-2 align-baseline leading-none">
		<span class="min-w-0 [&_a]:text-2xl">
			{@render children?.()}
		</span>

		{#if id}
			<div
				class="inset-shadow flex items-center rounded-sm p-1 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 focus-visible:opacity-100"
			>
				<button
					type="button"
					class={cn(
						"relative inline-flex size-6 shrink-0 items-center justify-center rounded-xs bg-background text-foreground card transition-[scale] duration-150 ease-out active:scale-[0.95]",
					)}
					onclick={copyHeadingUrl}
					aria-label={copied ? "Copied heading link" : "Copy heading link"}
				>
					<span
						class={cn(
							"absolute inline-flex items-center justify-center transition-[opacity,filter,scale] duration-150 ease-out will-change-[opacity,filter,scale]",
							copied
								? "scale-[0.25] opacity-0 blur-xs"
								: "blur-0 scale-100 opacity-100",
						)}
					>
						<AppCopyIcon size={16} />
					</span>

					<span
						class={cn(
							"absolute inline-flex items-center justify-center transition-[opacity,filter,scale] duration-150 ease-out will-change-[opacity,filter,scale]",
							copied
								? "blur-0 scale-100 opacity-100"
								: "scale-[0.25] opacity-0 blur-xs",
						)}
					>
						<AppCheckIcon size={16} />
					</span>
				</button>
			</div>
		{/if}
	</span>
</h2>
