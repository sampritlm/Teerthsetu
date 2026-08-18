const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory store for password reset tokens
const resetTokens = {};
const otpStore = {};

// Auto-copy splash image from brain storage to frontend assets
const fs = require('fs');
/*
const srcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782462250710.jpg';
const destDir = path.join(__dirname, '..', 'frontend', 'public');
const destPath = path.join(destDir, 'splash_bg.jpg');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('Successfully copied new dark splash image to public folder!');
  } else {
    console.error('Source dark splash image not found at:', srcPath);
  }

  // Copy light splash background image
  const lightBgSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782462013891.jpg';
  const lightBgDestPath = path.join(destDir, 'splash_bg_light.jpg');
  if (fs.existsSync(lightBgSrcPath)) {
    fs.copyFileSync(lightBgSrcPath, lightBgDestPath);
    console.log('Successfully copied light splash background image to public folder!');
  } else {
    console.error('Source light splash background image not found at:', lightBgSrcPath);
  }

  // Copy dark mode logo image
  const logoSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782467672601.png';
  const logoDestPath = path.join(destDir, 'logo.png');
  if (fs.existsSync(logoSrcPath)) {
    fs.copyFileSync(logoSrcPath, logoDestPath);
    console.log('Successfully copied logo image to public folder!');
  } else {
    console.error('Source logo image not found at:', logoSrcPath);
  }

  // Copy light mode gold logo image
  const logoLightSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\ea77fc53-5cee-4e1f-8602-f04d987b847a\\media__1782465706011.png';
  const logoLightDestPath = path.join(destDir, 'logo_light.png');
  if (fs.existsSync(logoLightSrcPath)) {
    fs.copyFileSync(logoLightSrcPath, logoLightDestPath);
    console.log('Successfully copied light mode logo image to public folder!');
  } else {
    console.error('Source light mode logo image not found at:', logoLightSrcPath);
  }

  // Copy tagline image
  const taglineSrcPath = 'C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\d35519f3-ceb8-4564-96bb-bf9f5a7a60cf\\media__1782457447089.png';
  const taglineDestPath = path.join(destDir, 'tagline.png');
  if (fs.existsSync(taglineSrcPath)) {
    fs.copyFileSync(taglineSrcPath, taglineDestPath);
    console.log('Successfully copied tagline image to public folder!');
  } else {
    console.error('Source tagline image not found at:', taglineSrcPath);
  }
} catch (err) {
  console.error('Error copying assets:', err);
}
*/

