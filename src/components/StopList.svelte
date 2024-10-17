<script lang="ts">
	import { onMount } from "svelte";
	import ItemExpanded from "./ItemExpanded.svelte";
	import ItemInput from "./ItemInput.svelte";
	import DeletionConfirmation from "./DeletionConfirmation.svelte";
	import { addToast } from "./ToastNotification.svelte";
	import { isPickups } from "../stores/pickupsStore";

	interface StopItem {
		id: number;
		text: string;
		status: boolean;
		isEditing: boolean;
		note?: string;
		originalText?: string;
	}

	let pickupList: Array<StopItem> = [];
	let deliveryList: Array<StopItem> = [];

	let rearrangedPickupList: { left: StopItem[]; right: StopItem[] } = { left: [], right: [] };
	let rearrangedDeliveryList: { left: StopItem[]; right: StopItem[] } = { left: [], right: [] };

	$: currentList = $isPickups ? pickupList : deliveryList;
	$: rearrangedCurrentList = $isPickups ? rearrangedPickupList : rearrangedDeliveryList;

	onMount(() => {
		if (typeof window !== "undefined") {
			const savedPickupList = localStorage.getItem("pickupList");
			if (savedPickupList) {
				pickupList = JSON.parse(savedPickupList).map((item: StopItem) => ({
					...item,
					isEditing: false,
				}));
			}

			const savedDeliveryList = localStorage.getItem("deliveryList");
			if (savedDeliveryList) {
				deliveryList = JSON.parse(savedDeliveryList).map((item: StopItem) => ({
					...item,
					isEditing: false,
				}));
			}

			updateDisplayLists();
		}
	});

	function rearrangeItemsForColumns(items: StopItem[]): { left: StopItem[]; right: StopItem[] } {
		const leftColumn: StopItem[] = [];
		const rightColumn: StopItem[] = [];

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
		if (typeof window !== "undefined") {
			localStorage.setItem("pickupList", JSON.stringify(pickupList));
			localStorage.setItem("deliveryList", JSON.stringify(deliveryList));
		}
	}

	function removeFromList(itemId: number) {
		const item = currentList.find((item) => item.id === itemId);

		if (!item) return;

		if ($isPickups) {
			pickupList = pickupList.filter((item) => item.id !== itemId);
		} else {
			deliveryList = deliveryList.filter((item) => item.id !== itemId);
		}

		addToast({
			data: {
				title: "Stop Removed",
				description: `"${item.text}" has been successfully removed.`,
				background: "bg-puerto-rico-500",
			},
		});

		updateLocalStorage();
		updateDisplayLists();
	}

	function updateItem(itemId: number, updatedFields: Partial<StopItem>) {
		if ($isPickups) {
			pickupList = pickupList.map((item) => (item.id === itemId ? { ...item, ...updatedFields } : item));
		} else {
			deliveryList = deliveryList.map((item) => (item.id === itemId ? { ...item, ...updatedFields } : item));
		}
		updateLocalStorage();
		updateDisplayLists();
	}

	function saveNoteForItem(itemId: number, note: string) {
		updateItem(itemId, { note });
	}

	function toggleStatus(itemId: number) {
		const item = currentList.find((item) => item.id === itemId);
		if (item) {
			updateItem(itemId, { status: !item.status });
		}
	}

	function toggleEdit(itemId: number) {
		const item = currentList.find((item) => item.id === itemId);
		if (item) {
			updateItem(itemId, { isEditing: !item.isEditing, originalText: item.text });
		}
	}

	function editItem(itemId: number, newText: string) {
		const trimmedText = newText.trim();
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
		if ($isPickups) {
			pickupList = [];
		} else {
			deliveryList = [];
		}
		updateLocalStorage();
		updateDisplayLists();
	}

	function getStopLabel(count: number, isPickups: boolean) {
		if (isPickups) {
			if (count === 0) return "No Pick-Ups";
			if (count === 1) return "1 Pick-Up";
			return `${count} Pick-ups`;
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

		const newItem = {
			id: Date.now(),
			text,
			status: false,
			isEditing: false,
		};

		if ($isPickups) {
			pickupList = [...pickupList, newItem];
		} else {
			deliveryList = [...deliveryList, newItem];
		}
		updateLocalStorage();
		updateDisplayLists();
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
						<div class="justify-end">
							<button class="rounded-full bg-old-gold-500 py-3 px-4 font-semibold text-white text-base/normal" on:click={clearAll}>Clear List</button>
						</div>
					{/if}
				</div>
			</div>
		</header>

		<section>
			<div class="container mx-auto px-6">
				<div class="grid grid-cols-2 justify-between gap-x-6">
					<div class="flex flex-col gap-y-6">
						{#each rearrangedCurrentList.left as item (item.id)}
							<div class="relative break-inside-avoid break-words max-w-full flex flex-col gap-y-3 justify-between rounded-lg {item.status ? 'bg-outer-space-200' : 'bg-outer-space-50'} text-black p-3 w-full">
								<ItemExpanded class="absolute inset-0 z-10" {item} on:saveNotes={(e) => saveNoteForItem(item.id, e.detail.note)} />
								{#if item.isEditing}
									<input
										id={"input-" + item.id}
										class="p-3 text-center text-lg/normal font-medium bg-transparent w-full z-20"
										type="text"
										bind:value={item.text}
										on:blur={() => editItem(item.id, item.text)}
										on:keydown={(e) => {
											if (e.key === "Enter") editItem(item.id, item.text);
										}}
										use:focusInput
									/>
								{:else}
									<span
										class="p-3 text-center text-lg/normal font-medium z-20 {item.status ? 'line-through' : ''}"
										on:click={() => toggleEdit(item.id)}
										role="button"
										tabindex="0"
										on:keydown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												toggleEdit(item.id);
											}
										}}
									>
										{item.text}
									</span>
								{/if}
								<div class="flex items-center justify-between gap-x-3 w-full">
									<button type="button" on:click={() => toggleStatus(item.id)} class="z-20 size-6 flex items-center justify-center rounded-full border transition-all duration-200 {item.status ? 'bg-blue-500 border-blue-500' : 'border-outer-space-500 bg-transparent'}" aria-pressed={item.status}>
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
									<DeletionConfirmation {item} on:confirmDelete={(e) => removeFromList(e.detail.id)} />
								</div>
							</div>
						{/each}
					</div>

					<div class="flex flex-col gap-y-6">
						{#each rearrangedCurrentList.right as item (item.id)}
							<div class="relative break-inside-avoid break-words max-w-full flex flex-col gap-y-3 justify-between rounded-lg {item.status ? 'bg-outer-space-200' : 'bg-outer-space-50'} text-black p-3 w-full">
								<ItemExpanded class="absolute inset-0 z-10" {item} on:saveNotes={(e) => saveNoteForItem(item.id, e.detail.note)} />
								{#if item.isEditing}
									<input
										id={"input-" + item.id}
										class="p-3 text-center text-lg/normal font-medium bg-transparent w-full z-20"
										type="text"
										bind:value={item.text}
										on:blur={() => editItem(item.id, item.text)}
										on:keydown={(e) => {
											if (e.key === "Enter") editItem(item.id, item.text);
										}}
										use:focusInput
									/>
								{:else}
									<span
										class="p-3 text-center text-lg/normal font-medium z-20 {item.status ? 'line-through' : ''}"
										on:click={() => toggleEdit(item.id)}
										role="button"
										tabindex="0"
										on:keydown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												toggleEdit(item.id);
											}
										}}
									>
										{item.text}
									</span>
								{/if}
								<div class="flex items-center justify-between gap-x-3 w-full">
									<button type="button" on:click={() => toggleStatus(item.id)} class="z-20 size-6 flex items-center justify-center rounded-full border transition-all duration-200 {item.status ? 'bg-blue-500 border-blue-500' : 'border-outer-space-500 bg-transparent'}" aria-pressed={item.status}>
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
									<DeletionConfirmation {item} on:confirmDelete={(e) => removeFromList(e.detail.id)} />
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>
	</div>

	<ItemInput on:addItem={handleAddItem} />
</main>
