<script>
  import { onMount } from 'svelte';
  import Building2 from '@lucide/svelte/icons/building-2';
  import CheckCircle from '@lucide/svelte/icons/check-circle';
  import ListChecks from '@lucide/svelte/icons/list-checks';
  import User from '@lucide/svelte/icons/user';
  import Header from '$lib/components/Header.svelte';
  import Stepper from '$lib/components/Stepper.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import SelectField from '$lib/components/SelectField.svelte';
  import RadioGroup from '$lib/components/RadioGroup.svelte';
  import FormNav from '$lib/components/FormNav.svelte';
  import { carreras } from '$lib/data/carreras.js';
  import { actividadSolicitudOptions } from '$lib/data/forms.js';
  import { exportToDocx, fetchImageAsUint8Array, bold, plain, cell, row, table, para, headerPara, imagePara, pageBreakPara, CELL_BORDERS_STYLE, NO_BORDERS_STYLE } from '$lib/utils/exportWord.js';
  import { Paragraph, TextRun, AlignmentType, VerticalAlign, ShadingType, BorderStyle, WidthType, Table } from 'docx';
  import { loadFormMemory, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { fileSafeName, toInputDate } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'estadia.solicitud';
  const SUGGESTION_FIELDS = {
    apellidos: 'student.lastName',
    nombres: 'student.firstName',
    nombre: 'student.name',
    matricula: 'student.matricula',
    email: 'contact.email',
    tel: 'contact.phone',
    celular: 'contact.mobile',
    grupo: 'student.group',
    nss: 'student.nss',
    empresa: 'organization.name',
    calle: 'address.street',
    numero: 'address.number',
    cp: 'address.zip',
    colonia: 'address.neighborhood',
    ciudad: 'address.city',
    municipio: 'address.municipio',
    estado: 'address.estado',
    act1: 'activity.description',
    act2: 'activity.description',
    act3: 'activity.description',
    contactoNombre: 'person.responsible',
    contactoCorreo: 'contact.email',
    contactoTel: 'contact.phone',
    contactoCel: 'contact.mobile',
    contactoArea: 'organization.area',
    contactoResp: 'person.responsible',
    pref1: 'organization.name',
    pref2: 'organization.name',
    pref3: 'organization.name'
  };

  const steps = [
    { label: 'Alumno', icon: User },
    { label: 'Actividad', icon: ListChecks },
    { label: 'Organismo', icon: Building2 },
    { label: 'Contacto', icon: CheckCircle }
  ];

  let currentStep = $state(1);
  let memoryReady = $state(false);
  let formElement;
  let form = $state({
    fecha: toInputDate(),
    apellidos: '',
    nombres: '',
    nombre: '',
    matricula: '',
    email: '',
    tel: '',
    celular: '',
    carrera: '',
    grupo: '',
    nss: '',
    institucion: '',
    actividad: '',
    empresa: '',
    calle: '',
    numero: '',
    cp: '',
    colonia: '',
    ciudad: '',
    municipio: '',
    estado: '',
    act1: '',
    act2: '',
    act3: '',
    aceptacion: '',
    contactoNombre: '',
    contactoCorreo: '',
    contactoTel: '',
    contactoCel: '',
    contactoArea: '',
    contactoResp: '',
    pref1: '',
    pref2: '',
    pref3: '',
    observaciones: ''
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

  function checked(value) {
    return form.actividad === value ? 'X' : '&nbsp;&nbsp;';
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

  async function generateWord() {
    const nombreAlumno = fullStudentName();
    form.nombre = nombreAlumno;
    rememberFormValues(form, SUGGESTION_FIELDS);
    const direccion = `${form.calle} ${form.numero}, C.P. ${form.cp}, ${form.colonia}, ${form.ciudad}, ${form.municipio}, ${form.estado}`;
    const logoData = await fetchImageAsUint8Array(`${location.origin}/Logo-1.png`);

    function checkedX(val) { return form.actividad === val ? 'X' : '  '; }

    const COL4 = [2250, 2250, 2250, 2250];
    const TABLE_BORDERS = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    };

    const children = [];

    children.push(table([
      row([
        cell([imagePara(logoData, { width: 72, height: 42 })], { verticalAlign: VerticalAlign.CENTER, borders: NO_BORDERS_STYLE() }),
        cell([new Paragraph({ children: [new TextRun({ text: 'SOLICITUD DE ESTADÍA', bold: true, font: 'Arial', size: 26 })], alignment: AlignmentType.CENTER })], { verticalAlign: VerticalAlign.CENTER, borders: NO_BORDERS_STYLE() }),
        cell([new Paragraph({ children: [new TextRun({ text: 'F-01', bold: true, font: 'Arial', size: 26 })], alignment: AlignmentType.RIGHT })], { verticalAlign: VerticalAlign.CENTER, borders: NO_BORDERS_STYLE() }),
      ]),
    ], { columnWidths: [1350, 4950, 2700] }));

    children.push(new Paragraph({
      children: [],
      spacing: { before: 0, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1e3a8a', space: 1 } },
    }));

    children.push(new Paragraph({ children: [new TextRun({ text: 'Fecha: ', bold: true, font: 'Arial', size: 18 }), new TextRun({ text: form.fecha, font: 'Arial', size: 18, underline: {} })], alignment: AlignmentType.RIGHT, spacing: { after: 100 } }));

    const headerShading = { type: ShadingType.SOLID, color: 'f3f4f6', fill: 'f3f4f6' };
    children.push(table([
      row([cell([new Paragraph({ children: [new TextRun({ text: 'DATOS DEL ALUMNO', bold: true, font: 'Arial', size: 20 })], alignment: AlignmentType.CENTER })], { columnSpan: 4, shading: 'f3f4f6' })]),
      row([
        cell([new Paragraph({ children: [bold('Nombre: '), plain(nombreAlumno)] })], { columnSpan: 3 }),
        cell([new Paragraph({ children: [bold('Matrícula: '), plain(form.matricula)], alignment: AlignmentType.CENTER })], { width: 2250 }),
      ]),
      row([cell([new Paragraph({ children: [bold('Email: '), plain(form.email)] })], { columnSpan: 4 })]),
      row([
        cell([new Paragraph({ children: [bold('Tel: '), plain(form.tel)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('Cel: '), plain(form.celular)] })], { columnSpan: 2 }),
      ]),
      row([
        cell([new Paragraph({ children: [bold('Carrera: '), plain(form.carrera)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('Grupo: '), plain(form.grupo)] })], { columnSpan: 2 }),
      ]),
      row([
        cell([new Paragraph({ children: [bold('N.S.S.: '), plain(form.nss)] })], { columnSpan: 2 }),
        cell([new Paragraph({ children: [bold('Institución: '), plain(form.institucion)] })], { columnSpan: 2 }),
      ]),
      row([
        cell([
          new Paragraph({ children: [bold('Actividad a Realizar: ')], spacing: { after: 40 } }),
          new Paragraph({ children: [
            bold('Estancia 1'), plain(` [ ${checkedX('Estancia 1')} ]  `),
            bold('Estancia 2'), plain(` [ ${checkedX('Estancia 2')} ]  `),
            bold('Estadía'), plain(` [ ${checkedX('Estadía')} ]  `),
            bold('Estadía 1'), plain(` [ ${checkedX('Estadía 1')} ]  `),
            bold('Estadía 2'), plain(` [ ${checkedX('Estadía 2')} ]`),
          ] }),
        ], { columnSpan: 4 }),
      ]),
    ], { columnWidths: COL4, borders: TABLE_BORDERS }));

    children.push(table([
      row([cell([new Paragraph({ children: [new TextRun({ text: 'SOBRE EL ORGANISMO RECEPTOR', bold: true, font: 'Arial', size: 20 })], alignment: AlignmentType.CENTER })], { columnSpan: 4, shading: 'f3f4f6' })]),
      row([cell([
        new Paragraph({ children: [bold('Empresa: '), plain(form.empresa)] }),
        new Paragraph({ children: [bold('Dirección: '), plain(direccion)] }),
      ], { columnSpan: 4 })]),
      row([cell([
        new Paragraph({ children: [new TextRun({ text: 'ACTIVIDADES QUE DESEA REALIZAR:', bold: true, font: 'Arial', size: 18 })], alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
        new Paragraph({ children: [bold('1. '), plain(form.act1)] }),
        new Paragraph({ children: [bold('2. '), plain(form.act2)] }),
        new Paragraph({ children: [bold('3. '), plain(form.act3)] }),
      ], { columnSpan: 4 })]),
    ], { columnWidths: COL4, borders: TABLE_BORDERS }));

    children.push(new Paragraph({ children: [
      plain('¿Cuenta con la aceptación de un O.R.?    SI [ '),
      new TextRun({ text: form.aceptacion === 'SI' ? 'X' : '  ', font: 'Arial' }),
      plain(' ]    NO [ '),
      new TextRun({ text: form.aceptacion === 'NO' ? 'X' : '  ', font: 'Arial' }),
      plain(' ]'),
    ], spacing: { after: 100 } }));

    if (form.aceptacion === 'SI') {
      children.push(new Paragraph({ children: [new TextRun({ text: 'DATOS DEL ORGANISMO RECEPTOR', bold: true, font: 'Arial', size: 18 })], spacing: { after: 60 } }));

      children.push(table([
        row([cell([new Paragraph({ children: [bold('Nombre: '), plain(form.contactoNombre)] })], { columnSpan: 2 })]),
        row([
          cell([new Paragraph({ children: [bold('Teléfonos: '), plain(form.contactoTel), plain(' / '), bold('Cel: '), plain(form.contactoCel)] })]),
          cell([new Paragraph({ children: [bold('Correo electrónico: '), plain(form.contactoCorreo)] })]),
        ]),
        row([
          cell([new Paragraph({ children: [bold('Área/departamento: '), plain(form.contactoArea)] })]),
          cell([new Paragraph({ children: [bold('Responsable del área: '), plain(form.contactoResp)] })]),
        ]),
      ], { columnWidths: [4500, 4500], borders: TABLE_BORDERS }));
    } else {
      children.push(new Paragraph({ children: [
        plain('Si su respuesta fue '),
        bold('NO'),
        plain(', favor de anotar el O.R. y área de su interés según su orden de preferencia.'),
      ], spacing: { before: 60, after: 60 } }));

      children.push(table([
        row([cell([new Paragraph({ children: [bold('1.- '), plain(form.pref1)] })])]),
        row([cell([new Paragraph({ children: [bold('2.- '), plain(form.pref2)] })])]),
        row([cell([new Paragraph({ children: [bold('3.- '), plain(form.pref3)] })])]),
        row([cell([new Paragraph({ children: [bold('Observaciones: '), plain(form.observaciones)] })])]),
      ], { borders: TABLE_BORDERS }));
    }

    children.push(new Paragraph({ children: [new TextRun({ text: 'Documento controlado por medios electrónicos. Para uso exclusivo de la Universidad.', font: 'Arial', size: 14, color: '666666' })], alignment: AlignmentType.CENTER, spacing: { before: 200 } }));

    await exportToDocx({
      sections: [{ children, margin: '0.32in 0.4in 0.32in 0.4in' }],
      filename: `Solicitud_de_Estadia_${fileSafeName(form.matricula)}`,
      margin: '0.32in 0.4in 0.32in 0.4in',
    });
  }
</script>

<svelte:head><title>Solicitud de Estancias y Estadías - UPMYS F-01</title></svelte:head>

<Header title="Solicitud de Estancia y Estadía" showBack />

<main class="main-content" style="max-width: 800px;">
  <p class="subtitle" style="margin-bottom: 1.5rem;">Completa el formulario paso a paso para generar tu archivo oficial en formato Word.</p>
  <Stepper {steps} {currentStep} />

  <form bind:this={formElement} onsubmit={(event) => { event.preventDefault(); generateWord(); }}>
    <div class="form-card">
      {#if currentStep === 1}
        <div class="form-step animate-fadeIn">
          <div class="form-step-header"><h2><User size={20} /> Paso 1: Datos del Alumno</h2></div>
          <div class="form-grid" style="grid-template-columns: 1.5fr 1.5fr 1fr; margin-bottom: 1.25rem;">
            <FormInput label="Apellidos" bind:value={form.apellidos} placeholder="Ej. PÉREZ GARCÍA" required memoryKey="student.lastName" />
            <FormInput label="Nombre(s)" bind:value={form.nombres} placeholder="Ej. JUAN CARLOS" required memoryKey="student.firstName" />
            <FormInput label="Matrícula" bind:value={form.matricula} placeholder="Ej. 00000000" required oninput={(event) => keepOnlyNumbers(event, 'matricula')} memoryKey="student.matricula" />
          </div>
          <div class="form-grid form-grid-3" style="margin-bottom: 1.25rem;">
            <FormInput label="Email" type="email" bind:value={form.email} placeholder="estudiante@ejemplo.com" memoryKey="contact.email" />
            <FormInput label="Teléfono" type="tel" bind:value={form.tel} placeholder="Casa" oninput={(event) => keepOnlyNumbers(event, 'tel')} memoryKey="contact.phone" />
            <FormInput label="Celular" type="tel" bind:value={form.celular} placeholder="Celular" oninput={(event) => keepOnlyNumbers(event, 'celular')} memoryKey="contact.mobile" />
          </div>
          <div class="form-grid form-grid-2" style="margin-bottom: 1.25rem;">
            <SelectField label="Carrera" bind:value={form.carrera} options={carreras} placeholder="Seleccione su carrera..." required />
            <FormInput label="Grupo" bind:value={form.grupo} placeholder="Ej. ITI-91" memoryKey="student.group" />
          </div>
          <div class="form-grid form-grid-3">
            <FormInput label="Fecha" type="date" bind:value={form.fecha} required />
            <FormInput label="Número de Servicio Médico" bind:value={form.nss} placeholder="NSS" memoryKey="student.nss" />
            <SelectField label="Institución Médica" bind:value={form.institucion} options={['IMSS', 'ISSSTE', 'OTRA']} placeholder="Seleccione..." />
          </div>
        </div>
      {:else if currentStep === 2}
        <div class="form-step animate-fadeIn">
          <div class="form-step-header"><h2><ListChecks size={20} /> Paso 2: Actividad a Realizar</h2></div>
          <p class="subtitle" style="margin-bottom: 1.25rem;">Selecciona el tipo de proceso que vas a cursar en esta solicitud.</p>
          <RadioGroup name="actividad" bind:value={form.actividad} options={actividadSolicitudOptions} required />
        </div>
      {:else if currentStep === 3}
        <div class="form-step animate-fadeIn">
          <div class="form-step-header"><h2><Building2 size={20} /> Paso 3: Sobre el Organismo Receptor</h2></div>
          <FormInput label="Nombre de la Empresa / Institución" bind:value={form.empresa} placeholder="Ej. Software S.A. de C.V." memoryKey="organization.name" />
          <div class="form-grid" style="grid-template-columns: 2fr 1fr 1fr; margin: 1.25rem 0;">
            <FormInput label="Calle" bind:value={form.calle} memoryKey="address.street" />
            <FormInput label="Número" bind:value={form.numero} memoryKey="address.number" />
            <FormInput label="C.P." bind:value={form.cp} memoryKey="address.zip" />
          </div>
          <div class="form-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1.5rem;">
            <FormInput label="Colonia / Localidad" bind:value={form.colonia} memoryKey="address.neighborhood" />
            <FormInput label="Ciudad" bind:value={form.ciudad} memoryKey="address.city" />
            <FormInput label="Municipio" bind:value={form.municipio} memoryKey="address.municipio" />
            <FormInput label="Estado" bind:value={form.estado} placeholder="Sinaloa" memoryKey="address.estado" />
          </div>
          <div class="conditional-section">
            <div class="label-text" style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem;">Actividades que desea realizar:</div>
            <div style="display:flex; flex-direction:column; gap:0.625rem;">
              <FormInput bind:value={form.act1} placeholder="1. Desarrollar un sistema de control de inventarios." memoryKey="activity.description" />
              <FormInput bind:value={form.act2} placeholder="2. Dar soporte y mantenimiento preventivo a bases de datos." memoryKey="activity.description" />
              <FormInput bind:value={form.act3} placeholder="3. Brindar asistencia técnica al departamento de sistemas." memoryKey="activity.description" />
            </div>
          </div>
        </div>
      {:else}
        <div class="form-step animate-fadeIn">
          <div class="form-step-header"><h2><CheckCircle size={20} /> Paso 4: Aceptación y Contacto</h2></div>
          <p class="subtitle" style="margin-bottom: 1.25rem;">Declara si ya has sido admitido por el organismo receptor.</p>
          <RadioGroup name="aceptacion" bind:value={form.aceptacion} options={['SI', 'NO']} required />
          {#if form.aceptacion === 'SI'}
            <div class="conditional-section animate-fadeIn">
              <div class="form-grid form-grid-2" style="margin-bottom: 1.25rem;">
                <FormInput label="Nombre del Contacto / Jefe Directo" bind:value={form.contactoNombre} required memoryKey="person.responsible" />
                <FormInput label="Correo Electrónico" type="email" bind:value={form.contactoCorreo} required memoryKey="contact.email" />
              </div>
              <div class="form-grid form-grid-2" style="margin-bottom: 1.25rem;">
                <FormInput label="Teléfono Oficina" type="tel" bind:value={form.contactoTel} oninput={(event) => keepOnlyNumbers(event, 'contactoTel')} memoryKey="contact.phone" />
                <FormInput label="Celular" type="tel" bind:value={form.contactoCel} oninput={(event) => keepOnlyNumbers(event, 'contactoCel')} memoryKey="contact.mobile" />
              </div>
              <div class="form-grid form-grid-2">
                <FormInput label="Área / Departamento" bind:value={form.contactoArea} memoryKey="organization.area" />
                <FormInput label="Responsable del Área" bind:value={form.contactoResp} memoryKey="person.responsible" />
              </div>
            </div>
          {:else if form.aceptacion === 'NO'}
            <div class="conditional-section animate-fadeIn">
              <div class="alert alert--warning"><div><strong>No cuenta con aceptación</strong><br />Registra 3 opciones de Organismos Receptores según orden de prioridad.</div></div>
              <div style="display:flex; flex-direction:column; gap:0.875rem;">
                <FormInput label="1ª Opción" bind:value={form.pref1} required memoryKey="organization.name" />
                <FormInput label="2ª Opción" bind:value={form.pref2} memoryKey="organization.name" />
                <FormInput label="3ª Opción" bind:value={form.pref3} memoryKey="organization.name" />
                <FormInput label="Observaciones Generales" type="textarea" bind:value={form.observaciones} rows={2} />
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} />
    </div>
  </form>
</main>
