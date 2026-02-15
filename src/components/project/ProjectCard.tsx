import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getBuildingClassInfo } from '../../constants/buildingClasses';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  wallCount: number;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, wallCount, onDelete }: ProjectCardProps) {
  const classInfo = getBuildingClassInfo(project.buildingClass);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <Link
              to={`/project/${project.id}`}
              className="text-lg font-semibold text-slate-900 hover:text-fire-600 transition-colors"
            >
              {project.name}
            </Link>
            {project.address && (
              <p className="text-sm text-slate-500 mt-0.5">{project.address}</p>
            )}
          </div>
          <Badge variant="info">
            {classInfo?.label ?? `Class ${project.buildingClass}`}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span>{wallCount} wall{wallCount !== 1 ? 's' : ''}</span>
          <span>{project.riseInStoreys} storey{project.riseInStoreys !== 1 ? 's' : ''}</span>
          {project.hasSprinklers && <Badge variant="compliant">Sprinklered</Badge>}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/project/${project.id}`}
          className="text-sm font-medium text-fire-600 hover:text-fire-700"
        >
          Open Project
        </Link>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(project.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
