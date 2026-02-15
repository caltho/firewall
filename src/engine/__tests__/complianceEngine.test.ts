import { describe, it, expect } from 'vitest';
import { assessWall } from '../complianceEngine';
import { BuildingClass, BoundaryType } from '../../types/ncc';
import { WallMaterial, OpeningType, GlassType, DoorType } from '../../types/project';
import type { Project, WallAssessment, Opening } from '../../types/project';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Test Project',
    address: '123 Test St',
    buildingClass: BuildingClass.Class1a,
    riseInStoreys: 1,
    hasSprinklers: false,
    notes: '',
    wallIds: ['wall-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeWall(overrides: Partial<WallAssessment> = {}): WallAssessment {
  return {
    id: 'wall-1',
    projectId: 'proj-1',
    name: 'North Wall',
    height: 3,
    width: 5,
    distanceToBoundary: 1.0,
    boundaryType: BoundaryType.SideRear,
    wallMaterial: WallMaterial.Brick,
    isLoadbearing: true,
    openingIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeWindow(overrides: Partial<Opening> = {}): Opening {
  return {
    id: 'opening-1',
    wallId: 'wall-1',
    type: OpeningType.Window,
    name: 'Kitchen Window',
    width: 1.2,
    height: 1.5,
    details: {
      type: 'window',
      glassType: GlassType.Standard,
      glassThickness: 6,
      isFireRated: false,
      isOpenable: true,
      isInHabitableRoom: true,
    },
    ...overrides,
  };
}

function makeDoor(overrides: Partial<Opening> = {}): Opening {
  return {
    id: 'opening-2',
    wallId: 'wall-1',
    type: OpeningType.Door,
    name: 'Entry Door',
    width: 0.9,
    height: 2.1,
    details: {
      type: 'door',
      doorType: DoorType.Standard,
      isFireDoor: false,
      isSelfClosing: false,
      thickness: 40,
    },
    ...overrides,
  };
}

// ════════════════════════════════════════════════
// Class 1 — Boundary distance threshold tests
// ════════════════════════════════════════════════

describe('Class 1 — Fire resistance triggers', () => {
  it('wall at 0.8m from side boundary needs fire resistance', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.8 });
    const result = assessWall(project, wall, []);
    expect(result.wallNeedsFireResistance).toBe(true);
    expect(result.requiredWallFRLString).toBe('60/60/60');
  });

  it('wall at exactly 0.9m from side boundary does NOT need fire resistance', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.9 });
    const result = assessWall(project, wall, []);
    expect(result.wallNeedsFireResistance).toBe(false);
    expect(result.requiredWallFRLString).toBe('-/-/-');
  });

  it('wall at 0.899m from side boundary needs fire resistance', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.899 });
    const result = assessWall(project, wall, []);
    expect(result.wallNeedsFireResistance).toBe(true);
  });

  it('wall at 1.5m from same allotment building needs fire resistance', () => {
    const project = makeProject();
    const wall = makeWall({
      distanceToBoundary: 1.5,
      boundaryType: BoundaryType.SameAllotment,
    });
    const result = assessWall(project, wall, []);
    expect(result.wallNeedsFireResistance).toBe(true);
  });

  it('wall at 1.8m from same allotment building does NOT need fire resistance', () => {
    const project = makeProject();
    const wall = makeWall({
      distanceToBoundary: 1.8,
      boundaryType: BoundaryType.SameAllotment,
    });
    const result = assessWall(project, wall, []);
    expect(result.wallNeedsFireResistance).toBe(false);
  });

  it('wall facing road never needs fire resistance regardless of distance', () => {
    const project = makeProject();
    const wall = makeWall({
      distanceToBoundary: 0.1,
      boundaryType: BoundaryType.Road,
    });
    const result = assessWall(project, wall, []);
    expect(result.wallNeedsFireResistance).toBe(false);
  });
});

// ════════════════════════════════════════════════
// Class 1 — Opening protection
// ════════════════════════════════════════════════

