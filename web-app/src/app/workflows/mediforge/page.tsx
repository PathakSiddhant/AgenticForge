// Path: web-app/src/app/workflows/mediforge/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface Appointment {
  id: number; patient: string; phone: string; doctor_id: number; doctor: string; time: string; date: string; status: string; notes: string;
}

interface Doctor {
  id: number; name: string; specialty: string;
}

export default function MediForgeDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDoctor, setFilterDoctor] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());

  // AI Chat Widget States
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  // 🌟 NAYA: Tab State for Chat vs WhatsApp
  const [activeTab, setActiveTab] = useState<"chat" | "whatsapp">("chat"); 
  const [messages, setMessages] = useState<{role: "ai" | "user", text: string}[]>([
    { role: "ai", text: "Hello! I am the MediForge AI Receptionist. I can check schedules and book appointments. How can I help?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    patient_name: "", patient_phone: "", doctor_id: "", date: "", time: "09:00 AM", status: "Scheduled", notes: "Walk-in consultation"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [aptRes, docRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/mediforge/appointments"),
        fetch("http://127.0.0.1:8000/api/mediforge/doctors")
      ]);
      if (aptRes.ok) setAppointments(await aptRes.json());
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const isPastSlot = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const [time, modifier] = timeStr.split(' ');
    const timeParts = time.split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10); 
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    const slotDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
    return slotDateTime < currentTime;
  };

  const getFormDateString = (d: Date) => {
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  };

  const displayedAppointments = appointments.filter(apt => {
    const matchDate = apt.date === getFormDateString(selectedDate);
    const matchDoctor = filterDoctor === "All" || apt.doctor === filterDoctor;
    return matchDate && matchDoctor;
  });

  const openNewBooking = (timeString: string) => {
    if (doctors.length === 0) return;
    setEditingId(null);
    setFormData({ patient_name: "", patient_phone: "", doctor_id: doctors[0].id.toString(), date: getFormDateString(selectedDate), time: timeString, status: "Scheduled", notes: "" });
    setIsModalOpen(true);
  };

  const openEditBooking = (apt: Appointment) => {
    setEditingId(apt.id);
    setFormData({ patient_name: apt.patient, patient_phone: apt.phone, doctor_id: apt.doctor_id.toString(), date: apt.date, time: apt.time, status: apt.status, notes: apt.notes });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const slotBookings = appointments.filter(a => a.doctor_id.toString() === formData.doctor_id && a.date === formData.date && a.time === formData.time && a.status !== 'Cancelled' && a.id !== editingId);
    if (slotBookings.length >= 2) {
      alert("❌ CAPACITY LIMIT: This doctor already has 2 patients booked for this 30-min slot. Please choose another time.");
      setIsSubmitting(false);
      return;
    }
    try {
      const url = editingId ? `http://127.0.0.1:8000/api/mediforge/appointments/${editingId}` : "http://127.0.0.1:8000/api/mediforge/appointments/manual";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, doctor_id: parseInt(formData.doctor_id) })
      });
      const result = await res.json();
      if (result.status === "success") { setIsModalOpen(false); fetchData(); } else { alert(result.message); }
    } catch (error) { console.error(error); alert("Error connecting to server."); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!editingId || !confirm("Are you sure you want to completely remove this appointment?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/mediforge/appointments/${editingId}`, { method: "DELETE" });
      if ((await res.json()).status === "success") { setIsModalOpen(false); fetchData(); }
    } catch (error) { console.error(error); alert("Failed to delete."); } finally { setIsSubmitting(false); }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/mediforge/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
      if (data.reply.includes("SUCCESS")) fetchData(); 
    } catch (error) {
      console.error(error); setMessages(prev => [...prev, { role: "ai", text: "❌ Connection Error: Is the Python backend running?" }]);
    } finally { setIsTyping(false); }
  };

  const renderCalendarRow = (hourString: string) => {
    const isPast = isPastSlot(getFormDateString(selectedDate), hourString);
    const hourApts = displayedAppointments.filter(apt => apt.time === hourString);
    return (
      <div key={hourString} className={`flex min-h-22 border-b border-slate-100 dark:border-[#1a1a1a] group relative ${isPast ? 'bg-slate-100/50 dark:bg-black/50 opacity-60' : ''}`}>
        <div className="w-24 shrink-0 text-right pr-4 pt-4 border-r border-slate-100 dark:border-[#1a1a1a]">
          <span className={`text-[11px] font-bold px-2 py-1 rounded ${isPast ? 'text-slate-400 bg-transparent' : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0a0a0a]'}`}>
            {hourString} {isPast && "(Past)"}
          </span>
        </div>
        <div className="flex-1 relative flex flex-wrap gap-3 p-3 z-10">
          {hourApts.map(apt => (
            <div key={apt.id} onClick={() => openEditBooking(apt)} className={`w-56 border p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-center ${apt.status === 'Cancelled' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-[#333] border-l-4 border-l-indigo-500'}`}>
              <div className="flex justify-between items-start mb-1">
                <p className={`text-xs font-bold truncate ${apt.status === 'Cancelled' ? 'text-red-700 dark:text-red-400 line-through' : 'text-slate-900 dark:text-white'}`}>{apt.patient}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${apt.status === 'Completed' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : apt.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : apt.status === 'Cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>{apt.status}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{apt.doctor}</p>
            </div>
          ))}
          {!isPast && (
            <div className="flex-1 min-w-37.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-2">
              <button onClick={() => openNewBooking(hourString)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors">+ Book Slot</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-black flex flex-col font-sans overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="shrink-0 bg-white dark:bg-[#050505] border-b border-slate-200 dark:border-white/10 px-8 py-4 flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl drop-shadow-sm">🏥</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">MediForge HQ</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span> AI & Database Sync Online
          </p>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#111] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
            <span className="text-xs font-bold text-slate-500">FILTER:</span>
            <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer">
              <option value="All">All Doctors</option>
              {doctors.map(doc => <option key={doc.id} value={doc.name}>{doc.name}</option>)}
            </select>
          </div>
          <button onClick={fetchData} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 text-xl" title="Refresh DB">🔄</button>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="flex-1 min-h-0 flex gap-6 p-6 max-w-screen-2xl w-full mx-auto overflow-hidden">
        
        <div className="flex-2 hidden md:flex flex-col bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm min-h-0 overflow-hidden">
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050505] flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">📋 Agenda Overview</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {isLoading ? <p className="p-4 text-slate-500 text-sm">Loading...</p> : displayedAppointments.length === 0 ? (
              <p className="text-center text-slate-400 mt-10">No appointments</p>
            ) : displayedAppointments.map((apt) => (
              <div key={apt.id} onClick={() => openEditBooking(apt)} className={`p-4 mb-3 rounded-xl border flex justify-between items-center shadow-sm cursor-pointer hover:border-indigo-500 transition-colors ${apt.status === 'Cancelled' ? 'bg-slate-50 dark:bg-black border-dashed opacity-50' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-white/5'}`}>
                <div>
                  <h4 className={`font-bold text-sm ${apt.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{apt.patient}</h4>
                  <p className="text-xs text-slate-500 mt-1">{apt.doctor}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{apt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-4 flex flex-col bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm min-h-0 overflow-hidden relative">
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050505] flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">📅 Master Schedule</h2>
            <div className="flex items-center gap-2">
              <input type="date" value={getFormDateString(selectedDate)} onChange={(e) => { if(e.target.value) setSelectedDate(new Date(e.target.value)); }} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer outline-none focus:border-indigo-500" />
              <button onClick={() => setSelectedDate(new Date())} className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-2.5 rounded-lg transition-colors">
                Jump to Today
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-[#020202]">
            <div className="pb-10">
              {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"].map((hour) => (
                renderCalendarRow(hour)
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* THE LIVE AI CHAT WIDGET */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        <div className={`mb-4 w-[400px] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${isSimulatorOpen ? 'h-[550px] scale-100 opacity-100 translate-y-0' : 'h-0 scale-90 opacity-0 translate-y-10 pointer-events-none'}`}>
          
          {/* WIDGET HEADER */}
          <div className="shrink-0 bg-slate-50 dark:bg-[#111] pt-4 px-4 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-sm">✨</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111] rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Receptionist</h3>
                <p className="text-[11px] text-emerald-600 font-bold">Online & Listening</p>
              </div>
            </div>
            <button onClick={() => setIsSimulatorOpen(false)} className="text-slate-400 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">✕</button>
          </div>

          {/* 🌟 NAYA: THE TAB SWITCHER */}
          <div className="shrink-0 bg-slate-50 dark:bg-[#111] px-4 flex gap-4 border-b border-slate-200 dark:border-white/5 mt-2">
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`pb-2 text-xs font-bold transition-colors ${activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              Web Interface
            </button>
            <button 
              onClick={() => setActiveTab('whatsapp')} 
              className={`pb-2 text-xs font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'whatsapp' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              WhatsApp Bot <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </button>
          </div>
          
          {/* TAB 1: WEB CHAT */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#050505] custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-500/20" : "bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm whitespace-pre-wrap"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 p-3 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Message AI to book a slot..." 
                    className="flex-1 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all"
                    disabled={isTyping}
                  />
                  <button onClick={handleSendMessage} disabled={isTyping || !inputText.trim()} className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md">
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 🌟 NAYA: TAB 2: WHATSAPP REDIRECT */}
          {activeTab === 'whatsapp' && (
            <div className="flex-1 p-6 bg-slate-50/50 dark:bg-[#050505] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
                💬
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Connect on WhatsApp</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Experience our AI Receptionist directly from your mobile phone.</p>
              
              <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/5 w-full mb-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sandbox Secret Code</p>
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">join level-plenty</p>
              </div>

              <a 
                href="https://wa.me/14155238886?text=join%20level-plenty" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
              >
                <span>Launch WhatsApp</span>
                <span className="text-xl">↗</span>
              </a>
              <p className="text-[10px] text-slate-400 mt-4">Send the code above to +1 415 523 8886 to initiate the AI.</p>
            </div>
          )}

        </div>

        <button 
          onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all hover:scale-105 border-4 border-white dark:border-[#050505] z-50 ${isSimulatorOpen ? 'bg-slate-800 text-white rotate-45' : 'bg-indigo-600 text-white animate-bounce'}`}
        >
          {isSimulatorOpen ? '✖' : '✨'}
        </button>
      </div>

      {/* THE EDIT/NEW MODAL FORM ... (Keeping this exactly the same) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#050505]">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingId ? "Edit Booking" : "New Booking"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Patient Name</label>
                  <input required type="text" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assign Doctor</label>
                  <select value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none cursor-pointer">
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Time</label>
                  <select value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none cursor-pointer">
                    <option>09:00 AM</option><option>09:30 AM</option><option>10:00 AM</option><option>10:30 AM</option>
                    <option>11:00 AM</option><option>11:30 AM</option><option>12:00 PM</option><option>12:30 PM</option>
                    <option>01:00 PM</option><option>01:30 PM</option><option>02:00 PM</option><option>02:30 PM</option>
                    <option>03:00 PM</option><option>03:30 PM</option><option>04:00 PM</option><option>04:30 PM</option>
                  </select>
                </div>

                {editingId && (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Patient Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none cursor-pointer">
                      <option value="Scheduled">Scheduled (Upcoming)</option>
                      <option value="Checked-In">Checked-In (Waiting Area)</option>
                      <option value="Completed">Completed (Done)</option>
                      <option value="Cancelled">Cancelled (No Show)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 flex gap-3">
                {editingId && (
                  <button type="button" onClick={handleDelete} disabled={isSubmitting} className="w-1/3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
                  {isSubmitting ? "Saving..." : editingId ? "Update Booking" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}