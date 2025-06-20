
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, GroundingChunk, Chat } from "@google/genai";
// Specific imports from pdfjs-dist (only for market index PDF now)
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import { 
    Investment, InvestmentStatus, DashboardData, ChartDataPoint, NewsSource, WatchlistItem, PortfolioRiskAssessment, Transaction, TransactionType, FinancialGoalInput, AIGoalPlan, AIStockComparison, PortfolioSnapshot, WhatIfScenarioInput, WhatIfAnalysisResult, StockSuggestion,
    AIStructuredNewsAnalysis, 
    StockScreenerCriteria, AIStockScreenerResult, MarketSentimentAnalysisResult, PersonalizedNewsFeedResult, AIPortfolioOptimizerResult,
    AIConsolidatedBriefing,
    AIChatMessage, AIChatContext, LoggedDividend, AIDividendAnalysis, AIDeepPDFSummary,
    AIMarketTrendAnalysis, AIChatGuideExplanation
} from './types';
import Dashboard from './components/Dashboard';
import InvestmentTable from './components/InvestmentTable';
import AddInvestmentModal from './components/AddInvestmentModal';
import NewsAnalysisModal from './components/NewsAnalysisModal';
import WatchlistComponent from './components/Watchlist';
import PortfolioRiskAnalyzer from './components/PortfolioRiskAnalyzer';
import TransactionHistory from './components/TransactionHistory';
import FinancialGoalPlanner from './components/FinancialGoalPlanner'; 
import StockComparator from './components/StockComparator';
import HistoricalPerformanceChart from './components/HistoricalPerformanceChart';
import WhatIfScenarioAnalyzer from './components/WhatIfScenarioAnalyzer';
import StockScreener from './components/StockScreener';
import MarketSentimentAnalyzer from './components/MarketSentimentAnalyzer';
import PersonalizedNewsFeed from './components/PersonalizedNewsFeed';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import AIConsolidatedBriefingComponent from './components/AIConsolidatedBriefing'; 
import AIChatbot from './components/AIChatbot';
import AIDividendTracker from './components/AIDividendTracker';
import PDFDeeperAnalysis from './components/PDFDeeperAnalysis';
import MarketTrendsAnalyzer from './components/MarketTrendsAnalyzer'; // New Import
import AIChatGuide from './components/AIChatGuide'; // New Import

import { PlusIcon } from './components/icons/PlusIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { ChartLineIcon } from './components/icons/ChartLineIcon';
import { LightbulbIcon } from './components/icons/LightbulbIcon';
import { FilterIcon } from './components/icons/FilterIcon';
import { TrendingUpIcon } from './components/icons/TrendingUpIcon';
import { RssIcon } from './components/icons/RssIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon'; 
import { ChatBubbleOvalLeftEllipsisIcon } from './components/icons/ChatBubbleOvalLeftEllipsisIcon';
import { BanknotesIcon } from './components/icons/BanknotesIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';

import { INITIAL_CASH_BALANCE, INITIAL_INVESTMENTS } from './constants';

const API_KEY = process.env.API_KEY;
const PORTFOLIO_HISTORY_KEY = 'portfolioHistoryData';
const MAX_HISTORY_ITEMS = 90; 

GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;


