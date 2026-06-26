export const BHOPAL_CENTER = [23.2599, 77.4126];

export const INDIAN_STATES = [
  'Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Delhi', 'Rajasthan', 'Gujarat', 'Uttar Pradesh',
];

export const CITIES_BY_STATE = {
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  Karnataka: ['Bengaluru', 'Mysuru'],
  Delhi: ['New Delhi'],
  Rajasthan: ['Jaipur', 'Udaipur'],
  Gujarat: ['Ahmedabad', 'Surat'],
  'Uttar Pradesh': ['Lucknow', 'Noida'],
};

export const BHOPAL_WARDS = [
  'Ward 1 — MP Nagar', 'Ward 2 — New Market', 'Ward 3 — Arera Colony', 'Ward 4 — Kolar Road',
  'Ward 5 — Shahpura', 'Ward 6 — BHEL', 'Ward 7 — TT Nagar', 'Ward 8 — Lalghati',
  'Ward 9 — Kohefiza', 'Ward 10 — Ashoka Garden', 'Ward 11 — Govindpura',
];

export const BHOPAL_AREAS = {
  mp_nagar: { label: 'MP Nagar', ward: 'Ward 1 — MP Nagar', lat: 23.2456, lng: 77.4010 },
  new_market: { label: 'New Market', ward: 'Ward 2 — New Market', lat: 23.2584, lng: 77.3968 },
  arera_colony: { label: 'Arera Colony', ward: 'Ward 3 — Arera Colony', lat: 23.2341, lng: 77.4278 },
  kolar_road: { label: 'Kolar Road', ward: 'Ward 4 — Kolar Road', lat: 23.2102, lng: 77.4431 },
  shahpura: { label: 'Shahpura', ward: 'Ward 5 — Shahpura', lat: 23.2812, lng: 77.4589 },
  bhel: { label: 'BHEL', ward: 'Ward 6 — BHEL', lat: 23.2189, lng: 77.4612 },
  tt_nagar: { label: 'TT Nagar', ward: 'Ward 7 — TT Nagar', lat: 23.2678, lng: 77.3891 },
  lalghati: { label: 'Lalghati', ward: 'Ward 8 — Lalghati', lat: 23.2912, lng: 77.3712 },
  kohefiza: { label: 'Kohefiza', ward: 'Ward 9 — Kohefiza', lat: 23.2523, lng: 77.4189 },
  ashoka_garden: { label: 'Ashoka Garden', ward: 'Ward 10 — Ashoka Garden', lat: 23.2389, lng: 77.3845 },
  govindpura: { label: 'Govindpura', ward: 'Ward 11 — Govindpura', lat: 23.2234, lng: 77.4012 },
};

export const DEFAULT_PROFILE = {
  state: 'Madhya Pradesh',
  city: 'Bhopal',
  ward: 'Ward 1 — MP Nagar',
  locality: 'MP Nagar',
  lat: BHOPAL_CENTER[0],
  lng: BHOPAL_CENTER[1],
};
