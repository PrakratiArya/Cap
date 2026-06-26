import { BHOPAL_AREAS } from './locations';

const IMG = {
  pothole: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
  water: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3782?auto=format&fit=crop&w=600&q=80',
  garbage: 'https://images.unsplash.com/photo-1530587194405-f9f3d3f3d3f3?auto=format&fit=crop&w=600&q=80',
  light: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80',
  tree: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
  drain: 'https://images.unsplash.com/photo-1585771723495-9caa2a7a0a0a?auto=format&fit=crop&w=600&q=80',
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function createDemoIssues() {
  const a = BHOPAL_AREAS;
  return [
    { id: 1, title: 'Deep pothole near MP Nagar junction', category: 'Roads/Infrastructure', issueType: 'Pothole', desc: 'Large pothole causing traffic slowdown and vehicle damage on main road.', lat: a.mp_nagar.lat, lng: a.mp_nagar.lng, ward: a.mp_nagar.ward, locality: a.mp_nagar.label, severity: 7, verifications: 4, rejections: 0, support: 12, votes: 18, resolved: false, routed: true, reporter: 'Priya Sharma', time: '2d ago', createdAt: daysAgo(2), aiConfidence: 94, priority: 'P1 — Critical', priorityTier: 'High Priority', imageBefore: IMG.pothole, imageAfter: '', comments: [{ user: 'Rahul V', text: 'Confirmed — still there today', time: '1d ago' }], verifiedBy: ['Rahul V', 'Amit K'] },
    { id: 2, title: 'Water leakage on New Market street', category: 'Water/Sewage', issueType: 'Water Leak', desc: 'Burst pipeline flooding the sidewalk near shop row.', lat: a.new_market.lat, lng: a.new_market.lng, ward: a.new_market.ward, locality: a.new_market.label, severity: 8, verifications: 6, rejections: 0, support: 15, votes: 22, resolved: false, routed: false, reporter: 'Nikhil Kumar', time: '5h ago', createdAt: daysAgo(0), aiConfidence: 91, priority: 'P0 — Urgent', priorityTier: 'High Priority', imageBefore: IMG.water, imageAfter: '', comments: [], verifiedBy: ['Sneha M'] },
    { id: 3, title: 'Garbage overflow at Arera Colony park', category: 'Sanitation', issueType: 'Garbage Overflow', desc: 'Municipal bins overflowing for 3 days, attracting stray animals.', lat: a.arera_colony.lat, lng: a.arera_colony.lng, ward: a.arera_colony.ward, locality: a.arera_colony.label, severity: 5, verifications: 2, rejections: 1, support: 8, votes: 9, resolved: false, routed: false, reporter: 'Anita Desai', time: '3d ago', createdAt: daysAgo(3), aiConfidence: 88, priority: 'P2 — Moderate', priorityTier: 'Medium Priority', imageBefore: IMG.garbage, imageAfter: '', comments: [], verifiedBy: [] },
    { id: 4, title: 'Broken streetlight on Kolar Road', category: 'Electricity', issueType: 'Broken Streetlight', desc: 'Streetlight pole #KR-42 not working — dark stretch at night.', lat: a.kolar_road.lat, lng: a.kolar_road.lng, ward: a.kolar_road.ward, locality: a.kolar_road.label, severity: 6, verifications: 3, rejections: 0, support: 6, votes: 11, resolved: false, routed: false, reporter: 'Vikram Singh', time: '1d ago', createdAt: daysAgo(1), aiConfidence: 89, priority: 'P2 — Moderate', priorityTier: 'Medium Priority', imageBefore: IMG.light, imageAfter: '', comments: [], verifiedBy: ['Meera P'] },
    { id: 5, title: 'Open manhole near Shahpura circle', category: 'Safety Hazard', issueType: 'Open Manhole', desc: 'Uncovered manhole on pedestrian path — serious safety risk.', lat: a.shahpura.lat, lng: a.shahpura.lng, ward: a.shahpura.ward, locality: a.shahpura.label, severity: 9, verifications: 8, rejections: 0, support: 20, votes: 28, resolved: false, routed: true, reporter: 'Kavita Joshi', time: '6h ago', createdAt: daysAgo(0), aiConfidence: 96, priority: 'P0 — Urgent', priorityTier: 'High Priority', imageBefore: IMG.pothole, imageAfter: '', comments: [{ user: 'BMC Officer', text: 'Team dispatched', time: '2h ago' }], verifiedBy: ['Rahul V', 'Amit K', 'Sneha M'] },
    { id: 6, title: 'Fallen tree blocking BHEL road', category: 'Environment', issueType: 'Fallen Tree', desc: 'Tree uprooted in last storm partially blocking one lane.', lat: a.bhel.lat, lng: a.bhel.lng, ward: a.bhel.ward, locality: a.bhel.label, severity: 7, verifications: 5, rejections: 0, support: 10, votes: 14, resolved: true, routed: true, reporter: 'Deepak Rao', time: '5d ago', createdAt: daysAgo(5), aiConfidence: 92, priority: 'P1 — Critical', priorityTier: 'High Priority', imageBefore: IMG.tree, imageAfter: IMG.tree, comments: [], verifiedBy: ['Rahul V'] },
    { id: 7, title: 'Sewage backup at TT Nagar', category: 'Drainage', issueType: 'Sewage Problem', desc: 'Sewage water accumulating near residential block entrance.', lat: a.tt_nagar.lat, lng: a.tt_nagar.lng, ward: a.tt_nagar.ward, locality: a.tt_nagar.label, severity: 8, verifications: 4, rejections: 0, support: 13, votes: 16, resolved: false, routed: false, reporter: 'Fatima Khan', time: '12h ago', createdAt: daysAgo(0), aiConfidence: 90, priority: 'P1 — Critical', priorityTier: 'High Priority', imageBefore: IMG.drain, imageAfter: '', comments: [], verifiedBy: [] },
    { id: 8, title: 'Illegal dumping near Lalghati', category: 'Sanitation', issueType: 'Illegal Dumping', desc: 'Construction debris dumped on vacant plot illegally.', lat: a.lalghati.lat, lng: a.lalghati.lng, ward: a.lalghati.ward, locality: a.lalghati.label, severity: 6, verifications: 1, rejections: 2, support: 4, votes: 5, resolved: false, routed: false, reporter: 'Rajesh Tiwari', time: '4d ago', createdAt: daysAgo(4), aiConfidence: 85, priority: 'P3 — Standard', priorityTier: 'Low Priority', imageBefore: IMG.garbage, imageAfter: '', comments: [], verifiedBy: [] },
    { id: 9, title: 'Traffic signal failure at Kohefiza', category: 'Safety Hazard', issueType: 'Traffic Signal Failure', desc: 'Traffic lights stuck on red causing congestion during peak hours.', lat: a.kohefiza.lat, lng: a.kohefiza.lng, ward: a.kohefiza.ward, locality: a.kohefiza.label, severity: 8, verifications: 7, rejections: 0, support: 17, votes: 20, resolved: false, routed: true, reporter: 'Suresh Patel', time: '8h ago', createdAt: daysAgo(0), aiConfidence: 93, priority: 'P0 — Urgent', priorityTier: 'High Priority', imageBefore: IMG.light, imageAfter: '', comments: [], verifiedBy: ['Amit K'] },
    { id: 10, title: 'Pothole cluster on Ashoka Garden road', category: 'Roads/Infrastructure', issueType: 'Pothole', desc: 'Multiple potholes on school route — needs urgent repair.', lat: a.ashoka_garden.lat, lng: a.ashoka_garden.lng, ward: a.ashoka_garden.ward, locality: a.ashoka_garden.label, severity: 6, verifications: 3, rejections: 0, support: 9, votes: 12, resolved: false, routed: false, reporter: 'Nikhil Kumar', time: '2d ago', createdAt: daysAgo(2), aiConfidence: 87, priority: 'P2 — Moderate', priorityTier: 'Medium Priority', imageBefore: IMG.pothole, imageAfter: '', comments: [], verifiedBy: [] },
    { id: 11, title: 'Water logging at Govindpura', category: 'Water/Sewage', issueType: 'Water Logging', desc: 'Persistent water logging after rain due to blocked drain.', lat: a.govindpura.lat, lng: a.govindpura.lng, ward: a.govindpura.ward, locality: a.govindpura.label, severity: 5, verifications: 2, rejections: 0, support: 7, votes: 8, resolved: false, routed: false, reporter: 'Lakshmi Nair', time: '3d ago', createdAt: daysAgo(3), aiConfidence: 86, priority: 'P2 — Moderate', priorityTier: 'Medium Priority', imageBefore: IMG.water, imageAfter: '', comments: [], verifiedBy: [] },
  ].map(issue => ({
    ...issue,
    riskWeight: 1.5,
    areaImportance: 1.8,
    userVoted: false,
    userVerified: false,
    userRejected: false,
  }));
}
