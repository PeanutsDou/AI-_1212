import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, AreaChart, Area } from 'recharts';
import { MarketHistoryPoint } from '../types';

interface MarketChartProps {
  data: MarketHistoryPoint[];
  color?: string;
  goodName: string;
  averageCost?: number;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, goodName, averageCost }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-retro-dark">暂无数据</div>;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const domainMin = Math.max(0, minPrice * 0.8);
  const domainMax = maxPrice * 1.2;

  // Neon Theme Colors
  const strokeColor = "#ccff00"; // Neon Green
  const areaColor = "#ccff00";   
  const axisColor = "#64748b";   // Slate 500
  const gridColor = "#1e293b";   // Slate 800

  return (
    <div className="h-80 w-full bg-retro-bg border-2 border-retro-accent p-4 relative overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-2 px-2 border-b-2 border-retro-dark pb-1 relative z-20">
        <h4 className="text-2xl font-black text-retro-accent tracking-widest uppercase text-shadow-neon">{goodName}</h4>
        <div className="text-xs text-white font-mono font-bold">
           <span className="mr-4">MIN: {minPrice.toFixed(0)}</span>
           <span>MAX: {maxPrice.toFixed(0)}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="90%" className="relative z-20">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.8} />
          <XAxis dataKey="month" hide={true} />
          <YAxis 
            domain={[domainMin, domainMax]} 
            tick={{fontSize: 10, fontFamily: 'monospace', fill: axisColor}}
            width={40}
            stroke={axisColor}
            tickFormatter={(value) => `${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000',
              border: '2px solid #ccff00', 
              boxShadow: '4px 4px 0px #fff', 
              borderRadius: '0px',
              fontFamily: 'monospace',
              fontSize: '16px',
              color: '#ccff00'
            }}
            itemStyle={{ color: '#ccff00' }}
            formatter={(value: number) => [`¥${value.toFixed(2)}`, 'PRICE']}
            cursor={{ stroke: '#ccff00', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          {averageCost && averageCost > 0 && (
            <ReferenceLine 
              y={averageCost} 
              stroke="#8b5cf6" 
              strokeDasharray="4 4" 
              label={{ 
                position: 'insideRight', 
                value: 'COST', 
                fill: '#8b5cf6', 
                fontSize: 12,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                backgroundColor: '#0b0d14'
              }} 
            />
          )}

          <Area 
            type="step" 
            dataKey="price" 
            stroke={strokeColor} 
            strokeWidth={3} 
            fillOpacity={0.15} 
            fill={areaColor} 
            animationDuration={500}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', shape: 'rect' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;