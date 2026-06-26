import { getIssueTypeMeta } from '../data/issueTypes';

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

export function createMarkerHtml(issue, selected) {
  const meta = getIssueTypeMeta(issue.category);
  const size = selected ? 38 : 32;
  const border = selected ? '3px solid #F59E0B' : '2px solid #fff';
  const opacity = issue.resolved ? 0.65 : 1;
  return `<div class="jodo-marker ${selected ? 'selected' : ''}" style="
    width:${size}px;height:${size}px;border-radius:50%;background:${meta.bg};
    border:${border};display:flex;align-items:center;justify-content:center;
    font-size:${selected ? 18 : 15}px;box-shadow:0 2px 8px rgba(0,0,0,0.25);
    opacity:${opacity};transform:${selected ? 'scale(1.1)' : 'scale(1)'};
  ">${meta.icon}</div>`;
}

export function computePriorityTier(issue) {
  const age = issue.createdAt ? (Date.now() - new Date(issue.createdAt).getTime()) / 86400000 : 0;
  const score = (issue.votes || 0) * 2 + issue.severity * 3 + issue.verifications * 2 + age * 0.5 + (issue.aiConfidence || 80) * 0.05;
  if (score >= 45) return 'High Priority';
  if (score >= 25) return 'Medium Priority';
  return 'Low Priority';
}

export function filterIssues(issues, filterId, { username, userLat, userLng } = {}) {
  if (filterId === 'all') return issues;
  if (filterId === 'resolved') return issues.filter(i => i.resolved);
  if (filterId === 'pending') return issues.filter(i => !i.resolved);
  if (filterId === 'verified') return issues.filter(i => i.verifications > 0);
  if (filterId === 'critical') return issues.filter(i => i.severity >= 8 || i.category === 'Safety Hazard');
  if (filterId === 'mine') return issues.filter(i => i.reporter === username);
  if (filterId === 'nearby' && userLat && userLng) {
    return [...issues].sort((a, b) =>
      haversineKm(userLat, userLng, a.lat, a.lng) - haversineKm(userLat, userLng, b.lat, b.lng)
    ).slice(0, 15);
  }
  return issues.filter(i => getIssueTypeMeta(i.category).filter === filterId);
}
