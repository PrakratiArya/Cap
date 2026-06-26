export function calculateAreaHealth(issueList) {
  const active = issueList.filter(i => !i.resolved).length;
  const resolved = issueList.filter(i => i.resolved).length;
  const base = 8.4 - active * 0.35 + resolved * 0.1;
  return Math.max(4.0, Math.min(10.0, base)).toFixed(1);
}

export function calculateImpactScore(issue) {
  const verifWeight = Math.min(issue.verifications, 10) * 0.3;
  const supportWeight = Math.min(issue.support, 20) * 0.15;
  const base = parseFloat(issue.severity) + verifWeight + supportWeight + issue.riskWeight + issue.areaImportance;
  return Math.min(Math.round(base * 10) / 10, 10.0).toFixed(1);
}

export function calculateMomentumScore(issue) {
  if (issue.resolved) return '0.0';
  const growth = issue.verifications * 1.2 + issue.support * 0.4;
  const urgency = issue.severity / 10;
  return Math.min(growth * (1 + urgency), 10).toFixed(1);
}

export function calculateTrustScore(issue) {
  return Math.min(6.5 + issue.verifications * 0.5, 10.0).toFixed(1);
}

export function getGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
}

export const CATEGORY_STYLES = {
  'Water/Sewage': { bg: 'var(--cat-water-bg)', text: 'var(--cat-water-text)', label: 'Water' },
  'Roads/Infrastructure': { bg: 'var(--cat-infra-bg)', text: 'var(--cat-infra-text)', label: 'Infrastructure' },
  'Sanitation': { bg: 'var(--cat-infra-bg)', text: 'var(--cat-infra-text)', label: 'Sanitation' },
  'Safety Hazard': { bg: 'var(--cat-critical-bg)', text: 'var(--cat-critical-text)', label: 'Safety' },
};

export const OPS_ROLES = ['municipal', 'admin'];
export const CITIZEN_ROLES = ['citizen', 'volunteer'];

export function isOpsRole(role) {
  return OPS_ROLES.includes(role);
}
