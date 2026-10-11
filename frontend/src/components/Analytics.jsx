import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Activity, ShieldCheck, ShieldAlert, HelpCircle, Scan, History } from 'lucide-react';

export default function Analytics() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('bis_history') || '[]');
    setHistory(loaded);
  }, []);

  const hasData = history.length > 0;

  // Synthesize data if none available, but clearly label it DEMO
  const demoHistory = [
    { status: 'Suspicious', query_type: 'ISI / CM/L Licence', time_checked: new Date(Date.now() - 1000000).toISOString() },
    { status: 'Could not verify', query_type: 'CRS R-Number', time_checked: new Date(Date.now() - 5000000).toISOString() },
    { status: 'Suspicious', query_type: 'Standard Search', time_checked: new Date(Date.now() - 8000000).toISOString() },
    { status: 'Officially Verified', query_type: 'ISI / CM/L Licence', time_checked: new Date(Date.now() - 15000000).toISOString() },
    { status: 'Inconclusive', query_type: 'Standard Search', time_checked: new Date(Date.now() - 25000000).toISOString() },
  ];

  const dataSource = hasData ? history : demoHistory;

  const totalChecks = dataSource.length;
  const verified = dataSource.filter(h => h.status === 'Officially Verified').length;
  const suspicious = dataSource.filter(h => h.status === 'Suspicious').length;
  const inconclusive = dataSource.filter(h => h.status === 'Inconclusive' || h.status === 'Could not verify').length;

  const typeData = [
    { name: 'ISI Licence', value: dataSource.filter(h => h.query_type?.includes('ISI')).length },
    { name: 'CRS R-Number', value: dataSource.filter(h => h.query_type?.includes('CRS')).length },
    { name: 'Standards', value: dataSource.filter(h => h.query_type?.includes('Standard')).length },
    { name: 'Other', value: dataSource.filter(h => !h.query_type?.includes('ISI') && !h.query_type?.includes('CRS') && !h.query_type?.includes('Standard')).length },
  ];
  
  const COLORS = ['#22d3ee', '#a855f7', '#f472b6', '#64748b'];

  const statusData = [
    { name: 'Verified', value: verified, fill: '#22c55e' },
    { name: 'Suspicious', value: suspicious, fill: '#ef4444' },
    { name: 'Inconclusive', value: inconclusive, fill: '#eab308' },
  ];

  // Group by day for the line chart (using simple formatting)
  const timeMap = {};
  dataSource.forEach(h => {
    if (!h.time_checked) return;
    const date = new Date(h.time_checked).toLocaleDateString();
    timeMap[date] = (timeMap[date] || 0) + 1;
  });
  const timeData = Object.keys(timeMap).map(k => ({ date: k, count: timeMap[k] })).reverse();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      {!hasData && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl text-yellow-400 flex items-center justify-center space-x-2">
          <Activity className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm tracking-wide">DEMO MODE: Showing synthetic data because you have no local verification history.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 flex items-center shadow-[0_0_20px_rgba(168,85,247,0.15)] transform transition hover:scale-105">
          <div className="bg-blue-500/20 p-4 rounded-xl mr-4"><History className="w-6 h-6 text-blue-400" /></div>
          <div><p className="text-sm text-slate-400 font-semibold">Total Checks</p><p className="text-2xl font-bold text-white">{totalChecks}</p></div>
        </div>
        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-green-500/30 p-6 flex items-center shadow-[0_0_20px_rgba(34,197,94,0.15)] transform transition hover:scale-105">
          <div className="bg-green-500/20 p-4 rounded-xl mr-4"><ShieldCheck className="w-6 h-6 text-green-400" /></div>
          <div><p className="text-sm text-slate-400 font-semibold">Verified</p><p className="text-2xl font-bold text-white">{verified}</p></div>
        </div>
        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 flex items-center shadow-[0_0_20px_rgba(239,68,68,0.15)] transform transition hover:scale-105">
          <div className="bg-red-500/20 p-4 rounded-xl mr-4"><ShieldAlert className="w-6 h-6 text-red-400" /></div>
          <div><p className="text-sm text-slate-400 font-semibold">Suspicious</p><p className="text-2xl font-bold text-white">{suspicious}</p></div>
        </div>
        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-6 flex items-center shadow-[0_0_20px_rgba(234,179,8,0.15)] transform transition hover:scale-105">
          <div className="bg-yellow-500/20 p-4 rounded-xl mr-4"><HelpCircle className="w-6 h-6 text-yellow-400" /></div>
          <div><p className="text-sm text-slate-400 font-semibold">Inconclusive</p><p className="text-2xl font-bold text-white">{inconclusive}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6 h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Search Type Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: '#0B0A15', border: '1px solid #334155' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-purple-500/20 p-6 h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Result Status Outcomes</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#0B0A15', border: '1px solid #334155' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131127]/80 backdrop-blur-md rounded-2xl border border-blue-500/20 p-6 h-[400px] lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Activity Timeline</h3>
          {timeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0B0A15', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={3} activeDot={{ r: 8, fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">Not enough timeline data to chart.</div>
          )}
        </div>
      </div>
    </div>
  );
}
