<script>
	let newItem = "";

	// Initialize todoList with a default value or from localStorage
	let todoList = [];
	if (typeof window !== "undefined") {
		const savedList = localStorage.getItem("todoList");
		if (savedList) {
			todoList = JSON.parse(savedList);
		}
	}

	function addToList() {
		todoList = [...todoList, { text: newItem, status: false }];
		newItem = "";
		updateLocalStorage();
	}

	function removeFromList(index) {
		todoList.splice(index, 1);
		todoList = todoList;
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
</script>

<div class="mt-12 w-full relative">
	<input class="border-2 border-black rounded-md h-20 w-full p-4 text-xl" bind:value={newItem} type="text" placeholder="Create stop" />
	<button class="absolute right-0 h-full bg-[#505050] rounded-tr-md rounded-br-md p-6" on:click={addToList}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="fill-white h-6 w-6" viewBox="0 0 16 16">
			<path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
		</svg>
	</button>
</div>

<div class="mt-12 grid grid-cols-2 gap-y-6 gap-x-6 w-full items-center">
	{#each todoList as item, index}
		<div class="flex flex-col border border-gray-300 rounded-md">
			
			<span class="text-lg font-medium text-center p-2" class:checked={item.status}>{item.text}</span>
  <div class="flex items-center justify-between border-t border-gray-300 p-2 bg-gray-200">
  <input bind:checked={item.status} type="checkbox" />
			<button>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
					<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
				</svg>
			</button>
  </div>
		</div>

	{/each}
</div>

<div class="mt-12 flex w-full justify-end">
	<button class="bg-[#ceb202] rounded-md p-3 text-white font-semibold" on:click={clearAll}>Clear All</button>
</div>

<style>
	.checked {
		text-decoration: line-through;
	}
</style>
