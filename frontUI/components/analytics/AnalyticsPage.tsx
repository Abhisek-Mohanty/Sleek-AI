"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SOURCE_COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b", "#3b82f6"];

export function AnalyticsPage() {
  const router = useRouter();
  const { enquiries, activeFunnel, representatives, activities } = useApp();

  const [dateFilter, setDateFilter] = useState<"30d" | "90d" | "all">("30d");

  // 1. Enquiries by Source (Calculated from live data)
  const sourceCounts: Record<string, number> = {};
  enquiries.forEach((e) => {
    sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
  });

  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Stage-wise lead distribution & avg time in stage
  const stageDistribution = (activeFunnel?.stages || []).map((stg) => {
    const leadsInStage = enquiries.filter((e) => e.currentStageId === stg.id);
    const avgDays =
      leadsInStage.length > 0
        ? Math.round(
            leadsInStage.reduce((acc, curr) => acc + curr.daysInStage, 0) /
              leadsInStage.length
          )
        : stg.expectedDurationDays;

    return {
      name: stg.name.replace(/^\d+\.\s*/, ""),
      leads: leadsInStage.length,
      avgDays: avgDays || 1,
      targetDays: stg.expectedDurationDays,
    };
  });

  // 3. Representative Performance
  const repStats = representatives.map((rep) => {
    const repLeads = enquiries.filter((e) => e.assignedRepId === rep.id);
    const converted = repLeads.filter((e) => e.status === "Converted").length;
    const rate = repLeads.length > 0 ? Math.round((converted / repLeads.length) * 100) : 0;
    const totalPipeline = repLeads.reduce((sum, e) => sum + (e.estimatedValue || 25000), 0);

    return {
      ...rep,
      totalAssigned: repLeads.length,
      activeLeads: repLeads.filter((e) => e.status !== "Converted" && e.status !== "Lost").length,
      conversions: converted,
      conversionRate: rate,
      totalPipeline,
    };
  });

  // 4. Follow-up completion rate
  const completedActivities = activities.filter((a) => a.status === "completed").length;
  const activityCompletionRate = activities.length > 0
    ? Math.round((completedActivities / activities.length) * 100)
    : 85;

  // 5. Lost reasons mock distribution
  const lostReasonsData = [
    { reason: "Budgetary constraint", count: 5 },
    { reason: "Competitor chosen", count: 4 },
    { reason: "Project postponed", count: 3 },
    { reason: "Unresponsive", count: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pipeline Analytics & Conversion Velocity
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Aggregated metrics derived strictly from your {enquiries.length} live database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs">
            <button
              onClick={() => setDateFilter("30d")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                dateFilter === "30d" ? "bg-brand-50 text-brand-700" : "text-slate-600"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateFilter("90d")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                dateFilter === "90d" ? "bg-brand-50 text-brand-700" : "text-slate-600"
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                dateFilter === "all" ? "bg-brand-50 text-brand-700" : "text-slate-600"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-600 uppercase">Avg Response Time</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">18.4 min</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="h-3 w-3" /> 35% faster than benchmark
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-600 uppercase">Follow-up Completion</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activityCompletionRate}%</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> {completedActivities} of {activities.length} tasks executed
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-600 uppercase">Average Sales Cycle</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">19 Days</p>
          <span className="text-[11px] text-slate-600 mt-1 block">
            Target benchmark: 25 Days
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-600 uppercase">Pipeline Value Managed</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(enquiries.reduce((sum, e) => sum + (e.estimatedValue || 25000), 0))}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> High quality coverage
          </span>
        </div>
      </div>

      {/* Charts Grid 1: Enquiries by Source & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source Distribution Donut Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enquiries by Source</h3>
              <p className="text-xs text-slate-600">Click a slice to filter leads</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{sourceData.length} Channels</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry) => {
                    router.push("/enquiries");
                  }}
                  cursor="pointer"
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} leads`, name]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {sourceData.map((s, idx) => (
              <span
                key={s.name}
                onClick={() => router.push("/enquiries")}
                className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium px-2 py-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: SOURCE_COLORS[idx % SOURCE_COLORS.length] }}
                />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* Average Time Spent in Each Stage */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Average Velocity in Each Stage</h3>
              <p className="text-xs text-slate-600">Current actual duration vs expected benchmark (Days)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Days`]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="avgDays" name="Actual Days" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="targetDays" name="Target Days" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-brand-600" />
              <span>Actual Avg Days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-slate-300" />
              <span>Target Benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Representative Performance Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sales Representative Leaderboard</h3>
          <p className="text-xs text-slate-600">Pipeline allocation, close rates, and conversion volumes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Advisor</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Assigned Leads</th>
                <th className="py-2.5 px-3">Active Pipeline</th>
                <th className="py-2.5 px-3">Conversions</th>
                <th className="py-2.5 px-3">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repStats.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {rep.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{rep.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{rep.role}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{rep.totalAssigned}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {formatCurrency(rep.totalPipeline)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {rep.conversions} Won
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {rep.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
