<script>
  import { onMount } from 'svelte';
  import Briefcase from '@lucide/svelte/icons/briefcase';
  import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
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
  import { addMonths, fileSafeName, formatDateText, suggestedHours, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'estadia.terminacion';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    matricula: 'student.matricula',
    empresa: 'organization.name',
    area: 'organization.area',
    act1: 'activity.description',
    act2: 'activity.description',
    act3: 'activity.description',
    act4: 'activity.description',
    responsable: 'person.responsible',
    cargo: 'person.cargo'
  };

  const steps = [{ label: 'Alumno' }, { label: 'Periodo' }, { label: 'Actividades' }, { label: 'Firma' }];
  let currentStep = $state(1);
  let memoryReady = $state(false);
  let formElement;
  let form = $state({ fecha: toInputDate(), apellidos: '', nombres: '', nombre: '', carrera: '', matricula: '', actividad: 'Estancia I', horas: 120, empresa: '', area: '', inicio: toInputDate(), fin: toInputDate(addMonths(new Date(), 4)), act1: '', act2: '', act3: '', act4: '', responsable: '', cargo: '' });

  function syncHoras() { form.horas = suggestedHours(form.actividad); }
  onMount(() => { form = loadFormMemory(FORM_MEMORY_KEY, form); memoryReady = true; });
  $effect(() => { if (memoryReady) saveFormMemory(FORM_MEMORY_KEY, form); });
  function nextStep() { if (!formElement.reportValidity()) return; currentStep += 1; }
  function prevStep() { currentStep -= 1; }
  function fullStudentName() { const fullName = [form.apellidos, form.nombres].map((value) => String(value ?? '').trim()).filter(Boolean).join(' '); return fullName || form.nombre; }
  function keepOnlyNumbers(event, fieldName) { const value = event.currentTarget.value.replace(/\D/g, ''); event.currentTarget.value = value; form[fieldName] = value; }
  function activityItems() { return [form.act1, form.act2, form.act3, form.act4].filter(Boolean); }
  function blankLines(count, fontSize, lineHeight) { return Array.from({ length: count }, () => `<p style="margin:0;line-height:${lineHeight};font-size:${fontSize};">&nbsp;</p>`).join(''); }
  function letterLayout(items) {
    const textLoad = [form.nombre, form.matricula, form.carrera, form.actividad, form.area, form.empresa, form.responsable, form.cargo, ...items].join(' ').length + items.length * 80;
    const compact = textLoad > 950;
    return {
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
      spacing: { after: 96, line: lineSpacing },
    }));

    children.push(new Paragraph({
      children: [new TextRun({ text: `ASUNTO: F-06 TERMINACIÓN DE ${form.actividad.toUpperCase()}`, bold: true, font: 'Arial', size: 24 })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 384, line: lineSpacing },
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
        plain('Por este conducto se le HACE CONSTAR que el/la alumno(a): '),
        bold(`C. ${nombreAlumno}`),
        plain(', con número de matrícula '),
        bold(form.matricula),
        plain(' de la carrera de '),
        bold(form.carrera),
        plain(' en la Universidad Politécnica del Mar y la Sierra '),
        bold('HA CONCLUIDO SATISFACTORIAMENTE'),
        plain(' su periodo de '),
        bold(`${form.actividad} profesional`),
        plain(' en las instalaciones de '),
        bold(form.area),
        plain(' de esta empresa '),
        bold(form.empresa),
        plain('. El mencionado alumno asistió en el periodo del '),
        bold(formatDateText(form.inicio)),
        plain(' al '),
        bold(formatDateText(form.fin)),
        plain(' hasta un total de '),
        bold(String(form.horas)),
        plain(' horas de labores, en las cuales realizó actividades como:'),
      ],
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 567 },
      spacing: { after: 240, line: lineSpacing },
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
      children: [plain('Sin otro particular, quedo a sus apreciables órdenes.')],
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

    const NO_BORDERS_SIG = {
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
              borders: NO_BORDERS_SIG,
            }),
          ],
        }),
      ],
    }));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Nota: hoja membretada con firma y sello del responsable. (Favor de borrar la nota antes de imprimir)', font: 'Arial', size: 15, color: 'FF0000', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 288, line: 300 },
    }));

    await exportToDocx({
      sections: [{ children, margin: layout.margin }],
      filename: `Carta_Terminacion_${fileSafeName(nombreAlumno)}`,
      margin: layout.margin,
    });
  }
</script>

