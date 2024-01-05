<script>
	let newItem = "";
	let todoList = [];

	if (typeof window !== "undefined") {
		const savedList = localStorage.getItem("todoList");
		todoList = savedList ? JSON.parse(savedList) : [];
	}

	function addToList() {
		todoList = [...todoList, { id: new Date().getTime(), text: newItem, status: false }];
		newItem = "";
		updateLocalStorage();
	}

	function removeFromList(itemId) {
		todoList = todoList.filter((item) => item.id !== itemId);
		updateLocalStorage();
		checkCurrentPage();
	}

	function updateItemStatus(paginatedIndex, status) {
		const actualIndex = (currentPage - 1) * itemsPerPage + paginatedIndex;
		todoList[actualIndex].status = status;
		updateLocalStorage();
	}

	function clearAll() {
		todoList = [];
		updateLocalStorage();
	}

	function updateLocalStorage() {
		if (typeof window !== "undefined") {
			localStorage.setItem("todoList", JSON.stringify(todoList));
		}
	}

	function checkCurrentPage() {
		totalPages = Math.ceil(todoList.length / itemsPerPage);
		currentPage = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
	}

	let showInput = true;
	let currentPage = 1;
	const itemsPerPage = 12;
	let totalPages = Math.ceil(todoList.length / itemsPerPage);

	$: paginatedList = todoList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	$: totalPages = Math.ceil(todoList.length / itemsPerPage);

	function toggleInputVisibility() {
		showInput = !showInput;
	}
</script>

<section class="container mx-auto px-6">
	<div class="flex flex-col gap-y-6">
			{#if showInput}
				<div class="relative">
					<input class="border-2 border-black rounded-md h-20 w-full p-4 text-xl" bind:value={newItem} type="text" placeholder="Create stop" />
					<button class="absolute right-0 h-full bg-[#505050] rounded-tr-md rounded-br-md p-6" on:click={addToList}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="fill-white h-6 w-6" viewBox="0 0 16 16">
							<path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
						</svg>
					</button>
				</div>
			{/if}

<div class="flex items-center justify-between gap-x-3">
<span class="text-lg font-medium">{todoList.length} stops</span>
<button class="p-3 border border-gray-200 rounded-md bg-neutral-100" on:click={toggleInputVisibility}>{showInput ? "Hide" : "Show"}</button>
</div>

		<div class="grid grid-cols-2 gap-y-6 gap-x-6 w-full items-center">
			{#each paginatedList as item, paginatedIndex (paginatedIndex)}
				<div class="flex flex-col border border-gray-300 rounded-md">
					<span class="text-base font-medium text-center p-2" class:checked={item.status}>{item.text}</span>
					<div class="flex items-center justify-between border-t rounded-b-md border-gray-300 p-2 bg-neutral-100">
						<input bind:checked={item.status} type="checkbox" on:change={() => updateItemStatus(paginatedIndex, item.status)} />
						<button on:click={() => removeFromList(item.id)}>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
								<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination-controls flex items-center justify-center gap-4 mt-4">
				<button class="p-3 border border-gray-200 rounded-md bg-neutral-100" disabled={currentPage === 1} on:click={() => (currentPage = Math.max(1, currentPage - 1))}> Previous </button>
				<span>{currentPage} of {totalPages}</span>
				<button class="p-3 border border-gray-200 rounded-md bg-neutral-100" disabled={currentPage === totalPages} on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}> Next </button>
			</div>
		{/if}

		<div class="flex w-full justify-end mb-6">
			<button class="bg-[#ceb202] rounded-md p-3 text-white font-semibold" on:click={clearAll}>Clear All</button>
		</div>
	</div>
</section>

<style>
	.checked {
		text-decoration: line-through;
	}
</style>
