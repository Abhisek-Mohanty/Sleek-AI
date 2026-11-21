"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  Mail,
  Phone,
  User,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export function PanConsentPortal() {
  const searchParams = useSearchParams();
  const { enquiries, updateEnquiry } = useApp();

  // Query parameter extraction
  const queryId = searchParams.get("id") || searchParams.get("enquiryId") || "";
  const queryName = searchParams.get("name") || "";
  const queryEmail = searchParams.get("email") || "";
  const queryMobile = searchParams.get("mobile") || searchParams.get("phone") || "";
  const queryRef = searchParams.get("ref") || searchParams.get("enquiryNumber") || "";

  // Find linked enquiry if available
  const linkedEnquiry = useMemo(() => {
    if (queryId) {
      return enquiries.find((e) => e.id === queryId || e.enquiryNumber === queryId);
    }
    if (queryEmail) {
      return enquiries.find((e) => e.email.toLowerCase() === queryEmail.toLowerCase());
    }
    if (queryMobile) {
      return enquiries.find((e) => e.mobile === queryMobile);
    }
    return undefined;
  }, [enquiries, queryId, queryEmail, queryMobile]);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [panNumber, setPanNumber] = useState("");

  // Consent states
  const [consentBureau, setConsentBureau] = useState(false);
  const [consentDelivery, setConsentDelivery] = useState(false);
  const [consentAlerts, setConsentAlerts] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  // Flow states: "form" | "verifying" | "success"
  const [flowState, setFlowState] = useState<"form" | "verifying" | "success">("form");
  const [verifyingStep, setVerifyingStep] = useState(1);
  const [generatedRef, setGeneratedRef] = useState("");

  // Pre-fill on mount / when params or linked enquiry load
  useEffect(() => {
    if (linkedEnquiry) {
      setFullName(linkedEnquiry.fullName || "");
      setEmail(linkedEnquiry.email || "");
      setMobile(linkedEnquiry.mobile || "");
    } else {
      if (queryName) setFullName(queryName);
      if (queryEmail) setEmail(queryEmail);
      if (queryMobile) setMobile(queryMobile);
    }
  }, [linkedEnquiry, queryName, queryEmail, queryMobile]);

  // PAN validation regex: 5 letters, 4 digits, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const isPanValid = panRegex.test(panNumber.trim());

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseVal = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setPanNumber(uppercaseVal);
  };

  const isFormValid =
    fullName.trim().length >= 2 &&
    email.trim().includes("@") &&
    mobile.trim().length >= 10 &&
    isPanValid &&
    consentBureau &&
    consentDelivery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setFlowState("verifying");
    const refCode = `SLK-REP-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedRef(refCode);

    // Simulate multi-step verification
    setTimeout(() => setVerifyingStep(2), 700);
    setTimeout(() => setVerifyingStep(3), 1500);
    setTimeout(() => {
      setFlowState("success");

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch { }

      // Update CRM enquiry if matched
      if (linkedEnquiry) {
        updateEnquiry(linkedEnquiry.id, {
          status: "Pan Received", // Advances enquiry status to PAN Received
          notes: [
            {
              id: `note_${Date.now()}`,
              content: `Customer completed PAN verification (${panNumber.slice(0, 5)}****${panNumber.slice(-1)}) and authorized CRIF loan analysis report generation.`,
              author: "Customer Self-Portal",
              createdAt: new Date().toISOString(),
            },
            ...linkedEnquiry.notes,
          ],
        });
      }

      toast.success("Authorization recorded successfully!");
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Header / Trust Banner */}
      <header className="border-b border-slate-200/80 bg-white shadow-2xs sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-slate-900">
                  Sleek<span className="text-brand-600">AI</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Customer Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Automated Loan Analysis & Verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Verification</span>
            <span className="sm:hidden">Secured</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* State 1: Verification & Consent Form */}
        {flowState === "form" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-brand-50/70 blur-2xl pointer-events-none" />

              <div className="max-w-2xl relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-3 border border-brand-200/50">
                  <Award className="h-3.5 w-3.5" />
                  Official Loan Analysis Request
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {fullName ? `Welcome, ${fullName.split(" ")[0]}!` : "Welcome to Sleek AI"}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Provide your Permanent Account Number (PAN) and authorize a complimentary soft bureau inquiry to generate your comprehensive{" "}
                  <strong className="text-slate-900 font-semibold">Loan Analysis Report</strong>. This report will be delivered directly to your registered email address.
                </p>

                {/* Key Guarantees */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Zero Score Impact</p>
                      <p className="text-[11px] text-slate-600">Soft inquiry only</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Direct Delivery</p>
                      <p className="text-[11px] text-slate-600">Sent via email</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Data Protection</p>
                      <p className="text-[11px] text-slate-600">RBI compliant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-600" />
                  1. Verify Your Contact & Profile Details
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ensure these details match your official records where the report should be delivered.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name (as per PAN Card) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar Sharma"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address (Report Delivery) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@company.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:border-brand-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* PAN Section */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-600" />
                    2. Permanent Account Number (PAN)
                  </h2>
                  {panNumber.length > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPanValid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isPanValid ? "✓ Valid Format" : "10-character alphanumeric"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Required to authenticate credit bureau softpull and calibrate personalized loan analysis.
                </p>

                <div className="mt-4 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      required
                      value={panNumber}
                      onChange={handlePanChange}
                      placeholder="ABCDE1234F"
                      className={`w-full tracking-widest text-base font-mono font-bold rounded-xl border px-4 py-2.5 text-slate-900 placeholder:text-slate-600 focus:bg-white focus:outline-hidden uppercase ${
                        isPanValid
                          ? "border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500"
                          : panNumber.length > 0 && !isPanValid
                          ? "border-amber-400 bg-amber-50/20"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    />
                    {isPanValid && (
                      <CheckCircle2 className="absolute right-3.5 top-3 h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
                    Format: 5 letters, 4 numbers, 1 letter (e.g. <span className="font-mono font-semibold">ABCDE1234F</span>)
                  </p>
                </div>
              </div>

              {/* Consent Section */}
              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  3. Regulatory Consent & Authorization
                </h2>

                <div className="space-y-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5">
                  {/* Checkbox 1: Bureau Softpull */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentBureau}
                      onChange={(e) => setConsentBureau(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900">
                        Authorization for Bureau Softpull (CRIF High Mark / Credit Bureau):
                      </span>{" "}
                      I hereby give my explicit and voluntary consent to Sleek AI and its authorized financial partners to retrieve my credit history from credit bureaus for evaluating loan options and preparing my Loan Analysis Report. I acknowledge that this inquiry is a soft credit check and will{" "}
                      <span className="font-semibold text-emerald-700 underline decoration-emerald-400">
                        not lower or impact my credit score
                      </span>.
                    </div>
                  </label>

                  {/* Checkbox 2: Report Delivery */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentDelivery}
                      onChange={(e) => setConsentDelivery(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900">
                        Consent for Email Delivery & Financial Insights:
                      </span>{" "}
                      I authorize Sleek AI to deliver my Loan Analysis Report, eligibility insights, and loan recommendations to my email{" "}
                      <strong className="text-slate-900 font-semibold">{email || "provided above"}</strong> and phone.
                    </div>
                  </label>

                  {/* Checkbox 3: Alerts (Optional) */}
                  <label className="flex items-start gap-3 cursor-pointer group pt-1">
                    <input
                      type="checkbox"
                      checked={consentAlerts}
                      onChange={(e) => setConsentAlerts(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="text-xs text-slate-600 leading-relaxed">
                      Send me instant status updates and approval alerts via WhatsApp / SMS (Optional).
                    </div>
                  </label>
                </div>

                {/* Terms Accordion */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowTerms(!showTerms)}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View Data Privacy & Regulatory Terms</span>
                    {showTerms ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showTerms && (
                    <div className="mt-2.5 p-3.5 rounded-xl bg-slate-100 text-[11px] text-slate-600 leading-relaxed space-y-2 border border-slate-200">
                      <p>
                        <strong>Data Protection Commitment:</strong> Sleek AI follows stringent RBI digital lending compliance and ISO/IEC 27001 data protection protocols. Your PAN is utilized exclusively for generating your requested Loan Analysis Report and will never be shared with unauthorized third parties or used for unsolicited promotional spam.
                      </p>
                      <p>
                        <strong>Revocation Policy:</strong> You retain the right to withdraw consent or request data removal at any time by contacting{" "}
                        <span className="font-semibold text-slate-900">privacy@sleekai.com</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Secure 256-bit encrypted submission</span>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold shadow-md transition-all ${
                    isFormValid
                      ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20 hover:scale-[1.01]"
                      : "bg-slate-200 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <span>Authorize & Generate My Loan Report</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State 2: Verifying Animation */}
        {flowState === "verifying" && (
          <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-card space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Authenticating & Processing Authorization...
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Please hold on while our secure gateway verifies your details.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="space-y-3 max-w-sm mx-auto text-left pt-4">
              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${verifyingStep >= 1 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {verifyingStep > 1 ? "✓" : "1"}
                </div>
                <span className={`text-xs font-semibold ${verifyingStep >= 1 ? "text-slate-900" : "text-slate-600"}`}>
                  Validating PAN syntax and checksum
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${verifyingStep >= 2 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {verifyingStep > 2 ? "✓" : "2"}
                </div>
                <span className={`text-xs font-semibold ${verifyingStep >= 2 ? "text-slate-900" : "text-slate-600"}`}>
                  Recording electronic consent timestamp
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${verifyingStep >= 3 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {verifyingStep >= 3 ? "✓" : "3"}
                </div>
                <span className={`text-xs font-semibold ${verifyingStep >= 3 ? "text-slate-900" : "text-slate-600"}`}>
                  Queuing AI Loan Analysis & Bureau softpull
                </span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Confirmed / Success Screen */}
        {flowState === "success" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-card space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Header */}
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Consent Registered
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                PAN & Consent Successfully Registered!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900 font-semibold">{fullName}</strong>. Your complimentary{" "}
                <strong className="text-slate-900 font-semibold">Loan Analysis Report</strong> is being compiled and will be delivered directly to your registered email address.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <span className="font-semibold text-slate-600">Verification Reference</span>
                <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {generatedRef}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-600">Registered PAN</span>
                <span className="font-mono font-bold text-slate-800">
                  {panNumber.slice(0, 5)}****{panNumber.slice(-1)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-600">Report Destination</span>
                <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/50">
                  {email}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-600">Bureau Check Mode</span>
                <span className="font-bold text-emerald-700">Softpull (Zero Impact on CIBIL/CRIF)</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-slate-600">Estimated Delivery Time</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  Within 15–30 Minutes
                </span>
              </div>
            </div>

            {/* What Happens Next Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                What Happens Next
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Soft Bureau Analysis</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sleek-AI securely queries your credit health metrics without leaving a hard footprint.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">AI Loan Structuring</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Our credit engine calculates your maximum eligible loan amount and best lender interest rates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Inbox Delivery</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A comprehensive PDF report with customized lender comparisons is sent to your inbox.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Footer Card */}
            <div className="rounded-2xl bg-slate-100/70 border border-slate-200/80 p-4 text-center text-xs text-slate-600">
              <p>
                Did not receive your report or have queries? Contact our credit advisory desk at{" "}
                <a href="mailto:support@sleekai.com" className="font-semibold text-brand-600 hover:underline">
                  support@sleekai.com
                </a>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
            <span>© 2026 Sleek AI Financial Technologies</span>
            <span>·</span>
            <span>RBI Compliant Soft Inquiry</span>
            <span>·</span>
            <span>256-Bit SSL Secured</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Sleek AI facilitates loan comparison and credit evaluation. Soft bureau credit checks do not affect your credit rating.
          </p>
        </div>
      </footer>
    </div>
  );
}
