"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  Circle,
  PauseCircle,
  PlayCircle,
  SkipForward,
  ArrowRight,
  Send,
  Copy,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  Clock,
  User,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { generateSuggestedMessage } from "@/lib/mock-ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ExecutionDrawer() {
  const {
    selectedEnquiryForExecution: enquiry,
    setSelectedEnquiryForExecution,
    activeFunnel,
    getExecutionForEnquiry,
    toggleStageAction,
    completeExecutionStage,
    skipExecutionStage,
    pauseResumeExecution,
    addSimulatedMessage,
  } = useApp();

  const [activeChannel, setActiveChannel] = useState<"email" | "whatsapp" | "sms" | "call_script">("email");
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  if (!enquiry || !activeFunnel) return null;

  const execution = getExecutionForEnquiry(enquiry.id);
  const currentStage =
    activeFunnel.stages.find((s) => s.id === enquiry.currentStageId) ||
    activeFunnel.stages[0];

  const currentStageExec = execution?.stageExecutions[currentStage.id];
  const completedActions = currentStageExec?.completedActions || [];

  const allActionsCompleted =
    currentStage.requiredActions.length > 0 &&
    currentStage.requiredActions.every((action) => completedActions.includes(action));

  const suggestedMsg = generateSuggestedMessage(enquiry, currentStage, activeChannel);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(suggestedMsg.content);
    toast.success("AI draft message copied to clipboard!");
  };

  const handleSimulateSend = () => {
    addSimulatedMessage(enquiry.id, currentStage.id, {
      ...suggestedMsg,
      status: "simulated_sent",
      sentAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {enquiry.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{enquiry.fullName}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  Stage {currentStage.order} of {activeFunnel.stages.length}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {enquiry.company || "Independent"} · {currentStage.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pause/Resume Execution Button */}
            <button
              onClick={() => pauseResumeExecution(enquiry.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-colors",
                execution?.isPaused
                  ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
              title={execution?.isPaused ? "Resume execution" : "Pause execution"}
            >
              {execution?.isPaused ? (
                <>
                  <PlayCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <PauseCircle className="h-3.5 w-3.5 text-slate-600" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedEnquiryForExecution(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status Indicator Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 bg-brand-50/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-900">Current Step:</span>
            <span className="font-bold text-brand-700">{currentStage.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                execution?.isPaused
                  ? "bg-amber-100 text-amber-800"
                  : currentStageExec?.status === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-brand-100 text-brand-800"
              )}
            >
              {execution?.isPaused ? "Paused" : currentStageExec?.status || "In Progress"}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Simulation Notice Disclaimer */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 text-[11px] text-amber-800">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Simulation Mode:</span> No real messages or calls are dispatched. Suggested messages and checklist executions are recorded locally in the demo sandbox.
            </div>
          </div>

          {/* Current Stage Objective & Criteria */}
          <div className="rounded-2xl border border-slate-200/80 p-4 space-y-2 bg-slate-50/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                Stage Purpose & Objective
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                Target: {currentStage.expectedDurationDays} Days
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {currentStage.purpose}
            </p>
            <div className="pt-2 text-[11px] border-t border-slate-200/60 grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Entry Criteria:</span> {currentStage.entryCriteria}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Exit Criteria:</span> {currentStage.completionCriteria}
              </div>
            </div>
          </div>

          {/* Action Items Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Stage Execution Checklist ({completedActions.length}/{currentStage.requiredActions.length})
              </h3>
              {allActionsCompleted && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> All items checked
                </span>
              )}
            </div>

            <div className="space-y-2">
              {currentStage.requiredActions.map((action, idx) => {
                const isChecked = completedActions.includes(action);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleStageAction(enquiry.id, currentStage.id, action)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      isChecked
                        ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900"
                        : "bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50/50"
                    )}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className={cn("text-xs font-medium", isChecked && "line-through text-slate-600")}>
                      {action}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Suggested Message Box */}
          <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  AI Suggested Outreach Draft
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Auto-Personalized
              </span>
            </div>

            {/* Channel Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 text-xs">
              <button
                onClick={() => setActiveChannel("email")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors",
                  activeChannel === "email" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Mail className="h-3 w-3" /> Email
              </button>
              <button
                onClick={() => setActiveChannel("whatsapp")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors",
                  activeChannel === "whatsapp" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <MessageSquare className="h-3 w-3" /> WhatsApp
              </button>
              <button
                onClick={() => setActiveChannel("call_script")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors",
                  activeChannel === "call_script" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Phone className="h-3 w-3" /> Call Script
              </button>
            </div>

            {/* Generated message text preview */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono text-[11px]">
              {suggestedMsg.subject && (
                <div className="pb-2 mb-2 border-b border-slate-100 font-bold text-slate-900">
                  Subject: {suggestedMsg.subject}
                </div>
              )}
              {suggestedMsg.content}
            </div>

            {/* Message Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-slate-600" />
                Copy Draft
              </button>
              <button
                onClick={handleSimulateSend}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Simulate Dispatch
              </button>
            </div>
          </div>

          {/* Simulated History for this Stage */}
          {currentStageExec && currentStageExec.simulatedMessages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Simulated Stage Log ({currentStageExec.simulatedMessages.length})
              </h4>
              <div className="space-y-1.5">
                {currentStageExec.simulatedMessages.map((msg) => (
                  <div key={msg.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 uppercase text-[10px] tracking-wide">
                        {msg.channel} Dispatched (Simulated)
                      </p>
                      <p className="text-slate-600 truncate text-[11px]">{msg.content.slice(0, 80)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="border-t border-slate-200/90 bg-white p-4 space-y-2">
          {showSkipConfirm ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <p className="text-xs font-semibold text-rose-900">
                Are you sure you want to skip stage &quot;{currentStage.name}&quot;?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSkipConfirm(false);
                    skipExecutionStage(enquiry.id, currentStage.id);
                  }}
                  className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  Confirm Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <SkipForward className="h-3.5 w-3.5 text-slate-600" />
                Skip Stage
              </button>

              <button
                onClick={() => completeExecutionStage(enquiry.id, currentStage.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all",
                  allActionsCompleted
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse-subtle"
                    : "bg-brand-600 hover:bg-brand-700 text-white"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                {allActionsCompleted ? "Complete & Move to Next Stage" : "Mark as Completed"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