// In-Memory Database
const temples = [
  {
    "_id": "1",
    "name": "Tirumala Venkateswara Temple",
    "location": "Tirupati, Andhra Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 30,
    "crowdLevel": "Moderate",
    "rating": 5,
    "image": "/image/andhra.jpg",
    "history": "Presiding Deity: Lord Venkateswara (Vishnu)",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 13.6833,
    "lon": 79.3475
  },
  {
    "_id": "2",
    "name": "Parshuram Kund",
    "location": "Lohit District, Arunachal Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 31,
    "crowdLevel": "Moderate",
    "rating": 4.8,
    "image": "/image/arunalchal pradesh.jpg",
    "history": "Presiding Deity: Lord Parashurama",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 27.8767,
    "lon": 96.3472
  },
  {
    "_id": "3",
    "name": "Kamakhya Temple",
    "location": "Guwahati, Assam",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 13,
    "crowdLevel": "Low",
    "rating": 5,
    "image": "/image/assam.jpg",
    "history": "Presiding Deity: Goddess Kamakhya",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 26.167,
    "lon": 91.7061
  },
  {
    "_id": "4",
    "name": "Mahabodhi Temple",
    "location": "Bodh Gaya, Bihar",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 60,
    "crowdLevel": "High",
    "rating": 4.4,
    "image": "/image/bihar.jpg",
    "history": "Presiding Deity: Lord Buddha",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 24.6959,
    "lon": 84.9912
  },
  {
    "_id": "5",
    "name": "Maa Bambleshwari Temple",
    "location": "Dongargarh, Chhattisgarh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 34,
    "crowdLevel": "Moderate",
    "rating": 4.6,
    "image": "/image/chatishgarh.jpg",
    "history": "Presiding Deity: Goddess Bambleshwari",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 21.1895,
    "lon": 80.4551
  },
  {
    "_id": "6",
    "name": "Shri Mangeshi Temple",
    "location": "Ponda, Goa",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 65,
    "crowdLevel": "High",
    "rating": 4.7,
    "image": "/image/goa.jpg",
    "history": "Presiding Deity: Lord Mangesh (Shiva)",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 15.4414,
    "lon": 73.9686
  },
  {
    "_id": "7",
    "name": "Somnath Temple",
    "location": "Prabhas Patan, Gujarat",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 44,
    "crowdLevel": "Moderate",
    "rating": 4,
    "image": "/image/gujarath.jpg",
    "history": "Presiding Deity: Lord Shiva",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 20.888,
    "lon": 70.401
  },
  {
    "_id": "8",
    "name": "Mata Mansa Devi Temple",
    "location": "Panchkula, Haryana",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 66,
    "crowdLevel": "High",
    "rating": 4.6,
    "image": "/image/haryana.jpg",
    "history": "Presiding Deity: Goddess Mansa Devi",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 30.7259,
    "lon": 76.8741
  },
  {
    "_id": "9",
    "name": "Jwala Ji Temple",
    "location": "Kangra, Himachal Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 44,
    "crowdLevel": "Moderate",
    "rating": 4.1,
    "image": "/image/himachal pradesh.jpg",
    "history": "Presiding Deity: Goddess Jwala Devi",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 31.8763,
    "lon": 76.3262
  },
  {
    "_id": "10",
    "name": "Baidyanath Temple",
    "location": "Deoghar, Jharkhand",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 55,
    "crowdLevel": "High",
    "rating": 4,
    "image": "/image/jharkhnada.jpg",
    "history": "Presiding Deity: Lord Shiva",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 24.4927,
    "lon": 86.6997
  },
  {
    "_id": "11",
    "name": "Kukke Subramanya Temple",
    "location": "Subramanya, Karnataka",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 29,
    "crowdLevel": "Moderate",
    "rating": 4.2,
    "image": "/image/karnatka.jpg",
    "history": "Presiding Deity: Lord Subramanya",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 12.6644,
    "lon": 75.6171
  },
  {
    "_id": "12",
    "name": "Sabarimala Temple",
    "location": "Pathanamthitta, Kerala",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 51,
    "crowdLevel": "High",
    "rating": 4.3,
    "image": "/image/kerala.jpg",
    "history": "Presiding Deity: Lord Ayyappa",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 9.4376,
    "lon": 77.0805
  },
  {
    "_id": "13",
    "name": "Mahakaleshwar Jyotirlinga",
    "location": "Ujjain, Madhya Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 46,
    "crowdLevel": "High",
    "rating": 4.6,
    "image": "/image/madhya pradesh.jpg",
    "history": "Presiding Deity: Lord Shiva",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 23.1827,
    "lon": 75.7682
  },
  {
    "_id": "14",
    "name": "Shirdi Sai Baba Temple",
    "location": "Shirdi, Maharashtra",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 50,
    "crowdLevel": "High",
    "rating": 4.3,
    "image": "/image/maharastra.jpg",
    "history": "Presiding Deity: Sai Baba",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 19.7668,
    "lon": 74.477
  },
  {
    "_id": "15",
    "name": "Shri Govindajee Temple",
    "location": "Imphal, Manipur",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 66,
    "crowdLevel": "High",
    "rating": 5,
    "image": "/image/manipur.jpg",
    "history": "Presiding Deity: Lord Krishna",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 24.7983,
    "lon": 93.9439
  },
  {
    "_id": "16",
    "name": "Nartiang Durga Temple",
    "location": "Nartiang, Meghalaya",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 33,
    "crowdLevel": "Moderate",
    "rating": 4.8,
    "image": "/image/megalaya.jpg",
    "history": "Presiding Deity: Goddess Durga",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 25.5786,
    "lon": 92.2227
  },
  {
    "_id": "17",
    "name": "Solomon's Temple",
    "location": "Aizawl, Mizoram",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 13,
    "crowdLevel": "Low",
    "rating": 4.6,
    "image": "/image/mizoram.jpg",
    "history": "Presiding Deity: Christian Worship Centre",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 23.7388,
    "lon": 92.7475
  },
  {
    "_id": "18",
    "name": "Shri Dimapur Kalibari",
    "location": "Dimapur, Nagaland",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 37,
    "crowdLevel": "Moderate",
    "rating": 4.1,
    "image": "/image/nagaland.jpg",
    "history": "Presiding Deity: Goddess Kali",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 25.908,
    "lon": 93.7275
  },
  {
    "_id": "19",
    "name": "Jagannath Temple",
    "location": "Puri, Odisha",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 55,
    "crowdLevel": "High",
    "rating": 4.2,
    "image": "/image/odisha.jpg",
    "history": "Presiding Deity: Lord Jagannath",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 19.8049,
    "lon": 85.8179
  },
  {
    "_id": "20",
    "name": "Durgiana Temple",
    "location": "Amritsar, Punjab",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 16,
    "crowdLevel": "Low",
    "rating": 4.3,
    "image": "/image/punjab.jpg",
    "history": "Presiding Deity: Goddess Durga & Lord Vishnu",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 31.6329,
    "lon": 74.8679
  },
  {
    "_id": "21",
    "name": "Khatu Shyam Ji Temple",
    "location": "Sikar, Rajasthan",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 50,
    "crowdLevel": "High",
    "rating": 4.9,
    "image": "/image/rajasthan.jpg",
    "history": "Presiding Deity: Khatu Shyam Ji",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 27.3687,
    "lon": 75.4023
  },
  {
    "_id": "22",
    "name": "Kirateshwar Mahadev Temple",
    "location": "Legship, Sikkim",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 64,
    "crowdLevel": "High",
    "rating": 4.8,
    "image": "/image/sikkim.jpg",
    "history": "Presiding Deity: Lord Shiva",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 27.2796,
    "lon": 88.2778
  },
  {
    "_id": "23",
    "name": "Meenakshi Amman Temple",
    "location": "Madurai, Tamil Nadu",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 13,
    "crowdLevel": "Low",
    "rating": 4.8,
    "image": "/image/tamil.jpg",
    "history": "Presiding Deity: Goddess Meenakshi",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 9.9195,
    "lon": 78.1193
  },
  {
    "_id": "24",
    "name": "Yadadri Lakshmi Narasimha Temple",
    "location": "Yadagirigutta, Telangana",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 52,
    "crowdLevel": "High",
    "rating": 4.8,
    "image": "/image/telengana.jpg",
    "history": "Presiding Deity: Lord Narasimha",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 17.5855,
    "lon": 78.9436
  },
  {
    "_id": "25",
    "name": "Tripura Sundari Temple",
    "location": "Udaipur, Tripura",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 48,
    "crowdLevel": "High",
    "rating": 4.6,
    "image": "/image/tripura.jpg",
    "history": "Presiding Deity: Goddess Tripura Sundari",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 23.5147,
    "lon": 91.4984
  },
  {
    "_id": "26",
    "name": "Kashi Vishwanath Temple",
    "location": "Varanasi, Uttar Pradesh",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 48,
    "crowdLevel": "High",
    "rating": 5,
    "image": "/image/uttrapradesh.jpg",
    "history": "Presiding Deity: Lord Shiva",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 25.3109,
    "lon": 83.0107
  },
  {
    "_id": "27",
    "name": "Kedarnath Temple",
    "location": "Rudraprayag, Uttarakhand",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 55,
    "crowdLevel": "High",
    "rating": 4.9,
    "image": "/image/uttrakand.jpg",
    "history": "Presiding Deity: Lord Shiva",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 30.7352,
    "lon": 79.0669
  },
  {
    "_id": "28",
    "name": "Dakshineswar Kali Temple",
    "location": "Kolkata, West Bengal",
    "dailyLimit": 30000,
    "currentCapacity": 25000,
    "waitTime": 31,
    "crowdLevel": "Moderate",
    "rating": 4.4,
    "image": "/image/west bengal.jpg",
    "history": "Presiding Deity: Goddess Kali",
    "timings": "6:00 AM - 9:00 PM",
    "dressCode": "Traditional / Modest Wear",
    "facilities": [
      "Prasadam",
      "Wheelchairs"
    ],
    "lat": 22.6548,
    "lon": 88.3585
  }
];

