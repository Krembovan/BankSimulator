import { useState } from 'react';
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

const BUY_STEPS = [
  { label: '📋 Заполнить заявление на регистрацию', cost: 0, ap: 1 },
  { label: '📝 Подписать учредительные документы', cost: 0, ap: 1 },
  { label: '🏛️ Оплатить госпошлину и получить лицензию', cost: 500, ap: 1 },
];

const UPGRADE_STEPS = [
  { label: '📋 Подать заявку на расширение', cost: 0, ap: 1 },
  { label: '✅ Получить разрешение надзорных органов', cost: 0, ap: 1 },
];

export default function Business({ state, setState }: BusinessProps) {
  const totalDailyProfit = state.businesses.reduce((a, b) => a + b.dailyProfit, 0);

  const [paperBuyIdx, setPaperBuyIdx] = useState<number | null>(null);
  const [paperBuyStep, setPaperBuyStep] = useState(0);

  const [paperUpgradeId, setPaperUpgradeId] = useState<number | null>(null);
  const [paperUpgradeStep, setPaperUpgradeStep] = useState(0);

  const handleStartPaperwork = (bizIdx: number) => {
    setPaperBuyIdx(bizIdx);
    setPaperBuyStep(0);
  };

  const handleDoPaperStep = () => {
    if (paperBuyIdx === null) return;
    const step = BUY_STEPS[paperBuyStep];
    if (state.actionPoints < step.ap || state.cash < step.cost) return;
    const applied = { ...state, cash: state.cash - step.cost, actionPoints: state.actionPoints - step.ap };
    if (paperBuyStep + 1 >= BUY_STEPS.length) {
      setState(startBusiness(applied, paperBuyIdx));
      setPaperBuyIdx(null);
      setPaperBuyStep(0);
    } else {
      setState(applied);
      setPaperBuyStep(s => s + 1);
    }
  };

  const handleStartUpgradePaperwork = (bizId: number) => {
    setPaperUpgradeId(bizId);
    setPaperUpgradeStep(0);
  };

  const handleDoUpgradeStep = () => {
    if (paperUpgradeId === null) return;
    const step = UPGRADE_STEPS[paperUpgradeStep];
    if (state.actionPoints < step.ap) return;
    const applied = { ...state, actionPoints: state.actionPoints - step.ap };
    if (paperUpgradeStep + 1 >= UPGRADE_STEPS.length) {
      setState(upgradeBusiness(applied, paperUpgradeId));
      setPaperUpgradeId(null);
      setPaperUpgradeStep(0);
    } else {
      setState(applied);
      setPaperUpgradeStep(s => s + 1);
    }
  };

  const cancelPaperwork = () => {
    let restored = { ...state };
    if (paperBuyIdx !== null) {
      const refund = BUY_STEPS.slice(0, paperBuyStep).reduce((a, s) => a + s.cost, 0);
      restored = { ...restored, cash: restored.cash + refund, actionPoints: restored.actionPoints + paperBuyStep };
    }
    if (paperUpgradeId !== null) {
      restored = { ...restored, actionPoints: restored.actionPoints + paperUpgradeStep };
    }
    setState(restored);
    setPaperBuyIdx(null);
    setPaperBuyStep(0);
    setPaperUpgradeId(null);
    setPaperUpgradeStep(0);
  };

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

      {(paperBuyIdx !== null || paperUpgradeId !== null) && (
        <div className="card paperwork-card">
          <span className="section-title">📄 Оформление документов</span>
          {paperBuyIdx !== null && (
            <>
              <div className="paperwork-biz-name">{BUSINESSES_LIST[paperBuyIdx].name}</div>
              <div className="paperwork-steps">
                {BUY_STEPS.map((s, i) => (
                  <div key={i} className={`paperwork-step ${i < paperBuyStep ? 'done' : i === paperBuyStep ? 'current' : ''}`}>
                    <span className="ps-icon">{i < paperBuyStep ? '✅' : i === paperBuyStep ? '📄' : '⬜'}</span>
                    <span className="ps-label">{s.label}</span>
                    {i === paperBuyStep && (
                      <button className="btn-primary btn-sm" onClick={handleDoPaperStep} disabled={state.actionPoints < s.ap || state.cash < s.cost}>
                        {s.cost > 0 ? `Выполнить (${s.ap} AP, $${s.cost})` : `Выполнить (${s.ap} AP)`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {paperUpgradeId !== null && (
            <>
              <div className="paperwork-biz-name">{state.businesses.find(b => b.id === paperUpgradeId)?.name}</div>
              <div className="paperwork-steps">
                {UPGRADE_STEPS.map((s, i) => (
                  <div key={i} className={`paperwork-step ${i < paperUpgradeStep ? 'done' : i === paperUpgradeStep ? 'current' : ''}`}>
                    <span className="ps-icon">{i < paperUpgradeStep ? '✅' : i === paperUpgradeStep ? '📄' : '⬜'}</span>
                    <span className="ps-label">{s.label}</span>
                    {i === paperUpgradeStep && (
                      <button className="btn-primary btn-sm" onClick={handleDoUpgradeStep} disabled={state.actionPoints < s.ap}>
                        Выполнить ({s.ap} AP)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          <button className="btn-ghost btn-sm" onClick={cancelPaperwork} style={{ marginTop: 8 }}>Отмена</button>
        </div>
      )}

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
                    <button className="btn-primary btn-sm" onClick={() => handleStartUpgradePaperwork(b.id)} disabled={state.cash < b.level * 10000 || state.actionPoints < 1 || paperUpgradeId !== null}>
                      Улучшить ${(b.level * 10000).toLocaleString()}
                    </button>
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
            <div key={idx} className={`business-card ${paperBuyIdx === idx ? 'busy' : ''}`}>
              <span className="b-type">{b.type}</span>
              <div className="b-name">{b.name}</div>
              <div className="b-cost">{formatMoney(b.investment)}</div>
              <div className="b-profit">✦ +{formatMoney(b.dailyProfit)}/day</div>
              <button
                className="btn-success"
                onClick={() => handleStartPaperwork(idx)}
                disabled={state.cash + state.checking < b.investment || state.actionPoints < 1 || paperBuyIdx !== null}
                style={{ opacity: state.cash + state.checking < b.investment ? 0.5 : 1 }}
              >
                {paperBuyIdx === idx ? 'Оформляется...' : state.cash + state.checking >= b.investment ? 'Запустить' : 'Нужно ' + formatMoney(b.investment - state.cash - state.checking)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
