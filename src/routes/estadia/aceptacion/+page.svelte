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
  import { actividadOptions } from '$lib/data/forms.js';
  import { exportToDocx, bold, plain, cell, row, table, para, headerPara, pageBreakPara } from '$lib/utils/exportWord.js';
  import { Paragraph, TextRun, AlignmentType, BorderStyle, WidthType, Table } from 'docx';
  import { loadFormMemory, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { addMonths, fileSafeName, formatDateText, formatTime, suggestedHours, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'estadia.aceptacion';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    empresa: 'organization.name',
    area: 'organization.area',
    proyecto: 'project.title',
    act1: 'activity.description',
    act2: 'activity.description',
    act3: 'activity.description',
    act4: 'activity.description',
    responsable: 'person.responsible',
    cargo: 'person.cargo'
  };

  const steps = [
    { label: 'Alumno' },
    { label: 'Proyecto' },
    { label: 'Actividades' },
    { label: 'Firma' }
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
    actividad: 'Estancia I',
    horas: 120,
    empresa: '',
    area: '',
    proyecto: '',
    inicio: toInputDate(),
    fin: toInputDate(addMonths(new Date(), 4)),
    entrada: '08:00',
    salida: '16:00',
    act1: '',
    act2: '',
    act3: '',
    act4: '',
    responsable: '',
    cargo: ''
  });

  function syncHoras() {
    form.horas = suggestedHours(form.actividad);
  }

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
  }

  function prevStep() {
    currentStep -= 1;
  }

  function fullStudentName() {
    const fullName = [form.apellidos, form.nombres]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join(' ');

    return fullName || form.nombre;
  }

  function activityItems() {
    return [form.act1, form.act2, form.act3, form.act4].filter(Boolean);
  }

  function blankLines(count, fontSize, lineHeight) {
    return Array.from({ length: count }, () => `<p style="margin:0;line-height:${lineHeight};font-size:${fontSize};">&nbsp;</p>`).join('');
  }

  function letterLayout(items) {
    const textLoad = [
      form.nombre,
      form.carrera,
      form.actividad,
      form.area,
      form.empresa,
      form.proyecto,
      form.responsable,
      form.cargo,
      ...items
    ].join(' ').length + items.length * 80;
    const compact = textLoad > 950;

    return {
      compact,
      margin: compact ? '0.55in 0.65in 0.55in 0.65in' : '0.65in',
      signatureGapLines: compact ? 2 : 3,
      signatureLineGap: compact ? 1 : 2
    };
  }

  function blankDocxParas(count, lineSpacing) {
    return Array.from({ length: count }, () => new Paragraph({ children: [], spacing: { line: lineSpacing } }));
  }

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);
    const activities = activityItems();
    const layout = letterLayout(activities);
    const lineSpacing = 360;

    const children = [];

    children.push(...blankDocxParas(2, lineSpacing));

    children.push(new Paragraph({
      children: [plain(`La Cruz, Elota, Sinaloa, a ${formatDateText(form.fecha)}.`)],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 432, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [bold('Dr. Luis Miguel Flores Campaña')],
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Rector de la Universidad Politécnica del Mar y la Sierra', font: 'Arial', size: 24 })],
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [bold('Presente. -')],
      spacing: { after: 336, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [
        plain('Por medio de la presente hago constar que el/la '),
        bold(`C. ${nombreAlumno}`),
        plain(', de la carrera de '),
        bold(form.carrera),
        plain(', ha sido aceptado para que realice su '),
        bold(form.actividad),
        plain(' en el área de '),
        bold(form.area),
        plain(' de la empresa '),
        bold(form.empresa),
        plain(', participando en el proyecto titulado: '),
        bold(`"${form.proyecto}"`),
        plain(', durante el periodo comprendido del '),
        bold(formatDateText(form.inicio)),
        plain(' al '),
        bold(formatDateText(form.fin)),
        plain(', con horario de '),
        bold(formatTime(form.entrada)),
        plain(' a '),
        bold(formatTime(form.salida)),
        plain(' horas hasta acumular un total de '),
        bold(String(form.horas)),
        plain(' horas.'),
      ],
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 567 },
      spacing: { after: 240, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [
        plain('El/La estudiante arriba mencionada(o) colaborará en actividades propias de su perfil profesional tales como:'),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 192, line: lineSpacing },
    }));

    for (const item of activities) {
      children.push(new Paragraph({
        children: [plain(`• ${item}`)],
        spacing: { after: 72, line: lineSpacing },
        indent: { left: 480 },
      }));
    }

    children.push(new Paragraph({ spacing: { after: 240 } }));

    children.push(new Paragraph({
      children: [plain('Sin otro particular por el momento me despido.')],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(layout.signatureGapLines, lineSpacing));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'ATENTAMENTE', bold: true, font: 'Arial', size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: lineSpacing },
    }));

    children.push(...blankDocxParas(layout.signatureLineGap, lineSpacing));

    const NO_BORDERS = {
      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
    };

    const NO_TABLE_BORDERS = {
      top: { style: BorderStyle.NONE, size: 0 },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
      insideHorizontal: { style: BorderStyle.NONE, size: 0 },
      insideVertical: { style: BorderStyle.NONE, size: 0 },
    };

    children.push(new Table({
      width: { size: 58, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: NO_TABLE_BORDERS,
      rows: [
        new (await import('docx')).TableRow({
          children: [
            new (await import('docx')).TableCell({
              children: [
                new Paragraph({
                  children: [bold(form.responsable)],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, line: 300 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: form.cargo, font: 'Arial', size: 19.6, color: '555555' })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, line: 300 },
                }),
              ],
              borders: NO_BORDERS,
            }),
          ],
        }),
      ],
    }));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Nota: hoja membretada con firma y sello del responsable. (Borrar la nota antes de imprimir)', font: 'Arial', size: 15, color: 'FF0000', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 288, line: 300 },
    }));

    await exportToDocx({
      sections: [{ children, margin: layout.margin }],
      filename: `Carta_Aceptacion_${fileSafeName(nombreAlumno)}`,
      margin: layout.margin,
    });
  }
