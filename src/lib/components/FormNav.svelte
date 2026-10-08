<script>
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import Download from '@lucide/svelte/icons/download';

  let { currentStep, totalSteps, onPrev, onNext, submitLabel = 'Generar Word (.docx)' } = $props();
</script>

<div class="form-nav">
  {#if currentStep > 1}
    <button type="button" onclick={onPrev} class="btn btn-secondary">
      <ArrowLeft size={16} />
      Anterior
    </button>
  {:else}
    <div></div>
  {/if}
  <div class="form-nav-spacer"></div>
  <div style="display: flex; gap: 0.75rem;">
    {#if currentStep < totalSteps}
      <button type="button" onclick={onNext} class="btn btn-primary">
        Siguiente
        <ArrowRight size={16} />
      </button>
    {:else}
      <button type="submit" class="btn btn-primary" style="background: var(--success); border-color: var(--success);">
        <Download size={16} />
        {submitLabel}
      </button>
    {/if}
  </div>
</div>
