import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, FileText, Send, Loader2 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function Complaint() {
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      setError('Subject and details are required.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    const urls = evidenceUrls.split(',').map(u => u.trim()).filter(u => u);

    try {
      const res = await axios.post(`${API_BASE}/api/complaint/generate`, {
        subject,
        details,
        evidence_urls: urls
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Backend is not running. Please ensure the server is started.');
      } else {
        setError(err.response?.data?.detail || 'Failed to generate report.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-[#131127]/80 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center mb-2">
            <FileText className="w-6 h-6 mr-3 text-cyan-400" />
            Queries & Complaints Generator
          </h1>
          <p className="text-slate-400 text-sm">
            Collect your evidence and generate a formatted complaint report. You can use this draft to submit an official complaint to the Bureau of Indian Standards (BIS).
          </p>
        </div>
      </div>

      <div className="bg-[#131127]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Suspected fake ISI mark on water bottle"
              className="w-full px-4 py-3 bg-[#0B0A15] border border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition text-white placeholder-slate-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Complaint Details</label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue, product details, where you bought it, etc."
              rows={5}
              className="w-full px-4 py-3 bg-[#0B0A15] border border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition text-white placeholder-slate-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Evidence URLs (Optional, comma-separated)</label>
            <input 
              type="text"
              value={evidenceUrls}
              onChange={(e) => setEvidenceUrls(e.target.value)}
              placeholder="https://example.com/photo1.jpg, https://example.com/receipt.pdf"
              className="w-full px-4 py-3 bg-[#0B0A15] border border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition text-white placeholder-slate-600"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 text-red-400 border border-red-500/30 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center w-full shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
            Generate Draft Report
          </button>
        </form>
      </div>

      {report && (
        <div className="bg-[#131127]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Draft Generated Successfully</h2>
          </div>
          
          <div className="bg-[#0B0A15] p-6 rounded-xl border border-slate-800 shadow-inner mb-6">
            <pre className="whitespace-pre-wrap text-sm text-cyan-100 font-mono">{report.draft_report}</pre>
          </div>
          
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
            <p className="text-white font-medium mb-2">Next Steps:</p>
            <p className="text-slate-400 text-sm mb-6">
              Copy this draft and submit it through the official channels.
            </p>
            <a 
              href={report.official_submission_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/50 font-medium px-6 py-2.5 rounded-lg transition"
            >
              Submit to Official BIS Portal
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
