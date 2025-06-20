
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types';

interface PortfolioSectorPieChartProps {
  data: ChartDataPoint[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#FFD700', '#40E0D0'];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="label text-sm text-gray-700">{`${payload[0].name} : LKR ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${payload[0].payload.percent.toFixed(2)}%)`}</p>
      </div>
    );
  }
  return null;
};

const PortfolioSectorPieChart: React.FC<PortfolioSectorPieChartProps> = ({ data }) => {
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);
  const dataWithPercent = data.map(entry => ({
    ...entry,
    percent: totalValue > 0 ? (entry.value / totalValue) * 100 : 0,
  }));

  if (data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No data for sector allocation.</p>;
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => percent > 5 ? `${name} (${percent.toFixed(0)}%)` : ''} // Show label if percent > 5%
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          stroke="#fff"
          strokeWidth={2}
        >
          {dataWithPercent.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioSectorPieChart;
    