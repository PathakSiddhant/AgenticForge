"use client";
import { useState } from "react";
import Link from "next/link";

interface ForecastData {
  recommended_order_quantity: number;
  stockout_risk: string;
  estimated_depletion_days: number;
  strategic_reasoning: string;
}

export default function InventoryForecasterDashboard() {
  const [itemName, setItemName] = useState("");
  const [currentStock, setCurrentStock] = useState<number | "">("");
  const [dailyUsage, setDailyUsage] = useState("");
  const [leadTime, setLeadTime] = useState<number | "">("");
  const [marketConditions, setMarketConditions] = useState("Normal operations");
  
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || currentStock === "" || !dailyUsage.trim() || leadTime === "") return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/logistics/inventory-forecaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          item_name: itemName,
          current_stock: Number(currentStock),
          historical_daily_usage: dailyUsage,
          supplier_lead_time_days: Number(leadTime),
          market_conditions: marketConditions
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.forecast);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    const r = risk.toLowerCase();
    if (r.includes("high")) return "bg-red-500 text-white animate-pulse";
    if (r.includes("medium")) return "bg-amber-500 text-white";
    return "bg-emerald-500 text-white";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/logistics" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 mb-6 transition-colors">
          <span>←</span> Back to Logistics
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-3xl border border-amber-200 dark:border-amber-500/20">
            📊
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Inventory Forecaster</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Prevent stockouts with predictive mathematical modeling.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Data Input */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={runForecast} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Item / SKU Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Industrial Detergent (50L Drums)"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Current Stock
                </label>
                <input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Units"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Days to arrive"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Historical Daily Usage
              </label>
              <textarea
                value={dailyUsage}
                onChange={(e) => setDailyUsage(e.target.value)}
                placeholder="e.g., We use about 5 drums per day. Peak usage is 10/day."
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Market Conditions / Notes
              </label>
              <textarea
                value={marketConditions}
                onChange={(e) => setMarketConditions(e.target.value)}
                placeholder="e.g., Big holiday weekend coming up, expect 20% more usage."
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !itemName.trim() || currentStock === "" || !dailyUsage.trim() || leadTime === ""}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> Calculating...</>
              ) : (
                "Run Forecast"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Predictive Output */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-100">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Top Row Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Days Until Depletion</span>
                  <div className="text-4xl font-black text-slate-900 dark:text-white">
                    {data.estimated_depletion_days} <span className="text-lg text-slate-400 font-medium">days</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Stockout Risk</span>
                  <div className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider shadow-sm ${getRiskColor(data.stockout_risk)}`}>
                    {data.stockout_risk}
                  </div>
                </div>
              </div>

              {/* Action: Order Quantity */}
              <div className="bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 p-6 rounded-xl text-center">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-2">
                  Recommended Order Quantity
                </h3>
                <div className="text-5xl font-extrabold text-amber-600 dark:text-amber-500">
                  {data.recommended_order_quantity} <span className="text-2xl font-medium opacity-80">units</span>
                </div>
              </div>

              {/* Strategic Reasoning */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                <h3 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span>🧠</span> AI Strategic Reasoning
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.strategic_reasoning}
                </p>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                📦
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Warehouse Ready</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Enter your inventory data to generate accurate reorder predictions and prevent stockouts.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}