import { getIssueTypeMeta } from '../data/issueTypes';

const RULES = [
  { cat: 'Water/Sewage', re: /water|leak|pipe|sewage|drain|flood|logging/i },
  { cat: 'Sanitation', re: /garbage|trash|dump|waste|litter|sanitation/i },
  { cat: 'Electricity', re: /light|streetlight|lamp|electric|power/i },
  { cat: 'Drainage', re: /drain|sewer|manhole|sewage/i },
  { cat: 'Environment', re: /tree|fallen|branch|park/i },
  { cat: 'Safety Hazard', re: /hazard|danger|signal|manhole|open|unsafe|accident/i },
  { cat: 'Roads/Infrastructure', re: /road|pothole|crack|pavement|bridge/i },
];

export function localClassifyIssue({ title, description, category }) {
  const text = `${title} ${description}`;
  let detected = category;
  for (const { cat, re } of RULES) {
    if (re.test(text)) { detected = cat; break; }
  }
  const meta = getIssueTypeMeta(detected);
  const severity = detected === 'Safety Hazard' ? 8 : detected === 'Water/Sewage' ? 7 : 6;
  const confidence = 82 + Math.min(text.length / 5, 15);
  return {
    source: 'local-intelligence',
    category: detected,
    issueType: meta.label,
    severity,
    confidence: Math.round(confidence),
    riskLevel: severity >= 8 ? 'CRITICAL' : severity >= 6 ? 'HIGH' : 'MEDIUM',
    priority: severity >= 8 ? 'P0 — Urgent' : severity >= 6 ? 'P1 — Critical' : 'P2 — Moderate',
    department: meta.department,
    repairDays: meta.repairDays,
    tags: ['civic', 'bhopal', meta.filter],
    reasoning: `Classified as ${meta.label} based on keyword analysis. Severity ${severity}/10. Routed to ${meta.department}. Est. repair: ${meta.repairDays} days.`,
    duplicateRisk: text.length > 20 ? 'low' : 'unknown',
  };
}
