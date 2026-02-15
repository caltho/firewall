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
import { BoundaryType, isClass1, isClass10 } from '../types/ncc';
import { WallMaterial, type Opening } from '../types/project';
import { getBuildingClassInfo } from '../constants/buildingClasses';
import { getConstructionType } from '../constants/constructionTypes';

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

  const classInfo = getBuildingClassInfo(project.buildingClass);
  const constructionType = isClass1(project.buildingClass) || isClass10(project.buildingClass)
    ? null
    : getConstructionType(project.buildingClass, project.riseInStoreys);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4 print:hidden">
        <Link to="/" className="hover:text-fire-600">Projects</Link>
        <span className="mx-2">/</span>
        <Link to={`/project/${project.id}`} className="hover:text-fire-600">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{wall.name}</span>
      </nav>

      {/* Project & Wall Details Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              {project.address && <p className="text-sm text-slate-500 mt-1">{project.address}</p>}
              <p className="text-sm text-slate-600 mt-1">
                Wall: <span className="font-semibold">{wall.name}</span>
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="print:hidden"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
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
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Boundary Distance</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatDistance(wall.distanceToBoundary)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {wall.boundaryType === BoundaryType.SideRear ? 'Side/rear boundary' : wall.boundaryType === BoundaryType.Road ? 'Road/public space' : 'Same allotment'}
              </p>
            </div>
          </div>
        </div>
      </div>

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

              {/* Area Summary */}
              <Card title="Area Summary">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Total wall area</dt>
                    <dd className="font-medium text-slate-900">
                      {formatArea(complianceResult.totalWallArea)}
                      <span className="text-slate-400 text-xs ml-1">({wall.height}m x {wall.width}m)</span>
                    </dd>
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

              {/* Per-opening detailed results */}
              {complianceResult.openingResults.length > 0 && (
                <Card title="Opening Details">
                  <div className="space-y-4">
                    {complianceResult.openingResults.map(result => (
                      <div key={result.openingId} className={`rounded-lg border p-3 ${result.compliant ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{result.openingName}</span>
                          <Badge variant={result.compliant ? 'compliant' : 'non-compliant'}>
                            {result.compliant ? 'Compliant' : 'Non-Compliant'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">Area: {formatArea(result.area)}</p>

                        {result.protectionRequired && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-slate-700">Required protection:</p>
                            <p className="text-xs text-slate-600">{result.requiredProtection}</p>
                          </div>
                        )}

                        {result.notes.length > 0 && (
                          <div className="border-t border-slate-200/60 pt-2 mt-2">
                            {result.notes.map((note, i) => (
                              <p key={i} className={`text-xs ${result.compliant ? 'text-emerald-700' : 'text-red-700'}`}>
                                {note}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* View Calculations — expandable */}
              <Card>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-semibold text-slate-900">View Calculations</span>
                    <svg className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div className="mt-4 space-y-4">
                    {/* Step 1: Building info */}
                    <div className="border-l-2 border-fire-300 pl-3">
                      <p className="text-xs font-semibold text-fire-700 uppercase tracking-wide mb-1">Step 1 — Building Classification</p>
                      <p className="text-sm text-slate-700">
                        {getBuildingClassInfo(project.buildingClass)?.label}: {getBuildingClassInfo(project.buildingClass)?.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rise in storeys: {project.riseInStoreys} | Sprinklers: {project.hasSprinklers ? 'Yes' : 'No'}
                      </p>
                      {complianceResult.constructionType && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Construction Type {complianceResult.constructionType} determined from NCC Table C2D2
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1 italic">
                        Source: {isClass1(project.buildingClass) ? 'NCC Volume Two, Housing Provisions' : 'NCC Volume One, Section C'}
                      </p>
                    </div>

                    {/* Step 2: Distance assessment */}
                    <div className="border-l-2 border-fire-300 pl-3">
                      <p className="text-xs font-semibold text-fire-700 uppercase tracking-wide mb-1">Step 2 — Boundary Distance</p>
                      <p className="text-sm text-slate-700">
                        Distance to fire-source feature: <strong>{formatDistance(wall.distanceToBoundary)}</strong>
                        {' '}({wall.boundaryType === BoundaryType.SideRear ? 'side/rear allotment boundary' : wall.boundaryType === BoundaryType.Road ? 'road/public space' : 'another building on same allotment'})
                      </p>
                      {project.hasSprinklers && !isClass1(project.buildingClass) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sprinkler concession: effective distance = {formatDistance(wall.distanceToBoundary * 2)} (actual distance doubled)
                        </p>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        {isClass1(project.buildingClass) ? (
                          <>
                            <p>Thresholds for Class 1:</p>
                            <ul className="ml-3 mt-0.5 space-y-0.5">
                              <li className={wall.boundaryType === BoundaryType.SideRear ? 'font-medium text-slate-700' : ''}>
                                {wall.distanceToBoundary < 0.9 && wall.boundaryType === BoundaryType.SideRear ? '\u2717' : '\u2713'} Side/rear boundary: fire-resistance required if &lt; 900mm
                              </li>
                              <li className={wall.boundaryType === BoundaryType.SameAllotment ? 'font-medium text-slate-700' : ''}>
                                {wall.distanceToBoundary < 1.8 && wall.boundaryType === BoundaryType.SameAllotment ? '\u2717' : '\u2713'} Same allotment: fire-resistance required if &lt; 1.8m
                              </li>
                              <li className={wall.boundaryType === BoundaryType.Road ? 'font-medium text-slate-700' : ''}>
                                \u2713 Road/public space: no fire-resistance requirement
                              </li>
                            </ul>
                          </>
                        ) : (
                          <>
                            <p>Thresholds for Class 2-9 opening protection:</p>
                            <ul className="ml-3 mt-0.5 space-y-0.5">
                              <li>Side/rear boundary: protection required if &lt; 3m</li>
                              <li>Road/public space: protection required if &lt; 6m</li>
                              <li>Same allotment: protection required if &lt; 6m</li>
                              <li>Max openings: 1/3 of wall area when protection required</li>
                            </ul>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 italic">
                        Source: {isClass1(project.buildingClass) ? 'NCC Housing Provisions Part 9.2' : 'NCC C4D3'}
                      </p>
                    </div>

                    {/* Step 3: FRL determination */}
                    <div className="border-l-2 border-fire-300 pl-3">
                      <p className="text-xs font-semibold text-fire-700 uppercase tracking-wide mb-1">Step 3 — FRL Determination</p>
                      {complianceResult.wallNeedsFireResistance ? (
                        <>
                          <p className="text-sm text-slate-700">
                            Required FRL: <strong>{formatFRL(complianceResult.requiredWallFRL)}</strong>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isClass1(project.buildingClass)
                              ? 'Class 1 buildings require FRL 60/60/60 when tested from outside for any fire-resisting external wall.'
                              : `Looked up from NCC Specification 5 tables for Construction Type ${complianceResult.constructionType}, ${wall.isLoadbearing ? 'loadbearing' : 'non-loadbearing'} wall, at ${formatDistance(project.hasSprinklers ? wall.distanceToBoundary * 2 : wall.distanceToBoundary)} effective distance.`
                            }
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            FRL format: Structural Adequacy / Integrity / Insulation (minutes)
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-700">
                          No FRL required — wall is sufficiently far from the fire-source feature.
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1 italic">
                        Source: {isClass1(project.buildingClass) ? 'NCC Housing Provisions Part 9.2' : 'NCC Specification 5'}
                      </p>
                    </div>

                    {/* Step 4: Area calculations */}
                    <div className="border-l-2 border-fire-300 pl-3">
                      <p className="text-xs font-semibold text-fire-700 uppercase tracking-wide mb-1">Step 4 — Area Calculations</p>
                      <div className="text-xs text-slate-600 space-y-1 font-mono">
                        <p>Wall area = {wall.height}m x {wall.width}m = {formatArea(complianceResult.totalWallArea)}</p>
                        {openings.map(opening => (
                          <p key={opening.id}>
                            {opening.name} = {opening.width}m x {opening.height}m = {formatArea(opening.width * opening.height)}
                          </p>
                        ))}
                        {openings.length > 0 && (
                          <>
                            <p className="border-t border-slate-200 pt-1">Total openings = {formatArea(complianceResult.totalOpeningArea)}</p>
                            <p>Unprotected = {formatArea(complianceResult.unprotectedOpeningArea)}</p>
                            <p>Protected = {formatArea(complianceResult.protectedOpeningArea)}</p>
                            <p>Unprotected % = {formatArea(complianceResult.unprotectedOpeningArea)} / {formatArea(complianceResult.totalWallArea)} = {formatPercentage(complianceResult.unprotectedAreaPercentage)}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Step 5: Opening assessment */}
                    {complianceResult.openingResults.length > 0 && (
                      <div className="border-l-2 border-fire-300 pl-3">
                        <p className="text-xs font-semibold text-fire-700 uppercase tracking-wide mb-1">Step 5 — Opening Assessment</p>
                        {complianceResult.openingResults.map(result => (
                          <div key={result.openingId} className="text-xs text-slate-600 mb-2">
                            <p className="font-medium text-slate-700">{result.openingName}:</p>
                            <ul className="ml-3 space-y-0.5 mt-0.5">
                              <li>Protection required: {result.protectionRequired ? 'Yes' : 'No'}</li>
                              {result.protectionRequired && (
                                <li>Currently protected: {result.currentlyProtected ? 'Yes' : 'No'}</li>
                              )}
                              {result.protectionRequired && (
                                <li>Required: {result.requiredProtection}</li>
                              )}
                              {result.notes.map((note, i) => (
                                <li key={i}>{note}</li>
                              ))}
                              <li>Result: <strong className={result.compliant ? 'text-emerald-700' : 'text-red-700'}>{result.compliant ? 'PASS' : 'FAIL'}</strong></li>
                            </ul>
                          </div>
                        ))}
                        <p className="text-xs text-slate-400 mt-1 italic">
                          Source: {isClass1(project.buildingClass) ? 'NCC Housing Provisions Part 9.2' : 'NCC C4D5'}
                        </p>
                      </div>
                    )}

                    {/* NCC References summary */}
                    {complianceResult.nccReferences.length > 0 && (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">All NCC clauses referenced:</p>
                        <div className="flex flex-wrap gap-1">
                          {complianceResult.nccReferences.map((ref, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
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
