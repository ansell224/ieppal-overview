// 6 Category Groups
export const categoryGroups = [
  {
    label: "Behavioral",
    match: /^behavioral|^systemic|^collaborative\/problem|^intervention|social|instructional|motivational|relational/i,
  },
  {
    label: "Emotional Regulation",
    match: /emotional regulation/i,
  },
  {
    label: "Self-Regulation",
    match: /self-regulation|self-management|cognitive\/social/i,
  },
  {
    label: "Environment & Sensory",
    match: /environment|sensory|antecedent|structural|visual\/environmental|accommodation|assessment\/diagnostic/i,
  },
  {
    label: "Literacy & Reading",
    match: /literacy|phonics|phonological|fluency|reading|comprehension|vocabulary|spelling|word recognition|whole-word|written expression|decoding/i,
  },
  {
    label: "Executive Function",
    match: /executive function/i,
  },
];

// 7 Diagnosis Groups — simplifying 17 raw primaryDiagnosis values
export const diagnosisGroups = [
  {
    label: "ADHD",
    match: /ADHD/i,
  },
  {
    label: "Autism",
    match: /autism/i,
  },
  {
    label: "Dyslexia / Reading",
    match: /dyslexia|specific learning disabilit|SLD in Reading|developmental language/i,
  },
  {
    label: "Behavioral / Emotional",
    match: /^behavioral|^emotional regulation/i,
  },
  {
    label: "Anxiety / OCD",
    match: /OCD|anxiety/i,
  },
  {
    label: "Executive Function",
    match: /^executive function/i,
  },
  {
    label: "Cross-Neurodiversity",
    match: /cross-neurodiversity/i,
  },
];

// Resolve a raw category string to its group
export function getCategoryGroup(rawCategory) {
  for (const group of categoryGroups) {
    if (group.match.test(rawCategory)) return group;
  }
  // Fallback to last group
  return categoryGroups[categoryGroups.length - 1];
}

// Resolve a raw primaryDiagnosis string to its group label
export function getDiagnosisGroup(rawDiagnosis) {
  for (const group of diagnosisGroups) {
    if (group.match.test(rawDiagnosis)) return group;
  }
  return diagnosisGroups[diagnosisGroups.length - 1];
}

export function getDiagnosisGroupsForStrategy(strategy) {
  const allDiagnoses = strategy?.applicableDiagnoses
    ? strategy.applicableDiagnoses.split(/[;,]/).map((d) => d.trim()).filter(Boolean)
    : [];

  if (strategy?.primaryDiagnosis) {
    allDiagnoses.push(strategy.primaryDiagnosis);
  }

  const matchedGroups = new Map();
  allDiagnoses.forEach((diagnosis) => {
    const group = getDiagnosisGroup(diagnosis);
    if (!matchedGroups.has(group.label)) {
      matchedGroups.set(group.label, group);
    }
  });

  return Array.from(matchedGroups.values());
}

// Filter strategies: AND between filter types, OR within a type
export function filterStrategies(strategies, { search, categories, diagnoses }) {
  return strategies.filter((s) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const searchable = [s.strategyName, s.briefOverview, s.bookTitle, s.author]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Category filter (OR within)
    if (categories.length > 0) {
      const group = getCategoryGroup(s.strategyCategory);
      if (!categories.includes(group.label)) return false;
    }

    // Diagnosis filter (OR within) — check all applicable diagnoses, not just primary
    if (diagnoses.length > 0) {
      const matchedGroups = new Set(getDiagnosisGroupsForStrategy(s).map((d) => d.label));
      if (!diagnoses.some((d) => matchedGroups.has(d))) return false;
    }

    return true;
  });
}
