<script lang="ts">
	import { KeyboardIcon } from "@hugeicons/core-free-icons";
	import AppHugeIcon, { type AppHugeIconProps } from "./AppHugeIcon.svelte";

	let props: AppHugeIconProps = $props();
</script>

<AppHugeIcon icon={KeyboardIcon} {...props} />
