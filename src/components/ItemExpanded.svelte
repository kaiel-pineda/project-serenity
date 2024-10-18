<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { createDialog } from '@melt-ui/svelte';
    import { fade, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    interface StopItem {
        id: number;
        text: string;
        status: boolean;
        isEditing: boolean;
        note?: string;
    }

    export let item: StopItem;
    export let className = '';
    export { className as class };

    const dispatch = createEventDispatcher();

    const {
        elements: { trigger: itemDialogTrigger, overlay: itemDialogOverlay, content: itemDialogContent, close: itemDialogClose, portalled: itemDialogPortalled },
        states: { open: isItemDialogOpen },
    } = createDialog({
        forceVisible: true,
    });

    function handleSave() {
        dispatch('saveNotes', { note: item.note });
    }

    function autoResizeTextarea(node: HTMLTextAreaElement) {
        const maxHeight = 200;

        function resize() {
            node.style.height = 'auto';
            const newHeight = Math.min(node.scrollHeight, maxHeight);
            node.style.height = `${newHeight}px`;
            if (newHeight >= maxHeight) {
                node.style.overflowY = 'auto';
            } else {
                node.style.overflowY = 'hidden';
            }
        }

        node.addEventListener('input', resize);
        resize();

        return {
            destroy() {
                node.removeEventListener('input', resize);
            },
        };
    }
</script>

<button class={className} {...itemDialogTrigger} use:itemDialogTrigger>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="size-6 stroke-outer-space-500">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
</button>

{#if $isItemDialogOpen}
    <div {...$itemDialogPortalled} use:itemDialogPortalled>
        <div class="fixed inset-0 z-50 bg-black/50" {...$itemDialogOverlay} use:itemDialogOverlay transition:fade={{ duration: 200, easing: quintOut }} />

        <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-screen-lg -translate-x-1/2 -translate-y-1/2 transform" {...$itemDialogContent} use:itemDialogContent transition:scale={{ duration: 250, easing: quintOut, start: 0.9 }}>
            <div class="w-full px-6">
                <div class="flex flex-col rounded-xl bg-outer-space-100 p-6 shadow-xl">
                    <span class="mb-6 whitespace-normal break-words text-center text-base/normal font-medium">{item.text}</span>
                    <textarea class="rounded-md border border-outer-space-300 bg-transparent p-3 text-outer-space-800 placeholder:text-outer-space-600" placeholder="Enter additional notes for this stop." bind:value={item.note} use:autoResizeTextarea />
                    <div class="flex items-center justify-end gap-x-6">
                        <button class="mt-6 text-base/normal font-semibold text-outer-space-900" {...$itemDialogClose} use:itemDialogClose> Cancel </button>
                        <button class="mt-6 text-base/normal font-semibold text-outer-space-900" {...$itemDialogClose} use:itemDialogClose on:click|stopPropagation={handleSave}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
