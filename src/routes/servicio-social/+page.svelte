<script>
  import Download from '@lucide/svelte/icons/download';
  import FileText from '@lucide/svelte/icons/file-text';
  import Header from '$lib/components/Header.svelte';
  import DashboardCard from '$lib/components/DashboardCard.svelte';
  import { servicioSocialForms } from '$lib/data/forms.js';
</script>

<svelte:head>
  <title>Servicio Social - UPMYS</title>
</svelte:head>

<Header title="Servicio Social" showBack />

<main class="main-content main-content-narrow">
  <section style="margin-bottom: 2rem;">
    <div class="eyebrow" style="margin-bottom: 0.5rem;">Módulo</div>
    <h1 class="display-title">Servicio Social</h1>
    <p class="subtitle" style="margin-top: 0.375rem; max-width: 620px;">
      Formatos oficiales del Programa Institucional de Servicio Social.
    </p>
  </section>

  <section>
    <div class="dashboard-grid">
      {#each servicioSocialForms as form}
        <DashboardCard {...form} />
      {/each}
    </div>
    <p class="subtitle" style="margin-top: 1rem;">Más formatos se irán habilitando conforme se integren.</p>
  </section>

  <section style="margin-top: 2rem;">
    <div class="eyebrow" style="margin-bottom: 0.5rem;">Recursos</div>
    <a
      class="dashboard-card"
      href="/guia-informe-final-ss-upmys.docx"
      download
      style="max-width: 460px;"
    >
      <div class="dashboard-card-icon"><FileText size={20} /></div>
      <div class="dashboard-card-title">Guía para el Informe Final de Servicio Social</div>
      <div class="dashboard-card-desc">
        Requisitos oficiales de portada, contenido, formato, estilo, numeración y entrega.
      </div>
      <div class="dashboard-card-badge dashboard-card-badge--local">
        <Download size={12} /> Descargar .docx
      </div>
    </a>
  </section>
</main>
