import type { GameState } from '../types';
import { JOB_LIST, VEHICLES_LIST, BUSINESSES_LIST, EDUCATION_COSTS, EDUCATION_NAMES, SIDE_HUSTLES, SHADOW_JOBS, BLACK_MARKET_ITEMS, getLoanRate, getLoanLimit, LOAN_PURPOSE_NAMES } from '../types';
import { checkRandomEvent, checkAchievements, getNetWorth, getAchievementName, applyMonthlyExpenses, checkCareerEvent, checkPoliceRaid, checkShadowOpportunity, checkCollectors, checkTaxAuthority } from './events';

export const MAX_ACTIONS = 10;

function spendAP(s: GameState, cost: number): boolean {
  if ((s.actionPoints ?? MAX_ACTIONS) < cost) return false;
  s.actionPoints -= cost;
  return true;
}

export function advanceDay(state: GameState): GameState {
  let s = structuredClone(state);
  s.day += 1;
  s.actionPoints = MAX_ACTIONS;

  if (s.job !== null && s.jobIndex >= 0) {
    const job = JOB_LIST[s.jobIndex];
    const salary = job.salary;
    s.cash += salary;
    s.totalEarned += salary;
    s.taxableIncome = (s.taxableIncome || 0) + salary;
    s.daysAtJob += 1;
    s.performance = Math.min(100, s.performance + 1);

    if (s.daysAtJob % 30 === 0 && s.jobIndex < JOB_LIST.length - 1) {
      const nextJob = JOB_LIST[s.jobIndex + 1];
      const canPromote = nextJob.req === null || s.education.includes(nextJob.req);
      if (s.performance >= 70 && canPromote) {
        s.jobIndex += 1;
        s.job = JOB_LIST[s.jobIndex].name;
        s.daysAtJob = 0;
        s.performance = 50;
        s.eventLog.push(`День ${s.day}: 🎉 Повышение до ${JOB_LIST[s.jobIndex].name}!`);
      }
    }
  }

  if (s.sideHustle !== null) {
    const hustlePay = s.sideHustle.dailyPay + Math.floor(Math.random() * 10);
    s.cash += hustlePay;
    s.totalEarned += hustlePay;
    s.sideHustle.daysActive += 1;
    s.performance = Math.max(0, s.performance - 2);
  }

  if (s.shadowJob !== null) {
    const income = s.shadowJob.dailyIncome + Math.floor(Math.random() * 15);
    s.dirtyCash += income;
    s.totalEarned += income;
    s.shadowJob.daysActive += 1;
    s.riskLevel = Math.min(100, s.riskLevel + s.shadowJob.riskPerDay);
  }

  if (s.riskLevel > 0 && s.shadowJob === null) {
    s.riskLevel = Math.max(0, s.riskLevel - 2);
  }

  s.cash += s.savings * (0.025 / 365);
  s.savings = Math.round(s.savings * 100) / 100;

  s.cds.forEach(cd => { cd.daysLeft -= 1; });
  const maturedCds = s.cds.filter(cd => cd.daysLeft <= 0);
  s.cds = s.cds.filter(cd => cd.daysLeft > 0);
  maturedCds.forEach(cd => {
    const interest = Math.round(cd.amount * cd.rate * (cd.termDays / 365));
    s.cash += cd.amount + interest;
    s.totalEarned += interest;
    s.eventLog.push(`День ${s.day}: Депозит созрел! +$${cd.amount + interest} (${interest} проценты)`);
  });

  s.stocks.forEach(stock => {
    const change = (Math.random() - 0.5) * 2 * stock.volatility;
    const trend = (Math.random() - 0.48) * 0.01;
    stock.price = Math.max(1, Math.round(stock.price * (1 + change + trend) * 100) / 100);

    if (s.day % 30 === 0 && stock.dividendYield > 0) {
      const pos = s.stockPortfolio.find(sp => sp.symbol === stock.symbol);
      if (pos) {
        const dividend = Math.round(pos.shares * stock.price * stock.dividendYield / 12 * 100) / 100;
        s.cash += dividend;
        s.totalEarned += dividend;
        s.eventLog.push(`День ${s.day}: Дивиденды $${dividend} от ${stock.symbol}`);
      }
    }
  });

  s.cryptos.forEach(crypto => {
    const change = (Math.random() - 0.5) * 2 * crypto.volatility;
    const trend = (Math.random() - 0.47) * 0.02;
    crypto.price = Math.max(0.001, Math.round(crypto.price * (1 + change + trend) * 100) / 100);
  });

  s.properties.forEach(p => {
    const marketProp = s.propertiesMarket.find(mp => mp.name === p.name);
    if (marketProp) {
      const change = (Math.random() - 0.5) * 0.02 + marketProp.appreciation / 365;
      p.currentValue = Math.round(p.currentValue * (1 + change));

      const rent = Math.round(marketProp.rent * (1 + (Math.random() - 0.5) * 0.1));
      s.cash += rent;
      s.totalEarned += rent;
    }
  });

  s.vehicles.forEach(v => {
    if (v.isClassic) {
      const change = (Math.random() - 0.4) * 0.01;
      v.currentValue = Math.round(v.currentValue * (1 + change));
    } else {
      v.currentValue = Math.round(v.currentValue * (1 - v.depreciation / 365));
    }
  });

  s.businesses.forEach(b => {
    const variance = 0.8 + Math.random() * 0.4;
    const effMultiplier = 1 + b.employees * 0.1 + b.reputation * 0.005;
    const profit = Math.round(b.dailyProfit * variance * effMultiplier);
    s.cash += profit;
    s.totalEarned += profit;
    s.taxableIncome = (s.taxableIncome || 0) + profit;
  });

  if (s.day % 30 === 0 && s.lastExpenseDay < s.day) {
    applyMonthlyExpenses(s);
  }

  if (s.day % 30 === 0) {
    s.loans.forEach(loan => {
      if (loan.remaining <= 0) return;
      const payment = Math.min(loan.monthlyPayment, loan.remaining);
      if (s.cash >= payment) {
        s.cash -= payment;
        loan.remaining = Math.max(0, loan.remaining - payment);
        loan.missedPayments = 0;
        s.totalSpent += payment;
        if (loan.remaining <= 0) {
          s.eventLog.push(`День ${s.day}: 💳 Кредит на "${loan.purpose}" полностью погашен`);
        }
      } else if (s.cash + s.checking >= payment) {
        const diff = payment - s.cash;
        s.cash = 0;
        s.checking -= diff;
        loan.remaining = Math.max(0, loan.remaining - payment);
        loan.missedPayments = 0;
        s.totalSpent += payment;
        if (loan.remaining <= 0) {
          s.eventLog.push(`День ${s.day}: 💳 Кредит на "${loan.purpose}" полностью погашен`);
        }
      } else {
        loan.missedPayments = (loan.missedPayments || 0) + 1;
        s.eventLog.push(`День ${s.day}: ⚠️ Пропущен платёж по кредиту "${loan.purpose}" (${loan.missedPayments} мес.)`);
      }
    });
    s.loans = s.loans.filter(l => l.remaining > 0);
  }

  const nw = getNetWorth(s);
  if (nw > s.highestNetWorth) s.highestNetWorth = nw;

  s.marketData.push({ day: s.day, netWorth: nw, cash: s.cash });
  if (s.marketData.length > 500) s.marketData.shift();

  s = checkCollectors(s);
  s = checkTaxAuthority(s);
  s = checkPoliceRaid(s);
  s = checkCareerEvent(s);
  s = checkShadowOpportunity(s);

  const newAchievements = checkAchievements(s);
  newAchievements.forEach(a => {
    if (!s.achievements.includes(a)) {
      s.achievements.push(a);
      s.eventLog.push(`🏆 Достижение разблокировано: ${getAchievementName(a)}`);
    }
  });

  const eventResult = checkRandomEvent(s);
  s = eventResult;

  return s;
}

