<script lang="ts">
    let locations = ['550 Building', 'Beverly Hills', 'Desert', 'GIA', 'Out of Area', 'Streets', 'Valley];
    let selectedLocation = '';

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

    // Initialize selectedLocation from local storage or default
    $: {
        selectedLocation = storage.getItem("savedLocation") || locations[0];
    }

    // Update local storage whenever selectedLocation changes
    $: {
        if (selectedLocation) {
            storage.setItem('savedLocation', selectedLocation);
        }
    }

    // You can also handle changes directly in the select's onchange event if preferred
    function handleLocationChange() {
        storage.setItem('savedLocation', selectedLocation);
    }
</script>

<header class="bg-[#343a40] p-3 mb-6">
    <div class="container mx-auto px-6">
        <div class="flex items-center gap-x-6">
            <div class="h-14 w-14 flex items-center justify-center">
                <img src="https://raw.githubusercontent.com/kaiel-pineda/project-serenity/main/public/assets/logo.png" alt="Malca-Amit logo." />
            </div>
            <select bind:value={selectedLocation} on:change={handleLocationChange} class="text-white font-medium text-xl bg-transparent min-w-[12rem]">
                {#each locations as location}
                    <option value={location}>{location}</option>
                {/each}
            </select>
        </div>
    </div>
</header>
