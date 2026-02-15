import type { Opening } from '../types/project';

export function calculateWallArea(height: number, width: number): number {
  return height * width;
}

export function calculateOpeningArea(opening: Opening): number {
  return opening.width * opening.height;
}

export function calculateTotalOpeningArea(openings: Opening[]): number {
  return openings.reduce((sum, o) => sum + calculateOpeningArea(o), 0);
}

export function calculateUnprotectedPercentage(
  unprotectedArea: number,
  wallArea: number,
): number {
  if (wallArea <= 0) return 0;
  return unprotectedArea / wallArea;
}

export function isOpeningProtected(opening: Opening): boolean {
  switch (opening.details.type) {
    case 'window':
      return opening.details.isFireRated;
    case 'door':
      return opening.details.isFireDoor;
    case 'general_opening':
      return opening.details.isExempt;
  }
}

export function isOpeningExempt(opening: Opening): boolean {
  return opening.details.type === 'general_opening' && opening.details.isExempt;
}
