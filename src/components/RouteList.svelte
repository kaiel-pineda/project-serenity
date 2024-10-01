<script lang="ts">
	import { onMount } from "svelte";

	interface StopItem {
		id: number;
		text: string;
		status: boolean;
		isEditing: boolean;
	}

	let newItem = "";
	let stopList: StopItem[] = [];
	let paginatedList: StopItem[] = [];

	let currentPage = 1;
	const itemsPerPage = 12;
	let totalPages = 1;

	onMount(() => {
		const savedList = localStorage.getItem("stopList");
		if (savedList) {
			stopList = JSON.parse(savedList).map((item: StopItem) => ({
				...item,
				isEditing: false,
			}));
			totalPages = Math.ceil(stopList.length / itemsPerPage) || 1;
			updatePaginatedList();
		}
	});

	function addToList(): void {
		const trimmedItem = newItem.trim();
		if (trimmedItem) {
			const newStop: StopItem = {
				id: Date.now(),
				text: trimmedItem,
				status: false,
				isEditing: false,
			};
			stopList = [...stopList, newStop];
			newItem = "";
			updateLocalStorage();
			totalPages = Math.ceil(stopList.length / itemsPerPage) || 1;
			goToPage(totalPages);
		}
	}

	function removeFromList(itemId: number): void {
		stopList = stopList.filter((item) => item.id !== itemId);
		updateLocalStorage();
		totalPages = Math.ceil(stopList.length / itemsPerPage) || 1;
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
		updatePaginatedList();
	}

	// Refactored function to update item status directly
	function updateItemStatus(itemId: number, status: boolean): void {
		const item = stopList.find((item) => item.id === itemId);
		if (item) {
			item.status = status;
			stopList = stopList; // Trigger reactivity
			updateLocalStorage();
		}
	}

	// Refactored function to toggle edit mode directly
	function toggleEdit(itemId: number): void {
		const item = stopList.find((item) => item.id === itemId);
		if (item) {
			item.isEditing = !item.isEditing;
			stopList = stopList; // Trigger reactivity
			updatePaginatedList();
		}
	}

	// Refactored function to edit item text directly
	function editItem(itemId: number, newText: string): void {
		const item = stopList.find((item) => item.id === itemId);
		if (item) {
			item.text = newText;
			item.isEditing = false;
			stopList = stopList; // Trigger reactivity
			updateLocalStorage();
			updatePaginatedList();
		}
	}

	function clearAll(): void {
		stopList = [];
		updateLocalStorage();
		totalPages = 1;
		currentPage = 1;
		updatePaginatedList();
	}

	function updateLocalStorage(): void {
		localStorage.setItem("stopList", JSON.stringify(stopList));
	}

	function updatePaginatedList(): void {
		paginatedList = stopList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	}

	function goToPage(page: number): void {
		currentPage = page;
		updatePaginatedList();
	}

	let showInput = true;

	function toggleInputVisibility(): void {
		showInput = !showInput;
	}

	function getStopLabel(count: number): string {
		if (count === 0) return "No Stops";
		if (count === 1) return "1 Stop";
		return `${count} Stops`;
	}
</script>

<main class="flex flex-col gap-y-6 mt-6 h-full w-full">
	<div class="flex flex-col gap-y-6 flex-1">
		<header>
			<div class="container mx-auto px-6">
				<div class="flex items-center justify-between gap-x-3">
					<span class="text-xl/normal font-semibold">{getStopLabel(stopList.length)}</span>

					<div class="justify-end">
						<button class="rounded-full bg-[#ceb202] py-3 px-4 font-medium text-white text-base/normal" on:click={clearAll}>Clear All</button>
					</div>
				</div>
			</div>
		</header>

		<section>
			<div class="container mx-auto px-6">
				<div class="columns-2 gap-x-6">
					{#each paginatedList as item (item.id)}
						<div class="break-inside-avoid mb-6 overflow-hidden break-words *:max-w-full flex flex-col rounded-lg bg-outer-space-50 text-black">
							{#if item.isEditing}
								<input
									class="p-3 text-center text-lg font-medium bg-transparent"
									type="text"
									bind:value={item.text}
									on:blur={() => editItem(item.id, item.text)}
									on:keydown={(e) => {
										if (e.key === "Enter") editItem(item.id, item.text);
									}}
								/>
							{:else}
								<span
									class="p-3 text-center text-lg font-medium {item.status ? 'line-through' : ''}"
									on:click={(e) => {
										e.stopPropagation();
										toggleEdit(item.id);
									}}
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
							<div class="flex items-center justify-between rounded-b-lg bg-outer-space-50 p-3">
								<input
									type="checkbox"
									bind:checked={item.status}
									on:change={() => {
										updateItemStatus(item.id, item.status);
										updatePaginatedList();
									}}
								/>

								<button on:click={() => removeFromList(item.id)}>
									<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="size-4" viewBox="0 0 16 16">
										<path
											d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 
                     0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 
                     0 0 1-.708.708L8 
                     8.707l-5.146 5.147a.5.5 
                     0 0 1-.708-.708L7.293 8z"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>

				{#if totalPages > 1}
					<div class="pagination-controls mt-6 flex items-center justify-center gap-6">
						<button class="rounded-full bg-outer-space-500 text-outer-space-100 py-3 px-6" disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}> Previous </button>
						<span>{currentPage} of {totalPages}</span>
						<button class="rounded-full bg-outer-space-500 text-outer-space-100 py-3 px-6" disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}> Next </button>
					</div>
				{/if}
			</div>
		</section>
	</div>

	<footer class={showInput ? "sticky bottom-0 bg-white" : "sticky bottom-0 bg-transparent"}>
		<div class="container mx-auto px-6">
			<div class="flex flex-col justify-center mb-6">
				<div class="flex justify-between items-center w-full gap-x-6">
					<div class={showInput ? "flex items-center justify-between w-full rounded-full bg-[#505050] p-3 transition-[width] duration-200" : "relative py-7 px-12 rounded-full bg-neutral-500 text-neutral-300 transition-[width] duration-200 w-24"}>
						<button class={showInput ? "mr-3 py-1 px-3 rounded-full bg-neutral-500 text-neutral-300" : "absolute inset-0"} on:click={toggleInputVisibility}>
							{showInput ? "Hide" : "Show"}
						</button>

						{#if showInput}
							<input
								class="bg-transparent w-full outline-none placeholder:text-neutral-300 text-neutral-100 text-base/normal font-medium ml-3"
								bind:value={newItem}
								type="text"
								placeholder="Create a stop here"
								on:keydown={(e) => {
									if (e.key === "Enter") addToList();
								}}
							/>

							<button class="flex item-center justify-center bg-neutral-500 p-1 rounded-full" on:click={addToList}>
								<svg xmlns="http://www.w3.org/2000/svg" class="size-6 stroke-neutral-300" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="12" y1="19" x2="12" y2="5" />
									<polyline points="5 12 12 5 19 12" />
								</svg>
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</footer>
</main>