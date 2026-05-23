import type { GameState } from '../types';

const GOOD_EVENTS = [
  { msg: 'Вы нашли $500 на улице!', cash: 500 },
  { msg: 'Дядя прислал подарок — $1000!', cash: 1000 },
  { msg: 'Вы выиграли $2000 в лотерею!', cash: 2000 },
  { msg: 'Кэшбэк: $300 зачислено на счёт!', cash: 300 },
  { msg: 'Продали старые вещи за $800!', cash: 800 },
  { msg: 'Премия за хорошую работу: $1500!', cash: 1500 },
  { msg: 'Выиграли в покер с друзьями: $700!', cash: 700 },
  { msg: 'Нашли забытую подарочную карту: $200!', cash: 200 },
  { msg: 'Инвестиция окупилась: $2500!', cash: 2500 },
  { msg: 'Получили страховую выплату: $1200!', cash: 1200 },
  { msg: 'Сосед попросил присмотреть за домом: $400!', cash: 400 },
  { msg: 'Продали ненужный хлам: $350!', cash: 350 },
  { msg: 'Выиграли в конкурсе: $600!', cash: 600 },
  { msg: 'Пришёл налоговый вычет: $1800!', cash: 1800 },
  { msg: 'Подруга вернула долг: $900!', cash: 900 },
  { msg: 'Продали старый ноутбук: $650!', cash: 650 },
  { msg: 'Выиграли в лотерейный билет: $2500!', cash: 2500 },
  { msg: 'Работодатель подарил подарочную карту: $500!', cash: 500 },
  { msg: 'Сосед заплатил за помощь с переездом: $450!', cash: 450 },
  { msg: 'Получили дивиденды по старым акциям: $3200!', cash: 3200 },
  { msg: 'Нашли монету 1910 года: $1500!', cash: 1500 },
  { msg: 'Выиграли в телевикторине: $4000!', cash: 4000 },
  { msg: 'Крипто-дропнули токены на $800!', cash: 800 },
  { msg: 'Получили кешбэк 5% на все покупки: $600!', cash: 600 },
];

const BAD_EVENTS = [
  { msg: 'Срочный ремонт авто: −$1000', cash: -1000 },
  { msg: 'Медицинский счёт: −$2000', cash: -2000 },
  { msg: 'Штраф за парковку: −$150', cash: -150 },
  { msg: 'Украли телефон: −$500', cash: -500 },
  { msg: 'Сломался холодильник: −$600', cash: -600 },
  { msg: 'Прорвало трубу: −$1500', cash: -1500 },
  { msg: 'Ограбили квартиру: −$3000', cash: -3000 },
  { msg: 'Сгорел ноутбук: −$1200', cash: -1200 },
  { msg: 'Штраф за превышение: −$300', cash: -300 },
  { msg: 'ДТП (мелкое): −$2000', cash: -2000 },
  { msg: 'Пришёл налог на имущество: −$2500', cash: -2500 },
  { msg: 'Потеряли кошелёк: −$400', cash: -400 },
  { msg: 'Сломался кондиционер: −$800', cash: -800 },
  { msg: 'Судебные издержки: −$1800', cash: -1800 },
  { msg: 'Угнали велосипед: −$700', cash: -700 },
  { msg: 'Грабители взломали сейф: −$5000', cash: -5000 },
  { msg: 'Пожар в гараже: −$4000', cash: -4000 },
  { msg: 'Штраф за незаконную перепланировку: −$2500', cash: -2500 },
  { msg: 'Попали на мошенников: −$3500', cash: -3500 },
  { msg: 'Сгорел генератор: −$1800', cash: -1800 },
  { msg: 'Прокололи шины — замена всех: −$600', cash: -600 },
  { msg: 'Штраф за шум после 23:00: −$500', cash: -500 },
  { msg: 'Залили соседей снизу: −$3000', cash: -3000 },
  { msg: 'Украли аккумулятор из машины: −$400', cash: -400 },
];

