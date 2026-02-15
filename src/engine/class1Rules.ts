import { BoundaryType, type FRL } from '../types/ncc';
import type { WallAssessment, Opening, WindowDetails } from '../types/project';
import { GlassType } from '../types/project';
import type { WallComplianceResult, OpeningComplianceResult } from '../types/compliance';
import {
  calculateWallArea,
  calculateOpeningArea,
  calculateTotalOpeningArea,
  isOpeningProtected,
  isOpeningExempt,
} from './calculations';
import { formatFRL } from '../utils/formatters';
import {
  CLASS1_BOUNDARY_FIRE_RESISTANCE_THRESHOLD,
  CLASS1_SAME_ALLOTMENT_FIRE_RESISTANCE_THRESHOLD,
  CLASS1_WINDOW_CONCESSION_BOUNDARY_THRESHOLD,
  CLASS1_WINDOW_CONCESSION_SAME_ALLOTMENT_THRESHOLD,
  CLASS1_WINDOW_CONCESSION_BATHROOM_MAX_AREA,
  CLASS1_WINDOW_CONCESSION_OTHER_MAX_AREA,
  CLASS1_REQUIRED_FRL,
  CLASS1_MIN_SOLID_CORE_DOOR_THICKNESS,
} from '../constants/thresholds';
import { CLASS1_WINDOW_PROTECTION, CLASS1_DOOR_PROTECTION } from '../constants/openingProtection';

const NO_FRL: FRL = { structuralAdequacy: null, integrity: null, insulation: null };

/**
 * NCC Volume Two / Housing Provisions Part 9.2
 * Fire separation of external walls for Class 1 buildings
 */
export function assessClass1Wall(
  wall: WallAssessment,
  openings: Opening[],
  _hasSprinklers: boolean,
): WallComplianceResult {
  const totalWallArea = calculateWallArea(wall.height, wall.width);
  const complianceNotes: string[] = [];
  const nccReferences: string[] = [];

  // Step 1: Does the wall need to be fire-resisting?
  const wallNeedsFireResistance = checkClass1FireResistanceTrigger(
    wall.distanceToBoundary,
    wall.boundaryType,
  );

  const requiredFRL: FRL = wallNeedsFireResistance
    ? { ...CLASS1_REQUIRED_FRL }
    : { ...NO_FRL };

  if (wallNeedsFireResistance) {
    complianceNotes.push(
      `Wall is within ${wall.boundaryType === BoundaryType.SameAllotment ? '1.8m of another building on the same allotment' : '900mm of the allotment boundary'} and must be fire-resisting.`,
    );
    complianceNotes.push('Required FRL: 60/60/60 when tested from outside.');
    nccReferences.push('NCC Housing Provisions Part 9.2');
  } else {
    complianceNotes.push('Wall does not require fire-resistance based on distance to boundary.');
  }

  // Step 2: Assess each opening
  const openingResults = openings.map(opening =>
    assessClass1Opening(opening, wall, wallNeedsFireResistance),
  );

  // Step 3: Calculate areas
  const totalOpeningArea = calculateTotalOpeningArea(openings);
  let unprotectedArea = 0;
  let protectedArea = 0;
  let exemptArea = 0;

  for (const opening of openings) {
    const area = calculateOpeningArea(opening);
    if (isOpeningExempt(opening)) {
      exemptArea += area;
    } else if (isOpeningProtected(opening)) {
      protectedArea += area;
    } else {
      unprotectedArea += area;
    }
  }

  const unprotectedPercentage = totalWallArea > 0 ? unprotectedArea / totalWallArea : 0;

  // For Class 1, there's no prescriptive percentage limit on unprotected area,
  // but all openings in a fire-resisting wall must be protected
  const openingAreaCompliant = !wallNeedsFireResistance ||
    openingResults.every(r => r.compliant);

  const overallCompliant = openingAreaCompliant;

  return {
    wallId: wall.id,
    totalWallArea,
    totalOpeningArea,
    unprotectedOpeningArea: unprotectedArea,
    protectedOpeningArea: protectedArea,
    exemptOpeningArea: exemptArea,
    unprotectedAreaPercentage: unprotectedPercentage,
    constructionType: null,
    requiredWallFRL: requiredFRL,
    requiredWallFRLString: formatFRL(requiredFRL),
    wallNeedsFireResistance,
    openingProtectionRequired: wallNeedsFireResistance,
    maxAllowedUnprotectedPercentage: null,
    openingAreaCompliant,
    openingResults,
    overallCompliant,
    complianceNotes,
    nccReferences,
  };
}

function checkClass1FireResistanceTrigger(
  distance: number,
  boundaryType: BoundaryType,
): boolean {
  switch (boundaryType) {
    case BoundaryType.SideRear:
      return distance < CLASS1_BOUNDARY_FIRE_RESISTANCE_THRESHOLD;
    case BoundaryType.SameAllotment:
      return distance < CLASS1_SAME_ALLOTMENT_FIRE_RESISTANCE_THRESHOLD;
    case BoundaryType.Road:
      return false;
  }
}

