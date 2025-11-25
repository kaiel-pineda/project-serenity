<script lang="ts">
	import html2canvas from "html2canvas";
	import { addToast } from "./ToastNotification.svelte";

	export let onCaptureSuccess: () => void = () => {};

	export let targetSelector: string;
	export let filenamePrefix = "route-captured";

	let className = "";
	export { className as class };

	function generateCaptureFilename() {
		const now = new Date();
		const timestamp = now.toISOString().replace(/[-:.]/g, "");
		return `${filenamePrefix}-${timestamp}.png`;
	}

	function replaceTextareaWithDiv() {
		const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null;
		if (!textarea) return null;

		const div = document.createElement("div");
		const computedStyle = window.getComputedStyle(textarea);

		for (let i = 0; i < computedStyle.length; i++) {
			const prop = computedStyle[i];
			div.style.setProperty(prop, computedStyle.getPropertyValue(prop), computedStyle.getPropertyPriority(prop));
		}

		div.textContent = textarea.value;
		div.style.whiteSpace = "pre-wrap";
		div.style.overflowY = "auto";
		div.style.height = `${textarea.scrollHeight}px`;

		textarea.parentNode?.replaceChild(div, textarea);

		return function restoreTextarea() {
			div.parentNode?.replaceChild(textarea, div);
		};
	}

	function captureElement() {
		const element = document.querySelector(targetSelector) as HTMLElement | null;

		if (element) {
			const restoreTextarea = replaceTextareaWithDiv();

			const style = document.createElement("style");
			document.head.appendChild(style);
			style.sheet?.insertRule("body > div:last-child img { display: inline-block; }");

			html2canvas(element, {
				scrollX: 0,
				scrollY: 0,
				windowWidth: element.scrollWidth,
				windowHeight: element.scrollHeight,
			})
				.then((canvas) => {
					restoreTextarea && restoreTextarea();

					const dataURL = canvas.toDataURL("image/png");
					const link = document.createElement("a");
					link.href = dataURL;
					link.download = generateCaptureFilename();
					link.click();

					style.remove();
					link.remove();

					onCaptureSuccess();

					addToast({
						data: {
							title: "Capture Success",
							description: "Your screenshot has been saved successfully.",
							background: "bg-puerto-rico-500",
						},
					});
				})
				.catch(() => {
					restoreTextarea && restoreTextarea();

					addToast({
						data: {
							title: "Capture Failed",
							description: "An error occurred while capturing the screenshot.",
							background: "bg-brandy-punch-500",
						},
					});

					style.remove();
				});
		} else {
			addToast({
				data: {
					title: "Capture Failed",
					description: "Could not find the element to capture.",
					background: "bg-brandy-punch-500",
				},
			});
		}
	}
</script>

<button class={`cursor-pointer ${className}`} on:click={captureElement}>
	<slot />
</button>
