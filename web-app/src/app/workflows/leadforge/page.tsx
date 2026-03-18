"use client";

import React, { useState, useEffect } from "react";

// 🌟 TYPESCRIPT INTERFACES
interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  score: number;
  status: string;
  budget: string;
  timeline: string;
  pain: string;
}

interface Meeting {
  id: number;
  patient: string;
  time: string;
  date: string;
  doctor: string;
  notes: string;
}

// --- DUMMY DATA ---
// INITIAL_LEADS removed as per instructions

const DUMMY_MEETINGS: Meeting[] = [
  { id: 101, patient: "Tony Stark", time: "10:30 AM", date: "2026-03-18", doctor: "MediForge AI", notes: "Ready to close the enterprise deal." },
  { id: 102, patient: "Bruce Wayne", time: "02:00 PM", date: "2026-03-18", doctor: "MediForge AI", notes: "Product demo scheduled." },
  { id: 103, patient: "Sarah Connor", time: "11:00 AM", date: "2026-03-20", doctor: "MediForge AI", notes: "Follow up on pricing." },
];

export default function LeadForgeDashboard() {
  const [activeTab, setActiveTab] = useState("pipeline"); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // 🌟 NAYA: Real Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  
  // Modals State
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState<{dateStr: string, meetings: Meeting[]} | null>(null);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 18)); 

  // Form State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", company_name: "", company_size: "", budget: "", timeline: "", pain_point: "",
  });

  // 🌟 NAYA: Fetch Leads from Backend on Load
  const fetchLeads = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/leads");
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // 🌟 NAYA: Calculations ab 'leads' state se hongi
  const hotCount = leads.filter(l => l.status === "Hot").length;
  const warmCount = leads.filter(l => l.status === "Warm").length;
  const coldCount = leads.filter(l => l.status === "Cold").length;

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30";
    if (score >= 50) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30";
    return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400 border-slate-200 dark:border-white/10";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🌟 NAYA: Form Submit hone ke baad list ko refresh karna hai
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "Manual Simulation" }),
      });
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", company_name: "", company_size: "", budget: "", timeline: "", pain_point: "" });
        // 🌟 Refresh leads instantly!
        fetchLeads(); 
      } else {
        alert("Failed to save lead in DB.");
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- CALENDAR LOGIC ---
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()));
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const currentDatePickerValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // 🌟 DOWNSIZED LEAD CARD
  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div onClick={() => setSelectedLead(lead)} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-800 to-slate-600 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{lead.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{lead.company}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-bold border ${getScoreColor(lead.score)}`}>
            🤖 {lead.score}
          </div>
        </div>
        <div className="flex gap-1.5 mb-3">
          <span className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded border border-slate-200 dark:border-white/5">{lead.budget}</span>
          <span className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded border border-slate-200 dark:border-white/5">{lead.timeline}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-[#0a0a0a] p-2.5 rounded-lg border border-slate-100 dark:border-white/5">&quot;{lead.pain}&quot;</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full p-4 lg:p-8 text-slate-900 dark:text-white">
      
      {/* 🌟 HEADER & SEARCH (Downsized) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">👥 LeadForge CRM</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Enterprise Pipeline & Automated Meeting Management.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111] text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => { setIsSimulateModalOpen(true); setSuccess(false); }}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap transition-transform hover:scale-[1.02]"
          >
            + Simulate Lead
          </button>
        </div>
      </div>

      {/* 🌟 TABS (Downsized) */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-white/10 mb-6">
        <button 
          onClick={() => setActiveTab("pipeline")}
          className={`pb-2.5 px-2 text-sm font-bold transition-all ${activeTab === "pipeline" ? "border-b-[3px] border-blue-500 text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
        >
          Pipeline Categories
        </button>
        <button 
          onClick={() => setActiveTab("calendar")}
          className={`pb-2.5 px-2 text-sm font-bold transition-all ${activeTab === "calendar" ? "border-b-[3px] border-blue-500 text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
        >
          Meetings & Calendar
        </button>
      </div>

      {/* 🌟 MAIN CONTENT */}
      {isLoadingLeads ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-500 font-bold">Loading leads from AI Engine...</span>
        </div>
      ) : searchQuery ? (
        <div>
          <h3 className="text-lg font-bold mb-4">Search Results ({filteredLeads.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        </div>
      ) : activeTab === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARDS (Downsized) */}
          <div onClick={() => setSelectedCategory("Hot")} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-orange-500/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 p-2.5 rounded-xl text-xl shadow-sm">🔥</div>
              <span className="text-3xl font-black">{hotCount}</span>
            </div>
            <h3 className="text-lg font-bold mb-1.5">Hot Leads</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Score 70+. Ready for immediate closing.</p>
          </div>

          <div onClick={() => setSelectedCategory("Warm")} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-yellow-500/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-2.5 rounded-xl text-xl shadow-sm">🌤️</div>
              <span className="text-3xl font-black">{warmCount}</span>
            </div>
            <h3 className="text-lg font-bold mb-1.5">Warm Leads</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Score 40-69. Currently in automated nurturing.</p>
          </div>

          <div onClick={() => setSelectedCategory("Cold")} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-slate-500/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/10 rounded-bl-full -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl text-xl shadow-sm">❄️</div>
              <span className="text-3xl font-black">{coldCount}</span>
            </div>
            <h3 className="text-lg font-bold mb-1.5">Cold / Archive</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Score &lt; 40. Routed to newsletter workflow.</p>
          </div>
        </div>
      ) : (
        // 🌟 CALENDAR (Downsized)
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-lg font-bold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 font-bold transition-colors text-sm">&lt;</button>
                <input 
                  type="date" 
                  value={currentDatePickerValue}
                  onChange={(e) => {
                    if(e.target.value) {
                      const [y, m, d] = e.target.value.split('-');
                      setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)));
                    }
                  }}
                  className="bg-slate-100 dark:bg-[#222] border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={nextMonth} className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 font-bold transition-colors text-sm">&gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const fullDateStr = getDateString(day);
                const dayMeetings = DUMMY_MEETINGS.filter(m => m.date === fullDateStr);
                const isSelected = currentDate.getDate() === day;
                return (
                  <div 
                    key={day} 
                    onClick={() => {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      if(dayMeetings.length > 0) setSelectedDateMeetings({dateStr: fullDateStr, meetings: dayMeetings});
                    }}
                    className={`aspect-square rounded-lg p-2 relative transition-all flex flex-col items-center justify-center cursor-pointer border
                      ${isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 z-10' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    {dayMeetings.length > 0 && (
                      <div className={`mt-1 text-[9px] font-bold px-1 py-0.5 rounded-sm text-center truncate w-full
                        ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'}
                      `}>
                        {dayMeetings.length} Call{dayMeetings.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow-sm flex justify-center items-center gap-2 transition-transform hover:scale-[1.02] text-sm">
              <span>📅</span> Schedule Manual Meeting
            </button>
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-base mb-4">Upcoming Calls</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {DUMMY_MEETINGS.map((meeting) => (
                  <div key={meeting.id} className="flex gap-3 items-center p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-colors">
                    <div className="text-center min-w-[48px] bg-white dark:bg-[#222] p-1.5 rounded-md border border-slate-200 dark:border-white/10 shadow-sm">
                      <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase">{meeting.date.substring(5, 7)}/{meeting.date.substring(8, 10)}</p>
                      <p className="text-sm font-black">{meeting.time.split(' ')[0]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{meeting.patient}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{meeting.notes}</p>
                    </div>
                    <button className="text-[11px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1.5 rounded-md font-bold shadow-sm hover:scale-105 transition-transform">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 DATE MEETINGS MODAL (Downsized) */}
      {selectedDateMeetings && (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#0a0a0a]">
              <h2 className="text-base font-bold">Meetings for {selectedDateMeetings.dateStr}</h2>
              <button onClick={() => setSelectedDateMeetings(null)} className="text-xl font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">&times;</button>
            </div>
            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
              {selectedDateMeetings.meetings.map(meeting => (
                <div key={meeting.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm">{meeting.patient}</h4>
                    <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-xs px-2 py-0.5 rounded-md">{meeting.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 bg-white dark:bg-[#1a1a1a] p-2 rounded-lg border border-slate-200 dark:border-white/5">&quot;{meeting.notes}&quot;</p>
                  <button className="w-full text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2 rounded-lg font-bold shadow-sm">Join Room</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 SIMULATE LEAD FORM MODAL (Downsized & Tight) */}
      {isSimulateModalOpen && (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl w-full max-w-2xl flex flex-col relative my-4">
            
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#111] rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Lead Registration</h2>
                <p className="text-xs text-slate-500">Manual injection into AI pipeline.</p>
              </div>
              <button onClick={() => setIsSimulateModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                 <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-6 rounded-xl text-center">
                 <div className="text-3xl mb-2">🚀</div>
                 <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-1">Lead Captured!</h3>
                 <p className="text-xs text-green-600 dark:text-green-500/80 mb-5">AI engine is analyzing and routing data.</p>
                 <button onClick={() => setSuccess(false)} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition-colors">Inject Another</button>
               </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Work Email <span className="text-red-500">*</span></label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all" placeholder="john@company.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Company Name</label>
                      <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all" placeholder="Acme Corp" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Company Size</label>
                      <select name="company_size" value={formData.company_size} onChange={handleChange} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all cursor-pointer">
                        <option value="">Select size...</option>
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">51-200 Employees</option>
                        <option value="200+">200+ Employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Monthly Budget</label>
                      <select name="budget" value={formData.budget} onChange={handleChange} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all cursor-pointer">
                        <option value="">Select budget...</option>
                        <option value="< $1k">Under $1,000</option>
                        <option value="$1k - $5k">$1,000 - $5,000</option>
                        <option value="$5k - $10k">$5,000 - $10,000</option>
                        <option value="$10k+">$10,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Timeline</label>
                      <select name="timeline" value={formData.timeline} onChange={handleChange} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all cursor-pointer">
                        <option value="">Select urgency...</option>
                        <option value="ASAP">ASAP (Immediate)</option>
                        <option value="1-3 months">1-3 Months</option>
                        <option value="3-6 months">3-6 Months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Primary Pain Point</label>
                    <textarea name="pain_point" value={formData.pain_point} onChange={handleChange} rows={3} className="w-full rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 border outline-none transition-all resize-none" placeholder="Describe the core challenge..."></textarea>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 mt-5">
                    <button type="button" onClick={() => setIsSimulateModalOpen(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className={`px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {loading ? "Processing..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 PIPELINE CATEGORY MODAL (Downsized) */}
      {selectedCategory && (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#111]">
              <h2 className="text-2xl font-black">{selectedCategory === "Hot" ? "🔥" : selectedCategory === "Warm" ? "🌤️" : "❄️"} {selectedCategory} Pipeline</h2>
              <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 🌟 NAYA: INITIAL_LEADS ko leads se replace kiya hai */}
                {leads.filter(l => l.status === selectedCategory).map(lead => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 LEAD DETAIL SIDE PANEL (Downsized) */}
      {selectedLead && (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-sm h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#0a0a0a]">
              <h2 className="text-lg font-bold">Lead Intelligence</h2>
              <button onClick={() => setSelectedLead(null)} className="text-2xl font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">&times;</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-1">{selectedLead.name}</h3>
              <p className="text-base text-blue-600 dark:text-blue-400 font-bold mb-6">{selectedLead.company}</p>
              
              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">AI Score</span>
                  <span className={`px-3 py-1 rounded-md font-bold text-base ${getScoreColor(selectedLead.score)}`}>{selectedLead.score}/100</span>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Budget & Timeline</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedLead.budget}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedLead.timeline}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pain Point</h4>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-white/5">&quot;{selectedLead.pain}&quot;</p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-white/10 space-y-2.5 bg-slate-50 dark:bg-[#0a0a0a]">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 transition-transform hover:scale-[1.02] text-sm">
                📅 Schedule Meeting
              </button>
              <button className="w-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white py-2.5 rounded-lg font-bold transition-colors text-sm">
                ✏️ Edit Lead Profile
              </button>
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 py-2.5 rounded-lg font-bold transition-colors flex justify-center items-center gap-2 text-sm">
                🗑️ Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}