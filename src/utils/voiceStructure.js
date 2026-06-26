const CATEGORY_KEYWORDS = [
  { category: 'Water/Sewage', patterns: /water|sewage|leak|drain|pipe|flood|sewer/i },
  { category: 'Sanitation', patterns: /garbage|trash|sanitation|waste|dump|litter/i },
  { category: 'Safety Hazard', patterns: /hazard|danger|unsafe|accident|electric|fire/i },
  { category: 'Roads/Infrastructure', patterns: /road|pothole|street|sidewalk|bridge|pavement|crack/i },
];

export function localStructureVoice(transcript) {
  const description = transcript.trim();
  const title = description.length > 48 ? `${description.slice(0, 45)}…` : description;
  let category = 'Roads/Infrastructure';
  for (const { category: cat, patterns } of CATEGORY_KEYWORDS) {
    if (patterns.test(description)) {
      category = cat;
      break;
    }
  }
  return {
    source: 'local-fallback',
    title: title || 'Voice report',
    description,
    category,
    transcript: description,
  };
}
