"use client";

import {
  ArrowClockwiseIcon,
  MicrophoneIcon,
  PaperPlaneRightIcon,
  PhoneCallIcon,
  SparkleIcon,
  StopCircleIcon,
  WhatsappLogoIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/confirm-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";

interface Appointment {
  id: number;
  patient: string;
  phone: string;
  doctor_id: number;
  doctor: string;
  time: string;
  date: string;
  status: string;
  notes: string;
}
interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

interface VapiInstance {
  start: (assistantId: string) => Promise<void>;
  stop: () => void;
  on: (event: string, callback: () => void) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL;
const HOURS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
];

export default function MediForgeDashboard() {
  const confirm = useConfirm();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDoctor, setFilterDoctor] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "whatsapp" | "voice">("chat");

  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    {
      role: "ai",
      text: "Hello! I am the MediForge AI Receptionist. I can check schedules and book appointments. How can I help?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // One Gemini chat session per simulator open, not one shared globally
  // across every visitor - the backend keys its conversation history by
  // this id. crypto.randomUUID() is browser-only, so it's generated in an
  // effect rather than a useState initializer (SSR has no crypto global).
  const [chatSessionId, setChatSessionId] = useState("");

  const [callStatus, setCallStatus] = useState<"inactive" | "connecting" | "active">("inactive");
  const vapiRef = useRef<VapiInstance | null>(null);

  useEffect(() => {
    if (activeTab === "chat") messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeTab]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setChatSessionId(crypto.randomUUID());
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    doctor_id: "",
    date: "",
    time: "09:00 AM",
    status: "Scheduled",
    notes: "Walk-in consultation",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [aptRes, docRes] = await Promise.all([
        fetch(`${API}/api/mediforge/appointments`, { cache: "no-store" }),
        fetch(`${API}/api/mediforge/doctors`, { cache: "no-store" }),
      ]);
      if (aptRes.ok) setAppointments(await aptRes.json());
      if (docRes.ok) setDoctors(await docRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Couldn't reach the backend. Is ai-engine running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isPastSlot = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const [time, modifier] = timeStr.split(" ");
    const timeParts = time.split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes) < currentTime;
  };

  const getFormDateString = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

  const displayedAppointments = appointments.filter(
    (apt) => apt.date === getFormDateString(selectedDate) && (filterDoctor === "All" || apt.doctor === filterDoctor)
  );

  const openNewBooking = (timeString: string) => {
    if (doctors.length === 0) return;
    setEditingId(null);
    setFormData({
      patient_name: "",
      patient_phone: "",
      doctor_id: doctors[0].id.toString(),
      date: getFormDateString(selectedDate),
      time: timeString,
      status: "Scheduled",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditBooking = (apt: Appointment) => {
    setEditingId(apt.id);
    setFormData({
      patient_name: apt.patient,
      patient_phone: apt.phone,
      doctor_id: apt.doctor_id.toString(),
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const slotBookings = appointments.filter(
      (a) =>
        a.doctor_id.toString() === formData.doctor_id &&
        a.date === formData.date &&
        a.time === formData.time &&
        a.status !== "Cancelled" &&
        a.id !== editingId
    );
    if (slotBookings.length >= 2) {
      toast.error("Capacity limit: this doctor already has 2 patients booked for this slot.");
      setIsSubmitting(false);
      return;
    }
    try {
      const res = await fetch(
        editingId
          ? `${API}/api/mediforge/appointments/${editingId}`
          : `${API}/api/mediforge/appointments/manual`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, doctor_id: parseInt(formData.doctor_id) }),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setIsModalOpen(false);
        toast.success(editingId ? "Booking updated." : "Booking confirmed.");
        fetchData();
      } else {
        toast.error(data.message || "Couldn't save this booking.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Couldn't reach the backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const confirmed = await confirm({
      title: "Remove this appointment?",
      description: "This permanently deletes the appointment. This can't be undone.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/mediforge/appointments/${editingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setIsModalOpen(false);
        toast.success("Appointment removed.");
        fetchData();
      } else {
        toast.error(data.message || "Couldn't remove this appointment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Couldn't reach the backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: inputText }]);
    const userMsg = inputText;
    setInputText("");
    setIsTyping(true);
    try {
      const res = await fetch(`${API}/api/mediforge/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, session_id: chatSessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      if (data.reply.includes("SUCCESS")) fetchData();
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Connection error - please try again in a moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceCall = async () => {
    if (callStatus === "active" || callStatus === "connecting") {
      vapiRef.current?.stop();
      setCallStatus("inactive");
      setTimeout(() => fetchData(), 2000);
      return;
    }

    setCallStatus("connecting");
    try {
      const Vapi = (await import("@vapi-ai/web")).default;
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi as unknown as VapiInstance;

      vapi.on("call-start", () => setCallStatus("active"));
      vapi.on("call-end", () => {
        setCallStatus("inactive");
        fetchData();
      });

      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
    } catch (error) {
      console.error("Vapi Error:", error);
      setCallStatus("inactive");
      toast.error("Microphone permission denied, or the voice service failed to load.");
    }
  };

  const renderCalendarRow = (hourString: string) => {
    const isPast = isPastSlot(getFormDateString(selectedDate), hourString);
    const hourApts = displayedAppointments.filter((apt) => apt.time === hourString);
    return (
      <div
        key={hourString}
        className={`group relative flex min-h-22 border-b border-border ${isPast ? "bg-surface/50 opacity-60" : ""}`}
      >
        <div className="w-24 shrink-0 border-r border-border pr-4 pt-4 text-right">
          <span className="rounded-sm bg-surface px-2 py-1 text-[11px] font-medium text-ink-muted">
            {hourString} {isPast && "(Past)"}
          </span>
        </div>
        <div className="relative z-10 flex flex-1 flex-wrap gap-3 p-3">
          {hourApts.map((apt) => (
            <button
              key={apt.id}
              onClick={() => openEditBooking(apt)}
              className={`flex w-56 flex-col justify-center rounded-md border-l-4 p-3 text-left transition-colors ${
                apt.status === "Cancelled"
                  ? "border-l-danger/40 border-y border-r border-danger/20 bg-danger-tint"
                  : "border-l-accent border-y border-r border-border bg-background hover:border-border-strong"
              }`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <p
                  className={`truncate text-xs font-medium ${apt.status === "Cancelled" ? "text-danger line-through" : "text-ink"}`}
                >
                  {apt.patient}
                </p>
                <StatusBadge status={apt.status} />
              </div>
              <p className="truncate text-[10px] text-ink-muted">{apt.doctor}</p>
            </button>
          ))}
          {!isPast && (
            <div className="flex min-w-37.5 flex-1 items-center justify-start pl-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => openNewBooking(hourString)}
                className="rounded-md border border-accent-tint-border bg-accent-tint px-4 py-2 text-xs font-medium text-accent-ink transition-colors hover:bg-accent-tint-border/60"
              >
                + Book slot
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background font-sans">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-8 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">MediForge HQ</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
            <span className="size-2 rounded-full bg-success" />
            AI &amp; database sync online
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
            <span className="text-xs font-medium text-ink-subtle">Filter:</span>
            <Select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="h-auto border-0 bg-transparent p-0 text-sm font-medium"
            >
              <option value="All">All doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchData} aria-label="Refresh">
            <ArrowClockwiseIcon className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 gap-6 overflow-hidden p-6">
        <div className="flex-2 hidden min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background md:flex">
          <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Agenda overview</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {isLoading ? (
              <p className="p-4 text-sm text-ink-muted">Loading...</p>
            ) : displayedAppointments.length === 0 ? (
              <p className="mt-10 text-center text-sm text-ink-subtle">No appointments</p>
            ) : (
              displayedAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => openEditBooking(apt)}
                  className={`mb-3 flex w-full items-center justify-between rounded-md border p-4 text-left transition-colors ${apt.status === "Cancelled" ? "border-dashed border-border bg-surface opacity-50" : "border-border bg-background hover:border-border-strong"}`}
                >
                  <div>
                    <h4 className={`text-sm font-medium ${apt.status === "Cancelled" ? "text-ink-subtle line-through" : "text-ink"}`}>
                      {apt.patient}
                    </h4>
                    <p className="mt-1 text-xs text-ink-muted">{apt.doctor}</p>
                  </div>
                  <p className="text-sm font-medium text-accent-ink">{apt.time}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-4 flex-col overflow-hidden rounded-lg border border-border bg-background">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Master schedule</h2>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={getFormDateString(selectedDate)}
                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                className="w-auto cursor-pointer"
              />
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                Jump to today
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface/30">
            <div className="pb-10">{HOURS.map((hour) => renderCalendarRow(hour))}</div>
          </div>
        </div>
      </main>

      {/* AI multi-modal widget */}
      <div className="fixed bottom-8 right-8 z-modal flex flex-col items-end">
        <div
          className={`mb-4 flex w-100 flex-col overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl transition-all duration-300 ${isSimulatorOpen ? "h-137.5 opacity-100" : "h-0 opacity-0"}`}
        >
          <div className="flex shrink-0 items-start justify-between bg-surface px-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-full bg-accent-tint">
                <SparkleIcon className="size-4 text-accent-ink" weight="fill" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface bg-success" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-ink">AI Receptionist</h3>
                <p className="text-[11px] font-medium text-success">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="flex size-8 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-border hover:text-ink"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="mt-2 flex shrink-0 gap-4 border-b border-border bg-surface px-4">
            {(["chat", "whatsapp", "voice"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 pb-2 text-xs font-medium transition-colors ${activeTab === tab ? "border-accent text-accent-ink" : "border-transparent text-ink-muted hover:text-ink"}`}
              >
                {tab === "chat" ? "Web Chat" : tab === "whatsapp" ? "WhatsApp" : "Voice Call"}
              </button>
            ))}
          </div>

          {activeTab === "chat" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar bg-surface/50 p-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-accent text-white" : "border border-border bg-background text-ink"}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-3">
                      <span className="size-1.5 animate-bounce rounded-full bg-ink-subtle" />
                      <span className="size-1.5 animate-bounce rounded-full bg-ink-subtle [animation-delay:0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-ink-subtle [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="shrink-0 border-t border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Message AI to book a slot..."
                    disabled={isTyping}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputText.trim()}
                    aria-label="Send"
                  >
                    <PaperPlaneRightIcon weight="fill" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="flex flex-1 flex-col items-center justify-center bg-surface/50 p-6 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-success-tint text-success">
                <WhatsappLogoIcon className="size-8" weight="fill" />
              </div>
              <h3 className="mb-2 text-base font-medium text-ink">Connect on WhatsApp</h3>
              <p className="mb-6 text-sm text-ink-muted">
                Try the AI receptionist directly from your phone.
              </p>
              <div className="relative mb-6 w-full overflow-hidden rounded-md border border-border bg-background p-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-subtle">
                  Sandbox code (Twilio sandbox - demo only)
                </p>
                <p className="font-mono text-lg font-semibold text-success">join level-plenty</p>
              </div>
              <a
                href="https://wa.me/14155238886?text=join%20level-plenty"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] py-3.5 font-medium text-white transition-opacity hover:opacity-90"
              >
                Launch WhatsApp
              </a>
              <p className="mt-4 text-[10px] text-ink-subtle">
                Send the code above to +1 415 523 8886 to start the demo.
              </p>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface/50 p-6 text-center">
              <div className="z-10 flex flex-col items-center">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">Live AI call</h3>
                <p className="mb-10 max-w-62.5 text-sm text-ink-muted">
                  {callStatus === "inactive"
                    ? "Tap to start a real-time voice conversation with the AI."
                    : callStatus === "connecting"
                      ? "Connecting to the voice service..."
                      : "Call in progress - speak naturally."}
                </p>

                <button
                  onClick={toggleVoiceCall}
                  disabled={callStatus === "connecting"}
                  className={`relative flex size-28 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
                    callStatus === "inactive"
                      ? "bg-ink text-background hover:scale-105"
                      : callStatus === "connecting"
                        ? "bg-warning text-white"
                        : "bg-danger text-white hover:scale-95"
                  }`}
                >
                  {callStatus === "active" && (
                    <span className="absolute size-full animate-ping rounded-full bg-danger/30" />
                  )}
                  {callStatus === "inactive" && <MicrophoneIcon className="size-9" weight="fill" />}
                  {callStatus === "connecting" && <PhoneCallIcon className="size-9 animate-pulse" weight="fill" />}
                  {callStatus === "active" && <StopCircleIcon className="z-10 size-9" weight="fill" />}
                </button>

                <p
                  className={`mt-8 text-xs font-semibold uppercase tracking-widest ${callStatus === "active" ? "text-danger" : "text-ink-subtle"}`}
                >
                  {callStatus === "inactive" ? "Ready" : callStatus === "connecting" ? "Connecting..." : "Listening..."}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSimulatorOpen((v) => !v)}
          className={`flex size-14 items-center justify-center rounded-full border-4 border-background shadow-xl transition-transform hover:scale-105 ${isSimulatorOpen ? "rotate-45 bg-ink text-background" : "bg-accent text-white"}`}
          aria-label={isSimulatorOpen ? "Close AI widget" : "Open AI widget"}
        >
          {isSimulatorOpen ? <XIcon className="size-5" /> : <SparkleIcon className="size-5" weight="fill" />}
        </button>
      </div>

      {/* Booking dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Booking" : "New Booking"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <DialogBody className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Patient name</Label>
                <Input
                  required
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Assign doctor</Label>
                <Select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                >
                  {HOURS.slice(0, -1).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </div>
              {editingId && (
                <div className="col-span-2">
                  <Label>Patient status</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled (upcoming)</option>
                    <option value="Checked-In">Checked-in (waiting area)</option>
                    <option value="Completed">Completed (done)</option>
                    <option value="Cancelled">Cancelled (no show)</option>
                  </Select>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto text-danger hover:bg-danger-tint"
                  disabled={isSubmitting}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Update booking" : "Confirm booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-accent-tint text-accent-ink",
    "Checked-In": "bg-success-tint text-success",
    Cancelled: "bg-danger-tint text-danger",
  };
  return (
    <span
      className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase ${styles[status] || "bg-warning-tint text-warning"}`}
    >
      {status}
    </span>
  );
}
