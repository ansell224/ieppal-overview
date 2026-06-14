import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ieppalLogoUrl from '../assets/icons/ieppal-logo.svg';
import interRegularUrl from '../assets/fonts/Inter-Regular.ttf?url';
import interBoldUrl from '../assets/fonts/Inter-Bold.ttf?url';
import interItalicUrl from '../assets/fonts/Inter-Italic.ttf?url';
import playfairBoldUrl from '../assets/fonts/PlayfairDisplay-Bold.ttf?url';

function formatFormType(str) {
  if (!str) return '';
  const spaced = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const tokens = spaced.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  const hasAcronym = tokens.slice(1).some((t) => t.length >= 2 && /^[A-Z]+$/.test(t));
  if (hasAcronym) {
    tokens[0] = tokens[0].toUpperCase();
  } else {
    tokens[0] = tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1);
  }
  return tokens.join(' ').trim();
}

// Table geometry — used by both the bordered text-field tables and the
// standalone checkbox / likert blocks so the two stay visually aligned.
const TABLE_FONT_SIZE = 10;
const TABLE_LINE_HEIGHT_FACTOR = 1.15;
const TABLE_PAD_TOP = 2.2;
const TABLE_PAD_LEFT = 4;
const TABLE_PAD_RIGHT = 4;
const OPT_BOX_SIZE = 2.8;

function normaliseCheckboxMap(value) {
  let map = value;
  if (typeof map === 'string') {
    const t = map.trim();
    if (t.startsWith('{') || t.startsWith('[')) {
      try { map = JSON.parse(t); } catch { map = {}; }
    } else {
      map = {};
    }
  }
  if (map == null || typeof map !== 'object' || Array.isArray(map)) map = {};
  return map;
}

function toLikertSelected(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function formatValue(value, field) {
  // Checkbox and likert fields are never passed through here — they are rendered
  // as standalone blocks outside of the autoTable flow.
  if (value === null || value === undefined || value === '') return '';

  // Tolerate legacy stringified JSON for non-checkbox objects
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try { value = JSON.parse(trimmed); } catch { /* treat as plain string */ }
    }
  }

  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);

  if (Array.isArray(value)) return value.join(', ');

  if (typeof value === 'object') {
    const selected = Object.entries(value).filter(([, v]) => v === true).map(([k]) => k);
    return selected.join('\n');
  }

  return String(value);
}

// Match IEPForms' getFieldKey: section-prefixed when the label is duplicated across sections.
function getFieldKey(section, field, sections) {
  const isDuplicate = sections.some(
    (s) => s !== section && Array.isArray(s.fields) && s.fields.some((f) => f.label === field.label),
  );
  return isDuplicate ? `${section.title}__${field.label}` : field.label;
}

