<script lang="ts">
	import { onMount } from "svelte";

	const locations: string[] = ["550 Building", "Beverly Hills", "Desert", "GIA", "Out of Area", "Streets", "Valley"];

	let selectedLocation: string = locations[0];

	let isMounted = false;

	onMount(() => {
		isMounted = true;
		const savedLocation = localStorage.getItem("savedLocation");
		if (savedLocation && locations.includes(savedLocation)) {
			selectedLocation = savedLocation;
		}
	});

	$: if (isMounted) {
		localStorage.setItem("savedLocation", selectedLocation);
	}
</script>

<header class="bg-transparent py-3">
	<div class="container mx-auto px-6">
		<div class="flex items-center gap-x-6">
			<div class="flex h-14 w-14 items-center justify-center">
				<svg class="size-12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M1 7.19l6.64 6.64h.72L15 7.19v-.72l-3.32-3.32-.36-.15H4.68l-.36.15L1 6.47v.72z" fill="#ceb202" />
					<path fill-rule="evenodd" clip-rule="evenodd" d="M8 12.75L2.08 6.83 4.89 4h6.22l2.81 2.83L8 12.75zm0-7.73h2.69l1.81 1.81-4.5 4.4V5.02z" fill="#ffffff" />
				</svg>
			</div>
			<select bind:value={selectedLocation} class="min-w-[12rem] bg-transparent text-lg font-semibold text-black">
				{#each locations as location}
					<option class="text-black" value={location}>{location}</option>
				{/each}
			</select>
		</div>
	</div>
</header>
