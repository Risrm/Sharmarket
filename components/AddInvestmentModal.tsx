
import React, { useState } from 'react';
import { Investment, InvestmentStatus } from '../types';
import { SECTORS, INVESTMENT_STATUS_OPTIONS } from '../constants'; // Assuming SECTORS is an array of strings
import { XIcon } from './icons/XIcon';

interface AddInvestmentModalProps {
  onClose: () => void;
  onAddInvestment: (investment: Omit<Investment, 'id' | 'status'>) => void;
  cashBalance: number;
}

const initialFormState: Omit<Investment, 'id' | 'status'> = {
  stockSymbol: '',
  companyName: '',
  sector: SECTORS[0] || '',
  buyDate: new Date().toISOString().split('T')[0], // Default to today
  quantity: 0,
  buyPrice: 0,
  currentMarketPrice: 0,
  perCurrent: '',
  per5YrAvg: '',
  liquidityDailyVol: '',
  buyPointRationale: '',
  targetSellPrice: undefined,
  targetSellDate: undefined,
  exitPointRationale: undefined,
  notes: undefined,
};

const FormField = <T extends string | number | undefined,>({ label, id, value, onChange, type = 'text', placeholder, required, options, rows, className }: { label: string; id: keyof typeof initialFormState; value: T; onChange: (id: keyof typeof initialFormState, value: string | number) => void; type?: string; placeholder?: string; required?: boolean; options?: {value: string; label: string}[]; rows?: number; className?: string;}) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' && options ? (
      <select
        id={id}
        name={id}
        value={value as string}
        onChange={(e) => onChange(id, e.target.value)}
        required={required}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
      >
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    ) : type === 'textarea' ? (
       <textarea
        id={id}
        name={id}
        rows={rows || 3}
        value={value as string || ''}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
      />
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value || (type === 'number' ? '' : value as string)} // Handle 0 for number inputs
        onChange={(e) => onChange(id, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
        step={type === 'number' ? 'any' : undefined}
      />
    )}
  </div>
);


const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ onClose, onAddInvestment, cashBalance }) => {
  const [formData, setFormData] = useState<Omit<Investment, 'id' | 'status'>>(initialFormState);

  const handleChange = (field: keyof typeof initialFormState, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0 || formData.buyPrice <= 0) {
        alert("Quantity and Buy Price must be greater than zero.");
        return;
    }
    const cost = formData.quantity * formData.buyPrice;
    if (cashBalance < cost) {
      alert(`Insufficient cash balance (LKR ${cashBalance.toLocaleString()}) for this purchase (LKR ${cost.toLocaleString()}).`);
      return;
    }
    // Ensure currentMarketPrice is set if not provided, defaults to buyPrice
    const investmentToAdd = {
        ...formData,
        currentMarketPrice: formData.currentMarketPrice > 0 ? formData.currentMarketPrice : formData.buyPrice,
    };
    onAddInvestment(investmentToAdd);
  };
  
  const totalCost = formData.quantity * formData.buyPrice;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral">Add New Investment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <FormField label="Stock Symbol" id="stockSymbol" value={formData.stockSymbol} onChange={handleChange} placeholder="e.g., LIOC.N0000" required />
            <FormField label="Company Name" id="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g., Lanka IOC PLC" required />
            <FormField label="Sector" id="sector" value={formData.sector} onChange={handleChange} type="select" options={SECTORS.map(s => ({ value: s, label: s }))} required />
            <FormField label="Buy Date" id="buyDate" value={formData.buyDate} onChange={handleChange} type="date" required />
            <FormField label="Quantity" id="quantity" value={formData.quantity} onChange={handleChange} type="number" placeholder="e.g., 100" required />
            <FormField label="Buy Price (LKR)" id="buyPrice" value={formData.buyPrice} onChange={handleChange} type="number" placeholder="e.g., 150.50" required />
            <FormField label="Current Market Price (LKR)" id="currentMarketPrice" value={formData.currentMarketPrice} onChange={handleChange} type="number" placeholder="Defaults to Buy Price if 0" />
            <FormField label="PER (Current)" id="perCurrent" value={formData.perCurrent} onChange={handleChange} placeholder="e.g., 12.5 or N/A" />
            <FormField label="PER (5-Yr Avg)" id="per5YrAvg" value={formData.per5YrAvg} onChange={handleChange} placeholder="e.g., 10.2 or N/A" />
            <FormField label="Liquidity (Daily Vol.)" id="liquidityDailyVol" value={formData.liquidityDailyVol} onChange={handleChange} placeholder="e.g., 500,000" />
            <FormField label="Target Sell Price (LKR)" id="targetSellPrice" value={formData.targetSellPrice} onChange={handleChange} type="number" placeholder="e.g., 200.00" />
            <FormField label="Target Sell Date" id="targetSellDate" value={formData.targetSellDate} onChange={handleChange} type="date" />
          </div>
            <FormField label="Buy Point Rationale" id="buyPointRationale" value={formData.buyPointRationale} onChange={handleChange} type="textarea" placeholder="Why are you buying this stock?" className="md:col-span-2"/>
            <FormField label="Exit Point Rationale" id="exitPointRationale" value={formData.exitPointRationale} onChange={handleChange} type="textarea" placeholder="Under what conditions will you sell?" className="md:col-span-2"/>
            <FormField label="Notes" id="notes" value={formData.notes} onChange={handleChange} type="textarea" placeholder="Any additional notes?" className="md:col-span-2"/>
          
          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-600">Total Cost: <span className="font-semibold">LKR {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
            <p className="text-sm text-gray-600">Remaining Cash after Purchase: <span className="font-semibold">LKR {(cashBalance - totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
            {cashBalance < totalCost && <p className="text-sm text-red-500 font-semibold">Warning: Cost exceeds available cash balance.</p>}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150"
              disabled={cashBalance < totalCost || formData.quantity <= 0 || formData.buyPrice <= 0}
            >
              Add Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentModal;
    