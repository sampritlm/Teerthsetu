import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, QrCode, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, 
  RefreshCw, Upload, Volume2, VolumeX, ShieldAlert, Users, Clock, Zap, ArrowRight
} from 'lucide-react';

// Web Audio API beep sound generator
function playScanBeep(type = 'success') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'success') {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Low pitch error
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export default function GateQRScanner({ onScanSuccess }) {
  const [selectedGate, setSelectedGate] = useState('Gate 1 - Main Gopuram');
  const [inputCode, setInputCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle, scanning, success, warning, error
  const [scannedResult, setScannedResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('');
  const [scanLogs, setScanLogs] = useState([
    { id: 1, time: '12:02 PM', code: 'TS-16800100-3482', gate: 'Gate 1', status: 'VALID', pax: 3, cat: 'VVIP' },
    { id: 2, time: '11:45 AM', code: 'TS-16800100-8812', gate: 'Gate 1', status: 'ALREADY USED', pax: 2, cat: 'General' }
  ]);

  const [gateStats, setGateStats] = useState({
    totalScanned: 1420,
    validPasses: 1395,
    rejectedPasses: 25,
    gateRate: '420/hr'
  });

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start live WebCam feed
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        alert('Camera access permission denied or device camera not found.');
      }
    }
  };

  // Process code scanning
  const handleProcessScan = (codeToScan) => {
    let rawCode = codeToScan || inputCode;
    if (!rawCode || !rawCode.trim()) return;

    let bookingId = rawCode.trim();
    let parsedMetadata = null;

    // Decode stringified JSON QR codes
    try {
      if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
        parsedMetadata = JSON.parse(rawCode);
        if (parsedMetadata.bookingId) bookingId = parsedMetadata.bookingId;
      }
    } catch (e) {}

    setScanState('scanning');

    setTimeout(() => {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teerthsetu.onrender.com';
      
      fetch(baseUrl + '/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: bookingId, gate: selectedGate })
      })
      .then(res => res.json())
      .then(data => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (data.valid) {
          setScanState('success');
          setScanMessage(data.message || 'VALID PASS - GATE BARRIER UNLOCKED');
          if (soundEnabled) playScanBeep('success');

          const newLog = {
            id: Date.now(),
            time: timestamp,
            code: bookingId,
            gate: selectedGate,
            status: 'VALID',
            pax: parsedMetadata?.pax || 2,
            cat: parsedMetadata?.cat || 'Darshan Pass',
            message: data.message
          };

          setScannedResult(newLog);
          setScanLogs(prev => [newLog, ...prev.slice(0, 15)]);
          setGateStats(prev => ({
            ...prev,
            totalScanned: prev.totalScanned + 1,
            validPasses: prev.validPasses + 1
          }));

          if (onScanSuccess) onScanSuccess(newLog);

        } else {
          const isWarning = (data.message || '').includes('ALREADY') || (data.message || '').includes('CHECKED');
          const statusType = isWarning ? 'warning' : 'error';
          
          setScanState(statusType);
          setScanMessage(data.message || 'INVALID PASS CODE');
          if (soundEnabled) playScanBeep(statusType);

          const newLog = {
            id: Date.now(),
            time: timestamp,
            code: bookingId,
            gate: selectedGate,
            status: isWarning ? 'DUPLICATE' : 'REJECTED',
            pax: 0,
            cat: 'Invalid',
            message: data.message
          };

          setScannedResult(newLog);
          setScanLogs(prev => [newLog, ...prev.slice(0, 15)]);
          setGateStats(prev => ({
            ...prev,
            totalScanned: prev.totalScanned + 1,
            rejectedPasses: prev.rejectedPasses + 1
          }));
        }
      })
      .catch(err => {
        setScanState('error');
        setScanMessage('GATE COMMUNICATION ERROR');
        if (soundEnabled) playScanBeep('error');
      });
    }, 600);
  };

  // Upload image scanner file simulator
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate reading QR code from uploaded pass image
    const sampleCodes = ['TS-16800100-3482', 'TS-20260818-8472'];
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    setInputCode(randomCode);
    handleProcessScan(randomCode);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Top Header & Gate Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">QR Gate Security Checkpoint</h3>
          </div>
          <p className="text-slate-500 text-xs mt-1">Real-time gate barrier validation, scannable QR verification & queue analytics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Gate Selector */}
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-saffron"
          >
            <option value="Gate 1 - Main Gopuram">Gate 1 - Main Gopuram</option>
            <option value="Gate 2 - VVIP Entry">Gate 2 - VVIP Entry</option>
            <option value="Gate 3 - East Queue">Gate 3 - East Queue</option>
            <option value="Gate 4 - Spot Pass Gate">Gate 4 - Spot Pass Gate</option>
          </select>

          {/* Mute Audio Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Beep On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Checkpoint Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Checked-In</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">{gateStats.totalScanned}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Valid Entries</span>
          <span className="text-xl font-extrabold text-emerald-500 mt-1 block">{gateStats.validPasses}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">Flagged / Rejected</span>
          <span className="text-xl font-extrabold text-red-500 mt-1 block">{gateStats.rejectedPasses}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-saffron font-bold uppercase tracking-wider block">Scan Throughput</span>
          <span className="text-xl font-extrabold text-saffron mt-1 block">{gateStats.gateRate}</span>
        </div>
      </div>

      {/* Main Scanner Section Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Col: Optical Scanner / Viewfinder Frame */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-between min-h-[420px] relative overflow-hidden shadow-2xl">
          {/* Top Bar Status */}
          <div className="w-full flex items-center justify-between text-xs z-10">
            <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-slate-300 border border-slate-800 font-mono text-[10px] flex items-center gap-1.5">
              <Camera className="h-3 w-3 text-emerald-400" /> {selectedGate.toUpperCase()}
            </span>

            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              scanState === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              scanState === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              scanState === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              'bg-slate-800 text-slate-400'
            }`}>
              Turnstile Barrier: {scanState === 'success' ? 'OPEN' : 'LOCKED'}
            </span>
          </div>

          {/* WebCam Video Element */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover opacity-60 ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Viewfinder Target Frame */}
          <div className="my-auto text-center z-10 space-y-4 max-w-sm w-full">
            <AnimatePresence mode="wait">
              {scanState === 'idle' && (
                <motion.div key="idle" className="space-y-4">
                  {/* Viewfinder Box */}
                  <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-500/60 rounded-3xl relative flex items-center justify-center p-4 bg-emerald-950/10 backdrop-blur-xs group">
                    {/* Laser Scanner Animation */}
                    <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce top-1/2" />
                    
                    <QrCode className="h-24 w-24 text-emerald-400/80 group-hover:scale-105 transition-transform" />

                    {/* Corner Target Marks */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>

                  <span className="text-xs text-slate-300 block font-semibold">
                    Hold Darshan QR Pass in front of camera or scan via options below
                  </span>
                </motion.div>
              )}

              {scanState === 'scanning' && (
                <motion.div key="scanning" className="space-y-4">
                  <div className="w-14 h-14 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs text-emerald-400 block font-bold tracking-widest uppercase">
                    Decoding Digital Signature & Verifying Hash...
                  </span>
                </motion.div>
              )}

              {scanState === 'success' && (
                <motion.div key="success" className="space-y-4 bg-emerald-950/40 p-6 rounded-3xl border border-emerald-500/40 backdrop-blur-md">
                  <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-2xl font-extrabold text-emerald-400 tracking-wider">GATE BARRIER UNLOCKED</h4>
                  <p className="text-xs text-emerald-200 font-semibold">{scanMessage}</p>

                  <button
                    type="button"
                    onClick={() => setScanState('idle')}
                    className="py-2 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                  >
                    Scan Next Pilgrim Pass
                  </button>
                </motion.div>
              )}

              {scanState === 'warning' && (
                <motion.div key="warning" className="space-y-4 bg-amber-950/40 p-6 rounded-3xl border border-amber-500/40 backdrop-blur-md">
                  <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">
                    ⚠️
                  </div>
                  <h4 className="text-xl font-extrabold text-amber-400">DUPLICATE PASS ATTEMPT</h4>
                  <p className="text-xs text-amber-200 font-semibold">{scanMessage}</p>

                  <button
                    type="button"
                    onClick={() => setScanState('idle')}
                    className="py-2 px-6 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all"
                  >
                    Clear Gate Alert
                  </button>
                </motion.div>
              )}

              {scanState === 'error' && (
                <motion.div key="error" className="space-y-4 bg-red-950/40 p-6 rounded-3xl border border-red-500/40 backdrop-blur-md">
                  <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">
                    ✕
                  </div>
                  <h4 className="text-xl font-extrabold text-red-500">INVALID PASS REJECTED</h4>
                  <p className="text-xs text-red-300 font-semibold">{scanMessage}</p>

                  <button
                    type="button"
                    onClick={() => setScanState('idle')}
                    className="py-2 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Reset Checkpoint
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Camera / File Upload Options */}
          <div className="w-full flex flex-wrap items-center justify-center gap-3 z-10 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={toggleCamera}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                cameraActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <Camera className="h-4 w-4" /> {cameraActive ? 'Stop Live Camera' : 'Start WebCam Scanner'}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Upload className="h-4 w-4 text-saffron" /> Decode Ticket Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Right Col: Manual Override Input & Real-time Scan Ledger */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between shadow-sm space-y-6">
          <div>
            <h4 className="text-md font-bold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              Manual Override & Quick Presets
            </h4>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessScan();
              }} 
              className="flex gap-2 mb-4"
            >
              <input
                type="text"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-saffron"
                placeholder="Enter Booking ID (e.g. TS-16800100-3482)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button
                type="submit"
                className="bg-saffron hover:bg-[#e85a28] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all shrink-0"
              >
                Scan Code
              </button>
            </form>

            {/* Quick Test Preset Buttons */}
            <div className="space-y-2 mb-6">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Quick Test Scans:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputCode('TS-16800100-3482');
                    handleProcessScan('TS-16800100-3482');
                  }}
                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-mono font-bold"
                >
                  ✓ Valid VVIP: TS-16800100-3482
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dynamicId = `TS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
                    setInputCode(dynamicId);
                    handleProcessScan(dynamicId);
                  }}
                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-mono font-bold"
                >
                  ⚡ Dynamic Spot Code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputCode('TS-16800100-8812');
                    handleProcessScan('TS-16800100-8812');
                  }}
                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-mono font-bold"
                >
                  ⚠️ Used Pass: TS-16800100-8812
                </button>
              </div>
            </div>

            {/* Real-time Check-in Log Ledger */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Gate Scan Ledger
                </h5>
                <span className="text-[10px] text-slate-400 font-mono">Live Activity Log</span>
              </div>

              <div className="space-y-2 font-mono text-[10px] max-h-56 overflow-y-auto pr-1">
                {scanLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border flex justify-between items-start transition-all ${
                      log.status === 'VALID'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                        : log.status === 'DUPLICATE'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{log.code}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        {log.gate} • {log.status} ({log.pax ? `${log.pax} Pax` : 'Denied'})
                      </div>
                    </div>
                    <span className="text-[9px] opacity-70 font-sans">{log.time}</span>
                  </div>
                ))}

                {scanLogs.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No scan activity recorded for this session.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
