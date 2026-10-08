<script module>
  let nextDatalistId = 0;
</script>

<script>
  import { onMount } from 'svelte';
  import { getFieldSuggestions, rememberFieldValue } from '$lib/utils/formMemory.js';

  let {
    label,
    value = $bindable(''),
    type = 'text',
    placeholder = '',
    required = false,
    help = '',
    rows = 3,
    min = undefined,
    onchange = undefined,
    oninput = undefined,
    memoryKey = ''
  } = $props();

  let suggestions = $state([]);
  let datalistId = $state('');
  let supportsDatalist = $derived(memoryKey && !['date', 'time', 'textarea', 'number'].includes(type));
  let inputList = $derived(supportsDatalist && suggestions.length ? datalistId : undefined);

  onMount(() => {
    if (!supportsDatalist) return;

    datalistId = `memory-${memoryKey.replace(/[^a-zA-Z0-9_-]/g, '-')}-${nextDatalistId++}`;
    suggestions = getFieldSuggestions(memoryKey);
  });

  function rememberCurrentValue() {
    if (!supportsDatalist) return;

    rememberFieldValue(memoryKey, value);
    suggestions = getFieldSuggestions(memoryKey);
  }

  function handleInput(event) {
    oninput?.(event);
  }

  function handleChange(event) {
    rememberCurrentValue();
    onchange?.(event);
  }
</script>

{#if label}
  <label class="form-group">
    <span class="label-text">{label}{#if required} <span style="color: var(--error);">*</span>{/if}</span>
    {#if type === 'textarea'}
      <textarea
        bind:value
        class="input-field"
        {placeholder}
        {required}
        {rows}
        oninput={handleInput}
        onchange={handleChange}
      ></textarea>
    {:else}
      <input
        bind:value
        class="input-field"
        {type}
        {placeholder}
        {required}
        {min}
        list={inputList}
        name={memoryKey || undefined}
        autocomplete="on"
        oninput={handleInput}
        onchange={handleChange}
      />
      {#if inputList}
        <datalist id={datalistId}>
          {#each suggestions as suggestion}
            <option value={suggestion}></option>
          {/each}
        </datalist>
      {/if}
    {/if}
    {#if help}<p class="help-text">{help}</p>{/if}
  </label>
{:else}
  <div class="form-group">
    {#if type === 'textarea'}
      <textarea
        bind:value
        class="input-field"
        {placeholder}
        {required}
        {rows}
        oninput={handleInput}
        onchange={handleChange}
      ></textarea>
    {:else}
      <input
        bind:value
        class="input-field"
        {type}
        {placeholder}
        {required}
        {min}
        list={inputList}
        name={memoryKey || undefined}
        autocomplete="on"
        oninput={handleInput}
        onchange={handleChange}
      />
      {#if inputList}
        <datalist id={datalistId}>
          {#each suggestions as suggestion}
            <option value={suggestion}></option>
          {/each}
        </datalist>
      {/if}
    {/if}
  </div>
{/if}
