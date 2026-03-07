// Wishon-Logic Physics Calculation Engine
// Based on Tom Wishon's "Common Sense" clubfitting principles

import type { ClubAssembly, MOIMatch, GapAnalysis, WhatIfScenario, ShotData } from '@/types';

// Constants
const PIVOT_POINT = 4; // inches from butt end (MOI pivot point)

/**
 * Calculate MOI (Moment of Inertia) around a 4-inch pivot point
 * I = Σ(m × r²) where r is distance from pivot
 * Result in kg·cm²
 */
export function calculateMOI(club: ClubAssembly): number {
  const headMass = club.head.headWeight / 1000; // convert to kg
  const shaftMass = club.shaft.weight / 1000;
  const gripMass = club.grip.weight / 1000;
  
  // Convert lengths to cm
  const playingLengthCm = club.specs.length * 2.54;
  const pivotCm = PIVOT_POINT * 2.54;
  
  // Head distance from pivot (cm)
  const headDistance = playingLengthCm - pivotCm;
  
  // Shaft CG is approximately at 45% from butt
  const shaftCG = playingLengthCm * 0.45;
  const shaftDistance = shaftCG - pivotCm;
  
  // Grip CG is approximately at 40% from butt
  const gripCG = (PIVOT_POINT + 4) * 2.54; // approximate grip center
  const gripDistance = Math.abs(gripCG - pivotCm);
  
  // Calculate MOI components
  const headMOI = headMass * Math.pow(headDistance / 100, 2); // convert to meters for kg·cm²
  const shaftMOI = shaftMass * Math.pow(shaftDistance / 100, 2) * 0.33; // 0.33 for distributed mass
  const gripMOI = gripMass * Math.pow(gripDistance / 100, 2);
  
  // Convert to kg·cm²
  const totalMOI = (headMOI + shaftMOI + gripMOI) * 10000;
  
  return Math.round(totalMOI);
}

/**
 * Calculate Swingweight (traditional D0-D9 scale)
 * Based on 14-inch fulcrum point
 */
export function calculateSwingweight(club: ClubAssembly): string {
  const headWeight = club.head.headWeight;
  const shaftWeight = club.shaft.weight;
  const gripWeight = club.grip.weight;
  const length = club.specs.length;
  
  // Simplified swingweight calculation
  // SW = (headWeight × (length - 14)) + (shaftWeight × 0.5) - (gripWeight × 0.3)
  const swPoints = (headWeight * (length - 14) / 10) + (shaftWeight * 0.5) - (gripWeight * 0.3);
  
  // Convert to D-scale (D0 = 200 points approximately)
  const dScale = Math.floor((swPoints - 180) / 2);
  const letter = dScale < 0 ? 'C' : 'D';
  const number = Math.abs(dScale) % 10;
  
  return `${letter}${number}`;
}

/**
 * Calculate shaft frequency (CPM - Cycles Per Minute)
 * Based on clamped length and stiffness
 */
export function calculateFrequency(club: ClubAssembly): number {
  const eiAverage = Object.values(club.shaft.eiProfile).reduce((a, b) => a + b, 0) / 6;
  const playingLength = club.specs.length;
  const headWeight = club.head.headWeight;
  
  // Simplified frequency formula
  // f ∝ √(EI/m) / L²
  const stiffnessFactor = Math.sqrt(eiAverage / (headWeight + club.shaft.weight));
  const lengthFactor = Math.pow(playingLength / 40, -2);
  
  const baseFrequency = 200; // baseline for 40" shaft
  const frequency = baseFrequency * stiffnessFactor * lengthFactor;
  
  return Math.round(frequency);
}

/**
 * Calculate total club weight
 */
export function calculateTotalWeight(club: ClubAssembly): number {
  const headWeight = club.head.headWeight;
  const shaftWeight = club.shaft.weight * (club.specs.length / club.shaft.length);
  const gripWeight = club.grip.weight;
  const epoxyAndTape = 3; // grams
  
  return Math.round(headWeight + shaftWeight + gripWeight + epoxyAndTape);
}

/**
 * Calculate recommended length based on wrist-to-floor measurement
 */
export function recommendLength(wristToFloor: number, clubType: string): number {
  const baseLengths: Record<string, number> = {
    driver: 44.5,
    '3wood': 43,
    '5wood': 42.5,
    hybrid: 40.5,
    '5iron': 38,
    '6iron': 37.5,
    '7iron': 37,
    '8iron': 36.5,
    '9iron': 36,
    pw: 35.5,
    gw: 35.5,
    sw: 35.25,
    lw: 35.25
  };
  
  const base = baseLengths[clubType.toLowerCase()] || 37;
  
  // Adjustment based on wrist-to-floor
  // Standard is ~35", adjust 0.5" per 2" deviation
  const deviation = (wristToFloor - 35) / 2;
  const adjustment = deviation * 0.5;
  
  return Math.round((base + adjustment) * 2) / 2;
}

