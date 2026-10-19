"use client";

import React, { useState } from "react";
import {
  Workflow,
  Plus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Enquiry, FunnelStage } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function FunnelBoard() {
  const {
    activeFunnel,
    funnels,
    setActiveFunnelId,
    enquiries,
    moveEnquiryToStage,
    setSelectedEnquiryForExecution,
    setIsCreateEnquiryOpen,
  } = useApp();

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  if (!activeFunnel) {
    return (
      <div className="p-12 text-center text-xs text-slate-600">
        No active funnel found. Please create or activate a funnel first.
      </div>
    );
  }

  // Filter enquiries matching active funnel and optional search query
  const pipelineLeads = enquiries.filter(
    (e) =>
      (!e.currentFunnelId || e.currentFunnelId === activeFunnel.id) &&
      (e.fullName.toLowerCase().includes(filterQuery.toLowerCase()) ||
        e.city.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (e.company && e.company.toLowerCase().includes(filterQuery.toLowerCase())))
  );

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (leadId) {
      moveEnquiryToStage(leadId, targetStageId);
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Board Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Active Funnel:</span>
            <select
              value={activeFunnel.id}
              onChange={(e) => setActiveFunnelId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-brand-500 focus:outline-hidden"
            >
              {funnels.map((fnl) => (
                <option key={fnl.id} value={fnl.id}>
                  {fnl.name} ({fnl.stages.length} Stages)
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {pipelineLeads.length} Enquiries Tracked
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter cards..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
          />
          <button
            onClick={() => setIsCreateEnquiryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Stages Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-220px)]">
        {activeFunnel.stages.map((stage, stageIdx) => {
          const stageLeads = pipelineLeads.filter(
            (e) => e.currentStageId === stage.id
          );
          const stageTotalValue = stageLeads.reduce(
            (sum, lead) => sum + (lead.estimatedValue || 25000),
            0
          );

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-80 shrink-0 rounded-2xl border border-slate-200/90 bg-slate-100/60 p-3 flex flex-col max-h-[80vh] shadow-2xs"
            >
              {/* Column Header */}
              <div className="p-2 mb-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-brand-50 text-[10px] font-bold text-brand-700">
                      {stageIdx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {stage.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
                  <span>Target: {stage.expectedDurationDays}d</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(stageTotalValue)}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                {stageLeads.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-slate-600 text-xs">
                    Drop leads here
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isOverdue = lead.daysInStage >= 4;
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedEnquiryForExecution(lead)}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-subtle hover:border-brand-300 hover:shadow-card transition-all cursor-pointer group relative"
                      >
                        {/* Lead Top Details */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                              {lead.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {lead.company || lead.city}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                              lead.leadScore >= 80
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            Score: {lead.leadScore}
                          </span>
                        </div>

                        {/* Location and Value */}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-600" />
                            {lead.city}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(lead.estimatedValue || 25000)}
                          </span>
                        </div>

                        {/* Next Action AI recommendation banner */}
                        <div className="mt-2.5 p-2 rounded-lg bg-violet-50/70 border border-violet-100/80 text-[10px] text-violet-900">
                          <span className="font-bold flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-violet-600" />
                            Next Step:
                          </span>
                          <p className="truncate mt-0.5 text-violet-800">
                            {lead.aiRecommendedAction}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                          <span
                            className={cn(
                              "flex items-center gap-1 font-medium",
                              isOverdue ? "text-amber-600 font-bold" : ""
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {lead.daysInStage}d in stage
                          </span>

                          {/* Quick stage advance/back controls */}
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {stageIdx > 0 && (
                              <button
                                onClick={() =>
                                  moveEnquiryToStage(
                                    lead.id,
                                    activeFunnel.stages[stageIdx - 1].id
                                  )
                                }
                                className="h-5 w-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600"
                                title="Move back 1 stage"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {stageIdx < activeFunnel.stages.length - 1 && (
                              <button
                                onClick={() =>
                                  moveEnquiryToStage(
                                    lead.id,
                                    activeFunnel.stages[stageIdx + 1].id
                                  )
                                }
                                className="h-5 w-5 rounded-md hover:bg-brand-50 hover:text-brand-700 flex items-center justify-center text-slate-600"
                                title="Advance to next stage"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
