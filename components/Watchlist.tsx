
import React, { useState } from 'react';
import { WatchlistItem, NewsSource } from '../types';
import { GoogleGenAI } from '@google/genai';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { NewspaperIcon } from './icons/NewspaperIcon'; // For AI Insight

interface WatchlistProps {
  ai: GoogleGenAI | null;
  watchlist: WatchlistItem[];
  onAddWatchlistItem: (item: Omit<WatchlistItem, 'id'>) => void;
  onRemoveWatchlistItem: (id: string) => void;
  onFetchNewsAndAnalysis: (item: WatchlistItem) => void; // Reuses existing modal logic
  isLoadingMap: {[key: string]: boolean};
}

const WatchlistComponent: React.FC<WatchlistProps> = ({ 
    ai, 
    watchlist, 
    onAddWatchlistItem, 
    onRemoveWatchlistItem, 
    onFetchNewsAndAnalysis,
    isLoadingMap 
}) => {
  const [newSymbol, setNewSymbol] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) {
      alert('Stock symbol is required.');
      return;
    }
    onAddWatchlistItem({ 
        stockSymbol: newSymbol.trim().toUpperCase(), 
        companyName: newCompanyName.trim(), 
        notes: newNotes.trim() 
    });
    setNewSymbol('');
    setNewCompanyName('');
    setNewNotes('');
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-neutral mb-4">Stock Watchlist</h2>
      <form onSubmit={handleAdd} className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                <label htmlFor="watch-symbol" className="block text-sm font-medium text-gray-700">Stock Symbol <span className="text-red-500">*</span></label>
                <input
                id="watch-symbol"
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="e.g., SAMP.N0000"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                required
                />
            </div>
            <div>
                <label htmlFor="watch-company" className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
                <input
                id="watch-company"
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="e.g., Sampath Bank PLC"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
            </div>
        </div>
        <div>
            <label htmlFor="watch-notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
            id="watch-notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
            placeholder="e.g., Monitor for upcoming earnings report"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
          disabled={!ai}
          title={!ai ? "AI features disabled. API key may be missing." : "Add to watchlist"}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add to Watchlist
        </button>
      </form>

      {watchlist.length === 0 ? (
        <p className="text-gray-500">Your watchlist is empty. Add stocks to monitor.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {watchlist.map(item => (
            <div key={item.id} className="p-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-primary">{item.stockSymbol}</h3>
                  {item.companyName && <p className="text-sm text-gray-600">{item.companyName}</p>}
                </div>
                <div className="flex space-x-2">
                   <button
                    onClick={() => onFetchNewsAndAnalysis(item)}
                    className="text-info hover:text-sky-700 p-1 rounded hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                    disabled={!ai || isLoadingMap[item.id]}
                    title={!ai ? "AI features disabled" : (isLoadingMap[item.id] ? "Loading..." : `Get AI Insight for ${item.stockSymbol}`)}
                    aria-label={`Get AI insight for ${item.stockSymbol}`}
                  >
                    {isLoadingMap[item.id] ? 
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-info mx-auto"></div> 
                        : <NewspaperIcon className="w-5 h-5" />
                    }
                  </button>
                  <button
                    onClick={() => onRemoveWatchlistItem(item.id)}
                    className="text-error hover:text-red-700 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title={`Remove ${item.stockSymbol} from watchlist`}
                    aria-label={`Remove ${item.stockSymbol}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {item.notes && <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-200">{item.notes}</p>}
            </div>
          ))}
        </div>
      )}
       <p className="mt-4 text-xs text-gray-500">
            AI Insights for watchlist items use Google Search for recent news and AI summarization.
        </p>
    </div>
  );
};

export default WatchlistComponent;
