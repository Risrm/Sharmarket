
import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { AIPortfolioOptimizerResult, OptimizationSuggestion } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface PortfolioOptimizerProps {
  ai: GoogleGenAI | null;
  onOptimizePortfolio: () => void;
  result: AIPortfolioOptimizerResult | null;
  isLoading: boolean;
  error: string | null;
  documentContextAvailable: boolean; // Renamed
}

const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({
  ai,
  onOptimizePortfolio,
  result,
  isLoading,
  error,
  documentContextAvailable, // Renamed
}) => {
  const getPriorityColor = (priority: OptimizationSuggestion['priority']) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <SparklesIcon className="w-7 h-7 text-info mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI Portfolio Optimizer</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Receive AI-driven suggestions based on portfolio state, risk, goals, and uploaded document(s) context (if available).
      </p>
      <button
        onClick={onOptimizePortfolio}
        disabled={isLoading || !ai}
        className="bg-info hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
        title={!ai ? "AI features disabled" : (documentContextAvailable ? "Optimize Portfolio (with document context)" : "Optimize Portfolio")}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Optimizing...
          </>
        ) : (
          `Optimize Portfolio ${documentContextAvailable ? '(with Docs)' : ''}`
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {result && !isLoading && !error && (
        <div className="mt-6 space-y-3">
          {result.overallStrategyComment && (
            <div className="mb-3 p-3 bg-blue-50 rounded-md">
              <h4 className="text-md font-semibold text-blue-700">Overall Strategy Comment:</h4>
              <p className="text-sm text-blue-600 whitespace-pre-wrap">{result.overallStrategyComment}</p>
            </div>
          )}
          {result.summaryFromPDF && ( // Assuming summaryFromPDF means from any document
            <div className="mb-3 p-3 bg-green-50 rounded-md">
              <h4 className="text-md font-semibold text-green-700">Influence from Document(s):</h4>
              <p className="text-sm text-green-600 whitespace-pre-wrap">{result.summaryFromPDF}</p>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 ? (
            <>
             <h4 className="text-lg font-semibold text-neutral mb-2">Optimization Suggestions:</h4>
            <ul className="space-y-3">
              {result.suggestions.map((sugg, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-neutral">
                      Action: <span className="text-primary">{sugg.action}</span>
                      {sugg.stockSymbol && ` - ${sugg.stockSymbol}`}
                      {sugg.targetSector && ` - Sector: ${sugg.targetSector}`}
                    </p>
                    {sugg.priority && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(sugg.priority)}`}>
                        {sugg.priority} Priority
                      </span>
                    )}
                  </div>
                  {sugg.quantity && <p className="text-sm text-gray-600">Details: {sugg.quantity}</p>}
                  <p className="text-sm text-gray-700 mt-1"><strong>Reasoning:</strong> {sugg.reasoning}</p>
                  {sugg.potentialImpact && <p className="text-xs text-gray-500 mt-1">Potential Impact: {sugg.potentialImpact}</p>}
                </li>
              ))}
            </ul>
            </>
          ) : (
            <p className="text-gray-500">No specific optimization suggestions provided.</p>
          )}
        </div>
      )}
       <p className="mt-4 text-xs text-gray-500">
        Portfolio optimization suggestions are AI-generated. Not financial advice.
      </p>
    </div>
  );
};

export default PortfolioOptimizer;
