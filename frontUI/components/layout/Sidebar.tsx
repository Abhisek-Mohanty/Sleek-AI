"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Kanban,
  CalendarCheck2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Building2,
  Workflow,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn, getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Enquiries",
    href: "/enquiries",
    icon: Users,
    badgeKey: "enquiriesCount",
  },
  {
    name: "AI Funnel Builder",
    href: "/funnels/builder",
    icon: Sparkles,
    badge: "AI",
    isAi: true,
  },
  {
    name: "Sales Pipelines",
    href: "/funnels/board",
    icon: Kanban,
    badge: null,
  },
  {
    name: "Activities",
    href: "/activities",
    icon: CalendarCheck2,
    badgeKey: "pendingActivitiesCount",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { enquiries, activities, activeFunnel, settings } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingActivitiesCount = activities.filter((a) => a.status === "pending" || a.status === "overdue").length;

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 z-30 select-none shadow-[1px_0_3px_0_rgba(0,0,0,0.02)]",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-lg">sleek</span>
                <span className="text-xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium tracking-wide">
                Sales Funnel Portal
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 text-white shadow-md shadow-brand-500/25">
            <Zap className="h-5 w-5 fill-white/20" />
          </Link>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors",
            isCollapsed && "hidden"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Active Funnel Banner (when expanded) */}
      {!isCollapsed && activeFunnel && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-gradient-to-r from-brand-50/80 to-violet-50/50 border border-brand-100/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-brand-800 uppercase tracking-wider flex items-center gap-1">
              <Workflow className="h-3 w-3 text-brand-600" />
              Active Funnel
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 truncate" title={activeFunnel.name}>
            {activeFunnel.name}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
            <span>{activeFunnel.stages.length} Stages</span>
            <span>Target: {activeFunnel.targetConversionGoal}%</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          let badgeContent: React.ReactNode = null;
          if (item.badge) {
            badgeContent = (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                item.isAi
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600"
              )}>
                {item.badge}
              </span>
            );
          } else if (item.badgeKey === "enquiriesCount") {
            badgeContent = (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {enquiries.length}
              </span>
            );
          } else if (item.badgeKey === "pendingActivitiesCount" && pendingActivitiesCount > 0) {
            badgeContent = (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {pendingActivitiesCount}
              </span>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                isActive
                  ? "bg-brand-50/90 text-brand-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-brand-600 stroke-[2.3]" : "text-slate-600 group-hover:text-slate-800"
                )}
              />
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}
              {!isCollapsed && badgeContent}

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Expand button if collapsed */}
      {isCollapsed && (
        <div className="p-2 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Workspace & User Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0">
              {getInitials("Alex Morgan")}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 truncate">
                Alex Morgan
              </span>
              <span className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {settings.companyName || "Acme Enterprise"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer"
              title="Alex Morgan (Head of Sales)"
            >
              AM
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
