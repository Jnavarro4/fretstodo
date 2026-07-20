import { INTERVALS } from '../engine/intervalEngine';
import { POSITIONS } from '../engine/pentatonicEngine';
import { useI18n } from '../i18n/I18nContext';
import type { SkillStats } from '../types';

interface ProgressScreenProps {
  stats: SkillStats;
}

/**
 * Semilla del módulo de Estadísticas / FretScore del documento maestro:
 * convierte la práctica registrada en información para decidir qué estudiar.
 * Regla visual: barras Orange Tiger, números siempre en blanco.
 */
export function ProgressScreen({ stats }: ProgressScreenProps) {
  const { t } = useI18n();

  const hasData = stats.exercises > 0 || stats.sessions > 0;

  const intervalMax = Math.max(1, ...INTERVALS.map((iv) => stats.intervals[iv.id] ?? 0));
  const pentaMax = Math.max(1, ...POSITIONS.map((p) => stats.penta[String(p)] ?? 0));

  return (
    <section className="screen">
      <div className="eyebrow">{t.prog_totals}</div>
      <div className="stat-row">
        <div className="stat">
          <b>{stats.sessions}</b>
          <span>{t.prog_sessions}</span>
        </div>
        <div className="stat">
          <b>{Math.floor(stats.seconds / 60)}</b>
          <span>{t.prog_minutes}</span>
        </div>
        <div className="stat">
          <b>{stats.exercises}</b>
          <span>{t.prog_exercises}</span>
        </div>
      </div>

      {!hasData && <p className="prog-empty">{t.prog_empty}</p>}

      {hasData && (
        <>
          <div className="eyebrow">{t.prog_intervals}</div>
          <div className="skill-list">
            {INTERVALS.map((iv) => {
              const n = stats.intervals[iv.id] ?? 0;
              return (
                <div key={iv.id} className="skill-row">
                  <span className="skill-name">{t.intervals[iv.id]}</span>
                  <div className="skill-bar">
                    <i style={{ width: `${(n / intervalMax) * 100}%` }} />
                  </div>
                  <span className="skill-count">{n}</span>
                </div>
              );
            })}
          </div>

          <div className="eyebrow">{t.prog_positions}</div>
          <div className="skill-list">
            {POSITIONS.map((pos) => {
              const n = stats.penta[String(pos)] ?? 0;
              return (
                <div key={pos} className="skill-row">
                  <span className="skill-name">{t.position(pos)}</span>
                  <div className="skill-bar">
                    <i style={{ width: `${(n / pentaMax) * 100}%` }} />
                  </div>
                  <span className="skill-count">{n}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
