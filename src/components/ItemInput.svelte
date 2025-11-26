<script lang="ts">
    import ScreenshotButton from './ScreenshotButton.svelte';
    import { version } from '../version.ts';

    export let onAddItem: (payload: { text: string }) => void = () => {};

    let newItem = '';
    let showInput = true;

    function addToList() {
        const trimmedItem = newItem.trim();
        if (!trimmedItem) return;

        onAddItem({ text: trimmedItem });
        newItem = '';
    }

    function toggleInputVisibility() {
        showInput = !showInput;
    }
</script>

<footer class={`sticky bottom-0 z-30 transition-colors duration-200 ease-in-out ${showInput ? 'bg-white' : 'bg-transparent'}`}>
    <div class="container mx-auto px-6">
        <div class="flex flex-col justify-center my-6 relative">
            <div class="flex w-full items-center justify-between gap-x-6">
                <div class={showInput ? 'flex w-full items-center justify-between overflow-hidden rounded-full bg-fuscous-gray-500 p-3 transition-[width] duration-200 ease-in-out' : 'relative w-24 rounded-full bg-fuscous-gray-500 px-12 py-7 font-semibold text-fuscous-gray-50 transition-all duration-200 ease-in-out hover:bg-fuscous-gray-600 active:bg-fuscous-gray-700'}>
                    <button class={showInput ? 'mr-3 rounded-full bg-fuscous-gray-600 px-3 py-1 text-base/normal font-semibold text-fuscous-gray-50 transition-all duration-200 ease-[cubic-bezier(0.25,0.8,0.5,1)] cursor-pointer hover:bg-fuscous-gray-700 active:bg-fuscous-gray-800' : 'absolute inset-0 cursor-pointer'} on:click={toggleInputVisibility}>
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
                            class="ml-3 w-full bg-transparent text-lg/normal font-normal text-fuscous-gray-50 outline-none transition-opacity duration-200 ease-[cubic-bezier(0.25,0.8,0.5,1)] placeholder:text-fuscous-gray-100 focus:placeholder:text-fuscous-gray-200"
                            bind:value={newItem}
                            type="text"
                            placeholder="Create a stop"
                            on:keydown={(e) => {
                                if (e.key === 'Enter') addToList();
                            }} />

                        <button type="button" class="flex items-center justify-center rounded-full bg-fuscous-gray-600 p-1 transition-all duration-200 ease-in-out cursor-pointer hover:bg-fuscous-gray-700 active:bg-fuscous-gray-800" on:click={addToList} aria-label="Add stop">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 stroke-fuscous-gray-50" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                            </svg>
                        </button>
                    {/if}
                </div>

                {#if !showInput}
                    <ScreenshotButton class="flex items-center justify-center rounded-full bg-old-gold-500 p-4 transition-all duration-200 ease-in-out cursor-pointer hover:bg-old-gold-600 active:bg-old-gold-700" targetSelector="#capture-target">
                        <svg xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </ScreenshotButton>
                {/if}
            </div>

            {#if showInput}
                <div class="absolute -bottom-6 -translate-x-1/2 left-1/2">
                    <span class="text-xs/none text-neutral-400 font-medium">
                        {version}
                    </span>
                </div>
            {/if}
        </div>
    </div>
</footer>
