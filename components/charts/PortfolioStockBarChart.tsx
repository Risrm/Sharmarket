
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types';

interface PortfolioStockBarChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="label text-sm text-gray-700">{`${label} : LKR ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
      </div>
    );
  }
  return null;
};

const PortfolioStockBarChart: React.FC<PortfolioStockBarChartProps> = ({ data }) => {
   if (data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No data for stock allocation.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
        layout="vertical" // For horizontal bars, easier to read stock names
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
        <XAxis type="number" tickFormatter={(value) => `LKR ${value/1000}k`} stroke="#4B5563" />
        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} stroke="#4B5563" interval={0}/>
        <Tooltip content={<CustomTooltip />}/>
        <Legend wrapperStyle={{fontSize: '12px'}}/>
        <Bar dataKey="value" name="Current Value" fill="var(--color-secondary)" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PortfolioStockBarChart;
    