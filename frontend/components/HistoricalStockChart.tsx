import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalPricePoint } from '../types';

interface HistoricalStockChartProps {
  data: HistoricalPricePoint[];
}

const formatYAxis = (tickItem: number) => {
    return `$${tickItem.toFixed(0)}`;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-lg">
          <p className="label text-gray-300">{`${label}`}</p>
          <p className="intro text-cyan-400 font-bold">{`Price : $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
  
    return null;
};

const HistoricalStockChart: React.FC<HistoricalStockChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis 
            dataKey="date" 
            stroke="#A0AEC0" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value, index) => index % 14 === 0 ? value : ''} // Show a label every 2 weeks
            interval="preserveStartEnd"
            />
        <YAxis 
            stroke="#A0AEC0" 
            tickFormatter={formatYAxis} 
            domain={['dataMin - 20', 'dataMax + 20']} 
            tick={{ fontSize: 12 }}
            orientation="left"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="price" stroke="#2DD4BF" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default HistoricalStockChart;
