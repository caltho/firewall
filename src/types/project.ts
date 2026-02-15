import type { BuildingClass, BoundaryType, FRL } from './ncc';

export interface Project {
  id: string;
  name: string;
  address: string;
  buildingClass: BuildingClass;
  riseInStoreys: number;
  hasSprinklers: boolean;
  notes: string;
  wallIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WallAssessment {
  id: string;
  projectId: string;
  name: string;
  height: number;
  width: number;
  distanceToBoundary: number;
  boundaryType: BoundaryType;
  wallMaterial: WallMaterial;
  isLoadbearing: boolean;
  openingIds: string[];
  createdAt: string;
  updatedAt: string;
}

export enum WallMaterial {
  Brick = 'brick',
  ConcreteBlock = 'concrete_block',
  Timber = 'timber',
  SteelFrame = 'steel_frame',
  MetalCladding = 'metal_cladding',
  Composite = 'composite',
  Other = 'other',
}

export interface Opening {
  id: string;
  wallId: string;
  type: OpeningType;
  name: string;
  width: number;
  height: number;
  color?: string;  // custom colour for diagram display (hex string)
  x?: number;  // horizontal position from wall's left edge (meters)
  y?: number;  // vertical position from wall's top edge (meters)
  details: WindowDetails | DoorDetails | GeneralOpeningDetails;
}

export enum OpeningType {
  Window = 'window',
  Door = 'door',
  GeneralOpening = 'general_opening',
}

export interface WindowDetails {
  type: 'window';
  glassType: GlassType;
  glassThickness: number;
  isFireRated: boolean;
  frl?: FRL;
  isOpenable: boolean;
  isInHabitableRoom: boolean;
  roomType?: 'bathroom' | 'laundry' | 'toilet' | 'other';
}

export interface DoorDetails {
  type: 'door';
  doorType: DoorType;
  isFireDoor: boolean;
  frl?: FRL;
  isSelfClosing: boolean;
  thickness: number;
}

export interface GeneralOpeningDetails {
  type: 'general_opening';
  description: string;
  isExempt: boolean;
}

export enum GlassType {
  Standard = 'standard',
  Tempered = 'tempered',
  Laminated = 'laminated',
  WiredGlass = 'wired_glass',
  FireRated = 'fire_rated',
  HollowGlassBlock = 'hollow_glass_block',
}

export enum DoorType {
  Standard = 'standard',
  SolidCore = 'solid_core',
  FireDoor = 'fire_door',
  Hollow = 'hollow',
}
