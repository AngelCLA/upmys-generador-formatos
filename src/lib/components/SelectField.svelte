<script>
  let { label, value = $bindable(''), options = [], required = false, placeholder = 'Seleccione...', onchange } = $props();
</script>

{#if label}
  <label class="form-group">
    <span class="label-text">{label}{#if required} <span style="color: var(--error);">*</span>{/if}</span>
    <select bind:value class="input-field" {required} onchange={onchange}>
      {#if placeholder}<option value="">{placeholder}</option>{/if}
      {#each options as group}
        {#if group.options}
          <optgroup label={group.label}>
            {#each group.options as option}
              <option value={option}>{option}</option>
            {/each}
          </optgroup>
        {:else}
          <option value={group.value ?? group}>{group.label ?? group}</option>
        {/if}
      {/each}
    </select>
  </label>
{:else}
  <div class="form-group">
  <select bind:value class="input-field" {required} onchange={onchange}>
    {#if placeholder}<option value="">{placeholder}</option>{/if}
    {#each options as group}
      {#if group.options}
        <optgroup label={group.label}>
          {#each group.options as option}
            <option value={option}>{option}</option>
          {/each}
        </optgroup>
      {:else}
        <option value={group.value ?? group}>{group.label ?? group}</option>
      {/if}
    {/each}
  </select>
  </div>
{/if}
