<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { createDropdownMenu, createDialog } from "@melt-ui/svelte";
	import { fly, fade } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";
	import { isPickups } from "../stores/pickupsStore";

	const locations: string[] = ["550 Building", "Beverly Hills", "Desert", "GIA", "Out of Area", "Streets", "Valley"];
	let selectedLocation: string = locations[0];
	let isMobile = false;
	let mounted = false;

	const {
		elements: { trigger: dropdownTrigger, menu: dropdownMenu, item: dropdownItem, overlay: dropdownOverlay },
		states: { open: isDropdownOpen },
	} = createDropdownMenu({
		forceVisible: true,
	});

	const {
		elements: { trigger: dialogTrigger, overlay: dialogOverlay, content: dialogContent },
		states: { open: isDialogOpen },
	} = createDialog({
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

	$: if ($isDropdownOpen) {
		isDialogOpen.set(false);
	}

	$: if ($isDialogOpen) {
		isDropdownOpen.set(false);
	}

	function togglePickups() {
		isPickups.update((value) => {
			const newValue = !value;
			localStorage.setItem("isPickups", JSON.stringify(newValue));
			return newValue;
		});
	}

	onMount(() => {
		detectMobile();
		if (typeof window !== "undefined") {
			window.addEventListener("resize", detectMobile);

			const savedLocation = localStorage.getItem("savedLocation");
			if (savedLocation && locations.includes(savedLocation)) {
				selectedLocation = savedLocation;
			}

			const savedPickups = localStorage.getItem("isPickups");
			if (savedPickups !== null) {
				isPickups.set(JSON.parse(savedPickups));
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
		<div class="grid grid-cols-[auto_auto_1fr] items-center gap-x-6">
			<div class="flex h-14 w-14 items-center justify-center">
				<svg class="size-12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M1 7.19l6.64 6.64h.72L15 7.19v-.72l-3.32-3.32-.36-.15H4.68l-.36.15L1 6.47v.72z" fill="#ceb202" />
					<path fill-rule="evenodd" clip-rule="evenodd" d="M8 12.75L2.08 6.83 4.89 4h6.22l2.81 2.83L8 12.75zm0-7.73h2.69l1.81 1.81-4.5 4.4V5.02z" fill="#ffffff" />
				</svg>
			</div>

			{#if !isMobile}
				<button {...dropdownTrigger} use:dropdownTrigger class="flex items-center justify-between gap-x-1">
					<span class="text-xl/normal font-semibold text-fuscous-gray-900">{selectedLocation}</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="currentColor" viewBox="0 -960 960 960">
						<path xmlns="http://www.w3.org/2000/svg" d="M480-360 280-560h400L480-360Z" />
					</svg>
				</button>
				{#if $isDropdownOpen}
					<div class="absolute inset-0 z-50" {...dropdownOverlay} use:dropdownOverlay />
					<div class="absolute z-50 mt-3 min-w-52 rounded-lg bg-outer-space-100 py-3 shadow-lg" {...dropdownMenu} use:dropdownMenu transition:fly={{ duration: 250, y: -5, easing: cubicInOut }}>
						{#each locations as location}
							<button class="block w-full p-3 text-sm/normal text-left font-medium text-outer-space-900" {...dropdownItem} use:dropdownItem on:click={() => selectLocation(location)}>
								{location}
							</button>
						{/each}
					</div>
				{/if}
			{:else}
				<button {...dialogTrigger} use:dialogTrigger class="flex items-center justify-between gap-x-1">
					<span class="text-xl/normal font-semibold text-fuscous-gray-900">{selectedLocation}</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="size-6 fill-fuscous-gray-900" viewBox="0 -960 960 960">
						<path xmlns="http://www.w3.org/2000/svg" d="M480-360 280-560h400L480-360Z" />
					</svg>
				</button>
				{#if $isDialogOpen}
					<div class="fixed inset-0 z-50 bg-black/50" {...dialogOverlay} use:dialogOverlay transition:fade={{ duration: 150, easing: cubicInOut }} />
					<div
						class="fixed inset-x-0 bottom-0 z-50 w-full rounded-t-3xl bg-outer-space-100 p-6"
						{...dialogContent}
						use:dialogContent
						transition:fly={{
							y: 300,
							duration: 200,
							easing: cubicInOut,
							delay: 75,
						}}
					>
						<div class="flex flex-col gap-y-3">
							<div class="flex flex-col">
								{#each locations as location}
									<button class="block w-full py-3 text-lg/normal text-left font-medium text-outer-space-900" on:click={() => selectLocation(location)}>
										{location}
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/if}

			<button class="justify-self-end p-2" on:click={togglePickups}>
				{#if $isPickups}
					<svg xmlns="http://www.w3.org/2000/svg" class="size-6 fill-old-gold-500" viewBox="0 0 16 16">
						<path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="size-6 fill-old-gold-500" viewBox="0 0 16 16">
						<path fill-rule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</header>
