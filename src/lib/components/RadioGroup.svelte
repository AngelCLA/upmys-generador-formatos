<script>
  let { name, value = $bindable(''), options = [], required = false, onchange } = $props();
</script>

<div class="radio-group" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
  {#each options as option}
    {@const optionValue = option.value ?? option}
    <label class="radio-option">
      <input
        type="radio"
        {name}
        value={optionValue}
        bind:group={value}
        {required}
        onchange={onchange}
      />
      {option.label ?? option}
    </label>
  {/each}
</div>
