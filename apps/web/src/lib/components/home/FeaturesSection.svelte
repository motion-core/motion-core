<script lang="ts">
	import Assembly from "carbon-icons-svelte/lib/Assembly.svelte";
	import Chart_3D from "carbon-icons-svelte/lib/Chart_3D.svelte";
	import Terminal from "carbon-icons-svelte/lib/Terminal.svelte";
	import Card from "./Card.svelte";
</script>

<section
	aria-labelledby="features-heading"
	class="relative z-10 w-full px-4 sm:px-6 lg:px-8"
>
	<div class="mx-auto grid max-w-6xl gap-8">
		<h2
			id="features-heading"
			class="text-3xl font-medium tracking-tight text-balance text-foreground sm:text-4xl"
		>
			Production motion patterns <span class="block">
				without rebuilding the foundation.</span
			>
		</h2>

		<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
			<Card
				number="01"
				title="Component-first"
				description="Each pattern ships as a focused Svelte component with typed props, scoped assets, and docs that mirror the implementation."
			>
				{#snippet icon()}
					<Assembly size={32} aria-hidden="true" />
				{/snippet}
			</Card>
			<Card
				number="02"
				title="Canvas-ready"
				description="OGL-powered effects are wrapped in predictable Svelte APIs, so WebGL demos feel integrated instead of bolted onto the page."
			>
				{#snippet icon()}
					<Chart_3D size={32} aria-hidden="true" />
				{/snippet}
			</Card>
			<Card
				number="03"
				title="CLI workflow"
				description="Install only the pieces you need, keep dependencies explicit, and use the registry-backed docs as the source of truth."
			>
				{#snippet icon()}
					<Terminal size={32} aria-hidden="true" />
				{/snippet}
			</Card>
		</div>
	</div>
</section>