export function buyStock(state: GameState, symbol: string, amount: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const stock = s.stocks.find(st => st.symbol === symbol);
  if (!stock || amount <= 0) return state;

  const available = s.cash + s.checking;
  const shares = Math.floor(Math.min(amount, available) / stock.price);
  if (shares <= 0) return state;

  const cost = shares * stock.price;
  if (cost > s.cash) {
    const diff = cost - s.cash;
    s.cash = 0;
    s.checking -= diff;
  } else {
    s.cash -= cost;
  }

  const existing = s.stockPortfolio.find(sp => sp.symbol === symbol);
  if (existing) {
    existing.avgPrice = (existing.avgPrice * existing.shares + cost) / (existing.shares + shares);
    existing.shares += shares;
  } else {
    s.stockPortfolio.push({ symbol, shares, avgPrice: stock.price });
  }

  s.totalSpent += cost;
  return s;
}

export function sellStock(state: GameState, symbol: string, sharesToSell: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const pos = s.stockPortfolio.find(sp => sp.symbol === symbol);
  if (!pos || sharesToSell <= 0 || sharesToSell > pos.shares) return state;

  const stock = s.stocks.find(st => st.symbol === symbol);
  if (!stock) return state;

  const revenue = Math.round(sharesToSell * stock.price * 100) / 100;
  pos.shares -= sharesToSell;
  s.cash += revenue;
  s.totalEarned += revenue;

  if (pos.shares <= 0) {
    s.stockPortfolio = s.stockPortfolio.filter(sp => sp.symbol !== symbol);
  }
  return s;
}

