<script lang="ts">
	import { CubeIcon } from "@hugeicons/core-free-icons";
	import AppHugeIcon, { type AppHugeIconProps } from "./AppHugeIcon.svelte";

	let props: AppHugeIconProps = $props();
</script>

<AppHugeIcon icon={CubeIcon} {...props} />
