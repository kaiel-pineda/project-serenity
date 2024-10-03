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
	let showInput = true;

	onMount(() => {
		if (typeof window !== "undefined") {
			const savedList = localStorage.getItem("stopList");
			if (savedList) {
				stopList = JSON.parse(savedList).map((item: StopItem) => ({ ...item, isEditing: false }));
				updatePagination();
			}
		}
	});

	function updatePagination() {
		totalPages = Math.ceil(stopList.length / itemsPerPage) || 1;
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
		updatePaginatedList();
	}

	function updatePaginatedList() {
		const start = (currentPage - 1) * itemsPerPage;
		const end = currentPage * itemsPerPage;
		paginatedList = stopList.slice(start, end);
	}

	function updateLocalStorage() {
		if (typeof window !== "undefined") {
			localStorage.setItem("stopList", JSON.stringify(stopList));
		}
	}

	function addToList() {
		const trimmedItem = newItem.trim();
		if (!trimmedItem) return;

		stopList = [...stopList, { id: Date.now(), text: trimmedItem, status: false, isEditing: false }];
		newItem = "";
		updateLocalStorage();
		updatePagination();
		goToPage(totalPages);
	}

	function removeFromList(itemId: number) {
		stopList = stopList.filter((item) => item.id !== itemId);
		updateLocalStorage();
		updatePagination();
	}

	function updateItem(itemId: number, updatedFields: Partial<StopItem>) {
		stopList = stopList.map((item) => (item.id === itemId ? { ...item, ...updatedFields } : item));
		updateLocalStorage();
		updatePaginatedList();
	}

	function toggleStatus(itemId: number) {
		updateItem(itemId, { status: !stopList.find((item) => item.id === itemId)?.status });
	}

	function toggleEdit(itemId: number) {
		updateItem(itemId, { isEditing: !stopList.find((item) => item.id === itemId)?.isEditing });
	}

	function editItem(itemId: number, newText: string) {
		updateItem(itemId, { text: newText, isEditing: false });
	}

	function clearAll() {
		stopList = [];
		updateLocalStorage();
		currentPage = 1;
		updatePagination();
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			updatePaginatedList();
		}
	}

	function toggleInputVisibility() {
		showInput = !showInput;
	}

	function getStopLabel(count: number) {
		if (count === 0) return "No Stops";
		if (count === 1) return "1 Stop";
		return `${count} Stops`;
	}

	export function focusInput(node: HTMLInputElement) {
		requestAnimationFrame(() => {
			node.focus();
			node.select();
		});
	}
</script>

<main class="flex flex-col gap-y-6 mt-6 h-full w-full">
	<div class="flex flex-col gap-y-6 flex-1">
		<header>
			<div class="container mx-auto px-6">
				<div class="flex items-center justify-between gap-x-3">
					<span class="text-xl font-semibold">
						{getStopLabel(stopList.length)}
					</span>
					<div class="justify-end">
						<button class="rounded-full bg-[#ceb202] py-3 px-4 font-medium text-white text-base" on:click={clearAll}>Clear All</button>
					</div>
				</div>
			</div>
		</header>

		<section>
			<div class="container mx-auto px-6">
				<div class="columns-2 gap-x-6">
					{#each paginatedList as item (item.id)}
						<div class="break-inside-avoid mb-6 overflow-hidden break-words max-w-full flex flex-col gap-y-3 items-center justify-between rounded-lg {item.status ? 'bg-outer-space-200' : 'bg-outer-space-50'} text-black p-3">
							{#if item.isEditing}
								<input
									id={"input-" + item.id}
									class="p-3 text-center text-lg font-medium bg-transparent w-full"
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
									class="p-3 text-center text-lg font-medium {item.status ? 'line-through' : ''}"
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
								<button type="button" on:click={() => toggleStatus(item.id)} class="size-6 flex items-center justify-center rounded-full border transition-all duration-200 {item.status ? 'bg-blue-500 border-blue-500' : 'border-neutral-500 bg-transparent'}" aria-pressed={item.status}>
									{#if item.status}
										<svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
									{/if}
								</button>
								<button on:click={() => removeFromList(item.id)}>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="size-6 stroke-neutral-500">
										<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
										<line x1="18" y1="9" x2="12" y2="15" />
										<line x1="12" y1="9" x2="18" y2="15" />
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
								class="bg-transparent w-full outline-none placeholder:text-neutral-300 text-neutral-100 text-base font-medium ml-3"
								bind:value={newItem}
								type="text"
								placeholder="Create a stop"
								on:keydown={(e) => {
									if (e.key === "Enter") addToList();
								}}
							/>

							<button class="flex items-center justify-center bg-neutral-500 p-1 rounded-full" on:click={addToList}>
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
