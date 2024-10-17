<script lang="ts">
	import { onMount } from "svelte";
	import StopItem from "./StopItem.svelte";
	import ItemInput from "./ItemInput.svelte";
	import { addToast } from "./ToastNotification.svelte";
	import { isPickups } from "../stores/pickupsStore";

	interface StopItemData {
		id: number;
		text: string;
		status: boolean;
		isEditing: boolean;
		note?: string;
		originalText?: string;
	}

	let pickupList: StopItemData[] = [];
	let deliveryList: StopItemData[] = [];

	let rearrangedPickupList = { left: [], right: [] };
	let rearrangedDeliveryList = { left: [], right: [] };

	$: currentList = $isPickups ? pickupList : deliveryList;
	$: rearrangedCurrentList = $isPickups ? rearrangedPickupList : rearrangedDeliveryList;

	onMount(() => {
		const savedPickupList = localStorage.getItem("pickupList");
		if (savedPickupList) {
			pickupList = JSON.parse(savedPickupList).map((item: StopItemData) => ({
				...item,
				isEditing: false,
			}));
		}

		const savedDeliveryList = localStorage.getItem("deliveryList");
		if (savedDeliveryList) {
			deliveryList = JSON.parse(savedDeliveryList).map((item: StopItemData) => ({
				...item,
				isEditing: false,
			}));
		}

		updateDisplayLists();
	});

	function rearrangeItemsForColumns(items: StopItemData[]) {
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

	function updateDisplayLists() {
		rearrangedPickupList = rearrangeItemsForColumns(pickupList);
		rearrangedDeliveryList = rearrangeItemsForColumns(deliveryList);
	}

	function updateLocalStorage() {
		localStorage.setItem("pickupList", JSON.stringify(pickupList));
		localStorage.setItem("deliveryList", JSON.stringify(deliveryList));
	}

	function getCurrentList() {
		return $isPickups ? pickupList : deliveryList;
	}

	function updateCurrentList(updatedList: StopItemData[]) {
		if ($isPickups) {
			pickupList = updatedList;
		} else {
			deliveryList = updatedList;
		}
		updateLocalStorage();
		updateDisplayLists();
	}

	function removeFromList(itemId: number) {
		const currentList = getCurrentList();
		const updatedList = currentList.filter((item) => item.id !== itemId);
		const removedItem = currentList.find((item) => item.id === itemId);

		if (removedItem) {
			addToast({
				data: {
					title: "Stop Removed",
					description: `"${removedItem.text}" has been successfully removed.`,
					background: "bg-puerto-rico-500",
				},
			});
		}

		updateCurrentList(updatedList);
	}

	function toggleStatus(itemId: number) {
		const item = getCurrentList().find((item) => item.id === itemId);
		if (item) {
			updateItem(itemId, { status: !item.status });
		}
	}

	function toggleEdit(itemId: number) {
		const item = getCurrentList().find((item) => item.id === itemId);
		if (item) {
			updateItem(itemId, { isEditing: !item.isEditing, originalText: item.text });
		}
	}

	function updateItem(itemId: number, updatedFields: Partial<StopItemData>) {
		const updatedList = getCurrentList().map((item) => (item.id === itemId ? { ...item, ...updatedFields } : item));
		updateCurrentList(updatedList);
	}

	function editItem(itemId: number, newText: string) {
		const trimmedText = newText.trim();
		const currentList = getCurrentList();
		const item = currentList.find((item) => item.id === itemId);

		if (!item) return;

		const isDuplicate = currentList.some((otherItem) => otherItem.text.toLowerCase() === trimmedText.toLowerCase() && otherItem.id !== itemId);

		if (isDuplicate) {
			addToast({
				data: {
					title: "Input Warning",
					description: `"${trimmedText}" already exists.`,
					background: "bg-brandy-punch-500",
				},
			});

			updateItem(itemId, { text: item.originalText });
			return;
		}

		updateItem(itemId, { text: trimmedText, isEditing: false });
	}

	function clearAll() {
		updateCurrentList([]);
	}

	function getStopLabel(count: number, isPickups: boolean) {
		if (isPickups) {
			if (count === 0) return "No Pick-Ups";
			if (count === 1) return "1 Pick-Up";
			return `${count} Pick-Ups`;
		} else {
			if (count === 0) return "No Deliveries";
			if (count === 1) return "1 Delivery";
			return `${count} Deliveries`;
		}
	}

	export function focusInput(node: HTMLInputElement) {
		requestAnimationFrame(() => {
			node.focus();
			node.select();
		});
	}

	function handleAddItem(event: CustomEvent<{ text: string }>) {
		const { text } = event.detail;
		const currentList = getCurrentList();

		const isDuplicate = currentList.some((item) => item.text.toLowerCase() === text.toLowerCase());

		if (isDuplicate) {
			addToast({
				data: {
					title: "Input Warning",
					description: `"${text}" already exists.`,
					background: "bg-brandy-punch-500",
				},
			});
			return;
		}

		const newItem: StopItemData = {
			id: Date.now(),
			text,
			status: false,
			isEditing: false,
		};

		updateCurrentList([...currentList, newItem]);
	}
</script>

<main class="flex flex-col gap-y-6 h-full w-full">
	<div class="flex flex-col gap-y-6 flex-1">
		<header>
			<div class="container mx-auto px-6">
				<div class="flex items-center justify-between gap-x-3">
					<span class="text-lg font-medium py-3">
						{getStopLabel(currentList.length, $isPickups)}
					</span>
					{#if currentList.length > 0}
						<button class="rounded-full bg-old-gold-500 py-3 px-4 font-semibold text-white" on:click={clearAll}>Clear List</button>
					{/if}
				</div>
			</div>
		</header>

		<section class="container mx-auto px-6 flex-1">
			<div class="grid grid-cols-2 gap-x-6">
				{#each ["left", "right"] as column}
					<div class="flex flex-col gap-y-6">
						{#each rearrangedCurrentList[column] as item (item.id)}
							<StopItem {item} onEdit={() => toggleEdit(item.id)} onToggleStatus={() => toggleStatus(item.id)} onSaveNote={(note) => updateItem(item.id, { note })} onDelete={() => removeFromList(item.id)} onEditItem={(newText) => editItem(item.id, newText)} />
						{/each}
					</div>
				{/each}
			</div>
		</section>

		<ItemInput on:addItem={handleAddItem} />
	</div>
</main>
