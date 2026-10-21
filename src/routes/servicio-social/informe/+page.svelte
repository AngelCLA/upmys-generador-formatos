<script>
  import { onMount } from 'svelte';
  import Building2 from '@lucide/svelte/icons/building-2';
  import FileText from '@lucide/svelte/icons/file-text';
  import User from '@lucide/svelte/icons/user';
  import Header from '$lib/components/Header.svelte';
  import Stepper from '$lib/components/Stepper.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import SelectField from '$lib/components/SelectField.svelte';
  import RadioGroup from '$lib/components/RadioGroup.svelte';
  import FormNav from '$lib/components/FormNav.svelte';
  import PreviewPanel from '$lib/components/PreviewPanel.svelte';
  import { carreras } from '$lib/data/carreras.js';
  import { exportToDocx, fetchImageAsUint8Array, imagePara, pageBreakPara } from '$lib/utils/exportWord.js';
  import {
    AlignmentType,
    BorderStyle,
    Footer,
    HeightRule,
    PageNumber,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType
  } from 'docx';
  import { loadFormMemory, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { fileSafeName, formatDateText, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'servicio-social.informe';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    matricula: 'student.matricula',
    institucion: 'organization.name',
    proyecto: 'project.name',
    asesorNombre: 'person.advisor',
    asesorCargo: 'person.cargo'
  };
  const MODALIDADES = ['Unidisciplinario', 'Multidisciplinario'];
  const DOCX_FONT = 'Times New Roman';
  const BODY_SIZE = 22;
  const BODY_LINE = 240;
  const TITLE_LINE = 300;
  const DATA_ROW_HEIGHTS = [382, 434, 390, 279, 450, 405, 360, 450, 526, 526];

  const today = new Date();
  const periodStart = toInputDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const periodEnd = toInputDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const steps = [
    { label: 'Alumno', icon: User },
    { label: 'Programa', icon: Building2 },
    { label: 'Informe', icon: FileText }
  ];

  let currentStep = $state(1);
  let memoryReady = $state(false);
  let formElement;
  let form = $state({
    fecha: toInputDate(),
    lugar: 'La Cruz, Elota, Sinaloa. Mex.',
    apellidos: '',
    nombres: '',
    nombre: '',
    carrera: '',
    matricula: '',
    institucion: '',
    dependencia: '',
    departamento: '',
    proyecto: '',
    modalidad: '',
    inicio: periodStart,
    fin: periodEnd,
    numeroInforme: '',
    horasReportadas: '',
    horasAcumuladas: '',
    actividades: '',
    observaciones: '',
    asesorNombre: '',
    asesorCargo: ''
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

  function formatShortDate(dateStr, fallback = '[Periodo]') {
    if (!dateStr) return fallback;
    const [year, month, day] = String(dateStr).split('-');
    if (!year || !month || !day) return fallback;
    return `${day}/${month}/${year}`;
  }

  function activitiesLines() {
    return String(form.actividades ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function observacionesText() {
    return String(form.observaciones ?? '').trim().replace(/\.+$/, '');
  }

  function previewRows() {
    return [
      ['Unidad Académica :', 'Universidad Politécnica del Mar y la Sierra'],
      ['Carrera:', form.carrera || '[Carrera]'],
      ['Nombre del Prestatario :', fullStudentName() || '[Nombre del Prestatario]'],
      ['Matrícula del Estudiante:', form.matricula || '[Matrícula]'],
      ['Organismo Receptor :', form.institucion || '[Organismo Receptor]'],
      ['Dependencia:', form.dependencia || '[Dependencia]'],
      ['Departamento:', form.departamento || '[Departamento]'],
      ['Nombre del Proyecto:', form.proyecto || '[Proyecto]'],
      ['Modalidad de Prestación del Servicio Social:', form.modalidad || '[Modalidad]'],
      [
        'Periodo que cubre el Informe:',
        `${formatShortDate(form.inicio, '[Periodo]')} al ${formatShortDate(form.fin, '[Periodo]')}`
      ]
    ];
  }

  function docxRun(text, opts = {}) {
    const options = {
      text: String(text ?? ''),
      font: DOCX_FONT,
      size: opts.size ?? BODY_SIZE,
      bold: opts.bold ?? false,
      italics: opts.italics ?? false
    };

    if (opts.break !== undefined) options.break = opts.break;
    return new TextRun(options);
  }

  function docxPara(children, opts = {}) {
    return new Paragraph({
      children: Array.isArray(children) ? children : [children],
      alignment: opts.alignment,
      spacing: { line: opts.line ?? BODY_LINE, after: opts.after ?? 0 },
      indent: opts.indent
    });
  }

  function blankDocxParas(count, lineSpacing) {
    return Array.from(
      { length: count },
      () => new Paragraph({ children: [], spacing: { line: lineSpacing } })
    );
  }

  function docxBorder(style) {
    return { style, size: 4, color: '000000' };
  }

  function doubleCellBorders() {
    return {
      top: docxBorder(BorderStyle.DOUBLE),
      bottom: docxBorder(BorderStyle.DOUBLE),
      left: docxBorder(BorderStyle.DOUBLE),
      right: docxBorder(BorderStyle.DOUBLE)
    };
  }

  function noCellBorders() {
    const none = { style: BorderStyle.NONE, size: 0, color: '000000' };
    return { top: none, bottom: none, left: none, right: none };
  }

  function noTableBorders() {
    const none = { style: BorderStyle.NONE, size: 0, color: '000000' };
    return {
      top: none,
      bottom: none,
      left: none,
      right: none,
      insideHorizontal: none,
      insideVertical: none
    };
  }

  function mainTableBorders(rowIndex, columnIndex, lastRowIndex) {
    return {
      top: docxBorder(rowIndex === 0 ? BorderStyle.DOUBLE : BorderStyle.SINGLE),
      bottom: docxBorder(rowIndex === lastRowIndex ? BorderStyle.DOUBLE : BorderStyle.SINGLE),
      left: docxBorder(columnIndex === 0 ? BorderStyle.DOUBLE : BorderStyle.SINGLE),
      right: docxBorder(columnIndex === 1 ? BorderStyle.DOUBLE : BorderStyle.SINGLE)
    };
  }

  function mainTableCell(text, width, borders, bold) {
    return new TableCell({
      children: [docxPara([docxRun(text, { bold })], { alignment: AlignmentType.CENTER })],
      width: { size: width, type: WidthType.DXA },
      borders,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 40, bottom: 40, left: 80, right: 80 }
    });
  }

  function borderlessCell(paragraphs, width) {
    return new TableCell({
      children: paragraphs,
      width: { size: width, type: WidthType.DXA },
      borders: noCellBorders(),
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
  }

  function reportCell(runs, width) {
    return borderlessCell([docxPara(runs, { alignment: AlignmentType.LEFT })], width);
  }

  function buildFooter() {
    return new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: BODY_LINE, after: 0 },
          children: [
            new TextRun({ text: 'Página ', font: DOCX_FONT, size: BODY_SIZE }),
            new TextRun({
              children: [PageNumber.CURRENT],
              font: DOCX_FONT,
              size: BODY_SIZE,
              bold: true
            }),
            new TextRun({ text: ' de ', font: DOCX_FONT, size: BODY_SIZE }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              font: DOCX_FONT,
              size: BODY_SIZE,
              bold: true
            })
          ]
        })
      ]
    });
  }

  function buildDataTable() {
    const rows = [
      ['Unidad Académica :', 'Universidad Politécnica del Mar y la Sierra'],
      ['Carrera:', form.carrera],
      ['Nombre del Prestatario :', fullStudentName()],
      ['Matrícula del Estudiante:', form.matricula],
      ['Organismo Receptor :', form.institucion],
      ['Dependencia:', form.dependencia],
      ['Departamento:', form.departamento],
      ['Nombre del Proyecto:', form.proyecto],
      ['Modalidad de Prestación del Servicio Social:', form.modalidad],
      [
        'Periodo que cubre el Informe:',
        `${formatShortDate(form.inicio)}      al    ${formatShortDate(form.fin)}`
      ]
    ];
    const lastRowIndex = rows.length - 1;

    return new Table({
      width: { size: 8833, type: WidthType.DXA },
      columnWidths: [3315, 5518],
      indent: { size: 264, type: WidthType.DXA },
      rows: rows.map(([label, value], index) => new TableRow({
        height: { value: DATA_ROW_HEIGHTS[index], rule: HeightRule.ATLEAST },
        children: [
          mainTableCell(label, 3315, mainTableBorders(index, 0, lastRowIndex), true),
          mainTableCell(value, 5518, mainTableBorders(index, 1, lastRowIndex), false)
        ]
      }))
    });
  }

  function buildReportLine() {
    return new Table({
      width: { size: 8838, type: WidthType.DXA },
      columnWidths: [3000, 2900, 2938],
      borders: noTableBorders(),
      rows: [
        new TableRow({
          children: [
            reportCell([docxRun('Número de Informe: '), docxRun(form.numeroInforme)], 3000),
            reportCell([
              docxRun('Horas Reportadas: '),
              docxRun(form.horasReportadas),
              docxRun(' horas', { bold: true })
            ], 2900),
            reportCell([
              docxRun('Horas Acumuladas: '),
              docxRun(form.horasAcumuladas),
              docxRun(' horas', { bold: true })
            ], 2938)
          ]
        })
      ]
    });
  }

  function buildSignatureBlock() {
    const labels = new Table({
      width: { size: 8832, type: WidthType.DXA },
      columnWidths: [4416, 4416],
      borders: noTableBorders(),
      rows: [
        new TableRow({
          children: [
            borderlessCell(
              [docxPara([docxRun('Asesor – Supervisor', { italics: true })], { alignment: AlignmentType.CENTER })],
              4416
            ),
            borderlessCell(
              [docxPara([docxRun('Prestador de Servicio Social', { italics: true })], { alignment: AlignmentType.CENTER })],
              4416
            )
          ]
        })
      ]
    });

    const signatures = new Table({
      width: { size: 8832, type: WidthType.DXA },
      columnWidths: [4416, 4416],
      borders: noTableBorders(),
      rows: [
        new TableRow({
          children: [
            borderlessCell([
              docxPara([docxRun('_'.repeat(28))], { alignment: AlignmentType.CENTER }),
              docxPara([docxRun(form.asesorNombre)], { alignment: AlignmentType.CENTER }),
              docxPara([docxRun(form.asesorCargo, { size: 20 })], { alignment: AlignmentType.CENTER })
            ], 4416),
            borderlessCell([
              docxPara([docxRun('_'.repeat(28))], { alignment: AlignmentType.CENTER }),
              docxPara([docxRun(fullStudentName())], { alignment: AlignmentType.CENTER })
            ], 4416)
          ]
        })
      ]
    });

    return [labels, ...blankDocxParas(3, BODY_LINE), signatures];
  }

  function buildActivitiesTable() {
    const paragraphs = [
      docxPara([docxRun('Actividades Realizadas:', { bold: true })], { after: 120 })
    ];
    const lines = activitiesLines();

    if (lines.length === 0) {
      paragraphs.push(docxPara([], { line: BODY_LINE }));
    } else {
      for (const line of lines) {
        paragraphs.push(docxPara([docxRun(line)], {
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 708 }
        }));
      }
    }

    return new Table({
      width: { size: 9510, type: WidthType.DXA },
      columnWidths: [9510],
      rows: [
        new TableRow({
          height: { value: 4575, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              children: paragraphs,
              width: { size: 9510, type: WidthType.DXA },
              borders: doubleCellBorders(),
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 40, bottom: 40, left: 80, right: 80 }
            })
          ]
        })
      ]
    });
  }

  function buildObservationsTable() {
    return new Table({
      width: { size: 9524, type: WidthType.DXA },
      columnWidths: [9524],
      rows: [
        new TableRow({
          height: { value: 2623, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              children: [
                docxPara([docxRun('Observaciones:', { bold: true })], { after: 120 }),
                docxPara(
                  [docxRun(`Considero que mis actividades realizadas fueron ${observacionesText()}.`)],
                  { alignment: AlignmentType.JUSTIFIED }
                )
              ],
              width: { size: 9524, type: WidthType.DXA },
              borders: doubleCellBorders(),
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 40, bottom: 40, left: 80, right: 80 }
            })
          ]
        })
      ]
    });
  }

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);

    const logoData = await fetchImageAsUint8Array('/Logo-1.png');
    const lugar = String(form.lugar ?? '').trim();

    const children = [];

    children.push(imagePara(logoData, { width: 113, height: 68, alignment: AlignmentType.LEFT }));

    children.push(docxPara([
      docxRun('UNIVERSIDAD POLITÉCNICA DEL', { bold: true, size: 48 }),
      docxRun('MAR Y LA SIERRA', { bold: true, size: 48, break: 1 })
    ], { alignment: AlignmentType.CENTER, line: TITLE_LINE }));

    children.push(docxPara([docxRun('Vinculación Social', { size: 32 })], {
      alignment: AlignmentType.CENTER,
      line: TITLE_LINE
    }));

    children.push(docxPara([docxRun('INFORME PERIÓDICO DE SERVICIO SOCIAL', { bold: true, size: 28 })], {
      alignment: AlignmentType.CENTER,
      line: TITLE_LINE
    }));

    children.push(docxPara(
      [docxRun(`${lugar}, a ${formatDateText(form.fecha)}`, { italics: true })],
      { alignment: AlignmentType.RIGHT }
    ));

    children.push(buildDataTable());
    children.push(buildReportLine());
    children.push(...buildSignatureBlock());
    children.push(new Paragraph({ children: [], spacing: { line: BODY_LINE } }));
    children.push(pageBreakPara());
    children.push(buildActivitiesTable());
    children.push(new Paragraph({ children: [], spacing: { line: 2160, after: 0 } }));
    children.push(buildObservationsTable());

    const footer = buildFooter();

    await exportToDocx({
      sections: [{
        children,
        margin: '0.98in 1.18in 0.98in 1.18in',
        footers: { default: footer }
      }],
      filename: `Informe_SS_${fileSafeName(nombreAlumno)}`,
      margin: '0.98in 1.18in 0.98in 1.18in'
    });
  }
