import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { MetronomeScreen } from './MetronomeScreen';
import { TunerScreen } from './TunerScreen';

type ToolId = 'hub' | 'metro' | 'tuner';

interface ToolsScreenProps {
  /** Herramienta inicial al entrar (p. ej. desde una tarea de la rutina). */
  initial?: ToolId;
}

export function ToolsScreen({ initial = 'hub' }: ToolsScreenProps) {
  const { t } = useI18n();
  const [tool, setTool] = useState<ToolId>(initial);

  if (tool === 'metro') return <MetronomeScreen onBack={() => setTool('hub')} />;
  if (tool === 'tuner') return <TunerScreen onBack={() => setTool('hub')} />;

  return (
    <section className="screen">
      <div className="eyebrow">{t.tab_tools}</div>
      <div className="hub-list">
        <button className="hub-card" onClick={() => setTool('metro')}>
          <div className="hub-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 20 L10 5 H14 L16 20 Z" />
              <line x1="12" y1="16" x2="16.5" y2="7" />
            </svg>
          </div>
          <div className="hub-body">
            <div className="hub-title">{t.tab_metro}</div>
            <div className="hub-sub">{t.tool_metro_sub}</div>
          </div>
          <span className="hub-arrow">→</span>
        </button>

        <button className="hub-card" onClick={() => setTool('tuner')}>
          <div className="hub-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="12" y1="3" x2="12" y2="9" />
              <circle cx="12" cy="14" r="6" />
              <line x1="12" y1="14" x2="15.5" y2="10.5" />
            </svg>
          </div>
          <div className="hub-body">
            <div className="hub-title">{t.tool_tuner}</div>
            <div className="hub-sub">{t.tool_tuner_sub}</div>
          </div>
          <span className="hub-arrow">→</span>
        </button>
      </div>
    </section>
  );
}
