import React, { useState, useEffect, Component } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Users, QrCode, LogOut, Bell, Compass, Calendar,
  Search, ShieldAlert, HeartHandshake, Hotel, Map, User, CheckCircle,
  CreditCard, ChevronRight, X, Sparkles, Filter, Info, PhoneCall, Star, Phone, Activity, Sun, Moon, Plus, Minus,
  ShieldCheck, Fingerprint, Smartphone, Cloud, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import TicketQR from '../components/TicketQR';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import DevoteeTravelsView from '../components/DevoteeTravelsView';
import DevoteeNearbyView from '../components/DevoteeNearbyView';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-500/30 text-center space-y-4 my-8">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto font-bold text-xl">⚠️</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong loading this view</h3>
          <p className="text-xs text-slate-500">{this.state.error?.toString()}</p>
          <button 
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="bg-saffron text-slate-900 px-5 py-2 rounded-xl font-bold text-xs shadow-md"
          >
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DevoteeDashboard() {
  const [activeTab, setActiveTab] = useState('explore'); // explore, planner, hotels, bookings, profile, alerts
  const [temples, setTemples] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        let nameToUse = parsed.fullName || parsed.name || '';
        if (nameToUse === 'Devendra Kumar' && parsed.email) {
          nameToUse = parsed.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        if (!nameToUse && parsed.email) {
          nameToUse = parsed.email.split('@')[0];
        }
        return {
          name: nameToUse || 'Devotee',
          email: parsed.email || 'devotee@teerthsethu.in',
          phone: parsed.phoneNumber || parsed.phone || '+91 9876543210',
          address: parsed.address || 'Sector 4, Dwarka, New Delhi',
          aadhaar: parsed.aadhaar || '4820-1928-8812',
          emergencyContact: parsed.emergencyContact || 'Amit Kumar (+91 9876543211)',
          family: parsed.family || ['Sita Devi (Wife)', 'Karan Kumar (Son)'],
          savedTemples: parsed.savedTemples || ['1', '3'],
          accessibilityPreset: parsed.accessibilityPreset || { wheelchair: false, volunteer: false }
        };
      } catch (e) { }
    }
    return {
      name: 'User Name',
      email: 'user@teerthsethu.in',
      phone: '+91 9876543210',
      address: 'Sector 4, Dwarka, New Delhi',
      aadhaar: '4820-1928-8812',
      emergencyContact: 'Amit Kumar (+91 9876543211)',
      family: ['Sita Devi (Wife)', 'Karan Kumar (Son)'],
      savedTemples: ['1', '3'],
      accessibilityPreset: { wheelchair: false, volunteer: false }
    };
  });

  const navigate = useNavigate();

  // Load temples and notifications from APIs
  useEffect(() => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/temples')
      .then(res => res.json())
      .then(setTemples)
      .catch(err => console.error("Error fetching temples:", err));

    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => n.unread).length);
      })
      .catch(err => console.error("Error fetching notifications:", err));
  };

  const handleMarkNotificationsRead = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/notifications/read-all', { method: 'POST' })
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const { isDarkMode, toggleTheme } = useTheme();
  const finalLogo = isDarkMode ? "/logo_dark_mode.png" : "/logo_light_mode.png";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">

      {/* Devotee Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 z-20 shrink-0">
        <div className="mb-8 flex items-center justify-center w-full">
          <img
            src={finalLogo}
            alt="TeerthSetu Logo"
            className="h-16 w-auto object-contain"
            style={!isDarkMode ? { mixBlendMode: 'multiply' } : {}}
          />
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarButton active={activeTab === 'explore'} icon={<Compass className="h-5 w-5" />} text="Temple Booking" onClick={() => setActiveTab('explore')} />
          <SidebarButton active={activeTab === 'hotels'} icon={<Hotel className="h-5 w-5" />} text="Accommodation" onClick={() => setActiveTab('hotels')} />
          <SidebarButton active={activeTab === 'travels'} icon={<Activity className="h-5 w-5" />} text="Travels" onClick={() => setActiveTab('travels')} />
          <SidebarButton active={activeTab === 'planner'} icon={<Map className="h-5 w-5" />} text="AI Journey Planner" onClick={() => setActiveTab('planner')} />
          <SidebarButton active={activeTab === 'nearby'} icon={<MapPin className="h-5 w-5" />} text="Nearby Suggestions" onClick={() => setActiveTab('nearby')} />
          <SidebarButton active={activeTab === 'bookings'} icon={<QrCode className="h-5 w-5" />} text="My Tickets" onClick={() => setActiveTab('bookings')} />
          <SidebarButton active={activeTab === 'profile'} icon={<User className="h-5 w-5" />} text="My Profile" onClick={() => setActiveTab('profile')} />

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'alerts' ? 'bg-saffron text-slate-900 dark:text-white shadow-lg shadow-saffron/20 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-slate-900 dark:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <span>Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-slate-900 dark:text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4 mt-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-2 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition-colors text-left"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-saffron/10 border border-saffron/40 flex items-center justify-center font-bold text-saffron">
              {(user?.name || 'Devotee').split(' ').filter(Boolean).map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-red-400 p-3 rounded-xl hover:bg-red-500/5 transition-all text-sm font-medium">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative flex flex-col">
        {/* Glow backdrop */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-saffron/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Active tab renderer */}
        <div className="flex-1 z-10 max-w-6xl mx-auto w-full">
          <ErrorBoundary>
            {activeTab === 'explore' && <ExploreView temples={temples} setActiveTab={setActiveTab} user={user} />}
            {activeTab === 'analysis' && <AnalysisView temples={temples} user={user} setActiveTab={setActiveTab} />}
            {activeTab === 'planner' && <PlannerView temples={temples} onClose={() => setActiveTab('explore')} />}
            {activeTab === 'hotels' && <HotelsView />}
            {activeTab === 'travels' && <DevoteeTravelsView />}
            {activeTab === 'nearby' && <DevoteeNearbyView />}
            {activeTab === 'bookings' && <BookingsView />}
            {activeTab === 'profile' && <ProfileView user={user} setUser={setUser} />}
            {activeTab === 'alerts' && <AlertsView notifications={notifications} markRead={handleMarkNotificationsRead} />}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${active ? 'bg-saffron text-slate-900 dark:text-white shadow-lg shadow-saffron/20 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-slate-900 dark:text-white'}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

// ==========================================

