import type { ConstructionType, FRL } from './ncc';

export interface WallComplianceResult {
  wallId: string;

  totalWallArea: number;
  totalOpeningArea: number;
  unprotectedOpeningArea: number;
  protectedOpeningArea: number;
  exemptOpeningArea: number;
  unprotectedAreaPercentage: number;

  constructionType: ConstructionType | null;

  requiredWallFRL: FRL;
  requiredWallFRLString: string;
  wallNeedsFireResistance: boolean;

  openingProtectionRequired: boolean;
  maxAllowedUnprotectedPercentage: number | null;
  openingAreaCompliant: boolean;

  openingResults: OpeningComplianceResult[];

  overallCompliant: boolean;
  complianceNotes: string[];
  nccReferences: string[];
}

export interface OpeningComplianceResult {
  openingId: string;
  openingName: string;
  area: number;
  isExempt: boolean;
  protectionRequired: boolean;
  currentlyProtected: boolean;
  requiredProtection: string;
  compliant: boolean;
  notes: string[];
}