/**
 * Calculate recommended lie angle based on height and wrist-to-floor
 */
export function recommendLie(height: number, wristToFloor: number, baseLie: number): number {
  // Standard proportions
  const standardHeight = 69; // 5'9"
  const standardWrist = 35;
  
  const heightDeviation = height - standardHeight;
  const wristDeviation = wristToFloor - standardWrist;
  
  // Lie adjustment: 1° per 1" height deviation, 0.5° per 1" wrist deviation
  const adjustment = (heightDeviation * 1) + (wristDeviation * 0.5);
  
  return Math.round((baseLie + adjustment) * 2) / 2;
}

/**
 * Recommend shaft flex based on swing speed
 */
export function recommendFlex(swingSpeed: number): string {
  if (swingSpeed < 75) return 'A (Senior)';
  if (swingSpeed < 85) return 'R (Regular)';
  if (swingSpeed < 95) return 'S (Stiff)';
  if (swingSpeed < 105) return 'X (Extra Stiff)';
  return 'XX (Tour Extra Stiff)';
}

/**
 * Analyze release point from shot data
 */
export function analyzeReleasePoint(shots: ShotData[]): {
  classification: 'early' | 'mid' | 'late';
  confidence: number;
} {
  if (shots.length === 0) {
    return { classification: 'mid', confidence: 0 };
  }
  
  // Calculate average dynamic loft vs static loft
  const avgDynamicLoft = shots.reduce((sum, s) => sum + s.dynamicLoft, 0) / shots.length;
  const avgSpin = shots.reduce((sum, s) => sum + s.spinRate, 0) / shots.length;
  
  // Early release: higher dynamic loft, higher spin
  // Late release: lower dynamic loft, lower spin
  
  let earlyScore = 0;
  let lateScore = 0;
  
  if (avgDynamicLoft > 14) earlyScore += 2;
  if (avgDynamicLoft < 10) lateScore += 2;
  if (avgSpin > 3200) earlyScore += 1;
  if (avgSpin < 2400) lateScore += 1;
  
  const classification = earlyScore > lateScore ? 'early' : lateScore > earlyScore ? 'late' : 'mid';
  const confidence = Math.min(100, (Math.abs(earlyScore - lateScore) / 3) * 100);
  
  return { classification, confidence };
}

/**
 * Recommend tip stiffness based on release point
 */
export function recommendTipStiffness(releasePoint: 'early' | 'mid' | 'late'): string {
  switch (releasePoint) {
    case 'early':
      return 'Softer tip - helps increase launch and reduce spin';
    case 'late':
      return 'Stiffer tip - helps lower launch and control spin';
    case 'mid':
      return 'Standard tip stiffness - balanced performance';
  }
}

/**
 * Calculate MOI matching for a set of clubs
 */
export function calculateMOIMatching(clubs: ClubAssembly[], targetMOI?: number): MOIMatch {
  const calculatedMOIs: { club: ClubAssembly; actualMOI: number; deviation: number; status: 'optimal' | 'acceptable' | 'adjust' }[] = clubs.map(club => ({
    club,
    actualMOI: calculateMOI(club),
    deviation: 0,
    status: 'optimal'
  }));
  
  // If no target specified, use average of long clubs (driver, woods)
  const target = targetMOI || Math.round(
    calculatedMOIs.slice(0, 3).reduce((sum, c) => sum + c.actualMOI, 0) / 3
  );
  
  const tolerance = 25; // ±25 kg·cm²
  
  calculatedMOIs.forEach(item => {
    item.deviation = item.actualMOI - target;
    if (Math.abs(item.deviation) <= tolerance) {
      item.status = 'optimal';
    } else if (Math.abs(item.deviation) <= tolerance * 2) {
      item.status = 'acceptable';
    } else {
      item.status = 'adjust';
    }
  });
  
  return {
    targetMOI: target,
    tolerance,
    clubs: calculatedMOIs
  };
}

/**
 * Analyze distance gaps between clubs
 */
