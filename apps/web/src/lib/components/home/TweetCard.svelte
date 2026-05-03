<script lang="ts">
	import CheckmarkFilled from "carbon-icons-svelte/lib/CheckmarkFilled.svelte";
	import LogoX from "carbon-icons-svelte/lib/LogoX.svelte";
	import type { TweetData } from "$lib/features/tweets/server/fetch-tweet";
	import { cn } from "$lib/utils/cn";

	type Props = {
		tweet: TweetData;
		class?: string;
	};

	let { tweet, class: className = "" }: Props = $props();

	const tweetUrl = $derived(
		`https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
	);
	const sanitizedText = $derived(
		tweet.text.replace(/^@madebyhex(?:\s+|[,:.-]\s*)/i, "").trim(),
	);
</script>

<div
	class={cn(
		"inset-shadow relative w-[min(24rem,calc(100vw-3.5rem))] flex-none overflow-hidden rounded-lg bg-background-inset p-1.5",
		className,
	)}
>
	<article class="h-full rounded-md bg-background p-4 card">
		<div class="flex items-start justify-between gap-3">
			<div class="flex min-w-0 items-center gap-2">
				<div
					class="size-9 shrink-0 overflow-hidden rounded-full border border-border"
				>
					<img
						src={tweet.user.profile_image_url_https}
						alt={`${tweet.user.name} avatar`}
						class="size-full object-cover"
						loading="lazy"
						decoding="async"
						width="36"
						height="36"
					/>
				</div>
				<div class="grid min-w-0 gap-0.5">
					<div class="flex min-w-0 items-center gap-1">
						<p
							class="truncate text-base leading-none font-medium text-foreground"
						>
							{tweet.user.name}
						</p>
						{#if tweet.user.is_blue_verified || tweet.user.verified}
							<CheckmarkFilled
								class="size-4 shrink-0 text-[#1d9bf0]"
								aria-label="Verified account"
							/>
						{/if}
					</div>
					<p class="truncate text-xs leading-none text-foreground-muted">
						@{tweet.user.screen_name}
					</p>
				</div>
			</div>

			<a
				href={tweetUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="View on X"
				class="shrink-0 text-foreground-muted transition-colors duration-150 ease-out hover:text-foreground"
			>
				<LogoX size={16} />
			</a>
		</div>

		<p class="mt-3 text-base font-normal tracking-normal text-foreground-muted">
			{sanitizedText}
		</p>
	</article>
</div>
