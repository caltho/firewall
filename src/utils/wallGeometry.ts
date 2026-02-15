import { OpeningType, type Opening } from '../types/project';

/** Positioned opening with guaranteed x/y for rendering */
export type PositionedOpening = Opening & { x: number; y: number };

/**
 * Lay out openings equally spaced across the wall horizontally.
 * - Doors are anchored to the bottom of the wall.
 * - Windows and general openings are vertically centred.
 * - All openings are evenly distributed left-to-right.
 */
export function resolveOpeningPositions(
  openings: Opening[],
  wallWidth: number,
  wallHeight: number,
): PositionedOpening[] {
  if (openings.length === 0) return [];

  // Calculate equal horizontal spacing
  const totalOpeningWidth = openings.reduce((sum, o) => sum + o.width, 0);
  const totalGap = wallWidth - totalOpeningWidth;
  const gap = totalGap / (openings.length + 1); // equal gaps between and at edges

  let currentX = gap;
  const positioned: PositionedOpening[] = [];

  for (const opening of openings) {
    // Clamp x so opening stays within wall
    const x = Math.max(0, Math.min(currentX, wallWidth - opening.width));

    // Doors sit at the bottom; everything else is vertically centred
    let y: number;
    if (opening.type === OpeningType.Door) {
      y = wallHeight - opening.height;
    } else {
      y = (wallHeight - opening.height) / 2;
    }

    // Clamp y to wall bounds
    y = Math.max(0, Math.min(y, wallHeight - opening.height));

    positioned.push({
      ...opening,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
    });

    currentX += opening.width + gap;
  }

  return positioned;
}
