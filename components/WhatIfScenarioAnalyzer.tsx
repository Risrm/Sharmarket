
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { WhatIfScenarioInput, WhatIfAnalysisResult, Investment, InvestmentStatus } from '../types';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SECTORS } from '../constants';

interface WhatIfScenarioAnalyzerProps {
  ai: GoogleGenAI | null;
  activeInvestments: Investment[];
  cashBalance: number;
  onAnalyzeScenario: (scenario: WhatIfScenarioInput) => void;
  analysisResult: WhatIfAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  documentContextAvailable: boolean; // Renamed
}

const WhatIfScenarioAnalyzer: React.FC<WhatIfScenarioAnalyzerProps> = ({
  ai,
  activeInvestments,
  cashBalance,
  onAnalyzeScenario,
  analysisResult,
  isLoading,
  error,
  documentContextAvailable, // Renamed
}) => {
  const [action, setAction] = useState<'Buy' | 'Sell'>('Buy');
  const [selectedStockToSellId, setSelectedStockToSellId] = useState<string>('');
  const [buyStockSymbol, setBuyStockSymbol] = useState<string>('');
  const [buyCompanyName, setBuyCompanyName] = useState<string>('');
  const [buySector, setBuySector] = useState<string>(SECTORS[0] || '');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');

  useEffect(() => {
    setSelectedStockToSellId('');
    setBuyStockSymbol('');
    setBuyCompanyName('');
    setBuySector(SECTORS[0] || '');
  }, [action]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof quantity !== 'number' || quantity <= 0 || typeof price !== 'number' || price <= 0) {
      alert('Please enter valid positive numbers for quantity and price.');
      return;
    }

    let scenarioInput: WhatIfScenarioInput;

    if (action === 'Sell') {
      if (!selectedStockToSellId) {
        alert('Please select a stock to sell.');
        return;
      }
      const stockToSell = activeInvestments.find(inv => inv.id === selectedStockToSellId);
      if (!stockToSell) {
        alert('Selected stock for selling not found.');
        return;
      }
      scenarioInput = {
        action: 'Sell',
        stockSymbol: stockToSell.stockSymbol, 
        investmentToSellId: selectedStockToSellId,
        quantity,
        price,
      };
    } else { 
      if (!buyStockSymbol.trim()) {
        alert('Please enter a stock symbol to buy.');
        return;
      }
      scenarioInput = {
        action: 'Buy',
        stockSymbol: buyStockSymbol.trim().toUpperCase(),
        companyName: buyCompanyName.trim(),
        sector: buySector.trim(),
        quantity,
        price,
      };
    }
    onAnalyzeScenario(scenarioInput);
  };

  const canSubmit = () => {
    if (!ai || isLoading || quantity === '' || price === '' || Number(quantity) <= 0 || Number(price) <= 0) return false;
    if (action === 'Sell' && !selectedStockToSellId) return false;
    if (action === 'Buy' && !buyStockSymbol.trim()) return false;
    return true;
  }

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <LightbulbIcon className="w-8 h-8 text-accent mr-3" />
        <h2 className="text-2xl font-semibold text-neutral">AI 'What If' Scenario Analyzer</h2>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Explore hypothetical scenarios and get AI-powered impact analysis, considering your portfolio, cash, and uploaded document(s).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="whatif-action" className="block text-sm font-medium text-gray-700">Action</label>
            <select
              id="whatif-action"
              value={action}
              onChange={(e) => setAction(e.target.value as 'Buy' | 'Sell')}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              disabled={!ai || isLoading}
            >
              <option value="Buy">Buy New Stock</option>
              <option value="Sell">Sell Existing Stock</option>
            </select>
          </div>

          {action === 'Sell' ? (
            <div>
              <label htmlFor="whatif-sell-stock" className="block text-sm font-medium text-gray-700">Stock to Sell</label>
              <select
                id="whatif-sell-stock"
                value={selectedStockToSellId}
                onChange={(e) => setSelectedStockToSellId(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                disabled={!ai || isLoading || activeInvestments.length === 0}
              >
                <option value="">Select stock...</option>
                {activeInvestments.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.stockSymbol} ({inv.companyName}) - {inv.quantity} units
                  </option>
                ))}
              </select>
              {activeInvestments.length === 0 && <p className="text-xs text-gray-500 mt-1">No active investments to sell.</p>}
            </div>
          ) : ( 
            <>
              <div>
                <label htmlFor="whatif-buy-symbol" className="block text-sm font-medium text-gray-700">Stock Symbol (New)</label>
                <input
                  type="text"
                  id="whatif-buy-symbol"
                  value={buyStockSymbol}
                  onChange={(e) => setBuyStockSymbol(e.target.value)}
                  placeholder="e.g., JKH.N0000"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  disabled={!ai || isLoading}
                />
              </div>
              <div>
                <label htmlFor="whatif-buy-company" className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
                <input
                  type="text"
                  id="whatif-buy-company"
                  value={buyCompanyName}
                  onChange={(e) => setBuyCompanyName(e.target.value)}
                  placeholder="e.g., John Keells Holdings PLC"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  disabled={!ai || isLoading}
                />
              </div>
              <div>
                <label htmlFor="whatif-buy-sector" className="block text-sm font-medium text-gray-700">Sector (Optional)</label>
                 <select
                    id="whatif-buy-sector"
                    value={buySector}
                    onChange={(e) => setBuySector(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={!ai || isLoading}
                >
                    <option value="">Select sector...</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="whatif-quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="whatif-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="e.g., 100"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              disabled={!ai || isLoading}
              min="1"
            />
          </div>
          <div>
            <label htmlFor="whatif-price" className="block text-sm font-medium text-gray-700">Hypothetical Price (LKR per unit)</label>
            <input
              type="number"
              id="whatif-price"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="e.g., 150.75"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              disabled={!ai || isLoading}
              min="0.01"
              step="any"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit()}
          className="bg-accent hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
          title={!ai ? "AI features disabled" : (documentContextAvailable ? "Analyze Scenario (using document context)" : "Analyze Scenario")}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Analyzing Scenario...
            </>
          ) : (
            `Analyze Scenario ${documentContextAvailable ? '(with Docs)' : ''}`
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {analysisResult && !isLoading && !error && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md shadow space-y-3">
          <h3 className="text-lg font-semibold text-neutral mb-2">AI Scenario Analysis:</h3>
          {analysisResult.projectedPortfolioValue !== undefined && (
            <p><strong>Projected Total Portfolio Value:</strong> LKR {analysisResult.projectedPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          )}
          {analysisResult.newCashBalance !== undefined && (
            <p><strong>Projected New Cash Balance:</strong> LKR {analysisResult.newCashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          )}
          {action === 'Sell' && analysisResult.pnlImpactOnSale !== undefined && (
            <p className={analysisResult.pnlImpactOnSale >= 0 ? 'text-success' : 'text-error'}>
                <strong>P&L from this Hypothetical Sale:</strong> LKR {analysisResult.pnlImpactOnSale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          {analysisResult.riskImpactSummary && (
            <div><strong>Risk Impact Summary:</strong> <p className="text-sm whitespace-pre-wrap">{analysisResult.riskImpactSummary}</p></div>
          )}
          {analysisResult.diversificationChanges && (
            <div><strong>Diversification Changes:</strong> <p className="text-sm whitespace-pre-wrap">{analysisResult.diversificationChanges}</p></div>
          )}
          {analysisResult.commentary && (
            <div><strong>AI Commentary:</strong> <p className="text-sm whitespace-pre-wrap">{analysisResult.commentary}</p></div>
          )}
          {analysisResult.error && (
             <p className="text-error"><strong>Analysis Note:</strong> {analysisResult.error}</p>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        AI 'What If' analysis provides simulated outcomes. Not financial advice.
      </p>
    </div>
  );
};

export default WhatIfScenarioAnalyzer;
