import { BuildingClass } from '../types/ncc';

export interface BuildingClassInfo {
  value: BuildingClass;
  label: string;
  description: string;
  group: 'residential' | 'commercial' | 'industrial' | 'special' | 'non-habitable';
}

export const BUILDING_CLASS_INFO: BuildingClassInfo[] = [
  { value: BuildingClass.Class1a, label: 'Class 1a', description: 'Single dwelling (detached house, terrace, townhouse, villa)', group: 'residential' },
  { value: BuildingClass.Class1b, label: 'Class 1b', description: 'Boarding house, guest house, hostel (max 12 residents, max 300m\u00B2)', group: 'residential' },
  { value: BuildingClass.Class2, label: 'Class 2', description: 'Apartment building (building with 2+ sole-occupancy units)', group: 'residential' },
  { value: BuildingClass.Class3, label: 'Class 3', description: 'Residential building (hotel, motel, hostel, backpackers)', group: 'residential' },
  { value: BuildingClass.Class4, label: 'Class 4', description: 'Dwelling in a Class 5, 6, 7, 8 or 9 building (e.g. caretaker flat)', group: 'residential' },
  { value: BuildingClass.Class5, label: 'Class 5', description: 'Office building', group: 'commercial' },
  { value: BuildingClass.Class6, label: 'Class 6', description: 'Shop, restaurant, cafe, retail', group: 'commercial' },
  { value: BuildingClass.Class7a, label: 'Class 7a', description: 'Carpark', group: 'commercial' },
  { value: BuildingClass.Class7b, label: 'Class 7b', description: 'Warehouse, storage, wholesale', group: 'industrial' },
  { value: BuildingClass.Class8, label: 'Class 8', description: 'Factory, laboratory, production facility', group: 'industrial' },
  { value: BuildingClass.Class9a, label: 'Class 9a', description: 'Healthcare building (hospital, clinic)', group: 'special' },
  { value: BuildingClass.Class9b, label: 'Class 9b', description: 'Assembly building (school, university, theatre, church)', group: 'special' },
  { value: BuildingClass.Class9c, label: 'Class 9c', description: 'Aged care building (nursing home, residential care)', group: 'special' },
  { value: BuildingClass.Class10a, label: 'Class 10a', description: 'Non-habitable building (garage, shed, carport)', group: 'non-habitable' },
  { value: BuildingClass.Class10b, label: 'Class 10b', description: 'Structure (fence, mast, antenna, retaining wall)', group: 'non-habitable' },
  { value: BuildingClass.Class10c, label: 'Class 10c', description: 'Private bushfire shelter', group: 'non-habitable' },
];

export function getBuildingClassInfo(bc: BuildingClass): BuildingClassInfo | undefined {
  return BUILDING_CLASS_INFO.find(info => info.value === bc);
}
