import React from 'react';
import { BookOpen, Info, Shield, Zap, AlertTriangle } from 'lucide-react';

export default function Education() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#131127]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center mb-2">
            <BookOpen className="w-8 h-8 mr-3 text-cyan-400" />
            Standards Academy
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Master the knowledge to identify authentic BIS certifications, understand hallmarking, and protect your supply chain from counterfeit marks.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-[#131127]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all group">
          <div className="bg-cyan-500/10 border border-cyan-500/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">The ISI Mark</h2>
          <p className="text-slate-400 mb-5 leading-relaxed">
            The ISI mark is the primary standards-compliance certification for industrial products in India since 1955. It guarantees conformity to an Indian Standard (IS) developed by BIS.
          </p>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Always look for the 7 or 10 digit CM/L number (Licence number) printed near the mark.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              The IS standard number should be mentioned explicitly (e.g., IS: 15298).
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Verify the CM/L number securely via the BIS Care App or official portal.
            </li>
          </ul>
        </div>

        {/* Card 2 */}
        <div className="bg-[#131127]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all group">
          <div className="bg-purple-500/10 border border-purple-500/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Compulsory Registration (CRS)</h2>
          <p className="text-slate-400 mb-5 leading-relaxed">
            Under the CRS protocol, electronic and IT products (laptops, LED TVs, power adapters) must be registered and tested in BIS-recognized labs prior to market launch.
          </p>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              CRS products carry the "Standard Mark" coupled with an 8-digit R-Number (e.g., R-12345678).
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Verify R-Numbers dynamically on the official CRS portal.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Foreign manufacturers must register and mark imported products prior to customs clearance.
            </li>
          </ul>
        </div>

        {/* Card 3 */}
        <div className="bg-[#131127]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] transition-all group">
          <div className="bg-yellow-500/10 border border-yellow-500/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Info className="w-7 h-7 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Gold Hallmarking (HUID)</h2>
          <p className="text-slate-400 mb-5 leading-relaxed">
            The Hallmark Unique Identification (HUID) is a secure 6-digit alphanumeric code stamped on gold jewellery to guarantee purity and traceability.
          </p>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Mandatory for 14, 18, 20, 22, 23, and 24 carat gold jewelry transactions.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Look for three identifiers: BIS logo, Fineness Grade, and the 6-digit HUID.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Trace jeweller authenticity via the "Verify HUID" tool on official apps.
            </li>
          </ul>
        </div>

        {/* Card 4 */}
        <div className="bg-[#131127]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-red-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all group">
          <div className="bg-red-500/10 border border-red-500/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Fraud Detection Protocols</h2>
          <p className="text-slate-400 mb-5 leading-relaxed">
            Counterfeit operations frequently deploy fake BIS marks. Products bearing an ISI mark without a verifiable CM/L number are illegally manufactured.
          </p>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Red flag: Missing IS Standard number or CM/L number.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Red flag: Poor quality printing or disproportionate BIS logos.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Red flag: Official portal queries return "Licence Expired" or "Cancelled".
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Report anomalies immediately using the Sentinel Complaints module.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
