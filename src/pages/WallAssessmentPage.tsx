import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Checkbox } from '../components/common/Checkbox';
import { OpeningForm } from '../components/openings/OpeningForm';
import { assessWall } from '../engine/complianceEngine';
import { generateId } from '../utils/ids';
import { formatFRL, formatArea, formatDistance, formatPercentage } from '../utils/formatters';
import { BoundaryType } from '../types/ncc';
import { WallMaterial, type Opening } from '../types/project';

const boundaryTypeOptions = [
  { value: BoundaryType.SideRear, label: 'Side/Rear boundary' },
  { value: BoundaryType.Road, label: 'Road/public space' },
  { value: BoundaryType.SameAllotment, label: 'Same allotment building' },
];

const wallMaterialOptions = [
  { value: WallMaterial.Brick, label: 'Brick' },
  { value: WallMaterial.ConcreteBlock, label: 'Concrete Block' },
  { value: WallMaterial.Timber, label: 'Timber' },
  { value: WallMaterial.SteelFrame, label: 'Steel Frame' },
  { value: WallMaterial.MetalCladding, label: 'Metal Cladding' },
  { value: WallMaterial.Composite, label: 'Composite' },
  { value: WallMaterial.Other, label: 'Other' },
];

export function WallAssessmentPage() {
  const { projectId, wallId } = useParams();
  const { state, dispatch } = useAppContext();
  const [showOpeningForm, setShowOpeningForm] = useState(false);
  const [editingOpening, setEditingOpening] = useState<Opening | null>(null);

  const project = projectId ? state.projects[projectId] : undefined;
  const wall = wallId ? state.walls[wallId] : undefined;

  const openings = useMemo(() => {
    if (!wall) return [];
    return wall.openingIds.map(id => state.openings[id]).filter(Boolean);
  }, [wall, state.openings]);

  const complianceResult = useMemo(() => {
    if (!project || !wall) return null;
    return assessWall(project, wall, openings);
  }, [project, wall, openings]);

  if (!project || !wall) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-slate-900">Wall not found</h1>
        <Link to="/" className="text-fire-600 hover:text-fire-700 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  function updateWall(field: string, value: unknown) {
    dispatch({
      type: 'UPDATE_WALL',
      payload: { id: wall!.id, [field]: value },
    });
  }

  function handleAddOpening(data: Omit<Opening, 'id' | 'wallId'>) {
    dispatch({
      type: 'ADD_OPENING',
      payload: {
        id: generateId(),
        wallId: wall!.id,
        ...data,
      },
    });
  }

  function handleUpdateOpening(data: Omit<Opening, 'id' | 'wallId'>) {
    if (!editingOpening) return;
    dispatch({
      type: 'UPDATE_OPENING',
      payload: {
        id: editingOpening.id,
        ...data,
      },
    });
    setEditingOpening(null);
  }

  function handleDeleteOpening(openingId: string) {
    dispatch({ type: 'DELETE_OPENING', payload: { openingId, wallId: wall!.id } });
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:text-fire-600">Projects</Link>
        <span className="mx-2">/</span>
        <Link to={`/project/${project.id}`} className="hover:text-fire-600">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{wall.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wall Properties + Openings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wall Properties */}
          <Card title="Wall Properties">
            <div className="space-y-4">
              <Input
                label="Wall Name"
                value={wall.name}
                onChange={e => updateWall('name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Height (m)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={wall.height}
                  onChange={e => updateWall('height', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Width (m)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={wall.width}
                  onChange={e => updateWall('width', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Input
                label="Distance to Boundary (m)"
                type="number"
                step="0.01"
                min="0"
                value={wall.distanceToBoundary}
                onChange={e => updateWall('distanceToBoundary', parseFloat(e.target.value) || 0)}
                helpText="Measured at right angles from the wall to the fire-source feature"
              />
              <Select
                label="Boundary Type"
                options={boundaryTypeOptions}
                value={wall.boundaryType}
                onChange={e => updateWall('boundaryType', e.target.value)}
              />
              <Select
                label="Wall Material"
                options={wallMaterialOptions}
                value={wall.wallMaterial}
                onChange={e => updateWall('wallMaterial', e.target.value)}
              />
              <Checkbox
                label="Wall is loadbearing"
                checked={wall.isLoadbearing}
                onChange={e => updateWall('isLoadbearing', e.target.checked)}
              />
            </div>
          </Card>

          {/* Openings */}
          <Card
            title="Openings"
            actions={<Button size="sm" onClick={() => setShowOpeningForm(true)}>Add Opening</Button>}
          >
            {openings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No openings added. Add windows, doors, or other openings to assess their compliance.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {openings.map(opening => {
                  const result = complianceResult?.openingResults.find(r => r.openingId === opening.id);
                  return (
                    <div key={opening.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{opening.name}</span>
                          <span className="text-xs text-slate-400 capitalize">{opening.type.replace('_', ' ')}</span>
                          {result && (
                            <Badge variant={result.compliant ? 'compliant' : 'non-compliant'}>
                              {result.compliant ? 'OK' : 'Fail'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatArea(opening.width * opening.height)} ({opening.width}m x {opening.height}m)
                        </p>
                        {result && !result.compliant && result.notes.length > 0 && (
                          <p className="text-xs text-red-600 mt-0.5">{result.notes[result.notes.length - 1]}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingOpening(opening)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteOpening(opening.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Compliance Results */}
        <div className="space-y-6">
          {complianceResult && (
            <>
              {/* Overall verdict */}
              <Card>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                    complianceResult.overallCompliant ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <span className="text-2xl">
                      {complianceResult.overallCompliant ? '\u2713' : '\u2717'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">
                    <Badge
                      variant={complianceResult.overallCompliant ? 'compliant' : 'non-compliant'}
                      className="text-base px-4 py-1"
                    >
                      {complianceResult.overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </Badge>
                  </h3>
                </div>
              </Card>

              {/* Area Summary */}
              <Card title="Area Summary">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Total wall area</dt>
                    <dd className="font-medium text-slate-900">{formatArea(complianceResult.totalWallArea)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Total opening area</dt>
                    <dd className="font-medium text-slate-900">{formatArea(complianceResult.totalOpeningArea)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Unprotected area</dt>
                    <dd className="font-medium text-red-600">{formatArea(complianceResult.unprotectedOpeningArea)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Protected area</dt>
                    <dd className="font-medium text-emerald-600">{formatArea(complianceResult.protectedOpeningArea)}</dd>
                  </div>
                  {complianceResult.exemptOpeningArea > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Exempt area</dt>
                      <dd className="font-medium text-slate-500">{formatArea(complianceResult.exemptOpeningArea)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <dt className="text-slate-600">Unprotected %</dt>
                    <dd className="font-medium text-slate-900">{formatPercentage(complianceResult.unprotectedAreaPercentage)}</dd>
                  </div>
                  {complianceResult.maxAllowedUnprotectedPercentage !== null && (
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Max allowed</dt>
                      <dd className="font-medium text-slate-900">{formatPercentage(complianceResult.maxAllowedUnprotectedPercentage)}</dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* FRL Requirements */}
              <Card title="FRL Requirement">
                {complianceResult.wallNeedsFireResistance ? (
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {formatFRL(complianceResult.requiredWallFRL)}
                    </p>
                    {complianceResult.constructionType && (
                      <p className="text-sm text-slate-500">
                        Construction Type {complianceResult.constructionType}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {wall.isLoadbearing ? 'Loadbearing' : 'Non-loadbearing'} external wall at {formatDistance(wall.distanceToBoundary)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No FRL required at this distance from the boundary.
                  </p>
                )}
              </Card>

              {/* Compliance Notes */}
              <Card title="Assessment Notes">
                <ul className="space-y-2">
                  {complianceResult.complianceNotes.map((note, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-slate-400 shrink-0">&bull;</span>
                      {note}
                    </li>
                  ))}
                </ul>
                {complianceResult.nccReferences.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 mb-1">NCC References:</p>
                    <div className="flex flex-wrap gap-1">
                      {complianceResult.nccReferences.map((ref, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Add Opening Modal */}
      <OpeningForm
        isOpen={showOpeningForm}
        onClose={() => setShowOpeningForm(false)}
        onSubmit={handleAddOpening}
      />

      {/* Edit Opening Modal */}
      {editingOpening && (
        <OpeningForm
          isOpen={true}
          onClose={() => setEditingOpening(null)}
          onSubmit={handleUpdateOpening}
          initialData={editingOpening}
        />
      )}
    </div>
  );
}
