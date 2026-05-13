<script lang="ts">
	import { TextRepel } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof TextRepel>>;

	let {
		mode = "words",
		strength = 18,
		radius = 160,
		falloffPower = 1.5,
		duration = 0.45,
		ease = "power3.out",
	}: Props = $props();
</script>

<TextRepel
	class="max-w-3xl px-6 text-center text-4xl leading-tight font-medium tracking-tight text-foreground md:text-6xl"
	{mode}
	{strength}
	{radius}
	{falloffPower}
	{duration}
	{ease}
>
	Motion reacts to the cursor with a soft field of spatial tension.
</TextRepel>
