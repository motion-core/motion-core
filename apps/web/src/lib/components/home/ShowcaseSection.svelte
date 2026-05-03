<script lang="ts">
	import { TextLoop, FluidSimulation, Globe } from "motion-core";
	import { onMount } from "svelte";

	let globeRadius = $state(2);

	onMount(() => {
		const mediaQuery = window.matchMedia("(min-width: 768px)");
		const updateGlobeRadius = () => {
			globeRadius = mediaQuery.matches ? 4 : 2;
		};

		updateGlobeRadius();
		mediaQuery.addEventListener("change", updateGlobeRadius);

		return () => mediaQuery.removeEventListener("change", updateGlobeRadius);
	});
</script>

<section
	aria-labelledby="showcase-heading"
	class="relative z-10 w-full px-4 sm:px-6 lg:px-8"
>
	<div class="mx-auto grid max-w-6xl gap-8">
		<h2
			id="showcase-heading"
			class="max-w-2xl text-3xl font-medium tracking-tight text-balance text-foreground sm:text-4xl"
		>
			Components that move from subtle text details to full canvas systems.
		</h2>

		<div class="grid auto-rows-[18rem] gap-3 md:grid-cols-4">
			<article
				class="group inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5 md:col-span-2 md:row-span-2"
			>
				<div
					class="relative h-full overflow-hidden rounded-md bg-background card"
				>
					<FluidSimulation />
					<div
						class="absolute inset-x-0 bottom-0 z-10 grid gap-1 bg-linear-to-t from-background to-transparent p-4 sm:p-6"
					>
						<h3 class="text-xl font-medium tracking-tight text-foreground">
							Fluid Simulation
						</h3>
						<p class="max-w-sm text-sm text-pretty text-foreground-muted">
							A physics-based fluid simulation with pointer interaction.
						</p>
					</div>
				</div>
			</article>

			<article
				class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5 md:col-span-2"
			>
				<div
					class="relative h-full overflow-hidden rounded-md bg-background card"
				>
					<Globe radius={globeRadius} class="absolute -right-44" />
					<div
						class="absolute inset-x-0 bottom-0 z-10 grid gap-1 bg-linear-to-t from-background to-transparent p-4 sm:p-6"
					>
						<h3 class="text-xl font-medium tracking-tight text-foreground">
							Globe
						</h3>
						<p class="max-w-sm text-sm text-pretty text-foreground-muted">
							A Fresnel-lit globe with rim glow, haloed atmosphere, land mesh
							detail, and marker layers for data storytelling.
						</p>
					</div>
				</div>
			</article>

			<article
				class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5 md:col-span-2"
			>
				<div
					class="flex h-full flex-col justify-between rounded-md bg-background p-4 card sm:p-6"
				>
					<div class="grid gap-1">
						<h3 class="text-xl font-medium tracking-tight text-foreground">
							Text Loop
						</h3>
						<p class="text-sm text-pretty text-foreground-muted">
							Stateful word changes with blur, width, and vertical motion.
						</p>
					</div>
					<p
						class="text-3xl font-medium tracking-tight text-foreground md:text-5xl"
					>
						Build <TextLoop
							class="text-accent"
							texts={["motion", "interactions", "animations", "interfaces"]}
						/> faster
					</p>
				</div>
			</article>
		</div>
	</div>
</section>
