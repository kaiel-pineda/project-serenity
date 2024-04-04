<script lang="ts">
    let inputValue: string = "";
    let locations = ['550 Building', 'Beverly Hills', 'Desert', 'GIA', 'Out of Area', 'Streets', 'Valley', 'Custom'];
    let selectedLocation = '';
    let customLocation = '';

    interface SafeStorage {
        getItem(key: string): string | null;
        setItem(key: string, value: string): void;
    }

    function safeLocalStorage(): SafeStorage {
        if (typeof window !== "undefined") {
            return localStorage;
        }
        return {
            getItem: () => null,
            setItem: () => {},
        };
    }

    const storage: SafeStorage = safeLocalStorage();

    // Load saved data
    $: {
        const savedValue: string | null = storage.getItem("savedInput");
        if (savedValue) {
            inputValue = savedValue;
        }
        const savedLocation: string | null = storage.getItem("savedLocation");
        if (savedLocation) {
            selectedLocation = savedLocation;
        }
    }

    let contentEditable: HTMLSpanElement | null = null;

    function handleBlur(event: FocusEvent): void {
        const target = event.target as HTMLSpanElement;
        inputValue = target.textContent || "";
        storage.setItem("savedInput", inputValue);
    }

    // Logic to toggle custom location input
    $: showCustomInput = selectedLocation === 'Custom';
    $: if (showCustomInput && customLocation === '') {
        selectedLocation = '';
    } else if (showCustomInput) {
        storage.setItem('savedLocation', customLocation);
    }

    // Update the contentEditable text when inputValue changes
    $: {
        if (contentEditable && contentEditable.textContent !== inputValue) {
            contentEditable.textContent = inputValue;
        }
    }
</script>

<header class="bg-[#343a40] p-3 mb-6">
    <div class="container mx-auto px-6">
        <div class="flex items-center gap-x-6">
            <div class="h-14 w-14 flex items-center justify-center">
                <img src="https://raw.githubusercontent.com/kaiel-pineda/project-serenity/main/public/assets/logo.png" alt="Malca-Amit logo." />
            </div>
            <select bind:value={selectedLocation}>
                {#each locations as location}
                    <option value={location}>{location}</option>
                {/each}
            </select>
            {#if showCustomInput}
                <input type="text" bind:value={customLocation} placeholder="Enter custom location" />
            {/if}
            <span class="text-white font-medium text-xl bg-transparent min-w-[12rem]" contenteditable="true" bind:this={contentEditable} on:blur={handleBlur}></span>
        </div>
    </div>
</header>
