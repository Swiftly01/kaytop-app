/**
 * PieChart Component
 * Simple pie chart component using Recharts
 */

import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartData {
  name?: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  size?: number; // Shorthand for both width and height
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  colors?: string[];
  backgroundColor?: string;
  className?: string;
}

const DEFAULT_COLORS = [
  '#7F56D9',
  '#06AED4', 
  '#F79009',
  '#F04438',
  '#12B76A',
  '#6941C6',
  '#84CAFF',
  '#FDB022',
  '#F97066',
  '#32D583'
];

export default function PieChart({
  data,
  width,
  height,
  size,
  innerRadius = 0,
  outerRadius = 80,
  showTooltip = true,
  showLegend = false,
  colors = DEFAULT_COLORS,
  backgroundColor,
  className = '',
}: PieChartProps) {
  // Use size for both width and height if provided
  const chartWidth = size || width || 300;
  const chartHeight = size || height || 300;
  // Ensure data has colors and names
  const chartData = data.map((item, index) => ({
    ...item,
    name: item.name || `Item ${index + 1}`,
    color: item.color || colors[index % colors.length],
  }));

  return (
    <div 
      className={`pie-chart ${className}`}
      style={{ backgroundColor }}
    >
      <ResponsiveContainer width={chartWidth} height={chartHeight}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()}`,
                name
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          )}
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}