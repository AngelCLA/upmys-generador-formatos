<script>
  import { onMount } from 'svelte';
  import Building2 from '@lucide/svelte/icons/building-2';
  import ClipboardList from '@lucide/svelte/icons/clipboard-list';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import User from '@lucide/svelte/icons/user';
  import Header from '$lib/components/Header.svelte';
  import Stepper from '$lib/components/Stepper.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import SelectField from '$lib/components/SelectField.svelte';
  import FormNav from '$lib/components/FormNav.svelte';
  import PreviewPanel from '$lib/components/PreviewPanel.svelte';
  import { carreras } from '$lib/data/carreras.js';
  import { exportToDocx, bold, plain } from '$lib/utils/exportWord.js';
  import { Paragraph, AlignmentType } from 'docx';
  import { loadFormMemory, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { fileSafeName, formatDateText, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'servicio-social.terminacion';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    empresa: 'organization.name',
    proyecto: 'project.name',
    act1: 'activity.description',
    act2: 'activity.description',
    act3: 'activity.description',
    act4: 'activity.description',
    act5: 'activity.description',
    responsable: 'responsible.name',
    cargo: 'responsible.position',
    direccion: 'organization.address'
  };
  const DOCX_MARGIN = '0.98in 1.18in 0.98in 1.18in';
  const BODY_LINE = 259;
  const ACTIVITY_LINE = 360;
  const SIGNATURE_LINE_SPACING = 240;
  const SIGNATURE_RULE = '_'.repeat(54);

  const steps = [
    { label: 'Alumno', icon: User },
    { label: 'Periodo', icon: Building2 },
    { label: 'Actividades', icon: ClipboardList },
    { label: 'Firma', icon: PenLine }
  ];

  let currentStep = $state(1);
  let memoryReady = $state(false);
  let formElement;
  let form = $state({
    fecha: toInputDate(),
    apellidos: '',
    nombres: '',
    nombre: '',
    carrera: '',
    inicio: toInputDate(),
    fin: '',
    empresa: '',
    proyecto: '',
    act1: '',
    act2: '',
    act3: '',
    act4: '',
    act5: '',
    responsable: '',
    cargo: '',
    direccion: ''
  });

  onMount(() => {
    form = loadFormMemory(FORM_MEMORY_KEY, form);
    memoryReady = true;
  });

  $effect(() => {
    if (!memoryReady) return;
    saveFormMemory(FORM_MEMORY_KEY, form);
  });

  function nextStep() {
    if (!formElement.reportValidity()) return;
    currentStep += 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    currentStep -= 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (currentStep < steps.length) {
      nextStep();
      return;
    }
    if (!formElement.reportValidity()) return;
    generateWord();
  }

  function fullStudentName() {
    const fullName = [form.apellidos, form.nombres]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join(' ');

    return fullName || form.nombre;
  }

  function activityItems() {
    return [form.act1, form.act2, form.act3, form.act4, form.act5]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);
  }

  function bodyText(nombreAlumno) {
    const nombre = String(nombreAlumno ?? '').trim() || '[Nombre del Alumno]';
    const carrera = String(form.carrera ?? '').trim() || '[Carrera]';
    const empresa = String(form.empresa ?? '').trim() || '[Empresa]';
    const proyecto = String(form.proyecto ?? '').trim() || '[Proyecto]';

    return `Por medio del presente le envío un cordial saludo y al mismo tiempo aprovecho para hacer de su conocimiento que ${nombre}, alumno de la carrera de ${carrera} de la Universidad Politécnica del Mar y la Sierra, quien realizó la prestación de su servicio social a partir del día ${formatDateText(form.inicio, '[Fecha de Inicio]')} al día ${formatDateText(form.fin, '[Fecha de Fin]')} en nuestra empresa: ${empresa}, ha cumplido satisfactoriamente las tareas derivadas de los objetivos planteados en el programa de trabajo de Servicio Social: “${proyecto}” acumulando durante su estancia un total de 480 (cuatrocientas ochenta) horas efectivas de servicio. Realizando las siguientes actividades globales:`;
  }

  function blankDocxParas(count, lineSpacing = BODY_LINE, alignment = undefined) {
    return Array.from(
      { length: count },
      () => new Paragraph({ children: [], alignment, spacing: { line: lineSpacing, after: 0 } })
    );
  }

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);

    const children = [];

    children.push(new Paragraph({
      children: [plain(`La Cruz, Elota, Sinaloa; México., a ${formatDateText(form.fecha)}`)],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: BODY_LINE }
    }));

    children.push(...blankDocxParas(1));

    children.push(new Paragraph({
      children: [bold('Dr. Luis Miguel Flores Campaña')],
      spacing: { after: 0, line: BODY_LINE }
    }));
    children.push(new Paragraph({
      children: [plain('Rector de la Universidad Politécnica')],
      spacing: { after: 0, line: BODY_LINE }
    }));
    children.push(new Paragraph({
      children: [plain('del Mar y la Sierra')],
      spacing: { after: 0, line: BODY_LINE }
    }));
    children.push(new Paragraph({
      children: [plain('P r e s e n t e.-')],
      spacing: { after: 0, line: BODY_LINE }
    }));

    children.push(...blankDocxParas(1));

    children.push(new Paragraph({
      children: [bold("At'n Dr. Abraham Hi Rivera")],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: BODY_LINE }
    }));
    children.push(new Paragraph({
      children: [plain('Secretario Académico')],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: BODY_LINE }
    }));
    children.push(...blankDocxParas(2, BODY_LINE, AlignmentType.RIGHT));

    children.push(new Paragraph({
      children: [plain(bodyText(nombreAlumno))],
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 708 },
      spacing: { after: 0, line: BODY_LINE }
    }));

    children.push(...blankDocxParas(1));

    for (const item of activityItems()) {
      children.push(new Paragraph({
        children: [plain(`• ${item}`)],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 720, hanging: 360 },
        spacing: { after: 0, line: ACTIVITY_LINE }
      }));
    }

    children.push(...blankDocxParas(1));

    children.push(new Paragraph({
      children: [
        plain('Por lo anterior me es grato informarle que, a partir de esta fecha, el alumno arriba mencionado ha concluido en cuanto a nuestro Programa de Trabajo se refiere, sus labores de prestación de servicio social. Razón por la cual le extendemos la presente '),
        bold('Carta de Cumplimiento'),
        plain(' para los fines que el prestador y la institución que le ampara correspondan.')
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 0, line: BODY_LINE }
    }));

    children.push(...blankDocxParas(2));

    children.push(new Paragraph({
      children: [plain('Sin otro particular, quedo a sus órdenes.')],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 0, line: BODY_LINE }
    }));

    children.push(...blankDocxParas(2, SIGNATURE_LINE_SPACING));

    children.push(new Paragraph({
      children: [plain('A t e n t a m e n t e.')],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));

    children.push(...blankDocxParas(3, SIGNATURE_LINE_SPACING));

    children.push(new Paragraph({
      children: [plain(SIGNATURE_RULE)],
      alignment: AlignmentType.CENTER,
      keepNext: true,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));
    children.push(new Paragraph({
      children: [bold(form.responsable)],
      alignment: AlignmentType.CENTER,
      keepNext: true,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));
    children.push(new Paragraph({
      children: [plain(form.cargo)],
      alignment: AlignmentType.CENTER,
      keepNext: true,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));
    children.push(new Paragraph({
      children: [plain(form.direccion)],
      alignment: AlignmentType.CENTER,
      keepNext: true,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));

    children.push(new Paragraph({
      children: [],
      keepNext: true,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));

    children.push(new Paragraph({
      children: [bold('Nota: hoja membretada con firma y sello del responsable. (Borrar la nota antes de imprimir)')],
      alignment: AlignmentType.CENTER,
      keepLines: true,
      spacing: { after: 0, line: SIGNATURE_LINE_SPACING }
    }));

    await exportToDocx({
      sections: [{
        children,
        margin: DOCX_MARGIN
      }],
      filename: `Terminacion_SS_${fileSafeName(nombreAlumno)}`,
      margin: DOCX_MARGIN
    });
  }
</script>

<svelte:head><title>Terminación del Servicio Social - UPMYS</title></svelte:head>

<Header title="Terminación del Servicio Social" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">Completa los datos para generar la carta de cumplimiento y terminación del Servicio Social.</p>
      <Stepper {steps} {currentStep} />
      <form bind:this={formElement} onsubmit={handleSubmit}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><User size={20} /> Paso 1: Datos del Alumno</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Fecha" type="date" bind:value={form.fecha} required />
                <div class="form-grid form-grid-2">
                  <FormInput label="Apellidos" bind:value={form.apellidos} placeholder="Ej. PÉREZ GARCÍA" required memoryKey="student.lastName" />
                  <FormInput label="Nombre(s)" bind:value={form.nombres} placeholder="Ej. JUAN CARLOS" required memoryKey="student.firstName" />
                </div>
                <SelectField label="Carrera" bind:value={form.carrera} options={carreras} placeholder="Seleccione su carrera..." required />
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><Building2 size={20} /> Paso 2: Periodo y Proyecto</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <div class="form-grid form-grid-2">
                  <FormInput label="Fecha de inicio" type="date" bind:value={form.inicio} required />
                  <FormInput label="Fecha de fin" type="date" bind:value={form.fin} min={form.inicio} required />
                </div>
                <FormInput label="Nombre de la empresa u organismo" bind:value={form.empresa} placeholder="Nombre de la empresa u organismo receptor" required memoryKey="organization.name" />
                <FormInput label="Nombre del proyecto" bind:value={form.proyecto} placeholder="Nombre del proyecto" required memoryKey="project.name" />
              </div>
            </div>
          {:else if currentStep === 3}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><ClipboardList size={20} /> Paso 3: Actividades Globales</h2></div>
              <div style="display:flex; flex-direction:column; gap:0.875rem;">
                <FormInput label="Actividad 1" bind:value={form.act1} required memoryKey="activity.description" help="La carta oficial contempla hasta cinco actividades globales. Solo la primera es obligatoria." />
                <FormInput label="Actividad 2" bind:value={form.act2} memoryKey="activity.description" />
                <FormInput label="Actividad 3" bind:value={form.act3} memoryKey="activity.description" />
                <FormInput label="Actividad 4" bind:value={form.act4} memoryKey="activity.description" />
                <FormInput label="Actividad 5" bind:value={form.act5} memoryKey="activity.description" />
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><PenLine size={20} /> Paso 4: Responsable de la Firma</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Nombre del responsable" bind:value={form.responsable} required memoryKey="responsible.name" />
                <FormInput label="Cargo que desempeña" bind:value={form.cargo} required memoryKey="responsible.position" />
                <FormInput label="Dirección de la empresa" bind:value={form.direccion} required memoryKey="organization.address" />
                <div class="alert alert--warning" role="note">
                  Este documento debe imprimirse en hoja membretada con la firma y el sello del responsable.
                </div>
              </div>
            </div>
          {/if}

          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Terminación (.docx)" />
        </div>
      </form>
    </div>
    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Vista Previa de la Terminación" badge="Formato 05">
          <div class="preview-letter">
            <p class="preview-date">La Cruz, Elota, Sinaloa; México., a {formatDateText(form.fecha)}</p>

            <div class="preview-addressee">
              <div class="preview-strong">Dr. Luis Miguel Flores Campaña</div>
              <div>Rector de la Universidad Politécnica</div>
              <div>del Mar y la Sierra</div>
              <div>P r e s e n t e.-</div>
            </div>

            <div class="preview-copy">
              <div class="preview-strong">At'n Dr. Abraham Hi Rivera</div>
              <div>Secretario Académico</div>
              <div class="preview-copy-spacer" aria-hidden="true"></div>
              <div class="preview-copy-spacer" aria-hidden="true"></div>
            </div>

            <p class="preview-body">{bodyText(fullStudentName())}</p>

            <ul class="preview-activities">
              {#each activityItems() as item}
                <li>{item}</li>
              {/each}
            </ul>

            <p class="preview-body">Por lo anterior me es grato informarle que, a partir de esta fecha, el alumno arriba mencionado ha concluido en cuanto a nuestro Programa de Trabajo se refiere, sus labores de prestación de servicio social. Razón por la cual le extendemos la presente <b>Carta de Cumplimiento</b> para los fines que el prestador y la institución que le ampara correspondan.</p>

            <p class="preview-body">Sin otro particular, quedo a sus órdenes.</p>

            <div class="preview-signature">
              <div class="preview-spacer-1"></div>
              <div>A t e n t a m e n t e.</div>
              <div class="preview-spacer-2"></div>
              <div>{SIGNATURE_RULE}</div>
              <div class="preview-strong">{form.responsable || '[Nombre del Responsable]'}</div>
              <div>{form.cargo || '[Cargo que desempeña]'}</div>
              <div>{form.direccion || '[Dirección de la Empresa]'}</div>
              <div class="preview-spacer-3"></div>
              <div class="preview-note">Nota: hoja membretada con firma y sello del responsable. (Borrar la nota antes de imprimir)</div>
            </div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>

<style>
  .preview-letter {
    color: var(--text-primary);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9px;
    line-height: 1.35;
  }

  .preview-date {
    margin: 0;
    text-align: right;
  }

  .preview-addressee {
    margin-top: 10px;
  }

  .preview-copy {
    margin-top: 10px;
    text-align: right;
  }

  .preview-copy-spacer {
    height: 12px;
  }

  .preview-strong {
    font-weight: 700;
  }

  .preview-body {
    margin: 10px 0 0;
    text-align: justify;
    text-indent: 0.49in;
  }

  .preview-activities {
    margin: 8px 0 0;
    padding-left: 0.5in;
    text-align: justify;
  }

  .preview-activities li {
    margin-bottom: 3px;
    line-height: 1.5;
  }

  .preview-signature {
    margin-top: 10px;
    text-align: center;
    line-height: 1.35;
  }

  .preview-spacer-1 {
    height: 16px;
  }

  .preview-spacer-2 {
    height: 24px;
  }

  .preview-spacer-3 {
    height: 12px;
  }

  .preview-note {
    font-weight: 700;
  }
</style>
