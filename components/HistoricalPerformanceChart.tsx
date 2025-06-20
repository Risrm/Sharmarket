
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PortfolioSnapshot } from '../types';

interface HistoricalPerformanceChartProps {
  history: PortfolioSnapshot[];
}

const CustomTooltipContent: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('si-LK', { year: 'numeric', month: 'short', day: 'numeric' });
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="text-sm text-gray-700 font-semibold">{formattedDate}</p>
        <p className="text-sm text-primary">{`Portfolio Value: LKR ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
      </div>
    );
  }
  return null;
};

const formatDateTick = (tickItem: string) => {
  const date = new Date(tickItem);
  // Show month and day. If only a few ticks, could show year too.
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const HistoricalPerformanceChart: React.FC<HistoricalPerformanceChartProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-center text-gray-500 py-10">No historical performance data available yet. Data will appear as your portfolio is tracked over time.</p>;
  }

  // Ensure dates are actual Date objects for proper sorting if needed, though ISO strings usually sort fine
  const chartData = history.map(item => ({
    ...item,
    date: item.date, // Assuming date is already YYYY-MM-DD string
  })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{
          top: 20, right: 30, left: 50, bottom: 20, // Increased left margin for Y-axis label
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDateTick} 
          stroke="var(--color-neutral)"
          angle={-30} // Angle ticks for better readability if many dates
          textAnchor="end"
          height={60} // Adjust height to accommodate angled labels
          interval="preserveStartEnd" // Show first and last, and some in between
           // Dynamically adjust tick count based on data length, or use a fixed number like 10
          minTickGap={20} // Minimum gap between ticks
        />
        <YAxis 
          stroke="var(--color-neutral)" 
          tickFormatter={(value) => `LKR ${Number(value / 1000).toFixed(0)}k`}
          label={{ value: 'Portfolio Value (LKR)', angle: -90, position: 'insideLeft', fill: 'var(--color-neutral)', style: {textAnchor: 'middle'}, dy: 0, dx: -15 }}
        />
        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1 }}/>
        <Legend verticalAlign="top" height={36}/>
        <Line type="monotone" dataKey="totalValue" name="Total Portfolio Value" stroke="var(--color-primary)" strokeWidth={2} activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'white', strokeWidth: 2 }} dot={{ r: 3, fill: 'var(--color-primary)'}} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoricalPerformanceChart;
