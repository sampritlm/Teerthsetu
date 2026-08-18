import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Compass, Search, Filter, Phone, Clock, Star, 
  Landmark, Crosshair, CheckCircle, ArrowUpRight, Award, Zap, Heart, 
  ExternalLink, RefreshCw, AlertCircle, Globe, Utensils, ShoppingBag, ShieldAlert, Coffee
} from 'lucide-react';

// ==========================================
// CATEGORY 1: PLACES & FOOD NEARBY YOUR BOOKING (Tirupati Gopuram Gate 1)
// ==========================================
const nearbyBookingPlacesMaster = [
  {
    id: 'B-101',
    name: "Govinda's Sattvik Prasadam & Bhojanalaya",
    category: 'food',
    categoryName: 'Sattvik Food & Dining',
    distance: '150 meters',
    walkTime: '2 mins walk',
    rating: '4.95 ★ (Google Maps)',
    openStatus: 'OPEN NOW (6:00 AM - 10:30 PM)',
    address: 'Near East Gopuram Exit Gate 3, Tirumala',
    phone: '+91 877 224 4444',
    image: '🍲',
    entryFee: 'Thali ₹80 / Free Jal Sewa',
    features: ['100% Pure Ghee Meals', 'No Onion & No Garlic', 'Air Conditioned Dining', 'Clean RO Water'],
    description: 'Authentic South Indian temple thali prepared with pure desi ghee following traditional Vedic culinary guidelines.'
  },
  {
    id: 'B-102',
    name: 'Tirumala Heritage Pure Veg Dining',
    category: 'food',
    categoryName: 'Food & Refreshments',
    distance: '200 meters',
    walkTime: '3 mins walk',
    rating: '4.9 ★ (Google Maps)',
    openStatus: 'OPEN NOW (5:00 AM - 11:00 PM)',
    address: 'Car Street Commercial Complex #4, Tirumala',
    phone: '+91 877 224 5555',
    image: '☕',
    entryFee: 'Tiffins ₹40 - ₹80',
    features: ['Hot Filter Coffee', 'Crispy Masala Dosa', 'Fluffy Steamed Idli', 'Quick Devotee Service'],
    description: 'Popular vegetarian food hub offering hot filter coffee, fresh idli, vada, and ghee rava dosa for pilgrims.'
  },
  {
    id: 'B-103',
    name: 'Sri Krishna Annakut Free Bhojanalaya',
    category: 'food',
    categoryName: 'Free Temple Annadanam',
    distance: '300 meters',
    walkTime: '4 mins walk',
    rating: '4.98 ★ (Google Maps)',
    openStatus: 'OPEN (10:00 AM - 4:00 PM, 7:00 PM - 10:00 PM)',
    address: 'Matrusri Tarigonda Vengamamba Hall, Tirumala',
    phone: 'TTD Annadanam Desk',
    image: '🥣',
    entryFee: '100% Free Service',
    features: ['Free Unlimited Rice & Sambhar', 'Pure Desi Ghee Sweet', 'Seats 4,000 Devotees', 'Ultra Hygienic'],
    description: 'Grand official temple Annadanam hall serving free hot sattvik meals to thousands of devotees daily.'
  },
  {
    id: 'B-104',
    name: 'Sri Tulsi & Sacred Pooja Samagri Market',
    category: 'pooja',
    categoryName: 'Pooja Flower Bazaar',
    distance: '80 meters',
    walkTime: '1 min walk',
    rating: '4.85 ★ (Google Maps)',
    openStatus: 'OPEN 24/7',
    address: 'Queue Complex Gate 1 Lane, Tirumala',
    phone: 'Bazaar Association',
    image: '🌸',
    entryFee: 'Public Market',
    features: ['Fresh Lotus Garlands', 'Chandan & Kumkum', 'Brass Diya Lamps', 'Camphor Packs'],
    description: 'Vibrant traditional bazaar offering fresh holy flower garlands, tulsi leaves, and authentic puja offerings.'
  },
  {
    id: 'B-105',
    name: 'Official Free Cloakroom & Locker Station #4',
    category: 'cloakroom',
    categoryName: 'Cloakroom & Mobile Deposit',
    distance: '50 meters',
    walkTime: '1 min walk',
    rating: '4.9 ★ (Google Maps)',
    openStatus: 'OPEN 24/7',
    address: 'Opposite Security Checkpoint 1, Tirumala',
    phone: 'Temple Security Desk',
    image: '🎒',
    entryFee: 'Free Service',
    features: ['CCTV Storage', 'Mobile & Electronics Locker', 'Footwear Deposit', 'Token Counter'],
    description: 'Safe official deposit counter for mobile phones, cameras, leather bags, and footwear prior to queue entry.'
  },
  {
    id: 'B-106',
    name: 'Panchamrutam Devotional Gift Emporium',
    category: 'shopping',
    categoryName: 'Devotional Gift Shop',
    distance: '220 meters',
    walkTime: '3 mins walk',
    rating: '4.8 ★ (Google Maps)',
    openStatus: 'OPEN (8:00 AM - 9:30 PM)',
    address: 'Ring Road Commercial Complex #12, Tirumala',
    phone: '+91 877 224 8888',
    image: '🛍️',
    entryFee: 'Public Emporium',
    features: ['Panchaloha Brass Idols', 'Pure Sandalwood Paste', 'Rudraksha Malas', 'Spiritual Books'],
    description: 'Certified authentic brass idols, sandalwood paste, devotional artifacts, and spiritual souvenirs.'
  },
  {
    id: 'B-107',
    name: 'Red Cross Temple First-Aid & Medical Booth',
    category: 'medical',
    categoryName: 'Medical Emergency Desk',
    distance: '100 meters',
    walkTime: '1 min walk',
    rating: '5.0 ★ (Google Maps)',
    openStatus: 'EMERGENCY 24/7',
    address: 'Beside Ambulance Bay, Gate 2, Tirumala',
    phone: 'Emergency 108 / +91 877 224 0000',
    image: '🏥',
    entryFee: 'Free Medical Care',
    features: ['24/7 Doctor on Duty', 'Free Ambulance Service', 'Oxygen Supply', 'Blood Pressure Checkup'],
    description: 'Free round-the-clock medical desk with doctors, ambulance bay, and emergency first-aid station.'
  }
];