const App: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);
  const [cashBalance, setCashBalance] = useState<number>(() => {
    const initialCost = INITIAL_INVESTMENTS.reduce((sum, inv) => sum + inv.quantity * inv.buyPrice, 0);
    return INITIAL_CASH_BALANCE - initialCost;
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>(() => {
    try {
      const savedHistory = localStorage.getItem(PORTFOLIO_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Error loading portfolio history from localStorage:", error);
      return [];
    }
  });

  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [aiChatSession, setAiChatSession] = useState<Chat | null>(null);
  
  const [isPriceUpdatingFromCsv, setIsPriceUpdatingFromCsv] = useState<boolean>(false);
  const [priceUpdateFromCsvStatus, setPriceUpdateFromCsvStatus] = useState<string>('');

  const [selectedStockForNews, setSelectedStockForNews] = useState<Investment | WatchlistItem | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState<boolean>(false);
  const [aiStructuredNewsAnalysis, setAiStructuredNewsAnalysis] = useState<AIStructuredNewsAnalysis | null>(null); 
  const [newsModalSources, setNewsModalSources] = useState<NewsSource[]>([]);
  const [newsModalError, setNewsModalError] = useState<string>('');
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);

  const [uploadedTradingSummaryName, setUploadedTradingSummaryName] = useState<string | null>(null);
  const [tradingSummaryCsvContent, setTradingSummaryCsvContent] = useState<string | null>(null);
  const [isTradingSummaryCsvProcessing, setIsTradingSummaryCsvProcessing] = useState<boolean>(false);
  const [tradingSummaryCsvProcessingError, setTradingSummaryCsvProcessingError] = useState<string | null>(null);
  const tradingSummaryCsvFileInputRef = React.useRef<HTMLInputElement>(null);

  const [uploadedMarketIndexName, setUploadedMarketIndexName] = useState<string | null>(null);
  const [marketIndexSummaryPdfText, setMarketIndexSummaryPdfText] = useState<string | null>(null);
  const [isMarketIndexProcessing, setIsMarketIndexProcessing] = useState<boolean>(false);
  const [marketIndexProcessingError, setMarketIndexProcessingError] = useState<string | null>(null);
  const marketIndexFileInputRef = React.useRef<HTMLInputElement>(null);

  const [personalizedNewsPdfName, setPersonalizedNewsPdfName] = useState<string | null>(null);
  const [personalizedNewsPdfText, setPersonalizedNewsPdfText] = useState<string | null>(null);
  const [isPersonalizedNewsPdfProcessing, setIsPersonalizedNewsPdfProcessing] = useState<boolean>(false);
  const [personalizedNewsPdfProcessingError, setPersonalizedNewsPdfProcessingError] = useState<string | null>(null);
  const personalizedNewsPdfFileInputRef = React.useRef<HTMLInputElement>(null);


  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isWatchlistAiLoading, setIsWatchlistAiLoading] = useState<{[key: string]: boolean}>({});

  const [portfolioRisk, setPortfolioRisk] = useState<PortfolioRiskAssessment | null>(null);
  const [isRiskAnalysisLoading, setIsRiskAnalysisLoading] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return INITIAL_INVESTMENTS.map(inv => ({
      id: crypto.randomUUID(),
      date: new Date(inv.buyDate).toISOString(),
      type: TransactionType.BUY,
      description: `Initial purchase: ${inv.quantity} ${inv.stockSymbol} @ LKR ${inv.buyPrice.toFixed(2)}`,
      amount: -(inv.quantity * inv.buyPrice), 
      relatedInvestmentId: inv.id,
    }));
  });

  const [financialGoalInput, setFinancialGoalInput] = useState<FinancialGoalInput | null>(null);
  const [aiGoalPlan, setAiGoalPlan] = useState<AIGoalPlan | null>(null);
  const [isGoalPlanLoading, setIsGoalPlanLoading] = useState<boolean>(false);
  const [goalPlanError, setGoalPlanError] = useState<string | null>(null);

  const [aiStockComparison, setAiStockComparison] = useState<AIStockComparison | null>(null);
  const [isStockComparisonLoading, setIsStockComparisonLoading] = useState<boolean>(false);
  const [stockComparisonError, setStockComparisonError] = useState<string | null>(null);

  const [whatIfAnalysisResult, setWhatIfAnalysisResult] = useState<WhatIfAnalysisResult | null>(null);
  const [isWhatIfLoading, setIsWhatIfLoading] = useState<boolean>(false);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);

  const [stockScreenerResult, setStockScreenerResult] = useState<AIStockScreenerResult | null>(null);
  const [isStockScreenerLoading, setIsStockScreenerLoading] = useState<boolean>(false);
  const [stockScreenerError, setStockScreenerError] = useState<string | null>(null);

  const [marketSentimentResult, setMarketSentimentResult] = useState<MarketSentimentAnalysisResult | null>(null);
  const [isMarketSentimentLoading, setIsMarketSentimentLoading] = useState<boolean>(false);
  const [marketSentimentError, setMarketSentimentError] = useState<string | null>(null);

  const [personalizedNewsFeed, setPersonalizedNewsFeed] = useState<PersonalizedNewsFeedResult | null>(null);
  const [isPersonalizedNewsLoading, setIsPersonalizedNewsLoading] = useState<boolean>(false);
  const [personalizedNewsError, setPersonalizedNewsError] = useState<string | null>(null);

  const [portfolioOptimizerResult, setPortfolioOptimizerResult] = useState<AIPortfolioOptimizerResult | null>(null);
  const [isPortfolioOptimizerLoading, setIsPortfolioOptimizerLoading] = useState<boolean>(false);
  const [portfolioOptimizerError, setPortfolioOptimizerError] = useState<string | null>(null);

  const [aiConsolidatedBriefing, setAiConsolidatedBriefing] = useState<AIConsolidatedBriefing | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState<boolean>(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [loggedDividends, setLoggedDividends] = useState<LoggedDividend[]>([]);
  const [aiDividendAnalysis, setAiDividendAnalysis] = useState<AIDividendAnalysis | null>(null);
  const [isDividendAnalysisLoading, setIsDividendAnalysisLoading] = useState<boolean>(false);
  const [dividendAnalysisError, setDividendAnalysisError] = useState<string | null>(null);

  const [aiDeepPDFSummary, setAiDeepPDFSummary] = useState<AIDeepPDFSummary | null>(null);
  const [isDeepPDFAnalysisLoading, setIsDeepPDFAnalysisLoading] = useState<boolean>(false);
  const [deepPDFAnalysisError, setDeepPDFAnalysisError] = useState<string | null>(null);

  // State for Market Trends Analyzer
  const [aiMarketTrendAnalysis, setAiMarketTrendAnalysis] = useState<AIMarketTrendAnalysis | null>(null);
  const [isMarketTrendAnalysisLoading, setIsMarketTrendAnalysisLoading] = useState<boolean>(false);
  const [marketTrendAnalysisError, setMarketTrendAnalysisError] = useState<string | null>(null);

  // State for AI Chat Guide
  const [aiChatGuideExplanation, setAiChatGuideExplanation] = useState<AIChatGuideExplanation | null>(null);
  const [isChatGuideLoading, setIsChatGuideLoading] = useState<boolean>(false);
  const [chatGuideError, setChatGuideError] = useState<string | null>(null);


  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => [{ ...transaction, id: crypto.randomUUID(), date: new Date().toISOString() }, ...prev ]);
  };

  const initializeAIChat = useCallback(() => {
    if (ai && !aiChatSession) {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash-preview-04-17',
            config: {
                systemInstruction: `You are a helpful AI Investment Portfolio Assistant for a user in Sri Lanka. 
                Analyze the provided context (portfolio, uploaded document(s) summary, watchlist, financial goals, risk assessment) to answer user queries. 
                Be concise and informative. If you cannot answer based on the context, politely state that.
                When referring to document content, explicitly mention its source (e.g., "According to the Trading Summary (CSV Data)...", "The Market Index PDF indicates...").
                Your responses should be formatted in simple markdown if needed for clarity (e.g., lists, bolding). Do not use complex markdown like tables.
                Keep your answers brief and to the point unless asked for details.`,
            },
        });
        setAiChatSession(chat);
    }
  }, [ai, aiChatSession]);

  useEffect(() => {
    if (ai && !aiChatSession) {
      initializeAIChat();
    }
  }, [ai, aiChatSession, initializeAIChat]);

  useEffect(() => {
    if (API_KEY) {
      try {
        const genAI = new GoogleGenAI({ apiKey: API_KEY });
        setAi(genAI);
      } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
        const errorMsg = "Error initializing AI. Ensure API key is valid.";
        setNewsModalError(errorMsg);
        setChatError("AI Chatbot disabled. " + errorMsg);
        setDividendAnalysisError("AI Dividend Tracker disabled. " + errorMsg);
        setDeepPDFAnalysisError("AI Deep PDF Analysis disabled. " + errorMsg);
        setGoalPlanError(errorMsg);
        setStockComparisonError(errorMsg);
        setWhatIfError(errorMsg);
        setStockScreenerError(errorMsg);
        setMarketSentimentError(errorMsg);
        setPersonalizedNewsError(errorMsg);
        setPortfolioOptimizerError(errorMsg);
        setBriefingError(errorMsg);
        setMarketTrendAnalysisError(errorMsg); // New
        setChatGuideError(errorMsg); // New
      }
    } else {
      console.warn("API_KEY is not available. AI features will be disabled.");
      const unavailableMsg = "AI features unavailable. API key missing.";
      setNewsModalError(unavailableMsg); 
      setChatError(unavailableMsg);
      setDividendAnalysisError(unavailableMsg);
      setDeepPDFAnalysisError(unavailableMsg);
      setGoalPlanError(unavailableMsg);
      setStockComparisonError(unavailableMsg);
      setWhatIfError(unavailableMsg);
      setStockScreenerError(unavailableMsg);
      setMarketSentimentError(unavailableMsg);
      setPersonalizedNewsError(unavailableMsg);
      setPortfolioOptimizerError(unavailableMsg);
      setBriefingError(unavailableMsg);
      setMarketTrendAnalysisError(unavailableMsg); // New
      setChatGuideError(unavailableMsg); // New
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PORTFOLIO_HISTORY_KEY, JSON.stringify(portfolioHistory));
    } catch (error) {
      console.error("Error saving portfolio history to localStorage:", error);
    }
  }, [portfolioHistory]);

  const calculateDashboardData = useCallback(() => {
    const activeInvestments = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE);
    const soldInvestments = investments.filter(inv => inv.status === InvestmentStatus.SOLD);

    const totalPortfolioValue = activeInvestments.reduce((sum, inv) => sum + inv.quantity * inv.currentMarketPrice, 0);
    const totalInvestmentCostActive = activeInvestments.reduce((sum, inv) => sum + inv.quantity * inv.buyPrice, 0);
    const unrealizedPnL = totalPortfolioValue - totalInvestmentCostActive;
    const unrealizedPnLPercentage = totalInvestmentCostActive > 0 ? (unrealizedPnL / totalInvestmentCostActive) * 100 : 0;
    
    const realizedPnL = soldInvestments.reduce((sum, inv) => {
      const proceeds = inv.quantity * inv.currentMarketPrice; 
      const cost = inv.quantity * inv.buyPrice;
      return sum + (proceeds - cost);
    }, 0);

    const investmentsWithPnl = activeInvestments.map(inv => {
      const cost = inv.quantity * inv.buyPrice;
      const currentValue = inv.quantity * inv.currentMarketPrice;
      const pnl = currentValue - cost;
      const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...inv, pnl, pnlPercentage };
    });

    const sortedByPnlPercentage = [...investmentsWithPnl].sort((a, b) => (b.pnlPercentage ?? 0) - (a.pnlPercentage ?? 0));
    const topPerformers = sortedByPnlPercentage.slice(0, 3);
    const worstPerformers = sortedByPnlPercentage.slice(-3).reverse();

    setDashboardData({
      totalPortfolioValue,
      totalInvestmentCost: totalInvestmentCostActive,
      unrealizedPnL,
      unrealizedPnLPercentage,
      realizedPnL,
      cashBalance,
      numberOfHoldings: activeInvestments.length,
      topPerformers,
      worstPerformers,
    });

    const today = new Date().toISOString().split('T')[0];
    setPortfolioHistory(prevHistory => {
      const lastSnapshot = prevHistory[prevHistory.length - 1];
      if (!lastSnapshot || lastSnapshot.date !== today) {
        const newSnapshot: PortfolioSnapshot = { date: today, totalValue: totalPortfolioValue };
        const updatedHistory = [...prevHistory, newSnapshot];
        if (updatedHistory.length > MAX_HISTORY_ITEMS) {
          return updatedHistory.slice(updatedHistory.length - MAX_HISTORY_ITEMS);
        }
        return updatedHistory;
      }
      return prevHistory;
    });

  }, [investments, cashBalance]); 

  useEffect(() => {
    calculateDashboardData();
  }, [calculateDashboardData]); 

  const handleAddInvestment = (newInvestmentData: Omit<Investment, 'id' | 'status'>) => {
    const cost = newInvestmentData.quantity * newInvestmentData.buyPrice;
    if (cashBalance >= cost) {
      const investmentWithId: Investment = {
        ...newInvestmentData,
        id: crypto.randomUUID(),
        status: InvestmentStatus.ACTIVE,
      };
      setInvestments(prev => [...prev, investmentWithId]);
      setCashBalance(prev => prev - cost);
      addTransaction({
        type: TransactionType.BUY,
        description: `Bought ${investmentWithId.quantity} ${investmentWithId.stockSymbol} @ LKR ${investmentWithId.buyPrice.toFixed(2)}`,
        amount: -cost,
        relatedInvestmentId: investmentWithId.id,
      });
      setIsModalOpen(false);
    } else {
      alert("Insufficient cash balance to make this investment.");
    }
  };

  const handleUpdateInvestment = (updatedInvestment: Investment) => {
    setInvestments(prev => prev.map(inv => inv.id === updatedInvestment.id ? updatedInvestment : inv));
  };

  const handleSellInvestment = (investmentId: string, sellPrice: number) => {
    const investmentToSell = investments.find(inv => inv.id === investmentId);
    if (investmentToSell) {
      const proceeds = investmentToSell.quantity * sellPrice;
      setCashBalance(prev => prev + proceeds);
      setInvestments(prev => 
        prev.map(inv => 
          inv.id === investmentId 
          ? { ...inv, status: InvestmentStatus.SOLD, currentMarketPrice: sellPrice, notes: `${inv.notes || ''} Sold at ${sellPrice.toLocaleString()} LKR.` } 
          : inv
        )
      );
      addTransaction({
        type: TransactionType.SELL,
        description: `Sold ${investmentToSell.quantity} ${investmentToSell.stockSymbol} @ LKR ${sellPrice.toFixed(2)}`,
        amount: proceeds,
        relatedInvestmentId: investmentToSell.id,
      });
    }
  };
  
  const handleDeleteInvestment = (investmentId: string) => {
    const investmentToRemove = investments.find(inv => inv.id === investmentId);
    if (investmentToRemove) {
        if (investmentToRemove.status === InvestmentStatus.ACTIVE) {
            const costToRefund = investmentToRemove.quantity * investmentToRemove.buyPrice;
            setCashBalance(prev => prev + costToRefund);
             addTransaction({
                type: TransactionType.DELETE_ACTIVE_INVESTMENT,
                description: `Deleted active investment (refunded): ${investmentToRemove.quantity} ${investmentToRemove.stockSymbol}`,
                amount: costToRefund,
                relatedInvestmentId: investmentToRemove.id,
            });
        }
        setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
    }
  };

  const handleAddFunds = () => {
    const amountStr = window.prompt("Enter amount to add to cash balance (LKR):");
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        setCashBalance(prev => prev + amount);
        addTransaction({
          type: TransactionType.ADD_FUNDS,
          description: `Added LKR ${amount.toFixed(2)} to cash balance.`,
          amount: amount,
        });
      } else {
        alert("Invalid amount entered.");
      }
    }
  };

  const handleWithdrawFunds = () => {
    const amountStr = window.prompt("Enter amount to withdraw from cash balance (LKR):");
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        if (cashBalance >= amount) {
          setCashBalance(prev => prev - amount);
          addTransaction({
            type: TransactionType.WITHDRAW_FUNDS,
            description: `Withdrew LKR ${amount.toFixed(2)} from cash balance.`,
            amount: -amount, 
          });
        } else {
          alert("Insufficient cash balance for this withdrawal.");
        }
      } else {
        alert("Invalid amount entered.");
      }
    }
  };
  
  const getCombinedDocumentContext = useCallback(() => {
    let combinedText = "";
    if (tradingSummaryCsvContent) {
        combinedText += "--- START OF DAILY SYMBOL TRADING SUMMARY (CSV DATA) ---\n";
        combinedText += tradingSummaryCsvContent.substring(0, 15000); 
        combinedText += "\n--- END OF DAILY SYMBOL TRADING SUMMARY (CSV DATA) ---\n\n";
    }
    if (marketIndexSummaryPdfText) {
        combinedText += "--- START OF MARKET INDEX SUMMARY (PDF DATA) ---\n";
        combinedText += marketIndexSummaryPdfText.substring(0, 15000); 
        combinedText += "\n--- END OF MARKET INDEX SUMMARY (PDF DATA) ---";
    }
    return combinedText || null;
  }, [tradingSummaryCsvContent, marketIndexSummaryPdfText]);

  const handleFetchNewsAndAnalysis = async (item: Investment | WatchlistItem) => {
    if (!ai) {
      setNewsModalError("AI model not initialized. API key might be missing.");
      setIsNewsModalOpen(true);
      return;
    }
    
    setSelectedStockForNews(item);
    setIsNewsModalOpen(true);
    setIsNewsLoading(true);
    setAiStructuredNewsAnalysis(null); 
    setNewsModalSources([]);
    setNewsModalError('');

    const stockSymbol = item.stockSymbol;
    const companyName = 'companyName' in item ? item.companyName : stockSymbol;
    let promptContent = "";
    let useGrounding = true;
    let generationConfig: { tools?: any[], responseMimeType?: string } = {};

    const jsonPromptStructure = `
Provide your analysis in JSON format with the following structure:
{
  "biasReason": "Explain any specific information or factor (from uploaded document(s) or general news) that is heavily influencing your analysis for this stock.",
  "priceOutlook": "Describe the potential short-to-medium term price direction (e.g., Bullish, Bearish, Neutral, Volatile) and explain why.",
  "buyRecommendations": ["Suggest specific buy price points or conditions, if any. Provide brief rationale for each."],
  "sellRecommendations": ["Suggest specific sell price targets or conditions, if any. Provide brief rationale for each."],
  "overallSummary": "A concise overall summary of your findings and sentiment for this stock. Include a general sentiment (Positive, Negative, Neutral) if possible."
}
Ensure all string values are properly escaped for JSON validity. If information for a field is unavailable, use an empty string or omit for arrays.
`;
    const combinedDocumentContext = getCombinedDocumentContext(); 
    if (combinedDocumentContext) {
        promptContent = `Analyze the provided document context (which may include CSV trading data and/or PDF market summaries) regarding the Sri Lankan stock market, focusing specifically on any information relevant to ${companyName} (${stockSymbol}). 
        ${jsonPromptStructure}
        Base your analysis ONLY on the provided document(s).
        
        Uploaded Document Context (CSV Trading Summary & Market Index PDF - first 30000 chars total):
        ---
        ${combinedDocumentContext.substring(0, 30000)} 
        ---
        `;
        useGrounding = false; 
        generationConfig.responseMimeType = "application/json";
    } else {
        promptContent = `Provide a structured news analysis for the Sri Lankan stock ${companyName} (${stockSymbol}). 
        Focus on recent news from Google Search that might impact its performance.
        ${jsonPromptStructure}
        `;
        generationConfig.tools = [{ googleSearch: {} }];
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: promptContent,
        config: generationConfig
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      try {
        const parsedAnalysis = JSON.parse(jsonStr) as AIStructuredNewsAnalysis;
        setAiStructuredNewsAnalysis(parsedAnalysis);
      } catch (parseError) {
        console.error("Error parsing AI's JSON response:", parseError, "Raw response:", jsonStr);
        setAiStructuredNewsAnalysis({
          error: "AI returned an invalid format. Displaying raw text.",
          overallSummary: response.text 
        });
      }
      
      if (useGrounding && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        const sources: NewsSource[] = response.candidates[0].groundingMetadata.groundingChunks
            .map((chunk: GroundingChunk) => ({
                title: chunk.web?.title || chunk.web?.uri || "Unknown Source",
                uri: chunk.web?.uri || "#",
            }))
            .filter(source => source.uri !== "#"); 
        setNewsModalSources(sources);
      }

    } catch (error) {
      console.error("Error fetching news and analysis:", error);
      setNewsModalError(`Failed to fetch analysis for ${stockSymbol}. ${(error as Error).message}`);
      setAiStructuredNewsAnalysis({ error: `Failed to fetch analysis: ${(error as Error).message}` });
    } finally {
      setIsNewsLoading(false);
    }
  };
  
  const parseTradingSummaryCsvForPrices = (csvText: string): Map<string, number> => {
    const prices = new Map<string, number>();
    if (!csvText) return prices;

    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
        console.warn("CSV content is too short or empty. Cannot parse prices.");
        return prices;
    }
    
    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, '').trim());

    let symbolIndex = headers.findIndex(h => h.toLowerCase() === 'symbol');
    let priceIndex = headers.findIndex(h => {
        const lowerH = h.toLowerCase();
        return lowerH.includes('last trade') && lowerH.includes('(rs.)');
    });

    if (symbolIndex === -1) { 
      symbolIndex = headers.findIndex(h => h.toLowerCase().includes('symbol'));
    }
    if (priceIndex === -1) { 
      priceIndex = headers.findIndex(h => {
        const lowerH = h.toLowerCase();
        return (lowerH.includes('last') || lowerH.includes('close')) && (lowerH.includes('price') || lowerH.includes('(rs.)'));
      });
    }
    
    if (symbolIndex === -1 || priceIndex === -1) {
        console.error("Required columns ('Symbol' and/or 'Last Trade (Rs.)') not found in CSV header. Headers found:", headers);
        setPriceUpdateFromCsvStatus("Error: Could not find 'Symbol' or 'Last Trade' price columns in the CSV header. Please check the CSV file format.");
        return prices;
    }

    for (let i = 1; i < lines.length; i++) {
        const dataLine = lines[i];
        const values = dataLine.split(',').map(v => v.trim().replace(/^"|"$/g, '').trim());

        if (values.length > Math.max(symbolIndex, priceIndex)) {
            const symbol = values[symbolIndex];
            const priceStr = values[priceIndex];
            
            if (symbol && priceStr) {
                const cleanedPriceStr = priceStr.replace(/[^0-9.-]/g, ''); 
                const price = parseFloat(cleanedPriceStr);

                if (symbol.match(/^[A-Z0-9]{2,6}\.[NXW]\d{4}$/i) && !isNaN(price) && price > 0) { 
                    prices.set(symbol.toUpperCase(), price);
                }
            }
        }
    }
    return prices;
  };

  const handleUpdatePortfolioFromCsvSummary = () => {
    if (!tradingSummaryCsvContent) {
        setPriceUpdateFromCsvStatus("Trading Summary CSV not uploaded. Please upload it first.");
        return;
    }
    setIsPriceUpdatingFromCsv(true);
    setPriceUpdateFromCsvStatus("Processing Trading Summary CSV and updating prices...");

    try {
        const extractedPrices = parseTradingSummaryCsvForPrices(tradingSummaryCsvContent);
        if (extractedPrices.size === 0 && tradingSummaryCsvContent.length > 0) { 
             if (!priceUpdateFromCsvStatus.startsWith("Error:")) { 
                setPriceUpdateFromCsvStatus("Could not find any valid stock prices in the Trading Summary CSV. Please check the file content and format.");
             }
            setIsPriceUpdatingFromCsv(false);
            return;
        } else if (extractedPrices.size === 0) { 
            setPriceUpdateFromCsvStatus("CSV file is empty or no prices could be extracted. Ensure correct format.");
            setIsPriceUpdatingFromCsv(false);
            return;
        }

        let updatedCount = 0;
        let notFoundCount = 0;
        const updatedInvestments = investments.map(inv => {
            if (inv.status === InvestmentStatus.ACTIVE && extractedPrices.has(inv.stockSymbol.toUpperCase())) {
                const newPrice = extractedPrices.get(inv.stockSymbol.toUpperCase())!;
                if (inv.currentMarketPrice !== newPrice) {
                    updatedCount++;
                    return { ...inv, currentMarketPrice: newPrice };
                }
            } else if (inv.status === InvestmentStatus.ACTIVE && !extractedPrices.has(inv.stockSymbol.toUpperCase())) {
                notFoundCount++;
            }
            return inv;
        });

        setInvestments(updatedInvestments);
        let statusMsg = `Price update from CSV complete. ${updatedCount} investment(s) updated.`;
        if (notFoundCount > 0) {
            statusMsg += ` ${notFoundCount} active investment(s) not found in the summary.`;
        }
        setPriceUpdateFromCsvStatus(statusMsg);

    } catch (error) {
        console.error("Error updating prices from CSV summary:", error);
        setPriceUpdateFromCsvStatus(`Error processing CSV: ${(error as Error).message}`);
    } finally {
        setIsPriceUpdatingFromCsv(false);
    }
  };

  const handleGenerateAIBriefing = useCallback(async () => {
    if (!ai) {
        setBriefingError("AI model not initialized.");
        setIsBriefingLoading(false);
        return;
    }
    setIsBriefingLoading(true);
    setAiConsolidatedBriefing(null);
    setBriefingError(null);
    
    const combinedDocumentContext = getCombinedDocumentContext(); 

    let context = "Current Date: " + new Date().toLocaleDateString('si-LK') + "\n";
    if (combinedDocumentContext) {
        context += `Uploaded Document Context (first 2000 chars total from combined sources like CSV Trading Data and/or PDF Market Index):\n---\n${combinedDocumentContext.substring(0, 2000)}\n---\n`;
    }
    if (dashboardData) {
        context += `Portfolio Value: LKR ${dashboardData.totalPortfolioValue.toLocaleString()}.\n`;
    }
    if (marketSentimentResult) {
        context += `Market Sentiment: ${marketSentimentResult.overallSentiment} - ${marketSentimentResult.overallSummary.substring(0,150)}\n`;
    }
    if (personalizedNewsFeed && personalizedNewsFeed.feedItems.length > 0) {
        const topNews = personalizedNewsFeed.feedItems.slice(0,2).map(item => `${item.stockSymbol}: ${item.documentExtract.substring(0,100)}...`).join('\n');
        context += `Key Portfolio/Watchlist News (from Personalized News Document):\n${topNews}\n`;
    }
    if (portfolioOptimizerResult && portfolioOptimizerResult.suggestions.length > 0) {
        const topSuggestion = portfolioOptimizerResult.suggestions[0];
        context += `Top Optimization Tip: ${topSuggestion.action} ${topSuggestion.stockSymbol || topSuggestion.targetSector || ''} - ${topSuggestion.reasoning.substring(0,100)}...\n`;
    }
    
    const prompt = `
    You are an AI Investment Portfolio Assistant for a user in Sri Lanka. 
    Based on the following consolidated context, provide a concise daily briefing.
    The briefing should highlight 3-5 key insights or actionable points for the user.
    Format the response STRICTLY as valid JSON following this exact structure: 
    {
      "briefingTitle": "Today's AI Investment Briefing - [Date]", 
      "points": [
        {"category": "Category Name", "summary": "Brief summary of the point.", "importance": "High|Medium|Low", "sourceModule": "RelevantModuleName (e.g. MarketSentiment, DocumentAnalysis, PersonalizedNews)"}
      ],
      "generatedAt": "ISO_Date_String"
    }
    Ensure all string values in the JSON are properly escaped. Each object in "points" must follow the structure.
    If critical information is missing (e.g., no general uploaded documents, no analysis results), state that in a point's summary.

    Context:
    ${context}
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        
        const parsedBriefing = JSON.parse(jsonStr) as AIConsolidatedBriefing;
        if (!parsedBriefing.generatedAt) parsedBriefing.generatedAt = new Date().toISOString();
        if (!parsedBriefing.briefingTitle) parsedBriefing.briefingTitle = `Today's AI Investment Briefing - ${new Date(parsedBriefing.generatedAt).toLocaleDateString('si-LK')}`;

        setAiConsolidatedBriefing(parsedBriefing);

    } catch (error) {
        console.error("Error generating AI briefing:", error);
        setBriefingError(`Failed to generate briefing: ${(error as Error).message}`);
    } finally {
        setIsBriefingLoading(false);
    }
  }, [ai, getCombinedDocumentContext, dashboardData, marketSentimentResult, personalizedNewsFeed, portfolioOptimizerResult]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'tradingSummary' | 'marketIndexSummary' | 'personalizedNewsPdf') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (fileType === 'tradingSummary') {
        if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
            setTradingSummaryCsvProcessingError("Invalid file type. Please upload a CSV file for Trading Summary.");
            setUploadedTradingSummaryName(null);
            setTradingSummaryCsvContent(null);
            if (tradingSummaryCsvFileInputRef.current) tradingSummaryCsvFileInputRef.current.value = "";
            return;
        }
        setIsTradingSummaryCsvProcessing(true);
        setTradingSummaryCsvProcessingError(null);
        setUploadedTradingSummaryName(file.name);
        setTradingSummaryCsvContent(null);
        try {
            const text = await file.text();
            setTradingSummaryCsvContent(text);
            handleGenerateAIBriefing(); 
        } catch (error) {
            console.error(`Error processing Trading Summary CSV:`, error);
            setTradingSummaryCsvProcessingError(`Failed to process CSV: ${(error as Error).message}`);
            setUploadedTradingSummaryName(null);
            setTradingSummaryCsvContent(null);
        } finally {
            setIsTradingSummaryCsvProcessing(false);
            if (tradingSummaryCsvFileInputRef.current) tradingSummaryCsvFileInputRef.current.value = ""; 
        }
    } else if (fileType === 'marketIndexSummary') { 
        if (file.type !== 'application/pdf') {
            setMarketIndexProcessingError("Invalid file type. Please upload a PDF for Market Index Summary.");
            setUploadedMarketIndexName(null);
            setMarketIndexSummaryPdfText(null);
            if (marketIndexFileInputRef.current) marketIndexFileInputRef.current.value = "";
            return;
        }
        setIsMarketIndexProcessing(true);
        setMarketIndexProcessingError(null);
        setUploadedMarketIndexName(file.name);
        setMarketIndexSummaryPdfText(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
            }
            setMarketIndexSummaryPdfText(text);
            handleGenerateAIBriefing(); 
        } catch (error) {
            console.error(`Error processing Market Index PDF:`, error);
            setMarketIndexProcessingError(`Failed to process PDF: ${(error as Error).message}`);
            setUploadedMarketIndexName(null);
            setMarketIndexSummaryPdfText(null);
        } finally {
            setIsMarketIndexProcessing(false);
            if (marketIndexFileInputRef.current) marketIndexFileInputRef.current.value = "";
        }
    } else if (fileType === 'personalizedNewsPdf') {
        if (file.type !== 'application/pdf') {
            setPersonalizedNewsPdfProcessingError("Invalid file type. Please upload a PDF for Personalized News.");
            setPersonalizedNewsPdfName(null);
            setPersonalizedNewsPdfText(null);
            if (personalizedNewsPdfFileInputRef.current) personalizedNewsPdfFileInputRef.current.value = "";
            return;
        }
        setIsPersonalizedNewsPdfProcessing(true);
        setPersonalizedNewsPdfProcessingError(null);
        setPersonalizedNewsPdfName(file.name);
        setPersonalizedNewsPdfText(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
            }
            setPersonalizedNewsPdfText(text);
        } catch (error) {
            console.error(`Error processing Personalized News PDF:`, error);
            setPersonalizedNewsPdfProcessingError(`Failed to process PDF: ${(error as Error).message}`);
            setPersonalizedNewsPdfName(null);
            setPersonalizedNewsPdfText(null);
        } finally {
            setIsPersonalizedNewsPdfProcessing(false);
            if (personalizedNewsPdfFileInputRef.current) personalizedNewsPdfFileInputRef.current.value = "";
        }
    }
  };

  const handleRemoveDocument = (fileType: 'tradingSummary' | 'marketIndexSummary' | 'personalizedNewsPdf') => {
    if (fileType === 'tradingSummary') {
        setUploadedTradingSummaryName(null);
        setTradingSummaryCsvContent(null);
        setTradingSummaryCsvProcessingError(null);
        if (tradingSummaryCsvFileInputRef.current) tradingSummaryCsvFileInputRef.current.value = "";
    } else if (fileType === 'marketIndexSummary') {
        setUploadedMarketIndexName(null);
        setMarketIndexSummaryPdfText(null);
        setMarketIndexProcessingError(null);
        if (marketIndexFileInputRef.current) marketIndexFileInputRef.current.value = "";
    } else if (fileType === 'personalizedNewsPdf') {
        setPersonalizedNewsPdfName(null);
        setPersonalizedNewsPdfText(null);
        setPersonalizedNewsPdfProcessingError(null);
        if (personalizedNewsPdfFileInputRef.current) personalizedNewsPdfFileInputRef.current.value = "";
        setPersonalizedNewsFeed(null); 
    }

    const csvStillExists = fileType !== 'tradingSummary' && !!tradingSummaryCsvContent;
    const marketIndexPdfStillExists = fileType !== 'marketIndexSummary' && !!marketIndexSummaryPdfText;

    if (csvStillExists || marketIndexPdfStillExists) {
        setTimeout(handleGenerateAIBriefing, 100); 
    } else if (!tradingSummaryCsvContent && !marketIndexSummaryPdfText) { 
        setAiConsolidatedBriefing(null); 
    }
  };
  
  const handleAddWatchlistItem = (item: Omit<WatchlistItem, 'id'>) => {
    const newItem: WatchlistItem = { ...item, id: crypto.randomUUID() };
    setWatchlist(prev => [...prev, newItem]);
  };

  const handleRemoveWatchlistItem = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };
  
  const handleAnalyzePortfolioRisk = async () => {
    if (!ai) {
        setPortfolioRisk({ riskLevel: 'Error', assessmentSummary: "AI model not initialized." });
        return;
    }
    setIsRiskAnalysisLoading(true);
    setPortfolioRisk(null);

    const activePortfolioDetails = investments
        .filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => `${inv.stockSymbol}: ${inv.quantity} units, Current Price LKR ${inv.currentMarketPrice.toFixed(2)}, Sector: ${inv.sector}, Total Value LKR ${(inv.quantity * inv.currentMarketPrice).toFixed(2)}`)
        .join('\n');

    if (!activePortfolioDetails) {
        setPortfolioRisk({ riskLevel: 'N/A', assessmentSummary: "No active investments to analyze." });
        setIsRiskAnalysisLoading(false);
        return;
    }
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let prompt = `Analyze the risk of the following Sri Lankan stock portfolio. Current cash balance is LKR ${cashBalance.toFixed(2)}.
Portfolio:
${activePortfolioDetails}

Provide:
1.  An overall risk level (Low, Moderate, High).
2.  A summary explaining the assessment, considering diversification, liquidity, and market conditions for Sri Lanka.
3.  Suggest top 3 sector concentrations by percentage of total portfolio value.
4.  Suggest top 3 stock concentrations by percentage of total portfolio value.
`;

    if (combinedDocumentContext) {
        prompt += `
Additionally, consider the following context from uploaded document(s) (e.g., CSV trading data, PDF market summaries):
---
${combinedDocumentContext.substring(0, 10000)} 
---
How does this document context influence the risk assessment, if at all?
`;
    }
    prompt += "\nFormat the response as JSON: {\"riskLevel\": \"Low|Moderate|High\", \"assessmentSummary\": \"text\", \"sectorConcentration\": [{\"sector\": \"name\", \"percentage\": value}], \"stockConcentration\": [{\"stockSymbol\": \"symbol\", \"percentage\": value}] } Ensure all string values are properly escaped.";

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const parsedRisk = JSON.parse(jsonStr) as PortfolioRiskAssessment;
        setPortfolioRisk(parsedRisk);
    } catch (error) {
        console.error("Error analyzing portfolio risk:", error);
        setPortfolioRisk({ riskLevel: 'Error', assessmentSummary: `Failed to analyze risk: ${(error as Error).message}` });
    } finally {
        setIsRiskAnalysisLoading(false);
    }
  };

  const handleGetAIGoalPlan = async (goalInput: FinancialGoalInput) => {
    if (!ai) {
        setGoalPlanError("AI model not initialized. Cannot generate plan.");
        setIsGoalPlanLoading(false);
        return;
    }
    setIsGoalPlanLoading(true);
    setAiGoalPlan(null);
    setGoalPlanError(null);
    setFinancialGoalInput(goalInput);

    const activePortfolioSummary = investments
        .filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => `${inv.stockSymbol} (${inv.companyName}, Sector: ${inv.sector}): ${inv.quantity} units, Current Value LKR ${(inv.quantity * inv.currentMarketPrice).toFixed(2)}`)
        .join('\n');
    
    const totalPortfolioValue = dashboardData?.totalPortfolioValue || 0;
    const combinedDocumentContext = getCombinedDocumentContext(); 

    let prompt = `
    I am creating a financial plan. My goal is to reach LKR ${goalInput.targetAmount.toLocaleString()} in ${goalInput.timeframeYears} years. 
    My risk tolerance is ${goalInput.riskTolerance}.
    My current portfolio value is LKR ${totalPortfolioValue.toLocaleString()}.
    Current cash balance: LKR ${cashBalance.toLocaleString()}.
    Active Investments:
    ${activePortfolioSummary || "No active investments."}
    ${portfolioRisk ? `\nLatest AI Risk Assessment: Overall risk level is ${portfolioRisk.riskLevel}. Summary: ${portfolioRisk.assessmentSummary}` : ""}
    ${combinedDocumentContext ? `Consider the following market context from uploaded document(s) (e.g., CSV trading data, PDF market summaries):\n---\n${combinedDocumentContext.substring(0,5000)}\n---\n` : ""}
    Suggest a general strategy, potential monthly investment, asset allocation ideas, and any specific actions or warnings.
    The response should be JSON: {"strategy": "string", "monthlyInvestment": number, "assetAllocation": {"Stocks": "X%", "Bonds": "Y%"}, "suggestedActions": ["action1"], "warnings": ["warning1"], "stockSuggestions": [{"symbol": "XYZ.N0000", "companyName": "Company", "rationale": "Reason..."}]}
    Ensure strings are escaped. Include 2-3 specific Sri Lankan stock suggestions (symbol, companyName, rationale) within the 'stockSuggestions' array.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        let parsedPlan = JSON.parse(jsonStr) as AIGoalPlan;
        setAiGoalPlan(parsedPlan);

    } catch (error) {
        console.error("Error generating financial plan:", error);
        setGoalPlanError(`Failed to generate plan: ${(error as Error).message}`);
    } finally {
        setIsGoalPlanLoading(false);
    }
  };
  
  const handleCompareStocks = async (stockSymbolsToCompare: string[], userQuery: string) => {
     if (!ai) {
        setStockComparisonError("AI model not initialized.");
        return;
    }
    setIsStockComparisonLoading(true);
    setAiStockComparison(null);
    setStockComparisonError(null);

    const stocksDetails = stockSymbolsToCompare.map(symbol => {
        const inv = investments.find(i => i.stockSymbol === symbol && i.status === InvestmentStatus.ACTIVE);
        const watch = watchlist.find(w => w.stockSymbol === symbol);
        if (inv) return `${symbol} (${inv.companyName}, Sector: ${inv.sector}, Current Price: LKR ${inv.currentMarketPrice.toFixed(2)})`;
        if (watch) return `${symbol} (${watch.companyName || 'N/A'}) - from watchlist`;
        return `${symbol} (Details not in portfolio/watchlist)`;
    }).join('\n');
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let prompt = `
    Compare the following Sri Lankan stocks:
    ${stocksDetails}
    User's specific focus for comparison: "${userQuery || 'General comparison covering strengths, weaknesses, risk, and potential outlook.'}"
    ${combinedDocumentContext ? `Consider this market context from uploaded document(s) (e.g., CSV trading data, PDF market summaries) if relevant:\n---\n${combinedDocumentContext.substring(0,10000)}\n---\n` : ""}
    Provide a concise comparison summary. Focus on key differentiating factors.
    The response should be JSON: {"comparisonSummary": "Detailed summary..."}
    Ensure strings are escaped. Add structured data points if extractable from documents.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        setAiStockComparison(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Error comparing stocks:", error);
        setStockComparisonError(`Failed to compare stocks: ${(error as Error).message}`);
    } finally {
        setIsStockComparisonLoading(false);
    }
  };

  const handleAnalyzeWhatIfScenario = async (scenario: WhatIfScenarioInput) => {
    if (!ai) {
      setWhatIfError("AI model not initialized.");
      setIsWhatIfLoading(false);
      return;
    }
    setIsWhatIfLoading(true);
    setWhatIfAnalysisResult(null);
    setWhatIfError(null);

    const currentPortfolioValue = dashboardData?.totalPortfolioValue || 0;
    const activePortfolioDetails = investments
        .filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => `${inv.stockSymbol}: ${inv.quantity} units @ LKR ${inv.currentMarketPrice.toFixed(2)} (Value: LKR ${(inv.quantity * inv.currentMarketPrice).toFixed(2)})`)
        .join('\n');
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let promptContext = `
    Current Total Portfolio Value: LKR ${currentPortfolioValue.toLocaleString()}
    Current Cash Balance: LKR ${cashBalance.toLocaleString()}
    Active Portfolio Snapshot:
    ${activePortfolioDetails || "No active investments."}
    ${portfolioRisk ? `\nLatest AI Risk Assessment: Overall risk is ${portfolioRisk.riskLevel}. Summary: ${portfolioRisk.assessmentSummary}` : ""}
    ${combinedDocumentContext ? `\nConsider this context from uploaded document(s) (e.g., CSV trading data, PDF market summaries):\n---\n${combinedDocumentContext.substring(0,5000)}\n---\n` : ""}
    `;

    let scenarioDescription = "";
    let projectedPortfolioValue = currentPortfolioValue;
    let newCashBalance = cashBalance;
    let pnlImpactOnSale: number | undefined = undefined;

    if (scenario.action === 'Buy') {
      const cost = scenario.quantity * scenario.price;
      scenarioDescription = `Hypothetical BUY: ${scenario.quantity} units of ${scenario.stockSymbol} (${scenario.companyName || ''} - ${scenario.sector || ''}) at LKR ${scenario.price.toFixed(2)}. Cost: LKR ${cost.toFixed(2)}.`;
      projectedPortfolioValue += cost; 
      newCashBalance -= cost;
    } else { 
      const stockToSell = investments.find(inv => inv.id === scenario.investmentToSellId);
      if (stockToSell) {
        const proceeds = scenario.quantity * scenario.price;
        const costBasisOfSoldPortion = stockToSell.buyPrice * Math.min(scenario.quantity, stockToSell.quantity); 
        pnlImpactOnSale = proceeds - costBasisOfSoldPortion;
        scenarioDescription = `Hypothetical SELL: ${scenario.quantity} units of ${stockToSell.stockSymbol} at LKR ${scenario.price.toFixed(2)}. Proceeds: LKR ${proceeds.toFixed(2)}. P&L: LKR ${pnlImpactOnSale.toFixed(2)}.`;
        const valueOfSoldPortionAtCurrentMarketPrice = stockToSell.currentMarketPrice * Math.min(scenario.quantity, stockToSell.quantity);
        projectedPortfolioValue -= valueOfSoldPortionAtCurrentMarketPrice; 
        newCashBalance += proceeds;
      } else {
        setWhatIfError("Could not find stock for selling."); setIsWhatIfLoading(false); return;
      }
    }

    let prompt = `
    ${promptContext}
    Analyze 'What If' scenario: ${scenarioDescription}
    Provide commentary, risk impact, diversification changes.
    JSON response: {"commentary": "string", "riskImpactSummary": "string", "diversificationChanges": "string"}
    Warn if new cash balance is negative. Ensure strings escaped.
    `;
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) { jsonStr = match[2].trim(); }
      const aiAnalysis = JSON.parse(jsonStr) as Omit<WhatIfAnalysisResult, 'projectedPortfolioValue' | 'newCashBalance' | 'pnlImpactOnSale'>;
      setWhatIfAnalysisResult({ ...aiAnalysis, projectedPortfolioValue, newCashBalance, pnlImpactOnSale });
    } catch (error) {
      console.error("Error analyzing 'What If' scenario:", error);
      setWhatIfError(`Scenario analysis failed: ${(error as Error).message}`);
      setWhatIfAnalysisResult({ projectedPortfolioValue, newCashBalance, pnlImpactOnSale, error: `AI analysis failed: ${(error as Error).message}` });
    } finally {
      setIsWhatIfLoading(false);
    }
  };

  const handleStockScreening = async (criteria: StockScreenerCriteria) => {
    if (!ai) {
        setStockScreenerError("AI model not initialized."); setIsStockScreenerLoading(false); return;
    }
    setIsStockScreenerLoading(true); setStockScreenerResult(null); setStockScreenerError(null);
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let prompt = `
    AI Stock Screener for Colombo Stock Exchange (CSE). Criteria: "${criteria.description}".
    ${combinedDocumentContext ? `Use uploaded document(s) (e.g., CSV trading data, PDF reports) for suggestions if relevant:\n---\n${combinedDocumentContext.substring(0,10000)}\n---\n` : ""}
    Provide 2-5 Sri Lankan stocks: Symbol, Company Name, Rationale (note if from document(s)), Last Price (optional, if known).
    JSON format: {"suggestions": [{"symbol": "XYZ.N0000", "companyName": "Co", "rationale": "Reason", "lastPrice": 123.45, "notesFromPDF": "Note"}], "summary": "Screening summary."}
    Ensure strings escaped. If no stocks fit, empty suggestions array and explain in summary.
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        setStockScreenerResult(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Error stock screening:", error); setStockScreenerError(`Screening failed: ${(error as Error).message}`);
    } finally {
        setIsStockScreenerLoading(false);
    }
  };

  const handleMarketSentimentAnalysis = async () => {
    if (!ai) {
        setMarketSentimentError("AI model not initialized."); setIsMarketSentimentLoading(false); return;
    }
    setIsMarketSentimentLoading(true); setMarketSentimentResult(null); setMarketSentimentError(null);
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let prompt = `
    Analyze market sentiment for Colombo Stock Exchange (CSE), Sri Lanka.
    ${combinedDocumentContext ? `Primarily use uploaded document(s) (e.g., CSV trading data, PDF summaries):\n---\n${combinedDocumentContext.substring(0,15000)}\n---\nExtract trends, sector performance, drivers.` 
    : `Use general knowledge if no document, acknowledge this.`}
    Provide: Overall sentiment (Positive, Negative, Neutral, Mixed), summary, key sector sentiments (with reasons), key observations from document(s) if provided.
    JSON format: {"overallSentiment": "Neutral", "overallSummary": "Summary", "sectorSentiments": [{"sector": "Banking", "sentiment": "Positive", "reason": "Reason", "keyDriversFromPDF": ["driver"]}], "keyObservationsFromPDF": ["obs"]}
    Ensure strings escaped.
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        setMarketSentimentResult(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Error market sentiment:", error); setMarketSentimentError(`Sentiment analysis failed: ${(error as Error).message}`);
    } finally {
        setIsMarketSentimentLoading(false);
    }
  };

  const handlePersonalizedNewsFeed = async () => {
    if (!ai || !personalizedNewsPdfText) { 
        setPersonalizedNewsError(!ai ? "AI model not initialized." : "Personalized News Document (PDF) not uploaded.");
        setIsPersonalizedNewsLoading(false); setPersonalizedNewsFeed(null); return;
    }
    setIsPersonalizedNewsLoading(true); setPersonalizedNewsFeed(null); setPersonalizedNewsError(null);

    const relevantSymbols = [...new Set([...investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).map(inv => inv.stockSymbol), ...watchlist.map(item => item.stockSymbol)])];
    if (relevantSymbols.length === 0) {
        setPersonalizedNewsError("No stocks in portfolio/watchlist for feed."); setIsPersonalizedNewsLoading(false); return;
    }

    let prompt = `
    From the provided Personalized News Document text below, extract information relevant to these Sri Lankan stock symbols: ${relevantSymbols.join(', ')}.
    For each relevant mention, provide: Stock Symbol, Company Name (if discernible or already known), a direct quote or summary of the mention from the document.
    If the document seems to contain trading data related to these symbols (like price, change, volume), include that as well.
    
    Personalized News Document Text:
    ---
    ${personalizedNewsPdfText.substring(0, 20000)} 
    ---
    
    Format your response strictly as JSON: 
    {"feedItems": [{"stockSymbol": "XYZ.N0000", "companyName": "Company Name Co", "documentExtract": "Specific information extracted from the document regarding this stock.", "source": "Uploaded Personalized News Document", "tradingData": {"closedOrLastPrice": 100.50, "change": 1.25, "changePercent": 1.26, "volume": 123450}}]}
    
    Ensure all string values are properly escaped. 
    If a stock symbol is mentioned but no company name can be found in the document or known portfolio, companyName can be an empty string.
    If no trading data is found for a specific mention, omit the "tradingData" field or set it to null for that item.
    If no information is found for a symbol, omit it from the "feedItems" array.
    If the document appears irrelevant or no mentions are found for any symbols, return an empty "feedItems" array.
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        const result = JSON.parse(jsonStr) as PersonalizedNewsFeedResult;
        if (result.feedItems) {
            result.feedItems = result.feedItems.map(item => ({
                ...item,
                companyName: item.companyName || (investments.find(inv => inv.stockSymbol === item.stockSymbol) || watchlist.find(w => w.stockSymbol === item.stockSymbol))?.companyName || ''
            }));
        }
        setPersonalizedNewsFeed(result);
    } catch (error) {
        console.error("Error personalized news:", error); setPersonalizedNewsError(`News feed failed: ${(error as Error).message}`);
    } finally {
        setIsPersonalizedNewsLoading(false);
    }
  };

  const handlePortfolioOptimization = async () => {
    if (!ai) {
        setPortfolioOptimizerError("AI model not initialized."); setIsPortfolioOptimizerLoading(false); return;
    }
    setIsPortfolioOptimizerLoading(true); setPortfolioOptimizerResult(null); setPortfolioOptimizerError(null);
    const activePortfolioDetails = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => `${inv.stockSymbol} (${inv.companyName}, Sector: ${inv.sector}): ${inv.quantity} units, Value LKR ${(inv.quantity * inv.currentMarketPrice).toFixed(2)}, Buy Price LKR ${inv.buyPrice.toFixed(2)}`).join('\n');
    if (!activePortfolioDetails && cashBalance <=0) { 
        setPortfolioOptimizerError("No active investments or available cash to optimize. Add investments or funds."); 
        setIsPortfolioOptimizerLoading(false); 
        return;
    }
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let prompt = `
    Analyze Sri Lankan stock portfolio for optimizations.
    Current Cash Balance: LKR ${cashBalance.toLocaleString()}
    Current Active Investments:
    ${activePortfolioDetails || "No active investments currently held."}
    ${portfolioRisk ? `\nLatest AI Risk Assessment: Overall risk level is ${portfolioRisk.riskLevel}. Summary: ${portfolioRisk.assessmentSummary}` : "\nNo AI risk assessment available."}
    ${financialGoalInput && aiGoalPlan ? `\nFinancial Goal: Target LKR ${financialGoalInput.targetAmount.toLocaleString()} in ${financialGoalInput.timeframeYears} years. Risk Tolerance: ${financialGoalInput.riskTolerance}. AI Plan Strategy: ${aiGoalPlan.strategy || 'Not specified.'}` : "\nNo financial goal or AI plan available."}
    ${combinedDocumentContext ? `\nConsider the following market context from uploaded document(s) (e.g., CSV trading data, PDF market summaries):\n---\n${combinedDocumentContext.substring(0,10000)}\n---\n` : "\nNo external document context provided."}
    
    Provide actionable suggestions and any other relevant fields based on your analysis.
    The response MUST be a single, valid JSON object adhering to this structure:
    {
      "suggestions": [
        {
          "action": "Buy|Sell|Hold|Reallocate|DiversifyIntoSector|ReduceExposureInSector", 
          "stockSymbol": "STOCK.SYMBOL (if applicable, otherwise null)", 
          "targetSector": "Sector Name (if applicable for diversification/reduction, otherwise null)", 
          "quantity": "Number or descriptive string like 'significant portion' or 'approx. 10% of available cash' (if applicable, otherwise null)", 
          "reasoning": "Detailed explanation for the suggestion. Must be a valid JSON string.", 
          "priority": "High|Medium|Low (optional, otherwise null)",
          "potentialImpact": "Expected outcome or effect. Must be a valid JSON string. (optional, otherwise null)"
        }
      ],
      "overallStrategyComment": "General comment on portfolio strategy. Must be a valid JSON string. (optional, otherwise null)",
      "summaryFromPDF": "How the uploaded document(s) influenced these suggestions. Must be a valid JSON string. (optional, otherwise null)"
    }
    IMPORTANT: All keys and string values in the JSON MUST be enclosed in double quotes. 
    All special characters within string values (like newlines, backslashes, or double quotes) MUST be properly escaped (e.g., \\n, \\\\, \\").
    Use null for optional fields if no relevant information is available, instead of omitting the key.
    The JSON output must not contain any leading/trailing text, comments, or markdown formatting outside the main JSON structure itself.
    If no specific suggestions can be made, return an empty "suggestions" array and explain why in "overallStrategyComment".
    `;
    let genResponse: GenerateContentResponse | undefined;
    try {
        genResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" }
        });
        let jsonStr = genResponse.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        setPortfolioOptimizerResult(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Error portfolio optimization:", error); 
        setPortfolioOptimizerError(`Optimization failed: ${(error as Error).message}. Raw AI response might be in console.`);
        console.log("Raw AI response for optimization error:", genResponse?.text);
    } finally {
        setIsPortfolioOptimizerLoading(false);
    }
  };

  const handleAIChatQuery = async (userQuery: string) => {
    if (!ai || !aiChatSession) {
        setChatError("AI Chat session not initialized."); setIsChatLoading(false); return;
    }
    setIsChatLoading(true); setChatError(null);
    const newMessage: AIChatMessage = { role: 'user', text: userQuery, id: crypto.randomUUID() };
    setChatMessages(prev => [...prev, newMessage]);

    const activePortfolioSummary = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => `${inv.stockSymbol} (${inv.companyName}, Sector: ${inv.sector}): ${inv.quantity} units, Value LKR ${(inv.quantity * inv.currentMarketPrice).toFixed(2)}`).join('\n');
    const watchlistSummary = watchlist.map(item => `${item.stockSymbol} (${item.companyName || 'N/A'})`).join(', ');
    const combinedDocumentContext = getCombinedDocumentContext(); 
    
    const context: AIChatContext = {
        currentDate: new Date().toISOString(),
        portfolioSummary: activePortfolioSummary || "No active investments.",
        cashBalance: cashBalance,
        pdfContext: combinedDocumentContext ? `Uploaded Document(s) Summary (e.g., CSV trading data, PDF market summaries - first 1000 chars total):\n${combinedDocumentContext.substring(0,1000)}` : "No document(s) uploaded.",
        watchlistSummary: watchlistSummary || "Watchlist is empty.",
        financialGoal: financialGoalInput ? `Goal: LKR ${financialGoalInput.targetAmount} in ${financialGoalInput.timeframeYears} years. Risk: ${financialGoalInput.riskTolerance}.` : "No financial goal.",
        aiFinancialPlan: aiGoalPlan ? `AI Plan: ${aiGoalPlan.strategy || JSON.stringify(aiGoalPlan).substring(0,300)}` : "No AI plan.",
        portfolioRiskAssessment: portfolioRisk ? `Risk: ${portfolioRisk.riskLevel}. Summary: ${portfolioRisk.assessmentSummary.substring(0,300)}` : "No risk assessment."
    };
    const contextualQuery = `Context:\nDate: ${context.currentDate}\nPortfolio: ${context.portfolioSummary}\nCash: LKR ${context.cashBalance.toLocaleString()}\nWatchlist: ${context.watchlistSummary}\nFinancial Goal: ${context.financialGoal}\nAI Plan: ${context.aiFinancialPlan}\nAI Risk: ${context.portfolioRiskAssessment}\nUploaded Docs: ${context.pdfContext}\n\nUser Query: ${userQuery}`;

    try {
        const response = await aiChatSession.sendMessage({ message: contextualQuery });
        const aiResponse: AIChatMessage = { role: 'model', text: response.text, id: crypto.randomUUID() };
        setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
        console.error("Error sending chat msg:", error);
        const errorResponse: AIChatMessage = { role: 'model', text: `Error: ${(error as Error).message}`, id: crypto.randomUUID(), isError: true };
        setChatMessages(prev => [...prev, errorResponse]); setChatError(`AI response failed: ${(error as Error).message}`);
    } finally {
        setIsChatLoading(false);
    }
};

const handleLogDividend = (dividend: Omit<LoggedDividend, 'id'>) => { 
    setLoggedDividends(prev => [...prev, {...dividend, id: crypto.randomUUID()}]);
    addTransaction({
        type: TransactionType.ADD_FUNDS, 
        description: `Dividend: ${dividend.quantity} ${dividend.stockSymbol} @ LKR ${dividend.amountPerShare.toFixed(2)}/share. Total LKR ${(dividend.quantity * dividend.amountPerShare).toFixed(2)}.`,
        amount: dividend.quantity * dividend.amountPerShare, relatedInvestmentId: dividend.investmentId,
    });
};

const handleGetAIDividendAnalysis = async () => {
    if (!ai) {
        setDividendAnalysisError("AI model not initialized."); setIsDividendAnalysisLoading(false); return;
    }
    setIsDividendAnalysisLoading(true); setAiDividendAnalysis(null); setDividendAnalysisError(null);
    const activePortfolioSymbols = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => `${inv.stockSymbol} (${inv.companyName}) - ${inv.quantity} shares.`).join('\n');
    const loggedDividendsSummary = loggedDividends.map(d => `${d.stockSymbol}: Received LKR ${(d.quantity * d.amountPerShare).toFixed(2)} on ${new Date(d.paymentDate).toLocaleDateString()}.`).join('\n');
    const combinedDocumentContext = getCombinedDocumentContext(); 
    let prompt = `
    Analyze dividend potential for Sri Lankan stock portfolio.
    Active Portfolio: ${activePortfolioSymbols || "None specified."}
    Logged Dividends: ${loggedDividendsSummary || "None logged."}
    ${combinedDocumentContext ? `Consider context from uploaded document(s) (e.g., CSV trading data for prices, PDF reports for announcements):\n---\n${combinedDocumentContext.substring(0,10000)}\n---\n` : ""}
    Provide: Estimated annual dividend income, potential upcoming dividends (stock, est. amount/share, est. ex-date, confidence), commentary on stability/growth.
    JSON format: {"estimatedAnnualIncome": number, "upcomingDividends": [{"stockSymbol": "XYZ.N0000", "estimatedAmountPerShare": number, "estimatedExDate": "YYYY-MM-DD", "confidence": "High|Medium|Low"}], "commentary": "Commentary"}
    Ensure strings escaped. State limitations if data insufficient.
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        setAiDividendAnalysis(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Error analyzing dividends:", error); setDividendAnalysisError(`Dividend analysis failed: ${(error as Error).message}`);
    } finally {
        setIsDividendAnalysisLoading(false);
    }
};

