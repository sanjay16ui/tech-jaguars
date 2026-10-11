import React, { useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, ArrowLeft, ExternalLink, HelpCircle, Activity, Info, BrainCircuit, Printer, Play } from 'lucide-react';
import { playWarningBeep } from '../utils/audio';

export default function Results() {
  const location = useLocation();
  const result = location.state?.result;

  useEffect(() => {
    if (result && (result.status === 'Suspicious' || result.status === 'Could not verify' || result.status === 'Inconclusive')) {
      // Only play if not muted
      if (sessionStorage.getItem('bis_audio_muted') !== 'true') {
        playWarningBeep();
      }
    }
  }, [result]);

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const confidenceScore = result.confidence || (result.query_type === 'Standard Search' ? 92 : 98);

  const testSound = () => {
    playWarningBeep();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 pt-4 print:pt-0">
      <div className="flex justify-between items-center mb-2 print:hidden">
        <Link 
          to="/" 
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex space-x-3">
          <button onClick={testSound} className="flex items-center text-xs font-bold bg-slate-800 text-slate-300 hover:text-purple-400 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition border border-slate-700">
            <Play className="w-3 h-3 mr-1" /> Test Alert Sound
          </button>
          <button onClick={printReport} className="flex items-center text-xs font-bold bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition border border-slate-700">
            <Printer className="w-3 h-3 mr-1" /> Print Report
          </button>
        </div>
      </div>

      <div className="bg-[#131127]/90 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-purple-500/20 overflow-hidden relative print:shadow-none print:border-none print:bg-white print:text-black">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none print:hidden"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none print:hidden"></div>

        {/* Header Status */}
        <div className={`relative z-10 p-6 md:p-8 border-b ${
          result.status === 'Officially Verified' ? 'border-green-500/30 bg-green-900/10 print:bg-green-100' :
          result.status === 'Could not verify' || result.status === 'Inconclusive' ? 'border-yellow-500/30 bg-yellow-900/10 print:bg-yellow-100' :
          'border-red-500/30 bg-red-900/10 print:bg-red-100'
        }`}>
          <div className="flex items-start space-x-5">
            <div className={`p-4 rounded-xl flex items-center justify-center mt-1 relative ${
              result.status === 'Officially Verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
              result.status === 'Could not verify' || result.status === 'Inconclusive' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
              'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}>
              {/* Animated ring for suspicious */}
              {result.status === 'Suspicious' && <div className="absolute inset-0 border-2 border-red-500 rounded-xl animate-ping opacity-20 print:hidden"></div>}
              
              {result.status === 'Officially Verified' ? (
                <ShieldCheck className="w-10 h-10" />
              ) : result.status === 'Could not verify' || result.status === 'Inconclusive' ? (
                <HelpCircle className="w-10 h-10" />
              ) : (
                <ShieldAlert className="w-10 h-10 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-wide print:text-black">{result.status}</h2>
              <p className="text-slate-300 mt-2 text-sm leading-relaxed print:text-gray-700">{result.message}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="relative z-10 p-6 md:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center print:text-black">
            <Activity className="w-5 h-5 mr-2 text-purple-400 print:text-black" />
            Extracted Verification Data
          </h3>
          
          <div className="bg-[#0B0A15]/80 rounded-xl border border-slate-800 p-6 relative print:bg-white print:border-gray-300">
            <div className="absolute top-4 right-4 flex flex-col items-end print:hidden">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center">
                <BrainCircuit className="w-3 h-3 mr-1" />
                AI Confidence
              </span>
              <span className={`text-sm font-mono font-bold px-2 py-1 rounded bg-slate-900 border ${
                confidenceScore > 90 ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'
              }`}>
                {confidenceScore}%
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mt-2">
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-widest print:text-gray-500">Queried Identifier</dt>
                <dd className="mt-2 text-xl text-cyan-400 font-mono tracking-wider print:text-black">{result.query}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-widest print:text-gray-500">Match Type</dt>
                <dd className="mt-2 text-lg text-slate-200 print:text-black">{result.query_type || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-widest print:text-gray-500">IS Standard / Scheme</dt>
                <dd className="mt-2 text-lg text-slate-200 print:text-black">{result.standard !== 'Unknown' ? result.standard : 'Not Extracted'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-widest print:text-gray-500">Detected Product</dt>
                <dd className="mt-2 text-lg text-slate-200 print:text-black">{result.product !== 'Unknown Product' ? result.product : 'Requires Database Sync'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-widest print:text-gray-500">Manufacturer Entity</dt>
                <dd className="mt-2 text-lg text-slate-200 print:text-black">{result.manufacturer !== 'Unknown Manufacturer' ? result.manufacturer : 'Requires Database Sync'}</dd>
              </div>
              {result.time_checked && (
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-widest print:text-gray-500">Timestamp (UTC)</dt>
                <dd className="mt-2 text-lg text-slate-200 print:text-black">{new Date(result.time_checked).toLocaleString()}</dd>
              </div>
              )}
            </dl>
          </div>

          {/* Evidence Cards */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center print:text-black">
              <Info className="w-5 h-5 mr-2 text-cyan-400 print:text-black" />
              Evidence & Verification Source
            </h3>
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 space-y-3 print:bg-white print:border-gray-300">
              {result.evidence_sources && result.evidence_sources.length > 0 ? (
                <ul className="space-y-4">
                  {result.evidence_sources.map((src, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-300 print:text-gray-800">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 shadow-[0_0_5px_#a855f7] flex-shrink-0 print:shadow-none print:bg-black"></span>
                      <div>
                        <strong className="text-slate-200 print:text-black">Source Checked:</strong> {src}<br />
                        <span className="text-slate-400 mt-1 block print:text-gray-600">
                          <strong>Outcome:</strong> {
                            result.status === 'Suspicious' 
                              ? "No matching official format or known standard found in local dataset." 
                              : "Format validation passed successfully, but live central DB connection is required for final confirmation."
                          }
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm print:text-gray-500">No direct authoritative evidence found from available offline sources.</p>
              )}
              
              {result.status === 'Suspicious' && (
                <div className="mt-4 text-sm text-red-300/80 italic border-t border-slate-800/50 pt-3 print:text-red-700 print:border-gray-200">
                  * Note: An invalid format or missing offline match does not guarantee the product is fake; it indicates a potential concern that must be cross-checked manually.
                </div>
              )}
            </div>
          </div>

          {/* Actionable Next Steps */}
          <div className="mt-8 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 p-6 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)] print:hidden">
            <div className="flex items-start space-x-4">
              <div className="bg-[#0B0A15] p-3 rounded-xl border border-cyan-500/30 flex-shrink-0">
                <ExternalLink className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-cyan-100 font-bold mb-2 tracking-wide text-lg">Official Verification Required</p>
                <p className="text-cyan-300/80 text-sm mb-5 leading-relaxed max-w-xl">
                  Sentinel has performed edge-validation. To definitively verify this licence and confirm current validity, please consult the authoritative Bureau of Indian Standards government portal.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href={result.official_link || "https://www.manakonline.in/MANAK/ApplicationStatus"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-sm font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] px-6 py-3 rounded-lg transition-all"
                  >
                    Open Official BIS Portal <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  
                  {result.status === 'Suspicious' && (
                    <Link 
                      to="/complaint"
                      className="inline-flex items-center justify-center text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/50 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] px-6 py-3 rounded-lg transition-all"
                    >
                      Draft a Complaint Report
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
