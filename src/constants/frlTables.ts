import { ConstructionType, type FRL } from '../types/ncc';

// FRL class groupings used in Specification 5 tables
export enum FRLClassGroup {
  Class234 = 'class_2_3_4',
  Class57a9 = 'class_5_7a_9',
  Class6 = 'class_6',
  Class7b8 = 'class_7b_8',
}

export interface FRLTableEntry {
  constructionType: ConstructionType;
  isLoadbearing: boolean;
  distanceMin: number;       // metres, inclusive
  distanceMax: number | null; // metres, exclusive. null = infinity
  classGroup: FRLClassGroup;
  frl: FRL;
}

// NCC Specification 5 — FRL for external walls
// Type A: Tables S5C11a (loadbearing) and S5C11b (non-loadbearing)
// Type B: Tables S5C21a/b
// Type C: Tables S5C31a/b
//
// Values marked TODO_VERIFY should be confirmed against NCC Volume One

export const FRL_EXTERNAL_WALL_TABLE: FRLTableEntry[] = [
  // ═══════════════════════════════════════════════
  // TYPE A — LOADBEARING EXTERNAL WALLS (S5C11a)
  // ═══════════════════════════════════════════════

  // Class 2/3/4
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 90, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 90, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 90, integrity: null, insulation: null } },

  // Class 5/7a/9
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 120, integrity: 120, insulation: 120 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 120, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 120, integrity: null, insulation: null } },

  // Class 6
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 90, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 90, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 90, integrity: null, insulation: null } },

  // Class 7b/8
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 120, integrity: 120, insulation: 120 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 120, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 120, integrity: null, insulation: null } },

  // ═══════════════════════════════════════════════
  // TYPE A — NON-LOADBEARING EXTERNAL WALLS (S5C11b)
  // ═══════════════════════════════════════════════

  // Class 2/3/4
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 5/7a/9
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: 120, insulation: 120 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 6
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 7b/8
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: 120, insulation: 120 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeA, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // ═══════════════════════════════════════════════
  // TYPE B — LOADBEARING EXTERNAL WALLS (S5C21a)
  // TODO_VERIFY: confirm values from NCC Volume One
  // ═══════════════════════════════════════════════

  // Class 2/3/4
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 90, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 90, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 90, integrity: null, insulation: null } },

  // Class 5/7a/9
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 90, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 90, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 90, integrity: null, insulation: null } },

  // Class 6
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 90, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 90, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 90, integrity: null, insulation: null } },

  // Class 7b/8
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 90, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 90, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 90, integrity: null, insulation: null } },

  // ═══════════════════════════════════════════════
  // TYPE B — NON-LOADBEARING EXTERNAL WALLS (S5C21b)
  // TODO_VERIFY: confirm values from NCC Volume One
  // ═══════════════════════════════════════════════

  // Class 2/3/4
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 5/7a/9
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 6
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 7b/8
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: 90, insulation: 90 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeB, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // ═══════════════════════════════════════════════
  // TYPE C — LOADBEARING EXTERNAL WALLS (S5C31a)
  // TODO_VERIFY: confirm values from NCC Volume One
  // ═══════════════════════════════════════════════

  // Class 2/3/4
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 60, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 60, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: 60, integrity: null, insulation: null } },

  // Class 5/7a/9
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 60, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 60, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: 60, integrity: null, insulation: null } },

  // Class 6
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 60, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 60, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: 60, integrity: null, insulation: null } },

  // Class 7b/8
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 60, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 60, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: true, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: 60, integrity: null, insulation: null } },

  // ═══════════════════════════════════════════════
  // TYPE C — NON-LOADBEARING EXTERNAL WALLS (S5C31b)
  // TODO_VERIFY: confirm values from NCC Volume One
  // ═══════════════════════════════════════════════

  // Class 2/3/4
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class234, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 5/7a/9
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class57a9, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 6
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class6, frl: { structuralAdequacy: null, integrity: null, insulation: null } },

  // Class 7b/8
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 0, distanceMax: 1.5, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: 60, insulation: 60 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 1.5, distanceMax: 3, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: 60, insulation: 30 } },
  { constructionType: ConstructionType.TypeC, isLoadbearing: false, distanceMin: 3, distanceMax: null, classGroup: FRLClassGroup.Class7b8, frl: { structuralAdequacy: null, integrity: null, insulation: null } },
];

export function getClassGroup(buildingClass: string): FRLClassGroup | null {
  switch (buildingClass) {
    case '2':
    case '3':
    case '4':
      return FRLClassGroup.Class234;
    case '5':
    case '7a':
    case '9a':
    case '9b':
    case '9c':
      return FRLClassGroup.Class57a9;
    case '6':
      return FRLClassGroup.Class6;
    case '7b':
    case '8':
      return FRLClassGroup.Class7b8;
    default:
      return null;
  }
}

export function getRequiredExternalWallFRL(
  constructionType: ConstructionType,
  isLoadbearing: boolean,
  distance: number,
  buildingClass: string,
): FRL {
  const classGroup = getClassGroup(buildingClass);
  if (!classGroup) {
    return { structuralAdequacy: null, integrity: null, insulation: null };
  }

  const entry = FRL_EXTERNAL_WALL_TABLE.find(
    e =>
      e.constructionType === constructionType &&
      e.isLoadbearing === isLoadbearing &&
      e.classGroup === classGroup &&
      distance >= e.distanceMin &&
      (e.distanceMax === null || distance < e.distanceMax),
  );

  return entry?.frl ?? { structuralAdequacy: null, integrity: null, insulation: null };
}