async function loadLogoDataUrl(size = 256) {
  const res = await fetch(ieppalLogoUrl);
  const svgText = await res.text();
  const blob = new Blob([svgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('logo load failed'));
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function fetchFontBase64(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

async function registerFonts(doc) {
  try {
    const [interRegular, interBold, interItalic, playfairBold] = await Promise.all([
      fetchFontBase64(interRegularUrl),
      fetchFontBase64(interBoldUrl),
      fetchFontBase64(interItalicUrl),
      fetchFontBase64(playfairBoldUrl),
    ]);
    doc.addFileToVFS('Inter-Regular.ttf', interRegular);
    doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
    doc.addFileToVFS('Inter-Bold.ttf', interBold);
    doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
    doc.addFileToVFS('Inter-Italic.ttf', interItalic);
    doc.addFont('Inter-Italic.ttf', 'Inter', 'italic');
    doc.addFileToVFS('PlayfairDisplay-Bold.ttf', playfairBold);
    doc.addFont('PlayfairDisplay-Bold.ttf', 'Playfair', 'bold');
    return true;
  } catch {
    return false;
  }
}

/**
 * Export a filled IEP report to a sleek modern PDF.
 */
export async function exportIepPdf({ studentName, formType, config, data }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 18;
  const innerW = pageW - marginX * 2;

  const INK = [0, 0, 0];
  const SUB = [71, 85, 105];
  const MUTED = [148, 163, 184];
  const BLACK = [0, 0, 0];
  const LABEL_BG = [253, 242, 248];

  const fontsOK = await registerFonts(doc);
  const SANS = fontsOK ? 'Inter' : 'helvetica';
  const SERIF = fontsOK ? 'Playfair' : 'times';

  let logoData = null;
  try { logoData = await loadLogoDataUrl(); } catch { /* ignore */ }

  // ─── Masthead ─────────────────────────────────────────────
  const logoSize = 13;          // mm
  const logoX = marginX;
  const logoY = 12;
  const logoCenterY = logoY + logoSize / 2;

  if (logoData) {
    doc.addImage(logoData, 'PNG', logoX, logoY, logoSize, logoSize);
  }

  // "IEP Pal" wordmark — serif, vertically centered with logo
  doc.setFont(SERIF, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text(
    'IEP Pal',
    logoX + logoSize + 4,
    logoCenterY,
    { baseline: 'middle' },
  );

  // Right — date, aligned to same center
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFont(SANS, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SUB);
  doc.text(today, pageW - marginX, logoCenterY, { align: 'right', baseline: 'middle' });

  // Thin hairline separating masthead from the rest of the header
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.2);
  doc.line(marginX, logoY + logoSize + 6, pageW - marginX, logoY + logoSize + 6);

  // ─── Student hero ─────────────────────────────────────────
  const heroY = logoY + logoSize + 20;

  const displayName = (studentName || 'Student').replace(/\S+/g, (w) =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );

  // Small uppercase "student" eyebrow
  doc.setFont(SANS, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('STUDENT', marginX, heroY);

  doc.setFont(SERIF, 'bold');
  doc.setFontSize(34);
  doc.setTextColor(...INK);
  doc.text(displayName, marginX, heroY + 12);

  // Template type on the right side, vertically aligned to the bottom of the name
  doc.setFont(SANS, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SUB);
  doc.text(formatFormType(formType), pageW - marginX, heroY + 12, { align: 'right' });

  // Single clean divider below the hero — the only one on the page header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(marginX, heroY + 18, pageW - marginX, heroY + 18);

  let cursorY = heroY + 28;

  // ─── Sections ─────────────────────────────────────────────
  const sections = Array.isArray(config) ? config : [];

  const isListField = (f) =>
    (f?.type === 'checkbox' && Array.isArray(f.options)) ||
    (f?.type === 'likert' && Array.isArray(f.points));

  const renderTextTable = (textFields, sectionCtx) => {
    const rows = [];
    for (const field of textFields) {
      const key = getFieldKey(sectionCtx, field, sections);
      const raw = data?.[key] !== undefined ? data[key] : data?.[field.label];
      rows.push([field.label, formatValue(raw, field)]);
    }

    autoTable(doc, {
      startY: cursorY,
      body: rows,
      theme: 'grid',
      styles: {
        font: SANS,
        fontSize: TABLE_FONT_SIZE,
        cellPadding: { top: TABLE_PAD_TOP, right: TABLE_PAD_RIGHT, bottom: TABLE_PAD_TOP, left: TABLE_PAD_LEFT },
        textColor: INK,
        lineColor: BLACK,
        lineWidth: 0.25,
        valign: 'top',
        minCellHeight: 7,
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          cellWidth: 62,
          fillColor: LABEL_BG,
          textColor: INK,
          fontSize: 10,
          halign: 'left',
          valign: 'middle',
        },
        1: {
          cellWidth: innerW - 62,
          fillColor: [255, 255, 255],
          halign: 'left',
          valign: 'top',
        },
      },
      margin: { left: marginX, right: marginX },
    });

    cursorY = doc.lastAutoTable.finalY + 6;
  };

  const renderListBlock = (field, sectionCtx) => {
    const key = getFieldKey(sectionCtx, field, sections);
    const raw = data?.[key] !== undefined ? data[key] : data?.[field.label];

    const labelColW = 62;
    const indicatorGap = 2.5;
    const optsX = marginX + labelColW;
    const optsTextX = optsX + OPT_BOX_SIZE + indicatorGap;
    const optsTextMaxW = innerW - labelColW - OPT_BOX_SIZE - indicatorGap;
    const lineHeight = (TABLE_FONT_SIZE * TABLE_LINE_HEIGHT_FACTOR) / doc.internal.scaleFactor;

    const items = field.type === 'checkbox'
      ? field.options
      : field.points.map((p) => p.label);
    const isSelected = field.type === 'checkbox'
      ? (opt) => normaliseCheckboxMap(raw)[opt] === true
      : (() => {
          const selVal = toLikertSelected(raw);
          return (_label, i) => field.points[i].value === selVal;
        })();
    const shape = field.type === 'checkbox' ? 'square' : 'circle';

    doc.setFont(SANS, 'bold');
    doc.setFontSize(10);
    const labelLines = doc.splitTextToSize(field.label, labelColW - 2);

    doc.setFont(SANS, 'normal');
    doc.setFontSize(10);
    let totalOptionLines = 0;
    const itemWraps = items.map((item) => {
      const wrapped = doc.splitTextToSize(item, optsTextMaxW);
      const count = Math.max(1, wrapped.length);
      totalOptionLines += count;
      return wrapped;
    });

    const labelHeight = labelLines.length * lineHeight;
    const optionsHeight = totalOptionLines * lineHeight;
    const blockHeight = Math.max(labelHeight, optionsHeight);
    const paddingTop = 2;
    const paddingBottom = 4;

    if (cursorY + paddingTop + blockHeight + paddingBottom > pageH - 20) {
      doc.addPage();
      cursorY = 25;
    }

    const top = cursorY + paddingTop;

    // Label
    doc.setFont(SANS, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    for (let li = 0; li < labelLines.length; li++) {
      const y = top + (li + 0.5) * lineHeight;
      doc.text(labelLines[li], marginX, y, { baseline: 'middle' });
    }

    // Options — indicator + text
    doc.setFont(SANS, 'normal');
    doc.setFontSize(10);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.setFillColor(0, 0, 0);

    let lineIdx = 0;
    for (let i = 0; i < items.length; i++) {
      const wrapped = itemWraps[i];
      const firstLineIdx = lineIdx;
      lineIdx += wrapped.length;

      const firstLineCenter = top + (firstLineIdx + 0.5) * lineHeight;
      const boxY = firstLineCenter - OPT_BOX_SIZE / 2;
      const sel = isSelected(items[i], i);

      if (shape === 'circle') {
        doc.circle(optsX + OPT_BOX_SIZE / 2, firstLineCenter, OPT_BOX_SIZE / 2);
        if (sel) doc.circle(optsX + OPT_BOX_SIZE / 2, firstLineCenter, OPT_BOX_SIZE / 2 - 0.65, 'F');
      } else {
        doc.rect(optsX, boxY, OPT_BOX_SIZE, OPT_BOX_SIZE);
        if (sel) doc.rect(optsX + 0.55, boxY + 0.55, OPT_BOX_SIZE - 1.1, OPT_BOX_SIZE - 1.1, 'F');
      }

      for (let li = 0; li < wrapped.length; li++) {
        const y = top + (firstLineIdx + li + 0.5) * lineHeight;
        doc.text(wrapped[li], optsTextX, y, { baseline: 'middle' });
      }
    }

    cursorY = top + blockHeight + paddingBottom;
  };

  for (const section of sections) {
    if (cursorY > pageH - 45) {
      doc.addPage();
      cursorY = 25;
    }

    doc.setFont(SANS, 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...INK);
    doc.text(section.title || '', marginX, cursorY + 6);

    cursorY += 11;

    const fields = section.fields || [];
    if (fields.length === 0) {
      doc.setFont(SANS, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text('No fields in this section.', marginX, cursorY + 3);
      cursorY += 14;
      continue;
    }

    // Split consecutive text fields into grouped tables; each list field
    // (checkbox / likert) is rendered as its own borderless block.
    let textRun = [];
    for (const field of fields) {
      if (isListField(field)) {
        if (textRun.length) {
          renderTextTable(textRun, section);
          textRun = [];
        }
        renderListBlock(field, section);
      } else {
        textRun.push(field);
      }
    }
    if (textRun.length) {
      renderTextTable(textRun, section);
    }

    cursorY += 6;
  }

  // ─── Footer on every page ─────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageH - 14, pageW - marginX, pageH - 14);

    doc.setFont(SANS, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `${studentName || 'Student'}  ·  ${formatFormType(formType)}`,
      marginX,
      pageH - 8,
    );

    doc.setFont(SANS, 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Generated by IEP Pal', pageW / 2, pageH - 8, { align: 'center' });

    doc.setFont(SANS, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${i} / ${pageCount}`, pageW - marginX, pageH - 8, { align: 'right' });
  }

  const filename = `${(studentName || 'Student').replace(/[^a-z0-9]+/gi, '_')}_${formatFormType(formType).replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