describe('Class 1 — Opening protection', () => {
  it('unprotected window in fire-resisting wall is non-compliant', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.5 });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.overallCompliant).toBe(false);
    expect(result.openingResults[0].compliant).toBe(false);
    expect(result.openingResults[0].protectionRequired).toBe(true);
  });

  it('fire-rated window in fire-resisting wall is compliant', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.5 });
    const window = makeWindow({
      details: {
        type: 'window',
        glassType: GlassType.FireRated,
        glassThickness: 6,
        isFireRated: true,
        isOpenable: false,
        isInHabitableRoom: true,
      },
    });
    const result = assessWall(project, wall, [window]);
    expect(result.overallCompliant).toBe(true);
    expect(result.openingResults[0].compliant).toBe(true);
  });

  it('window in non-fire-resisting wall is always compliant', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 1.0 });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.overallCompliant).toBe(true);
    expect(result.openingResults[0].compliant).toBe(true);
  });

  it('self-closing solid core door (35mm+) in fire-resisting wall is compliant', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.5 });
    const door = makeDoor({
      details: {
        type: 'door',
        doorType: DoorType.SolidCore,
        isFireDoor: false,
        isSelfClosing: true,
        thickness: 35,
      },
    });
    const result = assessWall(project, wall, [door]);
    expect(result.openingResults[0].compliant).toBe(true);
  });

  it('non-self-closing door in fire-resisting wall is non-compliant', () => {
    const project = makeProject();
    const wall = makeWall({ distanceToBoundary: 0.5 });
    const door = makeDoor({
      details: {
        type: 'door',
        doorType: DoorType.SolidCore,
        isFireDoor: false,
        isSelfClosing: false,
        thickness: 40,
      },
    });
    const result = assessWall(project, wall, [door]);
    expect(result.openingResults[0].compliant).toBe(false);
  });

  it('small wired glass window in non-habitable room qualifies for concession', () => {
    const project = makeProject();
    // Wall at 0.7m — needs fire resistance, but >= 600mm so concession distance is met
    const wall = makeWall({ distanceToBoundary: 0.7 });
    const window: Opening = {
      id: 'opening-conc',
      wallId: 'wall-1',
      type: OpeningType.Window,
      name: 'Bathroom Window',
      width: 0.6,
      height: 0.8, // 0.48m2 < 1.2m2 bathroom limit
      details: {
        type: 'window',
        glassType: GlassType.WiredGlass,
        glassThickness: 6,
        isFireRated: false,
        isOpenable: false,
        isInHabitableRoom: false,
        roomType: 'bathroom',
      },
    };
    const result = assessWall(project, wall, [window]);
    expect(result.openingResults[0].compliant).toBe(true);
  });
});

// ════════════════════════════════════════════════
// Class 1 — Area calculations
// ════════════════════════════════════════════════

describe('Class 1 — Area calculations', () => {
  it('calculates wall and opening areas correctly', () => {
    const project = makeProject();
    const wall = makeWall({ height: 3, width: 5 });
    const window = makeWindow({ width: 1.2, height: 1.5 });
    const result = assessWall(project, wall, [window]);
    expect(result.totalWallArea).toBe(15);
    expect(result.totalOpeningArea).toBeCloseTo(1.8);
  });
});

// ════════════════════════════════════════════════
// Class 2-9 — Construction type and FRL
// ════════════════════════════════════════════════

describe('Class 2-9 — Construction type determination', () => {
  it('Class 5 office, 1 storey -> Type C', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 1 });
    const wall = makeWall({ distanceToBoundary: 2 });
    const result = assessWall(project, wall, []);
    expect(result.constructionType).toBe('C');
  });

  it('Class 2 apartment, 3 storeys -> Type A', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class2, riseInStoreys: 3 });
    const wall = makeWall({ distanceToBoundary: 2 });
    const result = assessWall(project, wall, []);
    expect(result.constructionType).toBe('A');
  });

  it('Class 5 office, 3 storeys -> Type B', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 3 });
    const wall = makeWall({ distanceToBoundary: 2 });
    const result = assessWall(project, wall, []);
    expect(result.constructionType).toBe('B');
  });
});

