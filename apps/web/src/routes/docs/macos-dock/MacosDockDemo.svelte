<script lang="ts">
	import { MacosDock } from "motion-core";
	import type { ComponentProps } from "svelte";

	type Props = Partial<ComponentProps<typeof MacosDock>>;

	const items = [
		{
			src: "/images/logos/logo-notion.png",
			alt: "Notion",
			label: "Notion",
			href: "#",
		},
		{
			src: "/images/logos/logo-asana.png",
			alt: "Asana",
			label: "Asana",
			href: "#",
		},
		{
			src: "/images/logos/logo-slack.png",
			alt: "Slack",
			label: "Slack",
			href: "#",
		},
		{
			src: "/images/logos/logo-loom.png",
			alt: "Loom",
			label: "Loom",
			href: "#",
		},
		{
			src: "/images/logos/logo-spotify.png",
			alt: "Spotify",
			label: "Spotify",
			href: "#",
		},
		{
			src: "/images/logos/logo-illustrator.png",
			alt: "Adobe Illustrator",
			label: "Adobe Illustrator",
			href: "#",
		},
		{
			src: "/images/logos/logo-figma.png",
			alt: "Figma",
			label: "Figma",
			href: "#",
		},
		{
			src: "/images/logos/logo-photoshop.png",
			alt: "Adobe Photoshop",
			label: "Adobe Photoshop",
			href: "#",
		},
		{
			src: "/images/logos/logo-premiere.png",
			alt: "Premiere Pro",
			label: "Premiere Pro",
			href: "#",
		},
	];

	let { baseWidth = 4, magnification = 1.5, distance = 3 }: Props = $props();
</script>

<div
	class="relative flex h-full min-h-96 w-full items-center justify-center overflow-hidden"
>
	<div class="absolute bottom-0">
		<MacosDock {items} {baseWidth} {magnification} {distance} />
	</div>
</div>
