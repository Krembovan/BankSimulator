import { useState } from 'react';
import './Sidebar.css';
import { getNetWorth } from '../game/events';
import type { GameState } from '../types';
import { openReportIssue } from '../game/report';
import { MAX_ACTIONS } from '../game/engine';

interface SidebarProps {
  state: GameState;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdvanceDay: () => void;
  onRestart: () => void;
  onShowTutorial: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Панель', icon: '📊' },
  { id: 'profile', label: 'Карьера', icon: '💼' },
  { id: 'bank', label: 'Банк', icon: '🏦' },
  { id: 'stocks', label: 'Акции', icon: '📈' },
  { id: 'crypto', label: 'Крипта', icon: '₿' },
  { id: 'realestate', label: 'Недвижимость', icon: '🏠' },
  { id: 'vehicles', label: 'Авто', icon: '🚗' },
  { id: 'business', label: 'Бизнес', icon: '🏪' },
  { id: 'shadow', label: 'Тень', icon: '🕶️' },
];

export default function Sidebar({ state, activeTab, onTabChange, onAdvanceDay, onRestart, onShowTutorial }: SidebarProps) {
  const [showReport, setShowReport] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [reportText, setReportText] = useState('');

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <div className="topnav-left">
          <div className="topnav-logo" onClick={() => onTabChange('dashboard')}>
            <div className="topnav-logo-icon">B</div>
            <span className="topnav-logo-text">BankSim</span>
          </div>

          <div className="topnav-items">
            {NAV_ITEMS.slice(0, 6).map(item => (
              <button
                key={item.id}
                className={`topnav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                <span className="topnav-item-icon">{item.icon}</span>
                <span className="topnav-item-label">{item.label}</span>
              </button>
            ))}
            <div className="topnav-more-wrap">
              <button className={`topnav-item ${showMore ? 'active' : ''}`} onClick={() => setShowMore(!showMore)}>
                <span className="topnav-item-label">...</span>
              </button>
              {showMore && (
                <div className="topnav-dropdown">
                  {NAV_ITEMS.slice(6).map(item => (
                    <button
                      key={item.id}
                      className={`topnav-dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => { onTabChange(item.id); setShowMore(false); }}
                    >
                      <span className="topnav-item-icon">{item.icon}</span>
                      <span className="topnav-item-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="topnav-right">
          <div className="topnav-indicators">
            <div className="topnav-indicator">
              <span className="topnav-indicator-dot" />
              <span>День {state.day}</span>
            </div>
            <div className="topnav-divider" />
            <div className="topnav-indicator" style={{ color: 'rgba(250,204,21,0.9)' }}>
              ⚡ {state.actionPoints}/{MAX_ACTIONS} действий
            </div>
            <div className="topnav-indicator" style={{ color: 'var(--accent-green)' }}>
              💰 {(() => { const n = getNetWorth(state); return n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? '$' + (n / 1_000).toFixed(1) + 'K' : '$' + n.toLocaleString(); })()}
            </div>
          </div>

          <button className="topnav-day-btn" onClick={onAdvanceDay}>
            ▶ Следующий день
          </button>

          <div className="topnav-actions">
            <button className="topnav-action-btn" onClick={() => setShowRestartConfirm(true)} title="Сброс">🔄</button>
            <button className="topnav-action-btn" onClick={() => setShowReport(!showReport)} title="Баг-репорт">🐛</button>
            <button className="topnav-action-btn" onClick={onShowTutorial} title="Обучение">❓</button>
          </div>
        </div>
      </div>

      {showReport && (
        <div className="topnav-report">
          <textarea
            className="topnav-report-input"
            placeholder="Опишите баг..."
            rows={2}
            value={reportText}
            onChange={e => setReportText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-primary btn-sm" onClick={() => { openReportIssue(reportText); setReportText(''); setShowReport(false); }} disabled={!reportText.trim()}>Отправить</button>
            <button className="btn-ghost btn-sm" onClick={() => setShowReport(false)}>Отмена</button>
          </div>
        </div>
      )}

      {showRestartConfirm && (
        <div className="topnav-overlay" onClick={() => setShowRestartConfirm(false)}>
          <div className="topnav-confirm" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Начать новую игру? Весь прогресс будет потерян!</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn-danger btn-sm" onClick={() => { onRestart(); setShowRestartConfirm(false); }}>Да, сбросить</button>
              <button className="btn-ghost btn-sm" onClick={() => setShowRestartConfirm(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
