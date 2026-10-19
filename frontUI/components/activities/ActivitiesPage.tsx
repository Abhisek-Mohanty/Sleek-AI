"use client";

import React, { useState } from "react";
import {
  CalendarCheck2,
  Plus,
  Clock,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Edit2,
  Check,
  List,
  CalendarDays,
  User,
  Filter,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Activity, ActivityType, PriorityLevel } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ActivitiesPage() {
  const {
    activities,
    enquiries,
    representatives,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleActivityStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "overdue" | "completed">("today");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Create activity form state
  const [title, setTitle] = useState("");
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(enquiries[0]?.id || "");
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState("11:00 AM");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [notes, setNotes] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const enq = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

    addActivity({
      enquiryId: enq.id,
      enquiryName: `${enq.fullName} (${enq.company || enq.city})`,
      title: title.trim(),
      type: activityType,
      dueDate,
      dueTime,
      assignedRepId: enq.assignedRepId,
      assignedRepName: enq.assignedRepName,
      priority,
      status: "pending",
      notes: notes.trim() || undefined,
    });

    setTitle("");
    setNotes("");
    setIsCreateOpen(false);
  };

  // Filtered by tab and type
  const filteredActivities = activities.filter((act) => {
    const matchesType = typeFilter === "All" || act.type === typeFilter;
    if (!matchesType) return false;

    if (activeTab === "completed") return act.status === "completed";
    if (activeTab === "overdue") return act.status === "overdue" || (act.status === "pending" && act.dueDate < todayStr);
    if (activeTab === "today") return act.dueDate === todayStr && act.status !== "completed";
    if (activeTab === "upcoming") return act.dueDate > todayStr && act.status !== "completed";
    return true;
  });

  const overdueCount = activities.filter(
    (a) => a.status === "overdue" || (a.status === "pending" && a.dueDate < todayStr)
  ).length;

  const todayCount = activities.filter(
    (a) => a.dueDate === todayStr && a.status !== "completed"
  ).length;

  const upcomingCount = activities.filter(
    (a) => a.dueDate > todayStr && a.status !== "completed"
  ).length;

  const completedCount = activities.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Activities & Follow-ups
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage discovery calls, executive meetings, demo sessions, and scheduled follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors",
                viewMode === "list" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors",
                viewMode === "calendar" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule Activity
          </button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("today")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              activeTab === "today"
                ? "bg-brand-50 text-brand-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            Today ({todayCount})
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              activeTab === "upcoming"
                ? "bg-brand-50 text-brand-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              activeTab === "overdue"
                ? "bg-rose-50 text-rose-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              activeTab === "completed"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Activity Type Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs text-slate-800 bg-white"
          >
            <option value="All">All Types</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="follow_up">Follow-ups</option>
            <option value="task">Internal Tasks</option>
          </select>
        </div>
      </div>

      {/* Overdue Warning Alert Banner if overdue > 0 */}
      {overdueCount > 0 && activeTab !== "completed" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>
              <strong>{overdueCount} overdue actions</strong> require immediate outreach to prevent lead stall.
            </span>
          </div>
          <button
            onClick={() => setActiveTab("overdue")}
            className="text-amber-800 font-bold hover:underline"
          >
            Review Overdue →
          </button>
        </div>
      )}

      {/* Main Activities Content */}
      {viewMode === "list" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-subtle overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-600">
                No activities found in this view.
              </div>
            ) : (
              filteredActivities.map((act) => {
                const isDone = act.status === "completed";
                const isOverdue = act.status === "overdue" || (act.status === "pending" && act.dueDate < todayStr);

                return (
                  <div
                    key={act.id}
                    className={cn(
                      "p-4 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/70",
                      isDone ? "bg-slate-50/40 opacity-75" : ""
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleActivityStatus(act.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        title={isDone ? "Mark pending" : "Mark completed"}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5",
                            isDone ? "text-emerald-600 fill-emerald-50" : "text-slate-300"
                          )}
                        />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={cn(
                              "text-xs font-bold text-slate-900",
                              isDone && "line-through text-slate-600"
                            )}
                          >
                            {act.title}
                          </h4>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.2 rounded-full capitalize",
                              act.type === "meeting"
                                ? "bg-purple-50 text-purple-700"
                                : act.type === "call"
                                ? "bg-sky-50 text-sky-700"
                                : act.type === "email"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {act.type}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase",
                              act.priority === "High"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {act.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          Enquiry: <strong className="text-slate-800">{act.enquiryName}</strong>
                        </p>

                        {act.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            &ldquo;{act.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-semibold text-slate-900",
                            isOverdue && !isDone && "text-rose-600 font-bold"
                          )}
                        >
                          {act.dueDate}
                        </p>
                        <p className="text-[11px] text-slate-600">{act.dueTime || "11:00 AM"}</p>
                      </div>

                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete activity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Calendar-style weekly view */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, idx) => {
            return (
              <div key={day} className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-subtle min-h-[300px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">{day}</span>
                  <span className="text-[10px] text-slate-600">Day {idx + 1}</span>
                </div>
                <div className="space-y-2">
                  {filteredActivities.slice(idx * 2, idx * 2 + 2).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 hover:border-brand-300 transition-colors"
                    >
                      <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{item.enquiryName}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
                        <span className="capitalize text-brand-600 font-semibold">{item.type}</span>
                        <span>{item.dueTime || "11:00 AM"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Activity Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-dropdown space-y-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Sales Activity</h3>
            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Discovery Call with CEO"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Enquiry Lead
                </label>
                <select
                  value={selectedEnquiryId}
                  onChange={(e) => setSelectedEnquiryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  {enquiries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.company || e.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="task">Internal Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Time
                  </label>
                  <input
                    type="text"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preparation Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key agenda items, collateral to present..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 text-white px-4 py-1.5 text-xs font-semibold hover:bg-brand-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
