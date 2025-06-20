
import { Investment, InvestmentStatus } from './types';

export const INITIAL_CASH_BALANCE = 40000;

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: '1',
    stockSymbol: 'LIOC.N0000',
    companyName: 'Lanka IOC PLC',
    sector: 'Consumer Goods & Services',
    buyDate: '2024-07-01',
    quantity: 180, // Adjusted quantity to fit ~20k
    buyPrice: 110, // Adjusted price
    currentMarketPrice: 115,
    perCurrent: '12.5',
    per5YrAvg: '10.2',
    liquidityDailyVol: '450,000',
    buyPointRationale: 'CAL Top Pick, Strong Fundamentals, Energy sector tailwinds',
    targetSellPrice: 150,
    targetSellDate: '2025-07-01',
    exitPointRationale: 'Achieved Target or market shift',
    status: InvestmentStatus.ACTIVE,
    notes: 'Monitor global oil prices and local distribution policies.',
  },
  {
    id: '2',
    stockSymbol: 'TKYO.N0000',
    companyName: 'Tokyo Cement Company (Lanka) PLC',
    sector: 'Construction & Materials',
    buyDate: '2024-07-05',
    quantity: 380, // Adjusted quantity
    buyPrice: 52, // Adjusted price
    currentMarketPrice: 49,
    perCurrent: '15.2',
    per5YrAvg: '18.1',
    liquidityDailyVol: '280,000',
    buyPointRationale: 'CAL Top Pick, Expected construction sector rebound, infrastructure projects',
    targetSellPrice: 70,
    targetSellDate: '2025-12-01',
    exitPointRationale: 'Target met or change in sector outlook',
    status: InvestmentStatus.ACTIVE,
    notes: 'Track government infrastructure spending and raw material costs.',
  },
];

// Calculate cost of initial investments and adjust cash balance.
const initialInvestmentCost = INITIAL_INVESTMENTS.reduce((sum, inv) => sum + inv.quantity * inv.buyPrice, 0);
if (initialInvestmentCost > INITIAL_CASH_BALANCE) {
    console.warn("Initial investments cost exceeds initial cash balance. Please adjust quantities or prices in constants.ts.");
    // This is a design time warning. In a real app, this logic might be handled differently or an error thrown.
    // For now, we will proceed, but the cash balance calculation in App.tsx at startup will be negative if not careful.
    // The App.tsx currently initializes cashBalance with INITIAL_CASH_BALANCE and then deducts costs.
    // Let's ensure INITIAL_CASH_BALANCE in App.tsx reflects cash *after* these initial purchases, or adjust these purchases.
    // For this example, we'll assume the INITIAL_CASH_BALANCE is the total capital, and these purchases are made from it.
    // App.tsx correctly deducts this.
}

export const SECTORS = [
    "Banking",
    "Finance",
    "Insurance",
    "Beverage, Food & Tobacco",
    "Construction & Materials",
    "Chemicals & Pharmaceuticals",
    "Consumer Goods & Services",
    "Diversified Holdings",
    "Energy",
    "Healthcare",
    "Hotels & Travels",
    "Investment Trusts",
    "IT",
    "Land & Property",
    "Manufacturing",
    "Motors",
    "Oil Palms",
    "Plantations",
    "Power & Energy",
    "Services",
    "Telecommunications",
    "Trading",
    "Transportation",
    "Utilities"
];

export const INVESTMENT_STATUS_OPTIONS = [
  { value: InvestmentStatus.ACTIVE, label: 'Active' },
  { value: InvestmentStatus.SOLD, label: 'Sold' },
  { value: InvestmentStatus.PENDING, label: 'Pending' },
];
    