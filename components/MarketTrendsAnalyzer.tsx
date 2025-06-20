
import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { AIMarketTrendAnalysis } from '../types';
import { ChartLineIcon } from './icons/ChartLineIcon';

interface MarketTrendsAnalyzerProps {
  ai: GoogleGenAI | null;
  onAnalyzeTrends: () => void;
  analysis: AIMarketTrendAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isAiReady: boolean;
  documentContextAvailable: boolean;
}

const MarketTrendsAnalyzer: React.FC<MarketTrendsAnalyzerProps> = ({
  ai,
  onAnalyzeTrends,
  analysis,
  isLoading,
  error,
  isAiReady,
  documentContextAvailable,
}) => {
  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <ChartLineIcon className="w-7 h-7 text-indigo-500 mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI 5-Year Market Trends Analysis (CSE)</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Get a hypothetical AI-generated analysis of potential 5-year market trends for the Colombo Stock Exchange. 
        This considers general market behaviors and, if documents are uploaded, may incorporate high-level insights from them.
      </p>
      <button
        onClick={onAnalyzeTrends}
        disabled={isLoading || !isAiReady}
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
        title={!isAiReady ? "AI features disabled" : (documentContextAvailable ? "Analyze Trends (with document context)" : "Analyze Market Trends")}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Analyzing Trends...
          </>
        ) : (
          `Analyze Market Trends ${documentContextAvailable ? '(with Docs)' : ''}`
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {analysis && !isLoading && !error && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-neutral mb-2">AI Market Trend Analysis:</h4>
          <div className="p-4 bg-gray-50 rounded-md shadow max-h-80 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {analysis.analysisText}
            </p>
          </div>
        </div>
      )}
      {analysis?.error && (
         <div className="mt-2 p-3 bg-yellow-100 text-yellow-700 rounded-md text-xs">
            <p><strong className="font-semibold">Note:</strong> {analysis.error}</p>
        </div>
      )}
       <p className="mt-4 text-xs text-gray-500">
        This analysis is AI-generated, hypothetical, and for informational purposes only. It is not financial advice.
      </p>
    </div>
  );
};

export default MarketTrendsAnalyzer;
