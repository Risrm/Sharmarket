
import React from 'react';
import { AIConsolidatedBriefing, AIBriefingPoint } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { LightbulbIcon } from './icons/LightbulbIcon'; 

interface AIConsolidatedBriefingProps {
  briefing: AIConsolidatedBriefing | null;
  isLoading: boolean;
  error: string | null;
  onRefreshBriefing: () => void;
  isAiReady: boolean;
  documentContextAvailable: boolean; // Renamed
}

const AIConsolidatedBriefingComponent: React.FC<AIConsolidatedBriefingProps> = ({
  briefing,
  isLoading,
  error,
  onRefreshBriefing,
  isAiReady,
  documentContextAvailable, // Renamed
}) => {
  const getImportanceColor = (importance?: 'High' | 'Medium' | 'Low') => {
    switch (importance) {
      case 'High': return 'border-red-500';
      case 'Medium': return 'border-yellow-500';
      case 'Low': return 'border-blue-500';
      default: return 'border-gray-300';
    }
  };

  const getImportanceIconColor = (importance?: 'High' | 'Medium' | 'Low') => {
    switch (importance) {
        case 'High': return 'text-red-500';
        case 'Medium': return 'text-yellow-500';
        case 'Low': return 'text-blue-500';
        default: return 'text-gray-400';
      }
  }

  return (
    <div className="my-6 p-6 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center mb-3 sm:mb-0">
          <ClipboardListIcon className="w-10 h-10 mr-3 text-blue-100" />
          <h2 className="text-3xl font-bold">
            {briefing?.briefingTitle || "AI Today's Briefing"}
          </h2>
        </div>
        <button
          onClick={onRefreshBriefing}
          disabled={isLoading || !isAiReady }
          className="bg-white hover:bg-gray-100 text-primary font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-60 text-sm"
          title={!isAiReady ? "AI features disabled" : (!documentContextAvailable ? "Upload document(s) to get a full briefing" : "Refresh Briefing")}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
              Refreshing...
            </>
          ) : (
            "Refresh Briefing"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-100 text-red-800 rounded-md shadow">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {!isLoading && !error && !briefing?.points?.length && (
         <p className="text-blue-100 opacity-80">
            {documentContextAvailable ? "Click 'Refresh Briefing' to get your personalized AI summary." : "Upload document(s) (CSV/PDF) to generate your AI daily briefing."}
         </p>
      )}

      {briefing?.points && briefing.points.length > 0 && !isLoading && !error && (
        <div className="space-y-3 mt-2">
          {briefing.points.map((point, index) => (
            <div 
                key={index} 
                className={`p-4 bg-white/90 backdrop-blur-sm text-neutral rounded-lg shadow-md border-l-4 ${getImportanceColor(point.importance)}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-primary">{point.category}</h4>
                {point.importance && (
                    <div className="flex items-center">
                         <LightbulbIcon className={`w-4 h-4 mr-1 ${getImportanceIconColor(point.importance)}`} />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getImportanceIconColor(point.importance).replace('text-', 'bg-').replace('-500', '-100')} ${getImportanceIconColor(point.importance)}`}>
                            {point.importance}
                        </span>
                    </div>
                )}
              </div>
              <p className="text-sm mt-1">{point.summary}</p>
              {point.detailsLink && (
                <a href={point.detailsLink} className="text-xs text-primary hover:underline mt-1 inline-block">
                  View Details &rarr;
                </a>
              )}
               {point.sourceModule && <p className="text-xs text-gray-400 mt-1">Source: {point.sourceModule}</p>}
            </div>
          ))}
           <p className="text-xs text-blue-200 opacity-90 pt-2 text-right">Briefing generated on: {new Date(briefing.generatedAt).toLocaleString('si-LK')}</p>
        </div>
      )}
       <p className="mt-4 text-xs text-blue-200 opacity-80">
        This briefing is AI-generated based on available data (including uploaded document(s)). For informational purposes only.
      </p>
    </div>
  );
};

export default AIConsolidatedBriefingComponent;
