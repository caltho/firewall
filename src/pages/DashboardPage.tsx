import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { ProjectCard } from '../components/project/ProjectCard';
import { ProjectForm } from '../components/project/ProjectForm';
import { generateId } from '../utils/ids';
import type { BuildingClass } from '../types/ncc';

export function DashboardPage() {
  const { state, dispatch } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  const projects = Object.values(state.projects).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  function handleCreateProject(data: {
    name: string;
    address: string;
    buildingClass: BuildingClass;
    riseInStoreys: number;
    hasSprinklers: boolean;
    notes: string;
  }) {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_PROJECT',
      payload: {
        id: generateId(),
        ...data,
        wallIds: [],
        createdAt: now,
        updatedAt: now,
      },
    });
    setShowForm(false);
  }

  function handleDeleteProject(id: string) {
    if (window.confirm('Delete this project and all its wall assessments?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fire safety boundary distance assessments
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-4">🏗️</div>
          <h2 className="text-lg font-semibold text-slate-900">No projects yet</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Create your first project to start assessing wall compliance.
          </p>
          <Button onClick={() => setShowForm(true)}>Create First Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              wallCount={project.wallIds.length}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      <ProjectForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
