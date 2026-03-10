export const LEGEND_ITEMS = [
  {
    id: 'high',
    color: 'red' as const,
    label: 'High Urgency Level',
    subtext: 'Immediate assistance required',
  },
  {
    id: 'medium',
    color: 'yellow' as const,
    label: 'Medium Urgency Level',
    subtext: 'Assistance needed soon',
  },
  {
    id: 'low',
    color: 'green' as const,
    label: 'Low Urgency Level',
    subtext: 'Situation under monitoring',
  },
]

export const CRITICAL_NEEDS = [
  {
    id: 1,
    title: 'Clean Water',
    description: 'Needed for 120 people',
    locations: 3,
    urgency: 'high' as const,
  },
  {
    id: 2,
    title: 'Medical Kits',
    description: 'Low stock, required within 24 hrs.',
    locations: 2,
    urgency: 'high' as const,
  },
]

export const SHELTERS = [
  {
    id: 1,
    name: 'Hilltop Evacuation Center',
    location: 'Hill District',
    count: 110,
    urgency: 'high' as const,
  },
  {
    id: 2,
    name: 'North Valley Shelter',
    location: 'Valley Pass',
    count: 72,
    urgency: 'medium' as const,
  },
  {
    id: 3,
    name: 'Downtown Community Hub',
    location: 'Central Square',
    count: 45,
    urgency: 'low' as const,
  },
]

export const MAP_REPORTS = [
  { id: 1, lat: 20, lng: 67, type: 'flood', urgency: 'high' as const },
  { id: 2, lat: 38, lng: 56, type: 'flood', urgency: 'low' as const },
  { id: 3, lat: 35, lng: 49, type: 'landslide', urgency: 'medium' as const },
]

export const SHELTER_MAP_ITEMS = [
  {
    id: 1,
    name: 'Hilltop Evacuation Center',
    location: 'Hill District',
    count: 110,
    urgency: 'high' as const,
    latLng: [38.8939, -77.0708] as [number, number],
    details: {
      occupancy: [
        { label: 'Male', value: 52 },
        { label: 'Female', value: 58 },
      ],
      ageDistribution: [
        { label: 'Children (0–14)', value: 28 },
        { label: 'Adults (15–64)', value: 70 },
        { label: 'Elderly (65+)', value: 12 },
      ],
      healthConditions: [
        { label: 'Medical Attention Needed', value: 8 },
        { label: 'Limited Mobility', value: 3 },
        { label: 'Chronic Illness', value: 5 },
        { label: 'Pregnant Women', value: 2 },
        { label: 'Infants / Babies', value: 6 },
      ],
      currentNeeds: [
        { label: 'Clean Water', value: '60 liters' },
        { label: 'Blankets', value: '72 blankets' },
        { label: 'Food Supplies', value: '40 meal packs' },
        { label: 'Medical Kits', value: '30 kits' },
      ],
    },
  },
  {
    id: 2,
    name: 'North Community Shelter',
    location: 'Riverside Area',
    count: 72,
    urgency: 'medium' as const,
    latLng: [38.9018, -77.1056] as [number, number],
    details: {
      occupancy: [
        { label: 'Male', value: 35 },
        { label: 'Female', value: 37 },
      ],
      ageDistribution: [
        { label: 'Children (0–14)', value: 19 },
        { label: 'Adults (15–64)', value: 45 },
        { label: 'Elderly (65+)', value: 8 },
      ],
      healthConditions: [
        { label: 'Medical Attention Needed', value: 4 },
        { label: 'Limited Mobility', value: 2 },
        { label: 'Chronic Illness', value: 3 },
        { label: 'Pregnant Women', value: 1 },
        { label: 'Infants / Babies', value: 3 },
      ],
      currentNeeds: [
        { label: 'Clean Water', value: '45 liters' },
        { label: 'Blankets', value: '30 blankets' },
        { label: 'Food Supplies', value: '28 meal packs' },
        { label: 'Medical Kits', value: '14 kits' },
      ],
    },
  },
  {
    id: 3,
    name: 'Green Bridge Shelter',
    location: 'Green Bridge District',
    count: 45,
    urgency: 'low' as const,
    latLng: [38.8872, -77.1324] as [number, number],
    details: {
      occupancy: [
        { label: 'Male', value: 20 },
        { label: 'Female', value: 25 },
      ],
      ageDistribution: [
        { label: 'Children (0–14)', value: 10 },
        { label: 'Adults (15–64)', value: 29 },
        { label: 'Elderly (65+)', value: 6 },
      ],
      healthConditions: [
        { label: 'Medical Attention Needed', value: 2 },
        { label: 'Limited Mobility', value: 1 },
        { label: 'Chronic Illness', value: 2 },
        { label: 'Pregnant Women', value: 0 },
        { label: 'Infants / Babies', value: 1 },
      ],
      currentNeeds: [
        { label: 'Clean Water', value: '20 liters' },
        { label: 'Blankets', value: '15 blankets' },
        { label: 'Food Supplies', value: '15 meal packs' },
        { label: 'Medical Kits', value: '8 kits' },
      ],
    },
  },
  {
    id: 4,
    name: 'Hilltop Evacuation Center',
    location: 'Hill District',
    count: 110,
    urgency: 'high' as const,
    latLng: [38.8834, -77.0822] as [number, number],
    details: {
      occupancy: [
        { label: 'Male', value: 52 },
        { label: 'Female', value: 58 },
      ],
      ageDistribution: [
        { label: 'Children (0–14)', value: 28 },
        { label: 'Adults (15–64)', value: 70 },
        { label: 'Elderly (65+)', value: 12 },
      ],
      healthConditions: [
        { label: 'Medical Attention Needed', value: 8 },
        { label: 'Limited Mobility', value: 3 },
        { label: 'Chronic Illness', value: 5 },
        { label: 'Pregnant Women', value: 2 },
        { label: 'Infants / Babies', value: 6 },
      ],
      currentNeeds: [
        { label: 'Clean Water', value: '60 liters' },
        { label: 'Blankets', value: '72 blankets' },
        { label: 'Food Supplies', value: '40 meal packs' },
        { label: 'Medical Kits', value: '30 kits' },
      ],
    },
  },
  {
    id: 5,
    name: 'Hilltop Evacuation Center',
    location: 'Hill District',
    count: 110,
    urgency: 'high' as const,
    latLng: [38.8983, -77.1279] as [number, number],
    details: {
      occupancy: [
        { label: 'Male', value: 52 },
        { label: 'Female', value: 58 },
      ],
      ageDistribution: [
        { label: 'Children (0–14)', value: 28 },
        { label: 'Adults (15–64)', value: 70 },
        { label: 'Elderly (65+)', value: 12 },
      ],
      healthConditions: [
        { label: 'Medical Attention Needed', value: 8 },
        { label: 'Limited Mobility', value: 3 },
        { label: 'Chronic Illness', value: 5 },
        { label: 'Pregnant Women', value: 2 },
        { label: 'Infants / Babies', value: 6 },
      ],
      currentNeeds: [
        { label: 'Clean Water', value: '60 liters' },
        { label: 'Blankets', value: '72 blankets' },
        { label: 'Food Supplies', value: '40 meal packs' },
        { label: 'Medical Kits', value: '30 kits' },
      ],
    },
  },
]