import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, AlertCircle, ArrowLeft, ArrowRight, Tag, Download } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function Standards() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStandards = async (currentPage, currentSearch, currentCat) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/api/standards`, {
        params: { page: currentPage, limit: 12, search: currentSearch, category: currentCat }
      });
      setData(res.data.data);
      setTotal(res.data.total);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend dataset. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStandards(page, search, category);
    }, 400); // Debounce search
    return () => clearTimeout(delay);
  }, [page, search, category]);

  const totalPages = Math.ceil(total / 12) || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#131127]/90 p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-purple-400" />
            Standards Explorer
          </h1>
          <p className="text-slate-400 mt-2">Browse {total} official Indian Standards from the local cache.</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search IS numbers or titles..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-[#0B0A15] border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none w-full md:w-64"
            />
          </div>
          <select 
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-[#0B0A15] border border-slate-700 text-white px-4 py-2.5 rounded-xl focus:border-purple-400 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-red-400 flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          {error}
        </div>
      ) : loading && data.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-slate-800/50 h-48 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-[#131127] border border-slate-800 p-12 rounded-2xl text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Standards Found</h3>
          <p className="text-slate-400">Try adjusting your search or category filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((std, i) => (
              <div key={i} className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6 shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-cyan-500/20 text-cyan-400 font-mono font-bold px-3 py-1 rounded-lg border border-cyan-500/30">
                    {std.standard_number}
                  </span>
                  {std.year && <span className="text-slate-500 text-sm border border-slate-700 px-2 py-0.5 rounded">Reaffirmed {std.year}</span>}
                </div>
                <h3 className="text-white font-bold mb-3 flex-1 line-clamp-3" title={std.full_title}>{std.full_title}</h3>
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex flex-wrap gap-2">
                  <span className="flex items-center text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
                    <Tag className="w-3 h-3 mr-1" />
                    {std.product_category}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                    {std.scheme || "Scheme-I"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center items-center space-x-4 mt-8 bg-[#131127]/50 py-4 rounded-xl border border-slate-800">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-300 font-medium">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
