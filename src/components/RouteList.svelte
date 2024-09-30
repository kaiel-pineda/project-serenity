<script lang="ts">
	import { onMount } from "svelte";

	// Define the structure of a stop item
	interface StopItem {
		id: number;
		text: string;
		status: boolean;
		isEditing: boolean;
	}

	let newItem = "";
	let stopList: StopItem[] = []; // Full list of stops
	let paginatedList: StopItem[] = []; // Stops to display on the current page

	// Pagination variables
	let currentPage = 1;
	const itemsPerPage = 12;
	let totalPages = 1;

	// Initialize stopList from localStorage on component mount
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

	// Function to add a new stop to the list
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
			goToPage(totalPages); // Go to the last page where the new item is added
		}
	}

	// Function to remove a stop from the list
	function removeFromList(itemId: number): void {
		stopList = stopList.filter((item) => item.id !== itemId);
		updateLocalStorage();
		totalPages = Math.ceil(stopList.length / itemsPerPage) || 1;
		// Adjust current page if necessary
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
		updatePaginatedList();
	}

	// Function to update the status of a stop
	function updateItemStatus(itemId: number, status: boolean): void {
		stopList = stopList.map((item) => (item.id === itemId ? { ...item, status } : item));
		updateLocalStorage();
	}

	// Function to toggle edit mode for a stop
	function toggleEdit(itemId: number): void {
		stopList = stopList.map((item) => (item.id === itemId ? { ...item, isEditing: !item.isEditing } : item));
		updatePaginatedList();
	}

	// Function to edit a stop's text
	function editItem(itemId: number, newText: string): void {
		stopList = stopList.map((item) => (item.id === itemId ? { ...item, text: newText, isEditing: false } : item));
		updateLocalStorage();
		updatePaginatedList();
	}

	// Function to clear all stops
	function clearAll(): void {
		stopList = [];
		updateLocalStorage();
		totalPages = 1;
		currentPage = 1;
		updatePaginatedList();
	}

	// Function to update localStorage with the current stopList
	function updateLocalStorage(): void {
		localStorage.setItem("stopList", JSON.stringify(stopList));
	}

	// Function to update the paginated list based on the current page
	function updatePaginatedList(): void {
		paginatedList = stopList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	}

	// Function to navigate to a specific page
	function goToPage(page: number): void {
		currentPage = page;
		updatePaginatedList();
	}

	// Toggle input visibility for adding new stops
	let showInput = true;

	function toggleInputVisibility(): void {
		showInput = !showInput;
	}

	// Function to get the appropriate label for the number of stops
	function getStopLabel(count: number): string {
		if (count === 0) return "No stops";
		if (count === 1) return "1 stop";
		return `${count} stops`;
	}
</script>

<section class="container mx-auto px-6">
	<div class="flex flex-col gap-y-6">
		{#if showInput}
			<div class="relative">
				<input
					class="h-20 w-full rounded-md border-2 border-[#505050] p-4 text-xl"
					bind:value={newItem}
					type="text"
					placeholder="Create stop"
					on:keydown={(e) => {
						if (e.key === "Enter") addToList();
					}}
				/>
				<button class="absolute right-0 h-full rounded-br-md rounded-tr-md bg-[#505050] p-6" on:click={addToList}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="h-6 w-6 fill-white" viewBox="0 0 16 16">
						<path
							fill-rule="evenodd"
							d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 
              0 0 1 0 1h-5v5a.5.5 
              0 0 1-1 0v-5h-5a.5.5 
              0 0 1 0-1h5v-5A.5.5 
              0 0 1 8 2"
						/>
					</svg>
				</button>
			</div>
		{/if}

		<div class="flex items-center justify-between gap-x-3">
			<span class="text-lg font-medium">{getStopLabel(stopList.length)}</span>
			<button class="rounded-md bg-[#505050] p-3 text-white" on:click={toggleInputVisibility}>
				{showInput ? "Hide" : "Show"}
			</button>
		</div>

		<!-- Stops List with Pagination -->
		<div class="grid w-full grid-cols-2 items-center gap-x-6 gap-y-6">
			{#each paginatedList as item (item.id)}
				<div class="flex flex-col rounded-md border border-gray-300">
					{#if item.isEditing}
						<input
							class="p-2 text-center text-base font-medium"
							type="text"
							bind:value={item.text}
							on:blur={() => editItem(item.id, item.text)}
							on:keydown={(e) => {
								if (e.key === "Enter") editItem(item.id, item.text);
							}}
						/>
					{:else}
						<span
							class="p-2 text-center text-base font-medium {item.status ? 'line-through' : ''}"
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
					<div class="flex items-center justify-between rounded-b-md border-t border-gray-300 bg-neutral-100 p-2">
						<input
							type="checkbox"
							checked={item.status}
							on:change={(e) => {
								const target = e.target;
								if (target instanceof HTMLInputElement) {
									updateItemStatus(item.id, target.checked);
									updatePaginatedList();
								}
							}}
						/>

						<button on:click={() => removeFromList(item.id)}>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
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

		<!-- Pagination Controls -->
		{#if totalPages > 1}
			<div class="pagination-controls mt-4 flex items-center justify-center gap-4">
				<button class="rounded-md border border-gray-200 bg-neutral-100 p-3" disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}> Previous </button>
				<span>{currentPage} of {totalPages}</span>
				<button class="rounded-md border border-gray-200 bg-neutral-100 p-3" disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}> Next </button>
			</div>
		{/if}

		<div class="mb-6 flex w-full justify-end">
			<button class="rounded-md bg-[#ceb202] p-3 font-semibold text-white" on:click={clearAll}> Clear All </button>
		</div>
	</div>
</section>
