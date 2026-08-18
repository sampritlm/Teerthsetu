import React, { useState, useEffect } from 'react';
import { 
  Bus, Car, Navigation, ShieldCheck, MapPin, Clock, Users, QrCode, 
  Sparkles, CheckCircle, ChevronRight, X, Filter, Zap, ArrowRight, DollarSign,
  PhoneCall, Shield, AlertCircle, RefreshCw, Calendar, Landmark, Crosshair, Compass
} from 'lucide-react';
import TicketQR from './TicketQR';
import PaymentGatewayModal from './PaymentGatewayModal';

// Sample Pilgrimage Routes & Distance Estimator Data
const routeEstimates = {
  'Bengaluru': { distance: '250 km', duration: '4h 30m', cabFare: 3800, shuttleFare: 450, rtcFare: 180, trainFare: 110, heliFare: 12500, lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { distance: '560 km', duration: '8h 15m', cabFare: 7200, shuttleFare: 850, rtcFare: 340, trainFare: 220, heliFare: 18900, lat: 17.3850, lng: 78.4867 },
  'Chennai': { distance: '135 km', duration: '2h 45m', cabFare: 2400, shuttleFare: 280, rtcFare: 120, trainFare: 65, heliFare: 9800, lat: 13.0827, lng: 80.2707 },
  'Vijayawada': { distance: '380 km', duration: '6h 00m', cabFare: 5100, shuttleFare: 620, rtcFare: 260, trainFare: 160, heliFare: 15400, lat: 16.5062, lng: 80.6480 },
  'Mumbai': { distance: '1,150 km', duration: '18h 30m', cabFare: 14500, shuttleFare: 1800, rtcFare: 780, trainFare: 420, heliFare: 28500, lat: 19.0760, lng: 72.8777 },
  'Delhi': { distance: '1,980 km', duration: '32h 00m', cabFare: 24000, shuttleFare: 2900, rtcFare: 1250, trainFare: 690, heliFare: 42000, lat: 28.7041, lng: 77.1025 }
};

// CATEGORY-SPECIFIC END-TO-END WHOLE JOURNEY ITINERARIES (Door-to-Gopuram)
const categoryWholeJourneys = {
  'whole_journey': {
    title: 'Multimodal Master Whole Journey',
    tag: 'RECOMMENDED COMBINATION',
    totalDuration: '5 hrs 20 mins',
    totalFare: 475,
    legs: [
      { step: 1, modeIcon: '🛺', title: 'Leg 1: Home Pickup ➔ Local Station', details: 'Local Auto / Metro from Home Pin to KSR Bengaluru Station', distance: '12 km', duration: '25 mins', fare: 60, provider: 'City Local Transit' },
      { step: 2, modeIcon: '🚆', title: 'Leg 2: Intercity Rail / Express Bus', details: 'Superfast Passenger Train #12734 / Express Bus to Tirupati', distance: '220 km', duration: '4 hrs 10 mins', fare: 340, provider: 'Indian Railways / State RTC' },
      { step: 3, modeIcon: '🚌', title: 'Leg 3: Station ➔ Gopuram Gate 1', details: 'TeerthSetu Low-Floor EV Gopuram Shuttle #SH-101 (Every 10m)', distance: '18 km', duration: '35 mins', fare: 50, provider: 'TeerthSetu EV Transit' },
      { step: 4, modeIcon: '🎒', title: 'Leg 4: Cloakroom ➔ Deity Entrance', details: 'Deposit Phone & Shoes at Counter #4 ➔ Enter Gate 1 Queue', distance: '0.2 km', duration: '10 mins', fare: 25, provider: 'Temple Security Desk' }
    ]
  },
  'public_bus': {
    title: 'State RTC Public Bus Whole Journey',
    tag: 'STATE RTC SUBSIDIZED ROUTE',
    totalDuration: '5 hrs 45 mins',
    totalFare: 240,
    legs: [
      { step: 1, modeIcon: '🚌', title: 'Leg 1: Home ➔ RTC Central Bus Terminal', details: 'Local City Feeder Bus / Auto to Central RTC Bus Station', distance: '10 km', duration: '20 mins', fare: 20, provider: 'City RTC Feeder' },
      { step: 2, modeIcon: '🚌', title: 'Leg 2: Intercity State RTC Express Bus', details: 'APSRTC / KSRTC Saptagiri Super Deluxe Bus to Tirupati Central Depot', distance: '222 km', duration: '4 hrs 30 mins', fare: 180, provider: 'State RTC Corporation' },
      { step: 3, modeIcon: '🚌', title: 'Leg 3: Tirupati Depot ➔ Gopuram Gate 1', details: 'State RTC Saptagiri Public Bus #113 (Departs every 3 mins)', distance: '18 km', duration: '45 mins', fare: 25, provider: 'APSRTC Saptagiri #113' },
      { step: 4, modeIcon: '🎒', title: 'Leg 4: Cloakroom ➔ Gate 1 Darshan Queue', details: 'Free Cloakroom Storage Counter #4 ➔ Deity Queue', distance: '0.2 km', duration: '10 mins', fare: 15, provider: 'Temple Administration' }
    ]
  },
  'public_train': {
    title: 'Suburban Passenger Rail Whole Journey',
    tag: 'LOWEST FARE RAIL ROUTE',
    totalDuration: '5 hrs 15 mins',
    totalFare: 180,
    legs: [
      { step: 1, modeIcon: '🚆', title: 'Leg 1: Home ➔ Main Railway Station', details: 'Local Metro / City Auto from Home Pin to Railway Station', distance: '8 km', duration: '20 mins', fare: 30, provider: 'City Metro Rail' },
      { step: 2, modeIcon: '🚆', title: 'Leg 2: Intercity Passenger Express Rail', details: 'Tirupati Suburban Passenger Express #17406 (UTS Unreserved Ticket)', distance: '224 km', duration: '4 hrs 05 mins', fare: 110, provider: 'Indian Railways (SCR)' },
      { step: 3, modeIcon: '🚌', title: 'Leg 3: Station ➔ Hill Gopuram Gate 1', details: 'Public Station Transit Bus #204 to Alipiri / Gopuram Gate 1', distance: '18 km', duration: '40 mins', fare: 25, provider: 'Public Station Shuttle' },
      { step: 4, modeIcon: '🎒', title: 'Leg 4: Mobile Locker ➔ Gate 1 Entrance', details: 'Deposit Luggage & Phone ➔ Enter Main Queue Gate 1', distance: '0.2 km', duration: '10 mins', fare: 15, provider: 'Temple Security Desk' }
    ]
  },
  'public_auto': {
    title: 'Shared Public Auto Whole Journey',
    tag: 'LOCAL UNION SHARED ROUTE',
    totalDuration: '5 hrs 50 mins',
    totalFare: 190,
    legs: [
      { step: 1, modeIcon: '🛺', title: 'Leg 1: Home ➔ City Auto Stand', details: 'Local Share Auto #1 from Home Pin to City Transport Hub', distance: '5 km', duration: '15 mins', fare: 20, provider: 'Municipal Auto Union' },
      { step: 2, modeIcon: '🚐', title: 'Leg 2: Shared Express Mini-Bus', details: 'Public Share Express Mini-Bus to Alipiri Depot', distance: '227 km', duration: '4 hrs 45 mins', fare: 140, provider: 'Public Express Union' },
      { step: 3, modeIcon: '🛺', title: 'Leg 3: Alipiri ➔ Hill Footsteps Gate A', details: 'Alipiri Union Fixed-Route Share Auto #01 (Departs on 6 seats)', distance: '18 km', duration: '40 mins', fare: 20, provider: 'Alipiri Auto Union' },
      { step: 4, modeIcon: '🎒', title: 'Leg 4: Cloakroom Deposit ➔ Queue Entry', details: 'Footwear & Luggage Token Deposit ➔ Gate Entrance', distance: '0.2 km', duration: '10 mins', fare: 10, provider: 'Temple Management' }
    ]
  },
  'shuttles': {
    title: 'EV Gopuram Express Shuttle Whole Journey',
    tag: '100% ZERO-EMISSION GREEN ROUTE',
    totalDuration: '4 hrs 50 mins',
    totalFare: 390,
    legs: [
      { step: 1, modeIcon: '⚡', title: 'Leg 1: Home ➔ EV Transit Hub', details: 'EV City Auto / Feeder Bus from Home Pin to EV Transport Hub', distance: '10 km', duration: '20 mins', fare: 40, provider: 'City Green Transit' },
      { step: 2, modeIcon: '🚌', title: 'Leg 2: Intercity Zero-Emission AC Volvo', details: 'Alipiri Direct Luxury AC Volvo Bus to Tirumala Hill Terminal', distance: '222 km', duration: '3 hrs 45 mins', fare: 280, provider: 'TeerthSetu EV Fleet' },
      { step: 3, modeIcon: '⚡', title: 'Leg 3: Terminal ➔ Main Gopuram Gate 1', details: 'TeerthSetu Low-Floor EV Gopuram Express Shuttle #SH-101', distance: '18 km', duration: '35 mins', fare: 50, provider: 'TeerthSetu Low-Floor EV' },
      { step: 4, modeIcon: '🎒', title: 'Leg 4: Cloakroom ➔ Priority Gate 1 Queue', details: 'Fast Phone & Luggage Deposit Counter #4 ➔ Gate 1 Queue', distance: '0.2 km', duration: '10 mins', fare: 20, provider: 'Temple Security Desk' }
    ]
  },
  'cabs': {
    title: 'Prepaid Outstation Cab Door-to-Gopuram Journey',
    tag: 'DIRECT DOORSTEP PICKUP',
    totalDuration: '4 hrs 15 mins',
    totalFare: 3800,
    legs: [
      { step: 1, modeIcon: '🚕', title: 'Leg 1: Home Doorstep Pickup', details: 'Verified Devotee EV Sedan Cab arrives directly at your Home Door Pin', distance: '0 km', duration: '0 mins wait', fare: 0, provider: 'Pilgrim EV Cabs' },
      { step: 2, modeIcon: '🚗', title: 'Leg 2: Expressway Direct Drive', details: 'Direct AC Sedan Drive via National Highway to Tirumala Hills', distance: '232 km', duration: '3 hrs 30 mins', fare: 3500, provider: 'Prepaid Outstation Cab' },
      { step: 3, modeIcon: '🅿️', title: 'Leg 3: VIP Hill Pass & Parking Drop', details: 'Direct Drop at Gopuram North Visitor Parking (200m from Gate 2)', distance: '18 km', duration: '35 mins', fare: 300, provider: 'Gopuram Parking Deck' },
      { step: 4, modeIcon: '🎒', title: 'Leg 4: Luggage Locker ➔ Gate 2 Entry', details: 'Luggage Deposit ➔ Direct Walk to Gate 2 Entry Queue', distance: '0.2 km', duration: '10 mins', fare: 0, provider: 'Temple Gate Security' }
    ]
  },
  'heli': {
    title: 'VIP Helicopter Yatra Door-to-Gopuram Journey',
    tag: 'VIP ZERO WAIT TIME ROUTE',
    totalDuration: '1 hr 15 mins',
    totalFare: 4500,
    legs: [
      { step: 1, modeIcon: '🚕', title: 'Leg 1: Home Pickup ➔ Airport Helipad', details: 'Chauffeur VIP Cab from Home Pin to Renigunta Airport Helipad', distance: '15 km', duration: '20 mins', fare: 500, provider: 'Airport VIP Transfers' },
      { step: 2, modeIcon: '🚁', title: 'Leg 2: VIP Helicopter Flight', details: 'Twin-Engine Airbus H125 Helicopter Flight over Sheshachalam Hills', distance: '220 km', duration: '12 mins flight', fare: 3500, provider: 'Pilgrim Aviation' },
      { step: 3, modeIcon: '⚡', title: 'Leg 3: Helipad ➔ VIP Gopuram Entrance', details: 'Gopuram Hill VIP Helipad to VIP Gate 1 via Electric Buggy', distance: '2 km', duration: '5 mins', fare: 500, provider: 'VIP Buggy Fleet' },
      { step: 4, modeIcon: '✨', title: 'Leg 4: VIP Express Darshan Entrance', details: 'Express VIP Priority Gate Entry with Zero Queue Wait Time', distance: '0.1 km', duration: '5 mins', fare: 0, provider: 'VIP Temple Protocol' }
    ]
  },
  'parking': {
    title: 'EV Driving & Multi-Level Parking Whole Journey',
    tag: 'SELF-DRIVE EV PARKING ROUTE',
    totalDuration: '4 hrs 45 mins',
    totalFare: 150,
    legs: [
      { step: 1, modeIcon: '🚗', title: 'Leg 1: Home Drive ➔ Highway Route', details: 'Self-Drive / Personal Car departure from Home Pin onto Highway', distance: '12 km', duration: '20 mins', fare: 0, provider: 'Personal Vehicle' },
      { step: 2, modeIcon: '⚡', title: 'Leg 2: Highway Drive to Alipiri Parking', details: 'Drive along National Highway to Alipiri Multi-Level EV Parking Deck', distance: '220 km', duration: '3 hrs 40 mins', fare: 120, provider: 'Toll & Expressway' },
      { step: 3, modeIcon: '🅿️', title: 'Leg 3: Multi-Level Parking & Fast DC Charging', details: 'Park at Reserved Bay 4B & Plug into 50kW DC Fast Charger', distance: '0.5 km', duration: '15 mins', fare: 30, provider: 'Alipiri EV Deck' },
      { step: 4, modeIcon: '🚌', title: 'Leg 4: EV Parking Shuttle ➔ Gate 1 Queue', details: 'Board Free Visitor Shuttle from Parking Deck to Gopuram Gate 1', distance: '18 km', duration: '30 mins', fare: 0, provider: 'Free Visitor Transit' }
    ]
  }
};

// 1. PUBLIC RTC BUSES
const publicBusList = [
  { id: 'RTC-113', operator: 'State RTC Public Bus Service (APSRTC / KSRTC)', name: 'Saptagiri Express Public City Bus #113', type: 'State RTC Non-Stop Public Bus', route: 'Tirupati Central Railway Station ➔ Main Gopuram Gate 1', frequency: 'Every 3 minutes (Continuous non-stop service)', fare: 25, passInfo: 'Day Pass Accepted (₹70 All-Day)', features: ['Public RTC Subsidized Fare', 'Senior Citizen Concession', 'High Frequency (Every 3m)', 'Conductor Paper Ticket'], badge: 'PUBLIC BUS #113' },
  { id: 'RTC-204', operator: 'State RTC Local City Transit', name: 'Ordinary Public City Transit Bus #204', type: 'Low-Fare Ordinary Public Bus', route: 'Renigunta Junction ➔ Alipiri Foot Steps Depot', frequency: 'Every 8 minutes', fare: 15, passInfo: 'Student & Monthly Pass Accepted', features: ['Lowest Public Transit Fare', 'Multiple Intermediate Stop Points', 'Senior Reserved Seats'], badge: 'LOCAL RTC #204' }
];

// 2. PUBLIC SUBURBAN & PASSENGER TRAINS
const publicTrainList = [
  { id: 'RAIL-17406', operator: 'Indian Railways (South Central Zone)', name: 'Tirupati Suburban Passenger Express #17406', type: 'Unreserved General Passenger Train', route: 'Renigunta Junction (Platform 2) ➔ Tirupati Main (Platform 1)', timings: 'Daily 06:15 AM, 09:30 AM, 02:45 PM, 06:20 PM', fare: 10, features: ['Unreserved General Ticket (UTS App)', 'Direct Station-to-Station Connection', 'Lowest Rail Fare'], badge: 'PUBLIC RAIL PASSENGER' }
];

// 3. SHARED PUBLIC AUTOS
const publicAutoList = [
  { id: 'AUTO-01', operator: 'Municipal Union Share Auto Association', name: 'Alipiri Union Fixed-Route Share Auto', type: '6-Seater Public Share Auto', route: 'Tirupati Railway Station ➔ Alipiri Footsteps Gate A', frequency: 'Continuous (Departs as soon as 6 seats fill)', fare: 20, features: ['Fixed Municipal Union Rate', 'Shared Seat Price (₹20/head)', '24/7 Auto Stand Support'], badge: 'PUBLIC SHARE AUTO' }
];

// 4. EV GOPURAM SHUTTLES
const shuttlesList = [
  { id: 'SH-101', name: 'TeerthSetu EV Gopuram Express', type: 'Electric Low-Floor AC Shuttle', route: 'Railway Station Gate 2 ➔ Main Gopuram Gate 1', frequency: 'Every 10 mins', seatsAvailable: 18, fare: 50, features: ['100% Zero Emission EV', 'Wheelchair Ramp', 'Luggage Compartment', 'Live GPS Tracking'], badge: 'FASTEST SHUTTLE' }
];

// 5. CABS
const cabsList = [
  { id: 'CAB-201', name: 'Pilgrim EV Sedan Pick-Up', type: 'Tata Tigor EV / Hyundai Kona', capacity: '4 Passengers + 2 Bags', farePerKm: '₹14 / km', fixedAirportFare: 1200, features: ['Verified Devotee Driver', 'Zero Cancellation Fee', 'Clean & Sanitized Interiors', 'Direct Hotel Pick-up'], rating: '4.9 ★' }
];

// 6. HELICOPTER
const heliList = [
  { id: 'HELI-301', name: 'VVIP Divya Sightseeing & Gopuram Shuttle', type: 'Twin-Engine Airbus H125 Helicopter', duration: '12 Mins Scenic Flight', fare: 4500, helipad: 'Renigunta Airport Helipad ➔ Gopuram Hill VIP Helipad', features: ['VIP Helipad Boarding', 'Express Priority Darshan Slot', 'Panoramic Aerial View', 'Zero Wait Time'], badge: 'VIP HELI PASS' }
];

// Haversine Distance Helper in km
function getKmDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function DevoteeTravelsView() {
  const [activeTab, setActiveTab] = useState('whole_journey'); // whole_journey, public_bus, public_train, public_auto, shuttles, cabs, heli
  const [originCity, setOriginCity] = useState('Bengaluru');
  const [selectedItem, setSelectedItem] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [travelDate, setTravelDate] = useState('2026-06-28');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Live Location State
  const [userLocationName, setUserLocationName] = useState('Detecting your live location...');
  const [userCoords, setUserCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locStatus, setLocStatus] = useState('locating');
  const [calculatedDistanceKm, setCalculatedDistanceKm] = useState(250);

  // Active Category Whole Journey Preset Data
  const currentCategoryJourney = categoryWholeJourneys[activeTab] || categoryWholeJourneys['whole_journey'] || {
    title: 'Multimodal Master Whole Journey',
    tag: 'RECOMMENDED COMBINATION',
    totalDuration: '5 hrs 20 mins',
    totalFare: 475,
    legs: []
  };

  // Auto-detect location on load
  const autoDetectLocation = () => {
    setLocStatus('locating');
    setUserLocationName('Accessing your device location...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setLocStatus('success');

          const distKm = getKmDistance(lat, lng, 13.6765, 79.3490);
          setCalculatedDistanceKm(distKm);

          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const cityName = data.address?.city || data.address?.state_district || data.address?.town || data.address?.county || 'Your City';
              setUserLocationName(data.display_name || `${cityName} (GPS Verified)`);

              const match = Object.keys(routeEstimates).find(c => cityName.toLowerCase().includes(c.toLowerCase()));
              if (match) {
                setOriginCity(match);
              }
            })
            .catch(() => {
              setUserLocationName(`GPS Pin: Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}`);
            });
        },
        () => {
          setLocStatus('error');
          setUserLocationName('Bengaluru (Default Reference Location)');
          setCalculatedDistanceKm(250);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocStatus('error');
      setUserLocationName('Bengaluru (Default Reference Location)');
    }
  };

  useEffect(() => {
    autoDetectLocation();
  }, []);

  const routeData = routeEstimates[originCity] || routeEstimates['Bengaluru'];

  const handleOpenBooking = (item) => {
    setSelectedItem(item);
  };

  const handleBookCategoryWholeJourney = () => {
    const masterPassItem = {
      name: `${currentCategoryJourney.title} (${originCity} ➔ Gopuram Gate 1)`,
      type: `${currentCategoryJourney.tag} (Door-to-Gopuram Pass)`,
      fare: currentCategoryJourney.totalFare
    };
    setSelectedItem(masterPassItem);
  };

  const handleConfirmProceedPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    setShowPaymentModal(false);
    const booking = {
      bookingId: `TS-TRV-${Math.floor(100000 + Math.random() * 900000)}`,
      item: selectedItem,
      passengers,
      travelDate,
      originCity,
      totalAmount: (selectedItem?.fare || selectedItem?.fixedAirportFare || 25) * passengers,
      paymentId: paymentDetails.paymentId
    };
    setConfirmedBooking(booking);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-8 text-white shadow-2xl border border-emerald-500/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5 animate-spin text-emerald-400" /> Universal Whole Journey Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Pilgrimage Travels (Door-to-Gopuram Whole Journey Logic Across All Categories)
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Whether you choose State RTC buses, suburban rail, share autos, EV shuttles, prepaid cabs, or helicopters, view your complete 4-leg journey from your live location pin to the deity shrine entrance.
          </p>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* LIVE LOCATION GEO BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-2xl shrink-0 mt-0.5">
              <Crosshair className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-0.5">YOUR LIVE LOCATION DETECTED</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {locStatus === 'locating' && <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />}
                {locStatus === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                {locStatus === 'error' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                <span className="truncate max-w-lg">{userLocationName}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Calculated Door-to-Gopuram Distance: <strong className="text-emerald-500 font-mono font-bold">{calculatedDistanceKm} km</strong>
              </p>
            </div>
          </div>

          <button
            onClick={autoDetectLocation}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${locStatus === 'locating' ? 'animate-spin' : ''}`} />
            Refresh Location
          </button>
        </div>

        {/* Selected Origin Hub Picker */}
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-slate-500 font-bold">Select Origin Home City Hub:</span>
          <select
            value={originCity}
            onChange={(e) => setOriginCity(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none"
          >
            {Object.keys(routeEstimates).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Transport Mode Category Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('whole_journey')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'whole_journey'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-950 animate-pulse" /> 🎯 Whole Journey (Multimodal)
        </button>

        <button
          onClick={() => setActiveTab('public_bus')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'public_bus'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bus className="h-4 w-4" /> State RTC Public Buses
        </button>

        <button
          onClick={() => setActiveTab('public_train')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'public_train'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Landmark className="h-4 w-4" /> Local Passenger Trains
        </button>

        <button
          onClick={() => setActiveTab('public_auto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'public_auto'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Navigation className="h-4 w-4" /> Shared Public Autos
        </button>

        <button
          onClick={() => setActiveTab('shuttles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'shuttles'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="h-4 w-4 text-amber-400" /> EV Gopuram Shuttles
        </button>

        <button
          onClick={() => setActiveTab('cabs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'cabs'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Car className="h-4 w-4" /> Prepaid Cabs
        </button>

        <button
          onClick={() => setActiveTab('heli')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'heli'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-300" /> Helicopter Yatra
        </button>
      </div>

      {/* UNIVERSAL CATEGORY-SPECIFIC WHOLE JOURNEY ENGINE (Rendered for ALL Tabs) */}
      <div className="space-y-6">
        {/* Summary Metrics Bar for Selected Category */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Category Route Distance</span>
            <strong className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">{calculatedDistanceKm} km</strong>
            <span className="block text-[10px] text-slate-400 mt-1">From {userLocationName ? (userLocationName.includes(',') ? userLocationName.split(',')[0] : userLocationName) : 'Your Location'}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Total Travel Duration</span>
            <strong className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">{currentCategoryJourney.totalDuration}</strong>
            <span className="block text-[10px] text-slate-400 mt-1">4 Step Journey</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Whole Journey Combined Fare</span>
            <strong className="text-xl font-extrabold text-emerald-500 font-sans">₹{currentCategoryJourney.totalFare}</strong>
            <span className="block text-[10px] text-slate-400 mt-1">Per Devotee (All 4 Steps)</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
            <button
              onClick={handleBookCategoryWholeJourney}
              className="w-full h-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Reserve Whole Journey Pass
            </button>
          </div>
        </div>

        {/* 4-STEP CATEGORY-SPECIFIC WHOLE JOURNEY FLOW */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">{currentCategoryJourney.tag}</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentCategoryJourney.title} (Door-to-Gopuram)</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">Origin: {originCity}</span>
          </div>

          <div className="space-y-4 relative">
            {currentCategoryJourney.legs.map((leg) => (
              <div key={leg.step} className="relative flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-extrabold text-base shrink-0">
                  {leg.modeIcon}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{leg.title}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-500">₹{leg.fare}</span>
                  </div>
                  <p className="text-xs text-slate-500">{leg.details}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Distance: <strong>{leg.distance}</strong></span>
                    <span>Est. Duration: <strong>{leg.duration}</strong></span>
                    <span>Provider: <strong>{leg.provider}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleBookCategoryWholeJourney}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Book Full {currentCategoryJourney.title} Pass (₹{currentCategoryJourney.totalFare}) <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL SERVICES LISTINGS BELOW WHOLE JOURNEY BREAKDOWN */}
      {activeTab === 'public_bus' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Individual State RTC Public Bus Listings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicBusList.map(bus => (
              <div key={bus.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{bus.name}</h4>
                <p className="text-xs text-slate-500">{bus.route}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-emerald-500">₹{bus.fare}</span>
                  <button onClick={() => handleOpenBooking(bus)} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                    Get Bus Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'public_train' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Individual Suburban Passenger Rail Connections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicTrainList.map(t => (
              <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{t.name}</h4>
                <p className="text-xs text-slate-500">{t.route}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-blue-500">₹{t.fare}</span>
                  <button onClick={() => handleOpenBooking(t)} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                    Book Rail Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'public_auto' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Individual Shared Public Auto Stands</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicAutoList.map(a => (
              <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{a.name}</h4>
                <p className="text-xs text-slate-500">{a.route}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-saffron">₹{a.fare}</span>
                  <button onClick={() => handleOpenBooking(a)} className="bg-saffron text-slate-950 font-bold px-4 py-2 rounded-xl text-xs">
                    Reserve Share Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shuttles' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Individual EV Gopuram Shuttle Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shuttlesList.map(s => (
              <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{s.name}</h4>
                <p className="text-xs text-slate-500">{s.route}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-emerald-500">₹{s.fare}</span>
                  <button onClick={() => handleOpenBooking(s)} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                    Book EV Shuttle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cabs' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Individual Prepaid Outstation Cab Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cabsList.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h4>
                <p className="text-xs text-slate-500">{c.type} • {c.capacity}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-purple-500">₹{c.fixedAirportFare}</span>
                  <button onClick={() => handleOpenBooking(c)} className="bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                    Reserve Cab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'heli' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">VIP Helicopter Yatra Services</h4>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
            {heliList.map(h => (
              <div key={h.id} className="flex justify-between items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{h.name}</h4>
                  <p className="text-xs text-slate-500">{h.helipad}</p>
                </div>
                <button onClick={() => handleOpenBooking(h)} className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs">
                  Book Heli Pass (₹{h.fare})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">WHOLE JOURNEY PASS RESERVATION</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.name}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1.5">Travel Date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={e => setTravelDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1.5">Number of Devotees</label>
                  <select
                    value={passengers}
                    onChange={e => setPassengers(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Devotee{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Departure From:</span>
                  <span className="text-slate-900 dark:text-white font-sans font-bold">{originCity}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Door-to-Gopuram Distance:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{calculatedDistanceKm} km</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Combined Fare:</span>
                  <span>₹{selectedItem.fare || selectedItem.fixedAirportFare || 25}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Devotee Quantity:</span>
                  <span>× {passengers}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span>Total End-to-End Fare:</span>
                  <span className="text-emerald-500">₹{((selectedItem.fare || selectedItem.fixedAirportFare || 25) * passengers).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedItem(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmProceedPayment} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1">
                Proceed to Checkout <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL INTEGRATION */}
      {showPaymentModal && selectedItem && (
        <PaymentGatewayModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          bookingDetails={{
            templeName: `Whole Journey: ${selectedItem.name}`,
            date: travelDate,
            timeSlot: `Door-to-Gopuram from ${originCity}`,
            visitors: passengers,
            category: selectedItem.type || 'Whole Journey Pass',
            totalAmount: (selectedItem.fare || selectedItem.fixedAirportFare || 25) * passengers
          }}
        />
      )}

      {/* CONFIRMED BOARDING PASS MODAL */}
      {confirmedBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6" />
            </div>

            <div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">WHOLE JOURNEY PASS ISSUED</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{confirmedBooking.item.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Pass ID: {confirmedBooking.bookingId}</p>
            </div>

            {/* QR Boarding Pass Component */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <TicketQR 
                bookingData={{
                  bookingId: confirmedBooking.bookingId,
                  templeName: confirmedBooking.item.name,
                  date: confirmedBooking.travelDate,
                  timeSlot: `Door-to-Gopuram (${confirmedBooking.originCity})`,
                  visitors: confirmedBooking.passengers,
                  category: confirmedBooking.item.type
                }}
              />
            </div>

            <button
              onClick={() => { setConfirmedBooking(null); setSelectedItem(null); }}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all"
            >
              Close & Save Boarding Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
