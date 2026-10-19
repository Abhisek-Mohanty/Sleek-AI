"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  Bell,
  Sparkles,
  Workflow,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export function SettingsPage() {
  const { settings, updateSettings, resetToDemoData } = useApp();

  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [defaultFollowUpDays, setDefaultFollowUpDays] = useState(settings.defaultFollowUpDays);
  const [stalledLeadDaysThreshold, setStalledLeadDaysThreshold] = useState(settings.stalledLeadDaysThreshold);
  const [autoAiScoringEnabled, setAutoAiScoringEnabled] = useState(settings.autoAiScoringEnabled);

  const [notificationPreferences, setNotificationPreferences] = useState(settings.notificationPreferences);

  const [sources, setSources] = useState<string[]>(settings.sources);
  const [newSource, setNewSource] = useState("");

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workspaceName,
      companyName,
      currency,
      timezone,
      defaultFollowUpDays,
      stalledLeadDaysThreshold,
      autoAiScoringEnabled,
      notificationPreferences,
      sources,
    });
  };

  const handleAddSource = () => {
    if (!newSource.trim() || sources.includes(newSource.trim())) return;
    setSources([...sources, newSource.trim()]);
    setNewSource("");
  };

  const handleRemoveSource = (src: string) => {
    if (sources.length <= 1) {
      toast.error("At least one lead source is required.");
      return;
    }
    setSources(sources.filter((s) => s !== src));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Workspace Settings & Automation Configuration
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Configure sales stages, custom lead sources, AI velocity thresholds, and workspace defaults.
        </p>
      </div>

      <form onSubmit={handleSaveWorkspace} className="space-y-6">
        {/* Workspace Info Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Building2 className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Workspace Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
                <option value="AED (د.إ)">AED (د.إ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workspace Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              >
                <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                <option value="UTC+0 (London / GMT)">UTC+0 (London / GMT)</option>
                <option value="UTC+5:30 (India Standard Time)">UTC+5:30 (India Standard Time)</option>
                <option value="UTC+4 (Gulf Standard Time)">UTC+4 (Gulf Standard Time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Funnel Rules Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Rules & Lead Velocity Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Follow-up Interval (Days)
              </label>
              <input
                type="number"
                value={defaultFollowUpDays}
                onChange={(e) => setDefaultFollowUpDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stalled Lead Idle Threshold (Days)
              </label>
              <input
                type="number"
                value={stalledLeadDaysThreshold}
                onChange={(e) => setStalledLeadDaysThreshold(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoScore"
              checked={autoAiScoringEnabled}
              onChange={(e) => setAutoAiScoringEnabled(e.target.checked)}
              className="rounded border-slate-300 text-brand-600"
            />
            <label htmlFor="autoScore" className="text-xs font-medium text-slate-800">
              Enable automated AI lead prioritization and opportunity score generation.
            </label>
          </div>
        </div>

        {/* Lead Sources Management */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Workflow className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Custom Lead Sources</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {sources.map((src) => (
              <span
                key={src}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                {src}
                <button
                  type="button"
                  onClick={() => handleRemoveSource(src)}
                  className="hover:text-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 max-w-sm">
            <input
              type="text"
              placeholder="Add new source (e.g. TikTok, Podcast)..."
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={handleAddSource}
              className="rounded-xl bg-slate-800 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-900"
            >
              Add
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Bell className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Notification Alerts</h3>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.overdueAlerts}
                onChange={(e) =>
                  setNotificationPreferences({
                    ...notificationPreferences,
                    overdueAlerts: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-brand-600"
              />
              <span className="font-medium text-slate-800">
                Trigger in-app alerts when activities become overdue
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.stageMoveAlerts}
                onChange={(e) =>
                  setNotificationPreferences({
                    ...notificationPreferences,
                    stageMoveAlerts: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-brand-600"
              />
              <span className="font-medium text-slate-800">
                Notify when a lead advances to a converted or proposal stage
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.aiRecommendations}
                onChange={(e) =>
                  setNotificationPreferences({
                    ...notificationPreferences,
                    aiRecommendations: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-brand-600"
              />
              <span className="font-medium text-slate-800">
                Show real-time AI diagnostic nudges on the executive overview
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetToDemoData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-4 py-2 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Default Seed Data
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Save Workspace Settings
          </button>
        </div>
      </form>
    </div>
  );
}
