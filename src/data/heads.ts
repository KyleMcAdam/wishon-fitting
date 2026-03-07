import type { ClubHead } from '@/types';

export const headDatabase: ClubHead[] = [
  // Drivers
  {
    id: 'head-001',
    brand: 'Wishon',
    model: '919THI',
    type: 'driver',
    loft: 9.5,
    headWeight: 198,
    cg: { horizontal: 2.5, vertical: 28, depth: 32 },
    moi: { vertical: 480, horizontal: 520 },
    face: { angle: 0, bulge: 10, roll: 10 },
    lie: 58,
    lengthStd: 44.5
  },
  {
    id: 'head-002',
    brand: 'Wishon',
    model: '919THI',
    type: 'driver',
    loft: 10.5,
    headWeight: 198,
    cg: { horizontal: 2.5, vertical: 27, depth: 33 },
    moi: { vertical: 485, horizontal: 525 },
    face: { angle: 0, bulge: 10, roll: 10 },
    lie: 58,
    lengthStd: 44.5
  },
  {
    id: 'head-003',
    brand: 'Wishon',
    model: '919THI',
    type: 'driver',
    loft: 12,
    headWeight: 198,
    cg: { horizontal: 2.5, vertical: 26, depth: 34 },
    moi: { vertical: 490, horizontal: 530 },
    face: { angle: 0, bulge: 10, roll: 10 },
    lie: 58,
    lengthStd: 44.5
  },
  {
    id: 'head-004',
    brand: 'Wishon',
    model: '515CC',
    type: 'driver',
    loft: 9,
    headWeight: 195,
    cg: { horizontal: 3, vertical: 30, depth: 30 },
    moi: { vertical: 460, horizontal: 500 },
    face: { angle: 0.5, bulge: 10, roll: 10 },
    lie: 57,
    lengthStd: 44
  },
  {
    id: 'head-005',
    brand: 'Wishon',
    model: '515CC',
    type: 'driver',
    loft: 10.5,
    headWeight: 195,
    cg: { horizontal: 3, vertical: 29, depth: 31 },
    moi: { vertical: 465, horizontal: 505 },
    face: { angle: 0.5, bulge: 10, roll: 10 },
    lie: 57,
    lengthStd: 44
  },
  
  // Fairway Woods
  {
    id: 'head-006',
    brand: 'Wishon',
    model: '730CL',
    type: 'fairway',
    loft: 15,
    headWeight: 210,
    cg: { horizontal: 2, vertical: 22, depth: 25 },
    moi: { vertical: 380, horizontal: 420 },
    face: { angle: 0, bulge: 12, roll: 12 },
    lie: 57,
    lengthStd: 43
  },
  {
    id: 'head-007',
    brand: 'Wishon',
    model: '730CL',
    type: 'fairway',
    loft: 18,
    headWeight: 215,
    cg: { horizontal: 2, vertical: 21, depth: 26 },
    moi: { vertical: 385, horizontal: 425 },
    face: { angle: 0, bulge: 12, roll: 12 },
    lie: 57.5,
    lengthStd: 42.5
  },
  {
    id: 'head-008',
    brand: 'Wishon',
    model: '730CL',
    type: 'fairway',
    loft: 21,
    headWeight: 220,
    cg: { horizontal: 2, vertical: 20, depth: 27 },
    moi: { vertical: 390, horizontal: 430 },
    face: { angle: 0, bulge: 12, roll: 12 },
    lie: 58,
    lengthStd: 42
  },
  
  // Hybrids
  {
    id: 'head-009',
    brand: 'Wishon',
    model: '775HS',
    type: 'hybrid',
    loft: 19,
    headWeight: 232,
    cg: { horizontal: 1.5, vertical: 18, depth: 20 },
    moi: { vertical: 320, horizontal: 360 },
    face: { angle: 0, bulge: 14, roll: 14 },
    lie: 58.5,
    lengthStd: 40.5
  },
  {
    id: 'head-010',
    brand: 'Wishon',
    model: '775HS',
    type: 'hybrid',
    loft: 22,
    headWeight: 238,
    cg: { horizontal: 1.5, vertical: 17, depth: 21 },
    moi: { vertical: 325, horizontal: 365 },
    face: { angle: 0, bulge: 14, roll: 14 },
    lie: 59,
    lengthStd: 40
  },
  {
    id: 'head-011',
    brand: 'Wishon',
    model: '775HS',
    type: 'hybrid',
    loft: 25,
    headWeight: 244,
    cg: { horizontal: 1.5, vertical: 16, depth: 22 },
    moi: { vertical: 330, horizontal: 370 },
    face: { angle: 0, bulge: 14, roll: 14 },
    lie: 59.5,
    lengthStd: 39.5
  },
  
  // Irons
  {
    id: 'head-012',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 20,
    headWeight: 246,
    cg: { horizontal: 2, vertical: 15, depth: 5 },
    moi: { vertical: 260, horizontal: 290 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 60,
    lengthStd: 38.75
  },
  {
    id: 'head-013',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 23,
    headWeight: 253,
    cg: { horizontal: 2, vertical: 15.5, depth: 5.5 },
    moi: { vertical: 265, horizontal: 295 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 60.5,
    lengthStd: 38.25
  },
  {
    id: 'head-014',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 26,
    headWeight: 260,
    cg: { horizontal: 2, vertical: 16, depth: 6 },
    moi: { vertical: 270, horizontal: 300 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 61,
    lengthStd: 37.75
  },
  {
    id: 'head-015',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 30,
    headWeight: 267,
    cg: { horizontal: 2, vertical: 16.5, depth: 6.5 },
    moi: { vertical: 275, horizontal: 305 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 61.5,
    lengthStd: 37.25
  },
  {
    id: 'head-016',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 34,
    headWeight: 274,
    cg: { horizontal: 2, vertical: 17, depth: 7 },
    moi: { vertical: 280, horizontal: 310 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 62,
    lengthStd: 36.75
  },
  {
    id: 'head-017',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 38,
    headWeight: 281,
    cg: { horizontal: 2, vertical: 17.5, depth: 7.5 },
    moi: { vertical: 285, horizontal: 315 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 62.5,
    lengthStd: 36.25
  },
  {
    id: 'head-018',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 42,
    headWeight: 288,
    cg: { horizontal: 2, vertical: 18, depth: 8 },
    moi: { vertical: 290, horizontal: 320 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 63,
    lengthStd: 35.75
  },
  {
    id: 'head-019',
    brand: 'Wishon',
    model: '560MC',
    type: 'iron',
    loft: 46,
    headWeight: 295,
    cg: { horizontal: 2, vertical: 18.5, depth: 8.5 },
    moi: { vertical: 295, horizontal: 325 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 63.5,
    lengthStd: 35.5
  },
  
  // Wedges
  {
    id: 'head-020',
    brand: 'Wishon',
    model: 'PCF Micro-Groove',
    type: 'wedge',
    loft: 50,
    headWeight: 298,
    cg: { horizontal: 1, vertical: 19, depth: 4 },
    moi: { vertical: 300, horizontal: 330 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 64,
    lengthStd: 35.5
  },
  {
    id: 'head-021',
    brand: 'Wishon',
    model: 'PCF Micro-Groove',
    type: 'wedge',
    loft: 54,
    headWeight: 302,
    cg: { horizontal: 1, vertical: 19.5, depth: 4.5 },
    moi: { vertical: 305, horizontal: 335 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 64,
    lengthStd: 35.25
  },
  {
    id: 'head-022',
    brand: 'Wishon',
    model: 'PCF Micro-Groove',
    type: 'wedge',
    loft: 58,
    headWeight: 306,
    cg: { horizontal: 1, vertical: 20, depth: 5 },
    moi: { vertical: 310, horizontal: 340 },
    face: { angle: 0, bulge: 0, roll: 0 },
    lie: 64,
    lengthStd: 35.25
  }
];

export const getHeadsByType = (type: 'driver' | 'fairway' | 'hybrid' | 'iron' | 'wedge'): ClubHead[] => {
  return headDatabase.filter(h => h.type === type);
};

export const getHeadById = (id: string): ClubHead | undefined => {
  return headDatabase.find(h => h.id === id);
};
