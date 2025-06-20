
import React from 'react';
import { PortfolioRiskAssessment } from '../types';
import { GoogleGenAI } from '@google/genai'; 

interface PortfolioRiskAnalyzerProps {
  ai: GoogleGenAI | null;
  riskAssessment: PortfolioRiskAssessment | null;
  isLoading: boolean;
  onAnalyzeRisk: () => void;
  documentContextAvailable: boolean; // Renamed from pdfContextAvailable
}

const PortfolioRiskAnalyzer: React.FC<PortfolioRiskAnalyzerProps> = ({ 
    ai, 
    riskAssessment, 
    isLoading, 
    onAnalyzeRisk,
    documentContextAvailable // Renamed
}) => {
  
  const getRiskLevelColor = (level: PortfolioRiskAssessment['riskLevel'] | undefined) => {
    switch (level) {
      case 'Low': return 'text-success';
      case 'Moderate': return 'text-warning';
      case 'High': return 'text-error';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-neutral mb-4">AI Portfolio Risk Assessment</h2>
      <button
        onClick={onAnalyzeRisk}
        disabled={isLoading || !ai}
        className="bg-accent hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50 mb-4"
        title={!ai ? "AI features disabled. API key may be missing." : (documentContextAvailable ? "Analyze risk with uploaded document(s) context" : "Analyze portfolio risk")}
      >
        {isLoading ? (
            <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Analyzing Risk...
            </>
        ) : (
            documentContextAvailable ? 'Analyze Risk (with Document Context)' : 'Analyze Portfolio Risk'
        )}
      </button>

      {isLoading && !riskAssessment && (
        <div className="text-center py-4">
          <p className="text-neutral">AI is analyzing your portfolio risk...</p>
        </div>
      )}

      {riskAssessment && (
        <div className="mt-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral">Overall Risk Level:</h3>
            <p className={`text-xl font-bold ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
              {riskAssessment.riskLevel}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral">AI Assessment Summary:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{riskAssessment.assessmentSummary}</p>
          </div>
          
          {riskAssessment.sectorConcentration && riskAssessment.sectorConcentration.length > 0 && (
            <div>
                <h4 className="text-md font-semibold text-gray-600 mt-2">Top Sector Concentrations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                    {riskAssessment.sectorConcentration.map(s => (
                        <li key={s.sector}>{s.sector}: {s.percentage.toFixed(1)}%</li>
                    ))}
                </ul>
            </div>
          )}
          {riskAssessment.stockConcentration && riskAssessment.stockConcentration.length > 0 && (
            <div>
                <h4 className="text-md font-semibold text-gray-600 mt-2">Top Stock Concentrations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                    {riskAssessment.stockConcentration.map(s => (
                        <li key={s.stockSymbol}>{s.stockSymbol}: {s.percentage.toFixed(1)}%</li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        AI risk assessment is based on portfolio composition (and optional uploaded document(s) context) and general diversification principles. It is not financial advice.
      </p>
    </div>
  );
};

export default PortfolioRiskAnalyzer;