// ==========================================
// VIEW 1.5: TEMPLE ANALYSIS / QUICK REVIEW
// ==========================================
function AnalysisView({ temples, user, setActiveTab }) {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const filteredSidebarTemples = temples.filter(t => 
    t.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
    t.location.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const [selectedId, setSelectedId] = useState(temples[0]?._id);
  const [bookingTemple, setBookingTemple] = useState(null);
  const temple = temples.find(t => t._id === selectedId) || temples[0];
  
  const currentHour = new Date().getHours();
  const generateData = () => {
    const data = [];
    const baseWait = temple?.waitTime || 45;
    for (let h = 6; h <= 21; h++) {
      let multiplier = 0.3;
      if (h >= 9 && h <= 12) multiplier = 0.8 + (h === 11 ? 0.6 : 0);
      if (h >= 17 && h <= 19) multiplier = 0.7 + (h === 18 ? 0.4 : 0);
      if (h === 14 || h === 15) multiplier = 0.5;
      const noise = ((temple?._id?.charCodeAt(0) || 0) + h) % 3 === 0 ? 0.1 : -0.1;
      data.push({
        hour: h,
        time: h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM'),
        wait: Math.max(5, Math.floor(baseWait * (multiplier + noise))),
        isCurrent: h === currentHour
      });
    }
    return data;
  };
  const hourlyPredictionData = generateData();

  if (!temple) return null;

  return (
    <div className="h-[85vh] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-saffron/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 relative z-10">
            <Activity className="h-6 w-6 text-saffron" /> Insights
          </h2>
          <p className="text-sm text-slate-500 mt-1 relative z-10 mb-4">AI crowd analysis & details</p>
          <div className="relative z-10">
            <input 
              type="text" 
              placeholder="Search temples..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {filteredSidebarTemples.map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${selectedId === t._id ? 'bg-saffron/10 border-saffron border shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
            >
              <img src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=100&q=80"} alt={t.name} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className={`text-sm font-bold truncate ${selectedId === t._id ? 'text-saffron' : 'text-slate-900 dark:text-white'}`}>{t.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" /> {t.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row relative">
        <button onClick={() => setActiveTab('explore')} className="absolute top-4 right-4 bg-white dark:bg-slate-950/60 p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-900 shadow-xl transition-all z-[60]">
          <X className="h-5 w-5" />
        </button>
        {/* Left Side: Image, General Info */}
        <div className="w-full lg:w-2/5 bg-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-800 lg:border-slate-850">
          <div className="h-64 lg:h-full relative">
            <img
              src={temple.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
              alt={temple.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-saffron font-bold text-xs uppercase tracking-widest block mb-1">DEITY TEMPLE DETAILS</span>
              <h3 className="text-3xl font-bold mb-2 leading-tight">{temple.name}</h3>
              <p className="text-slate-300 text-sm flex items-center gap-1"><MapPin className="h-4.5 w-4.5 text-saffron shrink-0" /> {temple.location}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Data */}
        <div className="w-full lg:w-3/5 p-6 lg:p-8 overflow-y-auto flex flex-col justify-between bg-white dark:bg-slate-900">
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Temple History & Rules</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">{temple.history}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Darshan Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Dress Code</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1 text-xs">Entries Today</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{(temple?.waitTime * 314 + 8540).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* AI Crowd Predictions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold animate-pulse" /> AI Crowd Prediction
                </h4>
                <span className="text-sm text-slate-600 dark:text-slate-400">Current Wait: <strong className="text-gold text-lg">{temple.waitTime}m</strong></span>
              </div>

              {/* Recharts Hourly Wait Times Forecast */}
              <div className="h-56 w-full bg-slate-50 dark:bg-slate-950/60 pt-6 pb-2 pr-2 pl-0 rounded-3xl border border-slate-200 dark:border-slate-800 mb-4 relative overflow-hidden group shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPredictionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-color, #334155)" strokeOpacity={0.4} className="dark:[--grid-color:#334155] [--grid-color:#E2E8F0]" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#94A3B8', dy: 10}}
                      minTickGap={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 10, dx: -5}} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255, 107, 53, 0.1)'}} 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '12px', fontSize: 13, color: '#fff', border: '1px solid rgba(255,107,53,0.3)', boxShadow: '0 10px 25px -5px rgba(255, 107, 53, 0.2)' }} 
                      itemStyle={{ color: '#F8FAFC' }}
                      formatter={(value) => [`${value} mins`, 'Est. Wait Time']}
                      labelStyle={{color: '#E2E8F0', marginBottom: '4px', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="wait" radius={[6, 6, 0, 0]} maxBarSize={30} animationDuration={1500}>
                      {hourlyPredictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#FF6B35' : 'var(--bar-color)'} className="dark:[--bar-color:#9A3412] [--bar-color:#FDBA74] transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 italic text-center">
                🔥 Best hours to visit: <strong className="text-emerald-500 dark:text-emerald-400">6:00 AM - 9:00 AM</strong>. Expect heavy peaks at noon due to afternoon Aarti.
              </p>
            </div>

            {/* Facilities list */}
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Available Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {temple.facilities?.map(f => (
                  <span key={f} className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full shadow-sm">{f}</span>
                )) || 'None'}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setBookingTemple({...temple, isViewOnly: false})}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                Book Darshan Pass <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {bookingTemple && (
        <TempleDetailsModal
          temple={bookingTemple}
          user={user}
          onClose={() => setBookingTemple(null)}
        />
      )}
    </div>
  );
}

// VIEW 1: HOME & TEMPLE DISCOVERY (Screens 5 & 6)
// ==========================================
function ExploreView({ temples, setActiveTab, user, templesLimit = 3 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stateFilter, setStateFilter] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => console.log('Geolocation error:', err)
      );
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // States
  const states = [
    'All', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Jammu & Kashmir', 'Delhi'
  ];

  const filteredTemples = temples.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'All' || t.location.includes(stateFilter);
    const matchesCrowd = crowdFilter === 'All' || t.crowdLevel === crowdFilter;
    
    let matchesQuick = true;
    if (quickFilter === 'Popular') matchesQuick = (t.rating >= 4.8) || (t.waitTime >= 30);
    else if (quickFilter === 'Low Crowd') matchesQuick = t.crowdLevel === 'Low';
    else if (quickFilter === 'Senior Friendly' || quickFilter === 'Wheelchair Accessible') matchesQuick = t.facilities ? t.facilities.some(f => f.toLowerCase().includes('wheelchair') || f.toLowerCase().includes('senior')) : true;
    else if (quickFilter === 'Festival Today') matchesQuick = t.name.includes('Tirupati') || t.name.includes('Kashi');

    return matchesSearch && matchesState && matchesCrowd && matchesQuick;
  });

  return (
    <div className="space-y-8">
      {/* Temple Discovery search/filter bar (Screen 6) */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-2">
          <div>
            <h3 className="text-3xl text-saffron drop-shadow-md flex items-center gap-2" style={{ fontFamily: "'Yatra One', cursive", letterSpacing: "1px" }}>
              Swagatam <span className="text-3xl drop-shadow-[0_0_12px_rgba(251,146,60,0.5)] animate-pulse">🪷</span>
            </h3>
            <p className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 italic" style={{ fontFamily: "'Cinzel', serif" }}>Where hearts meet the Divine.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-850">
            <div>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all appearance-none"
                value={stateFilter}
                onChange={e => {
                  setStateFilter(e.target.value);
                  setSearchTerm('');
                }}
              >
                <option value="All">Select State</option>
                {states.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="relative col-span-2 flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder={stateFilter !== 'All' ? `Search for a temple in ${stateFilter}...` : "Search for any temple..."}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-saffron transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && searchTerm.length > 0 && filteredTemples.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden text-left">
                    {filteredTemples.map(t => (
                      <div 
                        key={t._id} 
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm(t.name);
                          setShowSuggestions(false);
                        }}
                      >
                        <img src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=100&q=80"} alt={t.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="bg-saffron text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-sm whitespace-nowrap">
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 px-2 mt-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              Filters
            </span>
            {['Popular', 'Low Crowd', 'Senior Friendly', 'Wheelchair Accessible', 'Festival Today'].map(filter => (
              <button
                key={filter}
                onClick={() => setQuickFilter(quickFilter === filter ? '' : filter)}
                className={`px-4 py-2 border rounded-full text-xs font-bold transition-all ${
                  quickFilter === filter 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/40 scale-105' 
                    : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
            {quickFilter && (
              <button
                onClick={() => setQuickFilter('')}
                className="text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Greeting (Screen 5) */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Namaste,{" "}{user.name && user.name.trim() !== '' ? user.name.trim() : 'Devotee'}! <span className="animate-wiggle">🙏</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Ready for your spiritual journey? Plan slots and track crowding live.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('analysis')} className="bg-saffron/15 text-saffron border border-saffron/30 hover:bg-saffron/20 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
            <Activity className="h-4 w-4" /> Quick Review
          </button>
          <button onClick={() => setActiveTab('planner')} className="bg-gold/15 text-gold border border-gold/30 hover:bg-gold/20 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
            <Map className="h-4 w-4" /> Plan Multi-Route
          </button>
        </div>
      </div>

      {/* Mini Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Temples */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-saffron/10 text-saffron rounded-lg flex-shrink-0"><Compass className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Total Temples</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">10,000+</p>
          </div>
        </div>
        
        {/* Card 2: Active Bookings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg flex-shrink-0"><QrCode className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Active Bookings</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">2 Upcoming</p>
          </div>
        </div>

        {/* Card 3: Saved Waiting Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg flex-shrink-0"><Clock className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Saved Time</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">1.5 Hrs/Slot</p>
          </div>
        </div>

        {/* Card 4: Nearby Temples */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg flex-shrink-0"><MapPin className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Nearby</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">14 <span className="text-[9px] font-medium text-slate-500 ml-0.5">&lt;50km</span></p>
          </div>
        </div>

        {/* Card 5: Today's Crowd Index */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg flex-shrink-0"><Users className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h4 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate">Crowd Index</h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">High Surge</p>
          </div>
        </div>
      </div>


      <div className="space-y-6 mt-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 px-2">Famous Temples</h2>
        {/* Temple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map(t => (
            <motion.div
              key={t._id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-saffron/30 transition-all flex flex-col group"
            >
              {/* Image Header */}
              <div className="h-52 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img
                  src={t.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
                  alt={t.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.rating || '4.8'}
                    </span>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-sm backdrop-blur-md flex items-center gap-1.5 ${t.crowdLevel === 'High' ? 'bg-red-500/90 text-white' :
                      t.crowdLevel === 'Moderate' ? 'bg-amber-500/90 text-white' :
                        'bg-emerald-500/90 text-white'
                    }`}>
                    <Users className="h-3.5 w-3.5" />
                    {t.crowdLevel} Crowd
                  </span>
                </div>
                
                {/* Image Footer Details */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-xl font-bold text-white mb-1 drop-shadow-md leading-tight line-clamp-1">{t.name}</h4>
                  <p className="text-slate-200 text-sm flex items-center gap-1.5 drop-shadow-md">
                    <MapPin className="h-4 w-4 text-saffron shrink-0" /> {t.location}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1 mb-1">
                        <Clock className="h-3.5 w-3.5" /> Waiting Time
                      </span>
                      <span className="text-gold font-bold text-lg">{t.waitTime} <span className="text-sm font-medium text-slate-600 dark:text-slate-400">mins</span></span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-end gap-1 mb-1">
                        <Calendar className="h-3.5 w-3.5" /> Timings
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm leading-tight">{t.timings}</span>
                    </div>
                  </div>

                  {userLocation && t.lat && t.lon ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 mb-5 flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Map className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Distance from you</p>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300 truncate">{calculateDistance(userLocation.lat, userLocation.lon, t.lat, t.lon)} km</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 mb-5 h-[58px]">
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <Info className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{t.history}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-auto pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTemple({...t, isViewOnly: true}); }}
                    className="flex-1 py-2.5 bg-saffron/10 hover:bg-saffron/20 text-saffron font-bold text-sm rounded-xl transition-all border border-saffron/20"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setSelectedTemple({...t, isViewOnly: false})}
                    className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredTemples.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No shrines match the search criteria. Try adjusting the state or crowd level filters.
            </div>
          )}
        </div>
      </div>

      {/* Temple Details Drawer/Modal (Screen 7, 8, 9, 10, 11, 13, 14) */}
      <AnimatePresence>
        {selectedTemple && (
          <TempleDetailsModal
            temple={selectedTemple}
            user={user}
            onClose={() => setSelectedTemple(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================
// MODAL: TEMPLE DETAILS, AI CROWD, DARSHAN BOOKING & QR TICKET
// =============================================================
function TempleDetailsModal({ temple, user, onClose }) {
  const [step, setStep] = useState('details'); // details, booking, aadhaar, payment, ticket
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarRefId, setAadhaarRefId] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, loading, sent, verifying, success
  const [formData, setFormData] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlot: '09:00 AM (Available)',
    visitors: 2,
    specialDarshan: 'General',
    wheelchair: false,
    volunteer: false,
    medical: false
  });
  const [bookedData, setBookedData] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('upi');
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [liveWeatherAlert, setLiveWeatherAlert] = useState(null);

  useEffect(() => {
    if (temple.lat && temple.lon) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${temple.lat}&longitude=${temple.lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          if (data.current_weather) {
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            
            let condition = 'Clear Sky';
            let alertMsg = null;
            
            if (code === 0) condition = 'Clear Sky';
            else if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
            else if (code === 45 || code === 48) condition = 'Foggy';
            else if (code >= 51 && code <= 55) condition = 'Drizzle';
            else if (code >= 61 && code <= 65) condition = 'Rain';
            else if (code >= 71 && code <= 77) condition = 'Snow';
            else if (code >= 80 && code <= 82) { condition = 'Heavy Rain'; alertMsg = 'Red Alert: Heavy rain showers expected.'; }
            else if (code >= 95) { condition = 'Thunderstorm'; alertMsg = 'Severe Alert: Thunderstorms in area. Stay indoors.'; }
            
            setLiveWeather(`${temp}°C, ${condition}`);
            setLiveWeatherAlert(alertMsg);
          }
        })
        .catch(err => console.error('Weather fetch error:', err));
    }
  }, [temple]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => console.log('Geolocation error:', err)
      );
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const currentHour = new Date().getHours();
  // Simulated AI Hourly Crowd Forecast Data (Screen 8)
  const hourlyPredictionData = [
    { time: '6 AM', hour: 6, wait: 20, limit: 2000, crowd: 'Low' },
    { time: '8 AM', hour: 8, wait: temple.waitTime * 0.8, limit: 3000, crowd: 'Moderate' },
    { time: '10 AM', hour: 10, wait: temple.waitTime, limit: 4500, crowd: 'High' },
    { time: '12 PM', hour: 12, wait: temple.waitTime * 1.5, limit: 5000, crowd: 'Peak' },
    { time: '2 PM', hour: 14, wait: temple.waitTime * 0.9, limit: 4000, crowd: 'High' },
    { time: '4 PM', hour: 16, wait: temple.waitTime * 0.7, limit: 3500, crowd: 'Moderate' },
    { time: '6 PM', hour: 18, wait: temple.waitTime * 1.1, limit: 4500, crowd: 'High' },
    { time: '8 PM', hour: 20, wait: 25, limit: 2500, crowd: 'Low' }
  ].map(d => ({ ...d, isCurrent: Math.abs(currentHour - d.hour) <= 1 }));

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSendOTP = async () => {
    if (aadhaarNumber.length < 14) return; // Including dashes
    setVerificationStatus('loading');
    
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
      const res = await fetch(baseUrl + '/api/auth/aadhaar-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aadhaar: aadhaarNumber.replace(/\D/g, ''),
          phone: user?.phone
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setAadhaarRefId(data.ref_id);
        setVerificationStatus('sent');
      } else {
        alert(data.message || 'Failed to send OTP');
        setVerificationStatus('idle');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to verification service');
      setVerificationStatus('idle');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !aadhaarRefId) return;
    setVerificationStatus('verifying');
    
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
      const res = await fetch(baseUrl + '/api/auth/aadhaar-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_id: aadhaarRefId, otp })
      });
      const data = await res.json();
      
      if (data.success) {
        setVerificationStatus('success');
        setTimeout(() => {
          setStep('payment');
        }, 800);
      } else {
        alert(data.message || 'Invalid OTP');
        setVerificationStatus('sent');
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying OTP');
      setVerificationStatus('sent');
    }
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      // Create Booking API call
      fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templeId: temple._id,
          ...formData
        })
      })
        .then(res => res.json())
        .then(data => {
          setIsPaying(false);
          if (data.success) {
            setBookedData(data);
            setStep('ticket');
          } else {
            alert('Booking failed. Please try again.');
          }
        })
        .catch(err => {
          setIsPaying(false);
          console.error(err);
        });
    }, 1500); // Simulated payment gateway delay
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-white dark:bg-slate-950/60 p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-900 transition-all z-20">
          <X className="h-5 w-5" />
        </button>

        {/* Modal Left Side: Image, General Info */}
        <div className="w-full md:w-2/5 bg-white dark:bg-slate-950 relative border-r border-slate-850">
          <div className="h-48 md:h-full relative">
            <img
              src={temple.image || "https://images.unsplash.com/photo-1600100397608-f010e42edb7a?auto=format&fit=crop&w=600&q=80"}
              alt={temple.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-slate-900 dark:text-white">
              <span className="text-saffron font-bold text-xs uppercase tracking-widest block mb-1">DEITY TEMPLE DETAILS</span>
              <h3 className="text-2xl font-bold mb-2">{temple.name}</h3>
              <p className="text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1"><MapPin className="h-4.5 w-4.5 text-saffron shrink-0" /> {temple.location}</p>
            </div>
          </div>
        </div>

        {/* Modal Right Side: Dynamic Content Steps */}
        <div className="w-full md:w-3/5 p-8 max-h-[85vh] overflow-y-auto flex flex-col justify-between bg-white dark:bg-slate-900">

          {/* STEP 1: TEMPLE DETAILS & CROWD PREDICTION (Screen 7 & 8) */}
          {step === 'details' && (
            <div className="space-y-4 flex flex-col h-full">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Temple Details & Rules</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-tight mb-4">{temple.history}</p>
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                    <span className="text-slate-500 block mb-1">Darshan Hours / Rules</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.timings}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                    <span className="text-slate-500 block mb-1">Dress Code</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.dressCode}</span>
                  </div>
                  {temple.isViewOnly && (
                    <>
                      <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                        <span className="text-slate-500 block mb-1">Parking Details</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{temple.parking || 'Available Nearby'}</span>
                      </div>
                      <div className={`p-3 rounded-xl border flex flex-col justify-center ${(liveWeatherAlert || temple.weatherAlert) ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'}`}>
                        <span className={`block mb-1 flex items-center justify-between ${(liveWeatherAlert || temple.weatherAlert) ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1"><Cloud className="h-3 w-3" /> Weather Conditions</span>
                          {(liveWeatherAlert || temple.weatherAlert) && <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-600 dark:text-red-400" />}
                        </span>
                        <span className={`font-semibold ${(liveWeatherAlert || temple.weatherAlert) ? 'text-red-800 dark:text-red-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {liveWeather || temple.weather || '28°C, Clear Sky'}
                        </span>
                        {(liveWeatherAlert || temple.weatherAlert) && (
                          <p className="text-[10px] leading-tight text-red-700 dark:text-red-400 mt-1.5 font-medium">{liveWeatherAlert || temple.weatherAlert}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!temple.isViewOnly && (
                <>
                  {/* AI Crowd Predictions (Screen 8) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-gold animate-pulse" /> AI Crowd Prediction
                      </h4>
                      <span className="text-xs text-slate-600 dark:text-slate-400">Current Wait: <strong className="text-gold">{temple.waitTime}m</strong></span>
                    </div>

                    {/* Recharts Hourly Wait Times Forecast */}
                    <div className="h-40 w-full bg-slate-50 dark:bg-slate-950/60 pt-4 pb-2 pr-2 pl-0 rounded-2xl border border-slate-200 dark:border-slate-800 mb-2 relative overflow-hidden group shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyPredictionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-color, #334155)" strokeOpacity={0.4} className="dark:[--grid-color:#334155] [--grid-color:#E2E8F0]" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#94A3B8" 
                            fontSize={11} 
                            axisLine={false} 
                            tickLine={false}
                            tick={{fill: '#94A3B8', dy: 10}}
                            minTickGap={15}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94A3B8', fontSize: 10, dx: -5}} 
                          />
                          <Tooltip 
                            cursor={{fill: 'rgba(255, 107, 53, 0.1)'}} 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '12px', fontSize: 13, color: '#fff', border: '1px solid rgba(255,107,53,0.3)', boxShadow: '0 10px 25px -5px rgba(255, 107, 53, 0.2)' }} 
                            itemStyle={{ color: '#F8FAFC' }}
                            formatter={(value) => [`${Math.round(value)} mins`, 'Est. Wait Time']}
                            labelStyle={{color: '#E2E8F0', marginBottom: '4px', fontWeight: 'bold'}}
                          />
                          <Bar dataKey="wait" radius={[6, 6, 0, 0]} maxBarSize={30} animationDuration={1500}>
                            {hourlyPredictionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#FF6B35' : 'var(--bar-color)'} className="dark:[--bar-color:#9A3412] [--bar-color:#FDBA74] transition-all duration-300 hover:opacity-80" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-500 italic text-center">
                      🔥 Best hours to visit: <strong className="text-emerald-400">6:00 AM - 9:00 AM</strong>. Expect heavy peaks at noon due to afternoon Aarti.
                    </p>
                  </div>

                  {/* Facilities list */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Available Facilities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {temple.facilities?.map(f => (
                        <span key={f} className="text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">{f}</span>
                      )) || 'None'}
                    </div>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-4 mt-auto">
                {temple.isViewOnly ? (
                  <button
                    onClick={() => {
                      if (temple.lat && temple.lon) {
                        let url = `https://www.google.com/maps/dir/?api=1&destination=${temple.lat},${temple.lon}`;
                        if (userLocation) {
                          url += `&origin=${userLocation.lat},${userLocation.lon}`;
                        }
                        window.open(url, '_blank');
                      } else {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.name + ' ' + temple.location)}`, '_blank');
                      }
                    }}
                    className="flex-1 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-md rounded-xl transition-all shadow-lg shadow-saffron/20 flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-5 w-5" /> Show Route
                  </button>
                ) : (
                  <button
                    onClick={() => setStep('booking')}
                    className="flex-1 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white font-bold text-md rounded-xl transition-all shadow-lg shadow-saffron/20"
                  >
                    Book Darshan Pass
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: DARSHAN BOOKING FORM (Screen 9, 10, 11) */}
          {step === 'booking' && (
            <form onSubmit={handleBookSubmit} className="space-y-3">
              <div className="flex items-center gap-2 mb-1 text-saffron font-bold text-sm">
                <span className="cursor-pointer hover:underline" onClick={() => setStep('details')}>← Back to Details</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Darshan Slot Settings</h4>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Select Date</label>
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron cursor-pointer"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">Select Time Slot</label>
                  <div className="relative">
                    <div 
                      onClick={() => setShowSlotPicker(!showSlotPicker)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs cursor-pointer flex justify-between items-center hover:border-saffron transition-colors"
                    >
                      <span className="font-semibold">{formData.timeSlot}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${showSlotPicker ? 'rotate-90 text-saffron' : 'text-slate-400'}`} />
                    </div>
                    
                    <AnimatePresence>
                      {showSlotPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-[220px] overflow-y-auto"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {[
                              { time: '07:00 AM', status: 'Low Wait', color: 'bg-emerald-500', isMorning: true },
                              { time: '08:00 AM', status: 'Low Wait', color: 'bg-emerald-500', isMorning: true },
                              { time: '09:00 AM', status: 'Available', color: 'bg-amber-500', isMorning: true },
                              { time: '10:00 AM', status: 'Available', color: 'bg-amber-500', isMorning: true },
                              { time: '11:00 AM', status: 'Fast Filling', color: 'bg-orange-500', isMorning: true },
                              { time: '12:00 PM', status: 'Aarti Peak', color: 'bg-red-500', isMorning: false },
                              { time: '01:00 PM', status: 'Moderate', color: 'bg-amber-500', isMorning: false },
                              { time: '02:00 PM', status: 'Available', color: 'bg-amber-500', isMorning: false },
                              { time: '03:00 PM', status: 'Low Wait', color: 'bg-emerald-500', isMorning: false },
                              { time: '04:00 PM', status: 'Moderate', color: 'bg-amber-500', isMorning: false },
                              { time: '05:00 PM', status: 'Aarti Peak', color: 'bg-red-500', isMorning: false }
                            ].map((slot, idx) => {
                              const fullSlotName = `${slot.time} (${slot.status})`;
                              const isSelected = formData.timeSlot === fullSlotName || formData.timeSlot.includes(slot.time);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setFormData({ ...formData, timeSlot: fullSlotName });
                                    setShowSlotPicker(false);
                                  }}
                                  className={`relative overflow-hidden cursor-pointer rounded-lg border p-1.5 pl-2 transition-all duration-200 ${isSelected ? 'border-saffron bg-saffron/5 shadow-md shadow-saffron/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${slot.color}`} />
                                  <div className="flex justify-between items-start mb-0.5">
                                    <span className={`font-bold text-[11px] ${isSelected ? 'text-saffron' : 'text-slate-800 dark:text-slate-200'}`}>{slot.time}</span>
                                    {slot.isMorning ? <Sun className={`h-3 w-3 ${isSelected ? 'text-saffron' : 'text-slate-400'}`} /> : <Moon className={`h-3 w-3 ${isSelected ? 'text-saffron' : 'text-slate-400'}`} />}
                                  </div>
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold truncate">{slot.status}</p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">No. of Devotees</label>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-1.5 h-[38px] focus-within:border-saffron transition-colors">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visitors: Math.max(1, (parseInt(formData.visitors) || 1) - 1) })}
                      className="w-[26px] h-[26px] flex shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-saffron hover:text-white transition-colors shadow-sm"
                    >
                      <Minus className="w-3 h-3" strokeWidth={3} />
                    </button>
                    
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full bg-transparent text-center text-slate-900 dark:text-white text-sm font-bold focus:outline-none m-0"
                      value={formData.visitors}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, visitors: val === '' ? '' : parseInt(val) });
                      }}
                      onBlur={() => {
                        if (!formData.visitors || formData.visitors < 1) setFormData({ ...formData, visitors: 1 });
                      }}
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visitors: (parseInt(formData.visitors) || 1) + 1 })}
                      className="w-[26px] h-[26px] flex shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-saffron hover:text-white transition-colors shadow-sm"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Darshan Category</label>
                  <select
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={formData.specialDarshan}
                    onChange={e => setFormData({ ...formData, specialDarshan: e.target.value })}
                  >
                    <option value="General">General Entry (Free)</option>
                    <option value="Special">Special Entry (₹100/person)</option>
                    <option value="VVIP">VVIP Protocol (₹500/person)</option>
                  </select>
                </div>
              </div>

              {/* Accessibility (Screen 10) */}
              <div className="bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-xs font-bold text-gold flex items-center gap-1.5 mb-1">
                  <HeartHandshake className="h-4 w-4" /> Priority Accessibility Support
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      className="rounded accent-saffron bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      checked={formData.wheelchair}
                      onChange={e => setFormData({ ...formData, wheelchair: e.target.checked })}
                    />
                    Need Wheelchair
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      className="rounded accent-saffron bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      checked={formData.volunteer}
                      onChange={e => setFormData({ ...formData, volunteer: e.target.checked })}
                    />
                    Volunteer Escort
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white col-span-2">
                    <input
                      type="checkbox"
                      className="rounded accent-saffron bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      checked={formData.medical}
                      onChange={e => setFormData({ ...formData, medical: e.target.checked })}
                    />
                    Notify Medical Unit (Critical Support)
                  </label>
                </div>
              </div>

              {/* AI Travel Estimates (Screen 11) */}
              <div className="bg-white dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-850/60 text-xs flex justify-between items-center text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-saffron shrink-0" />
                  <span>AI Travel Estimate: <strong>45 km • 1h 15m (Car)</strong>. Fuel cost: ~₹380.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-saffron hover:bg-[#e85a28] text-white font-bold text-md rounded-xl transition-all shadow-lg mt-2"
              >
                Proceed to Payment
              </button>
            </form>
          )}

          {/* STEP 2.5: AADHAAR VERIFICATION */}
          {step === 'aadhaar' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 mb-2 shadow-sm">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Verify Identity</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Aadhaar authentication is required for secure bookings.</p>
              </div>

              <div className="max-w-sm mx-auto space-y-4 text-left">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Aadhaar Number (UID)</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm font-bold tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="XXXX-XXXX-XXXX"
                      maxLength={14}
                      value={aadhaarNumber}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        val = val.match(/.{1,4}/g)?.join('-') || val;
                        setAadhaarNumber(val);
                      }}
                      disabled={verificationStatus !== 'idle'}
                    />
                    <Fingerprint className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>


                {verificationStatus === 'idle' || verificationStatus === 'loading' ? (
                  <button
                    onClick={handleSendOTP}
                    disabled={aadhaarNumber.length < 14 || verificationStatus === 'loading'}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                      aadhaarNumber.length < 14
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                    }`}
                  >
                    {verificationStatus === 'loading' ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                    ) : 'Send OTP via UIDAI'}
                  </button>
                ) : null}

                {(verificationStatus === 'sent' || verificationStatus === 'verifying' || verificationStatus === 'success') && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs text-emerald-600 dark:text-emerald-500 mb-1.5 font-semibold">OTP sent to registered mobile</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center text-slate-900 dark:text-white text-lg font-bold tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="••••••"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
                      />
                    </div>
                    
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || verificationStatus === 'verifying' || verificationStatus === 'success'}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                        verificationStatus === 'success' ? 'bg-emerald-500 text-white'
                        : otp.length !== 6 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                      }`}
                    >
                      {verificationStatus === 'verifying' ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                      ) : verificationStatus === 'success' ? (
                        <><CheckCircle className="h-5 w-5" /> Verified</>
                      ) : 'Verify & Proceed to Payment'}
                    </button>
                  </motion.div>
                )}
                
                <div className="pt-2 text-center">
                  <button onClick={() => {setStep('booking'); setVerificationStatus('idle'); setOtp(''); setAadhaarNumber('');}} className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white underline">
                    Cancel and go back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT PORTAL GATEWAY MODAL */}
          <PaymentGatewayModal
            isOpen={step === 'payment'}
            onClose={() => setStep('booking')}
            amount={formData.specialDarshan === 'General' ? 0 : formData.specialDarshan === 'Special' ? formData.visitors * 100 : formData.visitors * 500}
            orderDetails={{
              ...formData,
              templeName: temple.name
            }}
            onSuccess={(paymentResult) => {
              setIsPaying(true);
              const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
              
              fetch(baseUrl + '/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  templeId: temple._id,
                  ...formData,
                  paymentId: paymentResult.transactionId,
                  paymentMethod: paymentResult.payMethod,
                  paymentStatus: 'PAID'
                })
              })
                .then(res => res.json())
                .then(data => {
                  setIsPaying(false);
                  if (data.success) {
                    setBookedData(data);
                    setStep('ticket');
                  } else {
                    alert(data.message || 'Booking failed');
                    setStep('booking');
                  }
                })
                .catch(err => {
                  setIsPaying(false);
                  setBookedData({
                    bookingId: `TS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`,
                    date: formData.date,
                    timeSlot: formData.timeSlot,
                    visitors: formData.visitors,
                    specialDarshan: formData.specialDarshan,
                    waitlistPosition: 0
                  });
                  setStep('ticket');
                });
            }}
          />

          {/* STEP 4: QR TICKET ISSUED (Screen 14) */}
          {step === 'ticket' && bookedData && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h4 className="text-2xl font-bold text-emerald-400">Darshan Verified!</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Your entry pass has been registered on the blockchain queue.</p>

              {/* Scannable Dynamic QR Ticket Component */}
              <div className="py-2">
                <TicketQR 
                  ticketData={{
                    ...bookedData,
                    templeName: temple.name
                  }} 
                  size={180}
                  showDetails={true}
                  showActions={true}
                />
              </div>

              {bookedData.waitlistPosition > 0 && (
                <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 p-3 rounded-xl max-w-sm mx-auto text-left text-xs flex gap-2">
                  <Info className="h-5 w-5 shrink-0" />
                  <span>
                    Your slot is currently in the <strong>Waitlist (#{bookedData.waitlistPosition})</strong> due to peak surge. Estimated confirmation time is 35 mins.
                  </span>
                </div>
              )}

              {/* Bhagavad Gita Shloka */}
              <div className="bg-saffron/10 border border-saffron/20 p-4 rounded-xl max-w-sm mx-auto text-center mt-4">
                <p className="text-saffron font-semibold italic text-sm mb-1.5 font-serif">
                  "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  (Karmanye vadhikaraste Ma Phaleshu Kadachana)<br />
                  <strong>Meaning:</strong> You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.
                </p>
              </div>

              <div className="max-w-xs mx-auto pt-2 mt-4">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-saffron hover:bg-[#e85a28] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Close & View Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// VIEW 2: MULTI-TEMPLE PLANNER (Screen 18)
// ==========================================
function PlannerView({ temples, onClose }) {
  const [formData, setFormData] = useState({
    startingCity: 'New Delhi',
    templeId: '1',
    days: 3,
    budget: 'Comfort'
  });
  const [planResult, setPlanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => res.json())
        .then(data => {
          setPlanResult(data);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.error(err);
        });
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Multi-Temple Journey Planner</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">AI-Powered route, accommodation, and budget calculation across multiple shrine stops.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Planner Inputs Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl h-fit">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Planner Inputs</h4>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Starting City</label>
              <input
                type="text"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                value={formData.startingCity}
                onChange={e => setFormData({ ...formData, startingCity: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Primary Target Shrine</label>
              <select
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                value={formData.templeId}
                onChange={e => setFormData({ ...formData, templeId: e.target.value })}
              >
                {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Days Available</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                  value={formData.days}
                  onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">Budget Scale</label>
                <select
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                >
                  <option value="Economy">Economy</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-saffron hover:bg-[#e85a28] disabled:bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing constraints...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 text-gold" /> Generate AI Route
                </>
              )}
            </button>
          </form>
        </div>

        {/* Planner Output Results */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-8 rounded-3xl min-h-[400px] flex flex-col justify-center">
          {planResult ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-xl font-extrabold text-gold flex items-center gap-2"><Sparkles className="h-5 w-5 text-saffron" /> Recommended AI Route</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Multi-city transit nodes customized for {formData.days} days.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">EST BUDGET</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{planResult.transport.budgetEstimate}</span>
                </div>
              </div>

              {/* Visual Timeline Route */}
              <div className="relative pl-6 space-y-6 border-l border-slate-850 ml-3 py-2">
                {planResult.route.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-saffron flex items-center justify-center font-bold text-[8px] text-saffron">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{item.type} {item.stay && `• Lodging: ${item.stay}`} {item.transit && `• Transit: ${item.transit}`}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transit cost details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-850 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Mode</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{planResult.transport.mode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Total distance</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{planResult.transport.distance}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{planResult.transport.estTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Fuel/Ticket cost</span>
                  <span className="font-semibold text-saffron">{planResult.transport.estFuel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12 space-y-2">
              <Compass className="h-16 w-16 mx-auto text-slate-700 animate-spin" style={{ animationDuration: '6s' }} />
              <h4 className="font-bold text-slate-600 dark:text-slate-400">No Pilgrimage Route Generated</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Fill in the constraints on the left panel and click generate to let the AI calculate your itinerary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 3: ACCOMMODATION LISTINGS (Screen 12)
// ==========================================
function HotelsView() {
  const [hotelsList, setHotelsList] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [bookedHotel, setBookedHotel] = useState(null);

  useEffect(() => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/hotels')
      .then(res => res.json())
      .then(setHotelsList)
      .catch(err => console.error("Error loading accommodation:", err));
  }, []);

  const filteredHotels = hotelsList.filter(h => {
    return typeFilter === 'All' || h.type === typeFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Spiritual Stays & Accommodations</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Book hotels, dharamshalas, lodges, and temple guest houses near holy gates.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        {['All', 'Hotel', 'Dharamshala', 'Temple Guest House', 'Lodge'].map(tab => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${typeFilter === tab ? 'bg-saffron/10 border-saffron text-saffron' : 'border-slate-850 hover:bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredHotels.map(h => (
          <div key={h.id} className="bg-white dark:bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between hover:border-gold/30 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase text-saffron bg-saffron/10 border border-saffron/20 px-2.5 py-0.5 rounded-full">{h.type}</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Proximity: <strong>{h.distance}</strong></span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{h.name}</h4>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-xs bg-gold/10 text-gold font-bold px-2 py-0.5 rounded">⭐ {h.rating}</span>
                <span className="text-[11px] text-slate-500">Guest Score</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {h.amenities?.map(a => (
                  <span key={a} className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/40 px-2.5 py-1 rounded-md">{a}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-850 pt-4 mt-4">
              <div>
                <span className="text-[9px] text-slate-500 block">PRICE/NIGHT</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">₹{h.price}</span>
              </div>
              <button
                onClick={() => setBookedHotel(h)}
                className="bg-saffron hover:bg-[#e85a28] px-5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white transition-all shadow-md"
              >
                Secure Stay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Success Modal */}
      <AnimatePresence>
        {bookedHotel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#1F1F35] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-center"
            >
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Accommodation Secured</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">Your room at <strong>{bookedHotel.name}</strong> is reserved successfully. Payment is due at the check-in desk.</p>

              <button
                type="button"
                onClick={() => setBookedHotel(null)}
                className="w-full py-2.5 bg-saffron text-slate-900 dark:text-white font-bold rounded-xl hover:bg-[#e85a28] transition-all text-xs"
              >
                Back to Stays
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================================================
// VIEW 4: MY BOOKINGS & WAITLISTS (Screens 15 & 16)
// ========================================================
function BookingsView() {
  const [activeSubTab, setActiveSubTab] = useState('Upcoming'); // Upcoming, Completed, Cancelled
  const [bookingsList, setBookingsList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rescheduleData, setRescheduleData] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('09:00 AM (Available)');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings')
      .then(res => res.json())
      .then(setBookingsList)
      .catch(err => console.error("Error fetching bookings:", err));
  };

  const handleCancelBooking = (bookingId) => {
    if (confirm("Are you sure you want to cancel this Darshan slot?")) {
      fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetchBookings();
          } else {
            alert('Cancellation failed.');
          }
        });
    }
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    fetch((window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com') + '/api/bookings/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: rescheduleData.bookingId,
        date: rescheduleDate,
        timeSlot: rescheduleSlot
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRescheduleData(null);
          fetchBookings();
        } else {
          alert('Rescheduling failed.');
        }
      });
  };

  const filteredBookings = bookingsList.filter(b => b.status === activeSubTab);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Booked Passes</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage active slots, download QR passes, check waitlists, or reschedule bookings.</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        {['Upcoming', 'Completed', 'Cancelled'].map(t => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`pb-2 border-b-2 font-bold text-sm transition-all ${activeSubTab === t ? 'border-saffron text-saffron' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            {t} Slots
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="space-y-4">
        {filteredBookings.map(b => (
          <div key={b.bookingId} className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            {/* Status vertical bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${b.status === 'Upcoming' ? 'bg-saffron' :
                b.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />

            <div className="pl-2 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{b.templeName}</h4>
                {b.waitlistPosition > 0 && (
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    Waitlist #{b.waitlistPosition}
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs flex flex-wrap gap-x-4 gap-y-1">
                <span>📅 Date: <strong>{b.date}</strong></span>
                <span>⏰ Slot: <strong>{b.timeSlot.split(' ')[0]}</strong></span>
                <span>👥 visitors: <strong>{b.visitors} Person(s)</strong></span>
                <span>🎫 Category: <strong>{b.specialDarshan}</strong></span>
              </p>

              {(b.wheelchair || b.volunteer || b.medical) && (
                <div className="text-[10px] text-gold font-bold flex gap-3 pt-1">
                  {b.wheelchair && <span>♿ Wheelchair Required</span>}
                  {b.volunteer && <span>🤝 Volunteer Escort</span>}
                  {b.medical && <span>🏥 Medical Camp Alert</span>}
                </div>
              )}
            </div>

            <div className="flex gap-3 shrink-0 w-full md:w-auto">
              {b.status === 'Upcoming' && (
                <>
                  <button
                    onClick={() => {
                      setRescheduleData(b);
                      setRescheduleDate(b.date);
                      setRescheduleSlot(b.timeSlot);
                    }}
                    className="flex-1 md:flex-initial bg-white dark:bg-slate-800 hover:bg-slate-750 px-4 py-2 border border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-all"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelBooking(b.bookingId)}
                    className="flex-1 md:flex-initial bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 text-xs font-bold rounded-lg transition-all"
                  >
                    Cancel Slot
                  </button>
                  <button
                    onClick={() => setSelectedTicket(b)}
                    className="flex-1 md:flex-initial bg-saffron hover:bg-[#e85a28] px-4 py-2 text-slate-900 dark:text-white text-xs font-bold rounded-lg transition-all shadow-md"
                  >
                    View QR Pass
                  </button>
                </>
              )}
              {b.status !== 'Upcoming' && (
                <span className="text-slate-500 text-xs italic">No actions available</span>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No bookings found under "{activeSubTab}".
          </div>
        )}
      </div>

      {/* QR Ticket View Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative"
            >
              <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                <X className="h-5 w-5" />
              </button>

              <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Gate Pass QR Ticket</h4>

              <TicketQR 
                ticketData={selectedTicket} 
                size={180}
                showDetails={true}
                showActions={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setRescheduleData(null)} className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                <X className="h-5 w-5" />
              </button>

              <h4 className="text-xl font-bold mb-4">Reschedule Darshan</h4>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">New Date</label>
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={rescheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">New Slot</label>
                  <select
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-saffron"
                    value={rescheduleSlot}
                    onChange={e => setRescheduleSlot(e.target.value)}
                  >
                    <option>07:00 AM (Low Wait)</option>
                    <option>09:00 AM (Available)</option>
                    <option>11:00 AM (Available)</option>
                    <option>01:00 PM (Fast Filling)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleData(null)}
                    className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-saffron text-slate-900 dark:text-white font-bold rounded-xl hover:bg-[#e85a28] text-xs shadow-md"
                  >
                    Save Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// VIEW 5: USER PROFILE & FAMILY (Screen 19)
// ==========================================
function ProfileView({ user, setUser }) {
  const [familyInput, setFamilyInput] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAddFamily = (e) => {
    e.preventDefault();
    if (!familyInput.trim()) return;
    setUser({
      ...user,
      family: [...user.family, familyInput]
    });
    setFamilyInput('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Devotee Profile Settings</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure family members registry, profile details, and toggle accessibility preferences.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-center font-medium">
          Profile configurations saved successfully!
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Personal Information</h4>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Registered Name</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Phone Number</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.phone} onChange={e => setUser({ ...user, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
              <input type="email" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Resident Address</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.address} onChange={e => setUser({ ...user, address: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Emergency Contact</label>
              <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white" value={user.emergencyContact} onChange={e => setUser({ ...user, emergencyContact: e.target.value })} required />
            </div>

            <button type="submit" className="col-span-2 py-3 bg-saffron hover:bg-[#e85a28] text-slate-900 dark:text-white rounded-xl font-bold mt-4 shadow-md transition-all">
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Sidebar: Family Registry & Accessibility Defaults */}
        <div className="space-y-6">
          {/* Family Registry */}
          <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">Family Members Registry</h4>
            <p className="text-[11px] text-slate-500 mb-4">Add family members to quickly book group Darshan passes.</p>

            <ul className="space-y-2 mb-4 text-xs">
              {user.family.map(f => (
                <li key={f} className="p-2 bg-white dark:bg-slate-950/40 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-850 flex justify-between items-center">
                  <span>{f}</span>
                  <button onClick={() => setUser({ ...user, family: user.family.filter(item => item !== f) })} className="text-red-400 hover:text-red-500 font-bold">Remove</button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddFamily} className="flex gap-2">
              <input
                type="text"
                placeholder="Name & Relationship (e.g. Daughter)"
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                value={familyInput}
                onChange={e => setFamilyInput(e.target.value)}
              />
              <button type="submit" className="bg-saffron text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e85a28]">Add</button>
            </form>
          </div>

          {/* Accessibility Defaults */}
          <div className="bg-white dark:bg-slate-900 border border-slate-850 p-6 rounded-3xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">Accessibility Presets</h4>
            <p className="text-[11px] text-slate-500 mb-4">Set default assistant requirements which apply during bookings.</p>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  className="rounded accent-saffron bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  checked={user.accessibilityPreset.wheelchair}
                  onChange={e => setUser({
                    ...user,
                    accessibilityPreset: { ...user.accessibilityPreset, wheelchair: e.target.checked }
                  })}
                />
                Default Wheelchair Assistance
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  className="rounded accent-saffron bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  checked={user.accessibilityPreset.volunteer}
                  onChange={e => setUser({
                    ...user,
                    accessibilityPreset: { ...user.accessibilityPreset, volunteer: e.target.checked }
                  })}
                />
                Default Volunteer Guide Escort
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 6: NOTIFICATIONS & ALERTS (Screen 17)
// ==========================================
function AlertsView({ notifications, markRead }) {
  useEffect(() => {
    markRead();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Broadcast Alerts & Notifications</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review live weather bulletins, queue congestion warnings, or booking schedule details.</p>
        </div>
        <span className="text-xs text-slate-500 italic">Marked all as read</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden divide-y divide-slate-850">
        {notifications.map(n => (
          <div key={n.id} className="p-6 flex items-start gap-4 hover:bg-white dark:bg-slate-850/20 transition-all">
            <div className={`p-2.5 rounded-xl shrink-0 ${n.type === 'Emergency Broadcast' ? 'bg-red-500/10 text-red-500' :
                n.type === 'Crowd Alert' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-saffron/10 text-saffron'
              }`}>
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.type}</span>
                <span className="text-[10px] text-slate-500">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900/20">
            No notifications on this ledger.
          </div>
        )}
      </div>
    </div>
  );
}
