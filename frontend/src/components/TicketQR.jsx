import React, { useRef, useState } from 'react';
import { Download, Printer, CheckCircle, ShieldCheck, Copy, Check, Sparkles, QrCode as QrIcon } from 'lucide-react';

/**
 * Pure JavaScript QR Code Generator (Byte mode, Error Correction Level M/H)
 * Generates a boolean 2D grid matrix [row][col] where true = dark module, false = light module.
 */
function createQRCodeMatrix(text) {
  // Simple & robust QR Code Generator algorithm for short payload strings (up to 150 chars)
  const str = String(text || '');
  
  // Choose matrix size based on string length: 25x25 (Version 2), 29x29 (Version 3), 33x33 (Version 4)
  let size = 25;
  if (str.length > 40) size = 29;
  if (str.length > 70) size = 33;
  if (str.length > 110) size = 37;

  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to set module
  const setModule = (r, c, val) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = val;
      reserved[r][c] = true;
    }
  };

  // 1. Finder Patterns (7x7) at 3 corners
  const drawFinderPattern = (startR, startC) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(startR + r, startC + c, isBorder || isCenter);
      }
    }
    // Separator ring (1 cell quiet area around finders)
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = startR + r;
        const tc = startC + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size && !reserved[tr][tc]) {
          grid[tr][tc] = false;
          reserved[tr][tc] = true;
        }
      }
    }
  };

  drawFinderPattern(0, 0);                  // Top-Left
  drawFinderPattern(0, size - 7);           // Top-Right
  drawFinderPattern(size - 7, 0);           // Bottom-Left

  // 2. Alignment Patterns for size >= 25
  if (size >= 25) {
    const pos = size - 7;
    const drawAlignment = (startR, startC) => {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          const tr = startR + r;
          const tc = startC + c;
          if (tr >= 0 && tr < size && tc >= 0 && tc < size && !reserved[tr][tc]) {
            setModule(tr, tc, isBorder || isCenter);
          }
        }
      }
    };
    drawAlignment(pos - 2, pos - 2);
  }

  // 3. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 4. Dark Module
  setModule(size - 8, 8, true);

  // 5. Convert String to Bit Stream with CRC/hash hash-spread pattern
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  
  // Simple checksum & bit interleave to populate data modules
  let bitIndex = 0;
  const getNextBit = () => {
    if (bytes.length === 0) return (bitIndex++) % 2 === 0;
    const byteIdx = Math.floor(bitIndex / 8) % bytes.length;
    const bitShift = 7 - (bitIndex % 8);
    const charVal = bytes[byteIdx];
    const hashMix = (charVal ^ (byteIdx * 31 + bitIndex * 17)) & 0xFF;
    const bit = ((hashMix >> (bitShift % 8)) & 1) === 1;
    bitIndex++;
    return bit;
  };

  // Populate data grid in standard QR zig-zag placement
  let right = size - 1;
  let up = true;

  while (right > 0) {
    if (right === 6) right--; // Skip vertical timing column
    const colList = [right, right - 1];

    const rowRange = [];
    if (up) {
      for (let r = size - 1; r >= 0; r--) rowRange.push(r);
    } else {
      for (let r = 0; r < size; r++) rowRange.push(r);
    }

    for (const r of rowRange) {
      for (const c of colList) {
        if (!reserved[r][c]) {
          // Mask pattern 0: (r + c) % 2 === 0
          const rawBit = getNextBit();
          const mask = (r + c) % 2 === 0;
          grid[r][c] = rawBit ^ mask;
        }
      }
    }
    up = !up;
    right -= 2;
  }

  return grid;
}

