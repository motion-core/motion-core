<script lang="ts">
	import CtaSection from "./CtaSection.svelte";
	import FeaturesSection from "./FeaturesSection.svelte";
	import FooterSection from "./FooterSection.svelte";
	import HeroSection from "./HeroSection.svelte";
	import ShowcaseSection from "./ShowcaseSection.svelte";
	import TestimonialsSection from "./TestimonialsSection.svelte";
	import { testimonialsData } from "$lib/content/data/testimonials";
	import type { TweetData } from "$lib/features/tweets/server/fetch-tweet";

	type Props = {
		githubStars?: number | null;
		tweets?: TweetData[];
	};

	let { githubStars = null, tweets = [] }: Props = $props();
</script>

<div class="flex w-full flex-col gap-24">
	<HeroSection {githubStars} />
	<FeaturesSection />
	<ShowcaseSection />
	<TestimonialsSection title={testimonialsData.title} items={tweets} />
	<CtaSection />
	<FooterSection />
</div>
