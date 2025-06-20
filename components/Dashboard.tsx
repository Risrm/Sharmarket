
import React from 'react';
import { DashboardData, Investment, ChartDataPoint } from '../types';
import PortfolioSectorPieChart from './charts/PortfolioSectorPieChart';
import PortfolioStockBarChart from './charts/PortfolioStockBarChart';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
// PlusIcon and MinusIcon removed as they are not directly used here for add/withdraw buttons styling

interface DashboardProps {
  data: DashboardData;
  sectorAllocationData: ChartDataPoint[];
  stockAllocationData: ChartDataPoint[];
  onAddFunds: () => void;
  onWithdrawFunds: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; change?: number; isCurrency?: boolean; isPercentage?: boolean; onAddFunds?: () => void; onWithdrawFunds?: () => void; }> = 
  ({ title, value, change, isCurrency = false, isPercentage = false, onAddFunds, onWithdrawFunds }) => {
  const displayValue = typeof value === 'number' 
    ? isCurrency 
      ? `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : isPercentage
        ? `${value.toFixed(2)}%`
        : value.toLocaleString()
    : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-neutral">{displayValue}</p>
      {change !== undefined && ( // Only show change if it's provided and meaningful
        <div className={`mt-1 flex items-center text-sm ${change >= 0 ? 'text-success' : 'text-error'}`}>
          {change >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
          {Math.abs(change).toFixed(2)}%
        </div>
      )}
      {title === "Cash Balance" && onAddFunds && onWithdrawFunds && (
        <div className="mt-3 flex space-x-2">
          <button 
            onClick={onAddFunds}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
            aria-label="Add funds to cash balance"
          >
            Add Funds
          </button>
          <button 
            onClick={onWithdrawFunds}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
            aria-label="Withdraw funds from cash balance"
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
};

const PerformerList: React.FC<{ title: string; investments: Investment[]; isTop: boolean }> = ({ title, investments, isTop }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold text-neutral mb-3">{title}</h3>
    {investments.length === 0 ? <p className="text-gray-500">No data available.</p> : (
      <ul className="space-y-2">
        {investments.map(inv => {
          const cost = inv.quantity * inv.buyPrice;
          const currentValue = inv.quantity * inv.currentMarketPrice;
          const pnl = currentValue - cost;
          const pnlPercentageDisplay = cost > 0 ? (pnl / cost) * 100 : 0;

          return (
            <li key={inv.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-b-0">
              <span>{inv.stockSymbol} <span className="text-xs text-gray-400">({inv.companyName})</span></span>
              <span className={`${pnlPercentageDisplay >= 0 ? 'text-success' : 'text-error'} font-medium`}>
                {pnlPercentageDisplay.toFixed(2)}%
              </span>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, sectorAllocationData, stockAllocationData, onAddFunds, onWithdrawFunds }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Portfolio Value (Active)" value={data.totalPortfolioValue} isCurrency />
      <StatCard title="Investment Cost (Active)" value={data.totalInvestmentCost} isCurrency />
      <StatCard title="Unrealized P&L (Active)" value={data.unrealizedPnL} change={data.unrealizedPnLPercentage} isCurrency />
      <StatCard title="Realized P&L (Sold)" value={data.realizedPnL} isCurrency />
      <StatCard title="Cash Balance" value={data.cashBalance} isCurrency onAddFunds={onAddFunds} onWithdrawFunds={onWithdrawFunds} />
      <StatCard title="Active Holdings" value={data.numberOfHoldings} />
      
      <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformerList title="Top Performing Stocks (% Gain, Active)" investments={data.topPerformers} isTop={true} />
        <PerformerList title="Worst Performing Stocks (% Loss, Active)" investments={data.worstPerformers} isTop={false} />
      </div>

      <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral mb-4">Portfolio Allocation by Sector</h3>
        {sectorAllocationData.length > 0 ? <PortfolioSectorPieChart data={sectorAllocationData} /> : <p className="text-gray-500">No active investments to display sector allocation.</p>}
      </div>
      <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral mb-4">Portfolio Allocation by Stock</h3>
         {stockAllocationData.length > 0 ? <PortfolioStockBarChart data={stockAllocationData} /> : <p className="text-gray-500">No active investments to display stock allocation.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