</script>

<svelte:head><title>Informe Periódico de Servicio Social - UPMYS</title></svelte:head>

<Header title="Informe Periódico de Servicio Social" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">Completa los datos para generar el informe periódico de Servicio Social.</p>
      <Stepper {steps} {currentStep} />
      <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><User size={20} /> Paso 1: Datos del Alumno</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Fecha" type="date" bind:value={form.fecha} required />
                <FormInput label="Lugar" bind:value={form.lugar} required help="Este dato aparece en la línea de lugar y fecha." />
                <div class="form-grid form-grid-2">
                  <FormInput label="Apellidos" bind:value={form.apellidos} placeholder="Ej. PÉREZ GARCÍA" required memoryKey="student.lastName" />
                  <FormInput label="Nombre(s)" bind:value={form.nombres} placeholder="Ej. JUAN CARLOS" required memoryKey="student.firstName" />
                </div>
                <SelectField label="Carrera" bind:value={form.carrera} options={carreras} placeholder="Seleccione su carrera..." required />
                <FormInput label="Matrícula" bind:value={form.matricula} placeholder="Ej. 00000000" required memoryKey="student.matricula" />
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><Building2 size={20} /> Paso 2: Datos del Programa</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <FormInput label="Organismo receptor" bind:value={form.institucion} placeholder="Nombre de la institución u organismo receptor" required memoryKey="organization.name" />
                <FormInput label="Dependencia" bind:value={form.dependencia} placeholder="Nombre de la dependencia" required />
                <FormInput label="Departamento" bind:value={form.departamento} placeholder="Nombre del departamento" required />
                <FormInput label="Nombre del proyecto" bind:value={form.proyecto} placeholder="Nombre del proyecto" required memoryKey="project.name" />
                <div>
                  <div class="label-text" style="margin-bottom: 0.5rem;">Modalidad <span style="color: var(--error);">*</span></div>
                  <RadioGroup name="modalidad" bind:value={form.modalidad} options={MODALIDADES} required />
                </div>
                <div class="form-grid form-grid-2">
                  <FormInput label="Fecha de inicio" type="date" bind:value={form.inicio} required />
                  <FormInput label="Fecha de fin" type="date" bind:value={form.fin} min={form.inicio} required />
                </div>
                <div class="conditional-section">
                  <strong>Unidad Académica:</strong> Universidad Politécnica del Mar y la Sierra
                </div>
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><FileText size={20} /> Paso 3: Datos del Informe</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <div class="form-grid form-grid-2">
                  <FormInput label="Número de informe" bind:value={form.numeroInforme} placeholder="Ej. 03" required />
                  <FormInput label="Horas reportadas" type="number" min={0} bind:value={form.horasReportadas} placeholder="Ej. 40" required />
                  <FormInput label="Horas acumuladas" type="number" min={0} bind:value={form.horasAcumuladas} placeholder="Ej. 480" required />
                </div>
                <FormInput label="Actividades" type="textarea" rows={5} bind:value={form.actividades} required help="Escribe una actividad por línea." />
                <FormInput label="Observaciones" type="textarea" rows={3} bind:value={form.observaciones} required help="Completa la frase: Considero que mis actividades realizadas fueron..." />
                <FormInput label="Nombre del asesor" bind:value={form.asesorNombre} placeholder="Nombre completo del asesor" required memoryKey="person.advisor" />
                <FormInput label="Cargo del asesor" bind:value={form.asesorCargo} placeholder="Cargo del asesor" required memoryKey="person.cargo" />
              </div>
            </div>
          {/if}

          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Informe (.docx)" />
        </div>
      </form>
    </div>
    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Vista Previa del Informe" badge="Formato 03">
          <div style="font-size:10px;line-height:1.4;color:var(--text-secondary);">
            <img src="/Logo-2.png" alt="Logo UPMYS" style="width:70px;height:auto;display:block;margin-bottom:4px;" />
            <div style="text-align:center;font-weight:800;font-size:10px;line-height:1.25;">UNIVERSIDAD POLITÉCNICA DEL<br />MAR Y LA SIERRA</div>
            <div style="text-align:center;">Vinculación Social</div>
            <div style="text-align:center;font-weight:800;">INFORME PERIÓDICO DE SERVICIO SOCIAL</div>
            <div style="text-align:right;font-style:italic;margin:6px 0;">{form.lugar || '[Lugar]'}, a {formatDateText(form.fecha)}</div>

            <table style="width:100%;border-collapse:collapse;border:3px double var(--text-primary);font-size:9.5px;line-height:1.3;">
              <tbody>
                {#each previewRows() as row, index}
                  <tr>
                    <td style="width:38%;padding:2px 4px;font-weight:700;border-right:1px solid var(--border);{index > 0 ? 'border-top:1px solid var(--border);' : ''}">{row[0]}</td>
                    <td style="padding:2px 4px;{index > 0 ? 'border-top:1px solid var(--border);' : ''}">{row[1]}</td>
                  </tr>
                {/each}
              </tbody>
            </table>

            <div style="display:flex;gap:4px;font-size:9px;padding:4px 2px;">
              <div style="flex:1;">Número de Informe: {form.numeroInforme || '[Número]'}</div>
              <div style="flex:1;">Horas Reportadas: {form.horasReportadas || '[Horas]'} <b>horas</b></div>
              <div style="flex:1;">Horas Acumuladas: {form.horasAcumuladas || '[Horas]'} <b>horas</b></div>
            </div>

            <div style="display:flex;gap:12px;text-align:center;font-size:9px;margin-top:4px;">
              <div style="flex:1;">
                <div style="font-style:italic;">Asesor – Supervisor</div>
                <div style="height:16px;"></div>
                <div>____________________________</div>
                <div>{form.asesorNombre || '[Nombre del Asesor]'}</div>
                <div style="font-size:8px;">{form.asesorCargo || '[Cargo]'}</div>
              </div>
              <div style="flex:1;">
                <div style="font-style:italic;">Prestador de Servicio Social</div>
                <div style="height:16px;"></div>
                <div>____________________________</div>
                <div>{fullStudentName() || '[Nombre del Alumno]'}</div>
              </div>
            </div>

            <div style="text-align:center;font-size:8px;letter-spacing:0.08em;color:var(--text-muted);border-top:1px solid var(--border);margin:10px 0 6px;padding-top:4px;">Página 2</div>

            <div style="border:3px double var(--text-primary);padding:6px;min-height:88px;">
              <div style="font-weight:700;margin-bottom:4px;">Actividades Realizadas:</div>
              {#if activitiesLines().length}
                {#each activitiesLines() as line}
                  <div style="text-align:justify;text-indent:14px;">{line}</div>
                {/each}
              {:else}
                <div>[Actividades realizadas]</div>
              {/if}
            </div>

            <div style="border:3px double var(--text-primary);padding:6px;min-height:58px;margin-top:6px;">
              <div style="font-weight:700;margin-bottom:4px;">Observaciones:</div>
              <div style="text-align:justify;">Considero que mis actividades realizadas fueron {form.observaciones || '[Observaciones]'}</div>
            </div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>
