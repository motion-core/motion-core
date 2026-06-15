<script lang="ts">
	import { Menu01Icon } from "@hugeicons/core-free-icons";
	import AppHugeIcon, { type AppHugeIconProps } from "./AppHugeIcon.svelte";

	let props: AppHugeIconProps = $props();
</script>

<AppHugeIcon icon={Menu01Icon} {...props} />
