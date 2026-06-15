<script lang="ts">
	import { TableIcon } from "@hugeicons/core-free-icons";
	import AppHugeIcon, { type AppHugeIconProps } from "./AppHugeIcon.svelte";

	let props: AppHugeIconProps = $props();
</script>

<AppHugeIcon icon={TableIcon} {...props} />
