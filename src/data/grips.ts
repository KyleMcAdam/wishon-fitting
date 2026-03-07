import type { Grip } from '@/types';

export const gripDatabase: Grip[] = [
  {
    id: 'grip-001',
    brand: 'Golf Pride',
    model: 'Tour Velvet',
    size: 'standard',
    weight: 50,
    core: 0.600
  },
  {
    id: 'grip-002',
    brand: 'Golf Pride',
    model: 'Tour Velvet',
    size: 'midsize',
    weight: 66,
    core: 0.600
  },
  {
    id: 'grip-003',
    brand: 'Golf Pride',
    model: 'Tour Velvet Cord',
    size: 'standard',
    weight: 52,
    core: 0.600
  },
  {
    id: 'grip-004',
    brand: 'Golf Pride',
    model: 'MCC Plus4',
    size: 'standard',
    weight: 54,
    core: 0.600
  },
  {
    id: 'grip-005',
    brand: 'Golf Pride',
    model: 'MCC Plus4',
    size: 'midsize',
    weight: 70,
    core: 0.600
  },
  {
    id: 'grip-006',
    brand: 'Lamkin',
    model: 'Crossline',
    size: 'standard',
    weight: 48,
    core: 0.600
  },
  {
    id: 'grip-007',
    brand: 'Lamkin',
    model: 'Crossline',
    size: 'midsize',
    weight: 64,
    core: 0.600
  },
  {
    id: 'grip-008',
    brand: 'Lamkin',
    model: 'UTx',
    size: 'standard',
    weight: 50,
    core: 0.600
  },
  {
    id: 'grip-009',
    brand: 'Winn',
    model: 'Dri-Tac',
    size: 'standard',
    weight: 44,
    core: 0.600
  },
  {
    id: 'grip-010',
    brand: 'Winn',
    model: 'Dri-Tac',
    size: 'midsize',
    weight: 58,
    core: 0.600
  },
  {
    id: 'grip-011',
    brand: 'Winn',
    model: 'Dri-Tac',
    size: 'jumbo',
    weight: 72,
    core: 0.600
  },
  {
    id: 'grip-012',
    brand: 'SuperStroke',
    model: 'S-Tech',
    size: 'standard',
    weight: 52,
    core: 0.600
  },
  {
    id: 'grip-013',
    brand: 'SuperStroke',
    model: 'S-Tech',
    size: 'midsize',
    weight: 68,
    core: 0.600
  }
];

export const getGripById = (id: string): Grip | undefined => {
  return gripDatabase.find(g => g.id === id);
};

export const getGripsBySize = (size: 'standard' | 'midsize' | 'jumbo'): Grip[] => {
  return gripDatabase.filter(g => g.size === size);
};
