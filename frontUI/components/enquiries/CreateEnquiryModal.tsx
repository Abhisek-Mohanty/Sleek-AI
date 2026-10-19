"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Sparkles, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LeadSource, PriorityLevel } from "@/types";

const enquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(8, "Please enter a valid phone or mobile number"),
  city: z.string().min(2, "Location / City is required"),
  company: z.string().optional(),
  source: z.enum([
    "Website",
    "LinkedIn",
    "Referral",
    "Inbound Call",
    "Google Ads",
    "Partner",
    "Exhibition",
    "Direct",
  ] as const),
  priority: z.enum(["High", "Medium", "Low"] as const),
  estimatedValue: z.coerce.number().min(0, "Value must be positive").default(25000),
  notes: z.string().optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export function CreateEnquiryModal() {
  const { isCreateEnquiryOpen, setIsCreateEnquiryOpen, addEnquiry, activeFunnel } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      city: "San Francisco",
      company: "",
      source: "Website",
      priority: "Medium",
      estimatedValue: 25000,
      notes: "",
    },
  });

  if (!isCreateEnquiryOpen) return null;

  const onSubmit = (data: EnquiryFormData) => {
    addEnquiry({
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      city: data.city,
      company: data.company,
      source: data.source as LeadSource,
      priority: data.priority as PriorityLevel,
      estimatedValue: data.estimatedValue,
      notes: data.notes
        ? [
            {
              id: `note_${Date.now()}`,
              content: data.notes,
              author: "Alex Morgan",
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    });
    reset();
    setIsCreateEnquiryOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-dropdown">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Enquiry</h2>
              <p className="text-xs text-slate-600">
                Enroll lead into {activeFunnel?.name || "Active Funnel"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateEnquiryOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("fullName")}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("email")}
                placeholder="john@company.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile / Phone <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("mobile")}
                placeholder="+1 (555) 234-5678"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.mobile && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.mobile.message}</p>
              )}
            </div>

            {/* City / Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("city")}
                placeholder="e.g. Austin, TX"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.city.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name (Optional)
              </label>
              <input
                {...register("company")}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enquiry Source <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("source")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
              >
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

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                {...register("priority")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Estimated Deal Value */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Value ($ USD)
              </label>
              <input
                type="number"
                {...register("estimatedValue")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Notes or Inbound Comments
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Key requirements, budget mentioned, timeline..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:outline-hidden"
            />
          </div>

          {/* AI Banner */}
          <div className="flex items-center gap-2 rounded-xl bg-violet-50/70 border border-violet-100 p-2.5 text-[11px] text-violet-700">
            <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
            <span>AI will automatically analyze this lead and generate suggested action steps upon creation.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateEnquiryOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              Create Enquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
