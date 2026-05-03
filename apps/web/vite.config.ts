import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { tweetPrefetchPlugin } from "./plugins/tweet-prefetch";
import { testimonialsData } from "./src/lib/content/data/testimonials";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		tweetPrefetchPlugin(testimonialsData.tweetIds),
	],
	optimizeDeps: {
		exclude: ["@rollup/browser"],
	},
	worker: {
		format: "es",
	},
});
