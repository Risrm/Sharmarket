
import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { MarketSentimentAnalysisResult } from '../types';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface MarketSentimentAnalyzerProps {
  ai: GoogleGenAI | null;
  onAnalyzeSentiment: () => void;
  result: MarketSentimentAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  documentContextAvailable: boolean; // Renamed
}

const MarketSentimentAnalyzer: React.FC<MarketSentimentAnalyzerProps> = ({
  ai,
  onAnalyzeSentiment,
  result,
  isLoading,
  error,
  documentContextAvailable, // Renamed
}) => {
  const getSentimentColor = (sentiment: string | undefined) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'neutral': return 'text-gray-600';
      case 'mixed': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <TrendingUpIcon className="w-7 h-7 text-secondary mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI Market Sentiment Analysis</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Get AI's perspective on market sentiment, primarily based on uploaded document(s) (if available).
      </p>
      <button
        onClick={onAnalyzeSentiment}
        disabled={isLoading || !ai}
        className="bg-secondary hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
        title={!ai ? "AI features disabled" : (documentContextAvailable ? "Analyze Market Sentiment (with document context)" : "Analyze Market Sentiment")}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Analyzing...
          </>
        ) : (
          `Analyze Market Sentiment ${documentContextAvailable ? '(with Docs)' : ''}`
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {result && !isLoading && !error && (
        <div className="mt-6 space-y-3">
          <div>
            <h4 className="text-lg font-semibold text-neutral">Overall Market Sentiment: 
              <span className={`ml-2 font-bold ${getSentimentColor(result.overallSentiment)}`}>{result.overallSentiment || 'N/A'}</span>
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{result.overallSummary}</p>
          </div>

          {result.keyObservationsFromPDF && result.keyObservationsFromPDF.length > 0 && (
            <div>
              <h5 className="text-md font-semibold text-gray-600">Key Observations from Document(s):</h5>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {result.keyObservationsFromPDF.map((obs, i) => <li key={i}>{obs}</li>)}
              </ul>
            </div>
          )}

          {result.sectorSentiments && result.sectorSentiments.length > 0 && (
            <div>
              <h5 className="text-md font-semibold text-gray-600">Sector Sentiments:</h5>
              <ul className="space-y-2">
                {result.sectorSentiments.map((sector, i) => (
                  <li key={i} className="p-2 bg-gray-50 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-800">{sector.sector}: <span className={`font-bold ${getSentimentColor(sector.sentiment)}`}>{sector.sentiment || 'N/A'}</span></p>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{sector.reason}</p>
                    {sector.keyDriversFromPDF && sector.keyDriversFromPDF.length > 0 && (
                       <p className="text-xs text-gray-500 mt-1 border-t pt-1">Drivers from Document(s): {sector.keyDriversFromPDF.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        Market sentiment is AI-generated. Not investment advice.
      </p>
    </div>
  );
};

export default MarketSentimentAnalyzer;
