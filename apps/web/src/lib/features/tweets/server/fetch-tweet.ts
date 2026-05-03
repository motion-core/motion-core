const SYNDICATION_URL = "https://cdn.syndication.twimg.com";

export type TweetUser = {
	id_str: string;
	name: string;
	screen_name: string;
	profile_image_url_https: string;
	verified: boolean;
	is_blue_verified: boolean;
};

export type TweetData = {
	id_str: string;
	text: string;
	user: TweetUser;
};

const TWEET_ID = /^[0-9]+$/;

function getToken(id: string): string {
	return ((Number(id) / 1e15) * Math.PI)
		.toString(6 ** 2)
		.replace(/(0+|\.)/g, "");
}

export async function fetchTweet(id: string): Promise<TweetData | null> {
	if (id.length > 40 || !TWEET_ID.test(id)) {
		throw new Error(`Invalid tweet id: ${id}`);
	}

	const url = new URL(`${SYNDICATION_URL}/tweet-result`);
	url.searchParams.set("id", id);
	url.searchParams.set("lang", "en");
	url.searchParams.set(
		"features",
		[
			"tfw_timeline_list:",
			"tfw_follower_count_sunset:true",
			"tfw_tweet_edit_backend:on",
			"tfw_refsrc_session:on",
			"tfw_fosnr_soft_interventions_enabled:on",
			"tfw_show_birdwatch_pivots_enabled:on",
			"tfw_show_business_verified_badge:on",
			"tfw_duplicate_scribes_to_settings:on",
			"tfw_use_profile_image_shape_enabled:on",
			"tfw_show_blue_verified_badge:on",
			"tfw_legacy_timeline_sunset:true",
			"tfw_show_gov_verified_badge:on",
			"tfw_show_business_affiliate_badge:on",
			"tfw_tweet_edit_frontend:on",
		].join(";"),
	);
	url.searchParams.set("token", getToken(id));

	const res = await fetch(url.toString());
	if (!res.ok || res.status === 404) return null;

	const isJson = res.headers.get("content-type")?.includes("application/json");
	if (!isJson) return null;

	const data = await res.json();
	if (
		data?.__typename === "TweetTombstone" ||
		!data ||
		Object.keys(data).length === 0
	) {
		return null;
	}

	return data as TweetData;
}