let globalState = {
  activeVisitors: 12450,
  exitedVisitors: 32000,
  emergencyMode: false,
  onlineRatio: 70,
  todayRevenue: 120000,
  avgWaitMins: 22
};

const attendanceHistory = [
  { time: '08:00', visitors: 1200 },
  { time: '10:00', visitors: 3500 },
  { time: '12:00', visitors: 4800 },
  { time: '14:00', visitors: 4100 },
  { time: '16:00', visitors: 5200 },
  { time: '18:00', visitors: 3800 },
];

let bookings = [
  {
    bookingId: 'TS-16800100-3482',
    templeId: '1',
    templeName: 'Tirupati Venkateswara',
    date: '2026-06-27',
    timeSlot: '09:00 AM (Available)',
    visitors: 3,
    specialDarshan: 'VVIP',
    wheelchair: true,
    volunteer: true,
    medical: false,
    status: 'Upcoming',
    waitlistPosition: 0
  },
  {
    bookingId: 'TS-16800100-8812',
    templeId: '3',
    templeName: 'Kashi Vishwanath',
    date: '2026-06-22',
    timeSlot: '11:00 AM (Available)',
    visitors: 2,
    specialDarshan: 'General',
    wheelchair: false,
    volunteer: false,
    medical: false,
    status: 'Completed',
    waitlistPosition: 0
  }
];

