export const ACEH_CENTER = [4.695135, 96.749397] as [number, number]

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
  { id: 1, lat: 5.5483, lng: 95.3238, area: 'Banda Aceh', type: 'flood' as const, urgency: 'high' as const },
  { id: 2, lat: 5.1801, lng: 97.1507, area: 'Lhokseumawe', type: 'flood' as const, urgency: 'low' as const },
  { id: 3, lat: 4.6196, lng: 96.8435, area: 'Takengon', type: 'landslide' as const, urgency: 'medium' as const },
  { id: 4, lat: 4.144, lng: 96.1285, area: 'Meulaboh', type: 'flood' as const, urgency: 'medium' as const },
  { id: 5, lat: 3.4786, lng: 97.8121, area: 'Kutacane', type: 'landslide' as const, urgency: 'high' as const },
  { id: 6, lat: 5.383, lng: 95.9609, area: 'Sigli', type: 'flood' as const, urgency: 'medium' as const },
]

export const SHELTER_MAP_ITEMS = [
  {
    id: 1,
    name: 'Hilltop Evacuation Center',
    location: 'Hill District',
    count: 110,
    urgency: 'high' as const,
    latLng: [5.5512, 95.3168] as [number, number],
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
    name: 'Riverside Shelter',
    location: 'Riverside District',
    count: 72,
    urgency: 'medium' as const,
    latLng: [5.1817, 97.1478] as [number, number],
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
    name: 'Community Hall Shelter',
    location: 'Community Hall District',
    count: 45,
    urgency: 'low' as const,
    latLng: [4.6217, 96.8512] as [number, number],
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
    name: 'Meulaboh Coastal Shelter',
    location: 'Johan Pahlawan, Meulaboh',
    count: 110,
    urgency: 'high' as const,
    latLng: [4.1367, 96.1254] as [number, number],
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
    name: 'Kutacane Highland Shelter',
    location: 'Kutacane, Southeast Aceh',
    count: 110,
    urgency: 'high' as const,
    latLng: [3.4768, 97.8142] as [number, number],
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

export const ROUTE_STOPS = [
  {
    id: 'route-stop-1',
    name: 'Hilltop Shelter',
    location: 'Hill District',
    description: 'Priority food and clean water delivery point.',
    position: [4.6737, 96.7824] as [number, number],
  },
  {
    id: 'route-stop-2',
    name: 'Riverside Shelter',
    location: 'Riverside District',
    description: 'Medical kits and blankets needed soon.',
    position: [4.6515, 96.8062] as [number, number],
  },
  {
    id: 'route-stop-3',
    name: 'Community Hall Shelter',
    location: 'Community Hall District',
    description: 'Final shelter stop with mixed aid supplies.',
    position: [4.6296, 96.7741] as [number, number],
  },
]

export const ROUTE_PATH_POINTS = [
  ACEH_CENTER,
  [4.6848, 96.7659],
  [4.6737, 96.7824],
  [4.6623, 96.7922],
  [4.6515, 96.8062],
  [4.6403, 96.7928],
  [4.6296, 96.7741],
] as [number, number][]

export type RouteOption = {
  id: string
  name: string
  distanceKm: number
  etaMin: number
  sheltersToAssist: number
  peopleSupported: number
  path: [number, number][]
  stops: {
    id: string
    name: string
    location: string
    description: string
    position: [number, number]
  }[]
}

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'route-1',
    name: 'Route 1',
    distanceKm: 12.4,
    etaMin: 28,
    sheltersToAssist: 3,
    peopleSupported: 180,
    path: ROUTE_PATH_POINTS,
    stops: ROUTE_STOPS,
  },
  {
    id: 'route-2',
    name: 'Route 2',
    distanceKm: 13.1,
    etaMin: 31,
    sheltersToAssist: 3,
    peopleSupported: 165,
    path: [
      ACEH_CENTER,
      [4.6902, 96.7603],
      [4.6789, 96.7738],
      [4.6693, 96.7884],
      [4.6541, 96.8045],
      [4.6419, 96.798],
      [4.6335, 96.7812],
    ],
    stops: [
      {
        id: 'route-2-stop-1',
        name: 'Kebayakan Shelter',
        location: 'Kebayakan',
        description: 'Food packs and baby supplies needed.',
        position: [4.6789, 96.7738],
      },
      {
        id: 'route-2-stop-2',
        name: 'Bebesen Hall',
        location: 'Bebesen',
        description: 'Road partially flooded, proceed slowly.',
        position: [4.6541, 96.8045],
      },
      {
        id: 'route-2-stop-3',
        name: 'Lukup Relief Spot',
        location: 'Lukup',
        description: 'Medical kits are the top priority.',
        position: [4.6335, 96.7812],
      },
    ],
  },
  {
    id: 'route-3',
    name: 'Route 3',
    distanceKm: 11.8,
    etaMin: 26,
    sheltersToAssist: 3,
    peopleSupported: 172,
    path: [
      ACEH_CENTER,
      [4.6866, 96.7586],
      [4.6768, 96.7685],
      [4.6669, 96.7814],
      [4.6557, 96.7923],
      [4.6452, 96.7864],
      [4.6353, 96.7721],
    ],
    stops: [
      {
        id: 'route-3-stop-1',
        name: 'Pegasing Shelter',
        location: 'Pegasing',
        description: 'Water and blankets requested.',
        position: [4.6768, 96.7685],
      },
      {
        id: 'route-3-stop-2',
        name: 'Ketol Relief Post',
        location: 'Ketol',
        description: 'Bridge access is narrow for large vehicles.',
        position: [4.6557, 96.7923],
      },
      {
        id: 'route-3-stop-3',
        name: 'Jagong Aid Point',
        location: 'Jagong',
        description: 'Final stop before returning to base.',
        position: [4.6353, 96.7721],
      },
    ],
  },
]