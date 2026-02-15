import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { WallForm } from '../components/wall/WallForm';
import { getBuildingClassInfo } from '../constants/buildingClasses';
import { assessWall } from '../engine/complianceEngine';
import { generateId } from '../utils/ids';
import { formatFRL, formatArea, formatDistance } from '../utils/formatters';
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

      {/* Project header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          {project.address && <p className="text-sm text-slate-500 mt-1">{project.address}</p>}
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="info">{classInfo?.label ?? `Class ${project.buildingClass}`}</Badge>
            <span className="text-sm text-slate-600">{project.riseInStoreys} storey{project.riseInStoreys !== 1 ? 's' : ''}</span>
            {project.hasSprinklers && <Badge variant="compliant">Sprinklered</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDeleteProject}>Delete Project</Button>
          <Button onClick={() => setShowWallForm(true)}>Add Wall</Button>
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
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <Link
                      to={`/project/${project.id}/wall/${wall.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-fire-600 transition-colors"
                    >
                      {wall.name}
                    </Link>
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
                    <Button variant="danger" size="sm" onClick={() => handleDeleteWall(wall.id)}>
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
