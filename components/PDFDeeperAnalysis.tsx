
import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { AIDeepPDFSummary } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface PDFDeeperAnalysisProps {
  ai: GoogleGenAI | null;
  onAnalyzePDF: () => void; // This function internally should know it's for the Market Index PDF
  summaryResult: AIDeepPDFSummary | null;
  isLoading: boolean;
  error: string | null;
  isAiReady: boolean;
  documentContextAvailable: boolean; // This prop should represent if the *Market Index PDF* is available
}

const PDFDeeperAnalysis: React.FC<PDFDeeperAnalysisProps> = ({
  ai,
  onAnalyzePDF,
  summaryResult,
  isLoading,
  error,
  isAiReady,
  documentContextAvailable, // Specifically for Market Index PDF
}) => {
  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <DocumentTextIcon className="w-8 h-8 text-info mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI Deep Analysis (Market Index PDF)</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Get a comprehensive AI-generated summary of the uploaded Market Index PDF, including key themes and significant mentions.
      </p>
      <button
        onClick={onAnalyzePDF}
        disabled={isLoading || !isAiReady || !documentContextAvailable}
        className="bg-info hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
        title={!isAiReady ? "AI features disabled" : (!documentContextAvailable ? "Upload a Market Index PDF to enable deep analysis" : "Analyze Market Index PDF")}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Analyzing PDF...
          </>
        ) : (
          "Analyze Market Index PDF"
        )}
      </button>
      {!documentContextAvailable && isAiReady && (
         <p className="text-xs text-orange-600 mt-1">Please upload the Market Index PDF document to enable this feature.</p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {summaryResult && !isLoading && !error && (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
          <div>
            <h4 className="text-lg font-semibold text-neutral">Full Summary (from Market Index PDF):</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{summaryResult.fullSummary || "No summary provided."}</p>
          </div>

          {summaryResult.keyThemes && summaryResult.keyThemes.length > 0 && (
            <div>
              <h5 className="text-md font-semibold text-gray-700">Key Themes:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {summaryResult.keyThemes.map((theme, i) => <li key={i}>{theme}</li>)}
              </ul>
            </div>
          )}

          {summaryResult.significantMentions && summaryResult.significantMentions.length > 0 && (
            <div>
              <h5 className="text-md font-semibold text-gray-700">Significant Mentions:</h5>
              <ul className="space-y-1 text-sm">
                {summaryResult.significantMentions.map((mention, i) => (
                  <li key={i} className="p-1 border-b border-gray-200 last:border-b-0">
                    <strong>{mention.item}:</strong> <span className="text-gray-600">{mention.context}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        Deep PDF analysis is AI-generated from the Market Index PDF. For informational purposes only.
      </p>
    </div>
  );
};

export default PDFDeeperAnalysis;