const MARKET_EVENTS = [
  { msg: '💹 Бум на рынке! Все акции растут!', type: 'good', mult: 1.1 },
  { msg: '📉 Обвал рынка! Акции падают!', type: 'bad', mult: 0.85 },
  { msg: '🏗️ Строительный бум! Недвижимость дорожает!', type: 'good', mult: 1.08 },
  { msg: '💼 Корпоративный скандал! Технологии падают!', type: 'bad', mult: 0.88, sector: 'Технологии' },
  { msg: '⚡ Энергетический кризис! Энергетика взлетает!', type: 'good', mult: 1.15, sector: 'Энергетика' },
  { msg: '🏦 Центробанк снижает ставки! Рынки растут!', type: 'good', mult: 1.05 },
  { msg: '📊 Страх рецессии! Рынок падает!', type: 'bad', mult: 0.92 },
  { msg: '🛒 Рост потребления! Потребительский сектор растёт!', type: 'good', mult: 1.12, sector: 'Потребление' },
  { msg: '💊 Прорыв в медицине! Здравоохранение взлетает!', type: 'good', mult: 1.1, sector: 'Здравоохранение' },
  { msg: '🤖 ИИ-революция! Технологии взлетают!', type: 'good', mult: 1.15, sector: 'Технологии' },
  { msg: '🌍 Геополитический кризис! Все рынки падают!', type: 'bad', mult: 0.88 },
  { msg: '🛢️ Нефтяной шок! Энергетика взлетает!', type: 'good', mult: 1.2, sector: 'Энергетика' },
  { msg: '📱 Запуск нового iPhone! Потребление растёт!', type: 'good', mult: 1.08, sector: 'Потребление' },
  { msg: '🏥 Эпидемия! Здравоохранение падает!', type: 'bad', mult: 0.9, sector: 'Здравоохранение' },
  { msg: '💸 Крах криптобиржи! Криптовалюты падают!', type: 'bad', mult: 0.75, isCrypto: true },
  { msg: '🚀 Крипто-бум! Все монеты растут!', type: 'good', mult: 1.15, isCrypto: true },
  { msg: '🔧 Промышленный подъём! Промышленность растёт!', type: 'good', mult: 1.1, sector: 'Промышленность' },
  { msg: '🎬 Блокбастер вышел! Развлечения растут!', type: 'good', mult: 1.12, sector: 'Развлечения' },
  { msg: '🌾 Урожай рекордный! Сельское хозяйство взлетает!', type: 'good', mult: 1.1, sector: 'Потребление' },
  { msg: '📉 Пузырь недвижимости лопнул! Акции строителей падают!', type: 'bad', mult: 0.85, sector: 'Промышленность' },
  { msg: '🛡️ Кибератака на банки! Финансы падают!', type: 'bad', mult: 0.88, sector: 'Финансы' },
  { msg: '🧬 Генная терапия одобрена! Медицина взлетает!', type: 'good', mult: 1.15, sector: 'Здравоохранение' },
  { msg: '🚗 Электромобили бьют рекорды продаж! Промышленность растёт!', type: 'good', mult: 1.1, sector: 'Промышленность' },
  { msg: '💳 Кризис потребкредитования! Потребление падает!', type: 'bad', mult: 0.88, sector: 'Потребление' },
];

