"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Workflow,
  Clock,
  Layers,
  Users,
  Target,
  RefreshCw,
  Save,
  Rocket,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FunnelStage, SalesFunnel } from "@/types";
import {
  simulateAIFunnelGeneration,
  MOCK_FUNNEL_PRESETS,
  AIObjectiveInput,
} from "@/lib/mock-ai";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AIFunnelBuilder() {
  const router = useRouter();
  const { enquiries, saveFunnel, activateFunnel } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState<AIObjectiveInput>({
    funnelName: "MSME Commercial Fast-Track",
    productService: "Unsecured Business Term Loans ($50k - $500k)",
    salesObjective:
      "Qualify business loan inquiries rapidly, evaluate GST/tax revenue, arrange credit consultations, and shepherd documentation through to final sanction.",
    targetAudience: "Small to Medium Enterprise owners, Manufacturers, Wholesale Traders",
    targetConversionGoal: 28,
    expectedDuration: "21 Days",
    preferredChannels: ["Call", "WhatsApp", "Email"],
    customInstructions: "Prioritize leads with >$200k declared revenue and immediate fund urgency.",
  });

  // Lead selection state
  const [leadSelectionMode, setLeadSelectionMode] = useState<"all" | "new" | "specific">("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ text: "", pct: 0 });
  const [generatedFunnel, setGeneratedFunnel] = useState<SalesFunnel | null>(null);

  // Stage editing in Step 4
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);

  // Calculated selected leads
  const effectiveSelectedLeads =
    leadSelectionMode === "all"
      ? enquiries
      : leadSelectionMode === "new"
      ? enquiries.filter((e) => e.status === "New")
      : enquiries.filter((e) => selectedLeadIds.includes(e.id));

  const handleApplyPreset = (preset: (typeof MOCK_FUNNEL_PRESETS)[0]) => {
    setFormData(preset.input);
    toast.info(`Loaded preset: ${preset.title}`);
  };

  const handleToggleChannel = (channel: string) => {
    setFormData((prev) => {
      const exists = prev.preferredChannels.includes(channel);
      return {
        ...prev,
        preferredChannels: exists
          ? prev.preferredChannels.filter((c) => c !== channel)
          : [...prev.preferredChannels, channel],
      };
    });
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setCurrentStep(3);

    try {
      const result = await simulateAIFunnelGeneration(formData, (text, pct) => {
        setGenerationProgress({ text, pct });
      });

      result.enquiriesCount = effectiveSelectedLeads.length;
      setGeneratedFunnel(result);
      setIsGenerating(false);
      setCurrentStep(4);
      toast.success("AI Sales Funnel generated successfully!");
    } catch (err) {
      setIsGenerating(false);
      toast.error("Generation failed. Please try again.");
    }
  };

  // Stage customization handlers
  const handleUpdateStage = (idx: number, updates: Partial<FunnelStage>) => {
    if (!generatedFunnel) return;
    const stages = [...generatedFunnel.stages];
    stages[idx] = { ...stages[idx], ...updates };
    setGeneratedFunnel({ ...generatedFunnel, stages });
  };

  const handleDeleteStage = (idx: number) => {
    if (!generatedFunnel) return;
    if (generatedFunnel.stages.length <= 2) {
      toast.error("Funnel must contain at least 2 stages.");
      return;
    }
    const stages = generatedFunnel.stages.filter((_, i) => i !== idx);
    setGeneratedFunnel({ ...generatedFunnel, stages });
    toast.info("Stage removed");
  };

  const handleAddStage = () => {
    if (!generatedFunnel) return;
    const newStage: FunnelStage = {
      id: `stg_custom_${Date.now()}`,
      name: `Custom Stage ${generatedFunnel.stages.length + 1}`,
      order: generatedFunnel.stages.length + 1,
      purpose: "Describe the core objective of this custom sales stage.",
      requiredActions: ["Action item 1", "Action item 2"],
      assignedRole: "Account Executive",
      communicationChannel: "Call",
      expectedDurationDays: 3,
      entryCriteria: "Previous stage completion verified",
      completionCriteria: "Key decision milestone agreed upon",
      successMetric: "Stage pass rate > 70%",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    setGeneratedFunnel({
      ...generatedFunnel,
      stages: [...generatedFunnel.stages, newStage],
    });
    toast.success("New stage added to funnel");
  };

  const handleSaveDraft = () => {
    if (!generatedFunnel) return;
    saveFunnel(generatedFunnel);
  };

  const handleActivateFunnel = () => {
    if (!generatedFunnel) return;
    saveFunnel(generatedFunnel);
    activateFunnel(
      generatedFunnel.id,
      leadSelectionMode === "specific" ? selectedLeadIds : undefined
    );
    router.push("/funnels/board");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              Algorithmic Pipeline Engine
            </div>
            <h2 className="text-2xl font-black tracking-tight">AI Funnel Builder</h2>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Synthesize a tailored, multi-stage sales funnel with exit criteria, duration benchmarks, and personalized communication scripts from your objective.
            </p>
          </div>

          {/* Stepper badges */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 text-xs">
            <span
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold transition-colors",
                currentStep === 1 ? "bg-white text-indigo-950" : "text-indigo-200"
              )}
            >
              1. Objective
            </span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold transition-colors",
                currentStep === 2 ? "bg-white text-indigo-950" : "text-indigo-200"
              )}
            >
              2. Leads
            </span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold transition-colors",
                currentStep === 4 ? "bg-white text-indigo-950" : "text-indigo-200"
              )}
            >
              3. Review & Run
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: Define Objective */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle space-y-6">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Or Start With a Curated Sales Objective Template:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MOCK_FUNNEL_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Objective Inputs */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Funnel Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.funnelName}
                  onChange={(e) => setFormData({ ...formData, funnelName: e.target.value })}
                  placeholder="e.g. Q4 Enterprise Acquisition"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product or Service Offering <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productService}
                  onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                  placeholder="e.g. Commercial Loans, SaaS Software, Real Estate"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Objective Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.salesObjective}
                onChange={(e) => setFormData({ ...formData, salesObjective: e.target.value })}
                placeholder="Describe what steps, qualification criteria, and ultimate conversion goal you want to achieve..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Conversion Goal (%)
                </label>
                <input
                  type="number"
                  value={formData.targetConversionGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, targetConversionGoal: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Duration
                </label>
                <input
                  type="text"
                  value={formData.expectedDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedDuration: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Communication Channels */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Communication Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {["Call", "WhatsApp", "Email", "Meeting", "SMS"].map((ch) => {
                  const isChecked = formData.preferredChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleToggleChannel(ch)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                        isChecked
                          ? "bg-brand-50 border-brand-300 text-brand-700 shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Custom Instructions
              </label>
              <input
                type="text"
                value={formData.customInstructions || ""}
                onChange={(e) =>
                  setFormData({ ...formData, customInstructions: e.target.value })
                }
                placeholder="e.g. Ensure speed-to-lead under 15 minutes, require tax ID verification..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Step 1 Footer */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              Continue to Select Leads <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Enquiries */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Select Enquiries for this Funnel</h3>
              <p className="text-xs text-slate-600">
                Choose which leads will be enrolled into the new AI-generated funnel stages upon activation.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold">
              {effectiveSelectedLeads.length} Leads Selected
            </div>
          </div>

          {/* Lead Selection Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setLeadSelectionMode("all")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                leadSelectionMode === "all"
                  ? "bg-brand-50/70 border-brand-400 text-brand-900 shadow-2xs"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              <p className="text-xs font-bold">All Enquiries</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Enroll all {enquiries.length} existing leads into this funnel.
              </p>
            </button>

            <button
              onClick={() => setLeadSelectionMode("new")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                leadSelectionMode === "new"
                  ? "bg-brand-50/70 border-brand-400 text-brand-900 shadow-2xs"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              <p className="text-xs font-bold">Newly Imported Leads Only</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Target fresh leads in &quot;New&quot; status ({enquiries.filter((e) => e.status === "New").length} leads).
              </p>
            </button>

            <button
              onClick={() => setLeadSelectionMode("specific")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                leadSelectionMode === "specific"
                  ? "bg-brand-50/70 border-brand-400 text-brand-900 shadow-2xs"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              <p className="text-xs font-bold">Custom Lead Selection</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Handpick individual leads from your database.
              </p>
            </button>
          </div>

          {/* Specific Lead Picker */}
          {leadSelectionMode === "specific" && (
            <div className="rounded-xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {enquiries.map((enq) => {
                const isChecked = selectedLeadIds.includes(enq.id);
                return (
                  <div
                    key={enq.id}
                    onClick={() => {
                      setSelectedLeadIds((prev) =>
                        isChecked ? prev.filter((id) => id !== enq.id) : [...prev, enq.id]
                      );
                    }}
                    className={cn(
                      "flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors",
                      isChecked ? "bg-brand-50/60" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-brand-600"
                      />
                      <div>
                        <span className="font-semibold text-slate-900">{enq.fullName}</span>
                        <span className="text-[11px] text-slate-600 ml-2">
                          {enq.company || enq.city}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Score: {enq.leadScore}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Objective
            </button>
            <button
              id="ai-generate-funnel-btn"
              onClick={handleStartGeneration}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Generation Streaming Animation */}
      {currentStep === 3 && isGenerating && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-12 shadow-subtle flex flex-col items-center justify-center text-center space-y-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 animate-pulse">
              <Sparkles className="h-10 w-10 stroke-[1.8]" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Synthesizing AI Sales Funnel Architecture
            </h3>
            <p className="text-xs text-brand-600 font-semibold mt-1">
              {generationProgress.text}
            </p>
          </div>

          <div className="w-full max-w-md h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${generationProgress.pct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-600 font-medium">
            Generating stages, completion requirements, and automated scripts...
          </span>
        </div>
      )}

      {/* STEP 4: Review and Customize Generated Funnel */}
      {currentStep === 4 && generatedFunnel && (
        <div className="space-y-5">
          {/* Funnel Overview Card */}
          <div className="rounded-2xl border border-brand-200/90 bg-white p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {generatedFunnel.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  AI Generated
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {generatedFunnel.objective}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-600 font-medium">
                <span>Duration: <strong>{generatedFunnel.expectedDuration}</strong></span>
                <span>•</span>
                <span>Target Conversion: <strong>{generatedFunnel.targetConversionGoal}%</strong></span>
                <span>•</span>
                <span>Assigned Leads: <strong>{effectiveSelectedLeads.length} leads</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleStartGeneration}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </button>
              <button
                onClick={handleActivateFunnel}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <Rocket className="h-3.5 w-3.5" />
                Activate Funnel
              </button>
            </div>
          </div>

          {/* Visual Connected Stages Flow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Funnel Execution Stages ({generatedFunnel.stages.length} Connected Steps)
              </h4>
              <button
                onClick={handleAddStage}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add Stage
              </button>
            </div>

            <div className="space-y-3">
              {generatedFunnel.stages.map((stage, idx) => {
                const isEditing = editingStageIndex === idx;
                return (
                  <div
                    key={stage.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-8 w-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) => handleUpdateStage(idx, { name: e.target.value })}
                              className="text-sm font-bold text-slate-900 border rounded-lg px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900">{stage.name}</h5>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {stage.communicationChannel}
                              </span>
                              <span className="text-[10px] text-slate-600">
                                ~{stage.expectedDurationDays} Days
                              </span>
                            </div>
                          )}

                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={stage.purpose}
                              onChange={(e) => handleUpdateStage(idx, { purpose: e.target.value })}
                              className="mt-1 text-xs text-slate-700 border rounded-lg p-2 w-full"
                            />
                          ) : (
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {stage.purpose}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingStageIndex(isEditing ? null : idx)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Edit stage"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStage(idx)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Delete stage"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stage Details Grid */}
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Required Checklist:
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {stage.requiredActions.map((act, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Exit / Completion Criteria:
                        </span>
                        <p className="text-[11px] text-slate-700">{stage.completionCriteria}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mt-1">
                          Role:
                        </span>
                        <p className="text-[11px] text-slate-700">{stage.assignedRole}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Benchmark Metric:
                        </span>
                        <p className="text-[11px] text-emerald-700 font-semibold">{stage.successMetric}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mt-1">
                          Entry Criteria:
                        </span>
                        <p className="text-[11px] text-slate-600">{stage.entryCriteria}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
