<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { createDropdownMenu, createDialog, createTooltip, createSwitch } from '@melt-ui/svelte';
    import { fly, fade } from 'svelte/transition';
    import { quintOut, quintIn, backOut, cubicOut } from 'svelte/easing';
    import { isPickups } from '../stores/store';

    const locations: string[] = ['550 Building', 'Beverly Hills', 'Desert', 'GIA', 'Out of Area', 'Streets', 'Valley'];
    let selectedLocation: string = locations[0];
    let isMobile = false;
    let mounted = false;

    let autoToggleEnabled = false;
    let autoToggleTime = '12:00';
    let autoToggleInterval: number | undefined;
    let formattedTime = '';

    $: formattedTime = formatTime(autoToggleTime);

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

    const {
        elements: { trigger: tooltipTrigger, content: tooltipContent, arrow: tooltipArrow },
        states: { open: isTooltipOpen },
    } = createTooltip({
        positioning: {
            placement: 'bottom',
        },
        openDelay: 500,
        closeOnPointerDown: false,
        forceVisible: true,
    });

    const {
        elements: { root: timeSwitchRoot, input: timeSwitchInput },
    } = createSwitch();

    function detectMobile() {
        isMobile = window.innerWidth <= 768;
    }

    function selectLocation(location: string) {
        selectedLocation = location;
        const stateSetter = isMobile ? isDialogOpen : isDropdownOpen;
        stateSetter.set(false);
    }

    $: if ($isDropdownOpen) {
        isDialogOpen.set(false);
    }

    $: if ($isDialogOpen) {
        isDropdownOpen.set(false);
    }

    function togglePickups() {
        if (autoToggleEnabled) {
            autoToggleEnabled = false;
            localStorage.setItem('autoToggleEnabled', 'false');
            clearInterval(autoToggleInterval);
        }

        isPickups.update((value) => {
            const newValue = !value;
            localStorage.setItem('isPickups', JSON.stringify(newValue));
            return newValue;
        });
    }

    function checkAutoToggleTime() {
        if (!autoToggleEnabled) return;

        const [hour, minute] = autoToggleTime.split(':').map(Number);
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        const targetTimeInMinutes = hour * 60 + minute;

        if (currentTimeInMinutes >= targetTimeInMinutes) {
            isPickups.set(true);
        } else {
            isPickups.set(false);
        }

        if (now.getHours() === 0 && now.getMinutes() === 0) {
            isPickups.set(false);
            localStorage.setItem('isPickups', JSON.stringify(false));
        }
    }

    $: if (autoToggleEnabled) {
        checkAutoToggleTime();
        clearInterval(autoToggleInterval);
        autoToggleInterval = setInterval(checkAutoToggleTime, 60000);
    } else {
        clearInterval(autoToggleInterval);
    }

    function formatTime(time: string): string {
        const [hour, minute] = autoToggleTime.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    if (autoToggleEnabled) {
        autoToggleInterval = setInterval(checkAutoToggleTime, 60000);
    }

    onMount(() => {
        if (typeof window !== 'undefined') {
            detectMobile();
            window.addEventListener('resize', detectMobile);

            const savedLocation = localStorage.getItem('savedLocation');
            if (savedLocation && locations.includes(savedLocation)) {
                selectedLocation = savedLocation;
            }

            const savedPickups = localStorage.getItem('isPickups');
            if (savedPickups !== null) {
                isPickups.set(JSON.parse(savedPickups));
            }

            const savedAutoToggleEnabled = localStorage.getItem('autoToggleEnabled');
            autoToggleEnabled = savedAutoToggleEnabled === 'true';

            const savedAutoToggleTime = localStorage.getItem('autoToggleTime');
            if (savedAutoToggleTime) {
                autoToggleTime = savedAutoToggleTime;
            }

            if (autoToggleEnabled) {
                checkAutoToggleTime();
            }
        }
        mounted = true;
    });

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', detectMobile);
        }
        clearInterval(autoToggleInterval);
    });

    $: if (mounted) {
        localStorage.setItem('savedLocation', selectedLocation);
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
                        <path d="M480-360 280-560h400L480-360Z" />
                    </svg>
                </button>
                {#if $isDropdownOpen}
                    <div class="absolute z-50 mt-3 min-w-52 rounded-lg bg-outer-space-100 py-3 shadow-lg" {...dropdownMenu} use:dropdownMenu in:fly={{ y: -10, duration: 300, easing: backOut }} out:fly={{ y: -10, duration: 400, easing: cubicOut, delay: 20 }}>
                        {#each locations as location}
                            <button class="block w-full p-3 text-left text-sm/normal font-medium text-outer-space-900" {...dropdownItem} use:dropdownItem on:click={() => selectLocation(location)}>
                                {location}
                            </button>
                        {/each}
                    </div>
                {/if}
            {:else}
                <button {...dialogTrigger} use:dialogTrigger class="flex items-center justify-between gap-x-1">
                    <span class="text-xl/normal font-semibold text-fuscous-gray-900">{selectedLocation}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 fill-fuscous-gray-900" viewBox="0 -960 960 960">
                        <path d="M480-360 280-560h400L480-360Z" />
                    </svg>
                </button>
                {#if $isDialogOpen}
                    <div class="fixed inset-0 z-50 bg-black/50" {...dialogOverlay} use:dialogOverlay in:fade={{ duration: 200, easing: quintOut }} out:fade={{ duration: 300, easing: quintIn, delay: 50 }} />
                    <div class="fixed inset-x-0 bottom-0 z-50 w-full rounded-t-3xl bg-outer-space-100 p-6" {...dialogContent} use:dialogContent in:fly={{ y: 355, duration: 350, easing: quintOut }} out:fly={{ y: 355, duration: 500, easing: quintIn, delay: 60 }}>
                        <div class="flex flex-col gap-y-3">
                            <div class="flex flex-col">
                                {#each locations as location}
                                    <button class="block w-full py-3 text-left text-lg/normal font-medium text-outer-space-900" on:click={() => selectLocation(location)}>
                                        {location}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}

            <div class="justify-self-end relative flex items-center gap-x-3">
                {#if autoToggleEnabled}
                    <div class="bg-old-gold-500 py-1.5 px-3 rounded-md flex items-center justify-center gap-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 stroke-old-gold-50 fill-none">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>

                        <span class="text-xs/normal text-old-gold-50">{formattedTime}</span>
                    </div>
                {/if}

                <button class="relative" on:click={togglePickups}>
                    <button class="absolute inset-0 size-full" {...$tooltipTrigger} use:tooltipTrigger />
                    {#if $isPickups}
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-8 fill-old-gold-500" viewBox="0 0 16 16">
                            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z" />
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-8 fill-old-gold-500" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                        </svg>
                    {/if}
                </button>
            </div>

            {#if $isTooltipOpen}
                <div {...$tooltipContent} use:tooltipContent transition:fade={{ duration: 100 }} class="z-20 rounded-md bg-old-gold-500 shadow">
                    <div {...$tooltipArrow} use:tooltipArrow />
                    <div class="p-3 flex items-center gap-x-3">
                        <div class="flex items-center gap-x-2">
                            <span class="text-xs/normal font-medium text-old-gold-900">Switch by</span>
                            <input
                                class="text-xs/normal font-medium text-old-gold-900 bg-old-gold-400 rounded-md p-1"
                                type="time"
                                bind:value={autoToggleTime}
                                on:change={() => {
                                    localStorage.setItem('autoToggleTime', autoToggleTime);
                                    if (autoToggleEnabled) checkAutoToggleTime();
                                }}
                                required />
                        </div>

                        <button class="relative inline-block w-11 h-5" {...timeSwitchRoot} use:timeSwitchRoot>
                            <input
                                id="switch-component"
                                type="checkbox"
                                class="peer appearance-none w-11 h-5 bg-old-gold-400 rounded-full checked:bg-old-gold-600 cursor-pointer transition-colors duration-300"
                                bind:checked={autoToggleEnabled}
                                on:change={() => {
                                    localStorage.setItem('autoToggleEnabled', JSON.stringify(autoToggleEnabled));
                                    if (autoToggleEnabled) {
                                        checkAutoToggleTime();
                                        autoToggleInterval = setInterval(checkAutoToggleTime, 60000);
                                    } else {
                                        clearInterval(autoToggleInterval);
                                    }
                                }}
                                {...timeSwitchInput}
                                use:timeSwitchInput />
                            <label for="switch-component" class="absolute top-0 left-0 w-5 h-5 bg-old-gold-200 rounded-full transition-transform duration-300 peer-checked:translate-x-6 cursor-pointer"> </label>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</header>
