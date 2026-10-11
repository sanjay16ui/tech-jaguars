import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, ShieldCheck, HelpCircle, ArrowRight, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bis_history') || '[]');
    setHistory(data);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('bis_history');
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-[#131127]/80 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h1 className="text-2xl font-extrabold text-white flex items-center">
          <Clock className="w-6 h-6 mr-3 text-cyan-400" />
          Search Telemetry Logs
        </h1>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center text-sm bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-500/30 px-4 py-2 rounded-lg font-medium transition"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Logs
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-[#131127]/80 backdrop-blur-md p-16 rounded-2xl border border-slate-800 text-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="bg-[#0B0A15] border border-slate-800 shadow-inner w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-300 mb-2 tracking-wide">No Telemetry Found</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Your verification log is empty. Check a product to populate this activity stream.</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)] transition">
            Initialize Search
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item, idx) => (
            <Link 
              key={idx} 
              to="/results" 
              state={{ result: item }}
              className="bg-[#131127]/80 backdrop-blur-md p-5 rounded-xl border border-purple-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-5">
                <div className={`p-4 rounded-xl flex-shrink-0 border shadow-inner ${
                  item.status === 'Verified' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  item.status === 'Needs manual review' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {item.status === 'Verified' ? <ShieldCheck className="w-6 h-6" /> :
                   item.status === 'Needs manual review' ? <HelpCircle className="w-6 h-6" /> :
                   <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-200 group-hover:text-cyan-400 transition">{item.query}</h3>
                  <p className="text-sm text-slate-500 flex items-center mt-1">
                    <span className={`font-medium mr-2 px-2 py-0.5 rounded text-xs ${
                      item.status === 'Verified' ? 'bg-green-500/10 text-green-400' :
                      item.status === 'Needs manual review' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {item.status}
                    </span> 
                    <span className="text-slate-600 px-2">•</span> 
                    <span className="text-slate-400 font-mono text-xs">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-4" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