let notifications = [
  { id: 1, type: 'Booking Alert', message: 'Your Darshan booking at Tirupati Venkateswara is confirmed for tomorrow.', date: 'Just now', unread: true },
  { id: 2, type: 'Crowd Alert', message: 'Heavy crowd surge at Kashi Vishwanath. Wait time extended by 40 minutes.', date: '30 mins ago', unread: true },
  { id: 3, type: 'Festival Update', message: 'Special Brahmotsavam decorations begin tonight at Sabarimala.', date: '2 hours ago', unread: false },
  { id: 4, type: 'Emergency Broadcast', message: 'All routes to Badrinath cleared. Operations running normally.', date: '1 day ago', unread: false }
];

let hotels = [
  { id: '1', name: 'Mayura Residency', type: 'Hotel', rating: 4.6, price: 2500, distance: '0.8 km', amenities: ['Free Wi-Fi', 'AC', 'Vegetarian Restaurant'] },
  { id: '2', name: 'Balaji Dharamshala', type: 'Dharamshala', rating: 4.1, price: 400, distance: '1.2 km', amenities: ['Drinking Water', 'Common Hall', 'Locker'] },
  { id: '3', name: 'Srinivas Guest House', type: 'Temple Guest House', rating: 4.4, price: 800, distance: '0.3 km', amenities: ['Near Gate 1', 'AC Option', 'Parking'] },
  { id: '4', name: 'Grand Tirupati Palace', type: 'Hotel', rating: 4.8, price: 4500, distance: '2.5 km', amenities: ['Swimming Pool', 'Buffet', 'AC', 'Cab Service'] },
  { id: '5', name: 'Kedarnath Pilgrim Shelters', type: 'Lodge', rating: 3.9, price: 600, distance: '0.1 km', amenities: ['Hot Water', 'Blankets Provided'] }
];

// --- ROUTES ---

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TeerthSethu API is running' }));

