<script lang="ts">
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
						<div class="flex min-w-0 items-center overflow-x-auto">
							{#each packageManagers as pm (pm)}
								<button
									type="button"
									onclick={() => (packageManagerStore.active = pm)}
									class={cn(
										"relative px-4 py-2.5 text-sm font-medium tracking-normal transition-colors duration-150 ease-out outline-none select-none",
										packageManagerStore.active === pm
											? "text-foreground"
											: "text-foreground-muted hover:text-foreground",
									)}
								>
									{pm}
									{#if packageManagerStore.active === pm}
										<div
											class="absolute bottom-0 left-0 h-0.5 w-full bg-accent"
										></div>
									{/if}
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
</section>
