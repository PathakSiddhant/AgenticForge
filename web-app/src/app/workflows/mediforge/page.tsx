// Path: web-app/src/app/workflows/mediforge/page.tsx
"use client";

import { useState } from "react";

export default function MediForgeDashboard() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [callState, setCallState] = useState<"idle" | "connecting" | "listening" | "processing" | "success">("idle");
  const [statusText, setStatusText] = useState("Ready to call");

  // Dummy Data
  const appointments = [
    { id: 1, patient: "Rahul Sharma", phone: "+91 98765 43210", doctor: "Dr. A. Gupta (Cardio)", time: "10:00 AM", duration: 60, status: "Confirmed", type: "AI Booked" },
    { id: 2, patient: "Priya Singh", phone: "+91 91234 56789", doctor: "Dr. S. Verma (Derma)", time: "11:30 AM", duration: 30, status: "In-Clinic", type: "Walk-in" },
    { id: 4, patient: "Sneha Desai", phone: "+91 98888 11111", doctor: "Dr. K. Iyer (Neuro)", time: "02:00 PM", duration: 45, status: "Confirmed", type: "AI Booked" },
    { id: 5, patient: "Vikram Singh", phone: "+91 97777 22222", doctor: "Dr. S. Verma (Derma)", time: "04:15 PM", duration: 30, status: "Pending", type: "AI Booked" },
  ];

  // The critical "Needs Human" tasks that should NEVER scroll away
  const pendingActions = [
    { id: 3, patient: "Amit Patel", phone: "+91 99887 76655", issue: "AI couldn't understand complex symptoms", status: "Needs Human", type: "Redirected" },
  ];

  const startCall = () => {
    setCallState("connecting");
    setStatusText("Connecting to AI Engine...");
    setTimeout(() => { setCallState("listening"); setStatusText("Listening to patient..."); }, 1500);
    setTimeout(() => { setCallState("processing"); setStatusText("Checking calendar for Dr. Gupta..."); }, 4000);
    setTimeout(() => { setCallState("success"); setStatusText("Slot Confirmed: Tomorrow, 10:00 AM"); }, 6500);
  };

  const endCall = () => {
    setCallState("idle");
    setStatusText("Ready to call");
  };

  // NAYA LAYOUT: h-screen aur flex-col se page scroll block ho jayega
  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#050505] flex flex-col font-sans overflow-hidden relative">
      
      {/* 🌟 1. LOCKED HEADER (Kabhi scroll nahi hoga) */}
      <header className="shrink-0 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 px-8 py-5 flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl drop-shadow-sm">🏥</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">MediForge Auto-Receptionist</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hybrid AI-Human Hospital Management</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-md">
            + Manual Walk-in
          </button>
        </div>
      </header>

      {/* 🌟 2. LOCKED STATS ROW (Kabhi scroll nahi hoga) */}
      <div className="shrink-0 bg-white dark:bg-[#0a0a0a] px-8 pb-6 pt-4 border-b border-slate-200 dark:border-white/5 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 max-w-screen-2xl mx-auto">
          <div className="bg-slate-50 dark:bg-[#111] p-5 rounded-2xl border border-slate-200 dark:border-white/5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">42</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-6xl opacity-20">🤖</div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Handled by AI</p>
            <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">38</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-500/20 relative overflow-hidden">
            <div className="absolute w-2 h-2 bg-rose-500 rounded-full top-5 right-5 animate-ping"></div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Needs Human</p>
            <p className="text-3xl font-black text-rose-700 dark:text-rose-300">04</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#111] p-5 rounded-2xl border border-slate-200 dark:border-white/5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available Doctors</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500">12</p>
          </div>
        </div>
      </div>

      {/* 🌟 3. THE WORKSPACE (Ye hissa bachi hui height lega) */}
      <main className="flex-1 min-h-0 flex gap-6 p-6 max-w-screen-2xl w-full mx-auto overflow-hidden">
        
        {/* LEFT COLUMN: Agenda & Pending Tasks */}
        <div className="flex-[3] flex flex-col bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm min-h-0 overflow-hidden">
          
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111]">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">📋 Front-Desk Agenda</h2>
          </div>

          {/* 🔥 THE PINNED ALERTS (Never Scrolls!) */}
          {pendingActions.map(action => (
            <div key={action.id} className="shrink-0 bg-rose-50 dark:bg-rose-900/10 border-b border-rose-100 dark:border-rose-900/30 p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-xl">⚠️</div>
                <div>
                  <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                    {action.patient} <span className="text-xs text-rose-500 bg-white/50 px-2 rounded-full">{action.phone}</span>
                  </h4>
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-400 mt-0.5">{action.issue}</p>
                </div>
              </div>
              <button className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-transform hover:scale-105">
                Takeover Call
              </button>
            </div>
          ))}

          {/* Normal Table (Sirf ye scroll hoga) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 shadow-xs">
                <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-200 dark:border-white/5">
                  <th className="p-4 pl-6">Time</th>
                  <th className="p-4">Patient Info</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4 text-center">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm font-medium text-slate-700 dark:text-slate-300">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 whitespace-nowrap font-bold text-slate-900 dark:text-white">{apt.time}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{apt.patient}</p>
                      <p className="text-xs text-slate-500">{apt.phone}</p>
                    </td>
                    <td className="p-4">{apt.doctor}</td>
                    <td className="p-4 text-center">
                      {apt.type === "AI Booked" ? (
                        <span className="inline-block text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold border border-indigo-100">🤖 AI Booked</span>
                      ) : (
                        <span className="inline-block text-slate-500 bg-slate-100 px-2 py-1 rounded text-[10px] font-bold border border-slate-200">👨‍💻 Walk-in</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Google Calendar Style Visual View */}
        <div className="flex-[2] flex flex-col bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm min-h-0 overflow-hidden">
          
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111] flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">📅 Visual Schedule</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Today</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="relative border-l-2 border-slate-100 dark:border-white/5 ml-16 space-y-8 pb-10 mt-4">
              
              {/* Timeline Hours & Appointment Blocks */}
              <div className="relative">
                <span className="absolute -left-16 top-0 text-xs font-bold text-slate-400 w-12 text-right">09:00 AM</span>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full absolute top-2"></div>
              </div>

              <div className="relative">
                <span className="absolute -left-16 top-0 text-xs font-bold text-slate-400 w-12 text-right">10:00 AM</span>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full absolute top-2"></div>
                {/* Visual Block for 10 AM */}
                <div className="absolute top-2 left-4 right-4 bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500 p-3 rounded-r-lg shadow-sm">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Cardiology - Dr. A. Gupta</p>
                  <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">Rahul Sharma (60 mins) • AI Booked</p>
                </div>
              </div>

              <div className="relative mt-20"> {/* Spaced to show 11 AM */}
                <span className="absolute -left-16 top-0 text-xs font-bold text-slate-400 w-12 text-right">11:00 AM</span>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full absolute top-2"></div>
                
                <div className="absolute top-10 left-4 right-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg shadow-sm">
                  <p className="text-xs font-bold text-emerald-700">Dermatology - Dr. S. Verma</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Priya Singh (30 mins) • Walk-in</p>
                </div>
              </div>

              <div className="relative mt-20">
                <span className="absolute -left-16 top-0 text-xs font-bold text-slate-400 w-12 text-right">12:00 PM</span>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full absolute top-2"></div>
              </div>
              
              <div className="relative mt-20">
                <span className="absolute -left-16 top-0 text-xs font-bold text-slate-400 w-12 text-right">01:00 PM</span>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full absolute top-2"></div>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* 🌟 4. THE SLEEK AI CALL WIDGET (Fixed pos bottom right) */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end">
        <div className={`mb-4 w-80 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isSimulatorOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="bg-slate-50 dark:bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-sm">✨</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Receptionist</h3>
                <p className="text-[11px] text-slate-500 font-medium">MediForge Engine</p>
              </div>
            </div>
            <button onClick={() => setIsSimulatorOpen(false)} className="text-slate-400 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">✖</button>
          </div>
          <div className="p-6 flex flex-col items-center justify-center min-h-[240px] relative">
            {(callState === "listening" || callState === "processing") && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>}
            <div className="z-10 flex flex-col items-center text-center w-full">
              <div className="mb-6 h-20 flex items-center justify-center">
                {callState === "idle" && <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl border">📞</div>}
                {callState === "connecting" && <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>}
                {(callState === "listening" || callState === "processing") && (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 bg-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-12 h-12 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"></div>
                  </div>
                )}
                {callState === "success" && <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl">✓</div>}
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">{callState === "idle" ? "Test AI Call" : callState === "success" ? "Done!" : "AI is Active"}</h4>
              <p className={`text-sm font-medium ${callState === "success" ? "text-green-600" : "text-slate-500"} h-10`}>{statusText}</p>
              <div className="mt-4 w-full">
                {callState === "idle" ? (
                  <button onClick={startCall} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform">Simulate Call</button>
                ) : callState === "success" ? (
                  <button onClick={endCall} className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200">Close</button>
                ) : (
                  <button onClick={endCall} className="w-14 h-14 mx-auto bg-red-500 text-white rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform">🛑</button>
                )}
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setIsSimulatorOpen(!isSimulatorOpen)} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all hover:scale-105 border-4 border-white ${isSimulatorOpen ? 'bg-slate-800 text-white rotate-45' : 'bg-indigo-600 text-white animate-bounce'}`}>
          {isSimulatorOpen ? '✖' : '🎙️'}
        </button>
      </div>
    </div>
  );
}