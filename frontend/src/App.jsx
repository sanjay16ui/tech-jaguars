import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Results from './components/Results';
import History from './components/History';
import Complaint from './components/Complaint';
import Education from './components/Education';
import IntroVideo from './components/IntroVideo';
import ComingSoon from './components/ComingSoon';
import Analytics from './components/Analytics';
import QRScanner from './components/QRScanner';
import Standards from './components/Standards';
import { playWarningBeep } from './utils/audio';

import { ShieldCheck, History as HistoryIcon, Home as HomeIcon, FileText, BookOpen, Bell, Settings, User, Search, Menu, X, Volume2, VolumeX, BarChart2, ScanLine, Play } from 'lucide-react';

function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    setIsMuted(sessionStorage.getItem('bis_audio_muted') === 'true');
  }, []);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    sessionStorage.setItem('bis_audio_muted', newState.toString());
  };

  const testSound = () => {
    if (!isMuted) {
      playWarningBeep();
    }
  };
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: HomeIcon },
    { path: '/qr-scan', name: 'QR Scanner', icon: ScanLine },
    { path: '/standards', name: 'Standards DB', icon: BookOpen },
    { path: '/education', name: 'Education', icon: BookOpen },
    { path: '/complaint', name: 'Complaints', icon: FileText },
    { path: '/history', name: 'History', icon: HistoryIcon },
    { path: '/analytics', name: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0A15] text-slate-200 flex flex-col md:flex-row font-sans selection:bg-purple-500/30">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#131127] border-b border-purple-500/20 z-40">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-white">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">BIS Sentinel</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button onClick={testSound} className="p-2 text-slate-400">
            <Play className="w-5 h-5" />
          </button>
          <button onClick={toggleMute} className="p-2 text-slate-400">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-[#131127] border-r border-purple-500/20 z-30 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="hidden md:flex items-center p-6 mb-4">
          <Link to="/" className="flex items-center space-x-3 text-2xl font-bold text-white">
            <ShieldCheck className="w-9 h-9 text-cyan-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wide">SENTINEL</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 md:py-0 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-purple-500/20 text-xs text-slate-500 text-center">
          <p>Independent Verification Tool</p>
          <p className="mt-1">© {new Date().getFullYear()} BIS Sentinel</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-[#0B0A15]/80 backdrop-blur-md border-b border-purple-500/10 flex items-center justify-between px-6 z-20">
          <div className="hidden md:flex items-center bg-[#131127] rounded-full px-4 py-2 border border-slate-800 w-96 focus-within:border-purple-500/50 focus-within:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search standards or history..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-200 placeholder-slate-500"
              disabled
            />
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <button 
              onClick={testSound}
              className="px-3 py-1.5 text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] rounded-full transition-all flex items-center space-x-2"
              title="Test Alert Sound"
            >
              <Play className="w-3 h-3" />
              <span>Test Sound</span>
            </button>
            <button onClick={toggleMute} className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-full hover:bg-slate-800" title={isMuted ? "Unmute Alerts" : "Mute Alerts"}>
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-full hover:bg-slate-800">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center border-2 border-[#0B0A15] shadow-[0_0_10px_rgba(34,211,238,0.3)] cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-[#0B0A15] via-[#0E0C1C] to-[#141028] relative">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('bis_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('bis_intro_played', 'true');
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/education" element={<Education />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/qr-scan" element={<QRScanner />} />
          <Route path="/standards" element={<Standards />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
