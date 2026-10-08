<script>
  import Header from '$lib/components/Header.svelte';
  import DashboardCard from '$lib/components/DashboardCard.svelte';
  import { estadiaForms, servicioSocialForms } from '$lib/data/forms.js';
</script>

<svelte:head>
  <title>Formatos UPMYS - Portal de Trámites</title>
  <meta
    name="description"
    content="Portal institucional para generar formatos de Estadías Profesionales y Servicio Social de UPMYS."
  />
</svelte:head>

<Header title="Portal de Trámites Profesionales" />

<main class="main-content main-content-narrow">
  <section style="margin-bottom: 2rem;">
    <div class="eyebrow" style="margin-bottom: 0.5rem;">UPMYS</div>
    <h1 class="display-title">Herramientas Institucionales</h1>
    <p class="subtitle" style="margin-top: 0.375rem; max-width: 620px;">
      Acceda a los formularios oficiales para generar documentos de Estadías Profesionales y Servicio Social.
    </p>
  </section>

  <section style="margin-bottom: 2.5rem;">
    <div style="display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div class="eyebrow">Módulo</div>
        <h2 class="page-title">Estadías Profesionales</h2>
      </div>
      <span class="badge badge--primary">Activo</span>
    </div>
    <div class="dashboard-grid">
      {#each estadiaForms as form}
        <DashboardCard {...form} />
      {/each}
    </div>
  </section>

  <section>
    <div style="display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div class="eyebrow">Módulo</div>
        <h2 class="page-title">Servicio Social</h2>
      </div>
      <span class="badge">En preparación</span>
    </div>
    <div class="dashboard-grid">
      {#each servicioSocialForms as form}
        <DashboardCard {...form} />
      {/each}
    </div>
  </section>
</main>
