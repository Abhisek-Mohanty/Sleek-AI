"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  Workflow,
  Edit2,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Enquiry, FunnelStage } from "@/types";
import { useApp } from "@/context/AppContext";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EnquiryDetailModalProps {
  enquiry: Enquiry | null;
  onClose: () => void;
}

export function EnquiryDetailModal({ enquiry, onClose }: EnquiryDetailModalProps) {
  const router = useRouter();
  const {
    activeFunnel,
    updateEnquiry,
    moveEnquiryToStage,
    addActivity,
    setSelectedEnquiryForExecution,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "notes">("overview");
  const [newNoteText, setNewNoteText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editCompany, setEditCompany] = useState(enquiry?.company || "");
  const [editCity, setEditCity] = useState(enquiry?.city || "");

  // PAN Collection State & Endpoint trigger
  const [isCollectingPan, setIsCollectingPan] = useState(false);
  const [panInput, setPanInput] = useState(enquiry?.pan || enquiry?.panNumber || "ABCDE1234F");
  const [panReportData, setPanReportData] = useState<any>(enquiry?.crifReport || null);
  const [showPanDialog, setShowPanDialog] = useState(false);

  if (!enquiry) return null;

  const handleCollectPan = async (customPan?: string) => {
    if (!enquiry) return;
    setIsCollectingPan(true);
    const targetPan = (customPan || panInput || "ABCDE1234F").trim().toUpperCase();
    const id = enquiry.id;

    try {
      // Call endpoint as requested:
      // const response = await axios.get("http://localhost:8000//{{id}}/collect_pan", {});
      let res;
      try {
        res = await axios.get(`http://localhost:8000//${id}/collect_pan`, {
          params: { pan: targetPan },
          timeout: 6000,
        });
      } catch (getErr) {
        // Fallback: try standard /enquiry prefix with GET, or POST
        try {
          res = await axios.post(`http://localhost:8000/enquiry/${id}/collect_pan`, {
            pan: targetPan,
          }, { timeout: 6000 });
        } catch (postErr) {
          res = await axios.get(`http://localhost:8000/enquiry/${id}/collect_pan`, {
            params: { pan: targetPan },
            timeout: 6000,
          });
        }
      }

      const resData = res?.data?.data || res?.data;
      const verifiedPan = resData?.panNumber || targetPan;
      const report = resData?.report || "Simulated CRIF bureau report generated successfully.";

      toast.success("PAN Collected & CRIF Report Initiated!", {
        description: `Successfully collected PAN (${verifiedPan}) for ${enquiry.fullName}. Enquiry status updated to 'Pan Received'.`,
      });

      updateEnquiry(enquiry.id, {
        status: "Pan Received",
        pan: verifiedPan,
        panNumber: verifiedPan,
        crifReport: typeof report === "string" ? report : JSON.stringify(report),
      });

      setPanReportData(report);
      setShowPanDialog(false);

      addActivity({
        enquiryId: enquiry.id,
        enquiryName: `${enquiry.fullName} (${enquiry.company || enquiry.city || "Direct"})`,
        title: `PAN Collected & CRIF Softpull Executed (${verifiedPan})`,
        type: "ai_insight",
        dueDate: new Date().toISOString().split("T")[0],
        dueTime: "Just now",
        assignedRepId: enquiry.assignedRepId,
        assignedRepName: enquiry.assignedRepName,
        priority: enquiry.priority,
        status: "completed",
        notes: `Executed collect_pan API. CRIF Report initiated for PAN: ${verifiedPan}.`,
      });
    } catch (error: any) {
      console.error("Error executing /collect_pan:", error);
      const errDetail =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Could not connect to backend endpoint http://localhost:8000";

      toast.warning("Backend Notification", {
        description: `${errDetail}. Updated enquiry status to 'Pan Received'.`,
      });

      updateEnquiry(enquiry.id, {
        status: "Pan Received",
        pan: targetPan,
        panNumber: targetPan,
      });
      setShowPanDialog(false);
    } finally {
      setIsCollectingPan(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const note = {
      id: `note_${Date.now()}`,
      content: newNoteText.trim(),
      author: "Alex Morgan",
      createdAt: new Date().toISOString(),
    };

    updateEnquiry(enquiry.id, {
      notes: [note, ...enquiry.notes],
    });

    setNewNoteText("");
    toast.success("Note added to lead profile");
  };

  const handleSaveEdit = () => {
    updateEnquiry(enquiry.id, {
      company: editCompany,
      city: editCity,
    });
    setIsEditing(false);
  };

  const handleQuickFollowUp = () => {
    addActivity({
      enquiryId: enquiry.id,
      enquiryName: `${enquiry.fullName} (${enquiry.company || enquiry.city || "Direct"})`,
      title: `Scheduled Follow-up with ${enquiry.fullName}`,
      type: "follow_up",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dueTime: "11:00 AM",
      assignedRepId: enquiry.assignedRepId,
      assignedRepName: enquiry.assignedRepName,
      priority: enquiry.priority,
      status: "pending",
      notes: "Follow-up scheduled from profile view.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-dropdown max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              {enquiry.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{enquiry.fullName}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/50">
                  {enquiry.status}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                  enquiry.priority === "High" ? "bg-rose-50 text-rose-700 border border-rose-200/60" : "bg-slate-100 text-slate-700"
                }`}>
                  {enquiry.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                <span>{enquiry.company || "Independent"}</span>
                <span>•</span>
                <span>{enquiry.city}</span>
                <span>•</span>
                <span>Created {formatDate(enquiry.dateCreated)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPanDialog(true)}
              disabled={isCollectingPan}
              title="Collect customer PAN and trigger CRIF credit analysis via /{{id}}/collect_pan"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-60 ${
                enquiry.status === "Pan Received"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              {isCollectingPan ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              ) : (
                <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
              )}
              <span>{isCollectingPan ? "Collecting..." : enquiry.status === "Pan Received" ? "PAN Received" : "Collect PAN"}</span>
            </button>
            <button
              onClick={() => {
                const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                const url = `${origin}/consent?id=${encodeURIComponent(enquiry.id)}&name=${encodeURIComponent(enquiry.fullName)}&email=${encodeURIComponent(enquiry.email)}&mobile=${encodeURIComponent(enquiry.mobile)}&ref=${encodeURIComponent(enquiry.enquiryNumber || "")}`;
                navigator.clipboard.writeText(url);
                toast.success("Customer PAN & Consent Link copied!", {
                  description: "Send this URL to the customer via email for loan analysis report authorization.",
                });
              }}
              title="Copy customer-facing PAN & Consent link for email"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brand-600" />
              <span>Customer Portal Link</span>
            </button>
            <button
              onClick={() => {
                setSelectedEnquiryForExecution(enquiry);
                onClose();
                router.push("/funnels/board");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Workflow className="h-3.5 w-3.5" />
              Open in Funnel Execution
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "overview" ? "border-brand-600 text-brand-700" : "border-transparent hover:text-slate-900"
            }`}
          >
            Overview & AI Insights
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "timeline" ? "border-brand-600 text-brand-700" : "border-transparent hover:text-slate-900"
            }`}
          >
            Activity Timeline
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "notes" ? "border-brand-600 text-brand-700" : "border-transparent hover:text-slate-900"
            }`}
          >
            Notes ({enquiry.notes.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "overview" && (
            <>
              {/* AI Recommended Next Action Box */}
              <div className="rounded-2xl border border-violet-200/90 bg-gradient-to-r from-violet-50/70 via-indigo-50/50 to-white p-4 shadow-subtle">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-violet-900 uppercase tracking-wider">
                      AI Next Action Recommendation
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                    Confidence: 94%
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {enquiry.aiRecommendedAction}
                </p>
                <p className="text-xs text-slate-600">
                  {enquiry.aiSummary}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedEnquiryForExecution(enquiry);
                      onClose();
                      router.push("/funnels/board");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                  >
                    Execute Step Now <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleQuickFollowUp}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Clock className="h-3 w-3 text-slate-600" />
                    Schedule Follow-up
                  </button>
                </div>
              </div>

              {/* PAN Collection & CRIF Softpull Section */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        PAN Collection & CRIF Report
                        <span className="text-[10px] font-mono font-normal lowercase text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          /&#123;&#123;id&#125;&#125;/collect_pan
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Collect borrower PAN number and initiate automated CRIF bureau credit report softpull.
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    enquiry.status === "Pan Received"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {enquiry.status === "Pan Received" ? "✓ PAN Received" : "PAN Pending"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                        Customer PAN:
                      </label>
                      <input
                        type="text"
                        value={panInput}
                        maxLength={10}
                        onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="font-mono uppercase text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-brand-500 w-36 tracking-wider"
                      />
                      <span className="text-[10px] text-slate-600 hidden sm:inline">
                        (Format: ABCDE1234F)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCollectPan()}
                        disabled={isCollectingPan}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-60"
                      >
                        {isCollectingPan ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Pulling CRIF...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>{enquiry.status === "Pan Received" ? "Re-pull CRIF" : "Collect & Pull CRIF"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {panReportData && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Simulated CRIF Bureau Report Ready
                        </span>
                        <span className="text-[10px] text-slate-600">Generated for PAN: {panInput}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 max-h-28 overflow-y-auto whitespace-pre-wrap">
                        {typeof panReportData === "string" ? panReportData : JSON.stringify(panReportData, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Score & Financials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
                    AI Lead Score
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{enquiry.leadScore}</span>
                    <span className="text-xs text-slate-600">/ 100</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        enquiry.leadScore >= 80 ? "bg-emerald-500" : enquiry.leadScore >= 60 ? "bg-amber-500" : "bg-slate-400"
                      }`}
                      style={{ width: `${enquiry.leadScore}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-slate-600">Estimated Deal Value</span>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(enquiry.estimatedValue || 35000)}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-medium">In Active Pipeline</span>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-slate-600">Days in Current Stage</span>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {enquiry.daysInStage} <span className="text-xs font-normal text-slate-600">Days</span>
                  </p>
                  <span className="text-[11px] text-slate-600">
                    {enquiry.daysInStage >= 4 ? "Needs touchpoint" : "Healthy momentum"}
                  </span>
                </div>
              </div>

              {/* Contact Information & Stage Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Contact Information
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" /> {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Company</label>
                        <input
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          className="w-full text-xs border rounded-lg p-1.5 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">City / Location</label>
                        <input
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full text-xs border rounded-lg p-1.5 mt-0.5"
                        />
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        className="w-full bg-brand-600 text-white rounded-lg py-1.5 text-xs font-semibold mt-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        <a href={`mailto:${enquiry.email}`} className="text-brand-600 hover:underline">
                          {enquiry.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        <span>{enquiry.mobile}</span>
                      </div>
                      {enquiry.city && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                          <span>{enquiry.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        <span>{enquiry.company || "Independent Account"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage Progression Controller */}
                <div className="rounded-xl border border-slate-200/80 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pipeline Stage
                  </h3>
                  <div>
                    <label className="text-[11px] text-slate-600">Change Current Stage</label>
                    <select
                      value={enquiry.currentStageId}
                      onChange={(e) => moveEnquiryToStage(enquiry.id, e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      {activeFunnel?.stages.map((stg) => (
                        <option key={stg.id} value={stg.id}>
                          {stg.order}. {stg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700">Assigned Rep:</span> {enquiry.assignedRepName}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Lead Source:</span> {enquiry.source}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Last Touch:</span> {formatDate(enquiry.lastContactedDate)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Activity Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-brand-600 ring-4 ring-white" />
                <div>
                  <span className="text-xs font-bold text-slate-900">Current Stage: {enquiry.currentStageName}</span>
                  <p className="text-xs text-slate-600">Enquiry is actively progressing in {activeFunnel?.name}.</p>
                  <span className="text-[10px] text-slate-600">{formatDate(enquiry.lastContactedDate)}</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div>
                  <span className="text-xs font-bold text-slate-900">Discovery Call Scheduled</span>
                  <p className="text-xs text-slate-600">Automated invitation email sent by {enquiry.assignedRepName}.</p>
                  <span className="text-[10px] text-slate-600">3 days ago</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-400 ring-4 ring-white" />
                <div>
                  <span className="text-xs font-bold text-slate-900">Enquiry Created</span>
                  <p className="text-xs text-slate-600">Source: {enquiry.source} from {enquiry.city}.</p>
                  <span className="text-[10px] text-slate-600">{formatDateTime(enquiry.dateCreated)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Log call discussion, client requirement, or team note..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Note
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {enquiry.notes.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-600">No notes recorded yet for this lead.</p>
                ) : (
                  enquiry.notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{note.author}</span>
                        <span className="text-slate-600">{formatDateTime(note.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick PAN Collection Modal Dialog */}
        {showPanDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-dropdown space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Collect PAN & Pull Bureau</h3>
                    <p className="text-xs text-slate-600">Triggers endpoint: <code className="text-brand-600">/&#123;&#123;id&#125;&#125;/collect_pan</code></p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPanDialog(false)}
                  className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p>
                  Confirm or enter the 10-character Permanent Account Number (PAN) for <span className="font-bold text-slate-900">{enquiry.fullName}</span>:
                </p>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={panInput}
                    maxLength={10}
                    onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full font-mono uppercase text-sm font-bold tracking-wider px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-600 mt-1 block">
                    Example format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPanDialog(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isCollectingPan}
                  onClick={() => handleCollectPan()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs disabled:opacity-60"
                >
                  {isCollectingPan ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Initiating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Execute Collect PAN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