</script>

<svelte:head><title>Generador de Carta de Aceptación - UPMYS F-02</title></svelte:head>

<Header title="Generador de Carta de Aceptación" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">Completa los datos para estructurar formalmente la carta de aceptación institucional.</p>
      <Stepper {steps} {currentStep} />
      <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><User size={20} /> Paso 1: Datos del Alumno</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Fecha de Expedición de la Carta" type="date" bind:value={form.fecha} required />
                <div class="form-grid form-grid-2">
                  <FormInput label="Apellidos" bind:value={form.apellidos} placeholder="Ej. PÉREZ GARCÍA" required memoryKey="student.lastName" />
                  <FormInput label="Nombre(s)" bind:value={form.nombres} placeholder="Ej. JUAN CARLOS" required memoryKey="student.firstName" />
                </div>
                <SelectField label="Carrera" bind:value={form.carrera} options={carreras} placeholder="Seleccione su carrera..." required />
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><Building2 size={20} /> Paso 2: Detalles del Proyecto</h2></div>
              <div class="form-grid form-grid-2" style="margin-bottom: 1.25rem;">
                <SelectField label="Proceso a realizar" bind:value={form.actividad} options={actividadOptions} onchange={syncHoras} required />
                <FormInput label="Total de Horas requeridas" type="number" bind:value={form.horas} required />
              </div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Nombre de la Empresa o Institución" bind:value={form.empresa} required memoryKey="organization.name" />
                <FormInput label="Área o Departamento de adscripción" bind:value={form.area} required memoryKey="organization.area" />
                <FormInput label="Título del Proyecto" bind:value={form.proyecto} required memoryKey="project.title" />
              </div>
              <div class="form-grid form-grid-2" style="margin-top: 1.25rem;">
                <FormInput label="Fecha de Inicio" type="date" bind:value={form.inicio} required />
                <FormInput label="Fecha de Finalización" type="date" bind:value={form.fin} required />
                <FormInput label="Hora Entrada" type="time" bind:value={form.entrada} required />
                <FormInput label="Hora Salida" type="time" bind:value={form.salida} required />
              </div>
            </div>
          {:else if currentStep === 3}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><ClipboardList size={20} /> Paso 3: Actividades Propias de su Perfil</h2></div>
              <div style="display:flex; flex-direction:column; gap:0.875rem;">
                <FormInput label="Actividad 1" bind:value={form.act1} required memoryKey="activity.description" />
                <FormInput label="Actividad 2" bind:value={form.act2} required memoryKey="activity.description" />
                <FormInput label="Actividad 3" bind:value={form.act3} required memoryKey="activity.description" />
                <FormInput label="Actividad 4 (Opcional)" bind:value={form.act4} memoryKey="activity.description" />
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><PenLine size={20} /> Paso 4: Responsable que Firma</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Nombre del Responsable" bind:value={form.responsable} required memoryKey="person.responsible" />
                <FormInput label="Cargo del Responsable" bind:value={form.cargo} required memoryKey="person.cargo" />
              </div>
            </div>
          {/if}
          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Carta (.docx)" />
        </div>
      </form>
    </div>
    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Vista Previa de la Carta" badge="F-02 Oficial">
          <div style="text-align:right;color:var(--text-secondary);margin-bottom:1rem;">La Cruz, Elota, Sinaloa, a <span style="border-bottom:1px solid var(--border);font-weight:600;padding:0 4px;">{formatDateText(form.fecha)}</span>.</div>
          <div style="padding-top:1rem;line-height:1.6;"><div style="display:block;font-weight:800;font-size:12px;">Dr. Luis Miguel Flores Campaña</div><div style="display:block;color:var(--text-secondary);font-size:10px;">Rector de la Universidad Politécnica del Mar y la Sierra</div><div style="display:block;font-weight:600;color:var(--text-secondary);">Presente. -</div></div>
          <div style="text-align:justify;text-indent:40px;padding-top:0.5rem;">Por medio de la presente hago constar que el/la <b>C. {fullStudentName() || '[Nombre del Alumno]'}</b>, de la carrera de <b>{form.carrera || '[Carrera]'}</b>, ha sido aceptado para que realice su <b style="color:var(--primary-700);">{form.actividad}</b> en el área de <b>{form.area || '[Área/Departamento]'}</b> de la empresa <b>{form.empresa || '[Nombre de la Empresa]'}</b>, participando en el proyecto titulado: <i>"{form.proyecto || '[Título del Proyecto]'}"</i>, durante el periodo comprendido del <b>{formatDateText(form.inicio)}</b> al <b>{formatDateText(form.fin)}</b>, con horario de <b>{formatTime(form.entrada)}</b> a <b>{formatTime(form.salida)}</b> horas hasta acumular un total de <b>{form.horas}</b> horas.</div>
          <div style="text-align:justify;padding-top:0.25rem;">El/La estudiante arriba mencionada(o) colaborará en actividades propias de su perfil profesional tales como:</div>
          <ul style="list-style-type:disc;padding-left:20px;margin:0.5rem 0;color:var(--text-secondary);">
            {#each activityItems() as item}<li style="margin-bottom:4px;">{item}</li>{/each}
          </ul>
          <div style="text-align:justify;padding-top:0.25rem;">Sin otro particular por el momento me despido.</div>
          <div style="text-align:center;padding-top:2rem;color:var(--text-primary);"><div style="font-weight:700;letter-spacing:0.1em;font-size:10px;">ATENTAMENTE</div><div style="height:48px;"></div><div style="font-weight:800;border-top:1px solid var(--border);padding-top:4px;width:75%;margin:0 auto;font-size:11px;">{form.responsable || '[Responsable]'}</div><div style="color:var(--text-muted);font-size:9px;">{form.cargo || '[Cargo del Responsable]'}</div></div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>
