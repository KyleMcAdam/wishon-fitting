import type { ShaftProfile } from '@/types';

export const shaftDatabase: ShaftProfile[] = [
  {
    id: 'shaft-001',
    brand: 'Wishon',
    model: 'S2S Green 65',
    flex: 'R',
    weight: 65,
    length: 46,
    torque: 3.8,
    kickpoint: 'mid',
    eiProfile: { at11: 90, at16: 95, at21: 100, at26: 105, at31: 110, at36: 115 },
    cpm: 245,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-002',
    brand: 'Wishon',
    model: 'S2S Green 65',
    flex: 'S',
    weight: 67,
    length: 46,
    torque: 3.5,
    kickpoint: 'mid',
    eiProfile: { at11: 100, at16: 105, at21: 110, at26: 115, at31: 120, at36: 125 },
    cpm: 255,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-003',
    brand: 'Wishon',
    model: 'S2S Green 65',
    flex: 'X',
    weight: 69,
    length: 46,
    torque: 3.2,
    kickpoint: 'mid',
    eiProfile: { at11: 110, at16: 115, at21: 120, at26: 125, at31: 130, at36: 135 },
    cpm: 265,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-004',
    brand: 'Wishon',
    model: 'S2S White 75',
    flex: 'S',
    weight: 75,
    length: 46,
    torque: 3.0,
    kickpoint: 'high',
    eiProfile: { at11: 115, at16: 120, at21: 125, at26: 130, at31: 135, at36: 140 },
    cpm: 260,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-005',
    brand: 'Wishon',
    model: 'S2S White 75',
    flex: 'X',
    weight: 78,
    length: 46,
    torque: 2.8,
    kickpoint: 'high',
    eiProfile: { at11: 125, at16: 130, at21: 135, at26: 140, at31: 145, at36: 150 },
    cpm: 270,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-006',
    brand: 'Wishon',
    model: 'S2S Red 55',
    flex: 'A',
    weight: 55,
    length: 46,
    torque: 4.5,
    kickpoint: 'low',
    eiProfile: { at11: 70, at16: 75, at21: 80, at26: 85, at31: 90, at36: 95 },
    cpm: 230,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-007',
    brand: 'Wishon',
    model: 'S2S Red 55',
    flex: 'R',
    weight: 57,
    length: 46,
    torque: 4.2,
    kickpoint: 'low',
    eiProfile: { at11: 80, at16: 85, at21: 90, at26: 95, at31: 100, at36: 105 },
    cpm: 240,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-008',
    brand: 'Mitsubishi',
    model: 'Tensei CK Pro White',
    flex: 'S',
    weight: 68,
    length: 46,
    torque: 3.2,
    kickpoint: 'high',
    eiProfile: { at11: 120, at16: 125, at21: 130, at26: 135, at31: 140, at36: 145 },
    cpm: 262,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-009',
    brand: 'Mitsubishi',
    model: 'Tensei CK Pro Orange',
    flex: 'S',
    weight: 65,
    length: 46,
    torque: 3.8,
    kickpoint: 'mid',
    eiProfile: { at11: 95, at16: 100, at21: 105, at26: 110, at31: 115, at36: 120 },
    cpm: 252,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-010',
    brand: 'Project X',
    model: 'HZRDUS Smoke Black',
    flex: '6.0',
    weight: 62,
    length: 46,
    torque: 3.5,
    kickpoint: 'mid',
    eiProfile: { at11: 105, at16: 110, at21: 115, at26: 120, at31: 125, at36: 130 },
    cpm: 258,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-011',
    brand: 'Project X',
    model: 'HZRDUS Smoke Black',
    flex: '6.5',
    weight: 64,
    length: 46,
    torque: 3.2,
    kickpoint: 'mid',
    eiProfile: { at11: 115, at16: 120, at21: 125, at26: 130, at31: 135, at36: 140 },
    cpm: 268,
    recommendedTrim: 0.5
  },
  {
    id: 'shaft-012',
    brand: 'Aldila',
    model: 'Rogue Silver 110',
    flex: 'S',
    weight: 70,
    length: 46,
    torque: 3.0,
    kickpoint: 'high',
    eiProfile: { at11: 125, at16: 130, at21: 135, at26: 140, at31: 145, at36: 150 },
    cpm: 265,
    recommendedTrim: 0.5
  },
  // Iron shafts
  {
    id: 'shaft-013',
    brand: 'True Temper',
    model: 'Dynamic Gold 105',
    flex: 'R300',
    weight: 105,
    length: 40,
    torque: 2.0,
    kickpoint: 'high',
    eiProfile: { at11: 140, at16: 145, at21: 150, at26: 155, at31: 160, at36: 165 },
    cpm: 310,
    recommendedTrim: 0
  },
  {
    id: 'shaft-014',
    brand: 'True Temper',
    model: 'Dynamic Gold 105',
    flex: 'S300',
    weight: 107,
    length: 40,
    torque: 1.8,
    kickpoint: 'high',
    eiProfile: { at11: 150, at16: 155, at21: 160, at26: 165, at31: 170, at36: 175 },
    cpm: 325,
    recommendedTrim: 0
  },
  {
    id: 'shaft-015',
    brand: 'KBS',
    model: 'Tour 90',
    flex: 'R',
    weight: 90,
    length: 40,
    torque: 2.2,
    kickpoint: 'mid',
    eiProfile: { at11: 120, at16: 125, at21: 130, at26: 135, at31: 140, at36: 145 },
    cpm: 295,
    recommendedTrim: 0
  },
  {
    id: 'shaft-016',
    brand: 'KBS',
    model: 'Tour 90',
    flex: 'S',
    weight: 92,
    length: 40,
    torque: 2.0,
    kickpoint: 'mid',
    eiProfile: { at11: 130, at16: 135, at21: 140, at26: 145, at31: 150, at36: 155 },
    cpm: 308,
    recommendedTrim: 0
  },
  {
    id: 'shaft-017',
    brand: 'Nippon',
    model: 'Modus3 Tour 105',
    flex: 'R',
    weight: 103,
    length: 40,
    torque: 1.9,
    kickpoint: 'mid',
    eiProfile: { at11: 125, at16: 130, at21: 135, at26: 140, at31: 145, at36: 150 },
    cpm: 300,
    recommendedTrim: 0
  },
  {
    id: 'shaft-018',
    brand: 'Nippon',
    model: 'Modus3 Tour 105',
    flex: 'S',
    weight: 105,
    length: 40,
    torque: 1.7,
    kickpoint: 'mid',
    eiProfile: { at11: 135, at16: 140, at21: 145, at26: 150, at31: 155, at36: 160 },
    cpm: 315,
    recommendedTrim: 0
  }
];

export const getShaftsByType = (type: 'driver' | 'fairway' | 'hybrid' | 'iron' | 'wedge'): ShaftProfile[] => {
  if (type === 'driver' || type === 'fairway' || type === 'hybrid') {
    return shaftDatabase.filter(s => s.length >= 42);
  }
  return shaftDatabase.filter(s => s.length <= 42);
};

export const getShaftById = (id: string): ShaftProfile | undefined => {
  return shaftDatabase.find(s => s.id === id);
};
