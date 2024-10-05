<script lang="ts">
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	let newItem = "";
	let showInput = true;

	function addToList() {
		const trimmedItem = newItem.trim();
		if (!trimmedItem) return;

		dispatch("addItem", { text: trimmedItem });
		newItem = "";
	}

	function toggleInputVisibility() {
		showInput = !showInput;
	}
</script>

<footer class={showInput ? "sticky bottom-0 bg-white z-30" : "sticky bottom-0 bg-transparent z-30"}>
	<div class="container mx-auto px-6">
		<div class="flex flex-col justify-center mb-6">
			<div class="flex justify-between items-center w-full gap-x-6">
				<div class={showInput ? "flex items-center justify-between w-full rounded-full bg-[#505050] p-3 transition-[width] duration-200" : "relative py-7 px-12 rounded-full bg-neutral-500 text-neutral-300 transition-[width] duration-200 w-24"}>
					<button class={showInput ? "mr-3 py-1 px-3 rounded-full bg-neutral-500 text-neutral-300" : "absolute inset-0"} on:click={toggleInputVisibility}>
						{showInput ? "Hide" : "Show"}
					</button>

					{#if showInput}
						<input
							class="bg-transparent w-full outline-none text-lg/normal placeholder:text-neutral-300 text-neutral-100 font-medium ml-3"
							bind:value={newItem}
							type="text"
							placeholder="Create a stop"
							on:keydown={(e) => {
								if (e.key === "Enter") addToList();
							}}
						/>

						<button class="flex items-center justify-center bg-neutral-500 p-1 rounded-full" on:click={addToList}>
							<svg xmlns="http://www.w3.org/2000/svg" class="size-6 stroke-neutral-300" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
