import './Business.css';
import type { GameState } from '../types';
import { startBusiness, upgradeBusiness, hireEmployee, sellBusiness } from '../game/engine';
import { BUSINESSES_LIST } from '../types';

interface BusinessProps {
  state: GameState;
  setState: (s: GameState) => void;
}

function formatMoney(n: number) {
  if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

export default function Business({ state, setState }: BusinessProps) {
  const totalDailyProfit = state.businesses.reduce((a, b) => a + b.dailyProfit, 0);

  return (
    <div className="business-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>🏪 Бизнес-империя</h2>
        <div className="card" style={{ padding: '10px 16px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.8 }}>Доход в день</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-green)' }}>
            +{formatMoney(totalDailyProfit)}/day
          </div>
        </div>
      </div>

      <div className="card">
        <span className="section-title">Ваш бизнес</span>
        {state.businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>🏪</div>
              <p>Нет бизнеса</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Откройте своё первое дело!</p>
          </div>
        ) : (
          <div className="owned-biz-list">
            {state.businesses.map(b => (
              <div key={b.id} className="owned-biz-item">
                <div className="b-left">
                  <span className="b-owned-name">{b.name}</span>
                  <span className="b-owned-details">
                    Level {b.level} &middot; {b.employees} сотрудников &middot; Реп: {b.reputation}%
                    {' • '}<span className="text-green">+{formatMoney(b.dailyProfit)}/day</span>
                  </span>
                </div>
                <div className="b-right">
                  <div className="b-owned-value">{formatMoney(b.value)}</div>
                  <div className="b-owned-actions">
                    <button className="btn-primary btn-sm" onClick={() => setState(upgradeBusiness(state, b.id))} disabled={state.cash < b.level * 10000 || state.actionPoints < 1}>Улучшить ${(b.level * 10000).toLocaleString()}</button>
                    <button className="btn-ghost btn-sm" onClick={() => setState(hireEmployee(state, b.id))} disabled={state.actionPoints < 1}>Нанять $5K</button>
                    <button className="btn-danger btn-sm" onClick={() => { if (confirm(`Продать ${b.name} за ${formatMoney(Math.round(b.value * 0.6))}?`)) setState(sellBusiness(state, b.id)); }} disabled={state.actionPoints < 1}>Продать</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <span className="section-title">Открыть новый бизнес</span>
        <div className="business-grid">
          {BUSINESSES_LIST.map((b, idx) => (
            <div key={idx} className="business-card">
              <span className="b-type">{b.type}</span>
              <div className="b-name">{b.name}</div>
              <div className="b-cost">{formatMoney(b.investment)}</div>
              <div className="b-profit">✦ +{formatMoney(b.dailyProfit)}/day</div>
              <button
                className="btn-success"
                onClick={() => setState(startBusiness(state, idx))}
                disabled={state.cash + state.checking < b.investment || state.actionPoints < 2}
                style={{ opacity: state.cash + state.checking < b.investment ? 0.5 : 1 }}
              >
                {state.cash + state.checking >= b.investment ? 'Запустить' : 'Нужно ' + formatMoney(b.investment - state.cash - state.checking)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
