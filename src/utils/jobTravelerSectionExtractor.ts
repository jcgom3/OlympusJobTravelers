import type { JobTravelerSection } from "../types";

interface DetectedSection {
  id: string;
  labelEn: string;
  labelEs: string;
  contentEn: string;
  source: "major-section" | "detected-field";
  position: number;
}

const LABEL_TRANSLATIONS: Record<string, string> = {
  "Reference Job Changes": "Cambios del Trabajo de Referencia",
  "Job Changes": "Cambios del Trabajo",
  "Art Information": "Información de Arte",
  "Artwork Location": "Ubicación del Arte",
  "Number of Designs": "Número de Diseños",
  "Art Comment": "Comentario de Arte",
  "Main Comments": "Comentarios Principales",
  "Additional Comments": "Comentarios Adicionales",
  "Packing / Shipping Comments": "Comentarios de Empaque y Envío",
  "Packing Comments": "Comentarios de Empaque",
  "Shipping Comments": "Comentarios de Envío",
  "Material Comment": "Comentario de Material",
  Comments: "Comentarios",
  Comment: "Comentario",
  Notes: "Notas",
  Note: "Nota",
  Instructions: "Instrucciones",
  "Special Instructions": "Instrucciones Especiales",
};

const MAJOR_SECTION_LABELS = [
  "Art Information",
  "Main Comments",
  "Additional Comments",
  "Packing / Shipping Comments",
];

const DETECTED_FIELD_LABELS = [
  "Reference Job Changes",
  "Job Changes",
  "Artwork Location",
  "Number of Designs",
  "Art Comment",
  "Material Comment",
  "Packing Comments",
  "Shipping Comments",
  "Comments",
  "Comment",
  "Notes",
  "Note",
  "Instructions",
  "Special Instructions",
];

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanMergedPdfWords(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1. $2")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createSectionId(labelEn: string, position: number): string {
  return `${slugify(labelEn)}-${position}`;
}

function createSectionKey(labelEn: string, contentEn: string): string {
  return `${labelEn.toLowerCase()}::${normalizeWhitespace(
    contentEn,
  ).toLowerCase()}`;
}

function findMajorSectionMatches(rawText: string): DetectedSection[] {
  const sections: DetectedSection[] = [];

  for (const label of MAJOR_SECTION_LABELS) {
    const labelWithColon = `${label}:`;
    const startIndex = rawText.indexOf(labelWithColon);

    if (startIndex === -1) {
      continue;
    }

    const contentStart = startIndex + labelWithColon.length;

    const possibleEndIndexes = MAJOR_SECTION_LABELS.filter(
      (otherLabel) => otherLabel !== label,
    )
      .map((otherLabel) => rawText.indexOf(`${otherLabel}:`, contentStart))
      .filter((index) => index !== -1);

    const contentEnd =
      possibleEndIndexes.length > 0
        ? Math.min(...possibleEndIndexes)
        : rawText.length;

    const content = normalizeWhitespace(
      rawText.slice(contentStart, contentEnd),
    );

    if (!content) {
      continue;
    }

    sections.push({
      id: createSectionId(label, startIndex),
      labelEn: label,
      labelEs: LABEL_TRANSLATIONS[label] ?? label,
      contentEn: cleanMergedPdfWords(content),
      source: "major-section",
      position: startIndex,
    });
  }

  return sections;
}

function findDetectedInlineFields(rawText: string): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const lines = rawText.split("\n");

  let runningPosition = 0;

  for (const line of lines) {
    const cleanLine = normalizeWhitespace(line);
    const linePosition = runningPosition;

    runningPosition += line.length + 1;

    if (!cleanLine.includes(":")) {
      continue;
    }

    for (const label of DETECTED_FIELD_LABELS) {
      const pattern = new RegExp(`^${label}\\s*:\\s*(.+)$`, "i");
      const match = cleanLine.match(pattern);

      if (!match?.[1]) {
        continue;
      }

      const content = cleanMergedPdfWords(match[1]);

      if (!content) {
        continue;
      }

      sections.push({
        id: createSectionId(label, linePosition),
        labelEn: label,
        labelEs: LABEL_TRANSLATIONS[label] ?? label,
        contentEn: content,
        source: "detected-field",
        position: linePosition,
      });
    }
  }

  return sections;
}

function dedupeSections(sections: DetectedSection[]): DetectedSection[] {
  const seen = new Set<string>();

  return sections.filter((section) => {
    const key = createSectionKey(section.labelEn, section.contentEn);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractTranslatableSectionsInDocumentOrder(
  rawText: string,
): JobTravelerSection[] {
  const normalizedText = normalizeWhitespace(rawText);

  const allDetectedSections = [
    ...findDetectedInlineFields(normalizedText),
    ...findMajorSectionMatches(normalizedText),
  ];

  const orderedByDocumentPosition = allDetectedSections.sort(
    (a, b) => a.position - b.position,
  );

  const uniqueSections = dedupeSections(orderedByDocumentPosition);

  return uniqueSections.map((section) => ({
    id: section.id,
    labelEn: section.labelEn,
    labelEs: section.labelEs,
    contentEn: section.contentEn,
    contentEs: "",
  }));
}
