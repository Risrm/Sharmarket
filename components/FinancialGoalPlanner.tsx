
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FinancialGoalInput, AIGoalPlan } from '../types';
import { TargetIcon } from './icons/TargetIcon'; 
import { LightbulbIcon } from './icons/LightbulbIcon';

interface FinancialGoalPlannerProps {
  ai: GoogleGenAI | null;
  onGetPlan: (goalInput: FinancialGoalInput) => void;
  plan: AIGoalPlan | null;
  isLoading: boolean;
  error: string | null;
  documentContextAvailable: boolean; // Renamed
}

const FinancialGoalPlanner: React.FC<FinancialGoalPlannerProps> = ({
  ai,
  onGetPlan,
  plan,
  isLoading,
  error,
  documentContextAvailable, // Renamed
}) => {
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [timeframeYears, setTimeframeYears] = useState<number | ''>('');
  const [riskTolerance, setRiskTolerance] = useState<'Low' | 'Moderate' | 'High'>('Moderate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof targetAmount !== 'number' || typeof timeframeYears !== 'number' || targetAmount <= 0 || timeframeYears <= 0) {
      alert('Please enter valid positive numbers for target amount and timeframe.');
      return;
    }
    onGetPlan({
      targetAmount,
      timeframeYears,
      riskTolerance,
    });
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <TargetIcon className="w-8 h-8 text-primary mr-3" />
        <h2 className="text-2xl font-semibold text-neutral">AI Financial Goal Planner</h2>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Define your financial goals and let AI suggest a plan. The plan will consider your current portfolio, risk assessment, and any uploaded document(s). AI will also suggest specific stocks.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
              Target Amount (LKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="targetAmount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 1000000"
              required
              disabled={!ai}
              min="1"
            />
          </div>
          <div>
            <label htmlFor="timeframeYears" className="block text-sm font-medium text-gray-700">
              Timeframe (Years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="timeframeYears"
              value={timeframeYears}
              onChange={(e) => setTimeframeYears(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 5"
              required
              disabled={!ai}
              min="1"
            />
          </div>
          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">
              Risk Tolerance <span className="text-red-500">*</span>
            </label>
            <select
              id="riskTolerance"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as 'Low' | 'Moderate' | 'High')}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              required
              disabled={!ai}
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !ai || !targetAmount || !timeframeYears}
          className="bg-secondary hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
          title={!ai ? "AI features disabled" : (documentContextAvailable ? "Get AI Plan (using document context)" : "Get AI Plan")}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Generating Plan...
            </>
          ) : (
             `Get AI Plan ${documentContextAvailable ? '(with Docs)' : ''}`
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><span className="font-semibold">Error:</span> {error}</p>
        </div>
      )}

      {plan && !isLoading && !error && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-neutral mb-2">AI Generated Financial Plan:</h3>
          <div className="p-4 bg-gray-50 rounded-md shadow space-y-3">
            {plan.strategy && <p><strong className="text-gray-700">Strategy:</strong> {plan.strategy}</p>}
            {plan.monthlyInvestment && <p><strong className="text-gray-700">Suggested Monthly Investment (LKR):</strong> {plan.monthlyInvestment.toLocaleString()}</p>}
            
            {plan.assetAllocation && Object.keys(plan.assetAllocation).length > 0 && (
              <div>
                <strong className="text-gray-700">Suggested Asset Allocation:</strong>
                <ul className="list-disc list-inside ml-4 text-sm">
                  {Object.entries(plan.assetAllocation).map(([asset, percent]) => (
                    <li key={asset}>{asset}: {percent}</li>
                  ))}
                </ul>
              </div>
            )}
            {plan.suggestedActions && plan.suggestedActions.length > 0 && (
              <div>
                <strong className="text-gray-700">Suggested Actions:</strong>
                <ul className="list-disc list-inside ml-4 text-sm">
                  {plan.suggestedActions.map((action, index) => <li key={index}>{action}</li>)}
                </ul>
              </div>
            )}
             {plan.warnings && plan.warnings.length > 0 && (
              <div>
                <strong className="text-yellow-700">Warnings/Considerations:</strong>
                <ul className="list-disc list-inside ml-4 text-sm text-yellow-600">
                  {plan.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                </ul>
              </div>
            )}
            {Object.entries(plan).filter(([key]) => !['strategy', 'monthlyInvestment', 'assetAllocation', 'suggestedActions', 'warnings', 'stockSuggestions'].includes(key)).length > 0 && (
                 <div>
                    <strong className="text-gray-700">Other Details:</strong>
                    <ul className="list-disc list-inside ml-4 text-sm">
                    {Object.entries(plan).map(([key, value]) => {
                        if (!['strategy', 'monthlyInvestment', 'assetAllocation', 'suggestedActions', 'warnings', 'stockSuggestions'].includes(key)) {
                        return <li key={key}><span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</li>;
                        }
                        return null;
                    })}
                    </ul>
                </div>
            )}

            {plan.stockSuggestions && plan.stockSuggestions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center mb-2">
                    <LightbulbIcon className="w-5 h-5 text-accent mr-2" />
                    <h4 className="text-md font-semibold text-neutral">Specific Stock Ideas (for consideration):</h4>
                </div>
                <ul className="space-y-2">
                  {plan.stockSuggestions.map((stock, index) => (
                    <li key={index} className="p-2 bg-gray-100 rounded-md shadow-sm text-sm">
                      <p className="font-semibold text-primary">{stock.symbol} - {stock.companyName}</p>
                      <p className="text-gray-600">{stock.rationale}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  These stock ideas are AI-generated. Always conduct your own thorough research before investing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        AI financial plans are suggestions based on provided inputs and general financial principles. This is not financial advice.
      </p>
    </div>
  );
};

export default FinancialGoalPlanner;
