<script lang="ts">
    import ItemExpanded from './ItemExpanded.svelte';
    import DeletionConfirmation from './DeletionConfirmation.svelte';
    import type { StopItemData } from '../types/types';

    export let item: StopItemData;
    export let onEdit: () => void;
    export let onToggleStatus: () => void;
    export let onSaveNote: (note: string) => void;
    export let onDelete: () => void;
    export let onEditItem: (newText: string) => void;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onEdit();
        }
    }

    function focusInput(node: HTMLInputElement) {
        requestAnimationFrame(() => {
            node.focus();
            node.select();
        });
    }
</script>

<div class="relative flex max-w-full break-inside-avoid flex-col justify-between gap-y-3 break-words rounded-lg {item.status ? 'bg-outer-space-200' : 'bg-outer-space-50'} w-full p-3 text-black">
    <button class="absolute inset-0 z-10" on:click={onToggleStatus} aria-pressed={item.status} />

    {#if item.isEditing}
        <input
            id={'input-' + item.id}
            class="z-20 w-full bg-transparent p-3 text-center text-lg font-medium"
            type="text"
            bind:value={item.text}
            on:blur={() => onEditItem(item.text)}
            on:keydown={(e) => {
                if (e.key === 'Enter') onEditItem(item.text);
            }}
            use:focusInput />
    {:else}
        <span class="z-20 p-3 text-center text-lg font-medium {item.status ? 'line-through' : ''}" on:click={onEdit} role="button" tabindex="0" on:keydown={handleKeydown}>
            {item.text}
        </span>
    {/if}

    <div class="flex w-full items-center justify-between gap-x-3">
        <ItemExpanded class="z-20" {item} on:saveNotes={(e) => onSaveNote(e.detail.note)} />

        {#if item.note && item.note.trim() !== ''}
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 fill-old-gold-700" viewBox="0 0 16 16">
                    <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293z" />
                </svg>
            </div>
        {/if}

        <DeletionConfirmation {item} on:confirmDelete={onDelete} />
    </div>
</div>