export function buyCrypto(state: GameState, symbol: string, amount: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const crypto = s.cryptos.find(c => c.symbol === symbol);
  if (!crypto || amount <= 0) return state;

  const available = s.cash + s.checking;
  const coins = Math.floor((Math.min(amount, available) / crypto.price) * 1000) / 1000;
  if (coins <= 0) return state;

  const cost = Math.round(coins * crypto.price * 100) / 100;
  if (cost > s.cash) {
    const diff = cost - s.cash;
    s.cash = 0;
    s.checking -= diff;
  } else {
    s.cash -= cost;
  }

  const existing = s.cryptoPortfolio.find(cp => cp.symbol === symbol);
  if (existing) {
    existing.avgPrice = (existing.avgPrice * existing.coins + cost) / (existing.coins + coins);
    existing.coins += coins;
  } else {
    s.cryptoPortfolio.push({ symbol, coins, avgPrice: crypto.price });
  }

  s.totalSpent += cost;
  return s;
}

export function sellCrypto(state: GameState, symbol: string, coinsToSell: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const pos = s.cryptoPortfolio.find(cp => cp.symbol === symbol);
  if (!pos || coinsToSell <= 0 || coinsToSell > pos.coins) return state;

  const crypto = s.cryptos.find(c => c.symbol === symbol);
  if (!crypto) return state;

  const revenue = Math.round(coinsToSell * crypto.price * 100) / 100;
  pos.coins = Math.round((pos.coins - coinsToSell) * 1000) / 1000;
  s.cash += revenue;
  s.totalEarned += revenue;

  if (pos.coins <= 0) {
    s.cryptoPortfolio = s.cryptoPortfolio.filter(cp => cp.symbol !== symbol);
  }
  return s;
}

export function startSideHustle(state: GameState, hustleIndex: number): GameState {
  const s = structuredClone(state);
  const hustle = SIDE_HUSTLES[hustleIndex];
  if (!hustle) return state;
  s.sideHustle = { name: hustle.name, dailyPay: hustle.pay, daysActive: 0 };
  s.eventLog.push(`День ${s.day}: Начата подработка: ${hustle.name} ($${hustle.pay}/день)`);
  return s;
}

export function stopSideHustle(state: GameState): GameState {
  const s = structuredClone(state);
  if (s.sideHustle) {
    s.eventLog.push(`День ${s.day}: Закончена подработка: ${s.sideHustle.name} (${s.sideHustle.daysActive} дней)`);
    s.sideHustle = null;
  }
  return s;
}

export function startShadowJob(state: GameState, jobIndex: number): GameState {
  const s = structuredClone(state);
  const job = SHADOW_JOBS[jobIndex];
  if (!job) return state;
  s.shadowJob = { name: job.name, dailyIncome: job.income, riskPerDay: job.risk, daysActive: 0 };
  s.eventLog.push(`День ${s.day}: 🕶️ Начато теневое дело: ${job.name} ($${job.income}/день, риск +${job.risk}/день)`);
  return s;
}

export function stopShadowJob(state: GameState): GameState {
  const s = structuredClone(state);
  if (s.shadowJob) {
    s.eventLog.push(`День ${s.day}: Закончено теневое дело: ${s.shadowJob.name} (${s.shadowJob.daysActive} дней)`);
    s.shadowJob = null;
  }
  return s;
}

