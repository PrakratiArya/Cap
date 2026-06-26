export const ISSUE_TYPES = {
  'Water/Sewage': {
    label: 'Water Leak',
    icon: '💧',
    color: '#0369A1',
    bg: '#E0F2FE',
    filter: 'water',
    department: 'Bhopal Municipal Corporation — Water Dept',
    repairDays: 3,
  },
  'Roads/Infrastructure': {
    label: 'Pothole / Roads',
    icon: '🕳️',
    color: '#C2410C',
    bg: '#FFEDD5',
    filter: 'roads',
    department: 'PWD — Roads & Infrastructure',
    repairDays: 5,
  },
  Sanitation: {
    label: 'Garbage Overflow',
    icon: '🗑️',
    color: '#854D0E',
    bg: '#FEF9C3',
    filter: 'garbage',
    department: 'BMC — Sanitation Wing',
    repairDays: 2,
  },
  'Safety Hazard': {
    label: 'Safety Hazard',
    icon: '⚠️',
    color: '#B91C1C',
    bg: '#FEE2E2',
    filter: 'critical',
    department: 'Disaster Management Cell',
    repairDays: 1,
  },
  Electricity: {
    label: 'Streetlight',
    icon: '💡',
    color: '#CA8A04',
    bg: '#FEF3C7',
    filter: 'electricity',
    department: 'MPPKVVCL — Street Lighting',
    repairDays: 4,
  },
  Drainage: {
    label: 'Drainage / Sewage',
    icon: '🚧',
    color: '#0D9488',
    bg: '#CCFBF1',
    filter: 'drainage',
    department: 'BMC — Drainage Division',
    repairDays: 4,
  },
  Environment: {
    label: 'Fallen Tree',
    icon: '🌳',
    color: '#15803D',
    bg: '#DCFCE7',
    filter: 'environment',
    department: 'Forest & Parks Dept',
    repairDays: 2,
  },
};

export const MAP_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'water', label: 'Water' },
  { id: 'roads', label: 'Roads' },
  { id: 'garbage', label: 'Garbage' },
  { id: 'electricity', label: 'Electricity' },
  { id: 'drainage', label: 'Drainage' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'pending', label: 'Pending' },
  { id: 'critical', label: 'Critical' },
  { id: 'verified', label: 'Verified' },
  { id: 'mine', label: 'My Issues' },
  { id: 'nearby', label: 'Nearby' },
];

export function getIssueTypeMeta(category) {
  return ISSUE_TYPES[category] || ISSUE_TYPES['Roads/Infrastructure'];
}
