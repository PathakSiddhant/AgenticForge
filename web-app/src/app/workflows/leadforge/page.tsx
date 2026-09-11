"use client";

import {
  ArrowClockwiseIcon,
  CalendarCheckIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CloudSunIcon,
  DownloadSimpleIcon,
  FireIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  RobotIcon,
  SnowflakeIcon,
  SparkleIcon,
  TableIcon,
  TrashIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react/dist/ssr";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/confirm-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SheetContent,
} from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  company_size?: string;
  score: number;
  status: string;
  budget: string;
  timeline: string;
  pain: string;
  ai_reasoning?: string;
}

interface ScheduledMeeting {
  meeting_id: number;
  lead_id: number;
  name: string;
  email: string;
  company_name: string;
  company_size: string;
  budget: string;
  timeline: string;
  pain_point: string;
  ai_score: number;
  meeting_date: string;
  meeting_time: string;
  meet_link: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

function scoreBadgeVariant(score: number): "success" | "warning" | "neutral" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "neutral";
}

export default function LeadForgeDashboard() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [searchQuery, setSearchQuery] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManualScheduleModalOpen, setIsManualScheduleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const realToday = new Date();
  const todayStr = `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, "0")}-${String(realToday.getDate()).padStart(2, "0")}`;
  const [exportDates, setExportDates] = useState({ start: todayStr, end: todayStr });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedMeetingDetail, setSelectedMeetingDetail] =
    useState<ScheduledMeeting | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    company_size: "",
    budget: "",
    timeline: "",
    pain_point: "",
  });
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});
  const [scheduleData, setScheduleData] = useState({ date: "", time: "10:00 AM" });

  const fetchData = async () => {
    setIsLoadingLeads(true);
    try {
      const [leadsRes, meetsRes] = await Promise.all([
        fetch(`${API}/api/leads`),
        fetch(`${API}/api/leads/meetings`),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.filter((l: Lead) => l.status !== "Meeting Scheduled"));
      }

      if (meetsRes.ok) {
        const meetsData = await meetsRes.json();
        setMeetings(meetsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Couldn't reach the backend. Is ai-engine running?");
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSilent = async () => {
      try {
        const [leadsRes, meetsRes] = await Promise.all([
          fetch(`${API}/api/leads`),
          fetch(`${API}/api/leads/meetings`),
        ]);
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(data.filter((l: Lead) => l.status !== "Meeting Scheduled"));
        }
        if (meetsRes.ok) {
          setMeetings(await meetsRes.json());
        }
      } catch {
        // Silent background refresh - the initial load already surfaces errors.
      }
    };
    const intervalId = setInterval(fetchSilent, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const hotCount = leads.filter((l) => l.status === "Hot").length;
  const warmCount = leads.filter((l) => l.status === "Warm").length;
  const coldCount = leads.filter((l) => l.status === "Cold").length;

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeetings = meetings.filter(
    (meet) =>
      meet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meet.company_name && meet.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (meet.email && meet.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/leads/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "Manual Simulation" }),
      });
      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          company_name: "",
          company_size: "",
          budget: "",
          timeline: "",
          pain_point: "",
        });
        fetchData();
      } else {
        toast.error("Couldn't save this lead. Check the details and try again.");
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Couldn't reach the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/leads/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          company_name: editFormData.company,
          company_size: editFormData.company_size,
          budget: editFormData.budget,
          timeline: editFormData.timeline,
          pain_point: editFormData.pain,
          lead_status: editFormData.status,
        }),
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        toast.success("Lead updated.");
        fetchData();
      } else {
        toast.error("Couldn't save changes.");
      }
    } catch (error) {
      console.error("Error editing lead:", error);
      toast.error("Couldn't reach the backend.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (selectedLead) {
      setEditFormData({ ...selectedLead });
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    const confirmed = await confirm({
      title: "Delete this lead?",
      description: "This permanently removes the lead. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      const response = await fetch(`${API}/api/leads/${leadId}`, { method: "DELETE" });
      if (response.ok) {
        setSelectedLead(null);
        toast.success("Lead deleted.");
        fetchData();
      } else {
        toast.error("Couldn't delete this lead.");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Couldn't reach the backend.");
    }
  };

  const handleManualSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/leads/schedule-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          date: scheduleData.date,
          time: scheduleData.time,
        }),
      });
      if (res.ok) {
        setIsManualScheduleModalOpen(false);
        setSelectedLead(null);
        fetchData();
        toast.success("Meeting scheduled and confirmation email sent.");
      } else {
        toast.error("Couldn't schedule this meeting.");
      }
    } catch (error) {
      console.error("Schedule error:", error);
      toast.error("Couldn't reach the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (leadId: number) => {
    const confirmed = await confirm({
      title: "Mark meeting as done?",
      description: "This permanently removes the lead and meeting from the database.",
      confirmLabel: "Mark done",
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/api/leads/meetings/${leadId}/complete`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedMeetingDetail(null);
        fetchData();
      } else {
        toast.error("Couldn't update this meeting.");
      }
    } catch (error) {
      console.error("Complete error:", error);
      toast.error("Couldn't reach the backend.");
    }
  };

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const getDateString = (day: number) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const currentDatePickerValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const displayedUpcomingMeetings = searchQuery
    ? filteredMeetings
    : meetings.filter((m) => m.meeting_date === currentDatePickerValue);

  const totalActiveLeads = leads.length;
  const scheduledMeetingsCount = meetings.length;
  const totalEver = totalActiveLeads + scheduledMeetingsCount;
  const conversionRate = totalEver > 0 ? Math.round((scheduledMeetingsCount / totalEver) * 100) : 0;

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <button
      onClick={() => setSelectedLead(lead)}
      className="flex flex-col justify-between rounded-md border border-border bg-background p-4 text-left transition-colors hover:border-border-strong hover:bg-surface"
    >
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-background">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-medium text-ink">{lead.name}</h4>
              <p className="max-w-30 truncate text-xs text-ink-muted">{lead.company}</p>
            </div>
          </div>
          <Badge variant={scoreBadgeVariant(lead.score)}>{lead.score}</Badge>
        </div>
        <div className="mb-2.5 flex gap-1.5">
          <Badge variant="neutral">{lead.budget || "N/A"}</Badge>
          <Badge variant="neutral">{lead.timeline || "N/A"}</Badge>
        </div>
        <p className="line-clamp-2 rounded-md bg-surface p-2.5 text-xs italic text-ink-muted">
          &quot;{lead.pain}&quot;
        </p>
      </div>
    </button>
  );

  return (
    <div className="w-full px-4 pt-8 pb-12 text-ink sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-[28px]">
            LeadForge CRM
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enterprise pipeline and automated meeting management.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              setIsLoadingLeads(true);
              fetchData();
            }}
          >
            <ArrowClockwiseIcon
              className={isLoadingLeads ? "animate-spin" : ""}
              weight="bold"
            />
            Sync
          </Button>

          <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
            <DownloadSimpleIcon weight="bold" />
            Export Reports
          </Button>

          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute inset-y-0 left-3 my-auto size-4 text-ink-subtle" />
            <Input
              placeholder={activeTab === "pipeline" ? "Search leads..." : "Search meetings..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="secondary" onClick={() => { setIsSimulateModalOpen(true); setSuccess(false); }}>
            + Simulate Lead
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TableIcon} label="Total Leads in Pipeline" value={totalActiveLeads} />
        <StatCard icon={FireIcon} label="Ready for closing" value={hotCount} accent />
        <StatCard icon={CalendarCheckIcon} label="Upcoming Architecture Calls" value={scheduledMeetingsCount} />
        <StatCard icon={LightningIcon} label="Pipeline to Meeting ratio" value={`${conversionRate}%`} />
      </div>

      <div className="mb-6 flex space-x-6 border-b border-border">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`border-b-2 pb-2.5 text-sm font-medium transition-colors ${activeTab === "pipeline" ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}
        >
          Pipeline Categories
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`border-b-2 pb-2.5 text-sm font-medium transition-colors ${activeTab === "calendar" ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}
        >
          Meetings &amp; Calendar ({meetings.length})
        </button>
      </div>

      {isLoadingLeads ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          <span className="ml-3 text-sm font-medium text-ink-muted">
            Loading live leads &amp; meetings...
          </span>
        </div>
      ) : activeTab === "pipeline" ? (
        searchQuery ? (
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">
              Search results ({filteredLeads.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CategoryCard
              icon={FireIcon}
              label="Hot Leads"
              description="Score 70+. Ready for immediate closing."
              count={hotCount}
              onClick={() => setSelectedCategory("Hot")}
            />
            <CategoryCard
              icon={CloudSunIcon}
              label="Warm Leads"
              description="Score 40-69. In automated nurturing."
              count={warmCount}
              onClick={() => setSelectedCategory("Warm")}
            />
            <CategoryCard
              icon={SnowflakeIcon}
              label="Cold / Archive"
              description="Score under 40. Routed to newsletter."
              count={coldCount}
              onClick={() => setSelectedCategory("Cold")}
            />
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-6 xl:col-span-2">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-base font-semibold text-ink">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="rounded-sm bg-surface p-1.5 text-ink-muted transition-colors hover:bg-border hover:text-ink"
                >
                  <CaretLeftIcon className="size-3.5" />
                </button>
                <input
                  type="date"
                  value={currentDatePickerValue}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split("-");
                      setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)));
                    }
                  }}
                  className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink outline-none focus:border-accent"
                />
                <button
                  onClick={nextMonth}
                  className="rounded-sm bg-surface p-1.5 text-ink-muted transition-colors hover:bg-border hover:text-ink"
                >
                  <CaretRightIcon className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const fullDateStr = getDateString(day);
                const isPastDate = fullDateStr < todayStr;
                const dayMeetings = meetings.filter((m) => m.meeting_date === fullDateStr);
                const isSelected = currentDate.getDate() === day;

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (!isPastDate) {
                        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      }
                    }}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-md border transition-colors ${
                      isPastDate
                        ? "cursor-not-allowed border-transparent bg-surface opacity-40"
                        : isSelected
                          ? "cursor-pointer border-accent bg-accent text-white"
                          : "cursor-pointer border-border bg-background text-ink hover:border-border-strong"
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {dayMeetings.length > 0 && (
                      <div
                        className={`mt-1 w-full truncate rounded-sm px-1 py-0.5 text-center text-[9px] font-semibold ${isSelected ? "bg-white/20 text-white" : "bg-accent-tint text-accent-ink"}`}
                      >
                        {dayMeetings.length} call{dayMeetings.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-5">
              <h3 className="mb-4 text-sm font-semibold text-ink">
                {searchQuery ? "Search results" : `Calls for ${currentDatePickerValue}`}
              </h3>
              {displayedUpcomingMeetings.length === 0 ? (
                <p className="py-4 text-center text-sm text-ink-muted">No meetings found.</p>
              ) : (
                <div className="max-h-[600px] space-y-3 overflow-y-auto custom-scrollbar pr-1">
                  {displayedUpcomingMeetings.map((meeting) => (
                    <button
                      key={meeting.meeting_id}
                      onClick={() => setSelectedMeetingDetail(meeting)}
                      className="flex w-full items-center gap-3 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong"
                    >
                      <div className="min-w-[50px] rounded-sm border border-border bg-background p-1.5 text-center">
                        <p className="text-[9px] font-semibold uppercase text-accent-ink">
                          {meeting.meeting_date.substring(5, 7)}/{meeting.meeting_date.substring(8, 10)}
                        </p>
                        <p className="text-sm font-semibold text-ink">{meeting.meeting_time.split(" ")[0]}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-ink">{meeting.name}</h4>
                        <p className="truncate text-[11px] text-ink-muted">
                          {meeting.company_name || "Company N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <a
                          href={meeting.meet_link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-sm bg-accent px-2.5 py-1 text-center text-[10px] font-semibold text-white hover:bg-accent-hover"
                        >
                          Join
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkComplete(meeting.lead_id); }}
                          className="rounded-sm border border-success/20 bg-success-tint px-2.5 py-1 text-center text-[10px] font-semibold text-success"
                        >
                          Done
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meeting detail sheet */}
      <Dialog
        open={!!selectedMeetingDetail}
        onOpenChange={(open) => !open && setSelectedMeetingDetail(null)}
      >
        <SheetContent>
          {selectedMeetingDetail && (
            <>
              <DialogHeader className="bg-accent text-white">
                <DialogTitle className="text-white">Meeting Details</DialogTitle>
                <p className="mt-1 text-xs font-medium text-white/80">
                  {selectedMeetingDetail.meeting_date} at {selectedMeetingDetail.meeting_time}
                </p>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface p-6">
                <h3 className="text-xl font-semibold text-ink">{selectedMeetingDetail.name}</h3>
                <p className="mt-1 text-sm font-medium text-accent-ink">
                  {selectedMeetingDetail.company_name || "Company N/A"}
                </p>

                <div className="mt-5 space-y-3">
                  <DetailRow label="Contact Email" value={selectedMeetingDetail.email || "N/A"} />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Company Size" value={selectedMeetingDetail.company_size || "N/A"} />
                    <DetailRow label="Budget" value={selectedMeetingDetail.budget || "N/A"} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-background p-4">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                        Timeline
                      </p>
                      <p className="text-sm font-medium text-ink">{selectedMeetingDetail.timeline || "N/A"}</p>
                    </div>
                    <Badge variant={scoreBadgeVariant(selectedMeetingDetail.ai_score)}>
                      <RobotIcon className="size-3" /> {selectedMeetingDetail.ai_score}
                    </Badge>
                  </div>
                  <div className="pt-2">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                      Pre-call context
                    </p>
                    <p className="rounded-md border border-border bg-background p-4 text-sm italic text-ink-muted">
                      &quot;{selectedMeetingDetail.pain_point || "No specific needs mentioned."}&quot;
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 border-t border-border bg-background p-5">
                <a href={selectedMeetingDetail.meet_link} target="_blank" rel="noreferrer">
                  <Button className="w-full">
                    <VideoCameraIcon weight="fill" /> Join Google Meet
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full border-success/20 bg-success-tint text-success hover:bg-success-tint"
                  onClick={() => handleMarkComplete(selectedMeetingDetail.lead_id)}
                >
                  Mark meeting as done
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Dialog>

      {/* Pipeline category dialog */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedCategory} Pipeline</DialogTitle>
          </DialogHeader>
          <DialogBody className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leads.filter((l) => l.status === selectedCategory).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Simulate lead dialog */}
      <Dialog open={isSimulateModalOpen} onOpenChange={setIsSimulateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Lead Registration</DialogTitle>
            <p className="mt-1 text-xs text-ink-muted">Manual injection into the AI pipeline.</p>
          </DialogHeader>
          <DialogBody>
            {success ? (
              <div className="rounded-md border border-success/20 bg-success-tint p-6 text-center">
                <SparkleIcon className="mx-auto mb-2 size-6 text-success" />
                <h3 className="mb-1 text-base font-semibold text-success">Lead captured</h3>
                <p className="mb-5 text-xs text-success/80">The AI engine is analyzing and routing this lead.</p>
                <Button variant="primary" onClick={() => setSuccess(false)}>
                  Inject another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Full name *</Label>
                    <Input required name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Work email *</Label>
                    <Input required type="email" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Company name</Label>
                    <Input name="company_name" value={formData.company_name} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Company size</Label>
                    <Select name="company_size" value={formData.company_size} onChange={handleChange}>
                      <option value="">Select size...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="200+">200+ employees</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Monthly budget</Label>
                    <Select name="budget" value={formData.budget} onChange={handleChange}>
                      <option value="">Select budget...</option>
                      <option value="< $1k">Under $1k</option>
                      <option value="$1k - $5k">$1k - $5k</option>
                      <option value="$5k - $10k">$5k - $10k</option>
                      <option value="$10k+">$10k+</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <Select name="timeline" value={formData.timeline} onChange={handleChange}>
                      <option value="">Select urgency...</option>
                      <option value="ASAP">ASAP (immediate)</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Pain point</Label>
                  <Textarea name="pain_point" value={formData.pain_point} onChange={handleChange} rows={3} />
                </div>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsSimulateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Submit"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit lead dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead Data</DialogTitle>
            <p className="mt-1 text-xs text-ink-muted">Update lead info or change status manually.</p>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Full name</Label>
                  <Input required name="name" value={editFormData.name || ""} onChange={handleEditChange} />
                </div>
                <div>
                  <Label>Pipeline status</Label>
                  <Select name="status" value={editFormData.status || ""} onChange={handleEditChange}>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Company name</Label>
                  <Input name="company" value={editFormData.company || ""} onChange={handleEditChange} />
                </div>
                <div>
                  <Label>Work email</Label>
                  <Input type="email" name="email" value={editFormData.email || ""} onChange={handleEditChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label>Company size</Label>
                  <Select name="company_size" value={editFormData.company_size || ""} onChange={handleEditChange}>
                    <option value="">Select size...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="200+">200+</option>
                  </Select>
                </div>
                <div>
                  <Label>Budget</Label>
                  <Select name="budget" value={editFormData.budget || ""} onChange={handleEditChange}>
                    <option value="">Select budget...</option>
                    <option value="< $1k">Under $1k</option>
                    <option value="$1k - $5k">$1k - $5k</option>
                    <option value="$5k - $10k">$5k - $10k</option>
                    <option value="$10k+">$10k+</option>
                  </Select>
                </div>
                <div>
                  <Label>Timeline</Label>
                  <Select name="timeline" value={editFormData.timeline || ""} onChange={handleEditChange}>
                    <option value="">Select urgency...</option>
                    <option value="ASAP">ASAP</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Pain point</Label>
                <Textarea name="pain" value={editFormData.pain || ""} onChange={handleEditChange} rows={2} />
              </div>
              <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Manual schedule dialog */}
      <Dialog
        open={isManualScheduleModalOpen}
        onOpenChange={setIsManualScheduleModalOpen}
      >
        <DialogContent className="max-w-sm">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>Book call with {selectedLead.name}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <form onSubmit={handleManualSchedule} className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      required
                      type="date"
                      min={todayStr}
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      required
                      placeholder="e.g. 02:00 PM"
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    />
                  </div>
                  <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setIsManualScheduleModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Booking..." : "Book & email"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export reports dialog */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Business Reports</DialogTitle>
            <p className="mt-1 text-xs text-ink-muted">Data-driven insights and AI memos.</p>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From date</Label>
                <Input
                  type="date"
                  value={exportDates.start}
                  onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                />
              </div>
              <div>
                <Label>To date</Label>
                <Input
                  type="date"
                  value={exportDates.end}
                  onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-5">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `${API}/api/export/excel?start_date=${exportDates.start}&end_date=${exportDates.end}`,
                    "_blank"
                  )
                }
              >
                <TableIcon weight="bold" /> Download Excel workbook
              </Button>
              <Button
                onClick={() =>
                  window.open(
                    `${API}/api/export/ai-memo?start_date=${exportDates.start}&end_date=${exportDates.end}`,
                    "_blank"
                  )
                }
              >
                <SparkleIcon weight="bold" /> Generate AI executive memo
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Lead detail sheet */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent>
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>Lead Intelligence</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <h3 className="text-xl font-semibold text-ink">{selectedLead.name}</h3>
                <p className="mb-5 mt-1 text-sm font-medium text-accent-ink">{selectedLead.company}</p>

                <div className="mb-5 rounded-md border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      AI score
                    </span>
                    <Badge variant={scoreBadgeVariant(selectedLead.score)}>
                      {selectedLead.score}/100
                    </Badge>
                  </div>
                  {selectedLead.ai_reasoning && (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                        <RobotIcon className="size-3" /> Agent&apos;s note
                      </p>
                      <p className="text-xs font-medium text-ink">&quot;{selectedLead.ai_reasoning}&quot;</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <DetailRow label="Contact Email" value={selectedLead.email} breakWord />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Company Size" value={selectedLead.company_size || "N/A"} />
                    <DetailRow label="Budget" value={selectedLead.budget || "N/A"} />
                  </div>
                  <DetailRow label="Timeline" value={selectedLead.timeline || "N/A"} />
                  <div className="pt-2">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                      Pain point
                    </p>
                    <p className="rounded-md border border-border bg-surface p-4 text-sm italic text-ink-muted">
                      &quot;{selectedLead.pain}&quot;
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-border p-5">
                <Button className="w-full" onClick={() => setIsManualScheduleModalOpen(true)}>
                  <CalendarCheckIcon weight="fill" /> Schedule meeting
                </Button>
                <Button variant="outline" className="w-full" onClick={openEditModal}>
                  <PencilSimpleIcon /> Edit lead profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-danger hover:bg-danger-tint"
                  onClick={() => handleDeleteLead(selectedLead.id)}
                >
                  <TrashIcon /> Delete lead
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: StatIcon,
  label,
  value,
  accent,
}: {
  icon: typeof FireIcon;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div
        className={`flex size-9 items-center justify-center rounded-md ${accent ? "bg-accent-tint text-accent-ink" : "bg-surface text-ink-muted"}`}
      >
        <StatIcon className="size-[18px]" weight={accent ? "fill" : "regular"} />
      </div>
      <h3 className="mt-3 text-[26px] font-semibold text-ink">{value}</h3>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}

function CategoryCard({
  icon: CategoryIcon,
  label,
  description,
  count,
  onClick,
}: {
  icon: typeof FireIcon;
  label: string;
  description: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-lg border border-border bg-background p-6 text-left transition-colors hover:border-border-strong hover:bg-surface"
    >
      <div className="mb-4 flex w-full items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-md bg-surface text-ink-muted">
          <CategoryIcon className="size-5" />
        </div>
        <span className="text-2xl font-semibold text-ink">{count}</span>
      </div>
      <h3 className="text-[15px] font-medium text-ink">{label}</h3>
      <p className="mt-1 text-xs text-ink-muted">{description}</p>
    </button>
  );
}

function DetailRow({
  label,
  value,
  breakWord,
}: {
  label: string;
  value: string;
  breakWord?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className={`text-sm font-medium text-ink ${breakWord ? "break-words" : ""}`}>{value}</p>
    </div>
  );
}
