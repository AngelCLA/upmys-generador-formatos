<script>
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';

  let { title = 'Portal de Estadías Profesionales', showBack = false, backHref = '/' } = $props();
</script>

<header class="institutional-header">
  <div class="header-inner">
    <img src="/Logo-2.png" alt="Logo UPMYS" class="header-logo" />
    <div class="header-divider"></div>
    <div class="header-text-group">
      <div class="header-eyebrow">Universidad Politécnica del Mar y la Sierra</div>
      <div class="header-title">{title}</div>
    </div>
    {#if showBack}
      <a href={backHref} class="header-back">
        <ArrowLeft size={16} />
        Inicio
      </a>
    {/if}
  </div>
</header>