export function checkRandomEvent(state: GameState): GameState {
  const s = structuredClone(state);
  const roll = Math.random();
  if (roll < 0.04) {
    const event = GOOD_EVENTS[Math.floor(Math.random() * GOOD_EVENTS.length)];
    s.cash += event.cash;
    s.totalEarned += event.cash;
    s.eventLog.push(`День ${s.day}: ${event.msg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = event.msg;
      s.eventType = 'good';
    }
    return s;
  }
  if (roll < 0.08) {
    const event = BAD_EVENTS[Math.floor(Math.random() * BAD_EVENTS.length)];
    s.cash = Math.max(0, s.cash + event.cash);
    s.eventLog.push(`День ${s.day}: ${event.msg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = event.msg;
      s.eventType = 'bad';
    }
    return s;
  }
  if (roll < 0.12) {
    const event = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];

    if (event.isCrypto) {
      s.cryptos.forEach(c => {
        c.price = Math.max(0.001, Math.round(c.price * event.mult * 100) / 100);
      });
    } else {
      s.stocks.forEach(st => {
        if (!event.sector || st.sector === event.sector) {
          st.price = Math.round(st.price * event.mult * 100) / 100;
        }
      });
      if (event.type === 'good') {
        s.propertiesMarket.forEach(p => { p.price = Math.round(p.price * 1.03); p.rent = Math.round(p.rent * 1.05); });
      }
    }

    s.eventLog.push(`День ${s.day}: ${event.msg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = event.msg;
      s.eventType = event.type as 'good' | 'bad';
    }
    return s;
  }
  return s;
}

export function applyMonthlyExpenses(state: GameState): GameState {
  const s = structuredClone(state);
  const food = 100 + Math.floor(Math.random() * 200);
  const utilities = 80 + Math.floor(Math.random() * 150);
  const transport = s.vehicles.length > 0 ? 50 + Math.floor(Math.random() * 100) : 30;
  const total = food + utilities + transport;
  s.cash = Math.max(0, s.cash - total);
  s.totalSpent += total;
  s.eventLog.push(`День ${s.day}: Ежемесячные расходы: еда $${food}, ЖКХ $${utilities}, транспорт $${transport} = $${total}`);
  s.lastExpenseDay = s.day;
  return s;
}

export function checkCareerEvent(state: GameState): GameState {
  if (state.job === null) return state;
  const s = structuredClone(state);
  const roll = Math.random();

  if (roll < 0.02) {
    const bonus = Math.round(JOB_LIST[s.jobIndex].salary * (1 + Math.random() * 3));
    s.cash += bonus;
    s.totalEarned += bonus;
    s.performance = Math.min(100, s.performance + 5);
    s.eventLog.push(`День ${s.day}: 🎉 Премия на работе: +$${bonus}!`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = `Вам выписали премию $${bonus}!`;
      s.eventType = 'good';
    }
    return s;
  }
  if (roll < 0.035) {
    const penalty = Math.round(JOB_LIST[s.jobIndex].salary * 0.5);
    s.cash = Math.max(0, s.cash - penalty);
    s.performance = Math.max(0, s.performance - 10);
    s.eventLog.push(`День ${s.day}: ⚠️ Штраф на работе: −$${penalty}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = `Вы оштрафованы на работе на $${penalty}!`;
      s.eventType = 'bad';
    }
    return s;
  }
  if (roll < 0.04 && s.jobIndex > 0) {
    const demotionPenalty = Math.round(JOB_LIST[s.jobIndex].salary * 0.25);
    s.cash = Math.max(0, s.cash - demotionPenalty);
    s.jobIndex -= 1;
    s.job = JOB_LIST[s.jobIndex].name;
    s.daysAtJob = 0;
    s.performance = 30;
    s.eventLog.push(`День ${s.day}: 🔻 Вас понизили до ${s.job}! (штраф $${demotionPenalty})`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = `Вас понизили до ${s.job} и оштрафовали на $${demotionPenalty}.`;
      s.eventType = 'bad';
    }
    return s;
  }
  return s;
}

const COLLECTOR_EVENTS = [
  { msg: '🚪 Коллекторы выбили дверь и забрали $%s наличных! Хорошо, что вы не пострадали...', cashPct: 0.3 },
  { msg: '🔨 Коллекторы подождали у подъезда и "поговорили" с вами. −$%s и −15 кредитного рейтинга.', cashPct: 0.2 },
  { msg: '💥 Бандиты перехватили вас у банкомата. Отдали $%s и теперь хромаете.', cashPct: 0.25 },
  { msg: '🚗 Коллекторы "эвакуировали" ваш автомобиль. Выкупили за $%s. И зачем вы брали кредит?', cashPct: 0.15 },
  { msg: '🏠 К вам пришли "гости". Забрали техники на $%s и велели поторопиться с выплатами.', cashPct: 0.35 },
  { msg: '😱 Ночной визит! Разбили окно, забрали $%s. Соседи вызвали полицию, но те ушли.', cashPct: 0.2 },
  { msg: '📱 Пришло СМС: "Ты думал мы шутим? Завтра будет вдвое больнее." Сняли $%s с карты.', cashPct: 0.1 },
];