export function launderMoney(state: GameState, amount: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 2)) return state;
  if (amount <= 0 || amount > s.dirtyCash) return state;
  const fee = Math.round(amount * 0.3);
  const clean = amount - fee;
  s.dirtyCash -= amount;
  s.cash += clean;
  s.totalEarned += clean;
  s.taxableIncome = (s.taxableIncome || 0) + clean;
  s.riskLevel = Math.max(0, s.riskLevel - Math.round(amount / 2000));
  s.eventLog.push(`День ${s.day}: 🧼 Отмыто $${amount} (комиссия $${fee}, получено $${clean})`);
  return s;
}

export function getLoan(state: GameState, params: {
  purpose: string;
  borrowerName: string;
  termMonths: number;
  amount: number;
}): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 2)) return state;
  const { purpose, borrowerName, termMonths, amount } = params;
  const maxLoan = getLoanLimit(purpose);
  const rate = getLoanRate(purpose);
  const adjRate = rate + (0.05 * (650 - s.creditScore) / 350);

  const loanAmount = Math.min(amount, maxLoan);
  if (loanAmount <= 0) return state;

  const id = s.loans.length > 0 ? Math.max(...s.loans.map(l => l.id)) + 1 : 1;
  const monthlyRatio = adjRate / 12;
  const monthlyPayment = Math.round(loanAmount * monthlyRatio * Math.pow(1 + monthlyRatio, termMonths) / (Math.pow(1 + monthlyRatio, termMonths) - 1));

  s.loans.push({
    id,
    purpose,
    borrowerName,
    termMonths,
    startDay: s.day,
    amount: loanAmount,
    remaining: loanAmount,
    rate: adjRate,
    monthlyPayment: isNaN(monthlyPayment) ? Math.round(loanAmount / termMonths) : monthlyPayment,
    missedPayments: 0,
  });
  s.cash += loanAmount;
  s.eventLog.push(`День ${s.day}: 💳 Взят кредит на ${LOAN_PURPOSE_NAMES[purpose] || purpose} $${loanAmount} под ${(adjRate * 100).toFixed(1)}% на ${termMonths} мес.`);

  return s;
}

export function payLoan(state: GameState, loanId: number): GameState {
  const s = structuredClone(state);
  const loan = s.loans.find(l => l.id === loanId);
  if (!loan) return state;

  const spendCash = (amount: number) => {
    if (s.cash >= amount) {
      s.cash -= amount;
    } else {
      const diff = amount - s.cash;
      s.cash = 0;
      s.checking -= diff;
    }
  };

  if (s.cash + s.checking >= loan.remaining) {
    spendCash(loan.remaining);
    s.totalSpent += loan.remaining;
    s.loans = s.loans.filter(l => l.id !== loanId);
    s.eventLog.push(`День ${s.day}: 💳 Погашен кредит на "${loan.purpose}" ($${loan.remaining})`);
    s.creditScore = Math.min(850, s.creditScore + 5);
  } else if (s.cash + s.checking >= loan.monthlyPayment) {
    spendCash(loan.monthlyPayment);
    loan.remaining -= loan.monthlyPayment;
    loan.missedPayments = 0;
    s.creditScore = Math.min(850, s.creditScore + 2);
  }

  return s;
}

export function buyProperty(state: GameState, propertyId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 2)) return state;
  const marketProp = s.propertiesMarket.find(p => p.id === propertyId);
  if (!marketProp) return state;

  const totalCash = s.cash + s.checking;
  const downPayment = Math.round(marketProp.price * 0.2);
  const mortgageAmt = marketProp.price - downPayment;

  if (totalCash < downPayment) return state;

  if (s.cash >= downPayment) {
    s.cash -= downPayment;
  } else {
    const diff = downPayment - s.cash;
    s.cash = 0;
    s.checking -= diff;
  }

  const loanId = s.loans.length > 0 ? Math.max(...s.loans.map(l => l.id)) + 1 : 1;
  const rate = 0.05 + (0.05 * (650 - s.creditScore) / 350);
  const monthlyRatio = rate / 12;
  const monthlyPayment = Math.round(mortgageAmt * monthlyRatio * Math.pow(1 + monthlyRatio, 360) / (Math.pow(1 + monthlyRatio, 360) - 1));

  s.loans.push({
    id: loanId,
    purpose: 'property',
    borrowerName: 'Ипотечный заём',
    termMonths: 120,
    startDay: s.day,
    amount: mortgageAmt,
    remaining: mortgageAmt,
    rate,
    monthlyPayment: isNaN(monthlyPayment) ? Math.round(mortgageAmt / 120) : monthlyPayment,
    missedPayments: 0,
  });

  const newId = s.properties.length > 0 ? Math.max(...s.properties.map(p => p.id)) + 1 : 1;
  s.properties.push({
    id: newId,
    name: marketProp.name,
    type: marketProp.type,
    price: marketProp.price,
    currentValue: marketProp.price,
    rent: marketProp.rent,
    loanId,
  });

  s.totalSpent += downPayment;
  s.eventLog.push(`День ${s.day}: Куплен ${marketProp.name} за $${marketProp.price}`);
  return s;
}