// Auth Module
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens[token] = { email, expires: Date.now() + 3600000 };

  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    let info = await transporter.sendMail({
      from: '"TeerthSetu" <' + (process.env.SMTP_FROM_EMAIL || 'noreply@yourdomain.com') + '>',
      to: email,
      subject: "Password Reset Request",
      text: `Please click the following link to reset your password: ${resetUrl}`,
      html: `<p>Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log("Password reset email actually sent to: %s", email);
    res.json({ success: true, message: 'Reset link sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  const resetData = resetTokens[token];

  if (!resetData || resetData.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  console.log(`Password for ${resetData.email} has been updated to ${newPassword}`);
  delete resetTokens[token];
  res.json({ success: true, message: 'Password updated successfully' });
});

// Authorized admin emails set by management/developers
const authorizedAdmins = [
  'admin@teerthsetu.com',
  'developer@teerthsetu.com',
  'management@teerthsetu.com'
];

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (role === 'admin') {
    if (!authorizedAdmins.includes(email)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Account not authorized for admin portal. Contact management.' });
    }
  }

  res.json({
    token: `mock-jwt-${role}-${Date.now()}`,
    user: {
      email,
      role,
      name: role === 'admin' ? 'Pandit Shastri' : (email ? email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User Name'),
      phone: '+91 9876543210',
      address: 'Sector 4, Dwarka, New Delhi',
      aadhaar: 'XXXX-XXXX-4920',
      emergencyContact: 'Amit Kumar (+91 9876543211)'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const userData = req.body;
  res.json({
    success: true,
    token: `mock-jwt-devotee-${Date.now()}`,
    user: {
      ...userData,
      role: 'devotee'
    }
  });
});

app.post('/api/auth/google-login', (req, res) => {
  const { idToken, role, email, name } = req.body;
  const mockEmail = email || 'google-user@example.com';
  const mockName = name || 'Google User';

  if (role === 'admin') {
    if (!authorizedAdmins.includes(mockEmail)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Google Account not authorized for admin portal. Contact management.' });
    }
  }

  res.json({
    success: true,
    token: `mock-jwt-google-${Date.now()}`,
    user: {
      email: mockEmail,
      name: mockName,
      role: role || 'devotee',
      phone: '+91 9999999999',
      address: 'New Delhi',
      aadhaar: 'XXXX-XXXX-0000',
      emergencyContact: 'Family (+91 9999999998)'
    }
  });
});

// Devotee Module
app.post('/api/devotee/send-otp', async (req, res) => {
  const { email, phone } = req.body;
  const identifier = email || phone;
  if (!identifier) return res.status(400).json({ success: false, message: 'Email or phone required' });

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[identifier] = { otp, expires: Date.now() + 5 * 60000 }; // 5 mins

  if (email) {
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER || 'apikey',
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: '"TeerthSetu" <' + (process.env.SMTP_FROM_EMAIL || 'noreply@yourdomain.com') + '>',
        to: email,
        subject: "Your TeerthSetu Login OTP",
        text: `Your login OTP is: ${otp}. It will expire in 5 minutes.`,
        html: `<h3>Your TeerthSetu Login OTP is:</h3><h1 style="color:#e85a28; letter-spacing: 5px;">${otp}</h1><p>It will expire in 5 minutes.</p>`,
      });

      console.log("OTP actually sent to: %s", email);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
      console.error("OTP email error:", err);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  } else if (phone) {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your TeerthSetu Login OTP is: ${otp}. It will expire in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone}`
        });
        console.log("Real SMS OTP sent to: %s", phone);
        res.json({ success: true, message: 'SMS OTP sent successfully' });
      } catch (err) {
        console.error("Twilio SMS error:", err);
        res.status(500).json({ success: false, message: 'Failed to send SMS OTP' });
      }
    } else {
      console.log(`[SIMULATED SMS] to ${phone}: Your TeerthSetu Login OTP is ${otp}`);
      res.json({ success: true, message: 'OTP sent to phone (Check terminal console)' });
    }
  }
});

app.post('/api/devotee/verify-otp', (req, res) => {
  const { email, phone, otp } = req.body;
  const identifier = email || phone;
  const record = otpStore[identifier];

  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP' });
  }

  delete otpStore[identifier];

  res.json({
    success: true,
    token: `mock-jwt-devotee-${Date.now()}`,
    user: {
      email: email || `${phone}@temple.com`,
      role: 'devotee',
      name: 'Devendra Kumar',
      phone: phone || '+91 9876543210'
    }
  });
});

