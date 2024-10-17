<script lang="ts" context="module">
	export type ToastData = {
		title: string;
		description: string;
		background: string;
	};

	const {
		elements: { content, title, description, close },
		helpers,
		states: { toasts },
		actions: { portal },
	} = createToaster<ToastData>();
	export const addToast = helpers.addToast;
</script>

<script lang="ts">
	import { createToaster } from "@melt-ui/svelte";
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
</script>

<div class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto" use:portal>
	{#each $toasts as { id, data } (id)}
		<div class={`rounded-lg shadow-md text-white ${data.background}`} {...$content(id)} use:content animate:flip={{ duration: 500 }} in:fly={{ duration: 150, x: "100%" }} out:fly={{ duration: 150, x: "100%" }}>
			<div class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-3 p-6">
				<div class="flex flex-col gap-y-1 justify-center">
					<span class="text-base/normal font-semibold" {...$title(id)} use:title>
						{data.title}
					</span>
					<span class="text-base/normal font-normal" {...$description(id)} use:description>
						{data.description}
					</span>
				</div>
				<button class="absolute right-3 top-3 grid size-6 place-items-center" {...$close(id)} use:close>
					<svg xmlns="http://www.w3.org/2000/svg" class="size-6 fill-white" viewBox="0 0 16 16">
						<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"></path>
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>
