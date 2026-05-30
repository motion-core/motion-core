<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import { getHighlighter } from "$lib/utils/highlighter";
	import {
		packageManagers,
		packageManagerStore,
		type PackageManager,
	} from "$lib/stores/package-manager.svelte";
	import ShikiCodeBlock from "./ShikiCodeBlock.svelte";
	import CopyCodeButton from "./markdown/CopyCodeButton.svelte";

	type Props = {
		component?: string;
		args?: string;
		mode?: "execute" | "global";
	};

	let { component, args, mode = "execute" }: Props = $props();

	const commands: Record<PackageManager, string> = $derived(
		mode === "global"
			? {
					npm: "npm install -g @motion-core/cli",
					pnpm: "pnpm add -g @motion-core/cli",
					bun: "bun add -g @motion-core/cli",
					yarn: "yarn global add @motion-core/cli",
				}
			: {
					npm: `npx @motion-core/cli ${args ?? (component ? `add ${component}` : "add")}`,
					pnpm: `pnpm dlx @motion-core/cli ${args ?? (component ? `add ${component}` : "add")}`,
					bun: `bunx @motion-core/cli ${args ?? (component ? `add ${component}` : "add")}`,
					yarn: `yarn dlx @motion-core/cli ${args ?? (component ? `add ${component}` : "add")}`,
				},
	);

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

<div class="inset-shadow my-6 rounded-lg bg-background-inset p-1.5">
	<div class="relative w-full rounded-md bg-background card">
		<div
			class="relative flex items-center justify-between rounded-t-md after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:shadow-2xs after:shadow-white after:content-[''] dark:after:bg-background-inset dark:after:shadow-border"
		>
			<div class="flex items-center">
				{#each packageManagers as pm (pm)}
					<button
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

			<CopyCodeButton code={activeCommand} class="mr-2" />
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
