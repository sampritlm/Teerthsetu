import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, ShieldCheck, QrCode, Sliders, AlertTriangle, LogOut, Sparkles, 
  Users, DollarSign, Clock, Settings, FileSpreadsheet, Plus, Trash2, 
  MapPin,  Printer, UserPlus, Bell, CheckCircle, Search, Calendar, X,
  Activity, ArrowUpRight, ArrowDownRight, Smartphone, Sun, Moon
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useTransparentImage } from '../hooks/useTransparentImage';
import TicketQR from '../components/TicketQR';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry, walkin, scanner, ai_forecast, rules_slots, reports
  const [stats, setStats] = useState({ activeVisitors: 12450, exitedVisitors: 32000, emergencyMode: false, onlineRatio: 70, todayRevenue: 120000, avgWaitMins: 22 });
  const [analytics, setAnalytics] = useState([]);
  
  // Custom slot state (Screen 22)
  const [slots, setSlots] = useState([
    { id: '1', time: '07:00 AM - 09:00 AM', capacity: 15000, booked: 12400 },
    { id: '2', time: '09:00 AM - 11:00 AM', capacity: 15000, booked: 14800 },
    { id: '3', time: '11:00 AM - 01:00 PM', capacity: 15000, booked: 15000 },
    { id: '4', time: '01:00 PM - 03:00 PM', capacity: 15000, booked: 8900 }
  ]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotCap, setNewSlotCap] = useState(15000);

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
    setSlots([...slots, {
      id: Date.now().toString(),
      time: newSlotTime,
      capacity: parseInt(newSlotCap),
      booked: 0
    }]);
    setNewSlotTime('');
  };

  const handleDeleteSlot = (id) => {
    setSlots(slots.filter(s => s.id !== id));
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
                  fetchStats={fetchStats} 
                  slots={slots} 
                  handleAddSlot={handleAddSlot} 
                  handleDeleteSlot={handleDeleteSlot}
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
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
            <DollarSign className="h-6 w-6 text-emerald-400" /> ₹ {stats.todayRevenue.toLocaleString()}
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
        {/* Hourly graph */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl h-96">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Today's Hourly Attendance Graph</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics}>
              <defs>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', color: '#F1F5F9' }} />
              <Area type="monotone" dataKey="visitors" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorVis)" />
            </AreaChart>
          </ResponsiveContainer>
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
  const [inputCode, setInputCode] = useState('');
  const [scanState, setScanState] = useState('idle'); // idle, scanning, success, error, warning
  const [scanMessage, setScanMessage] = useState('');
  const [scanLog, setScanLog] = useState([]);

  const handleScanCode = (codeToScan) => {
    let code = codeToScan || inputCode;
    if (!code.trim()) return;

    // Try parsing JSON payload if formatted from QR payload
    try {
      if (code.startsWith('{') && code.endsWith('}')) {
        const parsed = JSON.parse(code);
        if (parsed.bookingId) code = parsed.bookingId;
      }
    } catch (e) {
      // Use raw code string
    }

    setScanState('scanning');
    
    setTimeout(() => {
      fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code })
      })
      .then(res => res.json())
      .then(data => {
        const time = new Date().toLocaleTimeString();
        if (data.valid) {
          setScanState('success');
          setScanMessage(data.message);
          setScanLog([{ time, code, msg: data.message, valid: true }, ...scanLog]);
          fetchStats();
        } else {
          const isWarning = data.message.includes('ALREADY');
          setScanState(isWarning ? 'warning' : 'error');
          setScanMessage(data.message);
          setScanLog([{ time, code, msg: data.message, valid: false }, ...scanLog]);
        }
      })
      .catch(err => {
        setScanState('error');
        setScanMessage('GATE COMMUNICATION FAILURE');
        console.error(err);
      });
    }, 800);
  };

  const handleSimulateRandom = () => {
    // Random scan simulator
    const isGood = Math.random() > 0.3;
    const mockCode = isGood 
      ? `TS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`
      : Math.random() > 0.5 ? 'TS-EXPIRED' : 'TS-INVALID-CODE';
    
    setInputCode(mockCode);
    handleScanCode(mockCode);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">QR Gate Security Scanner</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Simulate physical scanner checkpoints at Temple Gates 1 to 4.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Camera interface simulation */}
        <div className={`border rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] relative transition-all ${
          scanState === 'idle' ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800' :
          scanState === 'scanning' ? 'bg-white dark:bg-slate-900 border-emerald-500/50 animate-pulse' :
          scanState === 'success' ? 'bg-emerald-950/20 border-emerald-500' :
          scanState === 'warning' ? 'bg-amber-950/20 border-amber-500' :
          'bg-red-950/20 border-red-500'
        }`}>
          {/* Simulation Overlay Box */}
          <div className="absolute top-4 left-4 text-[10px] bg-white dark:bg-slate-950 px-3 py-1 rounded-full text-slate-600 dark:text-slate-400 border border-slate-850 flex items-center gap-1.5">
            <Camera className="h-3 w-3" /> SECURITY GATE 1 SCANNER
          </div>

          <AnimatePresence mode="wait">
            {scanState === 'idle' && (
              <motion.div key="idle" className="text-center space-y-4">
                <QrCode className="h-24 w-24 mx-auto text-emerald-500/60 animate-pulse" />
                <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">Hold Ticket QR code up to checkpoint lens</span>
              </motion.div>
            )}

            {scanState === 'scanning' && (
              <motion.div key="scanning" className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs text-emerald-400 block font-semibold tracking-wider">Decoding bar index...</span>
              </motion.div>
            )}

            {scanState === 'success' && (
              <motion.div key="success" className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">✓</div>
                <h4 className="text-xl font-bold text-emerald-400">ENTRY GRANTED</h4>
                <p className="text-xs text-emerald-300 font-semibold">{scanMessage}</p>
                <button onClick={() => setScanState('idle')} className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all">Scan Next Pass</button>
              </motion.div>
            )}

            {scanState === 'warning' && (
              <motion.div key="warning" className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">⚠️</div>
                <h4 className="text-xl font-bold text-amber-400">DUPLICATE ATTEMPT</h4>
                <p className="text-xs text-amber-300 font-semibold">{scanMessage}</p>
                <button onClick={() => setScanState('idle')} className="text-xs bg-amber-600/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all">Clear Gate Alarm</button>
              </motion.div>
            )}

            {scanState === 'error' && (
              <motion.div key="error" className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">✕</div>
                <h4 className="text-xl font-bold text-red-500">ENTRY REJECTED</h4>
                <p className="text-xs text-red-300 font-semibold">{scanMessage}</p>
                <button onClick={() => setScanState('idle')} className="text-xs bg-red-600/20 text-red-500 border border-red-500/30 px-4 py-1.5 rounded-lg hover:bg-red-500/20 transition-all">Reset Scanner</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input box and Scan Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Manual Entry Override</h4>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Enter Booking ID (e.g. TS-...)" 
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
              />
              <button 
                onClick={() => handleScanCode()} 
                className="bg-emerald-600 text-slate-900 dark:text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-500"
              >
                Scan Code
              </button>
            </div>

            <button 
              onClick={handleSimulateRandom}
              className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold border border-slate-750 rounded-xl text-xs transition-all mb-6"
            >
              Simulate Scanning Random Visitor
            </button>

            <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-xs uppercase tracking-widest">Scanner Log Ledger</h5>
            <div className="space-y-2 font-mono text-[10px] max-h-40 overflow-y-auto pr-2">
              {scanLog.map((l, i) => (
                <div key={i} className={`p-2.5 rounded-lg flex justify-between items-center ${l.valid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  <span>{l.code} • {l.msg}</span>
                  <span className="text-[8px] text-slate-500">{l.time}</span>
                </div>
              ))}
              {scanLog.length === 0 && (
                <div className="text-slate-500 text-center py-6">Awaiting check-in actions...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 4: AI FORECAST PLANNER (Screens 26-31)
// ==========================================
function AIForecastPlanner() {
  const [weather, setWeather] = useState('Clear');
  const [isWeekend, setIsWeekend] = useState('false');
  const [isFestival, setIsFestival] = useState('false');
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetch(`/api/ai/forecast?weather=${weather}&isWeekend=${isWeekend}&isFestival=${isFestival}`)
      .then(res => res.json())
      .then(setForecast)
      .catch(err => console.error(err));
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
          {/* Card 1: Expected Footfall (Screen 26) */}
          <ForecastCard 
            icon={<Users className="h-6 w-6 text-slate-900 dark:text-white" />}
            title="Predicted Footfall" 
            value={forecast.expectedCrowd.toLocaleString()} 
            subtitle="Estimated visitors tomorrow" 
            bgColor="border-t-emerald-500"
          />

          {/* Card 2: Volunteer Sizing (Screen 27) */}
          <ForecastCard 
            icon={<HardHat className="h-6 w-6 text-blue-400" />}
            title="Volunteer Allocations" 
            value={`${forecast.volunteersNeeded} Guards`} 
            subtitle="Guides for priority queues & gates" 
            bgColor="border-t-blue-500"
          />

          {/* Card 3: Security deployment (Screen 28) */}
          <ForecastCard 
            icon={<ShieldCheck className="h-6 w-6 text-red-400" />}
            title="Security Deployment" 
            value={`${forecast.securityNeeded} Officers`} 
            subtitle="Congestion heatmap dispersion details" 
            bgColor="border-t-red-500"
          />

          {/* Card 4: Parking Occupancy (Screen 29) */}
          <ForecastCard 
            icon={<Car className="h-6 w-6 text-yellow-400" />}
            title="Parking Space Occupancy" 
            value={`${forecast.parkingOccupancy}%`} 
            subtitle={forecast.overflowVehicles > 0 ? `🔥 Space Full! Overflow: ~${forecast.overflowVehicles} cars` : 'Parking spaces available'} 
            bgColor="border-t-yellow-500"
          />

          {/* Card 5: Prasadam stock (Screen 30) */}
          <ForecastCard 
            icon={<Soup className="h-6 w-6 text-saffron" />}
            title="Prasadam Estimation" 
            value={`${forecast.prasadamLakhs} Lakh`} 
            subtitle="Units of Laddu preparation required" 
            bgColor="border-t-saffron"
          />

          {/* Card 6: Accessibility (Screen 31) */}
          <ForecastCard 
            icon={<Accessibility className="h-6 w-6 text-purple-400" />}
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
function RulesSlotsView({ stats, fetchStats, slots, handleAddSlot, handleDeleteSlot, newSlotTime, setNewSlotTime, newSlotCap, setNewSlotCap }) {
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
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">System Config & Slots</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure daily quotas, manage time slots, or deploy festival security protocols.</p>
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
        {/* Slot Management (Screen 22) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Active Time Slots Ledger</h4>
          
          <div className="space-y-2 text-xs">
            {slots.map(s => (
              <div key={s.id} className="p-3 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-850 flex justify-between items-center text-slate-700 dark:text-slate-300">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white">{s.time}</span>
                  <span className="block text-[10px] text-slate-500">Booked quota: {s.booked.toLocaleString()} / {s.capacity.toLocaleString()} ({Math.round(s.booked / s.capacity * 100)}%)</span>
                </div>
                <button 
                  onClick={() => handleDeleteSlot(s.id)}
                  className="p-2 text-red-400 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSlot} className="flex gap-4 pt-4 border-t border-slate-850 text-xs">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Time range (e.g. 03:00 PM - 05:00 PM)" 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white"
                value={newSlotTime}
                onChange={e => setNewSlotTime(e.target.value)}
                required
              />
            </div>
            <div>
              <input 
                type="number" 
                placeholder="Max Limit" 
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
