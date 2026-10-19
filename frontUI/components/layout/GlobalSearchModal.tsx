"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  User,
  Workflow,
  Sparkles,
  Calendar,
  Building2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export function GlobalSearchModal() {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    enquiries,
    funnels,
    activities,
    setIsCreateEnquiryOpen,
    setIsImportOpen,
    setSelectedEnquiryForExecution,
  } = useApp();

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredEnquiries = enquiries
    .filter(
      (e) =>
        e.fullName.toLowerCase().includes(query.toLowerCase()) ||
        e.email.toLowerCase().includes(query.toLowerCase()) ||
        e.city.toLowerCase().includes(query.toLowerCase()) ||
        (e.company && e.company.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 5);

  const filteredFunnels = funnels
    .filter(
      (f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.productService.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  const filteredActivities = activities
    .filter(
      (a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.enquiryName.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-dropdown">
        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Search className="h-5 w-5 text-slate-600" />
          <input
            type="text"
            placeholder="Type a command, lead name, company, or funnel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-600 focus:outline-hidden"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search results list */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {query.trim().length === 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsCreateEnquiryOpen(true);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-brand-50/60 hover:border-brand-200 text-left transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">New Enquiry</p>
                    <p className="text-[10px] text-slate-600">Add single lead to pipeline</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsImportOpen(true);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-emerald-50/60 hover:border-emerald-200 text-left transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Import CSV/Excel</p>
                    <p className="text-[10px] text-slate-600">Batch parse spreadsheet</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    router.push("/funnels/builder");
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-violet-50/60 hover:border-violet-200 text-left transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">AI Funnel Builder</p>
                    <p className="text-[10px] text-slate-600">Synthesize new funnel plan</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    router.push("/funnels/board");
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-amber-50/60 hover:border-amber-200 text-left transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Kanban Board</p>
                    <p className="text-[10px] text-slate-600">View stages & executions</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Enquiries results */}
          {filteredEnquiries.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Enquiries & Leads ({filteredEnquiries.length})
              </div>
              <div className="space-y-1">
                {filteredEnquiries.map((enq) => (
                  <button
                    key={enq.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSelectedEnquiryForExecution(enq);
                      router.push("/funnels/board");
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900">
                            {enq.fullName}
                          </span>
                          {enq.company && (
                            <span className="text-[11px] text-slate-600">
                              · {enq.company}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600">
                          {enq.city} · {enq.currentStageName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        Score: {enq.leadScore}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Funnels results */}
          {filteredFunnels.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Funnels ({filteredFunnels.length})
              </div>
              <div className="space-y-1">
                {filteredFunnels.map((fnl) => (
                  <button
                    key={fnl.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push("/funnels/builder");
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <Workflow className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{fnl.name}</p>
                        <p className="text-[11px] text-slate-600">{fnl.stages.length} Stages · {fnl.productService}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {fnl.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Activities results */}
          {filteredActivities.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Activities ({filteredActivities.length})
              </div>
              <div className="space-y-1">
                {filteredActivities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push("/activities");
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{act.title}</p>
                        <p className="text-[11px] text-slate-600">{act.enquiryName} · Due {act.dueDate}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {act.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length > 0 &&
            filteredEnquiries.length === 0 &&
            filteredFunnels.length === 0 &&
            filteredActivities.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-600">
                No matching leads, funnels, or activities found for &quot;{query}&quot;.
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono shadow-2xs">ESC</kbd> to close
          </div>
          <span>sleek.AI Command Hub</span>
        </div>
      </div>
    </div>
  );
}
