<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let newItem = '';
    let showInput = true;

    function addToList() {
        const trimmedItem = newItem.trim();
        if (!trimmedItem) return;

        dispatch('addItem', { text: trimmedItem });
        newItem = '';
    }

    function toggleInputVisibility() {
        showInput = !showInput;
    }
</script>

<footer class={`sticky bottom-0 z-30 transition-colors duration-200 ease-in-out ${showInput ? 'bg-white' : 'bg-transparent'}`}>
    <div class="container mx-auto px-6">
        <div class="mb-6 flex flex-col justify-center">
            <div class="flex w-full items-center justify-between gap-x-6">
                <div class={showInput ? 'flex w-full items-center justify-between overflow-hidden rounded-full bg-fuscous-gray-500 p-3 transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]' : 'relative w-24 rounded-full bg-fuscous-gray-500 px-12 py-7 font-semibold text-fuscous-gray-50 transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]'}>
                    <button class={showInput ? 'mr-3 rounded-full bg-fuscous-gray-600 px-3 py-1 text-base/normal font-semibold text-fuscous-gray-50 transition-all duration-100 ease-[cubic-bezier(0.25,0.8,0.5,1)]' : 'absolute inset-0'} on:click={toggleInputVisibility}>
                        {#key showInput}
                            {#if showInput}
                                <span class="transition-opacity">Hide</span>
                            {:else}
                                <span class="transition-opacity">Show</span>
                            {/if}
                        {/key}
                    </button>

                    {#if showInput}
                        <input
                            class="ml-3 w-full bg-transparent text-lg/normal font-normal text-fuscous-gray-50 outline-none transition-opacity duration-200 ease-[cubic-bezier(0.25,0.8,0.5,1)] placeholder:text-fuscous-gray-100"
                            bind:value={newItem}
                            type="text"
                            placeholder="Create a stop"
                            on:keydown={(e) => {
                                if (e.key === 'Enter') addToList();
                            }} />

                        <button class="flex items-center justify-center rounded-full bg-fuscous-gray-600 p-1 transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]" on:click={addToList}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 stroke-fuscous-gray-50" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
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
