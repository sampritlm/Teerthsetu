import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// 7-Month Seasonal Dataset matching reference structure
const defaultComparisonData = [
  { month: 'JANUARY', onlinePasses: 400, spotWalkins: 2600, totalHeadcount: 3000 },
  { month: 'FEBRUARY', onlinePasses: 1000, spotWalkins: 1000, totalHeadcount: 2000 },
  { month: 'MARCH', onlinePasses: 5000, spotWalkins: 2100, totalHeadcount: 2900 },
  { month: 'APRIL', onlinePasses: 3000, spotWalkins: 800, totalHeadcount: 2200 },
  { month: 'MAY', onlinePasses: 4300, spotWalkins: 700, totalHeadcount: 5000 },
  { month: 'JUNE', onlinePasses: 2500, spotWalkins: 4300, totalHeadcount: 6800 },
  { month: 'JULY', onlinePasses: 6100, spotWalkins: 1900, totalHeadcount: 4200 }
];

// Custom Light/White Theme Tooltip
function WhiteThemeTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl text-xs font-mono space-y-1.5 min-w-[170px]">
        <div className="text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 pb-1 text-[11px] font-sans uppercase">
          {label}
        </div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-sans font-medium">{entry.name}</span>
            </span>
            <strong className="text-slate-900 dark:text-white">{entry.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function MinimalDarkLineChart({ 
  data = defaultComparisonData, 
  title = "TEERTHSETU CROWD & ATTENDANCE MULTI-ANALYSIS TREND" 
}) {
  const [viewMode, setViewMode] = useState('monthly'); // monthly, hourly

  // Hourly dataset matching the same aesthetic
  const hourlyData = [
    { month: '04:00 AM', onlinePasses: 800, spotWalkins: 300, totalHeadcount: 1100 },
    { month: '08:00 AM', onlinePasses: 4300, spotWalkins: 1800, totalHeadcount: 6100 },
    { month: '12:00 PM', onlinePasses: 3900, spotWalkins: 1700, totalHeadcount: 5600 },
    { month: '04:00 PM', onlinePasses: 4100, spotWalkins: 1700, totalHeadcount: 5800 },
    { month: '08:00 PM', onlinePasses: 4100, spotWalkins: 1800, totalHeadcount: 5900 },
    { month: '10:00 PM', onlinePasses: 1300, spotWalkins: 500, totalHeadcount: 1800 }
  ];

  const activeData = viewMode === 'monthly' ? defaultComparisonData : hourlyData;

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col justify-between space-y-6 font-sans">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">DUAL-TONE MULTI-ANALYSIS COMPARISON (0K - 5K+ SCALE)</p>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex items-center text-[10px] font-mono font-bold">
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'monthly' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            MONTHLY
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hourly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'hourly' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HOURLY
          </button>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <defs>
              {/* Dual Tone Gradient Fills */}
              <linearGradient id="emeraldDual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="blueDual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Light Gridlines */}
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} className="dark:stroke-slate-800" />

            {/* X-Axis Uppercase Month/Time Labels */}
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false} 
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
              dy={12}
            />

            {/* Y-Axis 0, 1K, 3K, 5K Labels */}
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false} 
              axisLine={false}
              ticks={[0, 1000, 3000, 5000]}
              tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}K`)}
              tick={{ fill: '#64748b' }}
              dx={-8}
            />

            <Tooltip content={<WhiteThemeTooltip />} />

            {/* Dual Tone Area Fills */}
            <Area 
              type="linear" 
              dataKey="totalHeadcount" 
              fill="url(#emeraldDual)" 
              stroke="none"
              isAnimationActive={true}
            />
            <Area 
              type="linear" 
              dataKey="onlinePasses" 
              fill="url(#blueDual)" 
              stroke="none"
              isAnimationActive={true}
            />

            {/* Line 1: Royal Blue Dual-Tone Line with Solid Dots (Online Passes) */}
            <Line 
              type="linear" 
              dataKey="onlinePasses" 
              name="ONLINE PASSES"
              stroke="#3B82F6" 
              strokeWidth={2.5} 
              dot={{ r: 4.5, fill: '#3B82F6', stroke: '#ffffff', strokeWidth: 2 }} 
              activeDot={{ r: 6.5, fill: '#2563EB', stroke: '#ffffff' }}
              isAnimationActive={true}
            />

            {/* Line 2: Emerald Dual-Tone Line with Solid Dots (Total Headcount) */}
            <Line 
              type="linear" 
              dataKey="totalHeadcount" 
              name="TOTAL HEADCOUNT"
              stroke="#10B981" 
              strokeWidth={2.5} 
              dot={{ r: 4.5, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }} 
              activeDot={{ r: 6.5, fill: '#059669', stroke: '#ffffff' }}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Badge Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block shadow-sm ring-2 ring-blue-200 dark:ring-blue-900" />
          <span className="text-slate-700 dark:text-slate-300">ANALYSIS 1 (ONLINE PASSES)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block shadow-sm ring-2 ring-slate-200 dark:ring-slate-800" />
          <span className="text-slate-700 dark:text-slate-300">ANALYSIS 2 (SPOT WALK-INS)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-900" />
          <span className="text-slate-800 dark:text-slate-200">ANALYSIS 3 (TOTAL HEADCOUNT)</span>
        </div>
      </div>
    </div>
  );
}
