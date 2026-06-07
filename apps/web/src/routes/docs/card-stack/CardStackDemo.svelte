<script lang="ts">
	import { CardStack, CardStackItem } from "motion-core";
	import { onMount } from "svelte";

	type Props = {
		scaleFactor?: number;
		offset?: number;
		topOffset?: number;
	};

	const items = [
		"/images/photos/sample-image-1.webp",
		"/images/photos/sample-image-2.webp",
		"/images/photos/sample-image-3.webp",
		"/images/photos/sample-image-4.webp",
	];
	let scrollElement = $state<HTMLElement | null>(null);
	let { scaleFactor = 0.05, offset = 32, topOffset = 32 }: Props = $props();

	onMount(() => {
		scrollElement = document.getElementById("component-preview-live");
	});
</script>

<div
	class="flex h-full min-h-150 w-full items-center justify-center text-center"
>
	<p class="text-3xl font-medium tracking-tight text-foreground">Scroll Down</p>
</div>
<CardStack
	{scrollElement}
	{scaleFactor}
	{offset}
	{topOffset}
	class="flex flex-col gap-8"
>
	{#each items as item (item)}
		<CardStackItem
			class="inset-shadow mx-auto flex h-96 w-80 flex-col rounded-lg bg-background-inset p-1.5 md:w-120 md:group-data-[fullscreen=true]/preview:h-dvh md:group-data-[fullscreen=true]/preview:w-7xl"
		>
			<div class="relative flex-1 overflow-hidden rounded-md card">
				<img
					src={item}
					alt="Sample"
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		</CardStackItem>
	{/each}
</CardStack>
<div
	class="flex h-full min-h-150 w-full items-center justify-center text-center"
>
	<p class="text-3xl font-medium tracking-tight text-foreground">
		Nothing Here
	</p>
</div>
