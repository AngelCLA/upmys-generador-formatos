<script>
  import { onMount } from 'svelte';
  import Building2 from '@lucide/svelte/icons/building-2';
  import ListChecks from '@lucide/svelte/icons/list-checks';
  import User from '@lucide/svelte/icons/user';
  import Header from '$lib/components/Header.svelte';
  import Stepper from '$lib/components/Stepper.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import SelectField from '$lib/components/SelectField.svelte';
  import RadioGroup from '$lib/components/RadioGroup.svelte';
  import FormNav from '$lib/components/FormNav.svelte';
  import PreviewPanel from '$lib/components/PreviewPanel.svelte';
  import { carreras } from '$lib/data/carreras.js';
  import { exportToDocx, fetchImageAsUint8Array, bold, plain, imagePara } from '$lib/utils/exportWord.js';
  import { Paragraph, AlignmentType } from 'docx';
  import { loadFormMemory, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { fileSafeName, formatDateText, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'servicio-social.solicitud';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    matricula: 'student.matricula',
    institucion: 'organization.name',
    act1: 'activity.description',
    act2: 'activity.description',
    act3: 'activity.description',
    act4: 'activity.description'
  };
  const MODALIDADES = ['Interinstitucional', 'Intrainstitucional'];

  const steps = [
    { label: 'Alumno', icon: User },
    { label: 'Programa', icon: Building2 },
    { label: 'Actividades', icon: ListChecks }
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
    cuatrimestre: '',
    matricula: '',
    modalidad: '',
    institucion: '',
    inicio: toInputDate(),
    act1: '',
    act2: '',
    act3: '',
    act4: ''
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

  function keepOnlyNumbers(event, fieldName) {
    const value = event.currentTarget.value.replace(/\D/g, '');
    event.currentTarget.value = value;
    form[fieldName] = value;
  }

  function formatFechaLarga(dateStr, fallback = '[Fecha]') {
    const formatted = formatDateText(dateStr, fallback);
    if (!formatted || formatted === fallback) return fallback;
    return formatted.replace(/ de (\d{4})$/, ' del $1');
  }

  function activityItems() {
    return [form.act1, form.act2, form.act3, form.act4].filter(Boolean);
  }

  function blankDocxParas(count, lineSpacing) {
    return Array.from({ length: count }, () => new Paragraph({ children: [], spacing: { line: lineSpacing } }));
  }

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);
    const lineSpacing = 360;
    const logoData = await fetchImageAsUint8Array(`${location.origin}/Logo-1.png`);

    const children = [];

    children.push(imagePara(logoData, { width: 199, height: 119, alignment: AlignmentType.LEFT }));
    children.push(new Paragraph({ children: [], spacing: { after: 240 } }));

    children.push(new Paragraph({
      children: [plain(`La Cruz, Elota, Sinaloa. ${formatFechaLarga(form.fecha)}.`)],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 360, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [bold('DR. ABRAHAM HI RIVERA')],
      spacing: { after: 0, line: lineSpacing },
    }));
    children.push(new Paragraph({
      children: [bold('SECRETARIO ACADÉMICO DE LA UNIVERSIDAD')],
      spacing: { after: 0, line: lineSpacing },
    }));
    children.push(new Paragraph({
      children: [bold('POLITÉCNICA DEL MAR Y LA SIERRA')],
      spacing: { after: 0, line: lineSpacing },
    }));
    children.push(new Paragraph({
      children: [bold('P R E S E N T E.-')],
      spacing: { after: 0, line: lineSpacing },
    }));
    children.push(new Paragraph({ children: [], spacing: { after: 0, line: lineSpacing } }));

    children.push(new Paragraph({
      children: [
        plain('A través de la presente, YO '),
        bold(nombreAlumno),
        plain(' alumno de la carrera de '),
        bold(form.carrera),
        plain(' inscrito en el '),
        bold(String(form.cuatrimestre ?? '')),
        plain(' cuatrimestre, con matrícula '),
        bold(form.matricula),
        plain(' me permito solicitarle la inscripción al programa Institucional de Servicio Social, y a su vez la autorización para realizarlo de forma '),
        bold(form.modalidad),
        plain(' en '),
        bold(form.institucion),
        plain(' a partir del día '),
        bold(formatFechaLarga(form.inicio)),
        plain(' realizando las siguientes actividades:'),
      ],
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 567 },
      spacing: { after: 240, line: lineSpacing },
    }));

    for (const item of activityItems()) {
      children.push(new Paragraph({
        children: [plain(`• ${item}`)],
        spacing: { after: 72, line: lineSpacing },
        indent: { left: 480 },
      }));
    }

    children.push(new Paragraph({
      children: [plain('Sin otro particular, le agradezco la atención prestada a mi solicitud.')],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(2, lineSpacing));

    children.push(new Paragraph({
      children: [bold('ATENTAMENTE')],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(2, lineSpacing));

    children.push(new Paragraph({
      children: [plain('______________________________________')],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [bold(nombreAlumno)],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [bold('NOMBRE DEL ALUMNO')],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: lineSpacing },
    }));

    await exportToDocx({
      sections: [{
        children,
        margin: '0.59in 0.79in 0.59in 0.79in'
      }],
      filename: `Solicitud_PSS_${fileSafeName(nombreAlumno)}`,
      margin: '0.59in 0.79in 0.59in 0.79in',
    });
  }
</script>

<svelte:head><title>Solicitud de Servicio Social - UPMYS</title></svelte:head>

<Header title="Solicitud de Servicio Social" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">Completa tus datos para generar la solicitud de inscripción al Programa Institucional de Servicio Social.</p>
      <Stepper {steps} {currentStep} />
      <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
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
                <div class="form-grid form-grid-2">
                  <FormInput label="Cuatrimestre" type="number" min={1} bind:value={form.cuatrimestre} placeholder="Ej. 5" required />
                  <FormInput label="Matrícula" bind:value={form.matricula} placeholder="Ej. 00000000" required oninput={(event) => keepOnlyNumbers(event, 'matricula')} memoryKey="student.matricula" />
                </div>
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><Building2 size={20} /> Paso 2: Programa e Institución</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <div>
                  <div class="label-text" style="margin-bottom: 0.5rem;">Modalidad <span style="color: var(--error);">*</span></div>
                  <RadioGroup name="modalidad" bind:value={form.modalidad} options={MODALIDADES} required />
                </div>
                <FormInput label="Institución" bind:value={form.institucion} placeholder="Nombre de la institución" required memoryKey="organization.name" />
                <FormInput label="Fecha de Inicio" type="date" bind:value={form.inicio} required />
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><ListChecks size={20} /> Paso 3: Actividades a Realizar</h2></div>
              <div style="display:flex; flex-direction:column; gap:0.875rem;">
                <FormInput label="Actividad 1" bind:value={form.act1} required memoryKey="activity.description" />
                <FormInput label="Actividad 2" bind:value={form.act2} required memoryKey="activity.description" />
                <FormInput label="Actividad 3" bind:value={form.act3} required memoryKey="activity.description" />
                <FormInput label="Actividad 4 (Opcional)" bind:value={form.act4} memoryKey="activity.description" />
              </div>
            </div>
          {/if}

          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Solicitud (.docx)" />
        </div>
      </form>
    </div>
    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Vista Previa de la Solicitud" badge="Formato 01">
          <div style="text-align:center;margin-bottom:0.75rem;">
            <img src="/Logo-2.png" alt="Logo UPMYS" style="width:110px;height:auto;" />
          </div>
          <div style="text-align:right;color:var(--text-secondary);margin-bottom:1rem;">La Cruz, Elota, Sinaloa. <b>{formatFechaLarga(form.fecha)}</b>.</div>
          <div style="line-height:1.6;">
            <div style="display:block;font-weight:800;font-size:12px;">DR. ABRAHAM HI RIVERA</div>
            <div style="display:block;font-weight:800;font-size:10px;">SECRETARIO ACADÉMICO DE LA UNIVERSIDAD</div>
            <div style="display:block;font-weight:800;font-size:10px;">POLITÉCNICA DEL MAR Y LA SIERRA</div>
            <div style="display:block;font-weight:800;font-size:10px;">P R E S E N T E.-</div>
          </div>
          <div style="text-align:justify;text-indent:40px;padding-top:0.75rem;">
            A través de la presente, YO <b>{fullStudentName() || '[Nombre del Alumno]'}</b> alumno de la carrera de <b>{form.carrera || '[Carrera]'}</b> inscrito en el <b>{form.cuatrimestre || '[Cuatrimestre]'}</b> cuatrimestre, con matrícula <b>{form.matricula || '[Matrícula]'}</b> me permito solicitarle la inscripción al programa Institucional de Servicio Social, y a su vez la autorización para realizarlo de forma <b>{form.modalidad || '[Modalidad]'}</b> en <b>{form.institucion || '[Institución]'}</b> a partir del día <b>{formatFechaLarga(form.inicio, '[Fecha de Inicio]')}</b> realizando las siguientes actividades:
          </div>
          <ul style="list-style-type:disc;padding-left:20px;margin:0.5rem 0;color:var(--text-secondary);">
            {#each activityItems() as item}<li style="margin-bottom:4px;">{item}</li>{/each}
          </ul>
          <div style="text-align:justify;padding-top:0.25rem;">Sin otro particular, le agradezco la atención prestada a mi solicitud.</div>
          <div style="text-align:center;padding-top:2rem;color:var(--text-primary);">
            <div style="font-weight:700;letter-spacing:0.1em;font-size:10px;">ATENTAMENTE</div>
            <div style="height:48px;"></div>
            <div style="font-weight:800;border-top:1px solid var(--border);padding-top:4px;width:75%;margin:0 auto;font-size:11px;">{fullStudentName() || '[Nombre del Alumno]'}</div>
            <div style="font-weight:700;color:var(--text-muted);font-size:9px;">NOMBRE DEL ALUMNO</div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>