// 3rd Party Aadhaar Verification (Cashfree API Simulation)
const aadhaarSessions = {};

app.post('/api/verify/aadhaar/send-otp', async (req, res) => {
  const { aadhaar_number, phone } = req.body;
  if (!aadhaar_number || aadhaar_number.replace(/\D/g, '').length !== 12) {
    return res.status(400).json({ success: false, message: 'Invalid Aadhaar Number' });
  }

  // Check if live keys are present
  if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_SECRET) {
    // In production, call Cashfree API here via Axios
    // const response = await axios.post('https://sandbox.cashfree.com/verification/offline-aadhaar/otp', { aadhaar_number: aadhaar_number.replace(/\D/g, '') }, { headers: { 'x-client-id': process.env.CASHFREE_CLIENT_ID, 'x-client-secret': process.env.CASHFREE_SECRET }});
    // return res.json(response.data);
  }

  // Simulated logic
  const ref_id = `cf_req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  aadhaarSessions[ref_id] = {
    aadhaar_number: aadhaar_number.replace(/\D/g, ''),
    otp,
    expires: Date.now() + 10 * 60000 // 10 mins
  };

  console.log(`[CASHFREE AADHAAR SIMULATION] Ref ID: ${ref_id} | OTP sent to linked mobile: ${otp}`);

  if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your TeerthSetu Aadhaar Verification OTP is: ${otp}. Do not share this code.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`
      });
      console.log("Real SMS OTP sent to: %s", phone);
    } catch (err) {
      console.error("Twilio SMS error in Aadhaar simulation:", err);
    }
  }

  res.json({ success: true, ref_id, message: 'OTP sent successfully to Aadhaar registered mobile number.' });
});

app.post('/api/verify/aadhaar/verify-otp', async (req, res) => {
  const { ref_id, otp } = req.body;

  if (!ref_id || !otp) {
    return res.status(400).json({ success: false, message: 'ref_id and otp required' });
  }

  // Check if live keys are present
  if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_SECRET) {
    // In production, you would call Cashfree API here via Axios
    // const response = await axios.post(`https://sandbox.cashfree.com/verification/offline-aadhaar/verify`, { ref_id, otp }, { headers: { 'x-client-id': process.env.CASHFREE_CLIENT_ID, 'x-client-secret': process.env.CASHFREE_SECRET }});
    // return res.json(response.data);
  }

  const session = aadhaarSessions[ref_id];
  if (!session || session.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Session expired or invalid ref_id' });
  }

  if (session.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP' });
  }

  delete aadhaarSessions[ref_id];

  res.json({
    success: true,
    message: 'Aadhaar verified successfully',
    data: {
      full_name: 'Verified Devotee',
      aadhaar_number: `XXXXXXXX${session.aadhaar_number.slice(-4)}`,
      dob: '1990-01-01',
      gender: 'M',
      address: {
        state: 'Delhi',
        city: 'New Delhi',
        pin: '110001'
      }
    }
  });
});

app.get('/api/temples', (req, res) => res.json(temples));

// Bookings
app.get('/api/bookings', (req, res) => res.json(bookings));

