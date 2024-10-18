<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { createDialog } from '@melt-ui/svelte';
    import { fade, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    interface StopItem {
        id: number;
        text: string;
    }

    export let item: StopItem;

    const dispatch = createEventDispatcher();

    const {
        elements: { trigger: itemDialogTrigger, overlay: itemDialogOverlay, content: itemDialogContent, close: itemDialogClose, portalled: itemDialogPortalled },
        states: { open: isItemDialogOpen },
    } = createDialog({
        forceVisible: true,
    });

    function handleDeletion() {
        dispatch('confirmDelete', { id: item.id });
    }
</script>

<button class="z-20" {...itemDialogTrigger} use:itemDialogTrigger>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="size-6 stroke-outer-space-500">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
        <line x1="18" y1="9" x2="12" y2="15" />
        <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
</button>

{#if $isItemDialogOpen}
    <div {...$itemDialogPortalled} use:itemDialogPortalled>
        <div class="fixed inset-0 z-50 bg-black/50" {...$itemDialogOverlay} use:itemDialogOverlay transition:fade={{ duration: 200, easing: quintOut }} />

        <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-screen-lg -translate-x-1/2 -translate-y-1/2 transform" {...$itemDialogContent} use:itemDialogContent transition:scale={{ duration: 250, easing: quintOut, start: 0.9 }}>
            <div class="w-full px-6">
                <div class="flex flex-col rounded-xl bg-outer-space-100 p-6 shadow-xl">
                    <div class="mx-auto mb-3 mt-6 flex max-w-sm flex-col gap-y-3 whitespace-normal break-words text-center">
                        <p class="text-base/normal font-normal">Remove this stop from the list?</p>
                        <span class="text-lg/normal font-medium">{item.text}</span>
                    </div>

                    <div class="flex items-center justify-end gap-x-6">
                        <button class="mt-6 text-base/normal font-semibold text-outer-space-900" {...$itemDialogClose} use:itemDialogClose>Cancel</button>
                        <button class="mt-6 text-base/normal font-semibold text-outer-space-900" on:click|stopPropagation={handleDeletion}>Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
