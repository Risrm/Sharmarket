
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AIStockComparison } from '../types';
import { ScaleIcon } from './icons/ScaleIcon'; 

interface StockComparatorProps {
  ai: GoogleGenAI | null;
  availableStocks: { symbol: string; name: string }[]; 
  onCompareStocks: (stockSymbols: string[], userQuery: string) => void;
  comparisonResult: AIStockComparison | null;
  isLoading: boolean;
  error: string | null;
  documentContextAvailable: boolean; // Renamed
}

const StockComparator: React.FC<StockComparatorProps> = ({
  ai,
  availableStocks,
  onCompareStocks,
  comparisonResult,
  isLoading,
  error,
  documentContextAvailable, // Renamed
}) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState<string>('');

  const handleStockSelectionChange = (symbol: string) => {
    setSelectedSymbols(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymbols.length < 2) {
      alert('Please select at least two stocks to compare.');
      return;
    }
    onCompareStocks(selectedSymbols, userQuery);
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <ScaleIcon className="w-8 h-8 text-primary mr-3" />
        <h2 className="text-2xl font-semibold text-neutral">AI Stock Comparator</h2>
      </div>
       <p className="text-sm text-gray-600 mb-3">
        Select 2 or more stocks to get an AI-powered comparison.
        Optionally, specify focus areas. Uploaded document(s) context will be used if available.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Stocks to Compare (Choose 2+):
          </label>
          {availableStocks.length === 0 ? (
            <p className="text-sm text-gray-500">No stocks available to compare.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {availableStocks.map(stock => (
                <div key={stock.symbol} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`compare-${stock.symbol}`}
                    value={stock.symbol}
                    checked={selectedSymbols.includes(stock.symbol)}
                    onChange={() => handleStockSelectionChange(stock.symbol)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={!ai}
                  />
                  <label htmlFor={`compare-${stock.symbol}`} className="ml-2 text-sm text-gray-700 truncate" title={stock.name}>
                    {stock.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="comparisonQuery" className="block text-sm font-medium text-gray-700 mb-1">
            Specific Comparison Points (Optional):
          </label>
          <textarea
            id="comparisonQuery"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            rows={3}
            placeholder="e.g., Compare based on recent growth, risk, and future outlook considering uploaded document(s)."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            disabled={!ai}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !ai || selectedSymbols.length < 2}
          className="bg-secondary hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
          title={!ai ? "AI features disabled" : (documentContextAvailable ? "Compare Stocks (using document context)" : "Compare Selected Stocks")}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Comparing...
            </>
          ) : (
            `Compare Stocks ${documentContextAvailable ? '(with Docs)' : ''}`
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><span className="font-semibold">Error:</span> {error}</p>
        </div>
      )}

      {comparisonResult && !isLoading && !error && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-neutral mb-2">AI Comparison Result:</h3>
          <div className="p-4 bg-gray-50 rounded-md shadow">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comparisonResult.comparisonSummary}
            </p>
            {/* Consider rendering other structured fields from comparisonResult if AI provides them */}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        AI stock comparison uses available data, your query, any uploaded document(s), and general market knowledge. Not financial advice.
      </p>
    </div>
  );
};

export default StockComparator;