<svelte:head><title>Generador de Carta de Terminación - UPMYS F-06</title></svelte:head>
<Header title="Generador de Carta de Terminación" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">Completa los datos paso a paso para generar la carta de liberación oficial de tu Estadía o Estancia.</p>
      <Stepper {steps} {currentStep} />
      <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn"><div class="form-step-header"><h2><User size={20} /> Paso 1: Datos del Alumno</h2></div><div style="display:flex; flex-direction:column; gap:1.25rem;"><FormInput label="Fecha de Expedición" type="date" bind:value={form.fecha} required /><div class="form-grid form-grid-2"><FormInput label="Apellidos" bind:value={form.apellidos} placeholder="Ej. PÉREZ GARCÍA" required memoryKey="student.lastName" /><FormInput label="Nombre(s)" bind:value={form.nombres} placeholder="Ej. JUAN CARLOS" required memoryKey="student.firstName" /></div><div class="form-grid" style="grid-template-columns:2fr 1fr;"><SelectField label="Carrera" bind:value={form.carrera} options={carreras} placeholder="Seleccione su carrera..." required /><FormInput label="Matrícula" bind:value={form.matricula} required oninput={(event) => keepOnlyNumbers(event, 'matricula')} memoryKey="student.matricula" /></div></div></div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn"><div class="form-step-header"><h2><Briefcase size={20} /> Paso 2: Detalles de la Actividad</h2></div><div class="form-grid form-grid-2" style="margin-bottom:1.25rem;"><SelectField label="Proceso concluido" bind:value={form.actividad} options={actividadOptions} onchange={syncHoras} required /><FormInput label="Total de Horas cumplidas" type="number" bind:value={form.horas} required /></div><div style="display:flex; flex-direction:column; gap:1.25rem;"><FormInput label="Nombre de la Empresa o Institución" bind:value={form.empresa} required memoryKey="organization.name" /><FormInput label="Área o Departamento donde se desempeñó" bind:value={form.area} required memoryKey="organization.area" /></div><div class="form-grid form-grid-2" style="margin-top:1.25rem;"><FormInput label="Fecha de Inicio de Actividades" type="date" bind:value={form.inicio} required /><FormInput label="Fecha de Término de Actividades" type="date" bind:value={form.fin} required /></div></div>
          {:else if currentStep === 3}
            <div class="form-step animate-fadeIn"><div class="form-step-header"><h2><ClipboardCheck size={20} /> Paso 3: Actividades Realizadas</h2></div><div style="display:flex; flex-direction:column; gap:0.875rem;"><FormInput label="Actividad 1" bind:value={form.act1} required memoryKey="activity.description" /><FormInput label="Actividad 2" bind:value={form.act2} required memoryKey="activity.description" /><FormInput label="Actividad 3" bind:value={form.act3} required memoryKey="activity.description" /><FormInput label="Actividad 4 (Opcional)" bind:value={form.act4} memoryKey="activity.description" /></div></div>
          {:else}
            <div class="form-step animate-fadeIn"><div class="form-step-header"><h2><PenLine size={20} /> Paso 4: Responsable de Firma</h2></div><div style="display:flex; flex-direction:column; gap:1.25rem;"><FormInput label="Nombre del Responsable" bind:value={form.responsable} required memoryKey="person.responsible" /><FormInput label="Cargo del Responsable" bind:value={form.cargo} required memoryKey="person.cargo" /></div></div>
          {/if}
          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Carta (.docx)" />
        </div>
      </form>
    </div>
    <div class="lg:col-span-5"><div class="sticky" style="top: 80px;"><PreviewPanel title="Vista Previa en Tiempo Real" badge="F-06 Oficial"><div style="text-align:right;color:var(--text-secondary);margin-bottom:0.5rem;">La Cruz, Elota, Sinaloa, a <b>{formatDateText(form.fecha)}</b>.</div><div style="text-align:right;font-weight:800;font-size:10px;text-transform:uppercase;color:var(--text-primary);margin-bottom:0.75rem;">ASUNTO: F-06 TERMINACIÓN DE {form.actividad}</div><div style="padding-top:0.5rem;line-height:1.6;"><div style="display:block;font-weight:800;font-size:12px;">Dr. Luis Miguel Flores Campaña</div><div style="display:block;color:var(--text-secondary);font-size:10px;">Rector de la Universidad Politécnica del Mar y la Sierra</div><div style="display:block;font-weight:600;color:var(--text-secondary);">Presente. -</div></div><div style="text-align:justify;text-indent:40px;padding-top:0.25rem;">Por este conducto se le HACE CONSTAR que el/la alumno(a): <b>C. {fullStudentName() || '[Nombre del Alumno]'}</b>, con número de matrícula <b>{form.matricula || '[Matrícula]'}</b> de la carrera de <b>{form.carrera || '[Carrera]'}</b> <b>HA CONCLUIDO SATISFACTORIAMENTE</b> su periodo de <b>{form.actividad} profesional</b> en las instalaciones de <b>{form.area || '[Área/Departamento]'}</b> de esta empresa <b>{form.empresa || '[Nombre de la Empresa]'}</b>. El mencionado alumno asistió en el periodo del <b>{formatDateText(form.inicio)}</b> al <b>{formatDateText(form.fin)}</b> hasta un total de <b>{form.horas}</b> horas de labores, en las cuales realizó actividades como:</div><ul style="list-style-type:disc;padding-left:20px;margin:0.5rem 0;color:var(--text-secondary);">{#each activityItems() as item}<li style="margin-bottom:4px;">{item}</li>{/each}</ul><div style="text-align:justify;padding-top:0.25rem;">Sin otro particular, quedo a sus apreciables órdenes.</div><div style="text-align:center;padding-top:2rem;color:var(--text-primary);"><div style="font-weight:700;letter-spacing:0.1em;font-size:10px;">ATENTAMENTE</div><div style="height:48px;"></div><div style="font-weight:800;border-top:1px solid var(--border);padding-top:4px;width:75%;margin:0 auto;font-size:11px;">{form.responsable || '[Responsable]'}</div><div style="color:var(--text-muted);font-size:9px;">{form.cargo || '[Cargo del Responsable]'}</div></div></PreviewPanel></div></div>
  </div>
</main>
