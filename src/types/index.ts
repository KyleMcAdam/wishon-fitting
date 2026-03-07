// Wishon-Logic Fitting Engine - Type Definitions

// Player Bio-Mechanical Profile
export interface PlayerProfile {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  
  // Physical Measurements
  physicals: {
    height: number; // inches
    wristToFloor: number; // inches
    handSize: number; // inches (wrist crease to middle finger tip)
    fingerLength: number; // inches
    dominantHand: 'left' | 'right';
  };
  
  // Swing DNA
  swingDNA: {
    swingSpeed: number; // mph (driver)
    transitionForce: 'smooth' | 'moderate' | 'aggressive';
    releasePoint: 'early' | 'mid' | 'late';
    tempo: number; // ratio (backswing:downswing)
    attackAngle: number; // degrees
    path: number; // degrees (in-to-out positive)
  };
  
  // Fitting History
  sessions: FittingSession[];
}

export interface FittingSession {
  id: string;
  date: Date;
  fitter: string;
  phase: FittingPhase;
  shots: ShotData[];
  recommendations: ClubRecommendation[];
  blueprint?: BagBlueprint;
}

export type FittingPhase = 
  | 'onboarding' 
  | 'diagnostics' 
  | 'matching' 
  | 'blueprint' 
  | 'workshop';

export interface SwingDNA {
  swingSpeed: number; // mph (driver)
  transitionForce: 'smooth' | 'moderate' | 'aggressive';
  releasePoint: 'early' | 'mid' | 'late';
  tempo: number; // ratio (backswing:downswing)
  attackAngle: number; // degrees
  path: number; // degrees (in-to-out positive)
}

// Launch Monitor Shot Data
export interface ShotData {
  id: string;
  timestamp: Date;
  club: string;
  
  // Ball Data
  ballSpeed: number; // mph
  launchAngle: number; // degrees
  spinRate: number; // rpm
  spinAxis: number; // degrees
  carryDistance: number; // yards
  totalDistance: number; // yards
  offline: number; // yards (positive right)
  peakHeight: number; // feet
  landingAngle: number; // degrees
  
  // Club Data
  clubSpeed: number; // mph
  attackAngle: number; // degrees
  dynamicLoft: number; // degrees
  faceAngle: number; // degrees
  clubPath: number; // degrees
  faceToPath: number; // degrees
  smashFactor: number;
  
  // Quality Metrics
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  consistency: number; // 0-100
}

// Shaft EI Profile
export interface ShaftProfile {
  id: string;
  brand: string;
  model: string;
  flex: string;
  weight: number; // grams
  length: number; // inches (raw)
  torque: number; // degrees
  kickpoint: 'low' | 'mid' | 'high';
  
  // EI Measurements (stiffness at each point, higher = stiffer)
  eiProfile: {
    at11: number; // tip
    at16: number;
    at21: number;
    at26: number;
    at31: number;
    at36: number; // butt
  };
  
  // Calculated Properties
  cpm: number; // cycles per minute (frequency)
  recommendedTrim: number; // inches from tip
}

// Club Head 3D CG Data
export interface ClubHead {
  id: string;
  brand: string;
  model: string;
  type: 'driver' | 'fairway' | 'hybrid' | 'iron' | 'wedge';
  loft: number; // degrees
  
  // Mass Properties
  headWeight: number; // grams
  
  // CG Coordinates (mm from geometric center)
  cg: {
    horizontal: number; // + toward toe, - toward heel
    vertical: number; // + up from sole
    depth: number; // + back from face
  };
  
  // MOI Properties
  moi: {
    vertical: number; // kg·cm² (resistance to twisting on high/low hits)
    horizontal: number; // kg·cm² (resistance to twisting on heel/toe hits)
  };
  
  // Face Properties
  face: {
    angle: number; // degrees (open/closed)
    bulge: number; // inches radius
    roll: number; // inches radius
  };
  
  // Loft/Lie
  lie: number; // degrees
  lengthStd: number; // standard playing length
}

// Club Assembly
export interface ClubAssembly {
  id: string;
  type: string; // e.g., "Driver", "7-Iron"
  
  // Components
  head: ClubHead;
  shaft: ShaftProfile;
  grip: Grip;
  
  // Build Specs
  specs: {
    length: number; // inches (playing length)
    lie: number; // degrees
    loft: number; // degrees
    swingweight: string; // e.g., "D2"
    moi: number; // kg·cm²
    totalWeight: number; // grams
    frequency: number; // CPM
  };
  
  // Build Instructions
  instructions: {
    tipTrim: number; // inches
    buttTrim: number; // inches
    spineAlign: boolean;
    floAlign: boolean;
  };
}

export interface Grip {
  id: string;
  brand: string;
  model: string;
  size: 'standard' | 'midsize' | 'jumbo';
  weight: number; // grams
  core: number; // inches
}

// MOI Matching
export interface MOIMatch {
  targetMOI: number; // kg·cm² (e.g., 2750)
  tolerance: number; // ± kg·cm²
  
  // Calculated for each club
  clubs: {
    club: ClubAssembly;
    actualMOI: number;
    deviation: number;
    status: 'optimal' | 'acceptable' | 'adjust';
  }[];
}

// Gap Analysis
export interface GapAnalysis {
  clubs: {
    club: ClubAssembly;
    carryDistance: number;
    totalDistance: number;
    gapToNext: number; // yards
  }[];
  
  issues: {
    type: 'overlap' | 'deadzone' | 'optimal';
    clubs: string[];
    distance: number;
    recommendation: string;
  }[];
}

// Full Bag Blueprint
export interface BagBlueprint {
  id: string;
  name: string;
  createdAt: Date;
  
  // 13 clubs (standard set)
  clubs: ClubAssembly[];
  
  // MOI Matching
  moiTarget: number;
  moiMatched: boolean;
  
  // Gap Analysis
  gapAnalysis: GapAnalysis;
  
  // Build Summary
  buildSheet: {
    club: string;
    head: string;
    shaft: string;
    length: number;
    lie: number;
    swingweight: string;
    moi: number;
    frequency: number;
  }[];
}

// Club Recommendation
export interface ClubRecommendation {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  current?: ClubAssembly;
  recommended: ClubAssembly;
  reasoning: string;
  expectedImprovement: {
    distance: number; // yards
    dispersion: number; // percentage improvement
    consistency: number; // percentage improvement
  };
}

// Workshop Hardware Data
export interface HardwareReading {
  timestamp: Date;
  device: 'moi_scale' | 'frequency_analyzer' | 'loft_lie_gauge' | 'swingweight_scale';
  clubId: string;
  measurements: {
    [key: string]: number;
  };
  status: 'pass' | 'fail' | 'pending';
  tolerance: number;
}

// What-If Scenario
export interface WhatIfScenario {
  id: string;
  name: string;
  baseClub: ClubAssembly;
  modifications: {
    length?: number;
    headWeight?: number;
    shaftWeight?: number;
    gripWeight?: number;
  };
  predicted: {
    swingweight: string;
    moi: number;
    frequency: number;
    carryDistance: number;
  };
}

// Release Point Classification
export interface ReleasePointAnalysis {
  shots: ShotData[];
  classification: 'early' | 'mid' | 'late';
  confidence: number; // 0-100
  characteristics: {
    dynamicLoftTrend: number;
    faceAngleStability: number;
    spinConsistency: number;
  };
  recommendations: {
    tipStiffness: 'softer' | 'standard' | 'stiffer';
    headLoft: 'stronger' | 'standard' | 'weaker';
    reasoning: string;
  };
}
