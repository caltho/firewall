import { useRef, useCallback } from 'react';
import { OpeningType } from '../../types/project';
import type { Opening } from '../../types/project';
import type { OpeningComplianceResult } from '../../types/compliance';

/** Opening with guaranteed position */
type PositionedOpening = Opening & { x: number; y: number };

interface WallDiagramProps {
  wallWidth: number;
  wallHeight: number;
  openings: PositionedOpening[];
  openingResults?: OpeningComplianceResult[];
  selectedOpeningId?: string | null;
  onWallClick?: () => void;
  onOpeningClick?: (openingId: string) => void;
}

const PADDING = 0.4; // meters of padding around wall for labels

/**
 * Convert a hex colour to a lighter fill variant (mix with white).
 */
function lightenColor(hex: string, amount: number = 0.8): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function getOpeningColors(opening: Opening, result?: OpeningComplianceResult) {
  const isCompliant = result?.compliant ?? true;

  if (!isCompliant) {
    return { fill: '#fee2e2', stroke: '#dc2626', strokeWidth: 0.03 };
  }

  // Use custom colour if set
  if (opening.color) {
    return { fill: lightenColor(opening.color), stroke: opening.color, strokeWidth: 0.02 };
  }

  switch (opening.type) {
    case OpeningType.Window:
      return { fill: '#dbeafe', stroke: '#3b82f6', strokeWidth: 0.02 };
    case OpeningType.Door:
      return { fill: '#fef3c7', stroke: '#d97706', strokeWidth: 0.02 };
    case OpeningType.GeneralOpening:
      return { fill: '#e5e7eb', stroke: '#6b7280', strokeWidth: 0.02 };
    default:
      return { fill: '#e5e7eb', stroke: '#6b7280', strokeWidth: 0.02 };
  }
}

function getOpeningIcon(type: OpeningType): string {
  switch (type) {
    case OpeningType.Window:
      return '\u25A1';
    case OpeningType.Door:
      return '\u25AF';
    case OpeningType.GeneralOpening:
      return '\u25CB';
    default:
      return '';
  }
}