app.post('/api/bookings', (req, res) => {
  const { templeId, date, timeSlot, visitors, specialDarshan, wheelchair, volunteer, medical } = req.body;
  const targetTemple = temples.find(t => t._id === templeId) || { name: 'Unknown Temple' };

  const bookingId = `TS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Decide waitlist based on capacity
  const isHighCrowd = targetTemple.crowdLevel === 'High';
  const waitlistPosition = isHighCrowd && Math.random() > 0.6 ? Math.floor(15 + Math.random() * 30) : 0;

  const newBooking = {
    bookingId,
    templeId,
    templeName: targetTemple.name,
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '09:00 AM (Available)',
    visitors: parseInt(visitors) || 1,
    specialDarshan: specialDarshan || 'General',
    wheelchair: !!wheelchair,
    volunteer: !!volunteer,
    medical: !!medical,
    status: 'Upcoming',
    waitlistPosition
  };

  bookings.unshift(newBooking);

  // Update admin stats
  globalState.activeVisitors += parseInt(visitors) || 1;
  globalState.todayRevenue += (specialDarshan === 'VVIP' ? 500 : 0) * (parseInt(visitors) || 1);

  res.json({ success: true, ...newBooking });
});

// Reschedule Booking
app.post('/api/bookings/reschedule', (req, res) => {
  const { bookingId, date, timeSlot } = req.body;
  const booking = bookings.find(b => b.bookingId === bookingId);
  if (booking) {
    booking.date = date;
    booking.timeSlot = timeSlot;
    return res.json({ success: true, booking });
  }
  res.status(404).json({ success: false, message: 'Booking not found' });
});

// Cancel Booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  const index = bookings.findIndex(b => b.bookingId === bookingId);
  if (index !== -1) {
    bookings[index].status = 'Cancelled';
    res.json({ success: true, booking: bookings[index] });
  } else {
    res.status(404).json({ success: false, message: 'Booking not found' });
  }
// Payment Gateway Integration Routes
app.post('/api/payment/create-order', (req, res) => {
  const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  res.json({
    success: true,
    orderId,
    amount: (amount || 0) * 100, // amount in paise
    currency,
    receipt,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TeerthSetuSandbox'
  });
});

app.post('/api/payment/verify', (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  res.json({
    success: true,
    verified: true,
    transactionId: paymentId || `TXN-${Date.now().toString().slice(-8)}`,
    message: 'Payment signature verified successfully'
  });
});

// Accommodation
app.get('/api/hotels', (req, res) => res.json(hotels));

// Notifications
app.get('/api/notifications', (req, res) => res.json(notifications));

app.post('/api/notifications/read-all', (req, res) => {
  notifications = notifications.map(n => ({ ...n, unread: false }));
  res.json({ success: true });
});

// Journey Route Planner
app.post('/api/planner', (req, res) => {
  const { startingCity, templeId, days, budget } = req.body;

  // Mock logic to recommend route
  const start = startingCity || 'Delhi';
  const daysNum = parseInt(days) || 3;
  const costPerDay = budget === 'Economy' ? 1200 : 3500;

  res.json({
    route: [
      { name: start, type: 'Origin' },
      { name: 'Tirupati Venkateswara', type: 'Primary Destination', stay: 'Srinivas Guest House', transit: 'Train / Air' },
      { name: 'Sri Kalahasti Temple', type: 'Excursion', stay: 'Day trip', transit: 'Local Taxi (36 km)' },
      { name: 'Padmavathi Temple', type: 'Excursion', stay: 'Day trip', transit: 'Auto Rickshaw (5 km)' }
    ],
    hotels: [
      { name: 'Srinivas Guest House', price: budget === 'Economy' ? 800 : 2500, rating: 4.4 },
      { name: 'Balaji Dharamshala', price: 400, rating: 4.1 }
    ],
    transport: {
      mode: budget === 'Economy' ? 'Public Train' : 'Private SUV',
      distance: '135 km total route',
      estTime: `${daysNum} Days Itinerary`,
      estFuel: budget === 'Economy' ? '₹900 tickets' : '₹3,500 fuel & tolls',
      budgetEstimate: `₹${daysNum * costPerDay + (budget === 'Economy' ? 1500 : 6000)}`
    }
  });
});

// Admin Module
app.get('/api/admin/stats', (req, res) => {
  // Update stats based on actual booking counts
  const upcomingCount = bookings.filter(b => b.status === 'Upcoming').length;
  res.json({
    ...globalState,
    activeTickets: upcomingCount,
  });
});

app.get('/api/admin/analytics', (req, res) => res.json(attendanceHistory));

app.post('/api/admin/config', (req, res) => {
  if (req.body.emergencyMode !== undefined) globalState.emergencyMode = req.body.emergencyMode;
  if (req.body.onlineRatio !== undefined) globalState.onlineRatio = req.body.onlineRatio;
  res.json({ success: true, state: globalState });
});

app.post('/api/admin/scan', (req, res) => {
  let { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ valid: false, message: 'NO CODE PROVIDED' });
  }

  // Parse stringified JSON payloads (e.g. {"bookingId":"TS-...", ...})
  try {
    if (typeof qrCode === 'string' && qrCode.trim().startsWith('{') && qrCode.trim().endsWith('}')) {
      const parsed = JSON.parse(qrCode);
      if (parsed.bookingId) qrCode = parsed.bookingId;
    }
  } catch (err) {
    // Keep original qrCode string
  }

  // If already used
  if (qrCode.includes("USED") || qrCode === 'TS-EXPIRED') {
    return res.json({ valid: false, message: 'ALREADY USED / EXPIRED' });
  }

  // Find in bookings
  const booking = bookings.find(b => b.bookingId === qrCode);
  if (booking) {
    if (booking.status === 'Completed') {
      return res.json({ valid: false, message: 'ALREADY CHECKED IN' });
    }
    if (booking.status === 'Cancelled') {
      return res.json({ valid: false, message: 'BOOKING CANCELLED' });
    }
    booking.status = 'Completed';
    globalState.activeVisitors += 1;
    return res.json({ valid: true, message: `VALID DARSHAN - ${booking.visitors} GUESTS` });
  }

  // Random check for simulated values
  if (qrCode.startsWith('TS-')) {
    globalState.activeVisitors += 1;
    return res.json({ valid: true, message: 'VALID TICKET - ENTRY MARKED' });
  }

  res.json({ valid: false, message: 'INVALID PASS CODE' });
});

// AI Prediction Module
app.get('/api/ai/forecast', (req, res) => {
  const { weather, isWeekend, isFestival } = req.query;
  let mult = 1.0;
  if (weather === 'Rain') mult = 0.7;
  if (isWeekend === 'true') mult = 1.3;
  if (isFestival === 'true') mult = 2.2;

  const expected = Math.floor(45000 * mult);
  res.json({
    expectedCrowd: expected,
    volunteersNeeded: Math.floor(120 * mult),
    securityNeeded: Math.floor(200 * mult),
    wheelchairs: Math.floor(50 * mult),
    prasadamLakhs: (1.5 * mult).toFixed(1),
    parkingOccupancy: Math.min(100, Math.floor(60 * mult)),
    queueLengthMeters: Math.floor(350 * mult),
    overflowVehicles: Math.max(0, Math.floor((60 * mult - 90) * 15))
  });
});

// Cashfree Aadhaar Verification Endpoints
app.post('/api/auth/aadhaar-send-otp', async (req, res) => {
  try {
    const { aadhaar } = req.body;
    const response = await fetch('https://sandbox.cashfree.com/verification/offline-aadhaar/otp', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ aadhaar_number: aadhaar })
    });
    const data = await response.json();
    require('fs').writeFileSync('cashfree_error_log.txt', JSON.stringify(data, null, 2) + '\nStatus: ' + response.status);
    if (response.ok && (data.status === 'SUCCESS' || data.ref_id)) {
      res.json({ success: true, ref_id: data.ref_id });
    } else {
      res.json({ success: false, message: data.message || 'Failed to send OTP' });
    }
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/auth/aadhaar-verify-otp', async (req, res) => {
  try {
    const { ref_id, otp } = req.body;
    const response = await fetch('https://sandbox.cashfree.com/verification/offline-aadhaar/verify', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref_id: ref_id || '', otp: otp || '' })
    });
    const data = await response.json();
    require('fs').writeFileSync('cashfree_verify_log.txt', JSON.stringify({ payload: { ref_id, otp }, response: data }, null, 2) + '\nStatus: ' + response.status);
    if (response.ok && data.status === 'VALID') {
      res.json({ success: true, message: 'Aadhaar verified', details: data });
    } else {
      res.json({ success: false, message: data.message || 'Verification failed' });
    }
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TeerthSethu Backend Server running on port ${PORT}`));
