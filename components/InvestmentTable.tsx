
import React, { useState } from 'react';
import { Investment, InvestmentStatus } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { NewspaperIcon } from './icons/NewspaperIcon'; // New Icon

interface InvestmentTableProps {
  investments: Investment[];
  onUpdateInvestment: (investment: Investment) => void;
  onSellInvestment: (investmentId: string, sellPrice: number) => void;
  onDeleteInvestment: (investmentId: string) => void;
  onFetchNewsAndAnalysis: (investment: Investment) => void; // New Prop
  isAiReady: boolean; // New Prop
}

// Define a type for form data that can hold strings for number/date fields
type InvestmentEditFormDataType = {
  [K in keyof Investment]?: Investment[K] | string;
};

// Define column configuration types as a discriminated union
interface BaseColumnConfig {
  header: string;
  isNumeric?: boolean;
  minWidth?: string;
}

interface DataColumnConfig extends BaseColumnConfig {
  key: keyof Investment;
  isCalculated: false;
  isAction: false;
}

interface CalculatedColumnConfig extends BaseColumnConfig {
  key: 'totalBuyValue' | 'currentValue' | 'gainLoss' | 'percentageGainLoss';
  isCalculated: true;
  isAction: false;
}

interface ActionColumnConfig extends BaseColumnConfig {
  key: 'actions';
  isAction: true;
  isCalculated: false;
}

type ColumnConfig = DataColumnConfig | CalculatedColumnConfig | ActionColumnConfig;


