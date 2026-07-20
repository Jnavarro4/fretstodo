import type { PentaBox } from '../engine/pentatonicEngine';

interface FretboardDiagramProps {
  box: PentaBox;
  /** Notas ya tocadas en modo Escúchame (se pintan verdes). */
  playedMidis?: Set<number>;
  /** Nota sonando ahora mismo (halo verde brillante). */
  activeMidi?: number | null;
}

const STRING_GAP = 21;
const FRET_W = 56;
const TOP = 16;
const LEFT = 34;

/**
 * Diagrama de diapasón con la caja del ejercicio.
 * Naranja = nota por tocar · Verde = nota tocada · Halo = sonando ahora.
 * Las tónicas llevan un anillo blanco para no perder la referencia.
 */
export function FretboardDiagram({ box, playedMidis, activeMidi }: FretboardDiagramProps) {
  const fStart = box.minFret <= 1 ? 0 : box.minFret - 1;
  const fEnd = box.maxFret + 1;
  const cols = fEnd - fStart;

  const width = LEFT + cols * FRET_W + 14;
  const height = TOP + 5 * STRING_GAP + 34;

  const fretX = (j: number) => LEFT + j * FRET_W;
  const noteX = (fret: number) =>
    fret === 0 ? LEFT - 16 : LEFT + (fret - fStart - 0.5) * FRET_W;
  const stringY = (stringNum: number) => TOP + (stringNum - 1) * STRING_GAP;

  return (
    <div className="fret-diagram" aria-hidden="true">
      <svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        {/* Cuerdas (1 arriba, 6 abajo) */}
        {[1, 2, 3, 4, 5, 6].map((sn) => (
          <line
            key={sn}
            x1={LEFT}
            y1={stringY(sn)}
            x2={LEFT + cols * FRET_W}
            y2={stringY(sn)}
            stroke="var(--line)"
            strokeWidth={0.8 + sn * 0.28}
          />
        ))}
        {/* Trastes */}
        {Array.from({ length: cols + 1 }, (_, j) => (
          <line
            key={j}
            x1={fretX(j)}
            y1={TOP}
            x2={fretX(j)}
            y2={stringY(6)}
            stroke={fStart === 0 && j === 0 ? 'var(--text-2)' : 'var(--line)'}
            strokeWidth={fStart === 0 && j === 0 ? 4 : 1.4}
          />
        ))}
        {/* Números de traste */}
        {Array.from({ length: cols }, (_, j) => (
          <text
            key={j}
            x={LEFT + (j + 0.5) * FRET_W}
            y={height - 10}
            textAnchor="middle"
            fill="var(--text-2)"
            fontSize="11"
            fontFamily="var(--font-body)"
          >
            {fStart + j + 1}
          </text>
        ))}
        {/* Notas de la caja */}
        {box.dots.map((d, i) => {
          const isActive = activeMidi === d.midi;
          const isPlayed = playedMidis?.has(d.midi) ?? false;
          const fill = isActive || isPlayed ? 'var(--green)' : 'var(--tiger)';
          const cx = noteX(d.fret);
          const cy = stringY(7 - d.string);
          return (
            <g key={i}>
              {isActive && <circle cx={cx} cy={cy} r={14.5} fill="var(--green)" opacity={0.28} />}
              <circle
                cx={cx}
                cy={cy}
                r={d.fret === 0 ? 6.5 : isActive ? 9.5 : 8}
                fill={fill}
                stroke={d.isRoot ? '#FFFFFF' : 'none'}
                strokeWidth={d.isRoot ? 2 : 0}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
