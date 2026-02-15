import { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { BoundaryType } from '../../types/ncc';
import { WallMaterial } from '../../types/project';

interface WallFormData {
  name: string;
  height: number;
  width: number;
  distanceToBoundary: number;
  boundaryType: BoundaryType;
  wallMaterial: WallMaterial;
  isLoadbearing: boolean;
}

interface WallFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WallFormData) => void;
  initialData?: Partial<WallFormData>;
  title?: string;
}

const boundaryTypeOptions = [
  { value: BoundaryType.SideRear, label: 'Side/Rear allotment boundary' },
  { value: BoundaryType.Road, label: 'Road, river, lake, or public space' },
  { value: BoundaryType.SameAllotment, label: 'Another building on same allotment' },
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

export function WallForm({ isOpen, onClose, onSubmit, initialData, title = 'Add Wall' }: WallFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [height, setHeight] = useState(initialData?.height ?? 3);
  const [width, setWidth] = useState(initialData?.width ?? 5);
  const [distanceToBoundary, setDistanceToBoundary] = useState(initialData?.distanceToBoundary ?? 1);
  const [boundaryType, setBoundaryType] = useState(initialData?.boundaryType ?? BoundaryType.SideRear);
  const [wallMaterial, setWallMaterial] = useState(initialData?.wallMaterial ?? WallMaterial.Brick);
  const [isLoadbearing, setIsLoadbearing] = useState(initialData?.isLoadbearing ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Wall name is required';
    if (height <= 0) newErrors.height = 'Must be positive';
    if (width <= 0) newErrors.width = 'Must be positive';
    if (distanceToBoundary < 0) newErrors.distanceToBoundary = 'Cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ name: name.trim(), height, width, distanceToBoundary, boundaryType, wallMaterial, isLoadbearing });

    if (!initialData) {
      setName('');
      setHeight(3);
      setWidth(5);
      setDistanceToBoundary(1);
      setBoundaryType(BoundaryType.SideRear);
      setWallMaterial(WallMaterial.Brick);
      setIsLoadbearing(true);
      setErrors({});
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Update' : 'Add Wall'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Wall Name"
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g., North Elevation, Wall A"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Height (m)"
            type="number"
            step="0.01"
            min="0.01"
            value={height}
            onChange={e => setHeight(parseFloat(e.target.value) || 0)}
            error={errors.height}
          />
          <Input
            label="Width (m)"
            type="number"
            step="0.01"
            min="0.01"
            value={width}
            onChange={e => setWidth(parseFloat(e.target.value) || 0)}
            error={errors.width}
          />
        </div>
        <Input
          label="Distance to Boundary (m)"
          type="number"
          step="0.01"
          min="0"
          value={distanceToBoundary}
          onChange={e => setDistanceToBoundary(parseFloat(e.target.value) || 0)}
          error={errors.distanceToBoundary}
          helpText="Measured at right angles from the wall to the fire-source feature"
        />
        <Select
          label="Boundary Type"
          options={boundaryTypeOptions}
          value={boundaryType}
          onChange={e => setBoundaryType(e.target.value as BoundaryType)}
        />
        <Select
          label="Wall Material"
          options={wallMaterialOptions}
          value={wallMaterial}
          onChange={e => setWallMaterial(e.target.value as WallMaterial)}
        />
        <Checkbox
          label="Wall is loadbearing"
          checked={isLoadbearing}
          onChange={e => setIsLoadbearing(e.target.checked)}
        />
      </form>
    </Modal>
  );
}
