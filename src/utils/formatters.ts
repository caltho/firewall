import type { FRL } from '../types/ncc';

export function formatFRL(frl: FRL): string {
  const sa = frl.structuralAdequacy !== null ? String(frl.structuralAdequacy) : '-';
  const i = frl.integrity !== null ? String(frl.integrity) : '-';
  const ins = frl.insulation !== null ? String(frl.insulation) : '-';
  return `${sa}/${i}/${ins}`;
}

export function formatDistance(metres: number): string {
  if (metres < 1) {
    return `${Math.round(metres * 1000)}mm`;
  }
  return `${metres}m`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatArea(m2: number): string {
  return `${m2.toFixed(2)}m\u00B2`;
}

export function frlIsNone(frl: FRL): boolean {
  return (
    frl.structuralAdequacy === null &&
    frl.integrity === null &&
    frl.insulation === null
  );
}
