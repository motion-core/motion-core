import type { PageServerLoad } from "./$types";
import { fetchGitHubStars } from "$lib/server/github";
import tweetsCache from "$lib/content/data/tweets-cache.json";
import type { TweetData } from "$lib/features/tweets/server/fetch-tweet";

export const load: PageServerLoad = async () => {
	const githubStars = await fetchGitHubStars();
	const tweets = tweetsCache as TweetData[];

	return {
		githubStars,
		tweets,
	};
};