export function sellProperty(state: GameState, propertyId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const prop = s.properties.find(p => p.id === propertyId);
  if (!prop) return state;

  s.cash += prop.currentValue;
  s.totalEarned += prop.currentValue;

  if (prop.loanId !== null) {
    const loan = s.loans.find(l => l.id === prop.loanId);
    if (loan) {
      s.cash -= loan.remaining;
      s.loans = s.loans.filter(l => l.id !== prop.loanId);
    }
  }

  s.properties = s.properties.filter(p => p.id !== propertyId);
  s.eventLog.push(`День ${s.day}: Продан ${prop.name} за $${prop.currentValue}`);
  return s;
}

export function buyVehicle(state: GameState, vehicleIndex: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const v = VEHICLES_LIST[vehicleIndex];
  if (!v) return state;

  const totalCash = s.cash + s.checking;
  if (totalCash < v.price) return state;

  if (s.cash >= v.price) {
    s.cash -= v.price;
  } else {
    const diff = v.price - s.cash;
    s.cash = 0;
    s.checking -= diff;
  }

  const newId = s.vehicles.length > 0 ? Math.max(...s.vehicles.map(x => x.id)) + 1 : 1;
  s.vehicles.push({
    id: newId,
    name: v.name,
    price: v.price,
    currentValue: v.price,
    depreciation: v.depreciation,
    isClassic: v.isClassic,
  });

  s.totalSpent += v.price;
  s.eventLog.push(`День ${s.day}: Куплен ${v.name} за $${v.price}`);
  return s;
}

export function upgradeVehicle(state: GameState, vehicleId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const v = s.vehicles.find(veh => veh.id === vehicleId);
  if (!v) return state;

  const cost = Math.round(v.currentValue * 0.15);
  if (s.cash < cost) return state;

  s.cash -= cost;
  v.currentValue = Math.round(v.currentValue * 1.25);
  if (v.depreciation > 0) {
    v.depreciation = Math.max(0.02, v.depreciation - 0.02);
  }
  s.totalSpent += cost;
  s.eventLog.push(`День ${s.day}: 🔧 Улучшен ${v.name} за $${cost} (стоимость +25%)`);
  return s;
}

export function sellVehicle(state: GameState, vehicleId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const v = s.vehicles.find(veh => veh.id === vehicleId);
  if (!v) return state;

  s.cash += v.currentValue;
  s.totalEarned += v.currentValue;
  s.vehicles = s.vehicles.filter(veh => veh.id !== vehicleId);
  s.eventLog.push(`День ${s.day}: Продан ${v.name} за $${v.currentValue}`);
  return s;
}

export function startBusiness(state: GameState, businessIndex: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 2)) return state;
  const bDef = BUSINESSES_LIST[businessIndex];
  if (!bDef) return state;

  if (s.cash + s.checking < bDef.investment) return state;

  if (s.cash >= bDef.investment) {
    s.cash -= bDef.investment;
  } else {
    const diff = bDef.investment - s.cash;
    s.cash = 0;
    s.checking -= diff;
  }

  const newId = s.businesses.length > 0 ? Math.max(...s.businesses.map(b => b.id)) + 1 : 1;
  s.businesses.push({
    id: newId,
    name: bDef.name,
    type: bDef.type,
    investment: bDef.investment,
    dailyProfit: bDef.dailyProfit,
    value: bDef.investment * 1.5,
    level: 1,
    employees: 0,
    reputation: 50,
  });

  s.totalSpent += bDef.investment;
  s.eventLog.push(`День ${s.day}: Открыт бизнес: ${bDef.name}!`);
  return s;
}

export function sellBusiness(state: GameState, businessId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const bus = s.businesses.find(b => b.id === businessId);
  if (!bus) return state;

  s.cash += Math.round(bus.value * 0.6);
  s.totalEarned += Math.round(bus.value * 0.6);
  const name = bus.name;
  s.businesses = s.businesses.filter(b => b.id !== businessId);
  s.eventLog.push(`День ${s.day}: 🏪 Продан бизнес: ${name} за $${Math.round(bus.value * 0.6)}`);
  return s;
}

