<script lang="ts">
	import brandLogoRaw from "$lib/assets/motion-core-logo.svg?raw";
	import { resolve } from "$app/paths";
	import { AppBookIcon, AppGitHubIcon } from "$lib/components/icons";
	import Button from "../ui/Button.svelte";
	import { siteConfig } from "$lib/config/site";
	import { themeStore } from "$lib/stores/theme.svelte";
	import { GlitterCloth } from "motion-core";

	type Props = {
		githubStars?: number | null;
	};

	let { githubStars = null }: Props = $props();
	const docsRoute = "/docs" as const;

	const formattedGithubStars = $derived(
		typeof githubStars === "number"
			? new Intl.NumberFormat("en-US", {
					notation: "compact",
					maximumFractionDigits: 1,
				}).format(githubStars)
			: "--",
	);
	const glitterBrightness = $derived(themeStore.isDark ? 1 : 20);
</script>

<section
	id="home"
	class="relative flex h-dvh w-full flex-col items-center justify-center gap-4 p-4"
>
	<GlitterCloth
		class="absolute inset-0 h-full min-h-96 w-full"
		color="#222326"
		speed={1}
		brightness={glitterBrightness}
		blendStrength={0.05}
		noiseScale={4}
		vignetteStrength={0.1}
		vignettePower={0.0}
	/>
	<div
		class="absolute inset-x-0 bottom-0 z-10 h-200 bg-linear-to-t from-background-inset to-transparent"
	></div>
	<div
		class="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4"
	>
		<span
			class="mb-4 inline-flex shrink-0 items-center text-accent [&>svg]:h-auto [&>svg]:w-32 [&>svg]:fill-current"
			aria-hidden="true"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html brandLogoRaw}
		</span>
		<h1
			class="max-w-3xl text-center text-4xl font-medium tracking-tight text-balance text-foreground sm:text-6xl"
		>
			High-quality <span class="text-accent">motion components</span>
			for Svelte.
		</h1>
		<p
			class="max-w-xl text-center text-base font-normal tracking-normal text-pretty text-foreground-muted sm:text-lg"
		>
			Animated Svelte component library powered by GSAP and OGL. Drop-in
			solutions for motion design, 3D canvases, and interactive animations.
		</p>
		<div data-reveal="actions" class="flex items-center gap-2">
			<Button
				variant="default"
				href={resolve(docsRoute as "/")}
				size="lg"
				data-sveltekit-reload
				data-sveltekit-preload-data="off"
				data-sveltekit-preload-code="off"
			>
				<AppBookIcon size={16} />
				<span>Documentation</span>
			</Button>
			<Button
				variant="secondary"
				href={siteConfig.links.github}
				target="_blank"
				rel="noreferrer"
				size="lg"
			>
				<AppGitHubIcon size={16} />
				<span>GitHub</span>
				<span aria-hidden="true" class="text-background/40">|</span>
				<span>{formattedGithubStars}</span>
			</Button>
		</div>
	</div>
</section>
