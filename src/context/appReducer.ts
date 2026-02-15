import type { Project, WallAssessment, Opening } from '../types/project';

export interface AppState {
  projects: Record<string, Project>;
  walls: Record<string, WallAssessment>;
  openings: Record<string, Opening>;
  activeProjectId: string | null;
}

export const initialState: AppState = {
  projects: {},
  walls: {},
  openings: {},
  activeProjectId: null,
};

export type AppAction =
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> & { id: string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
  | { type: 'ADD_WALL'; payload: WallAssessment }
  | { type: 'UPDATE_WALL'; payload: Partial<WallAssessment> & { id: string } }
  | { type: 'DELETE_WALL'; payload: { wallId: string; projectId: string } }
  | { type: 'ADD_OPENING'; payload: Opening }
  | { type: 'UPDATE_OPENING'; payload: Partial<Opening> & { id: string } }
  | { type: 'DELETE_OPENING'; payload: { openingId: string; wallId: string } };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: { ...state.projects, [action.payload.id]: action.payload },
      };

    case 'UPDATE_PROJECT': {
      const existing = state.projects[action.payload.id];
      if (!existing) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.payload.id]: {
            ...existing,
            ...action.payload,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'DELETE_PROJECT': {
      const project = state.projects[action.payload];
      if (!project) return state;

      const { [action.payload]: _removedProject, ...remainingProjects } = state.projects;

      // Cascade: remove all walls and their openings
      const remainingWalls = { ...state.walls };
      const remainingOpenings = { ...state.openings };

      for (const wallId of project.wallIds) {
        const wall = remainingWalls[wallId];
        if (wall) {
          for (const openingId of wall.openingIds) {
            delete remainingOpenings[openingId];
          }
          delete remainingWalls[wallId];
        }
      }

      return {
        ...state,
        projects: remainingProjects,
        walls: remainingWalls,
        openings: remainingOpenings,
        activeProjectId: state.activeProjectId === action.payload ? null : state.activeProjectId,
      };
    }

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload };

    case 'ADD_WALL': {
      const project = state.projects[action.payload.projectId];
      if (!project) return state;
      return {
        ...state,
        walls: { ...state.walls, [action.payload.id]: action.payload },
        projects: {
          ...state.projects,
          [project.id]: {
            ...project,
            wallIds: [...project.wallIds, action.payload.id],
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'UPDATE_WALL': {
      const existing = state.walls[action.payload.id];
      if (!existing) return state;
      return {
        ...state,
        walls: {
          ...state.walls,
          [action.payload.id]: {
            ...existing,
            ...action.payload,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'DELETE_WALL': {
      const { wallId, projectId } = action.payload;
      const wall = state.walls[wallId];
      const project = state.projects[projectId];
      if (!wall || !project) return state;

      const { [wallId]: _removedWall, ...remainingWalls } = state.walls;

      // Cascade: remove all openings in this wall
      const remainingOpenings = { ...state.openings };
      for (const openingId of wall.openingIds) {
        delete remainingOpenings[openingId];
      }

      return {
        ...state,
        walls: remainingWalls,
        openings: remainingOpenings,
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            wallIds: project.wallIds.filter(id => id !== wallId),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'ADD_OPENING': {
      const wall = state.walls[action.payload.wallId];
      if (!wall) return state;
      return {
        ...state,
        openings: { ...state.openings, [action.payload.id]: action.payload },
        walls: {
          ...state.walls,
          [wall.id]: {
            ...wall,
            openingIds: [...wall.openingIds, action.payload.id],
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'UPDATE_OPENING': {
      const existing = state.openings[action.payload.id];
      if (!existing) return state;
      return {
        ...state,
        openings: {
          ...state.openings,
          [action.payload.id]: { ...existing, ...action.payload },
        },
      };
    }

    case 'DELETE_OPENING': {
      const { openingId, wallId } = action.payload;
      const wall = state.walls[wallId];
      if (!wall) return state;

      const { [openingId]: _removedOpening, ...remainingOpenings } = state.openings;

      return {
        ...state,
        openings: remainingOpenings,
        walls: {
          ...state.walls,
          [wallId]: {
            ...wall,
            openingIds: wall.openingIds.filter(id => id !== openingId),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    default:
      return state;
  }
}
