<script lang="ts">
	import type { TweetData } from "$lib/features/tweets/server/fetch-tweet";
	import TweetCard from "./TweetCard.svelte";

	type Props = {
		title: string;
		items: TweetData[];
	};

	type MarqueeColumnConfig = {
		direction: "up" | "down";
		duration: number;
	};

	let { title, items }: Props = $props();

	const marqueeColumns: MarqueeColumnConfig[] = [
		{ direction: "up", duration: 34 },
		{ direction: "down", duration: 42 },
		{ direction: "up", duration: 38 },
	];
	const marqueeCopyCount = 6;
	const marqueeStep = `${100 / marqueeCopyCount}%`;
	const marqueeCopies = Array.from(
		{ length: marqueeCopyCount },
		(_, index) => index,
	);

	function getColumnItems(columnIndex: number): TweetData[] {
		return items.filter(
			(_, index) => index % marqueeColumns.length === columnIndex,
		);
	}

	function ensureMinimumItems(
		columnItems: TweetData[],
		minimum = 4,
	): TweetData[] {
		const sourceItems = columnItems.length > 0 ? columnItems : items;

		if (sourceItems.length === 0) return [];

		const result = [...sourceItems];
		let cursor = 0;

		while (result.length < minimum) {
			result.push(sourceItems[cursor % sourceItems.length]);
			cursor += 1;
		}

		if (sourceItems.length > 1 && result[0] === result[result.length - 1]) {
			result.push(sourceItems[cursor % sourceItems.length]);
		}

		return result;
	}

	const columns = $derived(
		marqueeColumns.map((config, index) => {
			const columnItems = ensureMinimumItems(getColumnItems(index));

			return {
				...config,
				items: columnItems,
			};
		}),
	);
	const mobileColumn = $derived({
		direction: "up" as const,
		duration: 44,
		items: ensureMinimumItems(items, 6),
	});
</script>

{#if items.length > 0}
	<section
		aria-labelledby="testimonials-heading"
		class="relative z-10 w-full overflow-hidden px-4 sm:px-6 lg:px-8"
	>
		<div class="mx-auto grid max-w-6xl gap-8">
			<div class="grid max-w-2xl">
				<h2
					id="testimonials-heading"
					class="text-3xl font-medium tracking-tight text-balance text-foreground sm:text-4xl"
				>
					{title}
				</h2>
			</div>

			<div class="relative overflow-hidden">
				<div
					class="absolute inset-x-1 top-0 z-10 h-10 bg-linear-to-b from-background-inset to-transparent"
				></div>
				<div
					class="absolute inset-x-1 bottom-0 z-10 h-10 bg-linear-to-t from-background-inset to-transparent"
				></div>

				<div class="grid h-168 grid-cols-1 gap-3 overflow-hidden md:hidden">
					<div class="marquee-column">
						<div
							class="marquee-track marquee-up"
							style={`--marquee-duration: ${mobileColumn.duration}s; --marquee-step: ${marqueeStep};`}
						>
							{#each marqueeCopies as copyIndex (`mobile-copy-${copyIndex}`)}
								<div
									class="marquee-set"
									aria-hidden={copyIndex > 0 ? "true" : undefined}
								>
									{#each mobileColumn.items as tweet, index (`mobile-${copyIndex}-${tweet.id_str}-${index}`)}
										<TweetCard {tweet} class="w-full" />
									{/each}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="hidden h-168 grid-cols-3 gap-3 overflow-hidden md:grid">
					{#each columns as column, columnIndex (`column-${columnIndex}`)}
						<div class="marquee-column">
							<div
								class="marquee-track"
								class:marquee-up={column.direction === "up"}
								class:marquee-down={column.direction === "down"}
								style={`--marquee-duration: ${column.duration}s; --marquee-step: ${marqueeStep};`}
							>
								{#each marqueeCopies as copyIndex (`${columnIndex}-copy-${copyIndex}`)}
									<div
										class="marquee-set"
										aria-hidden={copyIndex > 0 ? "true" : undefined}
									>
										{#each column.items as tweet, index (`${columnIndex}-${copyIndex}-${tweet.id_str}-${index}`)}
											<TweetCard {tweet} class="w-full" />
										{/each}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.marquee-column {
		min-width: 0;
		overflow: hidden;
	}

	.marquee-track {
		--marquee-gap: 1rem;
		--marquee-duration: 38s;
		--marquee-step: 16.666667%;
		display: flex;
		flex-direction: column;
		will-change: transform;
		animation-duration: var(--marquee-duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	.marquee-set {
		display: flex;
		flex-direction: column;
		gap: var(--marquee-gap);
		padding-bottom: var(--marquee-gap);
	}

	.marquee-up {
		animation-name: marquee-up;
	}

	.marquee-down {
		animation-name: marquee-down;
	}

	@keyframes marquee-up {
		from {
			transform: translateY(0);
		}

		to {
			transform: translateY(calc(var(--marquee-step) * -1));
		}
	}

	@keyframes marquee-down {
		from {
			transform: translateY(calc(var(--marquee-step) * -1));
		}

		to {
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
	}
</style>
