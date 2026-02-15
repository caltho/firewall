import { BuildingClass, ConstructionType, isClass1, isClass10 } from '../types/ncc';

// NCC Table C2D2: Type of construction required
// Based on building class and rise in storeys

interface ConstructionTypeRule {
  classes: BuildingClass[];
  minRise: number;
  maxRise: number | null; // null = no upper limit
  type: ConstructionType;
}

const CONSTRUCTION_TYPE_RULES: ConstructionTypeRule[] = [
  // Class 2, 3, 9a, 9b, 9c — higher occupant risk
  {
    classes: [BuildingClass.Class2, BuildingClass.Class3, BuildingClass.Class9a, BuildingClass.Class9b, BuildingClass.Class9c],
    minRise: 4, maxRise: null,
    type: ConstructionType.TypeA,
  },
  {
    classes: [BuildingClass.Class2, BuildingClass.Class3, BuildingClass.Class9a, BuildingClass.Class9b, BuildingClass.Class9c],
    minRise: 3, maxRise: 3,
    type: ConstructionType.TypeA,
  },
  {
    classes: [BuildingClass.Class2, BuildingClass.Class3, BuildingClass.Class9a, BuildingClass.Class9b, BuildingClass.Class9c],
    minRise: 2, maxRise: 2,
    type: ConstructionType.TypeB,
  },
  {
    classes: [BuildingClass.Class2, BuildingClass.Class3, BuildingClass.Class9a, BuildingClass.Class9b, BuildingClass.Class9c],
    minRise: 1, maxRise: 1,
    type: ConstructionType.TypeC,
  },

  // Class 5, 6, 7a, 7b, 8 — commercial/industrial
  {
    classes: [BuildingClass.Class5, BuildingClass.Class6, BuildingClass.Class7a, BuildingClass.Class7b, BuildingClass.Class8],
    minRise: 4, maxRise: null,
    type: ConstructionType.TypeA,
  },
  {
    classes: [BuildingClass.Class5, BuildingClass.Class6, BuildingClass.Class7a, BuildingClass.Class7b, BuildingClass.Class8],
    minRise: 3, maxRise: 3,
    type: ConstructionType.TypeB,
  },
  {
    classes: [BuildingClass.Class5, BuildingClass.Class6, BuildingClass.Class7a, BuildingClass.Class7b, BuildingClass.Class8],
    minRise: 2, maxRise: 2,
    type: ConstructionType.TypeC,
  },
  {
    classes: [BuildingClass.Class5, BuildingClass.Class6, BuildingClass.Class7a, BuildingClass.Class7b, BuildingClass.Class8],
    minRise: 1, maxRise: 1,
    type: ConstructionType.TypeC,
  },

  // Class 4 treated as Class 2/3 for construction type
  {
    classes: [BuildingClass.Class4],
    minRise: 4, maxRise: null,
    type: ConstructionType.TypeA,
  },
  {
    classes: [BuildingClass.Class4],
    minRise: 3, maxRise: 3,
    type: ConstructionType.TypeA,
  },
  {
    classes: [BuildingClass.Class4],
    minRise: 2, maxRise: 2,
    type: ConstructionType.TypeB,
  },
  {
    classes: [BuildingClass.Class4],
    minRise: 1, maxRise: 1,
    type: ConstructionType.TypeC,
  },
];

export function getConstructionType(
  buildingClass: BuildingClass,
  riseInStoreys: number,
): ConstructionType | null {
  if (isClass1(buildingClass) || isClass10(buildingClass)) {
    return null;
  }

  const rule = CONSTRUCTION_TYPE_RULES.find(
    r =>
      r.classes.includes(buildingClass) &&
      riseInStoreys >= r.minRise &&
      (r.maxRise === null || riseInStoreys <= r.maxRise),
  );

  return rule?.type ?? null;
}
