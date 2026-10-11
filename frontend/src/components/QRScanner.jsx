import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, Upload, Camera, XCircle, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [qrError, setQrError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const parseQRAndLookup = async (text) => {
    setLoading(true);
    try {
      // Is it a URL?
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const proceed = window.confirm(`This QR code contains a URL:\n${text}\n\nDo you want to visit this external link?`);
        if (proceed) {
          window.open(text, '_blank');
        }
        setLoading(false);
        return;
      }

      // Send the raw text to our lookup, let it extract CML/CRS/HUID
      const res = await axios.post(`${API_BASE}/api/lookup`, { query: text });
      
      // Save to history
      const currentHistory = JSON.parse(localStorage.getItem('bis_history') || '[]');
      currentHistory.unshift({ ...res.data, timestamp: new Date().toISOString() });
      localStorage.setItem('bis_history', JSON.stringify(currentHistory.slice(0, 50)));

      navigate('/results', { state: { result: res.data } });
    } catch (err) {
      console.error(err);
      setQrError('Failed to verify the QR code payload. Ensure the backend is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Success
          html5QrCode.stop().then(() => {
            setScanning(false);
            scannerRef.current = null;
            parseQRAndLookup(decodedText);
          }).catch(console.error);
        },
        (errorMessage) => {
          // parse errors ignore usually
        }
      ).catch(err => {
        console.error(err);
        setQrError('Camera access denied or unavailable. Please check browser permissions.');
        setScanning(false);
        scannerRef.current = null;
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      parseQRAndLookup(decodedText);
    } catch (err) {
      setQrError('No readable QR code found in the image. Please try a clearer image.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 pt-4">
      <div className="bg-[#131127]/90 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-purple-500/20 overflow-hidden relative p-8 text-center">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="inline-flex bg-cyan-500/10 border border-cyan-500/30 w-20 h-20 rounded-full items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <QrCode className="w-10 h-10 text-cyan-400" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-white tracking-wide mb-2">QR Code Scanner</h1>
        <p className="text-slate-400 max-w-lg mx-auto mb-8">
          Scan a product's QR code to extract identifiers (CM/L, HUID, CRS) and automatically verify them against the BIS Sentinel database.
        </p>

        {qrError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 flex items-center justify-center space-x-2 max-w-xl mx-auto">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{qrError}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          {!scanning ? (
            <button 
              onClick={() => { setQrError(''); setScanning(true); }}
              className="flex-1 w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Camera className="w-5 h-5 mr-2" />}
              {loading ? 'Processing...' : 'Start Camera Scan'}
            </button>
          ) : (
            <button 
              onClick={() => setScanning(false)}
              className="flex-1 w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Stop Scanning
            </button>
          )}

          <label className="flex-1 w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all bg-[#0B0A15] text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900/30 cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Upload QR Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </div>

        {/* Camera Container */}
        <div className={`mt-8 max-w-md mx-auto overflow-hidden rounded-2xl border-2 ${scanning ? 'border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'border-slate-800'}`}>
          <div id="reader" className={scanning ? 'block' : 'hidden'}></div>
        </div>
        <div id="reader-hidden" className="hidden"></div>
        
        <p className="mt-8 text-xs text-slate-500">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          A valid QR code does not guarantee a product is genuine. Data extracted from the QR code is checked against off-line standards and must be verified on the official BIS portal.
        </p>
      </div>
    </div>
  );
}
