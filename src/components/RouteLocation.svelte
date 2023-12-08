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

  // Save the value to local storage whenever it changes
  $: storage.setItem('savedInput', inputValue);
</script>

<input class='text-white font-medium text-xl bg-transparent' type="text" bind:value={inputValue} />
