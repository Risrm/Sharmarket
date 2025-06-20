
import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { AIChatGuideExplanation } from '../types';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface AIChatGuideProps {
  ai: GoogleGenAI | null;
  onGetExplanation: () => void;
  explanation: AIChatGuideExplanation | null;
  isLoading: boolean;
  error: string | null;
  isAiReady: boolean;
}

const AIChatGuide: React.FC<AIChatGuideProps> = ({
  ai,
  onGetExplanation,
  explanation,
  isLoading,
  error,
  isAiReady,
}) => {
  return (
    <div className="mt-8 bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <LightbulbIcon className="w-7 h-7 text-accent mr-3" />
        <h3 className="text-xl font-semibold text-neutral">About This AI Chat Assistant</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Want to know more about how this AI chat assistant works, its capabilities, and limitations? Click the button below.
      </p>
      <button
        onClick={onGetExplanation}
        disabled={isLoading || !isAiReady}
        className="bg-accent hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
        title={!isAiReady ? "AI features disabled" : "Get Explanation"}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Loading Explanation...
          </>
        ) : (
          "How Does This AI Chat Work?"
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {explanation && !isLoading && !error && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-neutral mb-2">AI Chat Assistant Capabilities:</h4>
          <div className="p-4 bg-gray-50 rounded-md shadow max-h-80 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {explanation.explanationText}
            </p>
          </div>
        </div>
      )}
      {explanation?.error && (
         <div className="mt-2 p-3 bg-yellow-100 text-yellow-700 rounded-md text-xs">
            <p><strong className="font-semibold">Note:</strong> {explanation.error}</p>
        </div>
      )}
    </div>
  );
};

export default AIChatGuide;
