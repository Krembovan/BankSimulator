import './Dashboard.css';
import { getNetWorth, getAchievementName } from '../game/events';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { GameState } from '../types';

interface DashboardProps {
  state: GameState;
}

function formatMoney(n: number) {
  if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

export default function Dashboard({ state }: DashboardProps) {
  const nw = getNetWorth(state);
  const totalAssets = state.cash + state.checking + state.savings +
    state.cds.reduce((a, c) => a + c.amount, 0) +
    state.properties.reduce((a, p) => a + p.currentValue, 0) +
    state.vehicles.reduce((a, v) => a + v.currentValue, 0) +
    state.businesses.reduce((a, b) => a + b.value, 0) +
    state.stockPortfolio.reduce((a, sp) => {
      const stock = state.stocks.find(s => s.symbol === sp.symbol);
      return a + (stock ? stock.price * sp.shares : 0);
    }, 0);
  const totalDebt = state.loans.reduce((a, l) => a + l.remaining, 0);
  const startNw = state.marketData.length > 0 ? state.marketData[0].netWorth : nw;
  const nwChange = startNw > 0 ? ((nw - startNw) / startNw) * 100 : 0;

  const stocksValue = state.stockPortfolio.reduce((a, sp) => {
    const st = state.stocks.find(s => s.symbol === sp.symbol);
    return a + (st ? st.price * sp.shares : 0);
  }, 0);
  const cryptoValue = state.cryptoPortfolio.reduce((a, cp) => {
    const c = state.cryptos.find(cr => cr.symbol === cp.symbol);
    return a + (c ? c.price * cp.coins : 0);
  }, 0);
  const propertyValue = state.properties.reduce((a, p) => a + p.currentValue, 0);
  const businessValue = state.businesses.reduce((a, b) => a + b.value, 0);
  const cashAndBank = state.cash + state.checking + state.savings;
  const maxAsset = Math.max(cashAndBank, stocksValue, cryptoValue, propertyValue, businessValue, 1);

  const chartData = state.marketData.map(d => ({
    ...d,
    nwFormatted: formatMoney(d.netWorth),
  }));

  const eventTime = (day: number) => {
    const h = 6 + (day % 24);
    const m = day % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  return (
    <div className="dash">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Обзор капитала</h1>
          <p className="dash-subtitle">Симуляция финансовой империи начата. Удачи.</p>
        </div>
        <div className="dash-header-actions">
          <button className="dash-header-btn" onClick={() => {}}>📊 Отчёт</button>
        </div>
      </div>

      <div className="dash-metrics">
        <div className="dash-metric dash-metric-primary">
          <div className="dash-metric-blur" />
          <div className="dash-metric-label">Общий Капитал</div>
          <div className="dash-metric-value">{formatMoney(nw)}</div>
          <div className="dash-metric-change">
            <span className="dash-change-badge">
              <svg className="dash-change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              {nwChange >= 0 ? '+' : ''}{nwChange.toFixed(1)}%
            </span>
            <span className="dash-change-label">со старта</span>
          </div>
        </div>

        <div className="dash-metric">
          <div className="dash-metric-label">Наличные</div>
          <div className="dash-metric-value">{formatMoney(state.cash)}</div>
          <div className="dash-metric-sub">+ {formatMoney(state.checking)} на счету в банке</div>
        </div>

        <div className="dash-metric">
          <div className="dash-metric-label">Всего активов</div>
          <div className="dash-metric-value">{formatMoney(totalAssets)}</div>
          <div className="dash-metric-sub">+ {formatMoney(state.savings)} в копилке</div>
        </div>

        <div className="dash-metric dash-metric-danger">
          <div className="dash-metric-label">Всего долгов</div>
          <div className="dash-metric-value dash-value-red">{formatMoney(totalDebt)}</div>
          <div className="dash-metric-sub">Кредитный рейтинг: <span className="dash-text-white">{state.creditScore}</span></div>
        </div>
      </div>

      <div className="dash-middle">
        <div className="dash-chart-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Динамика роста</h3>
            <div className="dash-panel-toggle">
              <button className="dash-toggle-btn active">Всё время</button>
              <button className="dash-toggle-btn">Месяц</button>
            </div>
          </div>
          <div className="dash-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="chartGradLine" x1="0" y1="0" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="chartGradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17,17,22,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  }}
                  labelStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                  formatter={(value: any) => [formatMoney(Number(value)), 'Капитал']}
                />
                <Area type="monotone" dataKey="netWorth" stroke="url(#chartGradLine)" strokeWidth={2.5} fill="url(#chartGradArea)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="dash-chart-labels">
              <span className="dash-chart-label">День 0</span>
              <span className="dash-chart-label">День {state.day}</span>
            </div>
          </div>
        </div>

        <div className="dash-portfolio-panel">
          <h3 className="dash-panel-title" style={{ marginBottom: 20 }}>Структура активов</h3>
          <div className="dash-portfolio-items">
            <div className="dash-portfolio-item">
              <div className="dash-portfolio-head">
                <div className="dash-portfolio-name">
                  <span className="dash-portfolio-dot dash-dot-green" />
                  Наличные
                </div>
                <span className="dash-portfolio-amount">{formatMoney(cashAndBank)}</span>
              </div>
              <div className="dash-portfolio-bar">
                <div className="dash-portfolio-fill dash-fill-green" style={{ width: `${(cashAndBank / maxAsset) * 100}%` }} />
              </div>
            </div>

            <div className="dash-portfolio-item">
              <div className="dash-portfolio-head">
                <div className="dash-portfolio-name">
                  <span className="dash-portfolio-dot dash-dot-blue" />
                  Акции
                </div>
                <span className="dash-portfolio-amount">{formatMoney(stocksValue)}</span>
              </div>
              <div className="dash-portfolio-bar">
                <div className="dash-portfolio-fill dash-fill-blue" style={{ width: `${(stocksValue / maxAsset) * 100}%` }} />
              </div>
            </div>

            <div className="dash-portfolio-item">
              <div className="dash-portfolio-head">
                <div className="dash-portfolio-name">
                  <span className="dash-portfolio-dot dash-dot-purple" />
                  Недвижимость
                </div>
                <span className="dash-portfolio-amount">{formatMoney(propertyValue)}</span>
              </div>
              <div className="dash-portfolio-bar">
                <div className="dash-portfolio-fill dash-fill-purple" style={{ width: `${(propertyValue / maxAsset) * 100}%` }} />
              </div>
            </div>

            <div className="dash-portfolio-item">
              <div className="dash-portfolio-head">
                <div className="dash-portfolio-name">
                  <span className="dash-portfolio-dot dash-dot-cyan" />
                  Крипта
                </div>
                <span className="dash-portfolio-amount">{formatMoney(cryptoValue)}</span>
              </div>
              <div className="dash-portfolio-bar">
                <div className="dash-portfolio-fill dash-fill-cyan" style={{ width: `${(cryptoValue / maxAsset) * 100}%` }} />
              </div>
            </div>

            <div className="dash-portfolio-item">
              <div className="dash-portfolio-head">
                <div className="dash-portfolio-name">
                  <span className="dash-portfolio-dot dash-dot-amber" />
                  Бизнес
                </div>
                <span className="dash-portfolio-amount">{formatMoney(businessValue)}</span>
              </div>
              <div className="dash-portfolio-bar">
                <div className="dash-portfolio-fill dash-fill-amber" style={{ width: `${(businessValue / maxAsset) * 100}%` }} />
              </div>
            </div>
          </div>

          {state.achievements.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="dash-achievements-label">Достижения</div>
              <div className="dash-achievements">
                {state.achievements.map(a => (
                  <span key={a} className="dash-achievement-badge">
                    {getAchievementName(a).split('—')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dash-log-panel">
        <div className="dash-panel-header">
          <h3 className="dash-panel-title">Журнал событий</h3>
          <span className="dash-log-fade">Только важные</span>
        </div>
        <div className="dash-log-list">
          {state.eventLog.slice(-20).reverse().map((entry, i) => {
            const isGood = entry.includes('🎉') || entry.includes('✅') || entry.includes('🏆') || entry.includes('💰');
            const isBad = entry.includes('⚠️') || entry.includes('❌') || entry.includes('🚔') || entry.includes('🔻');
            const isPrison = entry.includes('⛓️') || entry.includes('🕊️');
            return (
              <div key={i} className={`dash-log-entry ${isGood ? 'good' : isBad ? 'bad' : isPrison ? 'prison' : ''}`}>
                <span className="dash-log-time">{eventTime(state.day - Math.floor(i / 2))}</span>
                <div className="dash-log-body">
                  <p className={`dash-log-msg ${isGood ? 'text-green' : isBad ? 'text-red' : ''}`}>{entry}</p>
                </div>
              </div>
            );
          })}
          {state.eventLog.length === 0 && (
            <div className="dash-log-empty">История пуста</div>
          )}
        </div>
      </div>
    </div>
  );
}
