import { useState } from 'react';
import './Bank.css';
import type { GameState } from '../types';
import { LOAN_PURPOSE_NAMES, getLoanLimit, getLoanRate } from '../types';
import { getLoan, payLoan, payTaxes } from '../game/engine';

interface BankProps {
  state: GameState;
  setState: (s: GameState) => void;
}

function formatMoney(n: number) {
  if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

function calcMonthlyPayment(amount: number, annualRate: number, months: number): number {
  const mr = annualRate / 12;
  return Math.round(amount * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1));
}

export default function Bank({ state, setState }: BankProps) {
  const [depositAmt, setDepositAmt] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [savingsDeposit, setSavingsDeposit] = useState('');
  const [savingsWithdraw, setSavingsWithdraw] = useState('');
  const [cdAmount, setCdAmount] = useState('');
  const [cdTerm, setCdTerm] = useState<'6m' | '1y' | '3y'>('1y');
  const [showContract, setShowContract] = useState(false);
  const [contractName, setContractName] = useState('');
  const [contractPurpose, setContractPurpose] = useState('other');
  const [contractTerm, setContractTerm] = useState('12');
  const [contractAmount, setContractAmount] = useState('');

  const deposit = () => {
    const amt = parseInt(depositAmt);
    if (isNaN(amt) || amt <= 0 || amt > state.cash) return;
    const s = { ...state, cash: state.cash - amt, checking: state.checking + amt };
    setState(s);
    setDepositAmt('');
  };

  const withdraw = () => {
    const amt = parseInt(withdrawAmt);
    if (isNaN(amt) || amt <= 0 || amt > state.checking) return;
    const s = { ...state, cash: state.cash + amt, checking: state.checking - amt };
    setState(s);
    setWithdrawAmt('');
  };

  const depositSavings = () => {
    const amt = parseInt(savingsDeposit);
    if (isNaN(amt) || amt <= 0 || amt > state.cash) return;
    const s = { ...state, cash: state.cash - amt, savings: state.savings + amt };
    setState(s);
    setSavingsDeposit('');
  };

  const withdrawSavings = () => {
    const amt = parseInt(savingsWithdraw);
    if (isNaN(amt) || amt <= 0 || amt > state.savings) return;
    const s = { ...state, cash: state.cash + amt, savings: state.savings - amt };
    setState(s);
    setSavingsWithdraw('');
  };

  const openCD = () => {
    const amt = parseInt(cdAmount);
    if (isNaN(amt) || amt <= 0 || amt > state.cash) return;
    const termDays = cdTerm === '6m' ? 180 : cdTerm === '1y' ? 365 : 1095;
    const rate = cdTerm === '6m' ? 0.04 : cdTerm === '1y' ? 0.05 : 0.065;
    const s = { ...state, cash: state.cash - amt };
    s.cds.push({ amount: amt, rate, termDays, daysLeft: termDays });
    setState(s);
    setCdAmount('');
  };

  const openContract = () => {
    const amt = parseInt(contractAmount);
    if (isNaN(amt) || amt <= 0) return;
    const limit = getLoanLimit(contractPurpose);
    if (amt > limit) return;
    if (!contractName.trim()) return;
    setShowContract(true);
  };

  const confirmLoan = () => {
    const amt = parseInt(contractAmount);
    if (isNaN(amt) || amt <= 0) return;
    const term = parseInt(contractTerm);
    if (isNaN(term) || term < 1 || term > 36) return;
    const s = getLoan(state, {
      purpose: contractPurpose,
      borrowerName: contractName.trim(),
      termMonths: term,
      amount: amt,
    });
    setState(s);
    setShowContract(false);
    setContractName('');
    setContractPurpose('other');
    setContractTerm('12');
    setContractAmount('');
  };

  const repayLoan = (loanId: number) => {
    const s = payLoan(state, loanId);
    setState(s);
  };

  const cdRates: Record<string, number> = { '6m': 4.0, '1y': 5.0, '3y': 6.5 };

  const termMonths = parseInt(contractTerm) || 12;
  const previewAmount = parseInt(contractAmount) || 0;
  const previewRate = getLoanRate(contractPurpose);
  const adjRate = previewRate + (0.05 * (650 - state.creditScore) / 350);
  const previewPayment = calcMonthlyPayment(previewAmount, adjRate, termMonths);

  const taxable = state.taxableIncome || 0;
  let taxRate = 0.1;
  if (taxable > 10000) taxRate = 0.15;
  if (taxable > 50000) taxRate = 0.2;
  if (taxable > 200000) taxRate = 0.25;
  const taxEstimate = Math.round(taxable * taxRate);

  return (
    <div className="bank-view">
      <h2 className="gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>🏦 Банк</h2>

      <div className="bank-grid">
        <div className="bank-account-card">
          <div className="card-header">
            <h3>Расчётный счёт</h3>
            <span className="card-icon">💳</span>
          </div>
          <div className="balance" style={{ color: 'var(--text-primary)' }}>{formatMoney(state.checking)}</div>
          <div className="rate">0% годовых &middot; Мгновенный доступ</div>
          <div className="bank-actions">
            <div className="input-row">
              <input type="number" placeholder="Amount" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} />
              <button className="btn-primary btn-sm" onClick={deposit}>Внести</button>
            </div>
            <div className="input-row">
              <input type="number" placeholder="Amount" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} />
              <button className="btn-ghost btn-sm" onClick={withdraw}>Снять</button>
            </div>
          </div>
        </div>

        <div className="bank-account-card">
          <div className="card-header">
            <h3>Сберегательный счёт</h3>
            <span className="card-icon">💰</span>
          </div>
          <div className="balance text-green">{formatMoney(state.savings)}</div>
          <div className="rate">2.5% годовых &middot; Ежедневная капитализация</div>
          <div className="bank-actions">
            <div className="input-row">
              <input type="number" placeholder="Amount" value={savingsDeposit} onChange={e => setSavingsDeposit(e.target.value)} />
              <button className="btn-success btn-sm" onClick={depositSavings}>Внести</button>
            </div>
            <div className="input-row">
              <input type="number" placeholder="Amount" value={savingsWithdraw} onChange={e => setSavingsWithdraw(e.target.value)} />
              <button className="btn-ghost btn-sm" onClick={withdrawSavings}>Снять</button>
            </div>
          </div>
        </div>

        <div className="bank-account-card">
          <div className="card-header">
            <h3>Наличные</h3>
            <span className="card-icon">💵</span>
          </div>
          <div className="balance" style={{ color: 'var(--text-primary)' }}>{formatMoney(state.cash)}</div>
          <div className="rate">Физические деньги &middot; Без процентов &middot; Всегда под рукой</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '8px 0' }}>
            Используйте наличные для инвестиций, покупок и трат. Переводите на счёт для безопасности!
          </div>
        </div>
      </div>

      <div className="bank-grid">
        <div className="card" style={{ gridColumn: '1 / 3' }}>
          <span className="section-title">Срочные вклады (CD)</span>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            {(['6m', '1y', '3y'] as const).map(t => (
              <div key={t} style={{ flex: 1, textAlign: 'center', padding: 12, background: cdTerm === t ? 'var(--accent-blue-glow)' : 'var(--bg-glass)', border: cdTerm === t ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCdTerm(t)}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cdTerm === t ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>{t}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-green)', marginTop: 4 }}>{cdRates[t]}%</div>
              </div>
            ))}
          </div>
          <div className="bank-actions" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Сумма инвестиции</div>
              <input type="number" placeholder="Сколько вложить?" value={cdAmount} onChange={e => setCdAmount(e.target.value)} style={{ width: '100%' }} />
            </div>
            <button className="btn-success" onClick={openCD}>Открыть депозит</button>
          </div>
          {state.cds.length > 0 && (
            <div className="cd-list" style={{ marginTop: 16 }}>
              <span className="section-title" style={{ marginBottom: 8 }}>Ваши вклады</span>
              {state.cds.map((cd, i) => (
                <div key={i} className="cd-item">
                  <div className="cd-info">
                    <span className="cd-amount">{formatMoney(cd.amount)}</span>
                    <span className="cd-days">{(cd.rate * 100).toFixed(1)}% годовых &middot; Осталось {cd.daysLeft} дн.</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-amber)' }}>{cd.daysLeft}d</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{Math.round(cd.amount * cd.rate * (cd.termDays / 365) * 100) / 100} проценты</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <span className="section-title">Кредиты</span>
          <div style={{ marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Кредитный рейтинг:</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-blue)' }}>{state.creditScore}</span>
          </div>

          <div className="bank-actions" style={{ gap: 8, flexDirection: 'column' }}>
            <div className="input-row">
              <input type="text" placeholder="ФИО заёмщика" value={contractName} onChange={e => setContractName(e.target.value)} />
            </div>
            <div className="input-row">
              <select value={contractPurpose} onChange={e => setContractPurpose(e.target.value)} style={{ flex: 1 }}>
                {Object.entries(LOAN_PURPOSE_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="input-row">
              <select value={contractTerm} onChange={e => setContractTerm(e.target.value)} style={{ flex: 1 }}>
                {Array.from({ length: 36 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m} мес.</option>
                ))}
              </select>
            </div>
            <div className="input-row">
              <input type="number" placeholder="Сумма кредита" value={contractAmount} onChange={e => setContractAmount(e.target.value)} />
              <button className="btn-warning btn-sm" onClick={openContract} disabled={!contractName.trim() || parseInt(contractAmount) <= 0 || parseInt(contractAmount) > getLoanLimit(contractPurpose) || state.actionPoints < 2}>
                Оформить
              </button>
            </div>
            {previewAmount > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 0', lineHeight: 1.6 }}>
                Лимит: {formatMoney(getLoanLimit(contractPurpose))} · Ставка: {(adjRate * 100).toFixed(1)}% · Платеж: {formatMoney(previewPayment)}/мес · Всего: {formatMoney(previewPayment * termMonths)}
              </div>
            )}
          </div>

          {state.loans.length > 0 && (
            <div className="loan-list" style={{ marginTop: 8 }}>
              {state.loans.map(loan => (
                <div key={loan.id} className="loan-item">
                  <div className="loan-info">
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{LOAN_PURPOSE_NAMES[loan.purpose] || loan.purpose}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {(loan.rate * 100).toFixed(1)}% · {formatMoney(loan.remaining)} осталось · {formatMoney(loan.monthlyPayment)}/мес
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {loan.borrowerName} · {loan.termMonths} мес. · {loan.missedPayments > 0 ? <span style={{ color: 'var(--accent-red)' }}>просрочка {loan.missedPayments} мес.</span> : 'без просрочек'}
                    </div>
                  </div>
                  <button className="btn-danger btn-sm" onClick={() => repayLoan(loan.id)}>Оплатить</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="tax-bar">
        <div className="tax-info">
          <span className="tax-label">🧾 Налоги</span>
          <span className="tax-days">{state.day - state.lastTaxDay} дн. без оплаты</span>
        </div>
        <div className="tax-center-info">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Облагаемый доход: {formatMoney(taxable)}
            {state.day - state.lastTaxDay > 30 && taxable > 0 && (
              <span style={{ color: 'var(--accent-red)', marginLeft: 8 }}>⚠️ Просрочка!</span>
            )}
          </span>
        </div>
        <div className="tax-action">
          <span className="tax-amount" style={{ color: state.day - state.lastTaxDay > 30 && taxable > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
            ~{formatMoney(taxEstimate)}
          </span>
          <button
            className="btn-warning btn-sm"
            onClick={() => setState(payTaxes(state))}
            disabled={taxable <= 0 || state.cash + state.checking < taxEstimate}
          >
            Оплатить
          </button>
        </div>
      </div>

      {showContract && (
        <div className="modal-overlay" onClick={() => setShowContract(false)}>
          <div className="contract-modal" onClick={e => e.stopPropagation()}>
            <div className="contract-header">📝 Кредитный договор</div>
            <div className="contract-body">
              <div className="contract-field">
                <label>ФИО заёмщика</label>
                <div className="contract-value">{contractName}</div>
              </div>
              <div className="contract-field">
                <label>Цель кредита</label>
                <div className="contract-value">{LOAN_PURPOSE_NAMES[contractPurpose]}</div>
              </div>
              <div className="contract-field">
                <label>Срок</label>
                <div className="contract-value">{contractTerm} мес.</div>
              </div>
              <div className="contract-field">
                <label>Сумма</label>
                <div className="contract-value">{formatMoney(previewAmount)}</div>
              </div>
              <div className="contract-terms">
                <div>Ставка: {(adjRate * 100).toFixed(1)}%</div>
                <div>Платеж: {formatMoney(previewPayment)}/мес</div>
                <div>Всего к выплате: {formatMoney(previewPayment * termMonths)}</div>
              </div>
            </div>
            <div className="contract-actions">
              <button className="btn-primary" onClick={confirmLoan}>Подписать договор</button>
              <button className="btn-ghost" onClick={() => setShowContract(false)}>Отказаться</button>
            </div>
          </div>
        </div>
      )}

      <div className="liquid-assets-card">
        <span className="la-label">Всего ликвидных средств</span>
        <span className="la-total">{formatMoney(state.cash + state.checking + state.savings)}</span>
        <div className="la-tips">
          <div className="la-tip">💡 Финансовая подушка — держите 3-6 месяцев расходов на счету</div>
          <div className="la-tip">💰 Сбережения приносят 2.5% годовых с ежедневной капитализацией</div>
          <div className="la-tip">📜 Вклады блокируют деньги на 6-36 месяцев под 4-6.5% годовых</div>
        </div>
      </div>
    </div>
  );
}
