import type { DocItem } from "../types/doc";
import { resolveTocSelector } from "$lib/config/docs-ui";
import { docsNavigation } from "$lib/config/navigation";
import GithubSlugger from "github-slugger";

export type DocTocHeading = {
	id: string;
	text: string;
	level: number;
};

const flattenNavigationToManifest = (
	items: DocItem[],
	parentCategory?: string,
): DocItem[] => {
	const manifest: DocItem[] = [];

	for (const item of items) {
		const effectiveCategory = item.category ?? parentCategory;

		if (item.items?.length) {
			const childCategory = effectiveCategory ?? item.name;
			manifest.push(...flattenNavigationToManifest(item.items, childCategory));
			continue;
		}

		manifest.push({
			slug: item.slug,
			name: item.name,
			category: effectiveCategory,
		});
	}

	return manifest;
};

export const docsManifest: DocItem[] =
	flattenNavigationToManifest(docsNavigation);

const docRawModules = import.meta.glob<string>(
	"/src/routes/docs/**/+page.svx",
	{
		query: "?raw",
		eager: true,
		import: "default",
	},
);

export const getDocBySlug = (slug: string) => {
	return docsManifest.find((doc) => doc.slug === slug);
};

export const getDocHref = (slug: string) => {
	return slug ? `/docs/${slug}` : "/docs";
};

export const getAdjacentDocs = (slug: string) => {
	const index = docsManifest.findIndex((doc) => doc.slug === slug);
	if (index === -1) {
		return { previous: null, next: null };
	}
	const previous = index > 0 ? docsManifest[index - 1] : null;
	const next = index < docsManifest.length - 1 ? docsManifest[index + 1] : null;
	return { previous, next };
};

export function getDocTocHeadings(slug: string): DocTocHeading[] {
	const normalizedSlug = slug || "index";
	const rawSource =
		docRawModules[`/src/routes/docs/${normalizedSlug}/+page.svx`];
	if (!rawSource) return [];

	return extractTocHeadings(
		stripFrontmatter(rawSource),
		resolveTocSelector(slug),
	);
}

function stripFrontmatter(source: string) {
	return source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
}

function extractHeadingLevels(selector: string) {
	const levels = new Set<number>();
	const headingRe = /\bh([1-6])\b/gi;
	let match: RegExpExecArray | null;

	while ((match = headingRe.exec(selector))) {
		levels.add(Number(match[1]));
	}

	return levels.size > 0 ? levels : new Set([2, 3]);
}

function decodeHtmlEntities(value: string) {
	const namedEntities: Record<string, string> = {
		amp: "&",
		lt: "<",
		gt: ">",
		quot: '"',
		apos: "'",
	};

	return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, raw: string) => {
		if (raw.startsWith("#")) {
			const radix = raw[1].toLowerCase() === "x" ? 16 : 10;
			const codePoint = Number.parseInt(raw.slice(radix === 16 ? 2 : 1), radix);
			return Number.isFinite(codePoint)
				? String.fromCodePoint(codePoint)
				: entity;
		}

		return namedEntities[raw.toLowerCase()] ?? entity;
	});
}

function normalizeHeadingText(rawText: string) {
	return decodeHtmlEntities(
		rawText
			.replace(/\s+#+\s*$/g, "")
			.replace(/\\([\\`*_[\]{}()#+.!|-])/g, "$1")
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/`([^`]*)`/g, "$1")
			.replace(/<[^>]+>/g, "")
			.replace(/\{([^{}]*)\}/g, "$1")
			.replace(/[*_~]/g, "")
			.replace(/\s+/g, " ")
			.trim(),
	);
}

function extractTocHeadings(source: string, selector: string): DocTocHeading[] {
	const levels = extractHeadingLevels(selector);
	const slugger = new GithubSlugger();
	const headings: DocTocHeading[] = [];
	let inFence = false;

	for (const line of source.split(/\r?\n/)) {
		if (/^\s*(```|~~~)/.test(line)) {
			inFence = !inFence;
			continue;
		}

		if (inFence) continue;

		const match = /^( {0,3})(#{1,6})\s+(.+?)\s*$/.exec(line);
		if (!match) continue;

		const level = match[2].length;
		if (!levels.has(level)) continue;

		const text = normalizeHeadingText(match[3]);
		if (!text) continue;

		headings.push({
			id: slugger.slug(text),
			text,
			level,
		});
	}

	return headings;
}
