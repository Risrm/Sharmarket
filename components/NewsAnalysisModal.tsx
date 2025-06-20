
import React from 'react';
import { XIcon } from './icons/XIcon';
import { NewsSource, AIStructuredNewsAnalysis } from '../types'; // Added AIStructuredNewsAnalysis

interface NewsAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockName: string;
  analysis: AIStructuredNewsAnalysis | null; // Changed from summary: string
  sources: NewsSource[];
  isLoading: boolean;
  error: string;
}

const NewsAnalysisModal: React.FC<NewsAnalysisModalProps> = ({
  isOpen,
  onClose,
  stockName,
  analysis, // Changed from summary
  sources,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  const renderAnalysisContent = () => {
    if (!analysis) return <p className="text-gray-500">No analysis data available.</p>;
    if (analysis.error && !analysis.overallSummary) { // If only error, show it prominently
        return <p className="text-red-600">{analysis.error}</p>;
    }

    return (
      <div className="space-y-4 text-sm">
        {analysis.overallSummary && (
          <div>
            <h4 className="font-semibold text-neutral">Overall Summary & Sentiment:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.overallSummary}</p>
          </div>
        )}
        {analysis.biasReason && (
          <div>
            <h4 className="font-semibold text-neutral">Key Influencing Factor / Bias:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.biasReason}</p>
          </div>
        )}
        {analysis.priceOutlook && (
          <div>
            <h4 className="font-semibold text-neutral">Price Outlook:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.priceOutlook}</p>
          </div>
        )}
        {analysis.buyRecommendations && analysis.buyRecommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-neutral">Buy Point Analysis / Recommendations:</h4>
            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
              {analysis.buyRecommendations.map((rec, idx) => <li key={`buy-${idx}`}>{rec}</li>)}
            </ul>
          </div>
        )}
        {analysis.sellRecommendations && analysis.sellRecommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-neutral">Sell Point Analysis / Targets:</h4>
            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
              {analysis.sellRecommendations.map((rec, idx) => <li key={`sell-${idx}`}>{rec}</li>)}
            </ul>
          </div>
        )}
         {analysis.error && analysis.overallSummary && ( // If there's an error but also summary, show error as a note
             <p className="text-xs text-red-500 mt-2">Note from AI: {analysis.error}</p>
         )}
      </div>
    );
  };


  return (
    <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" 
        aria-labelledby="news-modal-title" 
        role="dialog" 
        aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="news-modal-title" className="text-xl font-semibold text-neutral">
            News & AI Analysis for {stockName}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close news analysis modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-4 text-neutral">Loading news and analysis...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="my-4 p-4 bg-red-100 text-red-700 rounded-md">
            <h3 className="font-semibold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="mb-6">
              {renderAnalysisContent()}
            </div>

            {sources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral mb-2">Sources (from Web Search):</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        title={source.title || source.uri}
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!analysis && sources.length === 0 && !error && ( // if no analysis, no sources, no error
                <p className="text-gray-500">No analysis or sources available at the moment.</p>
            )}
          </>
        )}
        
        <p className="mt-6 text-xs text-gray-500">
            AI-generated analysis is for informational purposes only and may not be fully accurate or comprehensive. Always verify information from sources.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsAnalysisModal;
