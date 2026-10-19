"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Workflow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  CheckSquare,
  Square,
  MoreVertical,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Enquiry, LeadSource, PriorityLevel, EnquiryStatus } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { EnquiryDetailModal } from "./EnquiryDetailModal";

export function EnquiriesPage() {
  const {
    enquiries,
    activeFunnel,
    representatives,
    setIsCreateEnquiryOpen,
    setIsImportOpen,
    bulkUpdateEnquiries,
    deleteEnquiry,
    setSelectedEnquiryForExecution,
  } = useApp();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [repFilter, setRepFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date" | "score" | "name" | "value">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & pagination state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Detail Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    return enquiries
      .filter((e) => {
        const matchesSearch =
          e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.mobile.includes(searchTerm) ||
          e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.company && e.company.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "All" || e.status === statusFilter;
        const matchesSource = sourceFilter === "All" || e.source === sourceFilter;
        const matchesStage = stageFilter === "All" || e.currentStageId === stageFilter;
        const matchesPriority = priorityFilter === "All" || e.priority === priorityFilter;
        const matchesRep = repFilter === "All" || e.assignedRepId === repFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesSource &&
          matchesStage &&
          matchesPriority &&
          matchesRep
        );
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === "date") {
          comp = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        } else if (sortBy === "score") {
          comp = a.leadScore - b.leadScore;
        } else if (sortBy === "name") {
          comp = a.fullName.localeCompare(b.fullName);
        } else if (sortBy === "value") {
          comp = (a.estimatedValue || 0) - (b.estimatedValue || 0);
        }
        return sortOrder === "desc" ? -comp : comp;
      });
  }, [
    enquiries,
    searchTerm,
    statusFilter,
    sourceFilter,
    stageFilter,
    priorityFilter,
    repFilter,
    sortBy,
    sortOrder,
  ]);

  // Paginated view
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkStageChange = (targetStageId: string) => {
    const stage = activeFunnel?.stages.find((s) => s.id === targetStageId);
    if (!stage) return;
    bulkUpdateEnquiries(selectedIds, {
      currentStageId: stage.id,
      currentStageName: stage.name,
      daysInStage: 0,
    });
    setSelectedIds([]);
  };

  const handleBulkExportCSV = () => {
    const recordsToExport =
      selectedIds.length > 0
        ? enquiries.filter((e) => selectedIds.includes(e.id))
        : filteredRecords;

    const exportRows = recordsToExport.map((e) => ({
      "ID": e.id,
      "Full Name": e.fullName,
      "Email": e.email,
      "Mobile": e.mobile,
      "City": e.city,
      "Company": e.company || "",
      "Source": e.source,
      "Stage": e.currentStageName,
      "Status": e.status,
      "Priority": e.priority,
      "Lead Score": e.leadScore,
      "Estimated Value": e.estimatedValue || 0,
      "Assigned Rep": e.assignedRepName,
      "Date Created": e.dateCreated,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries_Export");
    XLSX.writeFile(wb, `sleek_ai_enquiries_${new Date().toISOString().split("T")[0]}.csv`);
    toast.success(`Exported ${recordsToExport.length} enquiries to CSV`);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Enquiries & Leads Directory
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage, filter, import, and enroll leads into your active sales pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            Export CSV
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
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
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle space-y-3">
        {/* Search & Main Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search by name, email, mobile, city, company..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-hidden"
            >
              <option value="All">All Stages</option>
              {activeFunnel?.stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-hidden"
            >
              <option value="All">All Sources</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Inbound Call">Inbound Call</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Partner">Partner</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Direct">Direct</option>
            </select>
          </div>
        </div>

        {/* Sort Controls & Active Counts */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Showing <strong className="text-slate-900">{filteredRecords.length}</strong> of {enquiries.length} leads</span>
            {(statusFilter !== "All" || sourceFilter !== "All" || stageFilter !== "All" || priorityFilter !== "All" || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setSourceFilter("All");
                  setStageFilter("All");
                  setPriorityFilter("All");
                  setRepFilter("All");
                  setCurrentPage(1);
                }}
                className="text-brand-600 hover:underline font-semibold text-[11px]"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800 font-semibold"
              >
                <option value="date">Date Created</option>
                <option value="score">Lead Score</option>
                <option value="name">Full Name</option>
                <option value="value">Deal Value</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-2 py-1 border rounded-lg hover:bg-slate-50 font-bold"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 animate-in fade-in duration-100">
            <span className="font-semibold">
              {selectedIds.length} enquiries selected
            </span>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkStageChange(e.target.value);
                }}
                defaultValue=""
                className="rounded-lg border border-brand-300 bg-white px-2 py-1 text-xs text-slate-800"
              >
                <option value="" disabled>Move to Stage...</option>
                {activeFunnel?.stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>{stg.name}</option>
                ))}
              </select>
              <button
                onClick={handleBulkExportCSV}
                className="rounded-lg bg-white border border-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-800 hover:bg-brand-100"
              >
                Export Selected
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => deleteEnquiry(id));
                  setSelectedIds([]);
                }}
                className="rounded-lg bg-rose-600 text-white px-2.5 py-1 text-xs font-semibold hover:bg-rose-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enquiries Data Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={handleSelectAll}>
                    {selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-brand-600" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Lead Name & Company</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-600">
                    No enquiries match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((enq) => {
                  const isSelected = selectedIds.includes(enq.id);
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => setSelectedEnquiry(enq)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                        isSelected ? "bg-brand-50/40" : ""
                      }`}
                    >
                      <td
                        className="py-3 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(enq.id);
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-brand-600" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300 hover:text-slate-500" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{enq.fullName}</div>
                        <div className="text-[11px] text-slate-600">
                          {enq.company || "Independent"} · {enq.city}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>{enq.email}</div>
                        <div className="text-[11px] text-slate-600">{enq.mobile}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium text-[11px]">
                          {enq.currentStageName}
                        </span>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          {enq.daysInStage} days in stage
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              enq.leadScore >= 80 ? "bg-emerald-500" : enq.leadScore >= 60 ? "bg-amber-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{enq.leadScore}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatCurrency(enquiryValue(enq))}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            enq.status === "Converted"
                              ? "bg-emerald-100 text-emerald-800"
                              : enq.status === "New"
                              ? "bg-sky-100 text-sky-800"
                              : enq.status === "Proposal"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{enq.source}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(enq.dateCreated)}</td>
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedEnquiryForExecution(enq);
                            window.location.href = "/funnels/board";
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-[11px] font-semibold transition-colors"
                        >
                          Execute
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/50 text-xs">
          <span className="text-slate-600">
            Page <strong className="text-slate-900">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
        />
      )}
    </div>
  );
}

function enquiryValue(enq: Enquiry): number {
  return enq.estimatedValue || 25000;
}
