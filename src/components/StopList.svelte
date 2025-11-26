<script lang="ts">
    import StopItem from './StopItem.svelte';
    import ItemInput from './ItemInput.svelte';
    import ClearListConfirmation from './ClearListConfirmation.svelte';
    import { addToast } from './ToastNotification.svelte';
    import { isPickups, currentList, remainingCount, listActions } from '../stores/store';
    import type { StopItemData, NewStopItem } from '../types/types';

    type RearrangedList = { left: StopItemData[]; right: StopItemData[] };
    type Column = 'left' | 'right';

    const columns: Column[] = ['left', 'right'];

    let rearrangedPickupList: RearrangedList = { left: [], right: [] };
    let rearrangedDeliveryList: RearrangedList = { left: [], right: [] };

    $: rearrangedCurrentList = $isPickups ? rearrangedPickupList : rearrangedDeliveryList;
    $: stopLabel = getStopLabel($currentList.length, $remainingCount, $isPickups);

    $: if ($isPickups) {
        rearrangedPickupList = rearrangeItemsForColumns($currentList);
    } else {
        rearrangedDeliveryList = rearrangeItemsForColumns($currentList);
    }

    function rearrangeItemsForColumns(items: StopItemData[]): RearrangedList {
        const leftColumn: StopItemData[] = [];
        const rightColumn: StopItemData[] = [];

        items.forEach((item, index) => {
            if (index % 2 === 0) {
                leftColumn.push(item);
            } else {
                rightColumn.push(item);
            }
        });

        return { left: leftColumn, right: rightColumn };
    }

    function removeFromList(itemId: number) {
        const removedItem = listActions.getItem(itemId);

        if (removedItem) {
            addToast({
                data: {
                    title: 'Stop Removed',
                    description: `"${removedItem.text}" has been successfully removed.`,
                    background: 'bg-puerto-rico-500',
                },
            });
        }

        listActions.removeItem(itemId);
    }

    function toggleStatus(itemId: number) {
        const item = listActions.getItem(itemId);
        if (item) {
            listActions.updateItem(itemId, { status: !item.status });
        }
    }

    function toggleEdit(itemId: number) {
        const item = listActions.getItem(itemId);
        if (item) {
            if (item.isEditing) {
                listActions.updateItem(itemId, { isEditing: false });
            } else {
                listActions.updateItem(itemId, { isEditing: true, originalText: item.text });
            }
        }
    }

    function editItem(itemId: number, newText: string) {
        const trimmedText = newText.trim();
        const item = listActions.getItem(itemId);

        if (!item) return;

        const isDuplicate = listActions.isDuplicate(trimmedText, itemId);

        if (isDuplicate) {
            addToast({
                data: {
                    title: 'Input Warning',
                    description: `"${trimmedText}" already exists.`,
                    background: 'bg-brandy-punch-500',
                },
            });

            if (item.isEditing && item.originalText) {
                listActions.updateItem(itemId, { text: item.originalText, isEditing: false });
            }
            return;
        }

        listActions.updateItem(itemId, { text: trimmedText, isEditing: false });
    }

    function clearAll() {
        listActions.clearCurrentList();

        addToast({
            data: {
                title: 'List Cleared',
                description: `The list was cleared successfully.`,
                background: 'bg-puerto-rico-500',
            },
        });
    }

    function getStopLabel(count: number, remaining: number, isPickups: boolean) {
        let label = '';
        if (isPickups) {
            if (count === 0) label = 'No Pick-Ups';
            else if (count === 1) label = '1 Pick-Up';
            else label = `${count} Pick-Ups`;
        } else {
            if (count === 0) label = 'No Deliveries';
            else if (count === 1) label = '1 Delivery';
            else label = `${count} Deliveries`;
        }
        return {
            label,
            remainingText: remaining > 0 ? `(${remaining} Remaining)` : '',
        };
    }

    function handleAddItem(payload: { text: string }) {
        const { text } = payload;

        const isDuplicate = listActions.isDuplicate(text);

        if (isDuplicate) {
            addToast({
                data: {
                    title: 'Input Warning',
                    description: `"${text}" already exists.`,
                    background: 'bg-brandy-punch-500',
                },
            });
            return;
        }

        const newItem: NewStopItem = {
            id: Date.now(),
            text,
            status: false,
            isEditing: false,
        };

        listActions.addItem(newItem);
    }
</script>

<main class="flex h-full w-full flex-col gap-y-6">
    <div class="flex flex-1 flex-col gap-y-6">
        <header>
            <div class="container mx-auto px-6">
                <div class="flex items-center justify-between gap-x-3">
                    <div class="flex items-center gap-x-3 py-3">
                        <span class="text-lg/normal font-medium text-fuscous-gray-900">
                            {stopLabel.label}
                        </span>
                        {#if stopLabel.remainingText}
                            <span class="text-base/normal text-fuscous-gray-500">
                                {stopLabel.remainingText}
                            </span>
                        {/if}
                    </div>
                    {#if $currentList.length > 0}
                        <ClearListConfirmation itemCount={$currentList.length} isPickups={$isPickups} onConfirmClear={clearAll} />
                    {/if}
                </div>
            </div>
        </header>

        <section class="container mx-auto flex-1 px-6">
            <div class="grid grid-cols-2 gap-x-6">
                {#each columns as column}
                    <div class="flex flex-col gap-y-6">
                        {#each rearrangedCurrentList[column] as item (item.id)}
                            <StopItem {item} onEdit={() => toggleEdit(item.id)} onToggleStatus={() => toggleStatus(item.id)} onSaveNote={(note) => listActions.updateItem(item.id, { note })} onDelete={() => removeFromList(item.id)} onEditItem={(newText) => editItem(item.id, newText)} />
                        {/each}
                    </div>
                {/each}
            </div>
        </section>

        <ItemInput onAddItem={handleAddItem} />
    </div>
</main>
