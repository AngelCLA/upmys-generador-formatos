<script>
  import { onMount } from 'svelte';
  import Building2 from '@lucide/svelte/icons/building-2';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import GraduationCap from '@lucide/svelte/icons/graduation-cap';
  import Handshake from '@lucide/svelte/icons/handshake';
  import Plus from '@lucide/svelte/icons/plus';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Header from '$lib/components/Header.svelte';
  import Stepper from '$lib/components/Stepper.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import SelectField from '$lib/components/SelectField.svelte';
  import FormNav from '$lib/components/FormNav.svelte';
  import PreviewPanel from '$lib/components/PreviewPanel.svelte';
  import { carreras } from '$lib/data/carreras.js';
  import { exportToDocx, fetchImageAsUint8Array, bold, plain, cell, row, table, para, headerPara, imagePara, pageBreakPara, CELL_BORDERS_STYLE, NO_BORDERS_STYLE } from '$lib/utils/exportWord.js';
  import { Paragraph, TextRun, AlignmentType, VerticalAlign, ShadingType, BorderStyle, WidthType, Table, TableRow, TableCell, ImageRun } from 'docx';
  import { loadFormMemory, rememberFieldValue, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { addMonths, fileSafeName, formatDateText, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'estadia.plan-trabajo';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    matricula: 'student.matricula',
    orNombre: 'organization.name',
    orRazon: 'organization.legalName',
    orRfc: 'organization.rfc',
    orDomicilio: 'organization.address',
    orMunicipio: 'address.municipio',
    orEstado: 'address.estado',
    orTelefono: 'contact.phone',
    orFax: 'contact.fax',
    orDirector: 'person.responsible',
    orDirectorCargo: 'person.cargo',
    deptAsignado: 'organization.area',
    asesorNombre: 'person.advisor',
    asesorCargo: 'person.cargo',
    asesorTel: 'contact.phone',
    asesorCorreo: 'contact.email'
  };

  const steps = [{ label: 'Académico' }, { label: 'Organismo' }, { label: 'Asesor' }, { label: 'Cronograma' }];
  const periodos = ['ESTADÍA', 'ESTANCÍA 1', 'ESTANCÍA 2', 'ESTADÍA 1', 'ESTADÍA 2'];
  const giros = ['Industrial', 'Comercial', 'Servicios'];
  const tamanos = ['Micro', 'Pequeña', 'Mediana', 'Grande'];
  const sectores = ['Privado', 'Público', 'Social'];

  let currentStep = $state(1);
  let memoryReady = $state(false);
  let formElement;
  let form = $state({
    asignatura: 'ESTADÍA',
    fecha: toInputDate(),
    periodoInicio: toInputDate(),
    periodoFin: toInputDate(addMonths(new Date(), 4)),
    apellidos: '',
    nombres: '',
    nombre: '',
    carrera: '',
    matricula: '',
    orNombre: '',
    orRazon: '',
    orRfc: '',
    orDomicilio: '',
    orMunicipio: 'ELOTA',
    orEstado: 'SINALOA',
    orTelefono: '',
    orFax: '',
    orDirector: '',
    orDirectorCargo: '',
    orGiro: 'Industrial',
    orTamano: 'Micro',
    orSector: 'Privado',
    deptAsignado: '',
    asesorNombre: '',
    asesorCargo: '',
    asesorTel: '',
    asesorCorreo: '',
    actividades: [{ descripcion: '', del: '', al: '' }]
  });

  let periodoTexto = $derived(formatPeriod(form.periodoInicio, form.periodoFin));

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

  function keepOnlyNumbers(event, fieldName) {
    const value = event.currentTarget.value.replace(/\D/g, '');
    event.currentTarget.value = value;
    form[fieldName] = value;
  }

  function addActivity() {
    form.actividades = [...form.actividades, { descripcion: '', del: '', al: '' }];
  }

  function removeActivity(index) {
    form.actividades = form.actividades.filter((_, itemIndex) => itemIndex !== index);
  }

  function formatDateShort(dateStr, fallback = '') {
    if (!dateStr) return fallback;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatPeriod(start, end) {
    if (!start || !end) return '-';

    const [startYear, startMonth, startDay] = start.split('-').map(Number);
    const [endYear, endMonth, endDay] = end.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    const startMonthText = startDate.toLocaleDateString('es-ES', { month: 'long' });
    const endMonthText = endDate.toLocaleDateString('es-ES', { month: 'long' });

    if (startMonthText === endMonthText && startYear === endYear) {
      return `${startDay} al ${endDay} de ${endMonthText} de ${endYear}`;
    }

    return `${startDay} de ${startMonthText} al ${endDay} de ${endMonthText} de ${endYear}`;
  }

  function htmlValue(value, fallback = '') {
    return escapeHtml(value || fallback);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  const TABLE_BORDERS = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  };

  const COL2 = [5400, 5400];
  const COL3 = [3600, 3600, 3600];
  const COL3_ACT = [5400, 2700, 2700];

  async function buildHeaderChildren(logoData) {
    return [
      table([
        row([
          cell([imagePara(logoData, { width: 72, height: 43 })], { verticalAlign: VerticalAlign.CENTER, borders: NO_BORDERS_STYLE() }),
          cell([
            new Paragraph({ children: [new TextRun({ text: 'PLAN DE TRABAJO ESTADÍA', bold: true, font: 'Arial', size: 28 })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [new TextRun({ text: 'Universidad Politécnica del Mar y la Sierra', font: 'Arial', size: 18 })], alignment: AlignmentType.CENTER }),
          ], { verticalAlign: VerticalAlign.CENTER, borders: NO_BORDERS_STYLE() }),
          cell([new Paragraph({ children: [new TextRun({ text: 'F-03', bold: true, font: 'Arial', size: 26 })], alignment: AlignmentType.RIGHT })], { verticalAlign: VerticalAlign.CENTER, borders: NO_BORDERS_STYLE() }),
        ]),
      ], { columnWidths: [1620, 7560, 1620] }),
      new Paragraph({
        children: [],
        spacing: { before: 0, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } },
      }),
    ];
  }

  function sh(title, colSpan) {
    return row([cell([new Paragraph({ children: [new TextRun({ text: title, bold: true, font: 'Arial', size: 21 })], alignment: AlignmentType.CENTER })], { columnSpan: colSpan, shading: 'f2f2f2' })]);
  }

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);
    for (const activity of form.actividades) {
      rememberFieldValue('activity.description', activity.descripcion);
    }

    const logoData = await fetchImageAsUint8Array(`${location.origin}/Logo-1.png`);
    const headerChildren = await buildHeaderChildren(logoData);
    const children = [];

    children.push(...headerChildren);
    children.push(new Paragraph({ children: [bold('Fecha: '), plain(formatDateText(form.fecha))], alignment: AlignmentType.RIGHT, spacing: { after: 200 } }));

    // a) DATOS DE LA ESTADÍA
    children.push(table([
      sh('a) DATOS DE LA ESTADÍA', 2),
      row([
        cell([new Paragraph({ children: [bold('Asignatura: '), plain(form.asignatura)] })]),
        cell([new Paragraph({ children: [bold('Periodo: '), plain(periodoTexto)] })]),
      ]),
    ], { columnWidths: COL2, borders: TABLE_BORDERS }));

    // b) DATOS DEL ALUMNO
    children.push(table([
      sh('b) DATOS DEL ALUMNO', 2),
      row([cell([new Paragraph({ children: [bold('Nombre: '), plain(nombreAlumno)] })], { columnSpan: 2 })]),
      row([
        cell([new Paragraph({ children: [bold('Carrera: '), plain(form.carrera)] })]),
        cell([new Paragraph({ children: [bold('Matrícula: '), plain(form.matricula)] })]),
      ]),
    ], { columnWidths: COL2, borders: TABLE_BORDERS }));

    // c) DATOS DEL ORGANISMO RECEPTOR
    children.push(table([
      sh('c) DATOS DEL ORGANISMO RECEPTOR', 3),
      row([cell([new Paragraph({ children: [bold('Nombre del Organismo Receptor: '), plain(form.orNombre)] })], { columnSpan: 3 })]),
      row([
        cell([new Paragraph({ children: [bold('Razón Social: '), plain(form.orRazon)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('R.F.C: '), plain(form.orRfc)] })]),
      ]),
      row([cell([new Paragraph({ children: [bold('Domicilio del O.R: '), plain(form.orDomicilio)] })], { columnSpan: 3 })]),
      row([
        cell([new Paragraph({ children: [bold('Municipio: '), plain(form.orMunicipio)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('Estado: '), plain(form.orEstado)] })]),
      ]),
      row([
        cell([new Paragraph({ children: [bold('Persona de Mayor Rango en el O.R: '), plain(form.orDirector)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('Cargo: '), plain(form.orDirectorCargo)] })]),
      ]),
      row([
        cell([new Paragraph({ children: [bold('Giro: '), plain(form.orGiro)], alignment: AlignmentType.CENTER })], { shading: 'fafafa' }),
        cell([new Paragraph({ children: [bold('Tamaño: '), plain(form.orTamano)], alignment: AlignmentType.CENTER })], { shading: 'fafafa' }),
        cell([new Paragraph({ children: [bold('Sector: '), plain(form.orSector)], alignment: AlignmentType.CENTER })], { shading: 'fafafa' }),
      ]),
      row([
        cell([new Paragraph({ children: [bold('Teléfono: '), plain(form.orTelefono)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('Fax: '), plain(form.orFax)] })]),
      ]),
    ], { columnWidths: COL3, borders: TABLE_BORDERS }));

    // d) ACTIVIDAD DEL ORGANISMO RECEPTOR
    children.push(table([
      sh('d) ACTIVIDAD DEL ORGANISMO RECEPTOR', 2),
      row([cell([new Paragraph({ children: [bold('Área / Departamento al que fue asignado el alumno: '), plain(form.deptAsignado)] })], { columnSpan: 2 })]),
      row([cell([new Paragraph({ children: [bold('Nombre del asesor en el O.R. del alumno: '), plain(form.asesorNombre)] })], { columnSpan: 2 })]),
      row([
        cell([new Paragraph({ children: [bold('Cargo: '), plain(form.asesorCargo)] })]),
        cell([new Paragraph({ children: [bold('Teléfono: '), plain(form.asesorTel)] })]),
      ]),
      row([cell([new Paragraph({ children: [bold('Correo Electrónico: '), plain(form.asesorCorreo)] })], { columnSpan: 2 })]),
    ], { columnWidths: COL2, borders: TABLE_BORDERS }));

    children.push(pageBreakPara());
    children.push(...await buildHeaderChildren(logoData));

    children.push(new Paragraph({ children: [new TextRun({ text: 'e) PROGRAMACIÓN DE ACTIVIDADES', bold: true, font: 'Arial', size: 21 })], spacing: { after: 200 } }));

    // e) ACTIVIDADES
    const totalRows = Math.max(form.actividades.length, 7);
    const activityRows = [];
    activityRows.push(row([
      cell([new Paragraph({ children: [new TextRun({ text: 'ACTIVIDADES', bold: true, font: 'Arial', size: 21 })], alignment: AlignmentType.CENTER })], { shading: 'f2f2f2' }),
      cell([new Paragraph({ children: [new TextRun({ text: 'DEL', bold: true, font: 'Arial', size: 21 })], alignment: AlignmentType.CENTER })], { shading: 'f2f2f2' }),
      cell([new Paragraph({ children: [new TextRun({ text: 'AL', bold: true, font: 'Arial', size: 21 })], alignment: AlignmentType.CENTER })], { shading: 'f2f2f2' }),
    ]));

    for (let index = 0; index < totalRows; index++) {
      const activity = form.actividades[index];
      activityRows.push(row([
        cell([new Paragraph({ children: activity ? [bold(`${index + 1}.- `), plain(activity.descripcion || '')] : [plain('\u00A0')], spacing: { after: 0 } })]),
        cell([new Paragraph({ children: [plain(activity?.del ? formatDateShort(activity.del) : '\u00A0')], alignment: AlignmentType.CENTER })]),
        cell([new Paragraph({ children: [plain(activity?.al ? formatDateShort(activity.al) : '\u00A0')], alignment: AlignmentType.CENTER })]),
      ]));
    }

    children.push(table(activityRows, { columnWidths: COL3_ACT, borders: TABLE_BORDERS }));

    // Firma
    children.push(table([
      row([cell([new Paragraph({ children: [new TextRun({ text: 'Datos de la persona responsable en el O.R. de la aceptación del alumno para el cumplimiento de su estadía, según lo establecido en el presente documento.', bold: true, font: 'Arial', size: 21 })], alignment: AlignmentType.CENTER })], { columnSpan: 3, shading: 'f2f2f2' })]),
      row([
        cell([
          new Paragraph({ children: [bold('NOMBRE: '), plain(form.asesorNombre)], spacing: { after: 0 } }),
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [bold('CARGO: '), plain(form.asesorCargo)], spacing: { after: 0 } }),
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [bold('FECHA: '), plain(formatDateText(form.fecha))], spacing: { after: 0 } }),
        ], { verticalAlign: VerticalAlign.TOP }),
        cell([
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [new TextRun({ text: '_______________________', font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
          new Paragraph({ children: [new TextRun({ text: 'FIRMA', font: 'Arial', size: 18 })], alignment: AlignmentType.CENTER }),
        ], { verticalAlign: VerticalAlign.BOTTOM }),
        cell([
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [], spacing: { after: 0 } }),
          new Paragraph({ children: [new TextRun({ text: '_______________________', font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
          new Paragraph({ children: [new TextRun({ text: 'SELLO DEL O.R.', font: 'Arial', size: 18 })], alignment: AlignmentType.CENTER }),
        ], { verticalAlign: VerticalAlign.BOTTOM }),
      ]),
    ], { columnWidths: COL3, borders: TABLE_BORDERS }));

    children.push(new Paragraph({ children: [new TextRun({ text: 'Documento controlado por medios electrónicos. Para uso exclusivo de la Universidad Politécnica del Mar y la Sierra.', font: 'Arial', size: 15, color: '555555' })], alignment: AlignmentType.CENTER, spacing: { before: 576 } }));

    await exportToDocx({
      sections: [{ children, margin: '0.45in 0.55in 0.45in 0.55in' }],
      filename: `Plan_Trabajo_Estadia_${fileSafeName(nombreAlumno || form.matricula)}`,
      margin: '0.45in 0.55in 0.45in 0.55in',
    });
  }
</script>

<svelte:head>
  <title>Generador de Plan de Trabajo - UPMYS F-03</title>
</svelte:head>

<Header title="Generador de Plan de Trabajo" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin-bottom: 1.5rem;">
        Completa los datos del Organismo Receptor y define el cronograma de actividades para tu Estadía.
      </p>

      <Stepper {steps} {currentStep} />

      <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header">
                <h2><GraduationCap size={20} /> Paso 1: Datos Generales y del Alumno</h2>
              </div>

              <div class="form-grid form-grid-2" style="margin-bottom: 1.25rem;">
                <SelectField label="Periodo" bind:value={form.asignatura} options={periodos} placeholder="" required />
                <FormInput label="Fecha de Registro" type="date" bind:value={form.fecha} required />
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <div class="label-text">Periodo del Plan de Trabajo <span style="color: var(--error);">*</span></div>
                <div class="form-grid form-grid-2">
                  <FormInput label="Fecha de Inicio" type="date" bind:value={form.periodoInicio} required />
                  <FormInput label="Fecha de Fin" type="date" bind:value={form.periodoFin} required />
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="form-grid form-grid-2">
                  <FormInput
                    label="Apellidos"
                    bind:value={form.apellidos}
                    placeholder="Ej. PÉREZ GARCÍA"
                    memoryKey="student.lastName"
                    required
                  />
                  <FormInput
                    label="Nombre(s)"
                    bind:value={form.nombres}
                    placeholder="Ej. JUAN CARLOS"
                    memoryKey="student.firstName"
                    required
                  />
                </div>
                <div class="form-grid" style="grid-template-columns: 2fr 1fr;">
                  <SelectField
                    label="Carrera"
                    bind:value={form.carrera}
                    options={carreras}
                    placeholder="Seleccione su carrera..."
                    required
                  />
                  <FormInput label="Matrícula" bind:value={form.matricula} placeholder="Ej. 00000000" required oninput={(event) => keepOnlyNumbers(event, 'matricula')} memoryKey="student.matricula" />
                </div>
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header">
                <h2><Building2 size={20} /> Paso 2: Datos del Organismo Receptor</h2>
              </div>

              <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <FormInput
                  label="Nombre del Organismo Receptor"
                  bind:value={form.orNombre}
                  placeholder="Ej. AGRICOLA LA CRUZ S.A."
                  memoryKey="organization.name"
                  required
                />
                <div class="form-grid form-grid-2">
                  <FormInput label="Razón Social" bind:value={form.orRazon} placeholder="Razón Social" memoryKey="organization.legalName" />
                  <FormInput label="R.F.C." bind:value={form.orRfc} placeholder="R.F.C. de la empresa" memoryKey="organization.rfc" />
                </div>
                <FormInput
                  label="Domicilio del Organismo Receptor (Completo)"
                  bind:value={form.orDomicilio}
                  placeholder="Calle, Número, Colonia"
                  memoryKey="organization.address"
                  required
                />
                <div class="form-grid form-grid-2">
                  <FormInput label="Municipio" bind:value={form.orMunicipio} required memoryKey="address.municipio" />
                  <FormInput label="Estado" bind:value={form.orEstado} required memoryKey="address.estado" />
                </div>
                <div class="form-grid form-grid-2">
                  <FormInput label="Teléfono del O.R." type="tel" bind:value={form.orTelefono} placeholder="Teléfono" oninput={(event) => keepOnlyNumbers(event, 'orTelefono')} memoryKey="contact.phone" />
                  <FormInput label="Fax" type="tel" bind:value={form.orFax} placeholder="Fax" oninput={(event) => keepOnlyNumbers(event, 'orFax')} memoryKey="contact.fax" />
                </div>
                <div class="form-grid form-grid-2">
                  <FormInput
                    label="Persona de Mayor Rango en el O.R."
                    bind:value={form.orDirector}
                    placeholder="Nombre completo del Director/Gerente"
                    memoryKey="person.responsible"
                    required
                  />
                  <FormInput
                    label="Cargo de la Persona de Mayor Rango"
                    bind:value={form.orDirectorCargo}
                    placeholder="Ej. Director General"
                    memoryKey="person.cargo"
                    required
                  />
                </div>
                <div class="conditional-section">
                  <div class="label-text" style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem;">
                    Clasificación de la Empresa
                  </div>
                  <div class="form-grid form-grid-3">
                    <SelectField label="Giro" bind:value={form.orGiro} options={giros} placeholder="" />
                    <SelectField label="Tamaño" bind:value={form.orTamano} options={tamanos} placeholder="" />
                    <SelectField label="Sector" bind:value={form.orSector} options={sectores} placeholder="" />
                  </div>
                </div>
              </div>
            </div>
          {:else if currentStep === 3}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header">
                <h2><Handshake size={20} /> Paso 3: Actividad en el O.R.</h2>
              </div>

              <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <FormInput
                  label="Área / Departamento al que fue asignado el alumno"
                  bind:value={form.deptAsignado}
                  placeholder="Ej. Departamento de Redes y Telecomunicaciones"
                  memoryKey="organization.area"
                  required
                />
                <FormInput
                  label="Nombre del Asesor en el O.R. (Asesor Externo)"
                  bind:value={form.asesorNombre}
                  placeholder="Ej. Ing. Mateo Domínguez Ramos"
                  memoryKey="person.advisor"
                  required
                />
                <div class="form-grid form-grid-2">
                  <FormInput
                    label="Cargo del Asesor Externo"
                    bind:value={form.asesorCargo}
                    placeholder="Ej. Supervisor de Sistemas"
                    memoryKey="person.cargo"
                    required
                  />
                  <FormInput
                    label="Teléfono del Asesor"
                    type="tel"
                    bind:value={form.asesorTel}
                    placeholder="Número de contacto directo"
                    oninput={(event) => keepOnlyNumbers(event, 'asesorTel')}
                    memoryKey="contact.phone"
                    required
                  />
                </div>
                <FormInput
                  label="Correo Electrónico del Asesor"
                  type="email"
                  bind:value={form.asesorCorreo}
                  placeholder="ejemplo@organizacion.com"
                  memoryKey="contact.email"
                  required
                />
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header">
                <h2><CalendarDays size={20} /> Paso 4: Programación de Actividades</h2>
              </div>
              <p class="help-text" style="margin-bottom: 1.25rem;">
                Añade de forma ordenada las actividades que realizarás en la empresa y el periodo asignado para cada una.
              </p>

              <div style="display: flex; flex-direction: column; gap: 0.875rem;">
                {#each form.actividades as activity, index}
                  <div class="activity-item">
                    <span class="activity-item-number">{index + 1}</span>
                    {#if form.actividades.length > 1}
                      <button type="button" class="activity-item-delete" onclick={() => removeActivity(index)} aria-label="Eliminar actividad">
                        <Trash2 size={16} />
                      </button>
                    {/if}
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                      <FormInput
                        label="Descripción de la Actividad"
                        bind:value={activity.descripcion}
                        placeholder="Ej. Levantamiento de requerimientos y análisis del sistema."
                        memoryKey="activity.description"
                        required
                      />
                      <div class="form-grid form-grid-2">
                        <FormInput label="Del (Inicio)" type="date" bind:value={activity.del} required />
                        <FormInput label="Al (Final)" type="date" bind:value={activity.al} required />
                      </div>
                    </div>
                  </div>
                {/each}
              </div>

              <button type="button" onclick={addActivity} class="btn btn-secondary" style="margin-top: 1rem;">
                <Plus size={16} />
                Agregar Actividad al Cronograma
              </button>
            </div>
          {/if}

          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Plan (.docx)" />
        </div>
      </form>
    </div>

    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Previsualización F-03" badge="Oficial UPMYS">
          <div style="font-family: Arial, sans-serif; font-size: 10px; min-height: 600px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 4px; margin-bottom: 8px;">
              <img src="/Logo-1.png" alt="Logo" width="52" />
              <div style="font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Plan de Trabajo Estadía</div>
              <div style="font-weight: 700; color: var(--text-muted);">F-03</div>
            </div>

            <div style="text-align: right; margin-bottom: 8px;">
              <b>Fecha:</b>
              <span style="border-bottom: 1px solid var(--border); padding: 0 4px; font-weight: 600;">{formatDateText(form.fecha, '-')}</span>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px; margin-bottom: 8px;">
              <div style="font-weight: 700; background: var(--surface-alt); padding: 2px 4px; text-align: center; font-size: 10px;">a) DATOS DE LA ESTADÍA</div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px; gap: 4px;">
                <div><b>Asignatura:</b> <span style="background: var(--warning-bg); padding: 0 4px; font-weight: 700;">{form.asignatura}</span></div>
                <div><b>Periodo:</b> <span style="background: var(--warning-bg); padding: 0 4px; font-weight: 600;">{periodoTexto}</span></div>
              </div>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px; margin-bottom: 8px;">
              <div style="font-weight: 700; background: var(--surface-alt); padding: 2px 4px; text-align: center; font-size: 10px;">b) DATOS DEL ALUMNO</div>
              <div style="margin-top: 4px;"><b>Nombre:</b> <span style="background: var(--warning-bg); padding: 0 4px; font-weight: 700;">{fullStudentName() || '-'}</span></div>
              <div><b>Matrícula:</b> <span style="background: var(--warning-bg); padding: 0 4px; font-weight: 600;">{form.matricula || '-'}</span></div>
              <div><b>Carrera:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.carrera || '-'}</span></div>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px; margin-bottom: 8px;">
              <div style="font-weight: 700; background: var(--surface-alt); padding: 2px 4px; text-align: center; font-size: 10px;">c) DATOS DEL ORGANISMO RECEPTOR</div>
              <div style="margin-top: 4px;"><b>Nombre del Organismo Receptor:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.orNombre || '-'}</span></div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px; margin-top: 4px;">
                <div><b>Razón Social:</b> <span>{form.orRazon || '-'}</span></div>
                <div><b>R.F.C.:</b> <span>{form.orRfc || '-'}</span></div>
              </div>
              <div><b>Domicilio del O.R.:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.orDomicilio || '-'}</span></div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px; margin-top: 4px;">
                <div><b>Municipio:</b> <span>{form.orMunicipio || '-'}</span></div>
                <div><b>Estado:</b> <span>{form.orEstado || '-'}</span></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px; margin-top: 4px;">
                <div><b>Director / Mayor Rango:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.orDirector || '-'}</span></div>
                <div><b>Cargo:</b> <span>{form.orDirectorCargo || '-'}</span></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px; margin-top: 4px;">
                <div><b>Teléfono:</b> <span>{form.orTelefono || '-'}</span></div>
                <div><b>Fax:</b> <span>{form.orFax || '-'}</span></div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; border-top: 1px solid var(--border); padding-top: 4px; margin-top: 4px; font-size: 8px; color: var(--text-secondary);">
                <div><b>Giro:</b> <span style="font-weight: 700; color: var(--primary-900);">{form.orGiro}</span></div>
                <div><b>Tamaño:</b> <span style="font-weight: 700; color: var(--primary-900);">{form.orTamano}</span></div>
                <div><b>Sector:</b> <span style="font-weight: 700; color: var(--primary-900);">{form.orSector}</span></div>
              </div>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px; margin-bottom: 8px;">
              <div style="font-weight: 700; background: var(--surface-alt); padding: 2px 4px; text-align: center; font-size: 10px;">d) ACTIVIDAD DEL ORGANISMO RECEPTOR</div>
              <div style="margin-top: 4px;"><b>Área asignada:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.deptAsignado || '-'}</span></div>
              <div><b>Nombre de su Asesor Externo:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.asesorNombre || '-'}</span></div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px; margin-top: 4px;">
                <div><b>Cargo:</b> <span>{form.asesorCargo || '-'}</span></div>
                <div><b>Teléfono:</b> <span>{form.asesorTel || '-'}</span></div>
              </div>
              <div><b>Correo del Asesor:</b> <span style="background: var(--warning-bg); padding: 0 4px;">{form.asesorCorreo || '-'}</span></div>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px;">
              <div style="font-weight: 700; background: var(--surface-alt); padding: 2px 4px; text-align: center; font-size: 10px;">e) PROGRAMACIÓN DE ACTIVIDADES</div>
              <div style="max-height: 144px; overflow-y: auto; margin-top: 4px;">
                <table style="width: 100%; font-size: 8px; text-align: left; border-collapse: collapse; border: 1px solid var(--border);">
                  <thead>
                    <tr style="background: var(--surface-alt);">
                      <th style="border: 1px solid var(--border); padding: 3px;" width="60%">ACTIVIDADES</th>
                      <th style="border: 1px solid var(--border); padding: 3px;" width="20%">DEL</th>
                      <th style="border: 1px solid var(--border); padding: 3px;" width="20%">AL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each form.actividades as activity, index}
                      <tr>
                        <td style="border: 1px solid var(--border); padding: 3px;"><b>{index + 1}.-</b> {activity.descripcion || '[Actividad sin describir]'}</td>
                        <td style="border: 1px solid var(--border); padding: 3px; text-align: center;">{formatDateShort(activity.del, '-')}</td>
                        <td style="border: 1px solid var(--border); padding: 3px; text-align: center;">{formatDateShort(activity.al, '-')}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>
