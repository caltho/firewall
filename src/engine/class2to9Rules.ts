import { BoundaryType, type BuildingClass, type FRL } from '../types/ncc';
import type { WallAssessment, Opening } from '../types/project';
import type { WallComplianceResult, OpeningComplianceResult } from '../types/compliance';
import { getConstructionType } from '../constants/constructionTypes';
import { getRequiredExternalWallFRL } from '../constants/frlTables';
import {
  calculateWallArea,
  calculateOpeningArea,
  calculateTotalOpeningArea,
  isOpeningProtected,
  isOpeningExempt,
} from './calculations';
import { formatFRL, frlIsNone } from '../utils/formatters';
import {
  CLASS2TO9_SIDE_REAR_PROTECTION_THRESHOLD,
  CLASS2TO9_ROAD_PROTECTION_THRESHOLD,
  CLASS2TO9_SAME_ALLOTMENT_PROTECTION_THRESHOLD,
  CLASS2TO9_MAX_OPENING_PERCENTAGE,
} from '../constants/thresholds';

const NO_FRL: FRL = { structuralAdequacy: null, integrity: null, insulation: null };

/**
 * NCC Volume One, Part C3/C4
 * Fire separation and protection of openings for Class 2-9 buildings
 */
export function assessClass2to9Wall(
  wall: WallAssessment,
  openings: Opening[],
  buildingClass: BuildingClass,
  riseInStoreys: number,
  hasSprinklers: boolean,
): WallComplianceResult {
  const totalWallArea = calculateWallArea(wall.height, wall.width);
  const complianceNotes: string[] = [];
  const nccReferences: string[] = [];

  // Step 1: Determine construction type
  const constructionType = getConstructionType(buildingClass, riseInStoreys);
  if (constructionType) {
    complianceNotes.push(`Construction Type ${constructionType} (based on Class ${buildingClass}, ${riseInStoreys} storey${riseInStoreys !== 1 ? 's' : ''}).`);
    nccReferences.push('NCC Table C2D2');
  }

  // Step 2: Calculate effective distance (sprinkler concession doubles it)
  const effectiveDistance = hasSprinklers
    ? wall.distanceToBoundary * 2
    : wall.distanceToBoundary;

  if (hasSprinklers) {
    complianceNotes.push(`Sprinkler concession applied: effective distance is ${effectiveDistance.toFixed(2)}m (actual: ${wall.distanceToBoundary.toFixed(2)}m).`);
  }

  // Step 3: Get required FRL
  let requiredFRL: FRL = { ...NO_FRL };
  let wallNeedsFireResistance = false;

  if (constructionType) {
    requiredFRL = getRequiredExternalWallFRL(
      constructionType,
      wall.isLoadbearing,
      effectiveDistance,
      buildingClass,
    );
    wallNeedsFireResistance = !frlIsNone(requiredFRL);

    if (wallNeedsFireResistance) {
      complianceNotes.push(`Required wall FRL: ${formatFRL(requiredFRL)} (${wall.isLoadbearing ? 'loadbearing' : 'non-loadbearing'}).`);
      nccReferences.push('NCC Specification 5');
    } else {
      complianceNotes.push('No FRL required for external wall at this distance.');
    }
  }

  // Step 4: Do openings need protection? (C4D3)
  const openingProtectionRequired = checkOpeningProtectionRequired(
    effectiveDistance,
    wall.boundaryType,
  );

  if (openingProtectionRequired) {
    complianceNotes.push('Openings require protection based on distance to fire-source feature.');
    nccReferences.push('NCC C4D3');
  }

  // Step 5: Assess each opening
  const openingResults = openings.map(opening =>
    assessClass2to9Opening(opening, openingProtectionRequired),
  );

  // Step 6: Calculate areas
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

  // Step 7: Check 1/3 rule — protected openings cannot exceed 1/3 of wall area
  const protectedOpeningsExceedLimit = openingProtectionRequired &&
    (protectedArea + unprotectedArea - exemptArea) / totalWallArea > CLASS2TO9_MAX_OPENING_PERCENTAGE;

  if (protectedOpeningsExceedLimit) {
    complianceNotes.push(
      `Total opening area exceeds 1/3 (${(CLASS2TO9_MAX_OPENING_PERCENTAGE * 100).toFixed(1)}%) of wall area. Openings must be reduced or wall area increased.`,
    );
  }

  const openingAreaCompliant = !protectedOpeningsExceedLimit &&
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
    constructionType,
    requiredWallFRL: requiredFRL,
    requiredWallFRLString: formatFRL(requiredFRL),
    wallNeedsFireResistance,
    openingProtectionRequired,
    maxAllowedUnprotectedPercentage: openingProtectionRequired ? CLASS2TO9_MAX_OPENING_PERCENTAGE : null,
    openingAreaCompliant,
    openingResults,
    overallCompliant,
    complianceNotes,
    nccReferences,
  };
}

function checkOpeningProtectionRequired(
  effectiveDistance: number,
  boundaryType: BoundaryType,
): boolean {
  switch (boundaryType) {
    case BoundaryType.SideRear:
      return effectiveDistance < CLASS2TO9_SIDE_REAR_PROTECTION_THRESHOLD;
    case BoundaryType.Road:
      return effectiveDistance < CLASS2TO9_ROAD_PROTECTION_THRESHOLD;
    case BoundaryType.SameAllotment:
      return effectiveDistance < CLASS2TO9_SAME_ALLOTMENT_PROTECTION_THRESHOLD;
  }
}

function assessClass2to9Opening(
  opening: Opening,
  protectionRequired: boolean,
): OpeningComplianceResult {
  const area = calculateOpeningArea(opening);
  const notes: string[] = [];

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

  if (!protectionRequired) {
    return {
      openingId: opening.id,
      openingName: opening.name,
      area,
      isExempt: false,
      protectionRequired: false,
      currentlyProtected: true,
      requiredProtection: 'None required at this distance',
      compliant: true,
      notes: ['Distance to boundary exceeds the protection threshold.'],
    };
  }

  // Protection is required
  const currentlyProtected = isOpeningProtected(opening);
  let requiredProtection: string;

  switch (opening.details.type) {
    case 'window':
      requiredProtection = 'Fire window, fire shutter, or wall-wetting sprinkler system (C4D5)';
      if (currentlyProtected) {
        notes.push('Fire-rated window complies with C4D5.');
      } else {
        notes.push('Window requires fire protection per C4D5.');
      }
      break;
    case 'door':
      requiredProtection = 'Fire door (AS 1905.1), fire shutter, or wall-wetting sprinkler system (C4D5)';
      if (currentlyProtected) {
        notes.push('Fire door complies with C4D5.');
      } else {
        notes.push('Door requires fire protection per C4D5.');
      }
      break;
    case 'general_opening':
      requiredProtection = 'Must be closed with fire-rated construction (C4D5)';
      notes.push('General opening must be closed with fire-rated construction.');
      break;
  }

  return {
    openingId: opening.id,
    openingName: opening.name,
    area,
    isExempt: false,
    protectionRequired: true,
    currentlyProtected,
    requiredProtection,
    compliant: currentlyProtected,
    notes,
  };
}
