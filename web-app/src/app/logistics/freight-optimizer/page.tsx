"use client";
import { useState } from "react";
import Link from "next/link";

interface RouteData {
  recommended_carrier: string;
  estimated_cost_usd: number;
  estimated_transit_days: number;
  optimization_reasoning: string;
}

export default function FreightOptimizerDashboard() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [priority, setPriority] = useState("Standard");
  const [specialHandling, setSpecialHandling] = useState("None");
  
  const [data, setData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || weight === "") return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/logistics/freight-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          origin: origin,
          destination: destination,
          package_weight_kg: Number(weight),
          priority_level: priority,
          special_handling: specialHandling
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.route_optimization);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/logistics" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <span>←</span> Back to Logistics
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-3xl border border-blue-200 dark:border-blue-500/20">
            🗺️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Freight & Route Optimizer</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Determine the most cost-effective carrier and shipping route instantly.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={optimizeRoute} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Origin (City/Zip)
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g., Jaipur, 302022"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Destination (City/Zip)
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Mumbai, 400001"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Package Weight (KG)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g., 25"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 text-sm appearance-none"
                  disabled={loading}
                >
                  <option value="Standard">Standard (Lowest Cost)</option>
                  <option value="Express">Express (Balanced)</option>
                  <option value="Overnight">Overnight (Fastest)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Special Handling
                </label>
                <select
                  value={specialHandling}
                  onChange={(e) => setSpecialHandling(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 text-sm appearance-none"
                  disabled={loading}
                >
                  <option value="None">None</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Refrigerated">Refrigerated</option>
                  <option value="Hazardous">Hazardous</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !origin.trim() || !destination.trim() || weight === ""}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Calculating Route...</>
              ) : (
                "Optimize Route"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Routing Dashboard */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-100">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Carrier Selection */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-6 text-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">Recommended Carrier</span>
                <div className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
                  <span>🚚</span> {data.recommended_carrier}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Transit Time</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {data.estimated_transit_days} <span className="text-base text-slate-400 font-medium">days</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Cost</span>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${data.estimated_cost_usd.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span>🧠</span> Routing Logic
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {data.optimization_reasoning}
                </p>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🧭
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Shipment Details</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Enter origin, destination, and package constraints to generate the optimal shipping route.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}