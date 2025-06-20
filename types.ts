
export enum InvestmentStatus {
  ACTIVE = 'Active',
  SOLD = 'Sold',
  PENDING = 'Pending',
}

export interface Investment {
  id: string;
  stockSymbol: string;
  companyName: string;
  sector: string;
  buyDate: string;
  quantity: number;
  buyPrice: number;
  currentMarketPrice: number;
  perCurrent: string; // Can be N/A or a number string
  per5YrAvg: string; // Can be N/A or a number string
  liquidityDailyVol: string; // e.g., "500,000" or "1.2M"
  buyPointRationale: string;
  targetSellPrice?: number;
  targetSellDate?: string;
  exitPointRationale?: string;
  status: InvestmentStatus;
  notes?: string;
}

export interface DashboardData {
  totalPortfolioValue: number;
  totalInvestmentCost: number;
  unrealizedPnL: number; // Renamed from overallPnL
  unrealizedPnLPercentage: number; // Renamed from overallPnLPercentage
  realizedPnL: number; // New: Tracks P&L from sold investments
  cashBalance: number;
  numberOfHoldings: number;
  topPerformers: Investment[];
  worstPerformers: Investment[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

// Props for form fields to ensure consistency
export interface FormFieldProps<T> {
  label: string;
  id: string;
  value: T;
  onChange: (value: T) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  options?: { value: string | number; label: string }[]; // For select
  rows?: number; // For textarea
}

export interface NewsSource {
  title: string;
  uri: string;
}

export interface AIStructuredNewsAnalysis {
  biasReason?: string;
  priceOutlook?: string;
  buyRecommendations?: string[];
  sellRecommendations?: string[];
  overallSummary?: string;
  error?: string; 
}

export interface WatchlistItem {
  id: string;
  stockSymbol: string;
  companyName?: string; // Optional, user can add
  notes?: string; // Optional
}

export interface PortfolioRiskAssessment {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'N/A' | 'Error';
  assessmentSummary: string;
  sectorConcentration?: { sector: string; percentage: number }[];
  stockConcentration?: { stockSymbol: string; percentage: number }[];
}

export enum TransactionType {
  BUY = 'Buy',
  SELL = 'Sell',
  ADD_FUNDS = 'Add Funds',
  WITHDRAW_FUNDS = 'Withdraw Funds',
  DELETE_ACTIVE_INVESTMENT = 'Delete Active Investment (Refund)'
}

export interface Transaction {
  id: string;
  date: string; // ISO string format
  type: TransactionType;
  description: string; // e.g., "Bought 100 LIOC.N0000", "Added funds to cash balance"
  amount: number; // Positive for income/additions, negative for expenses/withdrawals
  relatedInvestmentId?: string; // Optional, for linking to a specific investment
}

export interface FinancialGoalInput {
  targetAmount: number;
  timeframeYears: number;
  riskTolerance: 'Low' | 'Moderate' | 'High';
}

export interface StockSuggestion {
  symbol: string;
  companyName: string;
  rationale: string;
  currentPrice?: number; // Optional, if AI can provide
  targetPrice?: number; // Optional
}

export interface AIGoalPlan {
  strategy?: string;
  suggestedActions?: string[];
  monthlyInvestment?: number;
  assetAllocation?: { [key: string]: string }; // e.g., { "Stocks": "70%", "Bonds": "30%" }
  warnings?: string[];
  stockSuggestions?: StockSuggestion[]; // New field for specific stock ideas
  [key: string]: any; // For any other fields AI might return
}

export interface AIStockComparison {
  comparisonSummary: string;
  [key: string]: any; // For additional structured data if AI provides it
}

export interface PortfolioSnapshot {
  date: string; // YYYY-MM-DD
  totalValue: number;
}

export interface WhatIfScenarioInput {
  action: 'Buy' | 'Sell';
  stockSymbol: string; 
  companyName?: string; 
  sector?: string; 
  quantity: number;
  price: number; 
  investmentToSellId?: string; // Only for 'Sell' action, to identify the specific holding
}

export interface WhatIfAnalysisResult {
  projectedPortfolioValue?: number;
  newCashBalance?: number;
  pnlImpactOnSale?: number; // For sell scenarios, the P&L of this specific hypothetical sale
  riskImpactSummary?: string;
  diversificationChanges?: string; 
  commentary?: string;
  error?: string; 
}

// ---- Existing New Interfaces ----

// 1. AI Stock Screener
export interface StockScreenerCriteria {
  description: string; 
}
export interface AIScreenedStock extends StockSuggestion {
  lastPrice?: number; 
  notesFromPDF?: string; 
}
export interface AIStockScreenerResult {
  suggestions: AIScreenedStock[];
  summary?: string; 
  error?: string;
}

// 2. Market Sentiment Analysis
export interface SectorSentiment {
  sector: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed' | 'N/A';
  reason: string;
  keyDriversFromPDF?: string[]; 
}
export interface MarketSentimentAnalysisResult {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed' | 'N/A';
  overallSummary: string; 
  sectorSentiments?: SectorSentiment[];
  keyObservationsFromPDF?: string[]; 
  error?: string;
}

// 3. Personalized News Feed (from PDF)
export interface PersonalizedNewsFeedItem {
  stockSymbol: string;
  companyName?: string;
  documentExtract: string; 
  source: 'Uploaded Document'; 
  tradingData?: { 
    closedOrLastPrice?: number;
    change?: number;
    changePercent?: number;
    volume?: number;
  };
}
export interface PersonalizedNewsFeedResult {
  feedItems: PersonalizedNewsFeedItem[];
  error?: string;
}

// 4. AI Portfolio Optimizer
export interface OptimizationSuggestion {
  action: 'Buy' | 'Sell' | 'Hold' | 'Reallocate' | 'DiversifyIntoSector' | 'ReduceExposureInSector';
  stockSymbol?: string; 
  targetSector?: string; 
  quantity?: number | string; 
  reasoning: string; 
  priority?: 'High' | 'Medium' | 'Low';
  potentialImpact?: string; 
}
export interface AIPortfolioOptimizerResult {
  suggestions: OptimizationSuggestion[];
  overallStrategyComment?: string; 
  summaryFromPDF?: string; 
  error?: string;
}

// 5. AI Consolidated Daily Briefing
export interface AIBriefingPoint {
  category: string; // e.g., "Market Sentiment", "Portfolio Highlight", "Optimization Tip"
  summary: string;
  detailsLink?: string; // Optional: Link to the relevant section/modal in the app
  importance?: 'High' | 'Medium' | 'Low';
  sourceModule?: string; // e.g., "MarketSentimentAnalyzer", "PortfolioOptimizer"
}

export interface AIConsolidatedBriefing {
  briefingTitle: string; // e.g., "Today's AI Investment Briefing - [Date]"
  points: AIBriefingPoint[];
  generatedAt: string; // ISO string
  error?: string;
}

// ---- Existing Interfaces for Chatbot, Dividend Tracker, Deep PDF Analysis ----

// 1. AI Chatbot Message
export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// 2. AI Chatbot Context (passed to AI)
export interface AIChatContext {
  currentDate: string;
  portfolioSummary: string;
  cashBalance: number;
  pdfContext: string;
  watchlistSummary: string;
  financialGoal: string;
  aiFinancialPlan: string;
  portfolioRiskAssessment: string;
}

// 3. Logged Dividend
export interface LoggedDividend {
  id: string;
  investmentId: string; // Link to the Investment
  stockSymbol: string;
  companyName: string;
  quantity: number; // Number of shares for which dividend was received
  amountPerShare: number; // Dividend amount per share
  exDividendDate?: string; // ISO string, optional
  paymentDate: string; // ISO string
  notes?: string; // Optional user notes
}

// 4. AI Dividend Analysis Result
export interface AIDividendAnalysis {
  estimatedAnnualIncome?: number;
  upcomingDividends?: {
    stockSymbol: string;
    estimatedAmountPerShare?: number;
    estimatedExDate?: string; // YYYY-MM-DD
    confidence?: 'High' | 'Medium' | 'Low';
  }[];
  commentary?: string;
  error?: string;
}

// 5. AI Deep PDF Summary Result
export interface AIDeepPDFSummary {
  fullSummary: string;
  keyThemes: string[];
  significantMentions: {
    item: string; // e.g., company name, economic term
    context: string; // How it was mentioned
  }[];
  error?: string;
}

// ---- New Interfaces for Market Trends and Chat Guide ----

// For 5-Year Market Chart Analysis
export interface AIMarketTrendAnalysis {
  analysisText: string; 
  error?: string;
}

// For AI Chat Guide/Explanation
export interface AIChatGuideExplanation {
  explanationText: string;
  error?: string;
}
