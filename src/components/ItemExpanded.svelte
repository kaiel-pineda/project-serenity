<script lang="ts">
	import { createDialog } from "@melt-ui/svelte";
	import { fade, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import ScreenshotButton from "./ScreenshotButton.svelte";

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

	export let onSaveNotes: (payload: { note?: string }) => void = () => {};

	const {
		elements: { trigger: itemDialogTrigger, overlay: itemDialogOverlay, content: itemDialogContent, close: itemDialogClose, portalled: itemDialogPortalled },
		states: { open: isItemDialogOpen },
	} = createDialog({
		forceVisible: true,
	});

	function handleSave() {
		onSaveNotes({ note: item.note });
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

<button type="button" class={`cursor-pointer ${className}`} {...itemDialogTrigger} use:itemDialogTrigger aria-label="Open notes dialog">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="size-6 stroke-outer-space-500">
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<line x1="12" y1="8" x2="12" y2="16" />
		<line x1="8" y1="12" x2="16" y2="12" />
	</svg>
</button>

{#if $isItemDialogOpen}
	<div {...$itemDialogPortalled} use:itemDialogPortalled>
		<div class="fixed inset-0 z-50 bg-black/50 cursor-pointer" {...$itemDialogOverlay} use:itemDialogOverlay transition:fade={{ duration: 200, easing: quintOut }}></div>

		<div class="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 transform" {...$itemDialogContent} use:itemDialogContent transition:scale={{ duration: 250, easing: quintOut, start: 0.9 }}>
			<div class="w-full px-6" id="capture-modal">
				<div class="flex flex-col rounded-xl bg-outer-space-100 p-6 shadow-xl">
					<span class="mb-6 whitespace-normal wrap-break-word text-center text-base/normal font-medium">
						{item.text}
					</span>

					<textarea class="rounded-md border border-outer-space-300 bg-transparent p-3 text-outer-space-800 placeholder:text-outer-space-600" placeholder="Enter additional notes for this stop." bind:value={item.note} use:autoResizeTextarea></textarea>

					<div class="flex items-center justify-between mt-6">
						<div class="flex items-center">
							<ScreenshotButton class="flex items-center justify-center rounded-full p-3 bg-outer-space-200 cursor-pointer" targetSelector="#capture-modal">
								<svg xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-6 stroke-outer-space-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
									<circle cx="12" cy="13" r="4" />
								</svg>
							</ScreenshotButton>
						</div>

						<div class="flex gap-x-6">
							<button class="text-base/normal font-semibold text-outer-space-900 bg-transparent border-transparent cursor-pointer" {...$itemDialogClose} use:itemDialogClose>Cancel</button>

							<button class="text-base/normal font-semibold text-outer-space-900 bg-transparent border-transparent cursor-pointer" {...$itemDialogClose} use:itemDialogClose on:click|stopPropagation={handleSave}>Save</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
