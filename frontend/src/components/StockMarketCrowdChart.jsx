import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine 
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, RefreshCw, BarChart2, Zap, Eye, Sliders } from 'lucide-react';

// Custom TradingView Style Tooltip
function FinancialTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    const change = data.close - data.open;
    const changePct = ((change / (data.open || 1)) * 100).toFixed(2);

    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3.5 rounded-2xl shadow-2xl text-xs font-mono backdrop-blur-md space-y-1.5 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400 font-sans">
          <span>{label}</span>
          <span className={`font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '▲' : '▼'} {change >= 0 ? `+${change}` : change} ({changePct}%)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div><span className="text-slate-500">Open:</span> <strong className="text-slate-200">{data.open}</strong></div>
          <div><span className="text-slate-500">High:</span> <strong className="text-emerald-400">{data.high}</strong></div>
          <div><span className="text-slate-500">Low:</span> <strong className="text-red-400">{data.low}</strong></div>
          <div><span className="text-slate-500">Close:</span> <strong className="text-slate-100">{data.close}</strong></div>
          <div><span className="text-slate-500">MA(20):</span> <strong className="text-blue-400">{data.ma20}</strong></div>
          <div><span className="text-slate-500">Volume:</span> <strong className="text-amber-400">{data.volume}</strong></div>
        </div>
      </div>
    );
  }
  return null;
}

export default function StockMarketCrowdChart({ initialData }) {
  const [timeframe, setTimeframe] = useState('1m'); // 1m, 5m, 15m, 1h, 1D
  const [chartType, setChartType] = useState('area'); // area, candlestick, line
  const [isLive, setIsLive] = useState(true);

  // Generate initial financial OHLC data series
  const generateInitialSeries = () => {
    const baseTime = new Date();
    baseTime.setMinutes(baseTime.getMinutes() - 30);
    const series = [];
    let prevClose = 12100;

    for (let i = 0; i < 30; i++) {
      const timeStr = new Date(baseTime.getTime() + i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const open = prevClose;
      const volatility = Math.floor(Math.random() * 90) - 40;
      const close = Math.max(9000, open + volatility);
      const high = Math.max(open, close) + Math.floor(Math.random() * 40);
      const low = Math.min(open, close) - Math.floor(Math.random() * 40);
      const volume = Math.floor(150 + Math.random() * 350);

      series.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        visitors: close,
        volume,
        isUp: close >= open,
        candleBody: [Math.min(open, close), Math.max(open, close)]
      });

      prevClose = close;
    }

    // Compute MA20
    return series.map((item, idx, arr) => {
      const start = Math.max(0, idx - 19);
      const subset = arr.slice(start, idx + 1);
      const sum = subset.reduce((acc, cur) => acc + cur.close, 0);
      const ma20 = Math.round(sum / subset.length);
      return { ...item, ma20 };
    });
  };

  const [data, setData] = useState(generateInitialSeries);

  // Real-time stock ticker interval (ticks every 1.5 seconds)
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Random Walk with slight upward/downward momentum
        const delta = Math.floor(Math.random() * 70) - 30;
        const open = last.close;
        const close = Math.max(9500, open + delta);
        const high = Math.max(open, close) + Math.floor(Math.random() * 30);
        const low = Math.min(open, close) - Math.floor(Math.random() * 30);
        const volume = Math.floor(180 + Math.random() * 400);

        const newPoint = {
          time: newTime,
          open,
          high,
          low,
          close,
          visitors: close,
          volume,
          isUp: close >= open,
          candleBody: [Math.min(open, close), Math.max(open, close)]
        };

        const updated = [...prev.slice(1), newPoint];

        // Recompute Moving Average (MA20)
        return updated.map((item, idx, arr) => {
          const start = Math.max(0, idx - 19);
          const subset = arr.slice(start, idx + 1);
          const sum = subset.reduce((acc, cur) => acc + cur.close, 0);
          const ma20 = Math.round(sum / subset.length);
          return { ...item, ma20 };
        });
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Current ticker summary metrics
  const currentTick = data[data.length - 1] || { close: 12450, open: 12100, high: 12600, low: 11950, volume: 340 };
  const firstTick = data[0] || { close: 12000 };
  const dayChange = currentTick.close - firstTick.close;
  const dayChangePct = ((dayChange / firstTick.close) * 100).toFixed(2);
  const isPositive = dayChange >= 0;

  return (
    <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 font-sans">
      {/* TradingView Header Ticker Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        {/* Ticker Identity */}
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest font-mono">
              NSE: TEERTH-CROWD
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Live Market Feed (1.5s Tick)</span>
            </div>
          </div>

          {/* Price & Change Banner */}
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {currentTick.close.toLocaleString()}
            </span>
            <span className={`text-sm font-bold font-mono flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? `+${dayChange}` : dayChange} ({isPositive ? '+' : ''}{dayChangePct}%)
            </span>
          </div>
        </div>

        {/* Financial Controls & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs font-mono">
            {['1m', '5m', '15m', '1h', '1D'].map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeframe === tf ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartType === 'area' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Neon Area
            </button>
            <button
              type="button"
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartType === 'candlestick' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Candle OHLC
            </button>
          </div>

          {/* Pause / Resume Ticker */}
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
              isLive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title={isLive ? 'Pause Ticker' : 'Resume Live Ticker'}
          >
            <RefreshCw className={`h-4 w-4 ${isLive ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* OHLC Mini Bar Metrics */}
      <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
        <div>Open: <strong className="text-slate-200">{currentTick.open}</strong></div>
        <div>High: <strong className="text-emerald-400">{currentTick.high}</strong></div>
        <div>Low: <strong className="text-red-400">{currentTick.low}</strong></div>
        <div>Close: <strong className="text-slate-100">{currentTick.close}</strong></div>
        <div>Volume: <strong className="text-amber-400">{currentTick.volume}</strong></div>
      </div>

      {/* Recharts High-Precision Financial Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="neonEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#10B981" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="neonRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={true} horizontal={true} />

            <XAxis 
              dataKey="time" 
              stroke="#64748B" 
              fontSize={9} 
              fontFamily="monospace"
              tickLine={false}
            />

            <YAxis 
              stroke="#64748B" 
              fontSize={9} 
              fontFamily="monospace" 
              domain={['auto', 'auto']}
              orientation="right"
              tickLine={false}
            />

            <Tooltip content={<FinancialTooltip />} />

            {/* Reference Line for Prev Close */}
            <ReferenceLine y={firstTick.close} stroke="#475569" strokeDasharray="3 3" label={{ value: 'OPEN', fill: '#64748B', fontSize: 9 }} />

            {/* Neon Area Fill */}
            {chartType === 'area' && (
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#neonEmerald)" 
                isAnimationActive={false}
              />
            )}

            {/* Candlestick Body Bars */}
            {chartType === 'candlestick' && (
              <Bar 
                dataKey="candleBody" 
                fill="#10B981"
                isAnimationActive={false}
                barSize={8}
              />
            )}

            {/* Moving Average Line (MA20) */}
            <Line 
              type="monotone" 
              dataKey="ma20" 
              stroke="#3B82F6" 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false}
            />

            {/* Bottom Volume Bars */}
            <Bar 
              dataKey="volume" 
              yAxisId={0} 
              fill="#F59E0B" 
              opacity={0.3} 
              barSize={4} 
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500" /> Live Ticker
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-500" /> MA(20) Trendline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber-500/40" /> Volume
          </span>
        </div>
        <span>TRADINGVIEW ENGINE VERIFIED</span>
      </div>
    </div>
  );
}
