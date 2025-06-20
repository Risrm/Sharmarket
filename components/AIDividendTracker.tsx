
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { LoggedDividend, AIDividendAnalysis, Investment, InvestmentStatus } from '../types';
import { BanknotesIcon } from './icons/BanknotesIcon';

interface AIDividendTrackerProps {
  ai: GoogleGenAI | null;
  activeInvestments: Investment[]; 
  loggedDividends: LoggedDividend[];
  onLogDividend: (dividend: Omit<LoggedDividend, 'id'>) => void;
  onAnalyzeDividends: () => void;
  analysisResult: AIDividendAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isAiReady: boolean;
  documentContextAvailable: boolean; // Renamed
}

const AIDividendTracker: React.FC<AIDividendTrackerProps> = ({
  ai,
  activeInvestments,
  loggedDividends,
  onLogDividend,
  onAnalyzeDividends,
  analysisResult,
  isLoading,
  error,
  isAiReady,
  documentContextAvailable, // Renamed
}) => {
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [amountPerShare, setAmountPerShare] = useState<number | ''>('');
  const [exDividendDate, setExDividendDate] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestmentId || typeof quantity !== 'number' || quantity <= 0 || typeof amountPerShare !== 'number' || amountPerShare <= 0 || !paymentDate) {
      alert('Please fill all required fields for dividend logging with valid values.');
      return;
    }
    const investment = activeInvestments.find(inv => inv.id === selectedInvestmentId);
    if (!investment) {
        alert('Selected investment not found.');
        return;
    }

    onLogDividend({
      investmentId: selectedInvestmentId,
      stockSymbol: investment.stockSymbol,
      companyName: investment.companyName,
      quantity,
      amountPerShare,
      exDividendDate: exDividendDate || undefined,
      paymentDate,
      notes: notes || undefined,
    });
    setSelectedInvestmentId('');
    setQuantity('');
    setAmountPerShare('');
    setExDividendDate('');
    setPaymentDate('');
    setNotes('');
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-4">
        <BanknotesIcon className="w-8 h-8 text-secondary mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI Dividend Tracker & Forecaster</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Log received dividends and get AI analysis on potential future dividends, using uploaded document(s) if available.
      </p>

      <form onSubmit={handleLogSubmit} className="space-y-4 mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h4 className="text-md font-semibold text-gray-700">Log New Dividend</h4>
        <div>
          <label htmlFor="dividend-stock" className="block text-sm font-medium text-gray-700">Stock (from Active Portfolio) <span className="text-red-500">*</span></label>
          <select
            id="dividend-stock"
            value={selectedInvestmentId}
            onChange={(e) => setSelectedInvestmentId(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="">Select stock...</option>
            {activeInvestments.map(inv => (
              <option key={inv.id} value={inv.id}>{inv.stockSymbol} - {inv.companyName}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="dividend-quantity" className="block text-sm font-medium text-gray-700">Quantity of Shares <span className="text-red-500">*</span></label>
                <input type="number" id="dividend-quantity" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} required min="1" className="mt-1 block w-full p-2 border-gray-300 rounded-md"/>
            </div>
            <div>
                <label htmlFor="dividend-amount" className="block text-sm font-medium text-gray-700">Amount per Share (LKR) <span className="text-red-500">*</span></label>
                <input type="number" id="dividend-amount" value={amountPerShare} onChange={e => setAmountPerShare(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0.01" step="0.01" className="mt-1 block w-full p-2 border-gray-300 rounded-md"/>
            </div>
        </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="dividend-exdate" className="block text-sm font-medium text-gray-700">Ex-Dividend Date (Optional)</label>
                <input type="date" id="dividend-exdate" value={exDividendDate} onChange={e => setExDividendDate(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md"/>
            </div>
            <div>
                <label htmlFor="dividend-paydate" className="block text-sm font-medium text-gray-700">Payment Date <span className="text-red-500">*</span></label>
                <input type="date" id="dividend-paydate" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 rounded-md"/>
            </div>
        </div>
        <div>
          <label htmlFor="dividend-notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea id="dividend-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full p-2 border-gray-300 rounded-md"/>
        </div>
        <button type="submit" className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-md text-sm">Log Dividend</button>
      </form>

      {loggedDividends.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Logged Dividends:</h4>
          <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
            {loggedDividends.map(d => (
              <div key={d.id} className="p-2 border rounded-md bg-white">
                <p><strong>{d.stockSymbol}</strong> ({d.companyName}): {d.quantity} shares @ LKR {d.amountPerShare.toFixed(2)}/share = <strong>LKR {(d.quantity * d.amountPerShare).toFixed(2)}</strong></p>
                <p className="text-xs text-gray-500">Paid: {new Date(d.paymentDate).toLocaleDateString()} {d.exDividendDate ? `(Ex-Date: ${new Date(d.exDividendDate).toLocaleDateString()})` : ''}</p>
                {d.notes && <p className="text-xs text-gray-500 italic">Notes: {d.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAnalyzeDividends}
        disabled={isLoading || !isAiReady}
        className="bg-secondary hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out disabled:opacity-50"
        title={!isAiReady ? "AI features disabled" : (documentContextAvailable ? "Get AI Dividend Analysis (with document context)" : "Get AI Dividend Analysis")}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Analyzing Dividends...
          </>
        ) : (
          `Get AI Dividend Analysis ${documentContextAvailable ? '(with Docs)' : ''}`
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      {analysisResult && !isLoading && !error && (
        <div className="mt-6 space-y-3 p-4 bg-gray-50 rounded-md">
          <h4 className="text-lg font-semibold text-neutral mb-2">AI Dividend Analysis:</h4>
          {analysisResult.estimatedAnnualIncome !== undefined && (
            <p><strong>Estimated Annual Dividend Income:</strong> LKR {analysisResult.estimatedAnnualIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          )}
          {analysisResult.upcomingDividends && analysisResult.upcomingDividends.length > 0 && (
            <div>
              <h5 className="text-md font-semibold text-gray-700">Potential Upcoming Dividends:</h5>
              <ul className="list-disc list-inside text-sm">
                {analysisResult.upcomingDividends.map((div, i) => (
                  <li key={i}>
                    {div.stockSymbol}: Est. LKR {div.estimatedAmountPerShare?.toFixed(2)}/share 
                    {div.estimatedExDate && ` (Ex-Date around ${new Date(div.estimatedExDate).toLocaleDateString()})`}
                    {div.confidence && ` - Confidence: ${div.confidence}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysisResult.commentary && (
            <div>
              <h5 className="text-md font-semibold text-gray-700">Commentary:</h5>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysisResult.commentary}</p>
            </div>
          )}
          {(!analysisResult.estimatedAnnualIncome && (!analysisResult.upcomingDividends || analysisResult.upcomingDividends.length ===0) && !analysisResult.commentary) && (
            <p className="text-gray-500">AI could not provide specific dividend analysis. More data or document context might be needed.</p>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        Dividend analysis is AI-generated. Not a guarantee of future income.
      </p>
    </div>
  );
};

export default AIDividendTracker;
