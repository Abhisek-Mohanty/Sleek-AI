"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const PAGE_METADATA: Record<string, { title: string; category: string; description: string }> = {
  "/": {
    title: "Executive Overview",
    category: "Dashboard",
    description: "Real-time pipeline health, KPI metrics, and AI recommendations.",
  },
  "/enquiries": {
    title: "Enquiry Management",
    category: "Leads",
    description: "Track, filter, and import prospective customer inquiries.",
  },
  "/funnels/builder": {
    title: "AI Funnel Builder",
    category: "Sales Funnel",
    description: "Generate customized sales funnels with AI from your target objective.",
  },
  "/funnels/board": {
    title: "Sales Pipeline Board",
    category: "Execution",
    description: "Interactive Kanban board tracking leads across active funnel stages.",
  },
  "/activities": {
    title: "Sales Activities & Follow-ups",
    category: "Tasks",
    description: "Manage upcoming calls, emails, demos, and critical follow-up deadlines.",
  },
  "/analytics": {
    title: "Pipeline Analytics",
    category: "Reporting",
    description: "Conversion velocity, stage distributions, and team performance metrics.",
  },
  "/settings": {
    title: "Workspace Settings",
    category: "Administration",
    description: "Configure sales stages, custom lead sources, and AI preferences.",
  },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    setIsSearchOpen,
    setIsCreateEnquiryOpen,
    setIsImportOpen,
    resetToDemoData,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Match current metadata
  const currentMeta = PAGE_METADATA[pathname] || {
    title: "sleek.AI Workspace",
    category: "Portal",
    description: "AI-Powered Sales Funnel Management",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span>{currentMeta.category}</span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-slate-800 font-semibold">{currentMeta.title}</span>
        </div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          {currentMeta.title}
        </h1>
      </div>

      {/* Right: Actions, Global Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 transition-all shadow-2xs group"
        >
          <Search className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-700" />
          <span className="hidden sm:inline">Search leads, stages, funnels...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) markNotificationsAsRead();
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications & Alerts</span>
                <span className="text-[11px] text-brand-600 font-medium">All caught up</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors flex items-start gap-2.5 text-left"
                  >
                    {item.type === "alert" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : item.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 line-clamp-2">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-600">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Contextual Action Button */}
        {pathname === "/enquiries" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              Import CSV/Excel
            </button>
            <button
              onClick={() => setIsCreateEnquiryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Enquiry
            </button>
          </div>
        ) : pathname === "/funnels/builder" ? (
          <button
            onClick={() => {
              const genBtn = document.getElementById("ai-generate-funnel-btn");
              if (genBtn) genBtn.click();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate with AI
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateEnquiryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Enquiry</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        )}

        {/* Reset / Settings dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200"
            title="Options"
          >
            AM
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-dropdown z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">Alex Morgan</p>
                <p className="text-[11px] text-slate-600">alex.morgan@sleek.ai</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/settings");
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                Workspace Settings
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  resetToDemoData();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Demo Data
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
