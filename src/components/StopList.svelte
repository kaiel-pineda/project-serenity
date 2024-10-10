<script lang="ts">
	import { onMount } from "svelte";
	import ItemExpanded from "./ItemExpanded.svelte";
	import ItemInput from "./ItemInput.svelte";
	import { isPickups } from "../stores/pickupsStore";

	interface StopItem {
		id: number;
		text: string;
		status: boolean;
		isEditing: boolean;
		note?: string;
	}

	let stopList: StopItem[] = [];
	let rearrangedList: StopItem[] = [];

	onMount(() => {
		if (typeof window !== "undefined") {
			const savedList = localStorage.getItem("stopList");
			if (savedList) {
				stopList = JSON.parse(savedList).map((item: StopItem) => ({
					...item,
					isEditing: false,
				}));
			}
			updateDisplayList();
		}
	});

	function rearrangeItemsForColumns(items: StopItem[], columns: number): StopItem[] {
		const columnItems = Array.from({ length: columns }, () => []);
		items.forEach((item, index) => {
			columnItems[index % columns].push(item);
		});
		return columnItems.flat();
	}

	function updateDisplayList() {
		rearrangedList = rearrangeItemsForColumns(stopList, 2);
	}

	function updateLocalStorage() {
		if (typeof window !== "undefined") {
			localStorage.setItem("stopList", JSON.stringify(stopList));
		}
	}

	function removeFromList(itemId: number) {
		stopList = stopList.filter((item) => item.id !== itemId);
		updateLocalStorage();
		updateDisplayList();
	}

	function updateItem(itemId: number, updatedFields: Partial<StopItem>) {
		stopList = stopList.map((item) =>
			item.id === itemId ? { ...item, ...updatedFields } : item
		);
		updateLocalStorage();
		updateDisplayList();
	}

	function saveNoteForItem(itemId: number, note: string) {
		updateItem(itemId, { note });
	}

	function toggleStatus(itemId: number) {
		const item = stopList.find((item) => item.id === itemId);
		if (item) {
			updateItem(itemId, { status: !item.status });
		}
	}

	function toggleEdit(itemId: number) {
		const item = stopList.find((item) => item.id === itemId);
		if (item) {
			updateItem(itemId, { isEditing: !item.isEditing });
		}
	}

	function editItem(itemId: number, newText: string) {
		updateItem(itemId, { text: newText, isEditing: false });
	}

	function clearAll() {
		stopList = [];
		updateLocalStorage();
		updateDisplayList();
	}

	function getStopLabel(count: number, isPickups: boolean) {
		if (isPickups) {
			if (count === 0) return "No Pick-ups";
			if (count === 1) return "1 Pick-up";
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

	function handleAddItem(event) {
		const { text } = event.detail;

		stopList = [
			...stopList,
			{ id: Date.now(), text, status: false, isEditing: false },
		];
		updateLocalStorage();
		updateDisplayList();
	}
</script>

<main class="flex flex-col gap-y-6 h-full w-full">
	<div class="flex flex-col gap-y-6 flex-1">
		<header>
			<div class="container mx-auto px-6">
				<div class="flex items-center justify-between gap-x-3">
					<span class="text-lg font-medium">
						{getStopLabel(stopList.length, $isPickups)}
					</span>
					<div class="justify-end">
						<button
							class="rounded-full bg-old-gold-500 py-3 px-4 font-medium text-white text-base/normal"
							on:click={clearAll}
						>
							Clear All
						</button>
					</div>
				</div>
			</div>
		</header>

		<section>
			<div class="container mx-auto px-6">
				<div class="columns-2 gap-x-6">
					{#each rearrangedList as item (item.id)}
						<div
							class="relative break-inside-avoid mb-6 break-words max-w-full flex flex-col gap-y-3 justify-between rounded-lg {item.status ? 'bg-outer-space-200' : 'bg-outer-space-50'} text-black p-3 w-full"
						>
							<ItemExpanded
								class="absolute inset-0 z-10"
								{item}
								on:saveNotes={(e) =>
									saveNoteForItem(item.id, e.detail.note)
								}
							/>
							{#if item.isEditing}
								<input
									id={"input-" + item.id}
									class="p-3 text-center text-lg/normal font-medium bg-transparent w-full z-20"
									type="text"
									bind:value={item.text}
									on:blur={() => editItem(item.id, item.text)}
									on:keydown={(e) => {
										if (e.key === "Enter")
											editItem(item.id, item.text);
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
										if (
											e.key === "Enter" ||
											e.key === " "
										) {
											e.preventDefault();
											toggleEdit(item.id);
										}
									}}
								>
									{item.text}
								</span>
							{/if}
							<div class="flex items-center justify-between gap-x-3 w-full">
								<button
									type="button"
									on:click={() => toggleStatus(item.id)}
									class="z-20 size-6 flex items-center justify-center rounded-full border transition-all duration-200 {item.status ? 'bg-blue-500 border-blue-500' : 'border-outer-space-500 bg-transparent'}"
									aria-pressed={item.status}
								>
									{#if item.status}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="size-4 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									{/if}
								</button>
								{#if item.note && item.note.trim() !== ""}
									<div>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="size-4 fill-old-gold-700"
											viewBox="0 0 16 16"
										>
											<path
												d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293z"
											/>
										</svg>
									</div>
								{/if}
								<button
									class="z-20"
									on:click={() => removeFromList(item.id)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke-width="1"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-6 stroke-outer-space-500"
									>
										<path
											d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
										/>
										<line
											x1="18"
											y1="9"
											x2="12"
											y2="15"
										/>
										<line
											x1="12"
											y1="9"
											x2="18"
											y2="15"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</div>

	<ItemInput on:addItem={handleAddItem} />
</main>
