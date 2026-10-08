import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  convertInchesToTwip,
  AlignmentType,
  BorderStyle,
  WidthType,
  PageBreak,
  TableBorders,
  VerticalAlign,
  ShadingType,
  HeightRule
} from 'docx';

export async function fetchImageAsUint8Array(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export function createTextRuns(parts) {
  return parts.map((part) => {
    if (typeof part === 'string') return new TextRun(part);
    return new TextRun({
      text: part.text || '',
      bold: part.bold || false,
      size: part.size ? part.size * 2 : undefined,
      font: part.font || 'Arial',
      color: part.color || undefined,
      italics: part.italics || false,
      underline: part.underline || undefined,
    });
  });
}

export function bold(text) {
  return new TextRun({ text, bold: true, font: 'Arial', size: 24 });
}

export function plain(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: 24, ...opts });
}

export function emptyPara(spacing = 0) {
  return new Paragraph({
    children: [],
    spacing: spacing ? { after: spacing } : undefined,
  });
}

export function para(children, opts = {}) {
  const runs = typeof children === 'string'
    ? [new TextRun({ text: children, font: 'Arial' })]
    : children;
  return new Paragraph({
    children: runs,
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: {
      after: opts.after !== undefined ? opts.after : 120,
      line: opts.line || 360,
    },
    indent: opts.indent ? { firstLine: opts.indent } : undefined,
  });
}

export function headerPara(children, opts = {}) {
  return new Paragraph({
    children: typeof children === 'string'
      ? [new TextRun({ text: children, bold: true, font: 'Arial' })]
      : children,
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: { after: opts.after !== undefined ? opts.after : 120, line: opts.line || 360 },
  });
}

const CELL_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

export function cell(children, opts = {}) {
  const content = typeof children === 'string'
    ? [new Paragraph({
      children: [new TextRun({ text: children, font: 'Arial', bold: opts.bold || false, size: opts.fontSize ? opts.fontSize * 2 : undefined })],
      alignment: opts.alignment || AlignmentType.LEFT,
    })]
    : Array.isArray(children) && children[0] instanceof Paragraph
      ? children
      : [new Paragraph({ children: Array.isArray(children) ? children : [children] })];

  return new TableCell({
    children: content,
    columnSpan: opts.columnSpan || undefined,
    rowSpan: opts.rowSpan || undefined,
    verticalAlign: opts.verticalAlign || VerticalAlign.TOP,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    borders: opts.borders || CELL_BORDERS,
    shading: opts.shading ? {
      type: ShadingType.SOLID,
      color: opts.shading,
      fill: opts.shading,
    } : undefined,
    margins: opts.margins || {
      top: 40,
      bottom: 40,
      left: 80,
      right: 80,
    },
  });
}

export function table(rows, opts = {}) {
  return new Table({
    rows,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: opts.columnWidths || undefined,
    borders: opts.borders || undefined,
  });
}

export function row(cells, opts = {}) {
  return new TableRow({
    children: cells,
    height: opts.height ? { value: opts.height, rule: HeightRule.ATLEAST } : undefined,
  });
}

export function pageBreakPara() {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

export function imagePara(imageData, opts = {}) {
  return new Paragraph({
    children: [
      new ImageRun({
        data: imageData,
        transformation: {
          width: opts.width || 100,
          height: opts.height || 60,
        },
        type: opts.type || 'png',
      }),
    ],
    alignment: opts.alignment || AlignmentType.LEFT,
  });
}

function parseMarginString(marginStr) {
  if (!marginStr) return { top: convertInchesToTwip(0.35), bottom: convertInchesToTwip(0.35), left: convertInchesToTwip(0.35), right: convertInchesToTwip(0.35) };
  const parts = marginStr.replace(/in/g, '').trim().split(/\s+/).map(Number);
  if (parts.length === 1) {
    return { top: convertInchesToTwip(parts[0]), bottom: convertInchesToTwip(parts[0]), left: convertInchesToTwip(parts[0]), right: convertInchesToTwip(parts[0]) };
  }
  if (parts.length === 4) {
    return { top: convertInchesToTwip(parts[0]), right: convertInchesToTwip(parts[1]), bottom: convertInchesToTwip(parts[2]), left: convertInchesToTwip(parts[3]) };
  }
  return { top: convertInchesToTwip(0.35), bottom: convertInchesToTwip(0.35), left: convertInchesToTwip(0.35), right: convertInchesToTwip(0.35) };
}

export async function exportToDocx(config) {
  const { sections, filename = 'documento', margin } = config;
  const margins = parseMarginString(margin);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 24,
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
      },
    },
    sections: sections.map((section) => ({
      properties: {
        page: {
          size: {
            width: convertInchesToTwip(8.5),
            height: convertInchesToTwip(11),
          },
          margin: section.margin ? parseMarginString(section.margin) : margins,
        },
      },
      children: section.children || [],
    })),
  });

  const blob = await Packer.toBlob(doc);

  const downloadLink = document.createElement('a');
  document.body.appendChild(downloadLink);
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filename || 'documento'}.docx`;
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
  document.body.removeChild(downloadLink);
}

export function CELL_BORDERS_STYLE() { return CELL_BORDERS; }
export function NO_BORDERS_STYLE() { return NO_BORDERS; }
