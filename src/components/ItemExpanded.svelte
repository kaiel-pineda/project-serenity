<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { createDialog } from "@melt-ui/svelte";
	import { fade, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	interface StopItem {
		id: number;
		text: string;
		status: boolean;
		isEditing: boolean;
		note?: string;
	}

	export let item: StopItem;
	export let className = "";
	export { className as class };

	const dispatch = createEventDispatcher();

	const {
		elements: { trigger: itemDialogTrigger, overlay: itemDialogOverlay, content: itemDialogContent, close: itemDialogClose, portalled: itemDialogPortalled },
		states: { open: isItemDialogOpen },
	} = createDialog({
		forceVisible: true,
	});

	function handleSave() {
		dispatch("saveNotes", { note: item.note });
	}

	function autoResizeTextarea(node: HTMLTextAreaElement) {
		const maxHeight = 200;

		function resize() {
			node.style.height = "auto";
			const newHeight = Math.min(node.scrollHeight, maxHeight);
			node.style.height = `${newHeight}px`;
			if (newHeight >= maxHeight) {
				node.style.overflowY = "auto";
			} else {
				node.style.overflowY = "hidden";
			}
		}

		node.addEventListener("input", resize);
		resize();

		return {
			destroy() {
				node.removeEventListener("input", resize);
			},
		};
	}
</script>

<button class={className} {...itemDialogTrigger} use:itemDialogTrigger />

{#if $isItemDialogOpen}
	<div {...$itemDialogPortalled} use:itemDialogPortalled>
		<div class="fixed inset-0 z-50 bg-black/50" {...$itemDialogOverlay} use:itemDialogOverlay transition:fade={{ duration: 200, easing: quintOut }} />

		<div class="fixed left-1/2 top-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-screen-lg" {...$itemDialogContent} use:itemDialogContent transition:scale={{ duration: 250, easing: quintOut, start: 0.9 }}>
			<div class="w-full px-6">
				<div class="p-6 bg-outer-space-100 shadow-lg rounded-lg flex flex-col">
					<span class="mb-6 text-center font-medium break-words whitespace-normal">{item.text}</span>
					<textarea class="p-3 border border-outer-space-300 bg-transparent rounded-md placeholder:text-outer-space-600 text-outer-space-800" placeholder="Write additional notes for this item." bind:value={item.note} use:autoResizeTextarea />
					<div class="flex items-center justify-end">
						<button class="mt-6 text-base/normal font-semibold text-outer-space-900" {...$itemDialogClose} use:itemDialogClose on:click|stopPropagation={handleSave}>Save</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