export function checkCollectors(state: GameState): GameState {
  const delinquentLoan = state.loans.find(l => (l.missedPayments || 0) >= 2);
  if (!delinquentLoan) return state;
  const s = structuredClone(state);

  if (Math.random() < 0.3) {
    const ev = COLLECTOR_EVENTS[Math.floor(Math.random() * COLLECTOR_EVENTS.length)];
    const totalLiquid = s.cash + s.checking;
    if (totalLiquid <= 0) return s;
    const take = Math.max(1, Math.round(totalLiquid * ev.cashPct));
    if (s.cash >= take) {
      s.cash -= take;
    } else {
      s.cash = 0;
      s.checking = Math.max(0, s.checking - (take - s.cash));
    }
    s.creditScore = Math.max(300, s.creditScore - 20);
    s.totalSpent += take;

    if (s.vehicles.length > 0 && Math.random() < 0.4) {
      const vIdx = Math.floor(Math.random() * s.vehicles.length);
      const damage = Math.round(s.vehicles[vIdx].currentValue * 0.2);
      s.vehicles[vIdx].currentValue = Math.max(1, s.vehicles[vIdx].currentValue - damage);
      s.eventLog.push(`День ${s.day}: 🔨 Коллекторы разбили ${s.vehicles[vIdx].name} (ущерб $${damage})`);
    }

    const msg = ev.msg.replace('%s', take.toLocaleString());
    s.eventLog.push(`День ${s.day}: ${msg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = msg;
      s.eventType = 'bad';
    }
    return s;
  }
  return s;
}

export function checkPoliceRaid(state: GameState): GameState {
  if (state.riskLevel <= 0 || state.inPrison) return state;
  const s = structuredClone(state);
  const raidChance = s.riskLevel / 500;
  if (Math.random() < raidChance) {
    const confiscated = Math.round(s.dirtyCash * (0.1 + Math.random() * 0.3));
    const bribeAmount = Math.round(s.cash * (0.15 + Math.random() * 0.25));
    const sentence = 3 + Math.floor(Math.random() * 5);

    s.showChoice = true;
    s.choiceData = {
      title: '🚔 Полицейский рейд!',
      message: `Вас накрыли! dirty cash: −$${confiscated.toLocaleString()}.`,
      options: [
        {
          label: `💰 Дать взятку $${bribeAmount.toLocaleString()}`,
          action: 'bribe',
          cost: bribeAmount,
          icon: '💰',
          consequence: 'Отделаетесь штрафом и потерей грязных денег.',
        },
        {
          label: `⛓️ Сесть в тюрьму (${sentence} дней)`,
          action: 'jail',
          cost: 0,
          icon: '⛓️',
          consequence: `Срок ${sentence} дней. Можно выйти раньше по УДО (выполнив 3 задания).`,
        },
      ],
    };
    s.dirtyCash = Math.max(0, s.dirtyCash - confiscated);
    s.riskLevel = Math.max(0, s.riskLevel - 20);
    s.policeBribeAmount = bribeAmount;
    s.prisonSentence = sentence;
    s.eventLog.push(`День ${s.day}: 🚔 Полицейский рейд! Выбор: взятка $${bribeAmount} или тюрьма ${sentence} дней.`);
    return s;
  }
  return s;
}

export function checkShadowOpportunity(state: GameState): GameState {
  if (state.shadowJob === null || Math.random() >= 0.02) return state;
  const s = structuredClone(state);
  const item = SHADOW_OPPORTUNITIES[Math.floor(Math.random() * SHADOW_OPPORTUNITIES.length)];

  const successChance = item.risk === 'low' ? 0.8 : item.risk === 'medium' ? 0.5 : 0.25;
  const success = Math.random() < successChance;

  if (success) {
    const reward = item.rewardMin + Math.floor(Math.random() * (item.rewardMax - item.rewardMin));
    s.cash += reward;
    s.dirtyCash += reward;
    s.totalEarned += reward;
    s.riskLevel = Math.min(100, s.riskLevel + Math.floor(reward / 1000));
    const msg = `✅ ${item.msg} Удалось! +$${reward}`;
    s.eventLog.push(`День ${s.day}: ${msg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = msg;
      s.eventType = 'good';
    }
  } else {
    const penalty = item.penalty;
    s.dirtyCash += penalty;
    s.cash = Math.max(0, s.cash - penalty);
    s.riskLevel = Math.min(100, s.riskLevel + Math.floor(penalty / 500));
    const msg = `❌ ${item.msg} Провал! −$${penalty}`;
    s.eventLog.push(`День ${s.day}: ${msg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = msg;
      s.eventType = 'bad';
    }
  }
  return s;
}

const SHADOW_OPPORTUNITIES = [
  { msg: 'Нашёлся покупатель на краденый товар.', risk: 'low', rewardMin: 100, rewardMax: 500, penalty: 200 },
  { msg: 'Знакомый предлагает «лёгкие деньги».', risk: 'medium', rewardMin: 500, rewardMax: 2000, penalty: 1000 },
  { msg: 'В даркнете новый заказ.', risk: 'medium', rewardMin: 800, rewardMax: 3000, penalty: 1500 },
  { msg: 'Подпольное казино ищет партнёра.', risk: 'high', rewardMin: 2000, rewardMax: 5000, penalty: 3000 },
  { msg: 'Контрабанда на границе.', risk: 'high', rewardMin: 3000, rewardMax: 8000, penalty: 5000 },
];

const TAX_EVENTS = [
  '🚔 Налоговая нагрянула! Проверка документов, выемка средств! Конфисковано $%s. Добро пожаловать в тюрьму, товарищ бизнесмен.',
  '👮‍♂️ ФНС заинтересовалась вашим состоянием. Арест счетов, изъято $%s. Срок — до 7 лет за неуплату налогов.',
  '⚖️ Суд признал вас виновным в уклонении от налогов. Штраф $%s и конфискация имущества. Вас уволили.',
  '💂‍♂️ Обыск! Налоговая полиция изъяла $%s наличных и заморозила активы. В камере будет время подумать.',
];

export function checkTaxAuthority(state: GameState): GameState {
  const taxable = state.taxableIncome || 0;
  if (taxable <= 0) return state;
  const s = structuredClone(state);

  const daysSinceTax = s.day - s.lastTaxDay;
  if (daysSinceTax < 30) return s;

  let taxRate = 0.1;
  if (taxable > 10000) taxRate = 0.15;
  if (taxable > 50000) taxRate = 0.2;
  if (taxable > 200000) taxRate = 0.25;
  const taxOwed = Math.round(taxable * taxRate);

  const suspicion = Math.min(1, (daysSinceTax - 30) / 90) +
    (taxOwed > 5000 ? 1 : 0) +
    (taxOwed > 50000 ? 1 : 0) +
    (s.shadowJob !== null ? 0.5 : 0);

  if (Math.random() < Math.min(0.7, suspicion * 0.03)) {
    const msg = TAX_EVENTS[Math.floor(Math.random() * TAX_EVENTS.length)];
    const fine = Math.round(taxOwed * (1 + Math.random()));
    const cashTake = Math.min(s.cash, Math.round(fine * 0.6));
    s.cash = Math.max(0, s.cash - cashTake);
    s.checking = Math.max(0, s.checking - Math.round(fine * 0.4));
    s.creditScore = Math.max(300, s.creditScore - 50);
    s.totalSpent += fine;
    if (s.job !== null) {
      s.job = null;
      s.jobIndex = -1;
      s.daysAtJob = 0;
      s.performance = 0;
    }
    s.taxableIncome = Math.round((s.taxableIncome || 0) * 0.5);

    const formattedMsg = msg.replace('%s', fine.toLocaleString());
    s.eventLog.push(`День ${s.day}: ${formattedMsg}`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = formattedMsg;
      s.eventType = 'bad';
    }
    return s;
  }
  return s;
}

export function checkAchievements(state: GameState): string[] {
  const newAchievements: string[] = [];
  const nw = getNetWorth(state);

  if (nw >= 10000 && !state.achievements.includes('first_10k')) newAchievements.push('first_10k');
  if (nw >= 100000 && !state.achievements.includes('first_100k')) newAchievements.push('first_100k');
  if (nw >= 1000000 && !state.achievements.includes('millionaire')) newAchievements.push('millionaire');
  if (nw >= 10000000 && !state.achievements.includes('ten_million')) newAchievements.push('ten_million');
  if (state.jobIndex >= 12 && !state.achievements.includes('career_milestone')) newAchievements.push('career_milestone');
  if (state.properties.length >= 3 && !state.achievements.includes('landlord')) newAchievements.push('landlord');
  if (state.businesses.length >= 2 && !state.achievements.includes('entrepreneur')) newAchievements.push('entrepreneur');
  if (state.vehicles.length >= 3 && !state.achievements.includes('collector')) newAchievements.push('collector');
  if (state.savings >= 50000 && !state.achievements.includes('saver')) newAchievements.push('saver');
  if (state.day >= 365 && !state.achievements.includes('veteran')) newAchievements.push('veteran');
  if (state.cryptoPortfolio.length > 0 && !state.achievements.includes('crypto_investor')) newAchievements.push('crypto_investor');
  if (state.businesses.length >= 5 && !state.achievements.includes('tycoon')) newAchievements.push('tycoon');
  if (state.jobIndex >= 17 && !state.achievements.includes('top_exec')) newAchievements.push('top_exec');
  if (state.sideHustle !== null && state.sideHustle.daysActive >= 30 && !state.achievements.includes('hustler')) newAchievements.push('hustler');
  if (state.properties.length >= 10 && !state.achievements.includes('real_estate_mogul')) newAchievements.push('real_estate_mogul');
  if (state.vehicles.length >= 5 && !state.achievements.includes('garage_king')) newAchievements.push('garage_king');
  if (state.stockPortfolio.reduce((a, sp) => { const st = state.stocks.find(s => s.symbol === sp.symbol); return a + (st ? st.price * sp.shares : 0); }, 0) >= 100000 && !state.achievements.includes('stock_whale')) newAchievements.push('stock_whale');
  if (state.shadowJob !== null && state.shadowJob.daysActive >= 30 && !state.achievements.includes('criminal')) newAchievements.push('criminal');
  if (state.riskLevel >= 80 && !state.achievements.includes('wanted')) newAchievements.push('wanted');
  if (state.dirtyCash >= 1000000 && !state.achievements.includes('dirty_million')) newAchievements.push('dirty_million');
  if (state.dirtyCash >= 50000 && !state.achievements.includes('dirty_fifty')) newAchievements.push('dirty_fifty');

  return newAchievements;
}

import { JOB_LIST } from '../types';

export function getNetWorth(state: GameState): number {
  let total = state.cash + state.checking + state.savings + state.dirtyCash;

  state.cds.forEach(cd => total += cd.amount);
  state.stockPortfolio.forEach(sp => {
    const stock = state.stocks.find(s => s.symbol === sp.symbol);
    if (stock) total += stock.price * sp.shares;
  });
  state.cryptoPortfolio.forEach(cp => {
    const crypto = state.cryptos.find(c => c.symbol === cp.symbol);
    if (crypto) total += crypto.price * cp.coins;
  });
  state.properties.forEach(p => total += p.currentValue);
  state.vehicles.forEach(v => total += v.currentValue);
  state.businesses.forEach(b => total += b.value);
  state.loans.forEach(l => total -= l.remaining);

  return Math.round(total);
}

const ACHIEVEMENT_NAMES: Record<string, string> = {
  first_10k: '💰 Первые $10K — Достигните $10,000 капитала',
  first_100k: '💵 Первые $100K — Достигните $100,000 капитала',
  millionaire: '🤑 Миллионер — Достигните $1,000,000 капитала',
  ten_million: '👑 Десять Миллионов — Достигните $10,000,000! Вы победили!',
  career_milestone: '💼 Карьерист — Получите топ-должность',
  landlord: '🏠 Арендодатель — Владейте 3+ объектами',
  entrepreneur: '🚀 Предприниматель — Владейте 2+ бизнесами',
  collector: '🚗 Коллекционер — Владейте 3+ авто',
  saver: '🏦 Копилка — Накопите $50,000 в банке',
  veteran: '🎖️ Ветеран — Сыграйте 365 дней',
  crypto_investor: '₿ Криптоинвестор — Купите криптовалюту',
  tycoon: '🏢 Магнат — Владейте 5+ бизнесами',
  top_exec: '👔 Топ-менеджер — Достигните топ-5 должности',
  hustler: '💪 Халтурщик — 30 дней подработки',
  real_estate_mogul: '🏘️ Девелопер — Владейте 10+ объектами',
  garage_king: '🏎️ Автокороль — Владейте 5+ авто',
  stock_whale: '🐋 Кит — Акций на $100K+',
  criminal: '🔫 Преступник — 30 дней в теневом бизнесе',
  wanted: '🚨 В розыске — Риск 80+',
  dirty_fifty: '💵 Тёмная половинка — $50K грязных денег',
  dirty_million: '💰 Грязный миллион — $1M грязных денег',
};

export function getAchievementName(id: string): string {
  return ACHIEVEMENT_NAMES[id] || id;
}

export function handlePoliceChoice(state: GameState, action: 'bribe' | 'jail'): GameState {
  const s = structuredClone(state);
  s.showChoice = false;
  s.choiceData = null;

  if (action === 'bribe') {
    const bribe = s.policeBribeAmount;
    s.cash = Math.max(0, s.cash - bribe);
    s.totalSpent += bribe;
    s.riskLevel = Math.max(0, s.riskLevel - 15);
    s.eventLog.push(`День ${s.day}: 💰 Взятка полиции $${bribe}. Свободен!`);
  } else {
    s.inPrison = true;
    s.prisonDays = 0;
    s.prisonTasksDone = 0;
    if (s.job !== null) {
      s.job = null;
      s.jobIndex = -1;
      s.daysAtJob = 0;
      s.performance = 0;
    }
    s.eventLog.push(`⛓️ День ${s.day}: Вы в тюрьме! Срок ${s.prisonSentence} дней.`);
  }
  return s;
}

export function processPrisonDay(state: GameState): GameState {
  if (!state.inPrison) return state;
  const s = structuredClone(state);
  s.prisonDays += 1;

  if (s.prisonDays >= s.prisonSentence) {
    s.inPrison = false;
    s.prisonDays = 0;
    s.prisonSentence = 0;
    s.prisonTasksDone = 0;
    s.eventLog.push(`День ${s.day}: 🕊️ Вы вышли на свободу!`);
    if (!s.showEvent) {
      s.showEvent = true;
      s.eventMessage = '🕊️ Вы отбыли срок и вышли на свободу!';
      s.eventType = 'good';
    }
  } else {
    const daysLeft = s.prisonSentence - s.prisonDays;
    s.eventLog.push(`День ${s.day}: ⛓️ Тюрьма день ${s.prisonDays}/${s.prisonSentence}. Осталось ${daysLeft} дн.`);
  }
  return s;
}

export function doPrisonTask(state: GameState): GameState {
  if (!state.inPrison) return state;
  const s = structuredClone(state);
  const TASKS = [
    '📝 Написать жалобу на условия содержания',
    '🧹 Убрать камеру',
    '📖 Прочитать Уголовный кодекс',
    '🍳 Поработать на кухне',
    '📞 Позвонить адвокату',
  ];
  const task = TASKS[Math.floor(Math.random() * TASKS.length)];
  s.prisonTasksDone += 1;
  s.eventLog.push(`День ${s.day}: ${task}. Заданий: ${s.prisonTasksDone}/3.`);

  if (s.prisonTasksDone >= 3) {
    const reduction = Math.ceil(s.prisonSentence * 0.5);
    s.prisonSentence = Math.max(1, s.prisonSentence - reduction);
    s.eventLog.push(`⚖️ УДО! Срок сокращён на ${reduction} дней!`);
  }
  return s;
}
