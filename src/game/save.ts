import type { GameState } from '../types';
import { STOCK_LIST, PROPERTIES_MARKET, CRYPTO_LIST } from '../types';

const SAVE_KEY = 'bank-simulator-save';

function migrateState(state: any): GameState {
  const defaults = createInitialState();

  state.cryptoPortfolio = state.cryptoPortfolio ?? [];
  state.cryptos = state.cryptos ?? defaults.cryptos;
  state.lastExpenseDay = state.lastExpenseDay ?? 0;
  state.sideHustle = state.sideHustle ?? null;
  state.dirtyCash = state.dirtyCash ?? 0;
  state.riskLevel = state.riskLevel ?? 0;
  state.shadowJob = state.shadowJob ?? null;

  if (!state.cryptos || state.cryptos.length === 0) {
    state.cryptos = CRYPTO_LIST.map(c => ({ ...c }));
  }

  state.blackMarketInventory = state.blackMarketInventory ?? [];
  state.lastTaxDay = state.lastTaxDay ?? 0;
  state.taxableIncome = state.taxableIncome ?? 0;
  state.actionPoints = state.actionPoints ?? 10;

  if (state.loans) {
    state.loans.forEach((loan: any) => {
      loan.missedPayments = loan.missedPayments ?? 0;
      if (loan.type) {
        const typeMap: Record<string, string> = { personal: 'other', mortgage: 'property', business: 'business' };
        loan.purpose = typeMap[loan.type] || 'other';
      }
      loan.purpose = loan.purpose ?? 'other';
      loan.borrowerName = loan.borrowerName ?? 'Заёмщик';
      loan.termMonths = loan.termMonths ?? 12;
      loan.startDay = loan.startDay ?? 0;
    });
  }

  state.showChoice = state.showChoice ?? false;
  state.choiceData = state.choiceData ?? null;
  state.inPrison = state.inPrison ?? false;
  state.prisonDays = state.prisonDays ?? 0;
  state.prisonSentence = state.prisonSentence ?? 0;
  state.prisonTasksDone = state.prisonTasksDone ?? 0;
  state.policeBribeAmount = state.policeBribeAmount ?? 0;

  if (state.businesses) {
    state.businesses.forEach((b: any) => {
      b.paperwork = b.paperwork ?? 0;
    });
  }

  return state as GameState;
}

export function createInitialState(): GameState {
  return {
    day: 1,
    cash: 2000,
    job: null,
    jobIndex: -1,
    daysAtJob: 0,
    performance: 50,
    education: [],
    checking: 0,
    savings: 0,
    cds: [],
    loans: [],
    creditScore: 650,
    stockPortfolio: [],
    cryptoPortfolio: [],
    properties: [],
    vehicles: [],
    businesses: [],
    totalEarned: 0,
    totalSpent: 0,
    highestNetWorth: 2000,
    lastExpenseDay: 0,
    sideHustle: null,
    shadowJob: null,
    riskLevel: 0,
    dirtyCash: 0,
    eventLog: ['Добро пожаловать в Bank Simulator! Стройте свою империю.'],
    achievements: [],
    marketData: [{ day: 1, netWorth: 2000, cash: 2000 }],
    stocks: STOCK_LIST.map(s => ({ ...s })),
    cryptos: CRYPTO_LIST.map(c => ({ ...c })),
    propertiesMarket: PROPERTIES_MARKET.map(p => ({ ...p })),
    blackMarketInventory: [],
    lastTaxDay: 0,
    taxableIncome: 0,
    actionPoints: 10,
    showEvent: false,
    eventMessage: '',
    eventType: 'info',
    showChoice: false,
    choiceData: null,
    inPrison: false,
    prisonDays: 0,
    prisonSentence: 0,
    prisonTasksDone: 0,
    policeBribeAmount: 0,
  };
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save game');
  }
}

export function loadGame(): GameState | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return migrateState(parsed);
    }
  } catch {
    console.error('Failed to load game');
  }
  return null;
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
