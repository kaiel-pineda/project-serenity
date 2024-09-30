<script lang="ts">
    import { onMount } from 'svelte';

    const locations: string[] = ['550 Building', 'Beverly Hills', 'Desert', 'GIA', 'Out of Area', 'Streets', 'Valley'];

    let selectedLocation: string = locations[0];

    let isMounted = false;

    onMount(() => {
        isMounted = true;
        const savedLocation = localStorage.getItem('savedLocation');
        if (savedLocation && locations.includes(savedLocation)) {
            selectedLocation = savedLocation;
        }
    });

    $: if (isMounted) {
        localStorage.setItem('savedLocation', selectedLocation);
    }
</script>

<header class="mb-6 bg-[#343a40] py-3">
    <div class="container mx-auto px-6">
        <div class="flex items-center gap-x-6">
            <div class="flex h-14 w-14 items-center justify-center">
                <img src="https://raw.githubusercontent.com/kaiel-pineda/project-serenity/main/public/assets/logo.png" alt="Malca-Amit logo." />
            </div>
            <select bind:value={selectedLocation} class="min-w-[12rem] bg-transparent text-lg font-normal text-white">
                {#each locations as location}
                    <option class="text-black" value={location}>{location}</option>
                {/each}
            </select>
        </div>
    </div>
</header>
