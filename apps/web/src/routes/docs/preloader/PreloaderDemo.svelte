<script lang="ts">
	import { Preloader } from "motion-core";

	const images = [
		{
			src: "/images/photos/sample-image-1.webp",
			alt: "Alt 1",
		},
		{
			src: "/images/photos/sample-image-2.webp",
			alt: "Alt 2",
		},
		{
			src: "/images/photos/sample-image-3.webp",
			alt: "Alt 3",
		},
		{
			src: "/images/photos/sample-image-4.webp",
			alt: "Alt 4",
		},
		{
			src: "/images/photos/sample-image-5.webp",
			alt: "Alt 5",
		},
	];

	let showPreloader = $state(false);

	function startPreloader() {
		showPreloader = true;
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			},
		};
	}
</script>

<div class="flex flex-col items-center justify-center">
	<button
		onclick={startPreloader}
		class="h-8 gap-1.5 rounded-sm bg-background-muted px-3 text-xs font-medium tracking-wide text-foreground uppercase card"
	>
		Trigger Preloader
	</button>

	{#if showPreloader}
		<div use:portal>
			<Preloader
				class="bg-background"
				{images}
				onComplete={() => (showPreloader = false)}
			/>
		</div>
	{/if}
</div>
