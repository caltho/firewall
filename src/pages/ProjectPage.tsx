import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { WallForm } from '../components/wall/WallForm';
import { getBuildingClassInfo } from '../constants/buildingClasses';
import { getConstructionType } from '../constants/constructionTypes';
import { assessWall } from '../engine/complianceEngine';
import { generateId } from '../utils/ids';
import { formatFRL, formatArea, formatDistance } from '../utils/formatters';
import { isClass1, isClass10 } from '../types/ncc';
import type { BoundaryType } from '../types/ncc';
import type { WallMaterial } from '../types/project';

export function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [showWallForm, setShowWallForm] = useState(false);

  const project = projectId ? state.projects[projectId] : undefined;

  const walls = useMemo(() => {
    if (!project) return [];
    return project.wallIds
      .map(id => state.walls[id])
      .filter(Boolean);
  }, [project, state.walls]);

  const wallResults = useMemo(() => {
    if (!project) return {};
    const results: Record<string, ReturnType<typeof assessWall>> = {};
    for (const wall of walls) {
      const openings = wall.openingIds
        .map(id => state.openings[id])
        .filter(Boolean);
      results[wall.id] = assessWall(project, wall, openings);
    }
    return results;
  }, [project, walls, state.openings]);

  if (!project) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-slate-900">Project not found</h1>
        <Link to="/" className="text-fire-600 hover:text-fire-700 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const classInfo = getBuildingClassInfo(project.buildingClass);
  const constructionType = isClass1(project.buildingClass) || isClass10(project.buildingClass)
    ? null
    : getConstructionType(project.buildingClass, project.riseInStoreys);

  function handleAddWall(data: {
    name: string;
    height: number;
    width: number;
    distanceToBoundary: number;
    boundaryType: BoundaryType;
    wallMaterial: WallMaterial;
    isLoadbearing: boolean;
  }) {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_WALL',
      payload: {
        id: generateId(),
        projectId: project!.id,
        ...data,
        openingIds: [],
        createdAt: now,
        updatedAt: now,
      },
    });
    setShowWallForm(false);
  }

  function handleDeleteWall(wallId: string) {
    if (window.confirm('Delete this wall assessment and all its openings?')) {
      dispatch({ type: 'DELETE_WALL', payload: { wallId, projectId: project!.id } });
    }
  }

  function handleDeleteProject() {
    if (window.confirm('Delete this entire project and all wall assessments?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: project!.id });
      navigate('/');
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:text-fire-600">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{project.name}</span>
      </nav>

      {/* Project Details Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              {project.address && <p className="text-sm text-slate-500 mt-1">{project.address}</p>}
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="secondary" onClick={handleDeleteProject}>Delete Project</Button>
              <Button onClick={() => setShowWallForm(true)}>Add Wall</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Building Class</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {classInfo?.label ?? `Class ${project.buildingClass}`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{classInfo?.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Rise in Storeys</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {project.riseInStoreys} storey{project.riseInStoreys !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Construction Type</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {constructionType ? `Type ${constructionType}` : isClass1(project.buildingClass) ? 'N/A (Class 1)' : 'N/A'}
              </p>
              {constructionType && (
                <p className="text-xs text-slate-500 mt-0.5">Per NCC Table C2D2</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Fire Sprinklers</p>
              <p className="text-sm mt-1">
                {project.hasSprinklers ? (
                  <Badge variant="compliant">Sprinklered</Badge>
                ) : (
                  <span className="font-semibold text-slate-900">No</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wall list */}
      {walls.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-slate-900">No walls assessed yet</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Add a wall elevation to begin assessing boundary distance compliance.
            </p>
            <Button onClick={() => setShowWallForm(true)}>Add First Wall</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {walls.map(wall => {
            const result = wallResults[wall.id];
            return (
              <div
                key={wall.id}
                onClick={() => navigate(`/project/${project.id}/wall/${wall.id}`)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold text-slate-900">
                      {wall.name}
                    </span>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span>{formatArea(wall.height * wall.width)}</span>
                      <span>{formatDistance(wall.distanceToBoundary)} to boundary</span>
                      <span>{wall.openingIds.length} opening{wall.openingIds.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {result && (
                      <div className="text-right">
                        <Badge variant={result.overallCompliant ? 'compliant' : 'non-compliant'}>
                          {result.overallCompliant ? 'Compliant' : 'Non-Compliant'}
                        </Badge>
                        {result.wallNeedsFireResistance && (
                          <p className="text-xs text-slate-500 mt-1">
                            FRL: {formatFRL(result.requiredWallFRL)}
                          </p>
                        )}
                      </div>
                    )}
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteWall(wall.id); }}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {project.notes && (
        <Card title="Notes" className="mt-6">
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.notes}</p>
        </Card>
      )}

      <WallForm
        isOpen={showWallForm}
        onClose={() => setShowWallForm(false)}
        onSubmit={handleAddWall}
      />
    </div>
  );
}