describe('Class 2-9 — FRL requirements', () => {
  it('Type A loadbearing wall at 1m for Class 2 requires 90/90/90', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class2, riseInStoreys: 4 });
    const wall = makeWall({ distanceToBoundary: 1.0, isLoadbearing: true });
    const result = assessWall(project, wall, []);
    expect(result.requiredWallFRLString).toBe('90/90/90');
  });

  it('Type A non-loadbearing wall at 4m for Class 2 requires no FRL', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class2, riseInStoreys: 4 });
    const wall = makeWall({ distanceToBoundary: 4.0, isLoadbearing: false });
    const result = assessWall(project, wall, []);
    expect(result.requiredWallFRLString).toBe('-/-/-');
  });
});

// ════════════════════════════════════════════════
// Class 2-9 — Opening protection thresholds
// ════════════════════════════════════════════════

describe('Class 2-9 — Opening protection', () => {
  it('openings need protection when < 3m from side/rear boundary', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 1 });
    const wall = makeWall({ distanceToBoundary: 2.5 });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.openingProtectionRequired).toBe(true);
    expect(result.openingResults[0].compliant).toBe(false);
  });

  it('openings do NOT need protection when >= 3m from side/rear boundary', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 1 });
    const wall = makeWall({ distanceToBoundary: 3.0 });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.openingProtectionRequired).toBe(false);
    expect(result.openingResults[0].compliant).toBe(true);
  });

  it('openings need protection when < 6m from road boundary', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 1 });
    const wall = makeWall({ distanceToBoundary: 5.0, boundaryType: BoundaryType.Road });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.openingProtectionRequired).toBe(true);
  });

  it('openings do NOT need protection when >= 6m from road boundary', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 1 });
    const wall = makeWall({ distanceToBoundary: 6.0, boundaryType: BoundaryType.Road });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.openingProtectionRequired).toBe(false);
  });
});

// ════════════════════════════════════════════════
// Sprinkler concession
// ════════════════════════════════════════════════

describe('Sprinkler concession', () => {
  it('sprinklers double the effective distance for Class 2-9', () => {
    const project = makeProject({
      buildingClass: BuildingClass.Class5,
      riseInStoreys: 1,
      hasSprinklers: true,
    });
    // Actual distance is 2m, but with sprinklers effective is 4m -> no protection needed
    const wall = makeWall({ distanceToBoundary: 2.0 });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.openingProtectionRequired).toBe(false);
  });

  it('without sprinklers, 2m distance requires protection', () => {
    const project = makeProject({
      buildingClass: BuildingClass.Class5,
      riseInStoreys: 1,
      hasSprinklers: false,
    });
    const wall = makeWall({ distanceToBoundary: 2.0 });
    const window = makeWindow();
    const result = assessWall(project, wall, [window]);
    expect(result.openingProtectionRequired).toBe(true);
  });
});

// ════════════════════════════════════════════════
// Class 2-9 — 1/3 area rule
// ════════════════════════════════════════════════

describe('Class 2-9 — 1/3 area rule', () => {
  it('openings exceeding 1/3 of wall area are non-compliant', () => {
    const project = makeProject({ buildingClass: BuildingClass.Class5, riseInStoreys: 1 });
    // Wall: 3m x 5m = 15m2. 1/3 = 5m2.
    const wall = makeWall({ distanceToBoundary: 2.0, height: 3, width: 5 });
    // Window: 3m x 2m = 6m2 > 5m2
    const window = makeWindow({
      width: 3,
      height: 2,
      details: {
        type: 'window',
        glassType: GlassType.FireRated,
        glassThickness: 6,
        isFireRated: true,
        isOpenable: false,
        isInHabitableRoom: true,
      },
    });
    const result = assessWall(project, wall, [window]);
    expect(result.overallCompliant).toBe(false);
  });
});
