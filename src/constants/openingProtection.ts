import { OpeningType } from '../types/project';

export interface ProtectionMethod {
  openingType: OpeningType;
  method: string;
  description: string;
  nccReference: string;
}

// NCC C4D5 — Protection methods for openings
export const PROTECTION_METHODS: ProtectionMethod[] = [
  // Windows
  {
    openingType: OpeningType.Window,
    method: 'fire_window',
    description: 'Fire window complying with AS 1530.4',
    nccReference: 'C4D5(1)(b)',
  },
  {
    openingType: OpeningType.Window,
    method: 'wall_wetting_sprinkler',
    description: 'Wall-wetting sprinkler system (automatic closing or permanently closed windows only)',
    nccReference: 'C4D5(1)(b)',
  },
  {
    openingType: OpeningType.Window,
    method: 'fire_shutter',
    description: 'Fire shutter complying with AS 1530.4',
    nccReference: 'C4D5(1)(b)',
  },

  // Doors
  {
    openingType: OpeningType.Door,
    method: 'fire_door',
    description: 'Fire door complying with AS 1905.1',
    nccReference: 'C4D5(1)(a)',
  },
  {
    openingType: OpeningType.Door,
    method: 'fire_shutter',
    description: 'Fire shutter complying with AS 1530.4',
    nccReference: 'C4D5(1)(a)',
  },
  {
    openingType: OpeningType.Door,
    method: 'wall_wetting_sprinkler',
    description: 'Wall-wetting sprinkler system (self-closing or automatic closing doors only)',
    nccReference: 'C4D5(1)(a)',
  },

  // General openings
  {
    openingType: OpeningType.GeneralOpening,
    method: 'fire_rated_construction',
    description: 'Opening must be closed with fire-rated construction',
    nccReference: 'C4D5(1)(c)',
  },
];

// Class 1 specific protection requirements
export const CLASS1_WINDOW_PROTECTION = 'Non-openable fire window, or wired glass/hollow glass block in steel frame';
export const CLASS1_DOOR_PROTECTION = 'Self-closing solid core door (min 35mm thick)';
