import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ScanLine,
  BookOpen,
  Camera,
  FileText,
  Activity,
  ShieldCheck,
  History as HistoryIcon,
  GraduationCap,
  Users,
  Building,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE } from "../config/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageData, setImageData] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    official: "Unavailable",
    flagged: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadedHistory = JSON.parse(
      localStorage.getItem("bis_history") || "[]",
    );
    setHistory(loadedHistory);

    const pending = loadedHistory.filter(
      (h) => h.status === "Could not verify",
    ).length;
    const flagged = loadedHistory.filter(
      (h) => h.status === "Suspicious",
    ).length;

    setStats({
      total: loadedHistory.length,
      pending,
      official: "Requires Sync",
      flagged,
    });

    if (loadedHistory.length > 0) {
      const dates = {};
      loadedHistory.forEach((item) => {
        if (!item.time_checked && !item.timestamp) return;
        const d = new Date(
          item.time_checked || item.timestamp,
        ).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        dates[d] = (dates[d] || 0) + 1;
      });
      const data = Object.keys(dates)
        .map((date) => ({ name: date, checks: dates[date] }))
        .reverse()
        .slice(0, 7);
      setChartData(
        data.length > 0
          ? data
          : [{ name: "Today", checks: loadedHistory.length }],
      );
    } else {
      setChartData([{ name: "No Data", checks: 0 }]);
    }
  }, []);

  const handleSearch = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const q = directQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/lookup`, { query: q });

      const currentHistory = JSON.parse(
        localStorage.getItem("bis_history") || "[]",
      );
      currentHistory.unshift({
        ...res.data,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(
        "bis_history",
        JSON.stringify(currentHistory.slice(0, 50)),
      );

      navigate("/results", { state: { result: res.data } });
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError(
          "Backend is not running. Please ensure the server is started.",
        );
      } else {
        setError(
          err.response?.data?.detail || "No matching result or server error.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Limit is 5MB.");
      return;
    }

    setImageLoading(true);
    setError("");
    setImageData(null);
    setShowOriginal(false);

    const formData = new FormData();
    formData.append("file", file);

    // Create a local object URL for the original image
    const originalUrl = URL.createObjectURL(file);

    try {
      const res = await axios.post(`${API_BASE}/api/inspect-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extracted = res.data;
      extracted.original_url = originalUrl;
      setImageData(extracted);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError(
          "Backend is not running. Please ensure the server is started.",
        );
      } else if (err.response.status === 500) {
        setError(
          "AI service unavailable or API key is missing on the backend.",
        );
      } else {
        setError(err.response?.data?.detail || "Failed to process image.");
      }
    } finally {
      setImageLoading(false);
    }
  };

  const gridCards = [
    {
      name: "Verify ISI Licence",
      icon: ShieldCheck,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      action: () =>
        document
          .getElementById("verify-panel")
          .scrollIntoView({ behavior: "smooth" }),
    },
    {
      name: "Verify HUID",
      icon: Search,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      action: () => navigate("/coming-soon"),
    },
    {
      name: "Verify CRS R-Number",
      icon: ShieldCheck,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      action: () =>
        document
          .getElementById("verify-panel")
          .scrollIntoView({ behavior: "smooth" }),
    },
    {
      name: "Know Your Standards",
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      action: () => navigate("/standards"),
    },

    {
      name: "QR Scanner",
      icon: Camera,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      action: () => navigate("/qr-scan"),
    },
    {
      name: "Image Scanner",
      icon: ImageIcon,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      action: () => {
        document
          .getElementById("verify-panel")
          .scrollIntoView({ behavior: "smooth" });
        setTimeout(() => fileInputRef.current?.click(), 500);
      },
    },
    {
      name: "Complaints",
      icon: FileText,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      action: () => navigate("/complaint"),
    },
    {
      name: "Certification Info",
      icon: CheckCircle2,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      action: () => navigate("/coming-soon"),
    },

    {
      name: "Standards Browser",
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      action: () => navigate("/standards"),
    },
    {
      name: "Laboratories",
      icon: Building,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      action: () => navigate("/coming-soon"),
    },
    {
      name: "Product Recalls",
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      action: () => navigate("/coming-soon"),
    },
    {
      name: "Registered Jewellers",
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      action: () => navigate("/coming-soon"),
    },

    {
      name: "Consumer Education",
      icon: HelpCircle,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
      action: () => navigate("/education"),
    },
    {
      name: "Training",
      icon: GraduationCap,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/30",
      action: () => navigate("/coming-soon"),
    },
    {
      name: "Verification History",
      icon: HistoryIcon,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
      action: () => navigate("/history"),
    },
    {
      name: "Analytics Dashboard",
      icon: Activity,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/30",
      action: () => navigate("/analytics"),
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Top Section: Welcome Banner & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Banner (Takes 2 columns on lg) */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] rounded-2xl p-8 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col justify-center min-h-[220px]">
          {/* Glowing Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-start">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                BIS Sentinel
              </span>
            </h1>
            <p className="text-slate-300 mb-6 max-w-lg">
              Verify product certifications. Check standards. Stay safe. Your
              all-in-one platform to verify BIS/ISI details, explore Indian
              Standards, file complaints and learn about product safety.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem("bis_intro_played");
                window.location.reload();
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" /> Watch Intro Video
            </button>
          </div>

          {/* Abstract Shield Logo in Banner Background */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden md:block">
            <ShieldCheck className="w-40 h-40 text-cyan-400" />
          </div>
        </div>

        {/* Quick Overview (Takes 1 column) */}
        <div className="bg-[#131127]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Quick Overview</h3>
            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">
              Live / Demo Data
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex flex-col justify-center cursor-pointer hover:bg-blue-900/40 transition"
              onClick={() => navigate("/analytics")}
            >
              <div className="flex items-center space-x-2 text-blue-400 mb-1">
                <Search className="w-4 h-4" />{" "}
                <span className="text-xs font-semibold">Total Checks</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>

            <div
              className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 flex flex-col justify-center cursor-pointer hover:bg-green-900/40 transition"
              onClick={() => navigate("/history")}
            >
              <div className="flex items-center space-x-2 text-green-400 mb-1">
                <ShieldCheck className="w-4 h-4" />{" "}
                <span className="text-xs font-semibold">Verified</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {
                  history.filter((h) => h.status === "Officially Verified")
                    .length
                }
              </p>
            </div>

            <div
              className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 flex flex-col justify-center cursor-pointer hover:bg-red-900/40 transition"
              onClick={() => navigate("/history")}
            >
              <div className="flex items-center space-x-2 text-red-400 mb-1">
                <AlertTriangle className="w-4 h-4" />{" "}
                <span className="text-xs font-semibold">Suspicious</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.flagged}</p>
            </div>

            <div
              className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 flex flex-col justify-center cursor-pointer hover:bg-yellow-900/40 transition"
              onClick={() => navigate("/history")}
            >
              <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                <HelpCircle className="w-4 h-4" />{" "}
                <span className="text-xs font-semibold">Inconclusive</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 16 Tile Grid */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Choose a Feature</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a feature below to get started
            </p>
          </div>
          <button
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center transition"
            onClick={() =>
              document
                .getElementById("verify-panel")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {gridCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={i}
                onClick={card.action}
                className="bg-[#131127]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-slate-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:-translate-y-1 transition-all group text-left flex flex-col justify-between h-32"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-white font-bold text-sm tracking-wide mt-2">
                  {card.name}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

      <div id="verify-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Engine */}
        <div className="lg:col-span-2 bg-[#131127]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <ScanLine className="w-6 h-6 mr-2 text-cyan-400" />
              Core Verification Engine
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              Enter an ISI Licence, CRS R-Number, HUID, or product name.
            </p>

            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-[#0B0A15] p-2 rounded-xl border border-slate-700 focus-within:border-cyan-400 transition-colors">
                <div className="pl-4">
                  <Search
                    className={`w-6 h-6 ${query ? "text-cyan-400" : "text-slate-500"}`}
                  />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., CM/L-1234567, Shoes, IS 15298"
                  className="w-full bg-transparent border-none text-white px-4 py-3 outline-none text-lg placeholder-slate-600 font-mono tracking-wide"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading || loading}
                  className="p-3 text-slate-400 hover:text-purple-400 transition flex-shrink-0 disabled:opacity-50 relative"
                  title="Upload Product Image"
                >
                  {imageLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </button>

                <button
                  type="submit"
                  disabled={loading || imageLoading || !query.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#0B0A15] font-bold px-6 md:px-8 py-3 rounded-lg ml-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Checking
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 flex items-start space-x-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2 mr-2">
                Try:
              </span>
              {["CM/L-1234567", "R-12345678", "IS 14543", "Shoes"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-cyan-500/50 text-slate-300 text-sm font-mono transition"
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Chart */}
        <div
          className="bg-[#131127]/80 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex flex-col cursor-pointer hover:border-purple-500/50 transition-colors"
          onClick={() => navigate("/analytics")}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Recent Volume</h3>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 min-h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorChecks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B0A15",
                    border: "1px solid rgba(168,85,247,0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checks"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorChecks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-xs text-slate-500 mb-1">Local History</p>
              <p className="text-lg font-bold text-white">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Suspicious</p>
              <p className="text-lg font-bold text-red-400">{stats.flagged}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Analysis Results Panel */}
      {imageData && (
        <div className="bg-[#131127]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Image Side */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-cyan-400" />
                  Image Analysis
                </h3>
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  {showOriginal ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" /> View Annotated
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" /> View Original
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative">
                <img
                  src={
                    showOriginal
                      ? imageData.original_url
                      : imageData.annotated_image
                  }
                  alt="Scanned product"
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={imageData.annotated_image}
                  download="annotated-image.jpg"
                  className="flex-1 flex justify-center items-center text-sm bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg border border-slate-700 transition"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Image
                </a>
                <button
                  onClick={() => setImageData(null)}
                  className="flex-1 flex justify-center items-center text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition"
                >
                  Clear Results
                </button>
              </div>
            </div>

            {/* Results Side */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-400" />
                Extraction Results
              </h3>

              <div className="bg-[#0B0A15]/80 rounded-xl border border-slate-800 p-6 flex-1 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Detected Licence Number
                  </p>
                  <p className="text-xl text-cyan-400 font-mono mt-1">
                    {imageData.cml_number || "Not detected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Detected Standard
                  </p>
                  <p className="text-lg text-slate-200 mt-1">
                    {imageData.is_standard || "Not detected"}
                  </p>
                </div>

                {imageData.product_name && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      Product / Label Text
                    </p>
                    <p className="text-lg text-slate-200 mt-1">
                      {imageData.product_name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                      Detection Source
                    </p>
                    <span className="text-sm bg-slate-800 text-slate-300 px-2 py-1 rounded">
                      {imageData.detection_source || "Vision Model"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                      Confidence
                    </p>
                    <span
                      className={`text-sm font-mono font-bold px-2 py-1 rounded border ${
                        (imageData.confidence || 0) > 90
                          ? "text-green-400 border-green-500/30 bg-green-500/10"
                          : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                      }`}
                    >
                      {imageData.confidence || 80}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const text =
                      imageData.cml_number ||
                      imageData.is_standard ||
                      imageData.product_name;
                    if (text) {
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  disabled={
                    !imageData.cml_number &&
                    !imageData.is_standard &&
                    !imageData.product_name
                  }
                  className="flex-1 flex justify-center items-center text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl border border-slate-700 transition disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" /> Copy Number
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    handleSearch(
                      null,
                      imageData.cml_number ||
                        imageData.is_standard ||
                        imageData.product_name,
                    )
                  }
                  disabled={
                    (!imageData.cml_number &&
                      !imageData.is_standard &&
                      !imageData.product_name) ||
                    loading
                  }
                  className="flex-1 flex justify-center items-center text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-[#0B0A15] px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] transition disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  Verify Number
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500 border-t border-slate-800/50 pt-3">
                <p>
                  <strong>Note:</strong> Verification status is not confirmed
                  until checked against the authoritative database using the
                  Verify button. Precise highlighting may be unavailable for
                  blurry images or unsupported fonts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
