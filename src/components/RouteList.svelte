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
        updateLocalStorage();
    }

    function clearAll() {
        todoList = [];
        updateLocalStorage();
    }

    function toggleStatus(index) {
        todoList[index].status = !todoList[index].status;
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
        <!-- SVG for Plus Icon -->
    </button>
</div>

<div class="mt-12 grid grid-cols-2 gap-y-6 gap-x-6 w-full items-center">
    {#each todoList as item, index}
        <div class="flex items-center justify-between border border-gray-300 rounded-md p-3">
            <input bind:checked={item.status} type="checkbox" on:change={() => toggleStatus(index)} />
            <span class="text-lg font-medium text-center" class:checked={item.status ? 'checked' : ''}>{item.text}</span>
            <button on:click={() => removeFromList(index)}>
                <!-- SVG for X Icon -->
            </button>
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
