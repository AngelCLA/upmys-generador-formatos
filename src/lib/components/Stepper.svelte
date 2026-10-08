<script>
  import Check from '@lucide/svelte/icons/check';

  let { steps = [], currentStep = 1 } = $props();
  let progress = $derived(steps.length <= 1 ? 0 : ((currentStep - 1) / (steps.length - 1)) * 100);
</script>

<div class="stepper-wrapper">
  <div class="stepper">
    <div class="stepper-track"></div>
    <div class="stepper-progress" style={`width: ${progress}%;`}></div>

    {#each steps as step, index}
      {@const number = index + 1}
      {@const Icon = step.icon}
      {@const completed = number < currentStep}
      {@const active = number === currentStep}
      <div class="stepper-step">
        <div
          class="stepper-circle"
          class:stepper-circle--completed={completed}
          class:stepper-circle--active={active}
          class:stepper-circle--pending={!completed && !active}
        >
          {#if completed}
            <Check size={18} />
          {:else if Icon}
            <Icon size={18} />
          {:else}
            {number}
          {/if}
        </div>
        <span
          class="stepper-label"
          class:stepper-label--completed={completed}
          class:stepper-label--active={active}
        >{step.label}</span>
      </div>
    {/each}
  </div>
</div>