const InvestmentTable: React.FC<InvestmentTableProps> = ({ 
    investments, 
    onUpdateInvestment, 
    onSellInvestment, 
    onDeleteInvestment,
    onFetchNewsAndAnalysis,
    isAiReady
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  // Use the more flexible type for editFormData
  const [editFormData, setEditFormData] = useState<InvestmentEditFormDataType>({});
  const [sellPriceInput, setSellPriceInput] = useState<{ [key: string]: string }>({});

  const handleEdit = (investment: Investment) => {
    setEditingId(investment.id);
    // Initialize formData, converting numbers to strings and formatting dates for input fields
    const formData: InvestmentEditFormDataType = {};
    for (const key in investment) {
      if (Object.prototype.hasOwnProperty.call(investment, key)) {
        const K = key as keyof Investment;
        if (K === 'id') continue; // ID is not part of editable form data typically

        const value = investment[K];
        if (K === 'buyDate' || K === 'targetSellDate') {
          formData[K] = value ? new Date(value as string).toISOString().split('T')[0] : '';
        } else if (typeof value === 'number') {
          formData[K] = String(value);
        } else if (value === null || value === undefined) {
            formData[K] = ''; // Represent null/undefined as empty string in form
        }
         else {
          formData[K] = value as any; // For strings, booleans, enums
        }
      }
    }
    if (formData.targetSellPrice === 'undefined') formData.targetSellPrice = ''; // Ensure undefined targetSellPrice is empty string

    setEditFormData(formData);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = (id: string) => {
    if (editingId === id) {
      const originalInvestment = investments.find(inv => inv.id === id);
      if (!originalInvestment) return;

      // The current logic for updatedInvestmentData and parsing should now work with the corrected editFormData type
      const updatedInvestmentData: { [k: string]: any } = { ...originalInvestment, ...editFormData };
      
      const numericFields: (keyof Investment)[] = ['quantity', 'buyPrice', 'currentMarketPrice', 'targetSellPrice'];
      for (const field of numericFields) {
        // This check is now valid because updatedInvestmentData[field] can be string | number
        if (updatedInvestmentData[field] !== undefined && typeof updatedInvestmentData[field] === 'string') {
          (updatedInvestmentData[field] as any) = parseFloat(updatedInvestmentData[field] as string);
        }
        if (updatedInvestmentData[field] !== undefined && isNaN(Number(updatedInvestmentData[field]))) {
            if (field === 'targetSellPrice' && (editFormData[field] === '' || editFormData[field] === null || editFormData[field] === undefined)) {
                 (updatedInvestmentData as any)[field] = undefined;
            } else {
                alert(`Invalid number for ${field}. Please correct.`);
                return;
            }
        } else if (field !== 'targetSellPrice' && (updatedInvestmentData[field] === undefined || updatedInvestmentData[field] === null || String(updatedInvestmentData[field]).trim() === '')) {
            // Required numeric fields cannot be empty or NaN
            alert(`Field ${field} requires a valid number.`);
            return;
        }
      }
      
      onUpdateInvestment(updatedInvestmentData as Investment);
      setEditingId(null);
      setEditFormData({});
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Store string values directly, parsing will happen on save.
    setEditFormData(prev => ({ ...prev, [name as keyof Investment]: value }));
  };
  
  const handleSellPriceChange = (id: string, value: string) => {
    setSellPriceInput(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirmSell = (id: string) => {
    const priceStr = sellPriceInput[id];
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      onSellInvestment(id, price);
      setSellPriceInput(prev => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
    } else {
      alert("Please enter a valid sell price.");
    }
  };

  const renderCell = (investment: Investment, field: keyof Investment) => {
    if (editingId === investment.id) {
      // editFormData[field] is now string | number | InvestmentStatus | undefined. Inputs expect string.
      let valueToEdit = editFormData[field];
      if (valueToEdit === undefined || valueToEdit === null) {
        valueToEdit = ''; // Default to empty string for inputs
      } else {
        valueToEdit = String(valueToEdit); // Ensure it's a string for input val
      }


      if (field === 'notes' || field === 'buyPointRationale' || field === 'exitPointRationale') {
        return <textarea name={field} value={valueToEdit} onChange={handleChange} className="w-full p-1 border rounded-md text-sm min-w-[150px] bg-white focus:bg-blue-50" rows={3}/>;
      }
      if (field === 'status') {
        return (
          <select name={field} value={valueToEdit} onChange={handleChange} className="w-full p-1 border rounded-md text-sm bg-white focus:bg-blue-50">
            {Object.values(InvestmentStatus).map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        );
      }
      if (field === 'quantity' || field === 'buyPrice' || field === 'currentMarketPrice' || field === 'targetSellPrice') {
         return <input type="number" name={field} value={valueToEdit} onChange={handleChange} className="w-full p-1 border rounded-md text-sm min-w-[80px] bg-white focus:bg-blue-50" step="any" placeholder={field === 'targetSellPrice' ? 'Optional' : 'Required'}/>;
      }
      if (field === 'buyDate' || field === 'targetSellDate') {
        return <input type="date" name={field} value={valueToEdit} onChange={handleChange} className="w-full p-1 border rounded-md text-sm bg-white focus:bg-blue-50" placeholder={field === 'targetSellDate' ? 'Optional' : 'Required'}/>;
      }
      return <input type="text" name={field} value={valueToEdit} onChange={handleChange} className="w-full p-1 border rounded-md text-sm min-w-[100px] bg-white focus:bg-blue-50"/>;
    }
    
    const displayValue = investment[field];
    if (field === 'buyPrice' || field === 'currentMarketPrice' || field === 'targetSellPrice') {
        return displayValue ? `LKR ${Number(displayValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (field === 'targetSellPrice' ? 'N/A' : 'LKR 0.00');
    }
    if (field === 'quantity') {
        return displayValue ? Number(displayValue).toLocaleString() : '0';
    }
     if (field === 'buyDate' || field === 'targetSellDate') {
        return displayValue ? new Date(displayValue as string).toLocaleDateString() : 'N/A';
    }
    return displayValue !== undefined && displayValue !== null ? String(displayValue) : 'N/A';
  };
  
  // Updated column definitions with explicit isCalculated and isAction flags
  const columns: ColumnConfig[] = [
    { key: 'stockSymbol', header: 'Symbol', minWidth: '100px', isCalculated: false, isAction: false },
    { key: 'companyName', header: 'Company', minWidth: '200px', isCalculated: false, isAction: false },
    { key: 'sector', header: 'Sector', minWidth: '150px', isCalculated: false, isAction: false },
    { key: 'status', header: 'Status', minWidth: '100px', isCalculated: false, isAction: false },
    { key: 'buyDate', header: 'Buy Date', minWidth: '120px', isCalculated: false, isAction: false },
    { key: 'quantity', header: 'Qty', isNumeric: true, minWidth: '80px', isCalculated: false, isAction: false },
    { key: 'buyPrice', header: 'Buy Price', isNumeric: true, minWidth: '120px', isCalculated: false, isAction: false },
    { key: 'totalBuyValue', header: 'Total Buy Value', isNumeric: true, isCalculated: true, isAction: false, minWidth: '150px' },
    { key: 'currentMarketPrice', header: 'Current Price', isNumeric: true, minWidth: '120px', isCalculated: false, isAction: false },
    { key: 'currentValue', header: 'Current Value', isNumeric: true, isCalculated: true, isAction: false, minWidth: '150px' },
    { key: 'gainLoss', header: 'Gain/Loss (LKR)', isNumeric: true, isCalculated: true, isAction: false, minWidth: '150px' },
    { key: 'percentageGainLoss', header: '% Gain/Loss', isNumeric: true, isCalculated: true, isAction: false, minWidth: '120px' },
    { key: 'perCurrent', header: 'PER (Current)', minWidth: '100px', isCalculated: false, isAction: false },
    { key: 'per5YrAvg', header: 'PER (5Yr Avg)', minWidth: '100px', isCalculated: false, isAction: false },
    { key: 'liquidityDailyVol', header: 'Liquidity (Vol.)', minWidth: '120px', isCalculated: false, isAction: false },
    { key: 'buyPointRationale', header: 'Buy Rationale', minWidth: '250px', isCalculated: false, isAction: false },
    { key: 'targetSellPrice', header: 'Target Sell Price', isNumeric: true, minWidth: '120px', isCalculated: false, isAction: false },
    { key: 'targetSellDate', header: 'Target Sell Date', minWidth: '120px', isCalculated: false, isAction: false },
    { key: 'exitPointRationale', header: 'Exit Rationale', minWidth: '250px', isCalculated: false, isAction: false },
    { key: 'notes', header: 'Notes', minWidth: '250px', isCalculated: false, isAction: false },
    { key: 'actions', header: 'Actions', isAction: true, isCalculated: false, minWidth: '280px' }, // Adjusted minWidth for new button
  ];

  if (investments.length === 0) {
    return <p className="text-gray-500 text-center py-4">No investments added yet. Click "Add Investment" to get started.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map(col => (
              <th key={col.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10" style={{minWidth: col.minWidth}}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {investments.map((investment) => {
            const totalBuyValue = investment.quantity * investment.buyPrice;
            const currentValue = investment.quantity * investment.currentMarketPrice;
            const gainLoss = currentValue - totalBuyValue;
            const percentageGainLoss = totalBuyValue > 0 ? (gainLoss / totalBuyValue) * 100 : 0;

            return (
              <tr key={investment.id} className={`${editingId === investment.id ? 'bg-blue-100' : (investment.status === InvestmentStatus.SOLD ? 'bg-gray-100 opacity-70' : 'hover:bg-gray-50')} transition-colors duration-150`}>
                {columns.map((col: ColumnConfig) => {
                  // Type narrowing for col based on discriminated union
                  if (col.isCalculated) { // col is CalculatedColumnConfig
                    let value: string | number = 'N/A';
                    let textColor = 'text-gray-700';
                    if (col.key === 'totalBuyValue') value = `LKR ${totalBuyValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    else if (col.key === 'currentValue') value = `LKR ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    else if (col.key === 'gainLoss') {
                      value = `LKR ${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                      if (investment.status !== InvestmentStatus.SOLD) textColor = gainLoss >= 0 ? 'text-success' : 'text-error';
                    } 
                    else if (col.key === 'percentageGainLoss') {
                      value = `${percentageGainLoss.toFixed(2)}%`;
                       if (investment.status !== InvestmentStatus.SOLD) textColor = percentageGainLoss >= 0 ? 'text-success' : 'text-error';
                    }
                    return <td key={col.key} className={`px-4 py-3 whitespace-nowrap text-sm ${textColor} ${col.isNumeric ? 'text-right' : 'text-left'}`}>{value}</td>;
                  } else if (col.isAction) { // col is ActionColumnConfig
                    return (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm font-medium sticky right-0 bg-opacity-75 z-0" style={{ backgroundColor: editingId === investment.id ? 'var(--color-blue-100)' : (investment.status === InvestmentStatus.SOLD ? 'var(--color-gray-100)' : 'var(--color-base-100, white)')}}>
                        {editingId === investment.id ? (
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleSaveEdit(investment.id)} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Save changes"><CheckIcon className="w-5 h-5"/></button>
                            <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Cancel edit"><XIcon className="w-5 h-5"/></button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <button onClick={() => handleEdit(investment)} className="text-primary hover:text-blue-700 p-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500" title="Edit" aria-label={`Edit ${investment.stockSymbol}`}><EditIcon className="w-5 h-5"/></button>
                            {investment.status === InvestmentStatus.ACTIVE && (
                              <>
                                <button 
                                  onClick={() => onFetchNewsAndAnalysis(investment)} 
                                  className="text-info hover:text-sky-700 p-1 rounded hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50" 
                                  title={isAiReady ? `Get News & AI Analysis for ${investment.stockSymbol}` : "AI not available"}
                                  disabled={!isAiReady}
                                  aria-label={`Get news and analysis for ${investment.stockSymbol}`}
                                >
                                  <NewspaperIcon className="w-5 h-5"/>
                                </button>
                                <div className="inline-flex items-center ml-1">
                                  <input 
                                    type="number" 
                                    placeholder="Sell Price" 
                                    value={sellPriceInput[investment.id] || ''}
                                    onChange={(e) => handleSellPriceChange(investment.id, e.target.value)}
                                    className="w-24 p-1 border rounded-md text-sm mr-1 focus:ring-1 focus:ring-primary"
                                    onClick={(e) => e.stopPropagation()} 
                                    step="any"
                                    aria-label={`Sell price for ${investment.stockSymbol}`}
                                  />
                                  <button onClick={() => handleConfirmSell(investment.id)} className="text-secondary hover:text-emerald-700 p-1 rounded hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" title="Sell" aria-label={`Sell ${investment.stockSymbol}`}><DollarSignIcon className="w-5 h-5"/></button>
                                </div>
                              </>
                            )}
                             <button onClick={() => {if(window.confirm('Are you sure you want to delete this investment? This action cannot be undone.')) onDeleteInvestment(investment.id)}} className="text-error hover:text-red-700 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500" title="Delete" aria-label={`Delete ${investment.stockSymbol}`}><TrashIcon className="w-5 h-5"/></button>
                          </div>
                        )}
                      </td>
                    );
                  } else { // col is DataColumnConfig
                    const dataColumn = col as DataColumnConfig; // Explicitly cast to ensure correct typing for dataColumn.key
                    return (
                      <td key={dataColumn.key} className={`px-4 py-3 text-sm text-gray-700 ${dataColumn.isNumeric ? 'text-right' : 'text-left'} ${editingId === investment.id ? 'py-1' : 'whitespace-nowrap'}`}>
                        {renderCell(investment, dataColumn.key)}
                      </td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvestmentTable;
