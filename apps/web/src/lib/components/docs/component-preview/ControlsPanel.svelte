<script lang="ts">
	import type {
		ComponentPreviewControl,
		ComponentPreviewValue,
		ComponentPreviewValues,
	} from "./types";
	import ControlField from "./ControlField.svelte";
	import Reset from "carbon-icons-svelte/lib/Reset.svelte";

	type Props = {
		controls: ComponentPreviewControl[];
		values: ComponentPreviewValues;
		onChange: (name: string, value: ComponentPreviewValue) => void;
		onReset: () => void;
	};

	let { controls, values, onChange, onReset }: Props = $props();
</script>

{#if controls.length}
	<div
		class="mt-2 overflow-visible rounded-md rounded-b-md bg-background card"
		aria-label="Component props"
	>
		<div
			class="relative flex items-center justify-between px-4 py-2.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:shadow-2xs after:shadow-white after:content-[''] dark:after:bg-background-inset dark:after:shadow-border"
		>
			<h2 class="text-sm font-medium tracking-normal text-foreground">Props</h2>
			<button
				onclick={onReset}
				class="inset-shadow absolute top-1/2 right-2 z-30 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm bg-background-inset text-foreground transition-transform duration-150 ease-out active:scale-[0.95]"
				aria-label="Reset Settings"
			>
				<Reset class="size-4 flex-none" />
			</button>
		</div>
		<div class="grid gap-2.5 p-3 md:grid-cols-2 xl:grid-cols-3">
			{#each controls as control (control.name)}
				<ControlField {control} value={values[control.name]} {onChange} />
			{/each}
		</div>
	</div>
{/if}
