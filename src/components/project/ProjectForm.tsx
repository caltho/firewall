import { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { BUILDING_CLASS_INFO } from '../../constants/buildingClasses';
import { BuildingClass } from '../../types/ncc';

interface ProjectFormData {
  name: string;
  address: string;
  buildingClass: BuildingClass;
  riseInStoreys: number;
  hasSprinklers: boolean;
  notes: string;
}

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  initialData?: Partial<ProjectFormData>;
  title?: string;
}

const buildingClassOptions = BUILDING_CLASS_INFO.map(info => ({
  value: info.value,
  label: `${info.label} — ${info.description}`,
}));

export function ProjectForm({ isOpen, onClose, onSubmit, initialData, title = 'New Project' }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [buildingClass, setBuildingClass] = useState<BuildingClass>(initialData?.buildingClass ?? BuildingClass.Class1a);
  const [riseInStoreys, setRiseInStoreys] = useState(initialData?.riseInStoreys ?? 1);
  const [hasSprinklers, setHasSprinklers] = useState(initialData?.hasSprinklers ?? false);
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Project name is required';
    if (riseInStoreys < 1) newErrors.riseInStoreys = 'Must be at least 1';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      address: address.trim(),
      buildingClass,
      riseInStoreys,
      hasSprinklers,
      notes: notes.trim(),
    });

    // Reset form
    setName('');
    setAddress('');
    setBuildingClass(BuildingClass.Class1a);
    setRiseInStoreys(1);
    setHasSprinklers(false);
    setNotes('');
    setErrors({});
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Project</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g., 45 Smith Street Development"
        />
        <Input
          label="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="e.g., 45 Smith Street, Sydney NSW 2000"
        />
        <Select
          label="Building Class"
          options={buildingClassOptions}
          value={buildingClass}
          onChange={e => setBuildingClass(e.target.value as BuildingClass)}
        />
        <Input
          label="Rise in Storeys"
          type="number"
          min={1}
          max={100}
          value={riseInStoreys}
          onChange={e => setRiseInStoreys(parseInt(e.target.value) || 1)}
          error={errors.riseInStoreys}
          helpText="Number of storeys above ground"
        />
        <Checkbox
          label="Building has sprinkler system"
          checked={hasSprinklers}
          onChange={e => setHasSprinklers(e.target.checked)}
        />
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-fire-500"
            placeholder="Optional notes about the project..."
          />
        </div>
      </form>
    </Modal>
  );
}