export function upgradeBusiness(state: GameState, businessId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const bus = s.businesses.find(b => b.id === businessId);
  if (!bus) return state;

  const cost = bus.level * 10000;
  if (s.cash < cost) return state;

  s.cash -= cost;
  bus.level += 1;
  bus.dailyProfit = Math.round(bus.dailyProfit * 1.3);
  bus.value = Math.round(bus.value * 1.3);
  s.totalSpent += cost;
  s.eventLog.push(`День ${s.day}: Улучшен бизнес: ${bus.name} до уровня ${bus.level}`);

  return s;
}

export function hireEmployee(state: GameState, businessId: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const bus = s.businesses.find(b => b.id === businessId);
  if (!bus) return state;

  const cost = 5000;
  if (s.cash < cost) return state;

  s.cash -= cost;
  bus.employees += 1;
  s.totalSpent += cost;
  bus.reputation = Math.min(100, bus.reputation + 3);
  return s;
}

export function buyBlackMarketItem(state: GameState, itemIndex: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const item = BLACK_MARKET_ITEMS[itemIndex];
  if (!item) return state;
  if (s.dirtyCash < item.price) return state;

  s.dirtyCash -= item.price;
  s.blackMarketInventory.push({ name: item.name, cleanPrice: item.cleanPrice });
  s.totalSpent += item.price;
  s.eventLog.push(`День ${s.day}: Куплено на чёрном рынке: ${item.name} за $${item.price}`);
  return s;
}

export function fenceBlackMarketItem(state: GameState, inventoryIndex: number): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const entry = s.blackMarketInventory[inventoryIndex];
  if (!entry) return state;

  s.cash += entry.cleanPrice;
  s.totalEarned += entry.cleanPrice;
  s.blackMarketInventory.splice(inventoryIndex, 1);
  s.eventLog.push(`День ${s.day}: 🏴 Продано с чёрного рынка: ${entry.name} за $${entry.cleanPrice}`);
  return s;
}

export function quitJob(state: GameState): GameState {
  const s = structuredClone(state);
  if (s.job === null) return state;
  s.eventLog.push(`День ${s.day}: Уволен с должности ${s.job}`);
  s.job = null;
  s.jobIndex = -1;
  s.daysAtJob = 0;
  s.performance = 0;
  return s;
}

export function payTaxes(state: GameState): GameState {
  const s = structuredClone(state);
  const taxable = s.taxableIncome || 0;
  if (taxable <= 0) return s;

  let taxRate = 0.1;
  if (taxable > 10000) taxRate = 0.15;
  if (taxable > 50000) taxRate = 0.2;
  if (taxable > 200000) taxRate = 0.25;

  const taxAmount = Math.round(taxable * taxRate);
  if (s.cash + s.checking < taxAmount) return s;

  if (s.cash >= taxAmount) {
    s.cash -= taxAmount;
  } else {
    const diff = taxAmount - s.cash;
    s.cash = 0;
    s.checking = Math.max(0, s.checking - diff);
  }

  s.totalSpent += taxAmount;
  s.taxableIncome = 0;
  s.lastTaxDay = s.day;
  s.creditScore = Math.min(850, s.creditScore + 5);
  s.eventLog.push(`День ${s.day}: 🧾 Налоги уплачены: $${taxAmount.toLocaleString()} (доход $${taxable.toLocaleString()}, ставка ${(taxRate * 100).toFixed(0)}%)`);
  return s;
}

export function investInEducation(state: GameState, educationName: string): GameState {
  const s = structuredClone(state);
  if (!spendAP(s, 1)) return state;
  const idx = EDUCATION_NAMES.indexOf(educationName);
  if (idx === -1) return state;
  const cost = EDUCATION_COSTS[idx];
  if (s.cash < cost) return state;
  if (s.education.includes(educationName)) return state;

  if (idx > 0) {
    const prereq = EDUCATION_NAMES[idx - 1];
    if (!s.education.includes(prereq)) return state;
  }

  s.cash -= cost;
  s.totalSpent += cost;
  s.education.push(educationName);
  s.eventLog.push(`День ${s.day}: Получено образование: ${educationName} за $${cost}`);
  return s;
}
