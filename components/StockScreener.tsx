
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StockScreenerCriteria, AIStockScreenerResult } from '../types';
import { FilterIcon } from './icons/FilterIcon';

interface StockScreenerProps {
  ai: GoogleGenAI | null;
  onScreenStocks: (criteria: StockScreenerCriteria) => void;
  result: AIStockScreenerResult | null;
  isLoading: boolean;
  error: string | null;
  documentContextAvailable: boolean; // Renamed
}

const StockScreener: React.FC<StockScreenerProps> = ({
  ai,
  onScreenStocks,
  result,
  isLoading,
  error,
  documentContextAvailable, // Renamed
}) => {
  const [criteriaDescription, setCriteriaDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteriaDescription.trim()) {
      alert('Please enter screening criteria.');
      return;
    }
    onScreenStocks({ description: criteriaDescription });
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <FilterIcon className="w-7 h-7 text-primary mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI Stock Screener</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Describe your ideal stock. AI will search based on criteria and uploaded document(s) context (if available).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="screenerCriteria" className="block text-sm font-medium text-gray-700 mb-1">
            Screening Criteria:
          </label>
          <textarea
            id="screenerCriteria"
            value={criteriaDescription}
            onChange={(e) => setCriteriaDescription(e.target.value)}
            rows={3}
            placeholder="e.g., Profitable tech companies with low P/E and strong growth potential mentioned in uploaded document(s)."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            disabled={!ai || isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !ai || !criteriaDescription.trim()}
          className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
          title={!ai ? "AI features disabled" : (documentContextAvailable ? "Screen Stocks (with document context)" : "Screen Stocks")}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Screening...
            </>
          ) : (
            `Screen Stocks ${documentContextAvailable ? '(with Docs)' : ''}`
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {result && !isLoading && !error && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-neutral mb-2">Screening Results:</h4>
          {result.summary && <p className="text-sm text-gray-600 mb-2 italic">{result.summary}</p>}
          {result.suggestions && result.suggestions.length > 0 ? (
            <ul className="space-y-3">
              {result.suggestions.map((stock, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200">
                  <p className="font-semibold text-primary">{stock.symbol} - {stock.companyName}</p>
                  {stock.lastPrice !== undefined && <p className="text-xs text-gray-500">Last Price: LKR {stock.lastPrice.toFixed(2)}</p>}
                  <p className="text-sm text-gray-700 mt-1">{stock.rationale}</p>
                  {stock.notesFromPDF && <p className="text-xs text-gray-500 mt-1 border-t pt-1">Note from Document: {stock.notesFromPDF}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No stocks matched your criteria based on available information.</p>
          )}
        </div>
      )}
       <p className="mt-4 text-xs text-gray-500">
        AI stock screening is for informational purposes. Always do your own research.
      </p>
    </div>
  );
};

export default StockScreener;
