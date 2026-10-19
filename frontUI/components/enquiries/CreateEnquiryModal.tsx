"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Sparkles, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LeadSource, EnquiryStatus } from "@/types";
import { toast } from "sonner";

const STATUS_OPTIONS: EnquiryStatus[] = [
  "New",
  "Contacted",
  "In Progress",
  "Qualified",
  "Proposal",
  "Converted",
  "Lost",
];

const SOURCE_TYPE_OPTIONS: LeadSource[] = [
  "Website",
  "LinkedIn",
  "Referral",
  "Inbound Call",
  "Google Ads",
  "Partner",
  "Exhibition",
  "Direct",
];

const enquirySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  mobile: z.string().trim().min(6, "Please enter a valid mobile number"),
  email: z.string().trim().email("Please enter a valid email address"),
  status: z.enum([
    "New",
    "Contacted",
    "In Progress",
    "Qualified",
    "Proposal",
    "Converted",
    "Lost",
  ] as const),
  sourceType: z.enum([
    "Website",
    "LinkedIn",
    "Referral",
    "Inbound Call",
    "Google Ads",
    "Partner",
    "Exhibition",
    "Direct",
  ] as const),
});

export type CreateEnquiryPayload = z.infer<typeof enquirySchema>;

export function CreateEnquiryModal() {
  const { isCreateEnquiryOpen, setIsCreateEnquiryOpen, addEnquiry, activeFunnel } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEnquiryPayload>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      status: "New",
      sourceType: "Website",
    },
  });

  if (!isCreateEnquiryOpen) return null;

  const onSubmit = (data: CreateEnquiryPayload) => {
    // Construct the explicit payload requested
    const payload: CreateEnquiryPayload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      mobile: data.mobile.trim(),
      email: data.email.trim(),
      status: data.status,
      sourceType: data.sourceType,
    };

    // Log the created payload to the console
    console.log("Created Enquiry Payload:", payload);

    // Save and enroll enquiry into the application state
    addEnquiry({
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      mobile: payload.mobile,
      email: payload.email,
      status: payload.status,
      source: payload.sourceType,
      sourceType: payload.sourceType,
    });

    toast.success("Enquiry created successfully", {
      description: `${payload.firstName} ${payload.lastName} (${payload.status}) enrolled into ${activeFunnel?.name || "Active Funnel"}.`,
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
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("firstName")}
                placeholder="e.g. John"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.firstName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.firstName.message}</p>
              )}
            </div>

            {/* 2. Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("lastName")}
                placeholder="e.g. Doe"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.lastName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.lastName.message}</p>
              )}
            </div>

            {/* 3. Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("mobile")}
                placeholder="+1 (555) 234-5678"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.mobile && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.mobile.message}</p>
              )}
            </div>

            {/* 4. Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("email")}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-hidden"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* 5. Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("status")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white focus:border-brand-500 focus:outline-hidden"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.status.message}</p>
              )}
            </div>

            {/* 6. Source Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("sourceType")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white focus:border-brand-500 focus:outline-hidden"
              >
                {SOURCE_TYPE_OPTIONS.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              {errors.sourceType && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.sourceType.message}</p>
              )}
            </div>
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
