import { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { OpeningType, GlassType, DoorType } from '../../types/project';
import type { Opening, WindowDetails, DoorDetails, GeneralOpeningDetails } from '../../types/project';

interface OpeningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Opening, 'id' | 'wallId'>) => void;
  initialData?: Opening;
}

const openingTypeOptions = [
  { value: OpeningType.Window, label: 'Window' },
  { value: OpeningType.Door, label: 'Door' },
  { value: OpeningType.GeneralOpening, label: 'General Opening (vent, penetration, etc.)' },
];

const glassTypeOptions = [
  { value: GlassType.Standard, label: 'Standard' },
  { value: GlassType.Tempered, label: 'Tempered' },
  { value: GlassType.Laminated, label: 'Laminated' },
  { value: GlassType.WiredGlass, label: 'Wired Glass' },
  { value: GlassType.FireRated, label: 'Fire Rated' },
  { value: GlassType.HollowGlassBlock, label: 'Hollow Glass Block' },
];

const doorTypeOptions = [
  { value: DoorType.Standard, label: 'Standard' },
  { value: DoorType.SolidCore, label: 'Solid Core' },
  { value: DoorType.FireDoor, label: 'Fire Door' },
  { value: DoorType.Hollow, label: 'Hollow Core' },
];

const roomTypeOptions = [
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'toilet', label: 'Toilet' },
  { value: 'other', label: 'Other non-habitable' },
];

export function OpeningForm({ isOpen, onClose, onSubmit, initialData }: OpeningFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState<OpeningType>(initialData?.type ?? OpeningType.Window);
  const [width, setWidth] = useState(initialData?.width ?? 1.2);
  const [height, setHeight] = useState(initialData?.height ?? 1.5);

  // Window fields
  const initWindow = initialData?.details.type === 'window' ? initialData.details : null;
  const [glassType, setGlassType] = useState(initWindow?.glassType ?? GlassType.Standard);
  const [glassThickness, setGlassThickness] = useState(initWindow?.glassThickness ?? 6);
  const [isFireRatedWindow, setIsFireRatedWindow] = useState(initWindow?.isFireRated ?? false);
  const [isOpenable, setIsOpenable] = useState(initWindow?.isOpenable ?? true);
  const [isInHabitableRoom, setIsInHabitableRoom] = useState(initWindow?.isInHabitableRoom ?? true);
  const [roomType, setRoomType] = useState<'bathroom' | 'laundry' | 'toilet' | 'other'>(initWindow?.roomType ?? 'other');

  // Door fields
  const initDoor = initialData?.details.type === 'door' ? initialData.details : null;
  const [doorType, setDoorType] = useState(initDoor?.doorType ?? DoorType.Standard);
  const [isFireDoor, setIsFireDoor] = useState(initDoor?.isFireDoor ?? false);
  const [isSelfClosing, setIsSelfClosing] = useState(initDoor?.isSelfClosing ?? false);
  const [doorThickness, setDoorThickness] = useState(initDoor?.thickness ?? 40);

  // General opening fields
  const initGeneral = initialData?.details.type === 'general_opening' ? initialData.details : null;
  const [description, setDescription] = useState(initGeneral?.description ?? '');
  const [isExempt, setIsExempt] = useState(initGeneral?.isExempt ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (width <= 0) newErrors.width = 'Must be positive';
    if (height <= 0) newErrors.height = 'Must be positive';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let details: WindowDetails | DoorDetails | GeneralOpeningDetails;

    switch (type) {
      case OpeningType.Window:
        details = {
          type: 'window',
          glassType,
          glassThickness,
          isFireRated: isFireRatedWindow,
          isOpenable,
          isInHabitableRoom,
          roomType: isInHabitableRoom ? undefined : roomType,
        };
        break;
      case OpeningType.Door:
        details = {
          type: 'door',
          doorType,
          isFireDoor,
          isSelfClosing,
          thickness: doorThickness,
        };
        break;
      case OpeningType.GeneralOpening:
        details = {
          type: 'general_opening',
          description: description.trim(),
          isExempt,
        };
        break;
    }

    onSubmit({
      type,
      name: name.trim(),
      width,
      height,
      details,
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Opening' : 'Add Opening'}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Update' : 'Add Opening'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g., Kitchen Window, Front Door"
        />
        <Select
          label="Type"
          options={openingTypeOptions}
          value={type}
          onChange={e => setType(e.target.value as OpeningType)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Width (m)"
            type="number"
            step="0.01"
            min="0.01"
            value={width}
            onChange={e => setWidth(parseFloat(e.target.value) || 0)}
            error={errors.width}
          />
          <Input
            label="Height (m)"
            type="number"
            step="0.01"
            min="0.01"
            value={height}
            onChange={e => setHeight(parseFloat(e.target.value) || 0)}
            error={errors.height}
          />
        </div>

        {/* Type-specific fields */}
        {type === OpeningType.Window && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <h4 className="text-sm font-medium text-slate-700">Window Details</h4>
            <Select
              label="Glass Type"
              options={glassTypeOptions}
              value={glassType}
              onChange={e => setGlassType(e.target.value as GlassType)}
            />
            <Input
              label="Glass Thickness (mm)"
              type="number"
              min={1}
              value={glassThickness}
              onChange={e => setGlassThickness(parseInt(e.target.value) || 6)}
            />
            <Checkbox
              label="Fire-rated glazing"
              checked={isFireRatedWindow}
              onChange={e => setIsFireRatedWindow(e.target.checked)}
            />
            <Checkbox
              label="Window is openable"
              checked={isOpenable}
              onChange={e => setIsOpenable(e.target.checked)}
            />
            <Checkbox
              label="In a habitable room"
              checked={isInHabitableRoom}
              onChange={e => setIsInHabitableRoom(e.target.checked)}
            />
            {!isInHabitableRoom && (
              <Select
                label="Room Type"
                options={roomTypeOptions}
                value={roomType}
                onChange={e => setRoomType(e.target.value as typeof roomType)}
              />
            )}
          </div>
        )}

        {type === OpeningType.Door && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <h4 className="text-sm font-medium text-slate-700">Door Details</h4>
            <Select
              label="Door Type"
              options={doorTypeOptions}
              value={doorType}
              onChange={e => setDoorType(e.target.value as DoorType)}
            />
            <Input
              label="Door Thickness (mm)"
              type="number"
              min={1}
              value={doorThickness}
              onChange={e => setDoorThickness(parseInt(e.target.value) || 40)}
            />
            <Checkbox
              label="Fire door"
              checked={isFireDoor}
              onChange={e => setIsFireDoor(e.target.checked)}
            />
            <Checkbox
              label="Self-closing mechanism"
              checked={isSelfClosing}
              onChange={e => setIsSelfClosing(e.target.checked)}
            />
          </div>
        )}

        {type === OpeningType.GeneralOpening && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <h4 className="text-sm font-medium text-slate-700">Opening Details</h4>
            <Input
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Subfloor vent, pipe penetration"
            />
            <Checkbox
              label="Exempt opening (subfloor vent, weephole, etc.)"
              checked={isExempt}
              onChange={e => setIsExempt(e.target.checked)}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
