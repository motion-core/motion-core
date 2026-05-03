import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { fetchTweet } from "../src/lib/features/tweets/server/fetch-tweet.js";
import type { TweetData } from "../src/lib/features/tweets/server/fetch-tweet.js";

const OUTPUT_PATH = "src/lib/content/data/tweets-cache.json";

export function tweetPrefetchPlugin(tweetIds: string[]): Plugin {
	return {
		name: "tweet-prefetch",
		async buildStart() {
			if (tweetIds.length === 0) {
				writeFileSync(resolve(process.cwd(), OUTPUT_PATH), "[]");
				return;
			}

			const results = await Promise.all(
				tweetIds.map((id) =>
					fetchTweet(id).catch((error) => {
						console.warn(`[tweet-prefetch] failed to fetch ${id}`, error);
						return null;
					}),
				),
			);
			const tweets = results.filter((t): t is TweetData => t !== null);

			writeFileSync(
				resolve(process.cwd(), OUTPUT_PATH),
				JSON.stringify(tweets, null, 2),
			);

			console.log(
				`[tweet-prefetch] ${tweets.length}/${tweetIds.length} tweets cached`,
			);
		},
	};
}
