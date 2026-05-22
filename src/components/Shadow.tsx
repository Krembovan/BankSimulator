import { useState } from 'react';
import './Shadow.css';
import type { GameState } from '../types';
import { SHADOW_JOBS, BLACK_MARKET_ITEMS, SIDE_HUSTLES } from '../types';
import { startShadowJob, stopShadowJob, launderMoney } from '../game/engine';

interface ShadowProps {
  state: GameState;
  setState: (s: GameState) => void;
}

function formatMoney(n: number) {
  if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

export default function Shadow({ state, setState }: ShadowProps) {
  const [launderAmt, setLaunderAmt] = useState('');

  const riskColor = state.riskLevel < 30 ? 'var(--accent-green)' : state.riskLevel < 60 ? 'var(--accent-amber)' : 'var(--accent-red)';
  const riskLabel = state.riskLevel < 30 ? 'Низкий' : state.riskLevel < 60 ? 'Средний' : 'Высокий';

  const doLaunder = () => {
    const amt = parseInt(launderAmt);
    if (isNaN(amt) || amt <= 0) return;
    setState(launderMoney(state, amt));
    setLaunderAmt('');
  };

  return (
    <div className="shadow-view">
      <h2 className="gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>🕶️ Теневые схемы</h2>

      <div className="shadow-grid">
        <div className="card">
          <span className="section-title">Уровень риска</span>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Риск</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: riskColor }}>{state.riskLevel}% — {riskLabel}</span>
            </div>
            <div className="risk-bar-bg">
              <div className="risk-bar-fill" style={{ width: `${state.riskLevel}%`, background: riskColor }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {state.riskLevel >= 80 ? '🚨 Вас ищут! Риск полицейского рейда очень высок!' :
               state.riskLevel >= 50 ? '⚠️ За вами могут следить. Будьте осторожны.' :
               '👀 Всё чисто. Риск минимален.'}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <span className="section-title">Грязные деньги</span>
            <div className="dirty-cash-display">
              <span className="dirty-cash-value" style={{ color: 'var(--accent-amber)' }}>{formatMoney(state.dirtyCash)}</span>
              <span className="dirty-cash-label">нелегальных средств</span>
            </div>
          </div>
        </div>

        <div className="card">
          <span className="section-title">🧼 Отмыв денег</span>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0' }}>
            Конвертируйте грязные деньги в чистые через подставные схемы.<br />
            <strong>Комиссия: 30%</strong>. Чем больше отмываете — тем быстрее падает риск.
          </div>
          <div className="bank-actions" style={{ flexDirection: 'row', gap: 8 }}>
            <input
              type="number"
              placeholder="Сумма"
              value={launderAmt}
              onChange={e => setLaunderAmt(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn-warning btn-sm" onClick={doLaunder} disabled={!state.dirtyCash}>
              {state.dirtyCash > 0 ? 'Отмыть' : 'Нечего мыть'}
            </button>
          </div>
          {state.dirtyCash > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0' }}>
              После комиссии: {formatMoney(Math.round(parseInt(launderAmt || '0') * 0.7))} чистых
            </div>
          )}
        </div>
      </div>

      <div className="shadow-grid">
        <div className="card">
          <span className="section-title">🕶️ Теневые дела</span>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            Незаконный заработок. Каждый день приносит доход, но увеличивает риск.
          </div>

          {state.shadowJob ? (
            <div className="current-job-card" style={{ marginBottom: 12 }}>
              <div className="job-left">
                <div className="job-title" style={{ color: 'var(--accent-red)' }}>{state.shadowJob.name}</div>
                <div className="job-req">+${state.shadowJob.dailyIncome}/день · риск +{state.shadowJob.riskPerDay}/день · {state.shadowJob.daysActive} дней</div>
              </div>
              <div className="job-right">
                <button className="btn-danger btn-sm" onClick={() => setState(stopShadowJob(state))}>Завязать</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SHADOW_JOBS.map((job, i) => (
                <div key={i} className="job-list-item">
                  <div className="jli-left">
                    <span className="jli-title">{job.name}</span>
                    <span className="jli-req">${job.income}/день · риск +{job.risk}</span>
                  </div>
                  <div className="jli-right">
                    <button className="btn-danger btn-sm" onClick={() => setState(startShadowJob(state, i))}>Начать</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <span className="section-title">🏴 Чёрный рынок</span>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            Товары с дисконтом. Без вопросов, но только за наличные.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BLACK_MARKET_ITEMS.map((item, i) => (
              <div key={i} className="job-list-item">
                <div className="jli-left">
                  <span className="jli-title">{item.name}</span>
                  <span className="jli-req">{formatMoney(item.price)} · реальная цена {formatMoney(item.cleanPrice)}</span>
                </div>
                <div className="jli-right">
                  <span style={{ fontSize: 11, color: 'var(--accent-green)' }}>
                    −{Math.round((1 - item.price / item.cleanPrice) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(127, 29, 29, 0.2)', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            💡 Чёрный рынок временно недоступен. Ищите контакты через теневые дела.
          </div>
        </div>
      </div>
    </div>
  );
}
