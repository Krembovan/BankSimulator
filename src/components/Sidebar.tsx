import { useState } from 'react';
import './Sidebar.css';
import { getNetWorth } from '../game/events';
import type { GameState } from '../types';
import { openReportIssue } from '../game/report';

interface SidebarProps {
  state: GameState;
  activeTab: string;
  onTabChange: (tab: string) => void;
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

export default function Sidebar({ state, activeTab, onTabChange, onRestart, onShowTutorial }: SidebarProps) {
  const [showReport, setShowReport] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [reportText, setReportText] = useState('');
  const nw = getNetWorth(state);
  const formatMoney = (n: number) => {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🏦</div>
          <span className="logo-text">BankSim</span>
        </div>
        <div className="subtitle">Строитель империи</div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="day-display">
          📅 День <span className="day-num">{state.day}</span>
          <div className="sb-btn-group">
            <button className="sb-text-btn sb-restart-btn" onClick={() => setShowRestartConfirm(true)}>🔄 Сброс</button>
            <button className="sb-text-btn sb-report-btn" onClick={() => setShowReport(!showReport)}>🐛 Баг</button>
            <button className="sb-text-btn sb-tutorial-btn" onClick={onShowTutorial}>❓</button>
          </div>
        </div>
        {showReport && (
          <div className="sb-report-inline">
            <textarea
              className="sb-report-input"
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
          <div className="sb-restart-confirm">
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Начать новую игру? Весь прогресс будет потерян!</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button className="btn-danger btn-sm" onClick={() => { onRestart(); setShowRestartConfirm(false); }}>Да, сбросить</button>
              <button className="btn-ghost btn-sm" onClick={() => setShowRestartConfirm(false)}>Отмена</button>
            </div>
          </div>
        )}
        <div className="nw-preview">
          <div className="label">Капитал</div>
          <div className="value">{formatMoney(nw)}</div>
        </div>
      </div>
    </div>
  );
}