export function analyzeGaps(clubs: ClubAssembly[], shotData: Map<string, ShotData[]>): GapAnalysis {
  const clubGaps = clubs.map(club => {
    const shots = shotData.get(club.id) || [];
    const avgCarry = shots.length > 0
      ? shots.reduce((sum, s) => sum + s.carryDistance, 0) / shots.length
      : estimateDistance(club);
    const avgTotal = shots.length > 0
      ? shots.reduce((sum, s) => sum + s.totalDistance, 0) / shots.length
      : avgCarry * 1.08;
    
    return {
      club,
      carryDistance: Math.round(avgCarry),
      totalDistance: Math.round(avgTotal),
      gapToNext: 0
    };
  });
  
  // Sort by distance (descending)
  clubGaps.sort((a, b) => b.carryDistance - a.carryDistance);
  
  // Calculate gaps
  for (let i = 0; i < clubGaps.length - 1; i++) {
    clubGaps[i].gapToNext = clubGaps[i].carryDistance - clubGaps[i + 1].carryDistance;
  }
  
  // Identify issues
  const issues: GapAnalysis['issues'] = [];
  
  for (let i = 0; i < clubGaps.length - 1; i++) {
    const gap = clubGaps[i].gapToNext;
    
    if (gap < 8) {
      issues.push({
        type: 'overlap',
        clubs: [clubGaps[i].club.type, clubGaps[i + 1].club.type],
        distance: gap,
        recommendation: `Consider removing ${clubGaps[i + 1].club.type} or adjusting loft`
      });
    } else if (gap > 18) {
      issues.push({
        type: 'deadzone',
        clubs: [clubGaps[i].club.type, clubGaps[i + 1].club.type],
        distance: gap,
        recommendation: `Add a club between ${clubGaps[i].club.type} and ${clubGaps[i + 1].club.type}`
      });
    }
  }
  
  return {
    clubs: clubGaps,
    issues
  };
}

/**
 * Estimate carry distance for a club based on specs
 */
function estimateDistance(club: ClubAssembly): number {
  const loft = club.head.loft;
  
  // Base distance calculation
  // Driver: ~220-280 yards
  // Each degree of loft reduces distance by ~2-3 yards
  // Each 0.5" of length adds ~5 yards
  
  if (club.head.type === 'driver') {
    return 250 - (loft - 9.5) * 5;
  }
  
  if (club.head.type === 'fairway') {
    return 220 - (loft - 15) * 4;
  }
  
  if (club.head.type === 'hybrid') {
    return 185 - (loft - 19) * 3;
  }
  
  // Irons
  const baseIron = 170; // 5-iron baseline
  const ironNumber = parseInt(club.type) || 7;
  return baseIron - (ironNumber - 5) * 12;
}

/**
 * Simulate what-if scenario
 */
export function simulateWhatIf(scenario: WhatIfScenario): WhatIfScenario['predicted'] {
  const base = scenario.baseClub;
  const mod = scenario.modifications;
  
  // Calculate new swingweight
  let swChange = 0;
  if (mod.length) {
    swChange += (mod.length - base.specs.length) * 6;
  }
  if (mod.headWeight) {
    swChange += (mod.headWeight - base.head.headWeight) * 0.2;
  }
  if (mod.gripWeight) {
    swChange -= (mod.gripWeight - base.grip.weight) * 0.2;
  }
  
  // Calculate new MOI
  let moiChange = 0;
  if (mod.length) {
    moiChange += (mod.length - base.specs.length) * 50;
  }
  if (mod.headWeight) {
    moiChange += (mod.headWeight - base.head.headWeight) * 2;
  }
  
  // Calculate new frequency
  let freqChange = 0;
  if (mod.length) {
    freqChange -= (mod.length - base.specs.length) * 8;
  }
  if (mod.shaftWeight) {
    freqChange += (mod.shaftWeight - base.shaft.weight) * 0.5;
  }
  
  // Calculate distance impact
  let distChange = 0;
  if (mod.length) {
    distChange += (mod.length - base.specs.length) * 5;
  }
  if (mod.headWeight) {
    distChange += (mod.headWeight - base.head.headWeight) * 0.3;
  }
  
  return {
    swingweight: base.specs.swingweight,
    moi: Math.round(base.specs.moi + moiChange),
    frequency: Math.round(base.specs.frequency + freqChange),
    carryDistance: Math.round(estimateDistance(base) + distChange)
  };
}

/**
 * Calculate tip trim amount based on desired frequency
 */
export function calculateTipTrim(
  targetCPM: number,
  shaftCPM: number,
  headWeight: number
): number {
  // Each 0.5" tip trim increases frequency by ~8-12 CPM
  // Heavier heads require more tip trim for same frequency
  const cpmDiff = targetCPM - shaftCPM;
  const headFactor = headWeight / 200;
  const trimAmount = (cpmDiff / 10) * 0.5 * headFactor;
  
  return Math.max(0, Math.round(trimAmount * 10) / 10);
}
