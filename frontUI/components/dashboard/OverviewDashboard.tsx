"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Workflow,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  BarChart2,
  AlertTriangle,
  Play,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { formatDate, formatCurrency } from "@/lib/utils";
import { generateDashboardInsights } from "@/lib/mock-ai";
import { useRouter } from "next/navigation";

export function OverviewDashboard() {
  const router = useRouter();
  const {
    enquiries,
    funnels,
    activeFunnel,
    activities,
    setIsCreateEnquiryOpen,
    setIsImportOpen,
    setSelectedEnquiryForExecution,
    toggleActivityStatus,
  } = useApp();

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Dynamic KPI Metrics calculated straight from active state
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === "New").length;
  const activeFunnelsCount = funnels.filter((f) => f.status === "active").length;
  const pendingActivities = activities.filter(
    (a) => a.status === "pending" || a.status === "overdue"
  ).length;
  const conversions = enquiries.filter((e) => e.status === "Converted").length;
  const conversionRate = totalEnquiries > 0 ? ((conversions / totalEnquiries) * 100).toFixed(1) : "0.0";

  // Trend data based on date range
  const trendData = [
    { period: "Sep 20", enquiries: 14, conversions: 2, volume: 16 },
    { period: "Sep 25", enquiries: 19, conversions: 3, volume: 22 },
    { period: "Sep 30", enquiries: 24, conversions: 4, volume: 28 },
    { period: "Oct 05", enquiries: 28, conversions: 6, volume: 34 },
    { period: "Oct 10", enquiries: 35, conversions: 8, volume: 43 },
    { period: "Oct 15", enquiries: totalEnquiries - 4, conversions: conversions - 1, volume: totalEnquiries + 5 },
    { period: "Today", enquiries: totalEnquiries, conversions: conversions, volume: totalEnquiries + 12 },
  ];

  // Funnel stage distribution data
  const stageDistributionData = (activeFunnel?.stages || []).map((stage) => {
    const count = enquiries.filter((e) => e.currentStageId === stage.id).length;
    return {
      name: stage.name.replace(/^\d+\.\s*/, ""),
      leads: count,
      stageId: stage.id,
    };
  });

  const aiInsights = generateDashboardInsights(enquiries);
  const recentEnquiries = enquiries.slice(0, 5);
  const upcomingActivities = activities
    .filter((a) => a.status === "pending" || a.status === "overdue")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sales Performance Overview
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time pipeline progression powered by sleek.AI intelligent funnel synthesis.
          </p>
        </div>

        {/* Date Filter & Fast Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs">
            <button
              onClick={() => setDateRange("7d")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                dateRange === "7d" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDateRange("30d")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                dateRange === "30d" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setDateRange("90d")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                dateRange === "90d" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              90D
            </button>
            <button
              onClick={() => setDateRange("all")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                dateRange === "all" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={() => setIsImportOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Import Leads
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Enquiries */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Total Enquiries
            </span>
            <div className="h-7 w-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalEnquiries}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>+14.2%</span>
            <span className="text-slate-600 font-normal">vs last month</span>
          </div>
        </div>

        {/* New Enquiries */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              New Enquiries
            </span>
            <div className="h-7 w-7 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{newEnquiries}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>+8.4%</span>
            <span className="text-slate-600 font-normal">fresh leads</span>
          </div>
        </div>

        {/* Active Funnels */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Active Funnels
            </span>
            <div className="h-7 w-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Workflow className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeFunnelsCount}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
            <span className="text-brand-600 font-semibold">{activeFunnel?.name?.slice(0, 15)}...</span>
          </div>
        </div>

        {/* Activities Pending */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="h-7 w-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingActivities}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
            <span>{activities.filter((a) => a.status === "overdue").length} overdue</span>
          </div>
        </div>

        {/* Conversions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Conversions
            </span>
            <div className="h-7 w-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{conversions}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>+22%</span>
            <span className="text-slate-600 font-normal">closed won</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Conversion Rate
            </span>
            <div className="h-7 w-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{conversionRate}%</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>Target: {activeFunnel?.targetConversionGoal || 25}%</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-violet-50/50 to-white p-4 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                sleek.AI Pipeline Diagnostic
              </h3>
              <p className="text-[11px] text-slate-600">
                Rule-based algorithmic intelligence analyzing stage bottlenecks and velocity.
              </p>
            </div>
          </div>
          <Link
            href="/funnels/board"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Open Execution Board <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-3.5 rounded-xl bg-white/90 border border-slate-200/80 hover:border-brand-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      insight.type === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : insight.type === "opportunity"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-brand-100 text-brand-800"
                    }`}
                  >
                    {insight.type}
                  </span>
                  {insight.metric && (
                    <span className="text-xs font-bold text-slate-900">{insight.metric}</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                  {insight.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => router.push("/enquiries")}
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  {insight.actionText} <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Enquiry Trend Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enquiry Growth & Conversion Trend</h3>
              <p className="text-xs text-slate-600">Incoming leads vs converted deals over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                <span>Enquiries</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Converted</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.07)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnquiries)"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Stage Performance Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Stage Distribution</h3>
              <p className="text-xs text-slate-600">Lead distribution across {activeFunnel?.name}</p>
            </div>
            <Link
              href="/funnels/board"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View Board →
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageDistributionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.07)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="leads" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Enquiries Table & Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Enquiries (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Enquiries</h3>
                <p className="text-xs text-slate-600">Latest inbound prospects added to pipeline</p>
              </div>
              <Link
                href="/enquiries"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View All ({enquiries.length}) →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-600 font-semibold">
                    <th className="pb-2.5">Lead Name</th>
                    <th className="pb-2.5">Company</th>
                    <th className="pb-2.5">Current Stage</th>
                    <th className="pb-2.5">Score</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {enq.fullName}
                      </td>
                      <td className="py-3 text-slate-600">
                        {enq.company || "Independent"}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {enq.currentStageName}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-800">
                        {enq.leadScore}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          enq.status === "Converted"
                            ? "bg-emerald-100 text-emerald-800"
                            : enq.status === "New"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedEnquiryForExecution(enq);
                            router.push("/funnels/board");
                          }}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Execute →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Activities (1 col) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Activities</h3>
                <p className="text-xs text-slate-600">Pending tasks and meetings</p>
              </div>
              <Link
                href="/activities"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Calendar →
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors flex items-start gap-2.5"
                >
                  <button
                    onClick={() => toggleActivityStatus(act.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600"
                    title="Mark activity completed"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">
                      {act.enquiryName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                      <span className="font-semibold text-brand-600">
                        {act.dueDate} {act.dueTime}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{act.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