const handleGetDeepPDFAnalysis = async () => { 
    const marketIndexDocContext = marketIndexSummaryPdfText; 
    if (!ai || !marketIndexDocContext) {
        setDeepPDFAnalysisError(!ai ? "AI model not initialized." : "Market Index PDF document not uploaded for deep analysis.");
        setIsDeepPDFAnalysisLoading(false); return;
    }
    setIsDeepPDFAnalysisLoading(true); setAiDeepPDFSummary(null); setDeepPDFAnalysisError(null);
    let prompt = `
    Comprehensive analysis of the following Market Index PDF document for Sri Lankan stock market.
    Document Text (first 20000 chars):
    ---
    ${marketIndexDocContext.substring(0, 20000)} 
    ---
    Analysis should include: Detailed overall summary, key themes/topics, significant mentions (company, event, economic indicator, regulatory change) with context.
    JSON format: {"fullSummary": "Summary", "keyThemes": ["Theme1"], "significantMentions": [{"item": "Item", "context": "Context"}]}
    Ensure strings escaped. Focus solely on provided document.
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        setAiDeepPDFSummary(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Error deep PDF analysis:", error); setDeepPDFAnalysisError(`Deep PDF analysis failed: ${(error as Error).message}`);
    } finally {
        setIsDeepPDFAnalysisLoading(false);
    }
};

// Handler for AI Market Trends Analysis
const handleAnalyzeMarketTrends = async () => {
    if (!ai) {
        setMarketTrendAnalysisError("AI model not initialized.");
        setIsMarketTrendAnalysisLoading(false);
        return;
    }
    setIsMarketTrendAnalysisLoading(true);
    setAiMarketTrendAnalysis(null);
    setMarketTrendAnalysisError(null);

    const generalDocContextAvailable = !!getCombinedDocumentContext();
    const prompt = `You are a financial markets analyst. Provide a hypothetical analysis of general 5-year market trends that could be observed in an emerging stock market like the Colombo Stock Exchange (CSE), Sri Lanka. 
Describe potential periods of growth (bull markets), decline (bear markets), significant volatility, and key economic, social, or global factors that might typically influence such trends over a 5-year period.
${generalDocContextAvailable ? "If any uploaded general market documents (like summaries or index reports) provide broad, long-term outlooks, briefly mention how such information could theoretically influence a 5-year view. " : ""}
Conclude with a very brief summary of common patterns. The analysis should be general and illustrative, not based on real-time data. Output as a single block of text.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        setAiMarketTrendAnalysis({ analysisText: response.text });
    } catch (error) {
        console.error("Error analyzing market trends:", error);
        setMarketTrendAnalysisError(`Failed to analyze market trends: ${(error as Error).message}`);
        setAiMarketTrendAnalysis({ analysisText: "", error: `Failed to analyze market trends: ${(error as Error).message}` });
    } finally {
        setIsMarketTrendAnalysisLoading(false);
    }
};

