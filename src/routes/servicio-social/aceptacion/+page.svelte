<script>
  import { onMount } from 'svelte';
  import Building2 from '@lucide/svelte/icons/building-2';
  import User from '@lucide/svelte/icons/user';
  import UserCheck from '@lucide/svelte/icons/user-check';
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
  import { fileSafeName, formatDateText, formatTime, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'servicio-social.aceptacion';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    institucion: 'organization.name',
    proyecto: 'project.name',
    act1: 'activity.description',
    act2: 'activity.description',
    act3: 'activity.description',
    act4: 'activity.description',
    responsable: 'responsible.name',
    cargo: 'responsible.position'
  };

  const steps = [
    { label: 'Alumno', icon: User },
    { label: 'Recepción', icon: Building2 },
    { label: 'Responsable', icon: UserCheck }
  ];

  let currentStep = $state(1);
  let memoryReady = $state(false);
  let formElement;
  let form = $state({
    lugar: 'La Cruz, Elota, Sinaloa',
    fecha: toInputDate(),
    apellidos: '',
    nombres: '',
    nombre: '',
    carrera: '',
    institucion: '',
    proyecto: '',
    inicio: toInputDate(),
    fin: '',
    horaInicio: '',
    horaFin: '',
    act1: '',
    act2: '',
    act3: '',
    act4: '',
    responsable: '',
    cargo: ''
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

  function fullStudentName() {
    const fullName = [form.apellidos, form.nombres]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join(' ');

    return fullName || form.nombre;
  }

  function formatFechaLarga(dateStr, fallback = '[Fecha]') {
    const formatted = formatDateText(dateStr, fallback);
    if (!formatted || formatted === fallback) return fallback;
    return formatted.replace(/ de (\d{4})$/, ' del $1');
  }

  function formatFechaConAnio(dateStr, fallback = '[Fecha]') {
    const formatted = formatDateText(dateStr, fallback);
    if (!formatted || formatted === fallback) return fallback;
    return formatted.replace(/ de (\d{4})$/, ' del año $1');
  }

  function activityItems() {
    return [form.act1, form.act2, form.act3, form.act4]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);
  }

  function blankDocxParas(count, lineSpacing) {
    return Array.from({ length: count }, () => new Paragraph({ children: [], spacing: { line: lineSpacing } }));
  }

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);
    const lineSpacing = 360;
    const lugar = String(form.lugar ?? '').trim().replace(/\.+$/, '');

    const children = [];

    children.push(new Paragraph({
      children: [plain(`${lugar}. ${formatFechaLarga(form.fecha)}.`, { font: 'Times New Roman' })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(1, lineSpacing));

    children.push(new Paragraph({
      children: [bold('DR. LUIS MIGUEL FLORES CAMPAÑA')],
      spacing: { after: 0, line: lineSpacing },
    }));
    children.push(new Paragraph({
      children: [plain('Rector de la Universidad Politécnica del Mar y la Sierra')],
      spacing: { after: 0, line: lineSpacing },
    }));
    children.push(new Paragraph({
      children: [plain('Presente.-')],
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(2, lineSpacing));

    children.push(new Paragraph({
      children: [
        plain('Por medio de la presente hago constar que el/la '),
        bold('C. '),
        bold(nombreAlumno),
        plain(' de la carrera de '),
        plain(form.carrera),
        plain(' ha sido aceptado para que realice su servicio social en '),
        plain(form.institucion),
        plain(', participando en el proyecto titulado: “'),
        plain(form.proyecto),
        plain('”, durante el periodo comprendido del día '),
        plain(formatFechaConAnio(form.inicio)),
        plain(' al '),
        plain(formatFechaConAnio(form.fin)),
        plain(', con horario de '),
        plain(formatTime(form.horaInicio)),
        plain(' a '),
        plain(formatTime(form.horaFin)),
        plain(' horas hasta acumular un total de 480 horas.'),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 240, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [plain('El/La estudiante arriba mencionada(o) colaborará en actividades propias de su perfil profesional tales como:')],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 192, line: lineSpacing },
    }));

    activityItems().forEach((item, index) => {
      children.push(new Paragraph({
        children: [plain(`${index + 1}. ${item}`)],
        spacing: { after: 72, line: lineSpacing },
        indent: { left: 480 },
      }));
    });

    children.push(new Paragraph({
      children: [plain('Sin otro particular por el momento me despido.')],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(1, lineSpacing));

    children.push(new Paragraph({
      children: [bold('ATENTAMENTE')],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(2, lineSpacing));

    children.push(new Paragraph({
      children: [bold(form.responsable)],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 240 },
    }));

    children.push(new Paragraph({
      children: [plain(form.cargo)],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 240 },
    }));

    await exportToDocx({
      sections: [{
        children,
        margin: '0.98in 1.18in 0.98in 1.18in'
      }],
      filename: `Aceptacion_SS_${fileSafeName(nombreAlumno)}`,
      margin: '0.98in 1.18in 0.98in 1.18in',
    });
  }
</script>

<svelte:head><title>Aceptación de Servicio Social - UPMYS</title></svelte:head>

<Header title="Aceptación de Servicio Social" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">Completa los datos para generar la carta de aceptación del organismo receptor.</p>
      <Stepper {steps} {currentStep} />
      <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><User size={20} /> Paso 1: Datos del Alumno</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Lugar" bind:value={form.lugar} placeholder="Ej. La Cruz, Elota, Sinaloa" required help="Este dato aparece en la primera línea del documento." />
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
              <div class="form-step-header"><h2><Building2 size={20} /> Paso 2: Datos de la Recepción</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Institución / Organismo receptor" bind:value={form.institucion} placeholder="Nombre de la institución u organismo receptor" required memoryKey="organization.name" />
                <FormInput label="Proyecto" bind:value={form.proyecto} placeholder="Nombre del proyecto" required memoryKey="project.name" />
                <div class="form-grid form-grid-2">
                  <FormInput label="Fecha de inicio" type="date" bind:value={form.inicio} required />
                  <FormInput label="Fecha de fin" type="date" bind:value={form.fin} min={form.inicio} required />
                  <FormInput label="Hora de inicio" type="time" bind:value={form.horaInicio} required />
                  <FormInput label="Hora de fin" type="time" bind:value={form.horaFin} required />
                </div>
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><UserCheck size={20} /> Paso 3: Responsable y Actividades</h2></div>
              <div style="display:flex; flex-direction:column; gap:0.875rem;">
                <FormInput label="Actividad 1" bind:value={form.act1} required memoryKey="activity.description" />
                <FormInput label="Actividad 2" bind:value={form.act2} memoryKey="activity.description" />
                <FormInput label="Actividad 3" bind:value={form.act3} memoryKey="activity.description" />
                <FormInput label="Actividad 4" bind:value={form.act4} memoryKey="activity.description" />
                <FormInput label="Nombre del responsable" bind:value={form.responsable} required memoryKey="responsible.name" />
                <FormInput label="Puesto o cargo" bind:value={form.cargo} required memoryKey="responsible.position" />
                <div class="alert alert--warning" role="note">
                  Este documento debe imprimirse en hoja membretada y con el sello del organismo receptor.
                </div>
              </div>
            </div>
          {/if}

          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Aceptación (.docx)" />
        </div>
      </form>
    </div>
    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Vista Previa de la Aceptación" badge="Formato 02">
          <div style="text-align:right;color:var(--text-secondary);margin-bottom:1rem;">
            {(form.lugar || '[Lugar]').replace(/\.+$/, '')}. <b>{formatFechaLarga(form.fecha)}</b>.
          </div>
          <div style="line-height:1.6;">
            <div style="display:block;font-weight:800;font-size:12px;">DR. LUIS MIGUEL FLORES CAMPAÑA</div>
            <div style="display:block;font-size:11px;">Rector de la Universidad Politécnica del Mar y la Sierra</div>
            <div style="display:block;font-size:11px;">Presente.-</div>
          </div>
          <div style="text-align:justify;padding-top:1rem;">
            Por medio de la presente hago constar que el/la <b>C. {fullStudentName() || '[Nombre del Alumno]'}</b> de la carrera de {form.carrera || '[Carrera]'} ha sido aceptado para que realice su servicio social en {form.institucion || '[Institución]'}, participando en el proyecto titulado: “{form.proyecto || '[Proyecto]'}”, durante el periodo comprendido del día {formatFechaConAnio(form.inicio, '[Fecha de Inicio]')} al {formatFechaConAnio(form.fin, '[Fecha de Fin]')}, con horario de {formatTime(form.horaInicio)} a {formatTime(form.horaFin)} horas hasta acumular un total de 480 horas.
          </div>
          <div style="text-align:justify;padding-top:0.5rem;">El/La estudiante arriba mencionada(o) colaborará en actividades propias de su perfil profesional tales como:</div>
          <ol style="padding-left:20px;margin:0.5rem 0;color:var(--text-secondary);">
            {#each activityItems() as item}<li style="margin-bottom:4px;">{item}</li>{/each}
          </ol>
          <div style="text-align:justify;padding-top:0.25rem;">Sin otro particular por el momento me despido.</div>
          <div style="text-align:center;padding-top:2rem;color:var(--text-primary);">
            <div style="font-weight:700;letter-spacing:0.1em;font-size:10px;">ATENTAMENTE</div>
            <div style="height:48px;"></div>
            <div style="font-weight:800;font-size:11px;">{form.responsable || '[Nombre del Responsable]'}</div>
            <div style="color:var(--text-muted);font-size:9px;">{form.cargo || '[Puesto o Cargo]'}</div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>
