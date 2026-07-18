import { useState } from 'react';
import { useI18n } from './i18n/I18nContext';
import { Segmented } from './components/Segmented';
import { TodayScreen } from './screens/TodayScreen';
import { TrainScreen } from './screens/TrainScreen';
import { MetronomeScreen } from './screens/MetronomeScreen';

type Tab = 'today' | 'train' | 'metronome';

export function App() {
  const { t, lang, setLang } = useI18n();
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <span className="app-brand">FretsToDo</span>
        <Segmented
          value={lang}
          onChange={setLang}
          options={[
            { value: 'es', label: 'ES' },
            { value: 'en', label: 'EN' },
          ]}
        />
      </header>

      <main className="app-content">
        {tab === 'today' ? <TodayScreen /> : null}
        {tab === 'train' ? <TrainScreen /> : null}
        {tab === 'metronome' ? <MetronomeScreen /> : null}
      </main>

      <nav className="app-tabbar">
        <button type="button" className="app-tab" data-active={tab === 'today'} onClick={() => setTab('today')}>
          {t.nav.today}
        </button>
        <button type="button" className="app-tab" data-active={tab === 'train'} onClick={() => setTab('train')}>
          {t.nav.train}
        </button>
        <button
          type="button"
          className="app-tab"
          data-active={tab === 'metronome'}
          onClick={() => setTab('metronome')}
        >
          {t.nav.metronome}
        </button>
      </nav>
    </div>
  );
}
