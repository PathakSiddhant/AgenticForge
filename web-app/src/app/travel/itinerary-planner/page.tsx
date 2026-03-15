// Path: web-app/src/app/travel/itinerary-planner/page.tsx
"use client";

import { useState } from "react";

export default function ItineraryPlanner() {
  const [formData, setFormData] = useState({
    destination: "",
    days: 3,
    budget_level: "Mid-Range",
    vibe: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const generateItinerary = async () => {
    if (!formData.destination || !formData.vibe) {
      setError("Destination and Vibe are required!");
      return;
    }
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/travel/itinerary-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: formData.destination,
          days: Number(formData.days),
          budget_level: formData.budget_level,
          vibe: formData.vibe
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data.travel_plan);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <span className="px-3 py-1 text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/20 mb-4 inline-block">
          Travel & Event Management
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Hyper-Personalized Itinerary
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Generate a realistic, day-by-day travel schedule based on exact vibes and budget.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Destination 🌍</label>
            <input 
              type="text" 
              placeholder="e.g., Kyoto, Japan" 
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Days 🗓️</label>
              <input 
                type="number" 
                min="1" max="14"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Budget 💰</label>
              <select 
                value={formData.budget_level}
                onChange={(e) => setFormData({...formData, budget_level: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option>Backpacker</option>
                <option>Mid-Range</option>
                <option>Luxury</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">The Vibe ✨</label>
            <textarea 
              placeholder="e.g., Hardcore nightlife and street food, strictly no morning temples." 
              rows={3}
              value={formData.vibe}
              onChange={(e) => setFormData({...formData, vibe: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button 
            onClick={generateItinerary}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {loading ? "Planning your trip..." : "Generate Itinerary"}
          </button>

          {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        <div className="lg:col-span-2">
          {!result && !loading && (
            <div className="h-full min-h-100 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a]">
              <span className="text-4xl mb-4 opacity-50">✈️</span>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Enter details to generate an itinerary.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-100 flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-[#111]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Calculating optimal routes & costs...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animation-fade-in">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Total Est. Cost</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">${result.total_estimated_budget}</p>
                </div>
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Vibe Match</p>
                  <p className="text-2xl font-black text-green-500">{result.vibe_match_score}%</p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Expert Tip 💡</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-blue-100 leading-tight">{result.expert_tip}</p>
                </div>
              </div>

              {/* Day-by-Day Breakdown */}
              <div className="space-y-4">
                {result.itinerary.map((day: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-slate-50 dark:bg-[#1a1a1a] px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Day {day.day_number}: {day.daily_theme}</h3>
                      </div>
                      <span className="font-mono text-sm font-semibold bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                        ${day.total_daily_cost}
                      </span>
                    </div>
                    
                    {/* Activities */}
                    <div className="p-6 space-y-6">
                      {day.activities.map((act: any, aIdx: number) => (
                        <div key={aIdx} className="flex gap-4 relative">
                          {/* Timeline Line */}
                          {aIdx !== day.activities.length - 1 && (
                            <div className="absolute left-9 top-10 -bottom-6 w-px bg-slate-200 dark:bg-white/10"></div>
                          )}
                          
                          <div className="w-16 shrink-0 text-right pt-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{act.time}</span>
                          </div>
                          <div className="w-3 h-3 shrink-0 rounded-full bg-blue-500 mt-1.5 z-10 shadow-sm shadow-blue-500/50"></div>
                          <div className="flex-1 pb-2">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-900 dark:text-white">{act.activity_name}</h4>
                              <span className="text-xs font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded font-semibold">
                                ${act.estimated_cost_usd}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}