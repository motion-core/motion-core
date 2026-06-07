<script lang="ts">
	import { UnderlayNavigation } from "motion-core";
	import motionCoreLogo from "$lib/assets/motion-core-logo.svg?raw";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof UnderlayNavigation>>;

	const links = [
		{ label: "Home", href: "#", active: true },
		{ label: "Components", href: "#" },
		{ label: "Showcase", href: "#" },
		{ label: "Docs", href: "#" },
		{ label: "Updates", href: "#" },
		{ label: "Contact", href: "#" },
	];

	const footerGroups = [
		{
			title: "Socials",
			links: [
				{ label: "GitHub", href: "#" },
				{ label: "X / Twitter", href: "#" },
				{ label: "Discord", href: "#" },
			],
		},
		{
			title: "Quick Links",
			links: [
				{ label: "Registry", href: "#" },
				{ label: "CLI Guide", href: "#" },
			],
		},
	];

	let { panelWidth = "clamp(18rem, 32vw, 24rem)" }: Props = $props();
</script>

<UnderlayNavigation
	class="h-full min-h-172 w-full"
	{links}
	{footerGroups}
	{panelWidth}
>
	{#snippet brand()}
		<a href="/" class="inline-flex items-center gap-2 text-fixed-light">
			<span
				class="inline-flex shrink-0 items-center text-accent [&>svg]:h-5 [&>svg]:w-auto [&>svg]:fill-current"
				aria-hidden="true"
			>
				{@html motionCoreLogo}
			</span>
		</a>
	{/snippet}

	<div class="bg-fixed-dark relative h-full overflow-hidden">
		<img
			src="/images/photos/sample-image-6.webp"
			alt=""
			class="absolute inset-0 h-full w-full object-cover"
		/>
	</div>
</UnderlayNavigation>
