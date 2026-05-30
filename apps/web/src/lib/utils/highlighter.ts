import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";

import typescript from "shiki/langs/typescript.mjs";
import svelte from "shiki/langs/svelte.mjs";
import xml from "shiki/langs/xml.mjs";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";
import wgsl from "shiki/langs/wgsl.mjs";

let highlighter: ReturnType<typeof createHighlighterCoreSync> | null = null;

export function getHighlighter() {
	if (!highlighter) {
		highlighter = createHighlighterCoreSync({
			themes: [githubLight, githubDark],
			langs: [typescript, svelte, xml, bash, json, wgsl],
			engine: createJavaScriptRegexEngine(),
		});
	}
	return highlighter;
}