export function WallDiagram({
  wallWidth,
  wallHeight,
  openings,
  openingResults,
  selectedOpeningId,
  onWallClick,
  onOpeningClick,
}: WallDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const viewBoxWidth = wallWidth + PADDING * 2;
  const viewBoxHeight = wallHeight + PADDING * 2;
  const wallX = PADDING;
  const wallY = PADDING;

  // Scale font sizes relative to the wall
  const baseFontSize = Math.max(0.08, Math.min(0.18, Math.min(wallWidth, wallHeight) * 0.04));
  const dimFontSize = baseFontSize * 1.1;

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Only fire if the click was directly on the SVG/wall, not on an opening
      if (e.target === e.currentTarget || (e.target as SVGElement).tagName === 'rect') {
        onWallClick?.();
      }
    },
    [onWallClick],
  );

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full border border-slate-200 rounded-lg bg-slate-50 select-none"
        style={{ maxHeight: '500px' }}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleSvgClick}
      >
        {/* Ground line */}
        <line
          x1={wallX - 0.1}
          y1={wallY + wallHeight}
          x2={wallX + wallWidth + 0.1}
          y2={wallY + wallHeight}
          stroke="#94a3b8"
          strokeWidth={0.03}
          strokeDasharray="0.08 0.04"
        />

        {/* Wall rectangle */}
        <rect
          x={wallX}
          y={wallY}
          width={wallWidth}
          height={wallHeight}
          fill="#f1f5f9"
          stroke="#334155"
          strokeWidth={0.03}
        />

        {/* Wall fill pattern - brick-like hatching */}
        <defs>
          <pattern id="wallPattern" x={wallX} y={wallY} width={0.4} height={0.2} patternUnits="userSpaceOnUse">
            <rect width={0.4} height={0.2} fill="none" stroke="#cbd5e1" strokeWidth={0.005} />
            <line x1={0.2} y1={0} x2={0.2} y2={0.1} stroke="#cbd5e1" strokeWidth={0.005} />
          </pattern>
          <marker id="dimArrow" viewBox="0 0 6 6" refX={3} refY={3} markerWidth={4} markerHeight={4} orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
          </marker>
        </defs>
        <rect x={wallX} y={wallY} width={wallWidth} height={wallHeight} fill="url(#wallPattern)" opacity={0.4} />

        {/* Width dimension label (top) */}
        <line
          x1={wallX}
          y1={wallY - 0.12}
          x2={wallX + wallWidth}
          y2={wallY - 0.12}
          stroke="#64748b"
          strokeWidth={0.01}
          markerStart="url(#dimArrow)"
          markerEnd="url(#dimArrow)"
        />
        <text
          x={wallX + wallWidth / 2}
          y={wallY - 0.18}
          textAnchor="middle"
          fontSize={dimFontSize}
          fill="#334155"
          fontWeight="600"
        >
          {wallWidth}m
        </text>

        {/* Height dimension label (left) */}
        <line
          x1={wallX - 0.12}
          y1={wallY}
          x2={wallX - 0.12}
          y2={wallY + wallHeight}
          stroke="#64748b"
          strokeWidth={0.01}
        />
        <text
          x={wallX - 0.18}
          y={wallY + wallHeight / 2}
          textAnchor="middle"
          fontSize={dimFontSize}
          fill="#334155"
          fontWeight="600"
          transform={`rotate(-90, ${wallX - 0.18}, ${wallY + wallHeight / 2})`}
        >
          {wallHeight}m
        </text>

        {/* Openings */}
        {openings.map((opening) => {
          const result = openingResults?.find((r) => r.openingId === opening.id);
          const colors = getOpeningColors(opening, result);
          const isSelected = opening.id === selectedOpeningId;
          const icon = getOpeningIcon(opening.type);

          const ox = wallX + opening.x;
          const oy = wallY + opening.y;

          // Scale label font to fit within the opening
          const labelFontSize = Math.max(0.06, Math.min(baseFontSize, opening.width * 0.14, opening.height * 0.14));
          const dimLabelFontSize = labelFontSize * 0.8;
          const showLabels = opening.width > 0.2 && opening.height > 0.15;

          return (
            <g
              key={opening.id}
              onClick={(e) => {
                e.stopPropagation();
                onOpeningClick?.(opening.id);
              }}
              className="cursor-pointer"
            >
              {/* Opening rectangle */}
              <rect
                x={ox}
                y={oy}
                width={opening.width}
                height={opening.height}
                fill={colors.fill}
                stroke={isSelected ? '#ea580c' : colors.stroke}
                strokeWidth={isSelected ? 0.04 : colors.strokeWidth}
                rx={0.02}
              />

              {/* Window crosshairs */}
              {opening.type === OpeningType.Window && (
                <>
                  <line
                    x1={ox + opening.width / 2}
                    y1={oy}
                    x2={ox + opening.width / 2}
                    y2={oy + opening.height}
                    stroke={colors.stroke}
                    strokeWidth={0.01}
                    opacity={0.5}
                  />
                  <line
                    x1={ox}
                    y1={oy + opening.height / 2}
                    x2={ox + opening.width}
                    y2={oy + opening.height / 2}
                    stroke={colors.stroke}
                    strokeWidth={0.01}
                    opacity={0.5}
                  />
                </>
              )}

              {/* Door swing arc */}
              {opening.type === OpeningType.Door && (
                <path
                  d={`M ${ox + 0.05} ${oy + opening.height} A ${opening.width * 0.6} ${opening.width * 0.6} 0 0 1 ${ox + opening.width * 0.6 + 0.05} ${oy + opening.height - opening.width * 0.3}`}
                  stroke={colors.stroke}
                  strokeWidth={0.01}
                  fill="none"
                  opacity={0.4}
                  strokeDasharray="0.04 0.02"
                />
              )}

              {showLabels && (
                <>
                  {/* Type icon + name */}
                  <text
                    x={ox + opening.width / 2}
                    y={oy + opening.height / 2 - dimLabelFontSize * 0.4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={labelFontSize}
                    fill="#1e293b"
                    fontWeight="500"
                  >
                    {icon} {opening.name}
                  </text>

                  {/* Dimensions */}
                  <text
                    x={ox + opening.width / 2}
                    y={oy + opening.height / 2 + labelFontSize * 0.8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={dimLabelFontSize}
                    fill="#64748b"
                  >
                    {opening.width}m x {opening.height}m
                  </text>
                </>
              )}

              {/* Compliance indicator in top-right */}
              {result && (
                <text
                  x={ox + opening.width - 0.06}
                  y={oy + 0.1}
                  fontSize={Math.max(0.08, labelFontSize * 0.9)}
                  textAnchor="middle"
                  fill={result.compliant ? '#16a34a' : '#dc2626'}
                  fontWeight="bold"
                >
                  {result.compliant ? '\u2713' : '\u2717'}
                </text>
              )}

              {/* Selected highlight */}
              {isSelected && (
                <rect
                  x={ox - 0.02}
                  y={oy - 0.02}
                  width={opening.width + 0.04}
                  height={opening.height + 0.04}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth={0.02}
                  strokeDasharray="0.06 0.03"
                  rx={0.03}
                  opacity={0.6}
                />
              )}
            </g>
          );
        })}

        {/* Click hint when no openings */}
        {openings.length === 0 && onWallClick && (
          <text
            x={wallX + wallWidth / 2}
            y={wallY + wallHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={baseFontSize * 1.2}
            fill="#94a3b8"
          >
            Click to add an opening
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500 print:text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-500 inline-block" />
          Window
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-600 inline-block" />
          Door
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-500 inline-block" />
          General
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-600 inline-block" />
          Non-compliant
        </div>
      </div>
    </div>
  );
}