// ==========================================
// CATEGORY 2: SACRED TEMPLES TO VISIT NEARBY YOUR LOCATION (Live GPS)
// ==========================================
const nearbyLocationTemplesMaster = [
  {
    id: 'T-101',
    name: 'Sri Padmavathi Ammavari Temple',
    category: 'goddess',
    categoryName: 'Sacred Goddess Shrine',
    lat: 13.6158,
    lng: 79.4442,
    rating: '4.95 ★ (Google Maps)',
    openStatus: 'OPEN (5:00 AM - 9:00 PM)',
    address: 'Tiruchanur, 5 km from Railway Station',
    phone: '+91 877 227 7777',
    image: '🛕',
    entryFee: 'Free Darshan (₹100 Special)',
    features: ['Goddess Lakshmi Shrine', 'Holy Pushkarini Lotus Tank', 'Sattvik Prasadam', 'EV Bus Stop'],
    description: 'Sacred temple dedicated to Goddess Padmavathi, divine consort of Lord Venkateswara. A mandatory pilgrimage visit.'
  },
  {
    id: 'T-102',
    name: 'Kapila Theertham Shiva Cave Temple',
    category: 'shiva',
    categoryName: 'Ancient Shiva Cave Shrine',
    lat: 13.6497,
    lng: 79.4182,
    rating: '4.9 ★ (Google Maps)',
    openStatus: 'OPEN (5:00 AM - 8:00 PM)',
    address: 'Foot of Tirumala Hills, KT Road, Tirupati',
    phone: '+91 877 228 8888',
    image: '🛕',
    entryFee: 'Free Entry',
    features: ['Kapileswara Swamy Idol', 'Holy Mountain Waterfall', 'Cave Meditation Spot', 'Shoe Counter'],
    description: 'Ancient Shiva cave shrine situated at the foot of sacred hills where holy mountain water cascades into the temple tank.'
  },
  {
    id: 'T-103',
    name: 'Sri Govindaraja Swamy Temple',
    category: 'vishnu',
    categoryName: '12th Century Ancient Vishnu Shrine',
    lat: 13.6331,
    lng: 79.4172,
    rating: '4.92 ★ (Google Maps)',
    openStatus: 'OPEN (5:00 AM - 9:30 PM)',
    address: 'Heart of Tirupati Town, near Railway Station',
    phone: '+91 877 226 6666',
    image: '🛕',
    entryFee: 'Free Entry (₹50 Quick Queue)',
    features: ['Reclining Lord Vishnu Idol', '7-Tiered Rajagopuram', 'Ancient Chola Inscriptions', 'Ratha Mandapam'],
    description: 'Grand 12th-century ancient temple consecrated by Saint Ramanujacharya, featuring a towering 7-tiered entrance Gopuram.'
  },
  {
    id: 'T-104',
    name: 'Sri Kodandarama Swamy Temple',
    category: 'ram',
    categoryName: 'Historic Lord Rama Temple',
    lat: 13.6360,
    lng: 79.4230,
    rating: '4.88 ★ (Google Maps)',
    openStatus: 'OPEN (5:30 AM - 8:30 PM)',
    address: 'Kodandarama Street, Tirupati',
    phone: '+91 877 223 3333',
    image: '🛕',
    entryFee: 'Free Darshan',
    features: ['Sita Rama Lakshmana Idols', 'Chola & Vijayanagara Carvings', 'Annual Brahmotsavam', 'Daily Aarti'],
    description: 'Historic temple built by Vijayanagara kings commemorating Lord Rama, Sita, and Lakshmana’s return from Lanka.'
  },
  {
    id: 'T-105',
    name: 'Sri Kalahasteeswara Swamy Temple',
    category: 'shiva',
    categoryName: 'Sacred Vayu Lingam Kshethram',
    lat: 13.7498,
    lng: 79.6984,
    rating: '4.96 ★ (Google Maps)',
    openStatus: 'OPEN (6:00 AM - 9:00 PM)',
    address: 'Srikalahasti, 36 km from Tirupati',
    phone: '+91 8578 222 222',
    image: '🛕',
    entryFee: 'Free Entry (Rahu-Ketu Puja Ticket Available)',
    features: ['Vayu Lingam (Air Element)', 'Famous Rahu-Ketu Sarpadosha Puja', 'Swarnamukhi River Bank', 'Gnanaprasunamba Shrine'],
    description: 'Pancha Bhoota Sthalam representing Air (Vayu Element), world-renowned for Rahu-Ketu Sarpadosha निवारण Pujas.'
  },
  {
    id: 'T-106',
    name: 'Sri Kalyana Venkateswara Temple',
    category: 'vishnu',
    categoryName: 'Sacred Wedding Boon Temple',
    lat: 13.6180,
    lng: 79.3250,
    rating: '4.91 ★ (Google Maps)',
    openStatus: 'OPEN (5:30 AM - 8:00 PM)',
    address: 'Srinivasa Mangapuram, 12 km from Tirupati',
    phone: '+91 877 229 1111',
    image: '🛕',
    entryFee: 'Free Darshan (₹50 Special)',
    features: ['Post-Marriage Blessing Spot', 'Kalyanotsavam Hall', 'Peaceful Shrine Garden', 'Free Annadanam'],
    description: 'Sacred temple where Lord Venkateswara stayed after his divine marriage with Goddess Padmavathi. Grants marriage boons.'
  },
  {
    id: 'T-107',
    name: 'Sri Prasanna Venkateswara Swamy Temple',
    category: 'vishnu',
    categoryName: 'Abhaya Hastha Vishnu Shrine',
    lat: 13.5680,
    lng: 79.5210,
    rating: '4.89 ★ (Google Maps)',
    openStatus: 'OPEN (6:00 AM - 8:00 PM)',
    address: 'Appalayagunta, 16 km from Tirupati',
    phone: '+91 877 229 2222',
    image: '🛕',
    entryFee: 'Free Darshan',
    features: ['Abhaya Hastha Pose Deity', 'Anjaneya Swamy Sub-Shrine', 'Quiet Spiritual Atmosphere'],
    description: 'Unique Lord Venkateswara idol in Abhaya Hastha (blessing pose), worshipped for healing illnesses and peace.'
  },
  {
    id: 'T-108',
    name: 'Sri Bedi Anjaneya Swamy Temple',
    category: 'hanuman',
    categoryName: 'Sacred Hanuman Shrine',
    lat: 13.6762,
    lng: 79.3488,
    rating: '4.97 ★ (Google Maps)',
    openStatus: 'OPEN 24/7',
    address: 'Directly Opposite Main Gopuram Gate 1, Tirumala',
    phone: 'Temple Security Desk',
    image: '🛕',
    entryFee: 'Free Queue Entry',
    features: ['Handcuffed Hanuman Idol', 'Opposite Sacred Pushkarini', 'Daily Abhishekam', 'Camel & Flower Mandapam'],
    description: 'Sacred Hanuman shrine located right in front of the main temple gopuram where Hanuman stands with hands bound in devotion.'
  }
];

