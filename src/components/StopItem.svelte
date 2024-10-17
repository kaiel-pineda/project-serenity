<script lang="ts">
	import ItemExpanded from "./ItemExpanded.svelte";
	import DeletionConfirmation from "./DeletionConfirmation.svelte";

	export let item: StopItemData;
	export let onEdit: () => void;
	export let onToggleStatus: () => void;
	export let onSaveNote: (note: string) => void;
	export let onDelete: () => void;
	export let onEditItem: (newText: string) => void;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
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

<div class="relative break-inside-avoid break-words max-w-full flex flex-col gap-y-3 justify-between rounded-lg {item.status ? 'bg-outer-space-200' : 'bg-outer-space-50'} text-black p-3 w-full">
	<ItemExpanded class="absolute inset-0 z-10" {item} on:saveNotes={(e) => onSaveNote(e.detail.note)} />

	{#if item.isEditing}
		<input
			id={"input-" + item.id}
			class="p-3 text-center text-lg font-medium bg-transparent w-full z-20"
			type="text"
			bind:value={item.text}
			on:blur={() => onEditItem(item.text)}
			on:keydown={(e) => {
				if (e.key === "Enter") onEditItem(item.text);
			}}
			use:focusInput
		/>
	{:else}
		<span class="p-3 text-center text-lg font-medium z-20 {item.status ? 'line-through' : ''}" on:click={onEdit} role="button" tabindex="0" on:keydown={handleKeydown}>
			{item.text}
		</span>
	{/if}

	<div class="flex items-center justify-between gap-x-3 w-full">
		<button type="button" on:click={onToggleStatus} class="z-20 size-6 flex items-center justify-center rounded-full border transition-all duration-200 {item.status ? 'bg-blue-500 border-blue-500' : 'border-outer-space-500 bg-transparent'}" aria-pressed={item.status}>
			{#if item.status}
				<svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			{/if}
		</button>

		{#if item.note && item.note.trim() !== ""}
			<div>
				<svg xmlns="http://www.w3.org/2000/svg" class="size-4 fill-old-gold-700" viewBox="0 0 16 16">
					<path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293z" />
				</svg>
			</div>
		{/if}

		<DeletionConfirmation {item} on:confirmDelete={onDelete} />
	</div>
</div>
