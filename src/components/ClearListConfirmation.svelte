<script lang="ts">
	import { createDialog } from "@melt-ui/svelte";
	import { fade, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	export let itemCount: number;
	export let isPickups: boolean;
	export let onConfirmClear: () => void = () => {};

	const {
		elements: { trigger, overlay, content, close, portalled },
		states: { open },
	} = createDialog({
		forceVisible: true,
	});

	function handleClear() {
		onConfirmClear();
	}

	$: itemType = isPickups ? (itemCount === 1 ? "pick-up" : "pick-ups") : itemCount === 1 ? "delivery" : "deliveries";
</script>

<button class="rounded-full bg-old-gold-500 px-4 py-3 cursor-pointer" {...$trigger} use:trigger>
	<span class="text-base/normal font-semibold text-white">Clear List</span>
</button>

{#if $open}
	<div {...$portalled} use:portalled>
		<div class="fixed inset-0 z-50 bg-black/50 cursor-pointer" {...$overlay} use:overlay transition:fade={{ duration: 200, easing: quintOut }}></div>

		<div class="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 transform" {...$content} use:content transition:scale={{ duration: 250, easing: quintOut, start: 0.9 }}>
			<div class="w-full px-6">
				<div class="flex flex-col rounded-xl bg-outer-space-100 p-6 shadow-xl">
					<div class="mx-auto mb-4 mt-6 flex max-w-sm flex-col gap-y-2 whitespace-normal wrap-break-word text-center">
						<p class="text-base/normal font-normal">Clear the entire list?</p>
						<span class="text-lg/normal font-medium">
							This will remove {itemCount}
							{itemType}
						</span>
					</div>

					<div class="flex items-center justify-end gap-x-6">
						<button class="mt-6 text-base/normal font-semibold text-outer-space-900 cursor-pointer" {...$close} use:close>Cancel</button>

						<button class="mt-6 text-base/normal font-semibold text-outer-space-900 cursor-pointer" on:click|stopPropagation={handleClear}>Clear List</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
