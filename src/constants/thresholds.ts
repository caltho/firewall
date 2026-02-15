// NCC distance thresholds in metres

// Class 1 buildings (NCC Volume 2 / Housing Provisions, Part 9.2)
export const CLASS1_BOUNDARY_FIRE_RESISTANCE_THRESHOLD = 0.9; // 900mm from allotment boundary
export const CLASS1_SAME_ALLOTMENT_FIRE_RESISTANCE_THRESHOLD = 1.8; // 1.8m from another building on same allotment
export const CLASS1_WINDOW_CONCESSION_BOUNDARY_THRESHOLD = 0.6; // 600mm from boundary for small window concession
export const CLASS1_WINDOW_CONCESSION_SAME_ALLOTMENT_THRESHOLD = 1.2; // 1.2m from another building for concession

// Class 1 window concession area limits (m2)
export const CLASS1_WINDOW_CONCESSION_BATHROOM_MAX_AREA = 1.2; // m2 for bathroom/laundry/toilet
export const CLASS1_WINDOW_CONCESSION_OTHER_MAX_AREA = 0.54; // m2 for other non-habitable rooms

// Class 2-9 buildings (NCC Volume 1, Part C4)
export const CLASS2TO9_SIDE_REAR_PROTECTION_THRESHOLD = 3; // 3m from side/rear boundary
export const CLASS2TO9_ROAD_PROTECTION_THRESHOLD = 6; // 6m from road/far boundary
export const CLASS2TO9_SAME_ALLOTMENT_PROTECTION_THRESHOLD = 6; // 6m from another building on same allotment

// Maximum unprotected area for Class 2-9
export const CLASS2TO9_MAX_OPENING_PERCENTAGE = 1 / 3; // openings cannot exceed 1/3 of wall area

// Class 1 required FRL when fire-resisting wall is needed
export const CLASS1_REQUIRED_FRL = {
  structuralAdequacy: 60,
  integrity: 60,
  insulation: 60,
} as const;

// Minimum solid core door thickness for Class 1 (mm)
export const CLASS1_MIN_SOLID_CORE_DOOR_THICKNESS = 35;
