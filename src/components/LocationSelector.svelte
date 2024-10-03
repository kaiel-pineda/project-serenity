<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { createDropdownMenu, createDialog } from "@melt-ui/svelte";
	import { fly, fade } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";

	const locations: string[] = ["550 Building", "Beverly Hills", "Desert", "GIA", "Out of Area", "Streets", "Valley"];
	let selectedLocation: string = locations[0];
	let isMobile = false;
	let mounted = false;

	const {
		elements: { trigger: dropdownTrigger, menu: dropdownMenu, item: dropdownItem, overlay: dropdownOverlay },
		states: { open: isDropdownOpen },
	} = createDropdownMenu({
		closeOnOutsideClick: true,
		forceVisible: true,
	});

	const {
		elements: { trigger: dialogTrigger, overlay: dialogOverlay, content: dialogContent, close: dialogClose },
		states: { open: isDialogOpen },
	} = createDialog({
		closeOnOutsideClick: true,
		forceVisible: true,
	});

	function detectMobile() {
		if (typeof window !== "undefined") {
			isMobile = window.innerWidth <= 768;
		}
	}

	function selectLocation(location: string) {
		selectedLocation = location;
		if (isMobile) {
			isDialogOpen.set(false);
		} else {
			isDropdownOpen.set(false);
		}
	}

	onMount(() => {
		detectMobile();
		if (typeof window !== "undefined") {
			window.addEventListener("resize", detectMobile);
			const savedLocation = localStorage.getItem("savedLocation");
			if (savedLocation && locations.includes(savedLocation)) {
				selectedLocation = savedLocation;
			}
		}
		mounted = true;
	});

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", detectMobile);
		}
	});

	$: if (typeof window !== "undefined" && mounted) {
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
			{#if !isMobile}
				<button {...dropdownTrigger} use:dropdownTrigger>
					<div class="flex items-center justify-between gap-x-1">
						<span class="text-lg/normal font-medium">
							{selectedLocation}
						</span>

						<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="currentColor" viewBox="0 -960 960 960">
							<path xmlns="http://www.w3.org/2000/svg" d="M480-360 280-560h400L480-360Z" />
						</svg>
					</div>
				</button>
				{#if $isDropdownOpen}
					<div class="absolute inset-0 z-50" {...dropdownOverlay} use:dropdownOverlay></div>
					<div class="absolute z-50 mt-3 min-w-52 rounded-lg bg-outer-space-100 py-3 shadow-lg" {...dropdownMenu} use:dropdownMenu transition:fly={{ duration: 200, y: -5 }}>
						{#each locations as location}
							<button class="block w-full p-3 text-sm/normal text-left font-medium" {...dropdownItem} use:dropdownItem on:click={() => selectLocation(location)}>
								{location}
							</button>
						{/each}
					</div>
				{/if}
			{:else}
				<button {...dialogTrigger} use:dialogTrigger>
					<div class="flex items-center justify-between gap-x-1">
						<span class="text-lg/normal font-medium">
							{selectedLocation}
						</span>

						<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="currentColor" viewBox="0 -960 960 960">
							<path xmlns="http://www.w3.org/2000/svg" d="M480-360 280-560h400L480-360Z" />
						</svg>
					</div>
				</button>
				{#if $isDialogOpen}
					<div class="fixed inset-0 z-50 bg-black/50" {...dialogOverlay} use:dialogOverlay transition:fade={{ duration: 150 }}></div>
					<div
						class="fixed inset-x-0 bottom-0 z-50 w-full rounded-t-3xl bg-outer-space-100 p-6"
						{...dialogContent}
						use:dialogContent
						transition:fly={{
							y: 300,
							duration: 400,
							easing: cubicInOut,
							delay: 100,
						}}
					>
						<div class="flex flex-col gap-y-3">
							<h3 class="my-3 text-left text-base/normal font-semibold">Select Location</h3>
							<div class="flex flex-col">
								{#each locations as location}
									<button class="block w-full py-3 text-lg/normal text-left font-medium" on:click={() => selectLocation(location)}>
										{location}
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</header>