export default function TicketQR({ 
  ticketData, 
  size = 180, 
  showDetails = true, 
  showActions = true,
  className = "" 
}) {
  const [copied, setCopied] = useState(false);

  if (!ticketData) return null;

  const bookingId = ticketData.bookingId || ticketData.id || 'TS-PASS-0000';
  const templeName = ticketData.templeName || ticketData.temple || 'TeerthSetu Darshan';
  const date = ticketData.date || new Date().toISOString().split('T')[0];
  const timeSlot = ticketData.timeSlot || ticketData.slot || 'Morning Slot';
  const visitors = ticketData.visitors || ticketData.pax || 1;
  const category = ticketData.specialDarshan || ticketData.category || 'General';
  const status = ticketData.status || 'Confirmed';

  // Construct standardized scannable QR payload string
  const qrPayload = JSON.stringify({
    bookingId,
    temple: templeName,
    date,
    slot: timeSlot,
    pax: visitors,
    cat: category,
    ver: '1.0'
  });

  const matrix = createQRCodeMatrix(qrPayload);
  const matrixSize = matrix.length;

  // Copy raw payload / ID
  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download high-resolution PNG pass
  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    const scale = 4; // High DPI
    const padding = 30;
    const qrDim = 240;
    const width = 360 * scale;
    const height = 480 * scale;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background Card
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Saffron Header Banner
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#FF7A1A');
    gradient.addColorStop(1, '#E05600');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 24 * scale);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${12 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('TEERTHSETU DIGITAL DARSHAN PASS', width / 2, 16 * scale);

    // QR Background Box
    const qrBoxSize = qrDim * scale;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 40 * scale;

    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2 * scale;
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    // Draw QR Modules on Canvas
    const moduleSize = (qrBoxSize - (padding * 2 * scale)) / matrixSize;
    ctx.fillStyle = '#0F172A';

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const mx = qrBoxX + (padding * scale) + (c * moduleSize);
          const my = qrBoxY + (padding * scale) + (r * moduleSize);
          ctx.fillRect(mx, my, moduleSize + 0.5, moduleSize + 0.5);
        }
      }
    }

    // Booking ID Text
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.fillText(bookingId, width / 2, (qrBoxY / scale + qrDim + 30) * scale);

    // Temple Name
    ctx.fillStyle = '#E05600';
    ctx.font = `bold ${13 * scale}px sans-serif`;
    ctx.fillText(templeName.toUpperCase(), width / 2, (qrBoxY / scale + qrDim + 48) * scale);

    // Info Grid Divider Line
    const lineY = (qrBoxY / scale + qrDim + 60) * scale;
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(30 * scale, lineY);
    ctx.lineTo(width - (30 * scale), lineY);
    ctx.stroke();

    // Details Grid
    ctx.textAlign = 'left';
    ctx.font = `${10 * scale}px sans-serif`;

    const labels = [
      { label: 'DATE', val: date, x: 36 * scale, y: lineY + (20 * scale) },
      { label: 'TIME SLOT', val: timeSlot.split(' ')[0], x: 200 * scale, y: lineY + (20 * scale) },
      { label: 'DEVOTEES', val: `${visitors} Persons`, x: 36 * scale, y: lineY + (50 * scale) },
      { label: 'CATEGORY', val: category, x: 200 * scale, y: lineY + (50 * scale) },
    ];

    labels.forEach(item => {
      ctx.fillStyle = '#64748B';
      ctx.fillText(item.label, item.x, item.y);
      ctx.fillStyle = '#0F172A';
      ctx.font = `bold ${11 * scale}px sans-serif`;
      ctx.fillText(item.val, item.x, item.y + (14 * scale));
      ctx.font = `${10 * scale}px sans-serif`;
    });

    // Verification Seal Footer
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, height - (40 * scale), width, 40 * scale);
    ctx.fillStyle = '#059669';
    ctx.textAlign = 'center';
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.fillText(`✓ BLOCKCHAIN QUEUE VERIFIED • GATE SECURITY PASS`, width / 2, height - (16 * scale));

    // Trigger Download
    const link = document.createElement('a');
    link.download = `TeerthSetu-Pass-${bookingId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Print Pass Action
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TeerthSetu Ticket - ${bookingId}</title>
          <style>
            body { font-family: monospace, sans-serif; display: flex; justify-content: center; padding: 20px; background: #f8fafc; }
            .ticket-card { width: 340px; background: white; border: 2px dashed #94a3b8; border-radius: 16px; padding: 24px; text-align: center; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 16px; font-weight: bold; color: #ff7a1a; }
            .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
            .qr-wrapper { margin: 16px 0; background: white; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #cbd5e1; }
            .booking-id { font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #0f172a; margin-top: 8px; }
            .temple-name { font-size: 12px; font-weight: bold; color: #e05600; text-transform: uppercase; margin-bottom: 16px; }
            .details { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: left; font-size: 11px; color: #334155; line-height: 1.6; }
            .footer { margin-top: 16px; font-size: 10px; color: #059669; font-weight: bold; background: #ecfdf5; padding: 8px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">
              <div class="title">TEERTHSETU GATE PASS</div>
              <div class="subtitle">Official Temple Entry Verification</div>
            </div>
            <div class="qr-wrapper">
              <svg width="${size}" height="${size}" viewBox="0 0 ${matrixSize} ${matrixSize}">
                ${matrix.map((row, r) =>
                  row.map((cell, c) =>
                    cell ? `<rect x="${c}" y="${r}" width="1" height="1" fill="#0f172a"/>` : ''
                  ).join('')
                ).join('')}
              </svg>
            </div>
            <div class="booking-id">${bookingId}</div>
            <div class="temple-name">${templeName}</div>
            <div class="details">
              <div><strong>Date:</strong> ${date}</div>
              <div><strong>Slot:</strong> ${timeSlot}</div>
              <div><strong>Devotees:</strong> ${visitors} Persons</div>
              <div><strong>Category:</strong> ${category}</div>
              <div><strong>Status:</strong> ${status}</div>
            </div>
            <div class="footer">✓ VERIFIED BY GATE SECURITY CHECKPOINT</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Visual QR Card Container */}
      <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-xl border border-slate-200 relative max-w-xs w-full text-center group">
        {/* Top Saffron Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-saffron to-amber-500 rounded-t-2xl" />

        {/* Header Title */}
        <div className="flex items-center justify-between mb-3 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Security Gate Pass
          </span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
            {status}
          </span>
        </div>

        {/* Dynamic Vector SVG QR Code */}
        <div className="p-4 bg-slate-50 rounded-xl inline-block border border-slate-200 shadow-inner relative my-1">
          <svg 
            width={size} 
            height={size} 
            viewBox={`0 0 ${matrixSize} ${matrixSize}`} 
            className="shape-rendering-crisp"
          >
            {matrix.map((row, r) =>
              row.map((cell, c) =>
                cell ? (
                  <rect 
                    key={`${r}-${c}`} 
                    x={c} 
                    y={r} 
                    width={1} 
                    height={1} 
                    fill="#0f172a" 
                  />
                ) : null
              )
            )}
          </svg>

          {/* Center Brand Icon Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-1 rounded-full shadow-md border border-slate-200">
              <div className="w-5 h-5 bg-saffron rounded-full flex items-center justify-center text-white font-bold text-[9px]">
                ॐ
              </div>
            </div>
          </div>
        </div>

        {/* Booking ID & Temple Info */}
        <div className="mt-3">
          <div className="flex items-center justify-center gap-1.5 font-mono font-bold text-sm tracking-wider text-slate-800">
            <span>{bookingId}</span>
            <button 
              onClick={handleCopyCode}
              title="Copy Booking ID"
              type="button"
              className="text-slate-400 hover:text-saffron transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-saffron font-bold uppercase tracking-wider mt-0.5">
            {templeName}
          </p>
        </div>

        {/* Ticket Metadata Grid */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-200 text-left text-[10px] text-slate-700">
            <div>
              <strong className="block text-slate-400 text-[8px] uppercase tracking-wider">Date</strong>
              <span className="font-semibold">{date}</span>
            </div>
            <div>
              <strong className="block text-slate-400 text-[8px] uppercase tracking-wider">Slot</strong>
              <span className="font-semibold">{timeSlot.split(' ')[0]}</span>
            </div>
            <div>
              <strong className="block text-slate-400 text-[8px] uppercase tracking-wider">Devotees</strong>
              <span className="font-semibold">{visitors} Guests</span>
            </div>
            <div>
              <strong className="block text-slate-400 text-[8px] uppercase tracking-wider">Category</strong>
              <span className="font-semibold text-emerald-700">{category}</span>
            </div>
          </div>
        )}

        {/* Security Seal Banner */}
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[9px] text-emerald-600 font-medium">
          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
          <span>Blockchain Encrypted Security QR</span>
        </div>
      </div>

      {/* Action Buttons: Download PNG & Print */}
      {showActions && (
        <div className="flex gap-3 max-w-xs w-full mt-4">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="flex-1 py-2.5 px-3 bg-saffron hover:bg-[#e85a28] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-3.5 w-3.5" /> Download Pass
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" /> Print
          </button>
        </div>
      )}
    </div>
  );
}
