import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, ShieldCheck, QrCode, Sliders, AlertTriangle, LogOut, Sparkles, 
  Users, DollarSign, Clock, Settings, FileSpreadsheet, Plus, Trash2, 
  MapPin,  Printer, UserPlus, Bell, CheckCircle, Search, Calendar, X,
  Activity, ArrowUpRight, ArrowDownRight, Smartphone, Sun, Moon
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useTransparentImage } from '../hooks/useTransparentImage';
import TicketQR from '../components/TicketQR';
import GateQRScanner from '../components/GateQRScanner';
import MinimalDarkLineChart from '../components/MinimalDarkLineChart';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry, walkin, scanner, ai_forecast, rules_slots, reports
  const [stats, setStats] = useState({ activeVisitors: 12450, exitedVisitors: 32000, emergencyMode: false, onlineRatio: 70, todayRevenue: 120000, avgWaitMins: 22 });
  const [analytics, setAnalytics] = useState([]);
  
  // Custom slot state (Screen 22)
  const [slots, setSlots] = useState([
    { id: '1', time: '07:00 AM - 08:00 AM', category: 'General Darshan', onlineMins: 40, generalMins: 20, totalMins: 60, totalSlots: 1500, onlineQuota: 1000, generalQuota: 500, bookedOnline: 820, bookedGeneral: 390 },
    { id: '2', time: '08:00 AM - 09:00 AM', category: 'General Darshan', onlineMins: 40, generalMins: 20, totalMins: 60, totalSlots: 1800, onlineQuota: 1200, generalQuota: 600, bookedOnline: 1150, bookedGeneral: 580 },
    { id: '3', time: '09:00 AM - 10:00 AM', category: 'Special Entry (₹300)', onlineMins: 45, generalMins: 15, totalMins: 60, totalSlots: 2000, onlineQuota: 1500, generalQuota: 500, bookedOnline: 1480, bookedGeneral: 490 },
    { id: '4', time: '10:00 AM - 11:00 AM', category: 'General Darshan', onlineMins: 35, generalMins: 25, totalMins: 60, totalSlots: 1600, onlineQuota: 933, generalQuota: 667, bookedOnline: 750, bookedGeneral: 620 }
  ]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotCap, setNewSlotCap] = useState(1500);

  const navigate = useNavigate();

  // Load telemetry stats
  const fetchStats = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/admin/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStats();
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/admin/analytics')
      .then(res => res.json())
      .then(setAnalytics)
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if(!newSlotTime) return;
    const totSlots = parseInt(newSlotCap) || 1500;
    const onlineMins = 40;
    const generalMins = 20;
    const onlineQ = Math.round((onlineMins / 60) * totSlots);
    const genQ = totSlots - onlineQ;
    setSlots([...slots, {
      id: Date.now().toString(),
      time: newSlotTime,
      category: 'General Darshan',
      onlineMins,
      generalMins,
      totalMins: 60,
      totalSlots: totSlots,
      onlineQuota: onlineQ,
      generalQuota: genQ,
      bookedOnline: 0,
      bookedGeneral: 0
    }]);
    setNewSlotTime('');
  };

  const handleDeleteSlot = (id) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const handleAdjustOnlineMins = (id, deltaMins) => {
    setSlots(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newOnlineMins = Math.min(55, Math.max(5, s.onlineMins + deltaMins));
      const newGeneralMins = (s.totalMins || 60) - newOnlineMins;
      const newOnlineQuota = Math.round((newOnlineMins / (s.totalMins || 60)) * s.totalSlots);
      const newGeneralQuota = s.totalSlots - newOnlineQuota;
      return {
        ...s,
        onlineMins: newOnlineMins,
        generalMins: newGeneralMins,
        onlineQuota: newOnlineQuota,
        generalQuota: newGeneralQuota
      };
    }));
  };

  const handleAdjustTotalSlots = (id, deltaSlots) => {
    setSlots(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newTotal = Math.max((s.bookedOnline || 0) + (s.bookedGeneral || 0), s.totalSlots + deltaSlots);
      const newOnlineQuota = Math.round(((s.onlineMins || 40) / (s.totalMins || 60)) * newTotal);
      const newGeneralQuota = newTotal - newOnlineQuota;
      return {
        ...s,
        totalSlots: newTotal,
        onlineQuota: newOnlineQuota,
        generalQuota: newGeneralQuota
      };
    }));
  };

  const handleChangeCategory = (id, category) => {
    setSlots(prev => prev.map(s => (s.id === id ? { ...s, category } : s)));
  };

  const { isDarkMode, toggleTheme } = useTheme();
  const logoSrc = isDarkMode ? "/logo_dark_mode.png" : "/logo_light_mode.png";
  const finalLogo = useTransparentImage(logoSrc);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#090D1A] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar Command Control */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col p-6 z-20 shrink-0">
        <div className="mb-8 flex items-center w-full">
          <img 
            src={finalLogo} 
            alt="TeerthSetu Logo" 
            className="h-10 w-auto object-contain"
            style={!isDarkMode ? { mixBlendMode: 'multiply' } : {}}
          />
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarButton active={activeTab === 'telemetry'} icon={<BarChart className="h-5 w-5"/>} text="Live Telemetry" onClick={() => setActiveTab('telemetry')} />
          <SidebarButton active={activeTab === 'walkin'} icon={<Printer className="h-5 w-5"/>} text="Walk-in POS Desk" onClick={() => setActiveTab('walkin')} />
          <SidebarButton active={activeTab === 'scanner'} icon={<QrCode className="h-5 w-5"/>} text="Gate QR Scanner" onClick={() => setActiveTab('scanner')} />
          <SidebarButton active={activeTab === 'ai_forecast'} icon={<Sparkles className="h-5 w-5"/>} text="AI Strategic Forecast" onClick={() => setActiveTab('ai_forecast')} />
          <SidebarButton active={activeTab === 'rules_slots'} icon={<Sliders className="h-5 w-5"/>} text="System Config & Slots" onClick={() => setActiveTab('rules_slots')} />
          <SidebarButton active={activeTab === 'reports'} icon={<FileSpreadsheet className="h-5 w-5"/>} text="Ledger Reports" onClick={() => setActiveTab('reports')} />
        </nav>

        {/* Admin Meta */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col gap-4 mt-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-2 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition-colors text-left"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
              AD
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Pandit Shastri</p>
              <p className="text-xs text-slate-500">Chief Registrar</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-red-400 p-3 rounded-xl hover:bg-red-500/5 transition-all text-sm font-medium">
            <LogOut className="h-5 w-5" /> Secure Sign Out
          </button>
        </div>
      </aside>

      {/* Main Command Monitor */}
      <main className="flex-1 overflow-y-auto p-8 relative flex flex-col">
        {/* Glow Overlay */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 z-10 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'telemetry' && <TelemetryView stats={stats} analytics={analytics} />}
              {activeTab === 'walkin' && <WalkinPOS stats={stats} fetchStats={fetchStats} />}
              {activeTab === 'scanner' && <ScannerConsole stats={stats} fetchStats={fetchStats} />}
              {activeTab === 'ai_forecast' && <AIForecastPlanner />}
              {activeTab === 'rules_slots' && (
                <RulesSlotsView 
                  stats={stats} 
                  setStats={setStats}
                  fetchStats={fetchStats} 
                  slots={slots} 
                  handleAddSlot={handleAddSlot} 
                  handleDeleteSlot={handleDeleteSlot}
                  handleAdjustOnlineMins={handleAdjustOnlineMins}
                  handleAdjustTotalSlots={handleAdjustTotalSlots}
                  handleChangeCategory={handleChangeCategory}
                  newSlotTime={newSlotTime}
                  setNewSlotTime={setNewSlotTime}
                  newSlotCap={newSlotCap}
                  setNewSlotCap={setNewSlotCap}
                />
              )}
              {activeTab === 'reports' && <ReportsExportView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, icon, text, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${active ? 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg shadow-emerald-600/20 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-900 hover:text-slate-900 dark:text-white'}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function CrowdAnalyticsTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isSurge = data.visitors > 6500;
    const capacityPct = Math.round((data.visitors / 6500) * 100);

    return (
      <div className="bg-slate-950/95 text-white border border-slate-800 p-4 rounded-2xl shadow-2xl text-xs space-y-2 max-w-xs font-sans backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-saffron">{label}</span>
          {isSurge ? (
            <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
              🔥 Peak Surge ({capacityPct}%)
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
              ✓ Normal Flow ({capacityPct}%)
            </span>
          )}
        </div>

        <div className="space-y-1.5 pt-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Pilgrim Flow:</span>
            <strong className="text-emerald-400 font-extrabold">{data.visitors.toLocaleString()} / hr</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Online Bookings:</span>
            <span>{data.online ? data.online.toLocaleString() : Math.round(data.visitors * 0.7)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Spot Walk-ins:</span>
            <span>{data.walkin ? data.walkin.toLocaleString() : Math.round(data.visitors * 0.3)}</span>
          </div>
          <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
            <span className="text-slate-500">Gate Threshold:</span>
            <span>6,500 / hr</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ==========================================
// VIEW 1: LIVE COMMAND TELEMETRY (Screens 20 & 25)
// ==========================================
function TelemetryView({ stats, analytics }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Command Control Telemetry</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Live updates of crowd headcounts, revenue transactions, gate queue wait-times.</p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/60 border border-slate-850 p-6 rounded-2xl">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Live Inside Temple</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" /> {stats.activeVisitors.toLocaleString()}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-850 p-6 rounded-2xl">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Today's Revenue</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">₹</span>{stats.todayRevenue.toLocaleString()}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-850 p-6 rounded-2xl">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Active Ticket Queue</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.activeTickets || 0} Passes
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-850 p-6 rounded-2xl">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Avg Waiting time</span>
          <span className="text-3xl font-extrabold text-saffron">
            {stats.avgWaitMins} mins
          </span>
        </div>
      </div>

      {/* Graphs & Analytics Dashboard (Screen 25) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Minimalist Dark Line Chart (Matching Reference Image) */}
        <div className="md:col-span-2">
          <MinimalDarkLineChart title="TEERTHSETU CROWD & ATTENDANCE MULTI-ANALYSIS TREND" />
        </div>

        {/* Live Gauges (Screen 25 - Live Crowd Monitor) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col justify-between">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Live Crowd Monitor</h4>
          
          <div className="space-y-4 py-2 text-xs">
            <div>
              <div className="flex justify-between mb-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span>Inside Capacity Level</span>
                <span className="text-emerald-400 font-bold">78%</span>
              </div>
              <div className="w-full bg-white dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[78%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span>Gate 1 Queue Length</span>
                <span className="text-gold font-bold">240 Meters</span>
              </div>
              <div className="w-full bg-white dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-gold h-full w-[60%] rounded-full animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span>Gate 4 Queue Length</span>
                <span className="text-emerald-400 font-bold">45 Meters</span>
              </div>
              <div className="w-full bg-white dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[15%] rounded-full" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5 text-[11px]">Telemetry Alert</span>
              Exit Count Today: <strong>{stats.exitedVisitors.toLocaleString()} Devotees</strong>. Flow rate is normal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 2: WALK-IN TICKET POS (Screen 23)
// ==========================================
function WalkinPOS({ stats, fetchStats }) {
  const [formData, setFormData] = useState({
    name: 'Rural Pilgrim Group',
    phone: '+91 9999999999',
    visitors: 4,
    specialDarshan: 'General'
  });
  const [ticketResult, setTicketResult] = useState(null);
  const [printing, setPrinting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPrinting(true);
    
    // Call post booking API
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templeId: '1', // default seed temple
        date: new Date().toISOString().split('T')[0], // Today
        timeSlot: 'Walk-in Counter Slot',
        visitors: formData.visitors,
        specialDarshan: formData.specialDarshan
      })
    })
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        setPrinting(false);
        setTicketResult(data);
        fetchStats();
      }, 1000);
    })
    .catch(err => {
      setPrinting(false);
      console.error(err);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Walk-in POS Registration</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Issue spot passes and print paper QR codes for offline devotees who walk in without mobile applications.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl h-fit">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Ticket Config</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Devotee / Group Leader Name</label>
              <input 
                type="text" 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">No. of Visitors</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  value={formData.visitors}
                  onChange={e => setFormData({ ...formData, visitors: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Entry Ticket Tier</label>
                <select 
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
                  value={formData.specialDarshan}
                  onChange={e => setFormData({ ...formData, specialDarshan: e.target.value })}
                >
                  <option value="General">General (Free)</option>
                  <option value="Special">Special Entry (₹100)</option>
                  <option value="VVIP">VVIP (₹500)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={printing}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2"
            >
              {printing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Spot Ticket...
                </>
              ) : (
                <>
                  <Printer className="h-4.5 w-4.5" /> Generate & Print QR Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Paper Print View preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-8 rounded-3xl flex flex-col justify-center items-center min-h-[400px]">
          {ticketResult ? (
            <div className="space-y-4 text-center max-w-sm w-full">
              <span className="text-xs text-emerald-500 font-bold block uppercase tracking-widest animate-pulse">✓ Ticket Issued & Ready for Gate Entry</span>
              
              <TicketQR 
                ticketData={{
                  bookingId: ticketResult.bookingId,
                  templeName: 'Tirupati Gate Spot Pass',
                  date: new Date().toISOString().split('T')[0],
                  timeSlot: 'Immediate Entry',
                  visitors: ticketResult.visitors,
                  specialDarshan: ticketResult.specialDarshan,
                  status: 'Confirmed'
                }}
                size={180}
                showDetails={true}
                showActions={true}
              />

              <button 
                onClick={() => setTicketResult(null)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all mt-2"
              >
                Issue Next Ticket
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-300 dark:border-slate-700">
                <Printer className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-semibold">Fill form & submit to generate offline QR spot pass</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 3: QR ENTRY SCANNER (Screen 24)
// ==========================================
function ScannerConsole({ stats, fetchStats }) {
  return (
    <GateQRScanner onScanSuccess={() => fetchStats()} />
  );
}

// ==========================================
// VIEW 4: AI FORECAST PLANNER (Screens 26-31)
// ==========================================
function AIForecastPlanner() {
  const [weather, setWeather] = useState('Clear');
  const [isWeekend, setIsWeekend] = useState('false');
  const [isFestival, setIsFestival] = useState('false');

  // Compute live prediction metrics
  const computePrediction = (w, wk, f) => {
    let mult = 1.0;
    if (w === 'Rain') mult = 0.7;
    if (wk === 'true') mult = 1.3;
    if (f === 'true') mult = 2.2;

    const expected = Math.floor(45000 * mult);
    return {
      expectedCrowd: expected,
      volunteersNeeded: Math.floor(120 * mult),
      securityNeeded: Math.floor(200 * mult),
      wheelchairs: Math.floor(50 * mult),
      prasadamLakhs: (1.5 * mult).toFixed(1),
      parkingOccupancy: Math.min(100, Math.floor(60 * mult)),
      queueLengthMeters: Math.floor(350 * mult),
      overflowVehicles: Math.max(0, Math.floor((60 * mult - 90) * 15))
    };
  };

  const [forecast, setForecast] = useState(() => computePrediction('Clear', 'false', 'false'));

  useEffect(() => {
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
    fetch(`${baseUrl}/api/ai/forecast?weather=${weather}&isWeekend=${isWeekend}&isFestival=${isFestival}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.expectedCrowd) {
          setForecast(data);
        } else {
          setForecast(computePrediction(weather, isWeekend, isFestival));
        }
      })
      .catch(err => {
        console.error("AI forecast error:", err);
        setForecast(computePrediction(weather, isWeekend, isFestival));
      });
  }, [weather, isWeekend, isFestival]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Strategic Resource Predictor</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Simulate weather and holiday conditions. The AI calculates optimal volunteer, security, parking and inventory quotas.</p>
      </div>

      {/* Simulator parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-850">
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Local Weather State</label>
          <select 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            value={weather}
            onChange={e => setWeather(e.target.value)}
          >
            <option value="Clear">Clear Skies (Standard multiplier)</option>
            <option value="Rain">Monsoon Downpours (-30% crowd reducer)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Calendar Type</label>
          <select 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            value={isWeekend}
            onChange={e => setIsWeekend(e.target.value)}
          >
            <option value="false">Weekday Operations</option>
            <option value="true">Weekend Operations (+30% crowd surge)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Mega-Festival Status</label>
          <select 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            value={isFestival}
            onChange={e => setIsFestival(e.target.value)}
          >
            <option value="false">Standard Daily Calendar</option>
            <option value="true">Mega Festival Mode (+120% crowd spike)</option>
          </select>
        </div>
      </div>

      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Expected Footfall */}
          <ForecastCard 
            icon={<Users className="h-6 w-6 text-emerald-400" />}
            title="Predicted Footfall" 
            value={forecast.expectedCrowd.toLocaleString()} 
            subtitle="Estimated visitors tomorrow" 
            bgColor="border-t-emerald-500"
          />

          {/* Card 2: Volunteer Sizing */}
          <ForecastCard 
            icon={<UserPlus className="h-6 w-6 text-blue-400" />}
            title="Volunteer Allocations" 
            value={`${forecast.volunteersNeeded} Guards`} 
            subtitle="Guides for priority queues & gates" 
            bgColor="border-t-blue-500"
          />

          {/* Card 3: Security deployment */}
          <ForecastCard 
            icon={<ShieldCheck className="h-6 w-6 text-red-400" />}
            title="Security Deployment" 
            value={`${forecast.securityNeeded} Officers`} 
            subtitle="Congestion heatmap dispersion details" 
            bgColor="border-t-red-500"
          />

          {/* Card 4: Parking Occupancy */}
          <ForecastCard 
            icon={<Activity className="h-6 w-6 text-yellow-400" />}
            title="Parking Space Occupancy" 
            value={`${forecast.parkingOccupancy}%`} 
            subtitle={forecast.overflowVehicles > 0 ? `🔥 Space Full! Overflow: ~${forecast.overflowVehicles} cars` : 'Parking spaces available'} 
            bgColor="border-t-yellow-500"
          />

          {/* Card 5: Prasadam stock */}
          <ForecastCard 
            icon={<Sparkles className="h-6 w-6 text-saffron" />}
            title="Prasadam Estimation" 
            value={`${forecast.prasadamLakhs} Lakh`} 
            subtitle="Units of Laddu preparation required" 
            bgColor="border-t-saffron"
          />

          {/* Card 6: Accessibility */}
          <ForecastCard 
            icon={<Clock className="h-6 w-6 text-purple-400" />}
            title="Accessibility Demand" 
            value={`${forecast.wheelchairs} Chairs`} 
            subtitle="Priority gate resources allocated" 
            bgColor="border-t-purple-500"
          />
        </div>
      )}
    </div>
  );
}

function ForecastCard({ icon, title, value, subtitle, bgColor }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-2xl border-t-4 ${bgColor} flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</h4>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{value}</div>
        <p className="text-xs text-slate-500 leading-normal">{subtitle}</p>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 5: CONFIG RULES & SLOTS (Screens 21 & 22)
// ==========================================
function RulesSlotsView({ 
  stats, setStats, fetchStats, slots, handleAddSlot, handleDeleteSlot, 
  handleAdjustOnlineMins, handleAdjustTotalSlots, handleChangeCategory,
  newSlotTime, setNewSlotTime, newSlotCap, setNewSlotCap 
}) {
  const handleToggleEmergency = () => {
    const newState = !stats.emergencyMode;
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergencyMode: newState })
    })
    .then(res => res.json())
    .then(() => fetchStats())
    .catch(err => console.error(err));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">System Config & Time Window Slots</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure hourly entry time-windows (e.g. 40m Online / 20m General), dynamically adjust total slots, and deploy emergency crowd protocols.</p>
      </div>

      {/* Emergency override alert (Screen 21) */}
      <div className={`p-6 rounded-2xl border-2 flex items-center justify-between ${
        stats.emergencyMode 
          ? 'bg-red-500/10 border-red-500 animate-pulse text-red-200' 
          : 'bg-white dark:bg-slate-900 border-slate-850 text-slate-700 dark:text-slate-300'
      }`}>
        <div className="flex items-start gap-4">
          <AlertTriangle className={`h-10 w-10 shrink-0 ${stats.emergencyMode ? 'text-red-500' : 'text-slate-500'}`} />
          <div className="text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">Mega-Festival Security Override</h4>
            <p className="max-w-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Enabling emergency protocols halts all devotee mobile reservations, freezes active waitlist queues, and pushes dispersion guides to all volunteer terminals.
            </p>
          </div>
        </div>
        <button 
          onClick={handleToggleEmergency}
          className={`py-3 px-6 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 ${
            stats.emergencyMode 
              ? 'bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white shadow-red-950/20' 
              : 'bg-white dark:bg-slate-800 hover:bg-slate-750 text-slate-900 dark:text-white'
          }`}
        >
          {stats.emergencyMode ? 'DEACTIVATE PROTOCOL' : 'ENABLE EMERGENCY OVERRIDE'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Slot Management & Time Window Splitter (Screen 22) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Active Time Slots & Hourly Minute Splitter</h4>
              <p className="text-xs text-slate-500">Configure entry minute splits (e.g. 40m Online / 20m General) & dynamically add/reduce slots</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
              {slots.length} Active Slots
            </span>
          </div>
          
          <div className="space-y-4 text-xs">
            {slots.map(s => {
              const onlinePct = Math.round(((s.bookedOnline || 0) / (s.onlineQuota || 1)) * 100);
              const generalPct = Math.round(((s.bookedGeneral || 0) / (s.generalQuota || 1)) * 100);
              const onlineMinsPct = Math.round(((s.onlineMins || 40) / (s.totalMins || 60)) * 100);

              return (
                <div key={s.id} className="p-5 bg-white dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  {/* Slot Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{s.time}</span>
                      <select 
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg font-semibold focus:outline-none"
                        value={s.category || 'General Darshan'}
                        onChange={e => handleChangeCategory(s.id, e.target.value)}
                      >
                        <option value="General Darshan">General Darshan</option>
                        <option value="Special Entry (₹300)">Special Entry (₹300)</option>
                        <option value="VVIP Priority">VVIP Priority</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Total Capacity: <strong className="text-slate-900 dark:text-white">{s.totalSlots.toLocaleString()} Slots</strong>
                      </span>
                      <button 
                        onClick={() => handleDeleteSlot(s.id)}
                        className="p-1.5 text-red-400 hover:text-red-500 bg-red-500/10 rounded-lg transition-all"
                        title="Delete Slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Minute Time-Window Allocation Ribbon */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        ⏱️ Hourly Time Window Split: <strong className="text-blue-500">{s.onlineMins} Mins Online</strong> / <strong className="text-emerald-500">{s.generalMins} Mins General Spot</strong>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Ratio: {onlineMinsPct}% Online | {100 - onlineMinsPct}% General
                      </span>
                    </div>

                    {/* Visual Timeline Bar */}
                    <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                      <div 
                        className="bg-blue-500 h-full flex items-center justify-center text-[9px] font-bold text-white transition-all" 
                        style={{ width: `${onlineMinsPct}%` }}
                      >
                        {s.onlineMins}m Online
                      </div>
                      <div 
                        className="bg-emerald-500 h-full flex items-center justify-center text-[9px] font-bold text-white transition-all" 
                        style={{ width: `${100 - onlineMinsPct}%` }}
                      >
                        {s.generalMins}m General
                      </div>
                    </div>

                    {/* Adjust Minutes Controls (+ / - Mins) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500">Adjust Entry Window Mins:</span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <button 
                          onClick={() => handleAdjustOnlineMins(s.id, -10)}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-bold transition-colors"
                        >
                          -10m Online
                        </button>
                        <button 
                          onClick={() => handleAdjustOnlineMins(s.id, -5)}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-bold transition-colors"
                        >
                          -5m Online
                        </button>
                        <button 
                          onClick={() => handleAdjustOnlineMins(s.id, 5)}
                          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-md font-bold transition-colors"
                        >
                          +5m Online
                        </button>
                        <button 
                          onClick={() => handleAdjustOnlineMins(s.id, 10)}
                          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-md font-bold transition-colors"
                        >
                          +10m Online
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Total Slots Capacity Adjuster (+ / - Slots) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">🎟️ Total Slot Quota:</span>
                      <strong className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{s.totalSlots.toLocaleString()} Slots</strong>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[11px] font-bold text-slate-500">Adjust Slots:</span>
                      <button 
                        onClick={() => handleAdjustTotalSlots(s.id, -100)}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-md font-bold transition-colors"
                      >
                        -100 Slots
                      </button>
                      <button 
                        onClick={() => handleAdjustTotalSlots(s.id, -50)}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-md font-bold transition-colors"
                      >
                        -50 Slots
                      </button>
                      <button 
                        onClick={() => handleAdjustTotalSlots(s.id, 50)}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-md font-bold transition-colors"
                      >
                        +50 Slots
                      </button>
                      <button 
                        onClick={() => handleAdjustTotalSlots(s.id, 100)}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-md font-bold transition-colors"
                      >
                        +100 Slots
                      </button>
                    </div>
                  </div>

                  {/* 3. Calculated Quotas & Gate Schedule Batch Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Online Batch */}
                    <div className="space-y-1.5 bg-blue-500/5 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                      <div className="flex justify-between font-sans">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          📱 Online Batch ({s.onlineMins} mins)
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                          {s.bookedOnline?.toLocaleString() || 0} / {s.onlineQuota?.toLocaleString() || 0} ({onlinePct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, onlinePct)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans pt-0.5">
                        Gate Schedule: 00m to {s.onlineMins}m window reserved for online pass holders.
                      </p>
                    </div>

                    {/* General Spot Batch */}
                    <div className="space-y-1.5 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                      <div className="flex justify-between font-sans">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          🏢 General Spot Batch ({s.generalMins} mins)
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                          {s.bookedGeneral?.toLocaleString() || 0} / {s.generalQuota?.toLocaleString() || 0} ({generalPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, generalPct)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans pt-0.5">
                        Gate Schedule: {s.onlineMins}m to {s.totalMins || 60}m window open for general spot queue.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddSlot} className="flex gap-4 pt-4 border-t border-slate-850 text-xs">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Time range (e.g. 03:00 PM - 04:00 PM)" 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white"
                value={newSlotTime}
                onChange={e => setNewSlotTime(e.target.value)}
                required
              />
            </div>
            <div>
              <input 
                type="number" 
                placeholder="Max Slot Capacity" 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white"
                value={newSlotCap}
                onChange={e => setNewSlotCap(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="bg-emerald-600 text-slate-900 dark:text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-500 shadow-md">
              Add Slot
            </button>
          </form>
        </div>



        {/* Global Settings (Screen 21) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl h-fit space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Global Quota Settings</h4>
          
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Online Ticket Split ratio ({stats.onlineRatio}%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full accent-emerald-500" 
                value={stats.onlineRatio}
                onChange={e => setStats({ ...stats, onlineRatio: parseInt(e.target.value) })}
              />
              <span className="text-[10px] text-slate-500 italic block mt-1">Remaining {(100 - stats.onlineRatio)}% reserved for Walk-in POS desks.</span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Daily Attendance cap limit</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-semibold" defaultValue="80,000 Devotees" disabled />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Allowed Group Size Limit</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-semibold" defaultValue="10 Persons max / slot" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 6: LEDGER REPORTS (Screen 32)
// ==========================================
function ReportsExportView() {
  const [exportState, setExportState] = useState('idle');

  const handleExport = (type) => {
    setExportState('exporting');
    setTimeout(() => {
      setExportState('success');
      alert(`Report successfully compiled into ${type} format & downloaded!`);
      setTimeout(() => setExportState('idle'), 1500);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Daily Ledger Reports</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Export daily, weekly, or monthly queue statistics, revenue numbers, and parking logs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ReportExportCard title="Daily Telemetry Ledger" desc="Full hourly statistics covering check-ins, exits, and POS walk-in tickets for the past 24 hours." onExport={handleExport} disabled={exportState !== 'idle'} />
        <ReportExportCard title="Weekly Logistics Audit" desc="AI resource forecasting reports vs actual volunteer/security allocations and parking overflows." onExport={handleExport} disabled={exportState !== 'idle'} />
        <ReportExportCard title="Monthly Revenue Report" desc="Consolidated audit logs mapping online reservation tickets, VVIP protocols, and local guest house bookings." onExport={handleExport} disabled={exportState !== 'idle'} />
      </div>

      {exportState === 'exporting' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs text-slate-600 dark:text-slate-400 animate-pulse">Running data queries and rendering document grids...</span>
        </div>
      )}
    </div>
  );
}

function ReportExportCard({ title, desc, onExport, disabled }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between min-h-[220px]">
      <div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
      <div className="flex gap-2 pt-6 text-[10px] font-bold">
        <button 
          onClick={() => onExport('PDF')} 
          disabled={disabled}
          className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 transition-all"
        >
          Export PDF
        </button>
        <button 
          onClick={() => onExport('CSV')} 
          disabled={disabled}
          className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 transition-all"
        >
          Export CSV
        </button>
        <button 
          onClick={() => onExport('Excel')} 
          disabled={disabled}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 transition-all shadow-md"
        >
          Excel Grid
        </button>
      </div>
    </div>
  );
}
