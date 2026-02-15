export enum BuildingClass {
  Class1a = '1a',
  Class1b = '1b',
  Class2 = '2',
  Class3 = '3',
  Class4 = '4',
  Class5 = '5',
  Class6 = '6',
  Class7a = '7a',
  Class7b = '7b',
  Class8 = '8',
  Class9a = '9a',
  Class9b = '9b',
  Class9c = '9c',
  Class10a = '10a',
  Class10b = '10b',
  Class10c = '10c',
}

export enum BoundaryType {
  SideRear = 'side_rear',
  Road = 'road',
  SameAllotment = 'same_allotment',
}

export enum ConstructionType {
  TypeA = 'A',
  TypeB = 'B',
  TypeC = 'C',
}

export interface FRL {
  structuralAdequacy: number | null;
  integrity: number | null;
  insulation: number | null;
}

export function isClass1(bc: BuildingClass): boolean {
  return bc === BuildingClass.Class1a || bc === BuildingClass.Class1b;
}

export function isClass10(bc: BuildingClass): boolean {
  return (
    bc === BuildingClass.Class10a ||
    bc === BuildingClass.Class10b ||
    bc === BuildingClass.Class10c
  );
}
