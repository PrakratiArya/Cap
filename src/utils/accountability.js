const SLA_DAYS = { 'Safety Hazard': 2, 'Water/Sewage': 3, 'Roads/Infrastructure': 5, 'Sanitation': 4 };

export function getDaysPending(issue) {
  if (issue.resolved) return 0;
  const created = issue.createdAt ? new Date(issue.createdAt) : new Date();
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000));
}

export function getResolutionSla(issue) {
  const days = SLA_DAYS[issue.category] ?? 5;
  return `${days} business days`;
}

export function getSlaStatus(issue) {
  if (issue.resolved) return { label: 'Met', tone: 'success' };
  const pending = getDaysPending(issue);
  const limit = SLA_DAYS[issue.category] ?? 5;
  if (pending <= limit) return { label: 'On Track', tone: 'success' };
  if (pending <= limit + 2) return { label: 'Approaching Limit', tone: 'warning' };
  return { label: 'Review Recommended', tone: 'critical' };
}

export function getEscalationStatus(issue) {
  if (issue.resolved) return { label: 'Closed', tone: 'neutral' };
  if (issue.routed) return { label: 'With Municipal Team', tone: 'info' };
  const pending = getDaysPending(issue);
  const limit = SLA_DAYS[issue.category] ?? 5;
  if (pending > limit) return { label: 'Escalated for Review', tone: 'warning' };
  if (issue.verifications >= 3) return { label: 'Community Priority', tone: 'info' };
  return { label: 'Standard Queue', tone: 'neutral' };
}

export function getIssueStatus(issue) {
  if (issue.resolved) return 'statusResolved';
  if (issue.routed) return 'statusRouted';
  if (issue.verifications > 0) return 'statusVerified';
  return 'statusPending';
}

export function getWardResolutionRate(issues, ward = 'Sector 4') {
  const wardIssues = issues.filter(i => (i.ward || 'Sector 4') === ward);
  if (!wardIssues.length) return 0;
  return Math.round((wardIssues.filter(i => i.resolved).length / wardIssues.length) * 100);
}