function assessClass1Opening(
  opening: Opening,
  wall: WallAssessment,
  wallNeedsFireResistance: boolean,
): OpeningComplianceResult {
  const area = calculateOpeningArea(opening);

  // Exempt openings (subfloor vents, weepholes)
  if (isOpeningExempt(opening)) {
    return {
      openingId: opening.id,
      openingName: opening.name,
      area,
      isExempt: true,
      protectionRequired: false,
      currentlyProtected: true,
      requiredProtection: 'None (exempt opening)',
      compliant: true,
      notes: ['This opening is exempt from fire protection requirements.'],
    };
  }

  // If wall doesn't need fire resistance, openings are fine
  if (!wallNeedsFireResistance) {
    return {
      openingId: opening.id,
      openingName: opening.name,
      area,
      isExempt: false,
      protectionRequired: false,
      currentlyProtected: true,
      requiredProtection: 'None required',
      compliant: true,
      notes: ['Wall does not require fire-resistance; opening is compliant.'],
    };
  }

  // Wall needs fire resistance — check opening type
  if (opening.details.type === 'window') {
    return assessClass1Window(opening, opening.details, wall, area);
  }

  if (opening.details.type === 'door') {
    return assessClass1Door(opening, opening.details, area);
  }

  // General opening in a fire-resisting wall — must be protected
  return {
    openingId: opening.id,
    openingName: opening.name,
    area,
    isExempt: false,
    protectionRequired: true,
    currentlyProtected: false,
    requiredProtection: 'Must be closed with fire-rated construction',
    compliant: false,
    notes: ['Unprotected general opening in a fire-resisting wall.'],
  };
}

function assessClass1Window(
  opening: Opening,
  details: WindowDetails,
  wall: WallAssessment,
  area: number,
): OpeningComplianceResult {
  const notes: string[] = [];

  // Check small window concession (NCC 9.2.3)
  const concessionDistance = wall.boundaryType === BoundaryType.SameAllotment
    ? CLASS1_WINDOW_CONCESSION_SAME_ALLOTMENT_THRESHOLD
    : CLASS1_WINDOW_CONCESSION_BOUNDARY_THRESHOLD;

  if (!details.isInHabitableRoom && wall.distanceToBoundary >= concessionDistance) {
    const maxArea = details.roomType === 'bathroom' || details.roomType === 'laundry' || details.roomType === 'toilet'
      ? CLASS1_WINDOW_CONCESSION_BATHROOM_MAX_AREA
      : CLASS1_WINDOW_CONCESSION_OTHER_MAX_AREA;

    const hasAcceptableGlazing =
      details.glassType === GlassType.WiredGlass ||
      details.glassType === GlassType.HollowGlassBlock ||
      details.glassType === GlassType.FireRated;

    if (area <= maxArea && hasAcceptableGlazing) {
      notes.push(`Small window concession applies: ${area.toFixed(2)}m\u00B2 \u2264 ${maxArea}m\u00B2 with acceptable glazing.`);
      return {
        openingId: opening.id,
        openingName: opening.name,
        area,
        isExempt: false,
        protectionRequired: false,
        currentlyProtected: true,
        requiredProtection: 'Concession applies (small non-habitable room window)',
        compliant: true,
        notes,
      };
    }

    if (area <= maxArea && !hasAcceptableGlazing) {
      notes.push(`Window area (${area.toFixed(2)}m\u00B2) qualifies for concession but requires wired glass, hollow glass block, or fire-rated glazing.`);
    }
  }

  // Standard requirement: fire-rated window
  const isProtected = details.isFireRated;

  if (isProtected) {
    notes.push('Window is fire-rated and complies.');
  } else {
    notes.push('Window in fire-resisting wall must be a non-openable fire window or have fire-rated glazing.');
  }

  return {
    openingId: opening.id,
    openingName: opening.name,
    area,
    isExempt: false,
    protectionRequired: true,
    currentlyProtected: isProtected,
    requiredProtection: CLASS1_WINDOW_PROTECTION,
    compliant: isProtected,
    notes,
  };
}

function assessClass1Door(
  opening: Opening,
  details: Opening['details'] & { type: 'door' },
  area: number,
): OpeningComplianceResult {
  const notes: string[] = [];

  // Door in fire-resisting wall needs to be self-closing solid core >= 35mm
  const isProtected = details.isFireDoor || (
    details.isSelfClosing &&
    details.thickness >= CLASS1_MIN_SOLID_CORE_DOOR_THICKNESS
  );

  if (details.isFireDoor) {
    notes.push('Fire door is compliant.');
  } else if (details.isSelfClosing && details.thickness >= CLASS1_MIN_SOLID_CORE_DOOR_THICKNESS) {
    notes.push(`Self-closing solid core door (${details.thickness}mm) is compliant.`);
  } else {
    if (!details.isSelfClosing) {
      notes.push('Door must be self-closing.');
    }
    if (details.thickness < CLASS1_MIN_SOLID_CORE_DOOR_THICKNESS) {
      notes.push(`Door thickness (${details.thickness}mm) is below the minimum ${CLASS1_MIN_SOLID_CORE_DOOR_THICKNESS}mm for a solid core door.`);
    }
  }

  return {
    openingId: opening.id,
    openingName: opening.name,
    area,
    isExempt: false,
    protectionRequired: true,
    currentlyProtected: isProtected,
    requiredProtection: CLASS1_DOOR_PROTECTION,
    compliant: isProtected,
    notes,
  };
}
