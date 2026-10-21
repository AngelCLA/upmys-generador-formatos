<script>
  import { onMount } from 'svelte';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Building2 from '@lucide/svelte/icons/building-2';
  import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import User from '@lucide/svelte/icons/user';
  import Header from '$lib/components/Header.svelte';
  import Stepper from '$lib/components/Stepper.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import RadioGroup from '$lib/components/RadioGroup.svelte';
  import FormNav from '$lib/components/FormNav.svelte';
  import PreviewPanel from '$lib/components/PreviewPanel.svelte';
  import { exportToDocx, fetchImageAsUint8Array } from '$lib/utils/exportWord.js';
  import {
    AlignmentType,
    BorderStyle,
    HeightRule,
    HorizontalPositionRelativeFrom,
    ImageRun,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    TextWrappingType,
    VerticalAlign,
    VerticalPositionRelativeFrom,
    WidthType
  } from 'docx';
  import { loadFormMemory, rememberFormValues, saveFormMemory } from '$lib/utils/formMemory.js';
  import { fileSafeName } from '$lib/utils/formatters.js';

  const FORM_MEMORY_KEY = 'servicio-social.evaluacion-supervisor';
  const SUGGESTION_FIELDS = {
    ciclo: 'servicio-social.ciclo',
    prestador: 'student.name',
    organismo: 'organization.name',
    supervisor: 'person.advisor',
    cargo: 'person.cargo'
  };
  const DOCX_MARGIN = '0.98in 1.18in 0.98in 1.18in';
  const DOCX_FONT = 'Times New Roman';
  const TABLE_FONT = 'Arial';
  const BODY_SIZE = 24;
  const OPEN_ANSWER_SIZE = 20;
  const DATA_SIZE = 22;
  const SECTION_SIZE = 20;
  const TABLE_QUESTION_SIZE = 16;
  const TABLE_OPTION_SIZE = 14;
  const CHOICE_COLUMN_WIDTHS = [450, 3290, 1020, 1020, 1020, 1020, 1020];
  const CHOICE_TABLE_WIDTH = 8840;
  const OPEN_BOX_WIDTH = 8840;
  const CELL_MARGINS = { top: 40, bottom: 40, left: 60, right: 60 };
  const OPEN_BOX_MARGINS = { top: 80, bottom: 80, left: 80, right: 80 };
  const HEADER_FILL = 'E6E6E6';
  const SELECTED_FILL = 'F2F2F2';
  const MONTHS = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ];

  const YES_NO_OPTIONS = ['Sí', 'No'];
  const FREQUENCY_RARAS_OPTIONS = [
    'a) Siempre',
    'b) Frecuentemente',
    'c) Algunas veces',
    'd) Raras veces',
    'e) Nunca'
  ];
  const FREQUENCY_NO_APLICA_OPTIONS = [
    'a) Siempre',
    'b) Frecuentemente',
    'c) Algunas veces',
    'd) Nunca',
    'e) No aplica'
  ];

  const ACADEMIC_QUESTIONS = [
    {
      id: 'q1',
      number: 1,
      text: '¿Está usted enterado si el prestador de servicio social entregó un programa de trabajo para la prestación de S.S.?',
      options: YES_NO_OPTIONS
    },
    {
      id: 'q2',
      number: 2,
      text: '¿Cuenta el Organismo Receptor con una persona responsable de coordinar las actividades de los PSS?',
      options: YES_NO_OPTIONS
    },
    {
      id: 'q3',
      number: 3,
      text: '¿El prestador de servicio social demostró conocimientos de acuerdo con su perfil profesional?',
      options: FREQUENCY_RARAS_OPTIONS
    },
    {
      id: 'q4',
      number: 4,
      text: '¿Fueron adecuadas las decisiones que tomó el PSS ante los problemas que se le presentaron?',
      options: FREQUENCY_RARAS_OPTIONS
    }
  ];

  const PROVIDER_QUESTIONS = [
    {
      id: 'q6',
      number: 6,
      text: '¿Desarrolló el PSS tareas acordes con su perfil profesional?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    },
    {
      id: 'q7',
      number: 7,
      text: '¿Observó irregularidades en el PSS que afecten a la unidad receptora?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    },
    {
      id: 'q8',
      number: 8,
      text: 'Si observó irregularidades, ¿las expresó a los PSS?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    },
    {
      id: 'q9',
      number: 9,
      text: '¿Proporcionó recursos materiales (mobiliario, papelería, instrumentos de trabajo, etc.) para las actividades del PSS?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    }
  ];

  const VALUES_QUESTIONS = [
    {
      id: 'q13',
      number: 13,
      text: 'Al interactuar con el personal de su lugar de asignación, ¿se mantuvo un trato respetuoso dentro y fuera de la institución?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    },
    {
      id: 'q14',
      number: 14,
      text: '¿Mantuvo una buena imagen y fue responsable en las actividades de prestación de S.S.?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    },
    {
      id: 'q15',
      number: 15,
      text: '¿Cuidó el mobiliario y los recursos que se proporcionaron para realizar su S.S.?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    },
    {
      id: 'q16',
      number: 16,
      text: '¿Tuvo disponibilidad para la realización de labores individuales o en equipo?',
      options: FREQUENCY_NO_APLICA_OPTIONS
    }
  ];

  const IMPACT_QUESTIONS = [
    {
      id: 'q18',
      number: 18,
      text: '¿Fue óptimo el beneficio que obtuvo la unidad receptora con las actividades de servicio social del prestador?',
      options: FREQUENCY_RARAS_OPTIONS
    },
    {
      id: 'q19',
      number: 19,
      text: '¿El prestador participó en un proyecto de investigación en su unidad receptora?',
      options: YES_NO_OPTIONS
    }
  ];

  const Q10_TEXT = '¿Proporcionó beca o apoyo económico al PSS?';
  const Q11_TEXT = '¿Proporcionó capacitación y actualización al PSS para la elaboración y ejecución del proyecto?';
  const Q20_TEXT = '¿En qué fases del proyecto participó?';
  const OPEN_QUESTIONS = {
    q5: '5. Del aspecto abordado (Asesoría Académica), ¿qué considera que se debe mejorar para la realización del servicio social?',
    q12: '12. Del aspecto abordado (Prestador de Servicio Social), ¿qué considera que se debe mejorar para la realización del servicio social?',
    q17: '17. Del aspecto abordado (Valores), ¿qué considera que se debe mejorar para la realización del servicio social?',
    q21: '21. Del aspecto abordado (Impacto del servicio social en la unidad receptora), ¿qué considera que se debe mejorar para la realización del servicio social?'
  };

  const steps = [
    { label: 'Datos generales', icon: User },
    { label: 'Asesoría', icon: BookOpen },
    { label: 'Prestador de SS', icon: Building2 },
    { label: 'Valores', icon: ShieldCheck },
    { label: 'Cierre', icon: ClipboardCheck }
  ];

  const today = new Date().toISOString().slice(0, 10);

  let currentStep = $state(1);
  let memoryReady = $state(false);
  let conditionalError = $state('');
  let formElement;
  let q10AmountField = $state(null);
  let q11CountField = $state(null);
  let form = $state({
    ciclo: '',
    prestador: '',
    organismo: '',
    supervisor: '',
    cargo: '',
    fecha: today,
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: '',
    q10: '',
    q10Monto: '',
    q11: '',
    q11Veces: '',
    q12: '',
    q13: '',
    q14: '',
    q15: '',
    q16: '',
    q17: '',
    q18: '',
    q19: '',
    q20: '',
    q21: ''
  });

  onMount(() => {
    form = loadFormMemory(FORM_MEMORY_KEY, form);
    memoryReady = true;
  });

  $effect(() => {
    if (!memoryReady) return;
    saveFormMemory(FORM_MEMORY_KEY, form);
  });

  function handleConditionalAnswer(field, event) {
    conditionalError = '';
    const answer = event?.currentTarget?.value ?? form[field];
    if (field === 'q10' && answer !== 'Sí') form.q10Monto = '';
    if (field === 'q11' && answer !== 'Sí') form.q11Veces = '';
  }

  function validateStep() {
    conditionalError = '';

    if (currentStep === 3) {
      if (form.q10 === 'Sí' && !String(form.q10Monto ?? '').trim()) {
        conditionalError = 'Indique el monto mensual de la beca o apoyo económico.';
        q10AmountField?.querySelector('input')?.focus();
        return false;
      }

      if (form.q11 === 'Sí' && !String(form.q11Veces ?? '').trim()) {
        conditionalError = 'Indique cuántas veces se proporcionó la capacitación.';
        q11CountField?.querySelector('input')?.focus();
        return false;
      }
    }

    return formElement?.reportValidity() ?? false;
  }

  function nextStep() {
    if (!validateStep()) return;
    currentStep += 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    conditionalError = '';
    currentStep -= 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (currentStep < steps.length) {
      nextStep();
      return;
    }
    if (!validateStep()) return;
    generateWord();
  }

  function monthYearText(isoDate) {
    const [year, month] = String(isoDate ?? '').split('-').map(Number);
    if (!year || !month || month < 1 || month > 12) return '[mes] de [año]';
    return `${MONTHS[month - 1]} de ${year}`;
  }

  function yesNoText(label, selected) {
    return `${label} (${selected ? 'X' : ' '})`;
  }

  function previewCellStyle(selected, extra = '') {
    return `background:${selected ? '#e5e7eb' : 'transparent'};font-weight:${selected ? '700' : '400'};text-align:center;${extra}`;
  }

  function bodyRun(text, opts = {}) {
    return new TextRun({
      text: String(text ?? ''),
      font: DOCX_FONT,
      size: opts.size ?? BODY_SIZE,
      bold: opts.bold ?? false,
      italics: opts.italics ?? false
    });
  }

  function titleRun(text, opts = {}) {
    return bodyRun(text, { ...opts, size: opts.size ?? 28 });
  }

  function tableRun(text, opts = {}) {
    return new TextRun({
      text: String(text ?? ''),
      font: TABLE_FONT,
      size: opts.size ?? TABLE_QUESTION_SIZE,
      bold: opts.bold ?? false
    });
  }

  function docxPara(children, opts = {}) {
    return new Paragraph({
      children: Array.isArray(children) ? children : [children],
      alignment: opts.alignment,
      spacing: {
        line: opts.line ?? 240,
        before: opts.before ?? 0,
        after: opts.after ?? 0
      }
    });
  }

  function blankDocxParas(count, lineSpacing = 240) {
    return Array.from(
      { length: count },
      () => new Paragraph({ children: [], spacing: { line: lineSpacing, after: 0 } })
    );
  }

  function singleTableBorders() {
    const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    return {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border
    };
  }

  function tableCell(paragraphs, width, opts = {}) {
    return new TableCell({
      children: paragraphs,
      width: { size: width, type: WidthType.DXA },
      columnSpan: opts.columnSpan,
      verticalAlign: opts.verticalAlign ?? VerticalAlign.CENTER,
      shading: opts.shading
        ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.shading }
        : undefined,
      margins: opts.margins ?? CELL_MARGINS
    });
  }

  function textCell(text, width, opts = {}) {
    return tableCell(
      [docxPara([tableRun(text, { size: opts.size ?? TABLE_QUESTION_SIZE, bold: opts.bold })], {
        alignment: opts.alignment ?? AlignmentType.LEFT,
        line: 240
      })],
      width,
      opts
    );
  }

  function richCell(runs, width, opts = {}) {
    return tableCell(
      [docxPara(runs, { alignment: opts.alignment ?? AlignmentType.LEFT, line: 240 })],
      width,
      opts
    );
  }

  function numberCell(number) {
    return textCell(String(number), 450, {
      size: TABLE_QUESTION_SIZE,
      alignment: AlignmentType.CENTER
    });
  }

  function questionCell(text, width = 3290, columnSpan = 1) {
    return textCell(text, width, {
      size: TABLE_QUESTION_SIZE,
      alignment: AlignmentType.LEFT,
      columnSpan
    });
  }

  function optionCell(label, selected, width, columnSpan = 1) {
    return textCell(selected ? `X ${label}` : label, width, {
      size: TABLE_OPTION_SIZE,
      alignment: AlignmentType.CENTER,
      columnSpan,
      bold: selected,
      shading: selected ? SELECTED_FILL : undefined
    });
  }

  function yesNoCell(label, selected, width, columnSpan = 1) {
    return textCell(yesNoText(label, selected), width, {
      size: TABLE_OPTION_SIZE,
      alignment: AlignmentType.CENTER,
      columnSpan,
      bold: selected,
      shading: selected ? SELECTED_FILL : undefined
    });
  }

  function headerRow() {
    const headerCell = (text, width, columnSpan) =>
      textCell(text, width, {
        size: TABLE_QUESTION_SIZE,
        alignment: AlignmentType.CENTER,
        columnSpan,
        bold: true,
        shading: HEADER_FILL
      });

    return new TableRow({
      tableHeader: true,
      cantSplit: true,
      height: { value: 300, rule: HeightRule.ATLEAST },
      children: [
        headerCell('Preguntas', 3740, 2),
        headerCell('Respuestas', 5100, 5)
      ]
    });
  }

  function choiceTable(rows) {
    return new Table({
      width: { size: CHOICE_TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: CHOICE_COLUMN_WIDTHS,
      layout: TableLayoutType.FIXED,
      borders: singleTableBorders(),
      rows: [headerRow(), ...rows]
    });
  }

  function frequencyRow(question) {
    return new TableRow({
      cantSplit: true,
      height: { value: 300, rule: HeightRule.ATLEAST },
      children: [
        numberCell(question.number),
        questionCell(question.text),
        ...question.options.map((option, index) =>
          optionCell(option, form[question.id] === option, CHOICE_COLUMN_WIDTHS[index + 2])
        )
      ]
    });
  }

  function yesNoQuestionRow(question, yesWidth, noWidth, yesSpan, noSpan) {
    return new TableRow({
      cantSplit: true,
      height: { value: 300, rule: HeightRule.ATLEAST },
      children: [
        numberCell(question.number),
        questionCell(question.text),
        yesNoCell('Sí', form[question.id] === 'Sí', yesWidth, yesSpan),
        yesNoCell('No', form[question.id] === 'No', noWidth, noSpan)
      ]
    });
  }

  function labelValueRuns(label, value, fallback) {
    return [
      tableRun(label, { size: TABLE_OPTION_SIZE, bold: true }),
      tableRun(` ${String(value ?? '').trim() || fallback}`, { size: TABLE_OPTION_SIZE })
    ];
  }

  function tableAnswerParagraphs(value) {
    const raw = String(value ?? '');
    if (!raw.trim()) {
      return [docxPara([tableRun('', { size: TABLE_QUESTION_SIZE })], { line: 240 })];
    }

    return raw.split(/\r?\n/).map((line) =>
      docxPara([tableRun(line, { size: TABLE_QUESTION_SIZE })], { line: 240 })
    );
  }

  function openAnswerParagraphs(value) {
    const raw = String(value ?? '');
    if (!raw.trim()) {
      return [docxPara([bodyRun('', { size: OPEN_ANSWER_SIZE })], { line: 240 })];
    }

    return raw.split(/\r?\n/).map((line) =>
      docxPara([bodyRun(line, { size: OPEN_ANSWER_SIZE })], { line: 240 })
    );
  }

  function buildAcademicTable() {
    return choiceTable([
      yesNoQuestionRow(ACADEMIC_QUESTIONS[0], 3060, 2040, 3, 2),
      yesNoQuestionRow(ACADEMIC_QUESTIONS[1], 3060, 2040, 3, 2),
      frequencyRow(ACADEMIC_QUESTIONS[2]),
      frequencyRow(ACADEMIC_QUESTIONS[3])
    ]);
  }

  function buildProviderTable() {
    const q10Row = new TableRow({
      cantSplit: true,
      height: { value: 300, rule: HeightRule.ATLEAST },
      children: [
        numberCell(10),
        questionCell(Q10_TEXT),
        yesNoCell('Sí', form.q10 === 'Sí', 1020),
        yesNoCell('No', form.q10 === 'No', 1020),
        richCell(labelValueRuns('Monto mensual:', form.q10Monto, '________________'), 3060, {
          columnSpan: 3,
          alignment: AlignmentType.LEFT
        })
      ]
    });

    const q11Row = new TableRow({
      cantSplit: true,
      height: { value: 300, rule: HeightRule.ATLEAST },
      children: [
        numberCell(11),
        questionCell(Q11_TEXT),
        yesNoCell('Sí', form.q11 === 'Sí', 1020),
        richCell(labelValueRuns('¿Cuántas veces?', form.q11Veces, '____'), 3060, {
          columnSpan: 3,
          alignment: AlignmentType.LEFT
        }),
        yesNoCell('No', form.q11 === 'No', 1020)
      ]
    });

    return choiceTable([
      ...PROVIDER_QUESTIONS.map(frequencyRow),
      q10Row,
      q11Row
    ]);
  }

  function buildValuesTable() {
    return choiceTable(VALUES_QUESTIONS.map(frequencyRow));
  }

  function buildImpactTable() {
    const q20Row = new TableRow({
      cantSplit: true,
      height: { value: 600, rule: HeightRule.ATLEAST },
      children: [
        numberCell(20),
        questionCell(Q20_TEXT),
        tableCell(tableAnswerParagraphs(form.q20), 5100, {
          columnSpan: 5,
          verticalAlign: VerticalAlign.TOP
        })
      ]
    });

    return choiceTable([
      frequencyRow(IMPACT_QUESTIONS[0]),
      yesNoQuestionRow(IMPACT_QUESTIONS[1], 3060, 2040, 3, 2),
      q20Row
    ]);
  }

  function buildOpenBox(question, answer) {
    return new Table({
      width: { size: OPEN_BOX_WIDTH, type: WidthType.DXA },
      columnWidths: [OPEN_BOX_WIDTH],
      layout: TableLayoutType.FIXED,
      borders: singleTableBorders(),
      rows: [
        new TableRow({
          cantSplit: true,
          height: { value: 800, rule: HeightRule.ATLEAST },
          children: [
            tableCell(
              [
                docxPara([tableRun(question, { size: TABLE_QUESTION_SIZE, bold: true })], {
                  line: 240,
                  after: 80
                }),
                ...openAnswerParagraphs(answer)
              ],
              OPEN_BOX_WIDTH,
              {
                verticalAlign: VerticalAlign.TOP,
                margins: OPEN_BOX_MARGINS
              }
            )
          ]
        })
      ]
    });
  }

  function buildTitleBlock(logoData) {
    const logo = new ImageRun({
      data: logoData,
      type: 'png',
      transformation: { width: 113, height: 68 },
      floating: {
        horizontalPosition: {
          relative: HorizontalPositionRelativeFrom.MARGIN,
          offset: -619125
        },
        verticalPosition: {
          relative: VerticalPositionRelativeFrom.MARGIN,
          offset: -614045
        },
        wrap: { type: TextWrappingType.NONE },
        behindDocument: true,
        allowOverlap: true
      }
    });

    return [
      docxPara(
        [logo, titleRun('UNIVERSIDAD POLITÉCNICA DEL MAR Y LA SIERRA', { bold: true, size: 28 })],
        { alignment: AlignmentType.CENTER, line: 240 }
      ),
      ...blankDocxParas(1, 120),
      docxPara([bodyRun('Evaluación del servicio social:', { bold: true, size: 24 })], {
        alignment: AlignmentType.CENTER,
        line: 240
      }),
      docxPara([bodyRun('perspectiva del Supervisor/Asesor', { bold: true, size: 24 })], {
        alignment: AlignmentType.CENTER,
        line: 240
      }),
      ...blankDocxParas(1, 120),
      docxPara(
        [
          bodyRun(
            'Contestar solo por el supervisor/asesor responsable del prestador del Servicio Social Universitario de la UPMyS.'
          )
        ],
        { alignment: AlignmentType.JUSTIFIED, after: 120 }
      ),
      docxPara(
        [
          bodyRun(
            'Las siguientes preguntas tienen como finalidad conocer el desempeño del alumno y/o egresado de la Universidad Politécnica del Mar y la Sierra, con relación a la actividad del Servicio Social que realizó en el Organismo Receptor. Por favor, conteste con claridad.'
          )
        ],
        { alignment: AlignmentType.JUSTIFIED, after: 120 }
      )
    ];
  }

  function buildDataBlock() {
    return [
      docxPara(
        [
          bodyRun('Ciclo: ', { bold: true, size: DATA_SIZE }),
          bodyRun(form.ciclo, { size: DATA_SIZE })
        ],
        { alignment: AlignmentType.RIGHT }
      ),
      docxPara(
        [
          bodyRun('Nombre del Prestador: ', { bold: true, size: DATA_SIZE }),
          bodyRun(form.prestador, { size: DATA_SIZE })
        ]
      ),
      docxPara([bodyRun('Datos del Organismo Receptor', { bold: true, size: DATA_SIZE })]),
      docxPara(
        [
          bodyRun('Nombre: ', { bold: true, size: DATA_SIZE }),
          bodyRun(form.organismo, { size: DATA_SIZE })
        ]
      ),
      docxPara([bodyRun('Datos del Supervisor/Asesor', { bold: true, size: DATA_SIZE })]),
      docxPara(
        [
          bodyRun('Nombre: ', { bold: true, size: DATA_SIZE }),
          bodyRun(form.supervisor, { size: DATA_SIZE })
        ]
      ),
      docxPara([
        bodyRun('Instrucciones: Señale con una X una sola opción por enunciado.', {
          bold: true,
          size: DATA_SIZE
        })
      ]),
      ...blankDocxParas(1, 120)
    ];
  }

  function buildSectionHeading(text) {
    return [
      docxPara([bodyRun(text, { bold: true, size: SECTION_SIZE })]),
      ...blankDocxParas(1, 120)
    ];
  }

  function buildClosing() {
    return [
      ...blankDocxParas(2, 240),
      docxPara([bodyRun('__________________________')], { alignment: AlignmentType.CENTER }),
      docxPara([bodyRun(form.supervisor, { bold: true })], { alignment: AlignmentType.CENTER }),
      docxPara([bodyRun(form.cargo)], { alignment: AlignmentType.CENTER }),
      ...blankDocxParas(1, 240),
      docxPara([bodyRun(`La Cruz, Sinaloa, ${monthYearText(form.fecha)}`)], {
        alignment: AlignmentType.CENTER
      }),
      docxPara([bodyRun('¡Muchas gracias!')], { alignment: AlignmentType.CENTER }),
      docxPara([bodyRun('Su opinión es muy importante')], { alignment: AlignmentType.CENTER })
    ];
  }

  async function generateWord() {
    rememberFormValues(form, SUGGESTION_FIELDS);

    const logoData = await fetchImageAsUint8Array('/Logo-1.png');
    const children = [
      ...buildTitleBlock(logoData),
      ...buildDataBlock(),
      ...buildSectionHeading('a) Asesoría académica'),
      buildAcademicTable(),
      ...blankDocxParas(1, 120),
      buildOpenBox(OPEN_QUESTIONS.q5, form.q5),
      ...blankDocxParas(1, 120),
      ...buildSectionHeading('b) Prestador de Servicio Social (PSS)'),
      buildProviderTable(),
      ...blankDocxParas(1, 120),
      buildOpenBox(OPEN_QUESTIONS.q12, form.q12),
      ...blankDocxParas(1, 120),
      ...buildSectionHeading('c) Valores'),
      buildValuesTable(),
      ...blankDocxParas(1, 120),
      buildOpenBox(OPEN_QUESTIONS.q17, form.q17),
      ...blankDocxParas(1, 120),
      ...buildSectionHeading('d) Impacto del servicio social en la unidad receptora'),
      buildImpactTable(),
      ...blankDocxParas(1, 120),
      buildOpenBox(OPEN_QUESTIONS.q21, form.q21),
      ...buildClosing()
    ];

    await exportToDocx({
      sections: [{
        children,
        margin: DOCX_MARGIN
      }],
      filename: `Evaluacion_SS_Supervisor_${fileSafeName(form.prestador)}`,
      margin: DOCX_MARGIN
    });
  }
</script>

<svelte:head><title>Evaluación del Servicio Social - UPMYS</title></svelte:head>

<Header title="Evaluación del Servicio Social" showBack />

<main class="main-content">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" style="max-width: 1200px; margin: 0 auto;">
    <div class="lg:col-span-7">
      <p class="subtitle" style="margin: 0 0 0.5rem; font-weight: 700;">
        Formato 04 · Perspectiva del Supervisor/Asesor
      </p>
      <p class="subtitle" style="margin-bottom: 1rem;">
        Contestar solo por el supervisor/asesor responsable del prestador del Servicio Social Universitario de la UPMyS.
      </p>
      <div class="conditional-section" style="margin-bottom: 1.25rem; font-size: .84rem; line-height: 1.5;" role="note">
        Las siguientes preguntas tienen como finalidad conocer el desempeño del alumno y/o egresado de la Universidad Politécnica del Mar y la Sierra, con relación a la actividad del Servicio Social que realizó en el Organismo Receptor. Por favor, conteste con claridad.
      </div>

      <Stepper {steps} {currentStep} />

      <form bind:this={formElement} onsubmit={handleSubmit}>
        <div class="form-card">
          {#if currentStep === 1}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><User size={20} /> Paso 1: Datos generales</h2></div>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <section class="data-group">
                  <h3 class="group-heading">Datos del Prestador</h3>
                  <div style="display:flex; flex-direction:column; gap:1rem;">
                    <FormInput label="Ciclo" bind:value={form.ciclo} placeholder="Ej. 2025-2026" required memoryKey={SUGGESTION_FIELDS.ciclo} />
                    <FormInput label="Nombre del Prestador" bind:value={form.prestador} placeholder="Nombre completo del prestador" required memoryKey={SUGGESTION_FIELDS.prestador} />
                  </div>
                </section>

                <section class="data-group">
                  <h3 class="group-heading">Datos del Organismo Receptor</h3>
                  <FormInput label="Nombre" bind:value={form.organismo} placeholder="Nombre del organismo receptor" required memoryKey={SUGGESTION_FIELDS.organismo} />
                </section>

                <section class="data-group">
                  <h3 class="group-heading">Datos del Supervisor/Asesor</h3>
                  <div style="display:flex; flex-direction:column; gap:1rem;">
                    <FormInput label="Nombre" bind:value={form.supervisor} placeholder="Nombre completo del supervisor/asesor" required memoryKey={SUGGESTION_FIELDS.supervisor} />
                    <FormInput label="Cargo" bind:value={form.cargo} placeholder="Cargo del supervisor/asesor" required memoryKey={SUGGESTION_FIELDS.cargo} />
                  </div>
                </section>
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><BookOpen size={20} /> Paso 2: Asesoría académica</h2></div>
              <div class="question-list">
                {#each ACADEMIC_QUESTIONS as question}
                  <div class="question-block">
                    <div class="label-text">{question.number}. {question.text} <span style="color: var(--error);">*</span></div>
                    <RadioGroup name={question.id} bind:value={form[question.id]} options={question.options} required onchange={() => { conditionalError = ''; }} />
                  </div>
                {/each}

                <FormInput
                  label="5. Del aspecto abordado (Asesoría Académica), ¿qué considera que se debe mejorar para la realización del servicio social?"
                  type="textarea"
                  rows={3}
                  bind:value={form.q5}
                  placeholder="Escriba sus observaciones o sugerencias (opcional)."
                  help="Opcional."
                />
              </div>
            </div>
          {:else if currentStep === 3}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><Building2 size={20} /> Paso 3: Prestador de Servicio Social</h2></div>
              <div class="question-list">
                {#each PROVIDER_QUESTIONS as question}
                  <div class="question-block">
                    <div class="label-text">{question.number}. {question.text} <span style="color: var(--error);">*</span></div>
                    <RadioGroup name={question.id} bind:value={form[question.id]} options={question.options} required onchange={() => { conditionalError = ''; }} />
                  </div>
                {/each}

                <div class="question-block">
                  <div class="label-text">10. {Q10_TEXT} <span style="color: var(--error);">*</span></div>
                  <RadioGroup name="q10" bind:value={form.q10} options={YES_NO_OPTIONS} required onchange={(event) => handleConditionalAnswer('q10', event)} />
                  {#if form.q10 === 'Sí'}
                    <div bind:this={q10AmountField}>
                      <FormInput label="Monto mensual (MXN)" bind:value={form.q10Monto} placeholder="Ej. $1,500.00" required oninput={() => { conditionalError = ''; }} />
                    </div>
                  {/if}
                </div>

                <div class="question-block">
                  <div class="label-text">11. {Q11_TEXT} <span style="color: var(--error);">*</span></div>
                  <RadioGroup name="q11" bind:value={form.q11} options={YES_NO_OPTIONS} required onchange={(event) => handleConditionalAnswer('q11', event)} />
                  {#if form.q11 === 'Sí'}
                    <div bind:this={q11CountField}>
                      <FormInput label="¿Cuántas veces?" bind:value={form.q11Veces} placeholder="Ej. 4" required oninput={() => { conditionalError = ''; }} />
                    </div>
                  {/if}
                </div>

                {#if conditionalError}
                  <p class="conditional-error" role="alert">{conditionalError}</p>
                {/if}

                <FormInput
                  label="12. Del aspecto abordado (Prestador de Servicio Social), ¿qué considera que se debe mejorar para la realización del servicio social?"
                  type="textarea"
                  rows={3}
                  bind:value={form.q12}
                  placeholder="Escriba sus observaciones o sugerencias (opcional)."
                  help="Opcional."
                />
              </div>
            </div>
          {:else if currentStep === 4}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><ShieldCheck size={20} /> Paso 4: Valores</h2></div>
              <div class="question-list">
                {#each VALUES_QUESTIONS as question}
                  <div class="question-block">
                    <div class="label-text">{question.number}. {question.text} <span style="color: var(--error);">*</span></div>
                    <RadioGroup name={question.id} bind:value={form[question.id]} options={question.options} required onchange={() => { conditionalError = ''; }} />
                  </div>
                {/each}

                <FormInput
                  label="17. Del aspecto abordado (Valores), ¿qué considera que se debe mejorar para la realización del servicio social?"
                  type="textarea"
                  rows={3}
                  bind:value={form.q17}
                  placeholder="Escriba sus observaciones o sugerencias (opcional)."
                  help="Opcional."
                />
              </div>
            </div>
          {:else}
            <div class="form-step animate-fadeIn">
              <div class="form-step-header"><h2><ClipboardCheck size={20} /> Paso 5: Impacto y cierre</h2></div>
              <div class="question-list">
                {#each IMPACT_QUESTIONS as question}
                  <div class="question-block">
                    <div class="label-text">{question.number}. {question.text} <span style="color: var(--error);">*</span></div>
                    <RadioGroup name={question.id} bind:value={form[question.id]} options={question.options} required onchange={() => { conditionalError = ''; }} />
                  </div>
                {/each}

                <FormInput
                  label="20. ¿En qué fases del proyecto participó?"
                  type="textarea"
                  rows={3}
                  bind:value={form.q20}
                  placeholder="Ej. Diagnóstico, planeación, ejecución y evaluación."
                  help="Indique las fases si respondió Sí a la pregunta 19 (opcional)."
                />

                <FormInput
                  label="21. Del aspecto abordado (Impacto del servicio social en la unidad receptora), ¿qué considera que se debe mejorar para la realización del servicio social?"
                  type="textarea"
                  rows={3}
                  bind:value={form.q21}
                  placeholder="Escriba sus observaciones o sugerencias (opcional)."
                  help="Opcional."
                />

                <FormInput label="Fecha de evaluación" type="date" bind:value={form.fecha} required />
              </div>
            </div>
          {/if}

          <FormNav {currentStep} totalSteps={steps.length} onPrev={prevStep} onNext={nextStep} submitLabel="Generar Evaluación (.docx)" />
        </div>
      </form>
    </div>

    <div class="lg:col-span-5">
      <div class="sticky" style="top: 80px;">
        <PreviewPanel title="Vista Previa de la Evaluación" badge="Formato 04">
          <div class="preview-scroll">
            <div class="preview-document">
              <div style="display:grid;grid-template-columns:64px 1fr;align-items:start;column-gap:6px;">
                <img src="/Logo-1.png" alt="Logo UPMYS" style="width:64px;height:auto;" />
                <div style="text-align:center;font-size:14px;font-weight:700;line-height:1.2;padding-top:4px;">
                  UNIVERSIDAD POLITÉCNICA DEL MAR Y LA SIERRA
                </div>
              </div>
              <div style="text-align:center;font-size:12px;font-weight:700;margin-top:4px;">Evaluación del servicio social:</div>
              <div style="text-align:center;font-size:12px;font-weight:700;">perspectiva del Supervisor/Asesor</div>
              <p style="font-size:9px;text-align:justify;margin:6px 0;">
                Contestar solo por el supervisor/asesor responsable del prestador del Servicio Social Universitario de la UPMyS.
              </p>
              <p style="font-size:9px;text-align:justify;margin:0 0 6px;">
                Las siguientes preguntas tienen como finalidad conocer el desempeño del alumno y/o egresado de la Universidad Politécnica del Mar y la Sierra, con relación a la actividad del Servicio Social que realizó en el Organismo Receptor. Por favor, conteste con claridad.
              </p>

              <div style="text-align:right;font-size:9px;margin:3px 0;">
                <strong>Ciclo:</strong> {form.ciclo || '[Ciclo]'}
              </div>
              <div style="font-size:9px;margin:3px 0;">
                <strong>Nombre del Prestador:</strong> {form.prestador || '[Nombre del Prestador]'}
              </div>
              <div class="field-heading">Datos del Organismo Receptor</div>
              <div style="font-size:9px;margin:2px 0;">
                <strong>Nombre:</strong> {form.organismo || '[Organismo Receptor]'}
              </div>
              <div class="field-heading">Datos del Supervisor/Asesor</div>
              <div style="font-size:9px;margin:2px 0 6px;">
                <strong>Nombre:</strong> {form.supervisor || '[Supervisor/Asesor]'}
              </div>
              <div style="font-size:9px;font-weight:700;margin-bottom:6px;">
                Instrucciones: Señale con una X una sola opción por enunciado.
              </div>

              <div class="section-heading">a) Asesoría académica</div>
              <table class="preview-table">
                <colgroup>
                  <col style="width:5%;" />
                  <col style="width:37%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                </colgroup>
                <thead>
                  <tr><th colspan="2">Preguntas</th><th colspan="5">Respuestas</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="preview-num">1</td>
                    <td>{ACADEMIC_QUESTIONS[0].text}</td>
                    <td colspan="3" style={previewCellStyle(form.q1 === 'Sí')}>{yesNoText('Sí', form.q1 === 'Sí')}</td>
                    <td colspan="2" style={previewCellStyle(form.q1 === 'No')}>{yesNoText('No', form.q1 === 'No')}</td>
                  </tr>
                  <tr>
                    <td class="preview-num">2</td>
                    <td>{ACADEMIC_QUESTIONS[1].text}</td>
                    <td colspan="3" style={previewCellStyle(form.q2 === 'Sí')}>{yesNoText('Sí', form.q2 === 'Sí')}</td>
                    <td colspan="2" style={previewCellStyle(form.q2 === 'No')}>{yesNoText('No', form.q2 === 'No')}</td>
                  </tr>
                  {#each [ACADEMIC_QUESTIONS[2], ACADEMIC_QUESTIONS[3]] as question}
                    <tr>
                      <td class="preview-num">{question.number}</td>
                      <td>{question.text}</td>
                      {#each question.options as option}
                        {@const selected = form[question.id] === option}
                        <td class="preview-option" style={previewCellStyle(selected)}>{selected ? `X ${option}` : option}</td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
              <div class="open-box">
                <div class="open-box-question">{OPEN_QUESTIONS.q5}</div>
                <div class="open-answer">{form.q5}</div>
              </div>

              <div class="section-heading">b) Prestador de Servicio Social (PSS)</div>
              <table class="preview-table">
                <colgroup>
                  <col style="width:5%;" />
                  <col style="width:37%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                </colgroup>
                <thead>
                  <tr><th colspan="2">Preguntas</th><th colspan="5">Respuestas</th></tr>
                </thead>
                <tbody>
                  {#each PROVIDER_QUESTIONS as question}
                    <tr>
                      <td class="preview-num">{question.number}</td>
                      <td>{question.text}</td>
                      {#each question.options as option}
                        {@const selected = form[question.id] === option}
                        <td class="preview-option" style={previewCellStyle(selected)}>{selected ? `X ${option}` : option}</td>
                      {/each}
                    </tr>
                  {/each}
                  <tr>
                    <td class="preview-num">10</td>
                    <td>{Q10_TEXT}</td>
                    <td class="preview-option" style={previewCellStyle(form.q10 === 'Sí')}>{yesNoText('Sí', form.q10 === 'Sí')}</td>
                    <td class="preview-option" style={previewCellStyle(form.q10 === 'No')}>{yesNoText('No', form.q10 === 'No')}</td>
                    <td colspan="3" style="font-size:6.5px;padding:2px 3px;">Monto mensual: {form.q10Monto || '________________'}</td>
                  </tr>
                  <tr>
                    <td class="preview-num">11</td>
                    <td>{Q11_TEXT}</td>
                    <td class="preview-option" style={previewCellStyle(form.q11 === 'Sí')}>{yesNoText('Sí', form.q11 === 'Sí')}</td>
                    <td colspan="3" style="font-size:6.5px;padding:2px 3px;">¿Cuántas veces? {form.q11Veces || '____'}</td>
                    <td class="preview-option" style={previewCellStyle(form.q11 === 'No')}>{yesNoText('No', form.q11 === 'No')}</td>
                  </tr>
                </tbody>
              </table>
              <div class="open-box">
                <div class="open-box-question">{OPEN_QUESTIONS.q12}</div>
                <div class="open-answer">{form.q12}</div>
              </div>

              <div class="section-heading">c) Valores</div>
              <table class="preview-table">
                <colgroup>
                  <col style="width:5%;" />
                  <col style="width:37%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                </colgroup>
                <thead>
                  <tr><th colspan="2">Preguntas</th><th colspan="5">Respuestas</th></tr>
                </thead>
                <tbody>
                  {#each VALUES_QUESTIONS as question}
                    <tr>
                      <td class="preview-num">{question.number}</td>
                      <td>{question.text}</td>
                      {#each question.options as option}
                        {@const selected = form[question.id] === option}
                        <td class="preview-option" style={previewCellStyle(selected)}>{selected ? `X ${option}` : option}</td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
              <div class="open-box">
                <div class="open-box-question">{OPEN_QUESTIONS.q17}</div>
                <div class="open-answer">{form.q17}</div>
              </div>

              <div class="section-heading">d) Impacto del servicio social en la unidad receptora</div>
              <table class="preview-table">
                <colgroup>
                  <col style="width:5%;" />
                  <col style="width:37%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                  <col style="width:11.6%;" />
                </colgroup>
                <thead>
                  <tr><th colspan="2">Preguntas</th><th colspan="5">Respuestas</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="preview-num">18</td>
                    <td>{IMPACT_QUESTIONS[0].text}</td>
                    {#each IMPACT_QUESTIONS[0].options as option}
                      {@const selected = form.q18 === option}
                      <td class="preview-option" style={previewCellStyle(selected)}>{selected ? `X ${option}` : option}</td>
                    {/each}
                  </tr>
                  <tr>
                    <td class="preview-num">19</td>
                    <td>{IMPACT_QUESTIONS[1].text}</td>
                    <td colspan="3" style={previewCellStyle(form.q19 === 'Sí')}>{yesNoText('Sí', form.q19 === 'Sí')}</td>
                    <td colspan="2" style={previewCellStyle(form.q19 === 'No')}>{yesNoText('No', form.q19 === 'No')}</td>
                  </tr>
                  <tr>
                    <td class="preview-num">20</td>
                    <td>{Q20_TEXT}</td>
                    <td colspan="5" style="height:18px;vertical-align:top;white-space:pre-wrap;font-size:6.5px;padding:2px 3px;">{form.q20}</td>
                  </tr>
                </tbody>
              </table>
              <div class="open-box">
                <div class="open-box-question">{OPEN_QUESTIONS.q21}</div>
                <div class="open-answer">{form.q21}</div>
              </div>

              <div class="closing">
                <div>__________________________</div>
                <div style="font-weight:700;">{form.supervisor || '[Supervisor/Asesor]'}</div>
                <div>{form.cargo || '[Cargo del Asesor]'}</div>
                <div style="margin-top:6px;">La Cruz, Sinaloa, {monthYearText(form.fecha)}</div>
                <div>¡Muchas gracias!</div>
                <div>Su opinión es muy importante</div>
              </div>
            </div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  </div>
</main>

<style>
  .group-heading {
    margin: 0 0 .75rem;
    color: var(--primary-900);
    font-size: .9rem;
    font-weight: 700;
  }

  .data-group + .data-group {
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .question-block {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }

  .question-block:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .conditional-error {
    margin: -.25rem 0 0;
    color: var(--error);
    font-size: .82rem;
    font-weight: 600;
  }

  .preview-scroll {
    max-height: 76vh;
    overflow-y: auto;
    padding-right: 4px;
  }

  .preview-document {
    color: #111;
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 9px;
    line-height: 1.3;
  }

  .field-heading {
    margin: 5px 0 2px;
    font-size: 9px;
    font-weight: 700;
  }

  .section-heading {
    margin: 8px 0 3px;
    font-size: 9px;
    font-weight: 700;
  }

  .preview-table {
    width: 100%;
    margin-bottom: 4px;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 7px;
    line-height: 1.2;
  }

  .preview-table th,
  .preview-table td {
    border: 1px solid #333;
    padding: 2px 3px;
    overflow-wrap: anywhere;
    vertical-align: middle;
  }

  .preview-table th {
    background: #e6e6e6;
    font-size: 7px;
    font-weight: 700;
    text-align: center;
  }

  .preview-num {
    width: 5%;
    text-align: center;
  }

  .preview-option {
    font-size: 6.5px;
    text-align: center;
  }

  .open-box {
    margin-bottom: 4px;
    border: 1px solid #333;
    padding: 4px;
    font-size: 7px;
  }

  .open-box-question {
    font-weight: 700;
  }

  .open-answer {
    min-height: 16px;
    white-space: pre-wrap;
  }

  .closing {
    margin-top: 12px;
    text-align: center;
    font-size: 9px;
    line-height: 1.45;
  }
</style>
