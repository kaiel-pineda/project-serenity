<script lang="ts">
  let inputValue = '';

  // Function to safely use localStorage
  function safeLocalStorage() {
    if (typeof window !== 'undefined') {
      // The code is running in the browser
      return localStorage;
    }
    // Return a dummy storage object when not in a browser environment
    return {
      getItem: () => null,
      setItem: () => {}
    };
  }

  const storage = safeLocalStorage();

  // Load the value from local storage when the component mounts
  $: {
    const savedValue = storage.getItem('savedInput');
    if (savedValue) {
      inputValue = savedValue;
    }
  }

  // Update inputValue when the content of the span changes
  function handleInput(event) {
    inputValue = event.target.textContent;
    storage.setItem('savedInput', inputValue);
  }
</script>

<span class='text-white font-medium text-xl bg-transparent' contenteditable="true" bind:innerHTML={inputValue} on:input={handleInput}></span>
