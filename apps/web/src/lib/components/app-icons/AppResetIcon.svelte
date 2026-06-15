<script lang="ts">
	import { Refresh01Icon } from "@hugeicons/core-free-icons";
	import AppHugeIcon, { type AppHugeIconProps } from "./AppHugeIcon.svelte";

	let props: AppHugeIconProps = $props();
</script>

<AppHugeIcon icon={Refresh01Icon} {...props} />
