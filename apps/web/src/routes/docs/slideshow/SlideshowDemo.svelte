<script lang="ts">
	import { Slideshow } from "motion-core";

	const images = [
		{
			src: "/images/photos/sample-image-1.webp",
			alt: "Alt 1",
		},
		{
			src: "/images/photos/sample-image-2.webp",
			alt: "Alt 2",
		},
		{
			src: "/images/photos/sample-image-3.webp",
			alt: "Alt 3",
		},
	];
</script>

<Slideshow class="h-full min-h-96 w-full" {images} />
