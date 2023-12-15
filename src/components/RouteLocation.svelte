<script lang="ts">
	let inputValue: string = "";

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

	$: {
		const savedValue: string | null = storage.getItem("savedInput");
		if (savedValue) {
			inputValue = savedValue;
		}
	}

	let contentEditable: HTMLSpanElement | null = null;

	function handleBlur(event: FocusEvent): void {
		const target = event.target as HTMLSpanElement;
		inputValue = target.textContent || "";
		storage.setItem("savedInput", inputValue);
	}

	$: {
		if (contentEditable && contentEditable.textContent !== inputValue) {
			contentEditable.textContent = inputValue;
		}
	}
</script>

<header class="bg-[#343a40] p-3 mb-12">
	<div class="container mx-auto px-6">
		<div class="flex items-center gap-x-6">
			<div class="h-14 w-14 flex items-center justify-center">
				<img src="https://raw.githubusercontent.com/kaiel-pineda/project-serenity/main/public/assets/logo.png" alt="Malca-Amit logo." />
			</div>
			<span class="text-white font-medium text-xl bg-transparent min-w-[12rem]" contenteditable="true" bind:this={contentEditable} on:blur={handleBlur}></span>
		</div>
	</div>
</header>