// Handler for AI Chat Guide Explanation
const handleGetAIChatGuideExplanation = async () => {
    if (!ai) {
        setChatGuideError("AI model not initialized.");
        setIsChatGuideLoading(false);
        return;
    }
    setIsChatGuideLoading(true);
    setAiChatGuideExplanation(null);
    setChatGuideError(null);

    const prompt = `A user wants to understand how you, an AI Portfolio Chatbot for the Sri Lankan market, work. 
Briefly explain your capabilities. Mention what kind of information you can use (e.g., their portfolio details, cash balance, watchlist, uploaded documents summaries, financial goals, risk assessments, and general market knowledge for Sri Lanka). 
Explain how you try to answer their questions about investments and financial planning. 
Also, mention any key limitations (e.g., you don't provide real-time trading, guaranteed predictions, or official financial advice). 
Keep the explanation concise, user-friendly, and helpful. Output as a single block of text.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        setAiChatGuideExplanation({ explanationText: response.text });
    } catch (error) {
        console.error("Error getting AI chat guide explanation:", error);
        setChatGuideError(`Failed to get explanation: ${(error as Error).message}`);
        setAiChatGuideExplanation({ explanationText: "", error: `Failed to get explanation: ${(error as Error).message}` });
    } finally {
        setIsChatGuideLoading(false);
    }
};


  const sectorAllocationData = dashboardData ? 
    Object.entries(
      investments
        .filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .reduce((acc, inv) => {
          const value = inv.quantity * inv.currentMarketPrice;
          acc[inv.sector] = (acc[inv.sector] || 0) + value;
          return acc;
        }, {} as { [key: string]: number })
    ).map(([name, value]) => ({ name, value }))
    : [];

  const stockAllocationData = dashboardData ? 
    investments
        .filter(inv => inv.status === InvestmentStatus.ACTIVE)
        .map(inv => ({ name: inv.stockSymbol, value: inv.quantity * inv.currentMarketPrice }))
    : [];
  
  const availableStocksForComparison = [
    ...investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).map(inv => ({ symbol: inv.stockSymbol, name: `${inv.stockSymbol} (${inv.companyName})` })),
    ...watchlist.map(item => ({ symbol: item.stockSymbol, name: `${item.stockSymbol} (${item.companyName || 'Watchlist Item'})` }))
  ].filter((stock, index, self) => index === self.findIndex((s) => s.symbol === stock.symbol));

  const generalDocumentContextAvailable = !!(tradingSummaryCsvContent || marketIndexSummaryPdfText);
  const marketIndexPdfAvailable = !!marketIndexSummaryPdfText;
  const personalizedNewsPdfAvailable = !!personalizedNewsPdfText;


  return (
    <div className="min-h-screen bg-base-100 text-neutral p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary text-center">My Investment Portfolio Dashboard</h1>
        <p className="text-center text-gray-500 mt-1">Track, Analyze, and Grow Your Investments with AI Insights</p>
      </header>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Symbol Trading Summary CSV:</label>
            <div className="flex items-center space-x-2">
              <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, 'tradingSummary')} 
                  className="text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 disabled:opacity-50 w-full"
                  disabled={isTradingSummaryCsvProcessing}
                  ref={tradingSummaryCsvFileInputRef}
                  aria-label="Upload Daily Symbol Trading Summary CSV"
              />
              {isTradingSummaryCsvProcessing && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>}
            </div>
            {uploadedTradingSummaryName && (
                <div className="mt-1 flex items-center text-xs text-gray-600">
                    <span className="mr-1">Loaded: <strong>{uploadedTradingSummaryName}</strong></span>
                    <button onClick={() => handleRemoveDocument('tradingSummary')} className="text-red-500 hover:text-red-700" title="Remove Trading Summary CSV">
                        <XCircleIcon className="w-4 h-4"/>
                    </button>
                </div>
            )}
            {tradingSummaryCsvProcessingError && <p className="text-xs text-red-500 mt-1">{tradingSummaryCsvProcessingError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market Index Summary PDF:</label>
            <div className="flex items-center space-x-2">
              <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFileUpload(e, 'marketIndexSummary')} 
                  className="text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-emerald-600 disabled:opacity-50 w-full"
                  disabled={isMarketIndexProcessing}
                  ref={marketIndexFileInputRef}
                  aria-label="Upload Market Index Summary PDF"
              />
              {isMarketIndexProcessing && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>}
            </div>
            {uploadedMarketIndexName && (
                <div className="mt-1 flex items-center text-xs text-gray-600">
                    <span className="mr-1">Loaded: <strong>{uploadedMarketIndexName}</strong></span>
                    <button onClick={() => handleRemoveDocument('marketIndexSummary')} className="text-red-500 hover:text-red-700" title="Remove Market Index PDF">
                        <XCircleIcon className="w-4 h-4"/>
                    </button>
                </div>
            )}
            {marketIndexProcessingError && <p className="text-xs text-red-500 mt-1">{marketIndexProcessingError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personalized News Document (PDF):</label>
            <div className="flex items-center space-x-2">
              <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFileUpload(e, 'personalizedNewsPdf')} 
                  className="text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-amber-600 disabled:opacity-50 w-full"
                  disabled={isPersonalizedNewsPdfProcessing}
                  ref={personalizedNewsPdfFileInputRef}
                  aria-label="Upload Personalized News Document PDF"
              />
              {isPersonalizedNewsPdfProcessing && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>}
            </div>
            {personalizedNewsPdfName && (
                <div className="mt-1 flex items-center text-xs text-gray-600">
                    <span className="mr-1">Loaded: <strong>{personalizedNewsPdfName}</strong></span>
                    <button onClick={() => handleRemoveDocument('personalizedNewsPdf')} className="text-red-500 hover:text-red-700" title="Remove Personalized News PDF">
                        <XCircleIcon className="w-4 h-4"/>
                    </button>
                </div>
            )}
            {personalizedNewsPdfProcessingError && <p className="text-xs text-red-500 mt-1">{personalizedNewsPdfProcessingError}</p>}
          </div>
        </div>
      </div>

       <AIConsolidatedBriefingComponent
          briefing={aiConsolidatedBriefing}
          isLoading={isBriefingLoading}
          error={briefingError}
          onRefreshBriefing={handleGenerateAIBriefing}
          isAiReady={!!ai}
          documentContextAvailable={generalDocumentContextAvailable} 
        />
      
      {dashboardData && (
          <Dashboard 
            data={dashboardData} 
            sectorAllocationData={sectorAllocationData} 
            stockAllocationData={stockAllocationData}
            onAddFunds={handleAddFunds}
            onWithdrawFunds={handleWithdrawFunds}
          />
      )}
      
      <div className="my-8 p-6 bg-white rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center"> <ChartLineIcon className="w-7 h-7 text-primary mr-2"/> <h2 className="text-2xl font-semibold text-neutral">Portfolio Value Over Time</h2></div>
          </div>
          <HistoricalPerformanceChart history={portfolioHistory} />
      </div>

       <div className="my-12 border-t-2 border-dashed border-gray-300 pt-8">
            <h2 className="text-3xl font-semibold text-neutral mb-6 text-center">Interactive AI Tools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <AIChatbot ai={ai} chatSession={aiChatSession} messages={chatMessages} onSendQuery={handleAIChatQuery} isLoading={isChatLoading} error={chatError} isAiReady={!!ai} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <AIDividendTracker ai={ai} activeInvestments={investments.filter(inv => inv.status === InvestmentStatus.ACTIVE)} loggedDividends={loggedDividends} onLogDividend={handleLogDividend} onAnalyzeDividends={handleGetAIDividendAnalysis} analysisResult={aiDividendAnalysis} isLoading={isDividendAnalysisLoading} error={dividendAnalysisError} isAiReady={!!ai} documentContextAvailable={generalDocumentContextAvailable} />
                     <PDFDeeperAnalysis ai={ai} onAnalyzePDF={handleGetDeepPDFAnalysis} summaryResult={aiDeepPDFSummary} isLoading={isDeepPDFAnalysisLoading} error={deepPDFAnalysisError} isAiReady={!!ai} documentContextAvailable={marketIndexPdfAvailable} />
                </div>
            </div>
            <AIChatGuide
                ai={ai}
                onGetExplanation={handleGetAIChatGuideExplanation}
                explanation={aiChatGuideExplanation}
                isLoading={isChatGuideLoading}
                error={chatGuideError}
                isAiReady={!!ai}
            />
        </div>

      <div className="flex justify-between items-center my-6">
        <h2 className="text-3xl font-semibold text-neutral">Investment Details</h2>
        <div className="space-x-3">
            <button
                onClick={handleUpdatePortfolioFromCsvSummary}
                disabled={isPriceUpdatingFromCsv || !tradingSummaryCsvContent}
                className="bg-info hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
                title={!tradingSummaryCsvContent ? "Upload Trading Summary CSV to enable" : "Update prices from Trading Summary CSV"}
            >
                {isPriceUpdatingFromCsv ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>Updating Prices...</>) : ("Update Prices from CSV")}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out">
                <PlusIcon className="w-5 h-5 mr-2" /> Add Investment
            </button>
        </div>
      </div>
        {priceUpdateFromCsvStatus && (
            <p className={`text-sm my-2 p-2 rounded-md ${priceUpdateFromCsvStatus.toLowerCase().includes("error") || priceUpdateFromCsvStatus.toLowerCase().includes("could not find") || priceUpdateFromCsvStatus.toLowerCase().includes("not uploaded") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                {priceUpdateFromCsvStatus}
            </p>
        )}
      <InvestmentTable investments={investments} onUpdateInvestment={handleUpdateInvestment} onSellInvestment={handleSellInvestment} onDeleteInvestment={handleDeleteInvestment} onFetchNewsAndAnalysis={handleFetchNewsAndAnalysis} isAiReady={!!ai} />

      {isModalOpen && (<AddInvestmentModal onClose={() => setIsModalOpen(false)} onAddInvestment={handleAddInvestment} cashBalance={cashBalance}/>)}
      {selectedStockForNews && isNewsModalOpen && (<NewsAnalysisModal isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} stockName={'companyName' in selectedStockForNews && selectedStockForNews.companyName ? `${selectedStockForNews.stockSymbol} (${selectedStockForNews.companyName})` : selectedStockForNews.stockSymbol} analysis={aiStructuredNewsAnalysis} sources={newsModalSources} isLoading={isNewsLoading} error={newsModalError}/>)}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            <WatchlistComponent ai={ai} watchlist={watchlist} onAddWatchlistItem={handleAddWatchlistItem} onRemoveWatchlistItem={handleRemoveWatchlistItem} onFetchNewsAndAnalysis={(item) => handleFetchNewsAndAnalysis(item as WatchlistItem)} isLoadingMap={isWatchlistAiLoading} />
            <PortfolioRiskAnalyzer ai={ai} riskAssessment={portfolioRisk} isLoading={isRiskAnalysisLoading} onAnalyzeRisk={handleAnalyzePortfolioRisk} documentContextAvailable={generalDocumentContextAvailable} />
        </div>
        
        <div className="my-8">
             <FinancialGoalPlanner ai={ai} onGetPlan={handleGetAIGoalPlan} plan={aiGoalPlan} isLoading={isGoalPlanLoading} error={goalPlanError} documentContextAvailable={generalDocumentContextAvailable} />
        </div>
        <div className="my-8">
            <StockComparator ai={ai} availableStocks={availableStocksForComparison} onCompareStocks={handleCompareStocks} comparisonResult={aiStockComparison} isLoading={isStockComparisonLoading} error={stockComparisonError} documentContextAvailable={generalDocumentContextAvailable} />
        </div>
        <div className="my-8">
            <WhatIfScenarioAnalyzer ai={ai} activeInvestments={investments.filter(inv => inv.status === InvestmentStatus.ACTIVE)} cashBalance={cashBalance} onAnalyzeScenario={handleAnalyzeWhatIfScenario} analysisResult={whatIfAnalysisResult} isLoading={isWhatIfLoading} error={whatIfError} documentContextAvailable={generalDocumentContextAvailable} />
        </div>

        <div className="my-12 border-t-2 border-dashed border-gray-300 pt-8">
            <h2 className="text-3xl font-semibold text-neutral mb-6 text-center">Advanced AI Analysis Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StockScreener ai={ai} onScreenStocks={handleStockScreening} result={stockScreenerResult} isLoading={isStockScreenerLoading} error={stockScreenerError} documentContextAvailable={generalDocumentContextAvailable} />
                <MarketSentimentAnalyzer ai={ai} onAnalyzeSentiment={handleMarketSentimentAnalysis} result={marketSentimentResult} isLoading={isMarketSentimentLoading} error={marketSentimentError} documentContextAvailable={generalDocumentContextAvailable} />
                <PersonalizedNewsFeed ai={ai} onGetFeed={handlePersonalizedNewsFeed} feedResult={personalizedNewsFeed} isLoading={isPersonalizedNewsLoading} error={personalizedNewsError} personalizedNewsPdfAvailable={personalizedNewsPdfAvailable} />
                <PortfolioOptimizer ai={ai} onOptimizePortfolio={handlePortfolioOptimization} result={portfolioOptimizerResult} isLoading={isPortfolioOptimizerLoading} error={portfolioOptimizerError} documentContextAvailable={generalDocumentContextAvailable} />
                <MarketTrendsAnalyzer 
                    ai={ai} 
                    onAnalyzeTrends={handleAnalyzeMarketTrends} 
                    analysis={aiMarketTrendAnalysis} 
                    isLoading={isMarketTrendAnalysisLoading} 
                    error={marketTrendAnalysisError}
                    isAiReady={!!ai}
                    documentContextAvailable={generalDocumentContextAvailable}
                />
            </div>
        </div>

        <div className="my-8"> <TransactionHistory transactions={transactions} /> </div>
        <footer className="text-center text-sm text-gray-500 mt-12 py-6 border-t border-gray-200">
            <p>&copy; {new Date().getFullYear()} Investment Portfolio Dashboard. AI insights for informational purposes.</p>
            <p>Initial capital LKR {INITIAL_CASH_BALANCE.toLocaleString()}.</p>
        </footer>
    </div>
  );
};
export default App;
