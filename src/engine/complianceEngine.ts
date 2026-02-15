import type { Project, WallAssessment, Opening } from '../types/project';
import { isClass1 } from '../types/ncc';
import type { WallComplianceResult } from '../types/compliance';
import { assessClass1Wall } from './class1Rules';
import { assessClass2to9Wall } from './class2to9Rules';

export function assessWall(
  project: Project,
  wall: WallAssessment,
  openings: Opening[],
): WallComplianceResult {
  if (isClass1(project.buildingClass)) {
    return assessClass1Wall(wall, openings, project.hasSprinklers);
  }

  return assessClass2to9Wall(
    wall,
    openings,
    project.buildingClass,
    project.riseInStoreys,
    project.hasSprinklers,
  );
}
