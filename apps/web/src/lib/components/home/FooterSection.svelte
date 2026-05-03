<script lang="ts">
	import { resolve } from "$app/paths";
	import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";
	import { brandingConfig } from "$lib/config/branding";
	import { siteConfig } from "$lib/config/site";

	const currentYear = new Date().getFullYear();
</script>

<footer class="relative z-10 w-full px-4 pb-6 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl border-t border-border pt-6">
		<div
			class="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
		>
			<div class="grid max-w-md gap-3">
				<a href={resolve("/")} class="inline-flex w-fit items-center gap-2">
					<span
						class="inline-flex shrink-0 items-center text-accent [&>svg]:h-6 [&>svg]:w-auto [&>svg]:fill-current"
						aria-hidden="true"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html brandingConfig.logoRaw}
					</span>
					<span class="text-xl font-medium tracking-tight text-foreground">
						{brandingConfig.name}
					</span>
				</a>
				<p class="text-sm text-balance text-foreground-muted">
					{siteConfig.description}
				</p>
			</div>

			<div class="absolute top-0 right-0">
				<ThemeToggle />
			</div>
		</div>

		<div
			class="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-muted"
		>
			<p>&copy; {currentYear} {siteConfig.author}. MIT Licensed.</p>
			<p>Built for Svelte, GSAP, and OGL.</p>
		</div>
	</div>
</footer>
