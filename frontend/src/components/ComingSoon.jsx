import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-center py-20">
      <div className="inline-flex bg-purple-500/10 border border-purple-500/30 w-24 h-24 rounded-full items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <Clock className="w-12 h-12 text-purple-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-wide mb-4">Under Development</h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
        This feature is part of the BIS Sentinel roadmap and will be deployed in a future update. Our systems are currently integrating with the necessary official databases.
      </p>
      
      <Link 
        to="/" 
        className="inline-flex items-center text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 hover:bg-cyan-900/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] px-8 py-3 rounded-lg font-medium transition-all"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Return to Dashboard
      </Link>
    </div>
  );
}