// Haversine Distance Helper in km
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) {
    return `${Math.round(d * 1000)} meters away`;
  }
  return `${d.toFixed(1)} km away`;
}

export default function DevoteeNearbyView() {
  const [nearbyCategory, setNearbyCategory] = useState('booking'); // 'booking' (Nearby Booking & Food) or 'location' (Nearby Temples to Visit)
  const [filterType, setFilterType] = useState('all'); // Filter pill state
  const [searchQuery, setSearchQuery] = useState('');

  // Device GPS Location State
  const [userCoords, setUserCoords] = useState({ lat: 13.6765, lng: 79.3490 });
  const [locationName, setLocationName] = useState('Accessing device GPS location...');
  const [locationStatus, setLocationStatus] = useState('locating'); // locating, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Request User Location automatically on load
  const requestUserLocation = () => {
    setLocationStatus('locating');
    setLocationName('Accessing your device location...');
    setErrorMessage('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationStatus('success');

          // Reverse Geocode
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const displayName = data.display_name || data.address?.suburb || data.address?.city || 'Your GPS Pin';
              setLocationName(displayName);
            })
            .catch(() => {
              setLocationName(`GPS Pin Verified (Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)})`);
            });
        },
        (err) => {
          console.warn("Geolocation permission error:", err);
          setLocationStatus('error');
          setErrorMessage('Location permission pending or disabled. Using Tirumala Gopuram reference coordinates.');
          setLocationName('Tirumala Gopuram Gate 1 Road (Reference GPS)');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      setLocationName('Tirumala Gopuram Gate 1 Road (Reference GPS)');
    }
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  // Compute calculated distance for each place
  const activeMasterList = nearbyCategory === 'booking' ? nearbyBookingPlacesMaster : nearbyLocationTemplesMaster;
  
  const computedPlaces = activeMasterList.map(place => {
    const refLat = nearbyCategory === 'booking' ? 13.6765 : userCoords.lat;
    const refLng = nearbyCategory === 'booking' ? 79.3490 : userCoords.lng;
    const distanceStr = place.distance ? place.distance : getHaversineDistance(refLat, refLng, place.lat, place.lng);
    return { ...place, distanceStr };
  });

  // Filter places based on search query and category pills
  const filteredPlaces = computedPlaces.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || place.category === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-saffron via-amber-700 to-amber-950 p-8 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 bg-black/20 border border-white/20 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5 text-gold animate-spin" /> Pilgrimage Geo-Intelligence Hub
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Nearby Suggestions Hub
          </h2>
          <p className="text-amber-100 text-sm leading-relaxed">
            Discover food dining, pure veg restaurants, and cloakrooms around your booked temple, or auto-detect your live location to find sacred temples to visit.
          </p>
        </div>

        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* TWO PRIMARY CATEGORY TABS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category 1: Nearby Your Booking */}
        <button
          onClick={() => { setNearbyCategory('booking'); setFilterType('all'); }}
          className={`p-6 rounded-3xl border text-left transition-all flex items-start gap-4 shadow-sm ${
            nearbyCategory === 'booking'
              ? 'bg-gradient-to-br from-saffron/15 via-amber-500/10 to-transparent border-saffron ring-2 ring-saffron/30 dark:bg-slate-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-saffron/50'
          }`}
        >
          <div className={`p-3.5 rounded-2xl shrink-0 ${nearbyCategory === 'booking' ? 'bg-saffron text-slate-950 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Utensils className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Nearby Your Booking</h3>
              {nearbyCategory === 'booking' && (
                <span className="text-[10px] bg-saffron/20 text-saffron border border-saffron/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  ACTIVE BOOKING
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Places & food dining surrounding your booked temple (<strong className="text-slate-800 dark:text-slate-200">Tirupati Gopuram Gate 1</strong>): Sattvik Bhojanalayas, pure veg restaurants, pooja bazaars & cloakrooms.
            </p>
          </div>
        </button>

        {/* Category 2: Nearby Your Location */}
        <button
          onClick={() => { setNearbyCategory('location'); setFilterType('all'); }}
          className={`p-6 rounded-3xl border text-left transition-all flex items-start gap-4 shadow-sm ${
            nearbyCategory === 'location'
              ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-slate-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className={`p-3.5 rounded-2xl shrink-0 ${nearbyCategory === 'location' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Landmark className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">2. Nearby Your Location</h3>
              {nearbyCategory === 'location' && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  LIVE GPS TEMPLES
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sacred temples & deity shrines to visit near your current live device GPS pin (<strong className="text-slate-800 dark:text-slate-200">{locationName.split(',')[0]}</strong>).
            </p>
          </div>
        </button>
      </div>

      {/* GPS BAR FOR CATEGORY 2 */}
      {nearbyCategory === 'location' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-mono">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-emerald-500 shrink-0 animate-bounce" />
            <span>Active Device GPS Pin: <strong>{locationName}</strong></span>
          </div>
          <button
            onClick={requestUserLocation}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold font-sans transition-all flex items-center gap-1 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${locationStatus === 'locating' ? 'animate-spin' : ''}`} />
            Refresh GPS
          </button>
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              nearbyCategory === 'booking'
                ? "Search food dining, pure veg restaurants, prasadam, cloakrooms near your booked temple..."
                : "Search sacred temples, Vishnu shrines, Shiva cave temples near your live location..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-saffron"
          />
        </div>

        {/* Category Pills (Dynamic based on selected main category) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          {nearbyCategory === 'booking' ? (
            [
              { id: 'all', label: 'All Places' },
              { id: 'food', label: '🍲 Food & Restaurants' },
              { id: 'pooja', label: '🌸 Pooja Samagri' },
              { id: 'cloakroom', label: '🎒 Cloakrooms & Shoes' },
              { id: 'shopping', label: '🛍️ Gift Shops' },
              { id: 'medical', label: '🏥 Medical Booths' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all text-xs font-bold ${
                  filterType === f.id
                    ? 'bg-saffron text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))
          ) : (
            [
              { id: 'all', label: '🛕 All Temples' },
              { id: 'vishnu', label: '🕉️ Vishnu Shrines' },
              { id: 'shiva', label: '🔱 Shiva Temples' },
              { id: 'goddess', label: '🌺 Goddess Temples' },
              { id: 'ram', label: '🏹 Lord Rama Temples' },
              { id: 'hanuman', label: '🚩 Hanuman Shrines' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all text-xs font-bold ${
                  filterType === f.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* CARDS DISPLAY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map(place => {
          const mapsDirUrl = place.lat && place.lng
            ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${encodeURIComponent(place.name)}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`;

          return (
            <div
              key={place.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-saffron/50 transition-all shadow-sm group"
            >
              <div className="space-y-3">
                {/* Header: Icon, Category & Distance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">{place.image}</span>
                    <div>
                      <span className="text-[10px] text-saffron font-bold uppercase tracking-wider block">{place.categoryName}</span>
                      <span className="text-xs font-extrabold text-amber-500">{place.rating}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 block">
                      📍 {place.distanceStr}
                    </span>
                  </div>
                </div>

                {/* Title & Address */}
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-saffron transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 leading-snug">
                    <MapPin className="h-3.5 w-3.5 text-saffron shrink-0" /> {place.address}
                  </p>
                </div>

                {/* Price / Entry & Open Hours */}
                <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <span>Price / Entry: <strong className="text-emerald-500 font-sans">{place.entryFee}</strong></span>
                  <span>{place.openStatus}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {place.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-500">
                  {place.features.map((feat, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar: Google Maps Directions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-slate-400 font-mono">TEL: {place.phone}</span>

                <a
                  href={mapsDirUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-saffron hover:bg-amber-500 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-saffron/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Navigation className="h-4 w-4" /> Get Directions <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Compass className="h-12 w-12 mx-auto mb-2 text-slate-400 opacity-50" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No places match your search filter</p>
          <p className="text-xs text-slate-500 mt-1">Try switching category tabs or clearing your search term.</p>
        </div>
      )}
    </div>
  );
}
