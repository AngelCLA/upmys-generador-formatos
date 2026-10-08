<script>
  import Eye from '@lucide/svelte/icons/eye';

  let { title = 'Vista Previa', badge = '', children } = $props();
</script>

<div class="preview-panel">
  <div class="preview-header">
    <Eye size={16} />
    {title}
    {#if badge}
      <span class="badge badge--primary" style="margin-left: auto;">{badge}</span>
    {/if}
  </div>
  <div class="preview-body" style="font-family: Georgia, serif; font-size: 11px; min-height: 550px;">
    {@render children?.()}
  </div>
</div>
