"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Enquiry, LeadSource, EnquiryStatus } from "@/types";
import { toast } from "sonner";
import { SOURCE_TYPE_OPTIONS, STATUS_OPTIONS } from "./CreateEnquiryModal";

interface ColumnMapping {
  firstNameCol: string;
  lastNameCol: string;
  mobileCol: string;
  emailCol: string;
  statusCol: string;
  sourceTypeCol: string;
}

export function ImportEnquiriesModal() {
  const { isImportOpen, setIsImportOpen, importEnquiries, enquiries } = useApp();

  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");
  const [fileName, setFileName] = useState<string>("");
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    firstNameCol: "",
    lastNameCol: "",
    mobileCol: "",
    emailCol: "",
    statusCol: "",
    sourceTypeCol: "",
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportOpen) return null;

  const handleDownloadSample = () => {
    const sampleData = [
      {
        "First Name": "Devon",
        "Last Name": "Vance",
        "Mobile": "+1 (415) 399-2810",
        "Email": "devon.vance@solardrive.io",
        "Status": "New",
        "Source Type": "Website",
      },
      {
        "First Name": "Alisha",
        "Last Name": "Verma",
        "Mobile": "+91 98201 44556",
        "Email": "alisha@apexfin.com",
        "Status": "Contacted",
        "Source Type": "LinkedIn",
      },
      {
        "First Name": "Liam",
        "Last Name": "Thorne",
        "Mobile": "+44 20 7123 4567",
        "Email": "liam.t@cloudmesh.co.uk",
        "Status": "Qualified",
        "Source Type": "Referral",
      },
      {
        "First Name": "Elena",
        "Last Name": "Rostova",
        "Mobile": "+1 (555) 789-0123",
        "Email": "elena.r@fintechpulse.com",
        "Status": "In Progress",
        "Source Type": "Google Ads",
      },
      {
        "First Name": "Missing Email",
        "Last Name": "Lead",
        "Mobile": "+1 (555) 000-1111",
        "Email": "",
        "Status": "New",
        "Source Type": "Partner",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample_Enquiries");
    XLSX.writeFile(workbook, "sleek_ai_sample_enquiries.csv");
    toast.success("Sample template downloaded (sleek_ai_sample_enquiries.csv)");
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          toast.error("File is empty or has no header row.");
          return;
        }

        const headers = (jsonData[0] as string[]).map((h) => String(h).trim());
        const rows = jsonData.slice(1).filter((r: any) => r.length > 0);

        setRawHeaders(headers);
        setRawRows(rows);

        // Auto-detect columns intelligently based on the 6 requested fields
        const autoMap: ColumnMapping = {
          firstNameCol:
            headers.find((h) => /first.*name|^fname$|given.*name/i.test(h)) ||
            headers.find((h) => /^name$|full.*name/i.test(h)) ||
            headers[0] ||
            "",
          lastNameCol:
            headers.find((h) => /last.*name|^lname$|surname|family.*name/i.test(h)) ||
            (headers.length > 1 && !/first.*name/i.test(headers[0]) ? "" : headers[1]) ||
            "",
          mobileCol:
            headers.find((h) => /mobile|phone|contact|tel|cell/i.test(h)) ||
            headers.find((h) => /number/i.test(h)) ||
            "",
          emailCol:
            headers.find((h) => /email|mail/i.test(h)) ||
            "",
          statusCol:
            headers.find((h) => /^status$|state|stage/i.test(h)) ||
            "",
          sourceTypeCol:
            headers.find((h) => /source.*type|^source$|channel|lead.*source/i.test(h)) ||
            "",
        };

        setMapping(autoMap);
        setStep("map");
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Please verify CSV or Excel format.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Build mapped objects using the 6 fields
  const getMappedRows = () => {
    const firstNameIdx = rawHeaders.indexOf(mapping.firstNameCol);
    const lastNameIdx = rawHeaders.indexOf(mapping.lastNameCol);
    const mobileIdx = rawHeaders.indexOf(mapping.mobileCol);
    const emailIdx = rawHeaders.indexOf(mapping.emailCol);
    const statusIdx = rawHeaders.indexOf(mapping.statusCol);
    const sourceTypeIdx = rawHeaders.indexOf(mapping.sourceTypeCol);

    return rawRows.map((r, i) => {
      let rawFirst = firstNameIdx >= 0 ? String(r[firstNameIdx] || "").trim() : "";
      let rawLast = lastNameIdx >= 0 ? String(r[lastNameIdx] || "").trim() : "";

      // If user mapped a single Full Name column to firstNameCol and left lastNameCol empty
      if (rawFirst && !rawLast && rawFirst.includes(" ")) {
        const parts = rawFirst.split(" ");
        rawFirst = parts[0];
        rawLast = parts.slice(1).join(" ");
      }

      const mobile = mobileIdx >= 0 ? String(r[mobileIdx] || "").trim() : "";
      const email = emailIdx >= 0 ? String(r[emailIdx] || "").trim() : "";
      const rawStatus = statusIdx >= 0 && r[statusIdx] ? String(r[statusIdx]).trim() : "New";
      const rawSource = sourceTypeIdx >= 0 && r[sourceTypeIdx] ? String(r[sourceTypeIdx]).trim() : "Website";
      const status = STATUS_OPTIONS[rawStatus] || rawStatus || "New";
      const sourceType = SOURCE_TYPE_OPTIONS[rawSource] || rawSource || "Website";

      const hasRequired = Boolean(rawFirst && mobile && email);
      const isDuplicate = enquiries.some(
        (existing) =>
          (email && existing.email.toLowerCase() === email.toLowerCase()) ||
          (mobile && existing.mobile === mobile)
      );

      return {
        rowIndex: i + 1,
        firstName: rawFirst,
        lastName: rawLast,
        fullName: [rawFirst, rawLast].filter(Boolean).join(" "),
        mobile,
        email,
        status,
        sourceType,
        isValid: hasRequired,
        isDuplicate,
        missingFields: [
          !rawFirst && "First Name",
          !mobile && "Mobile",
          !email && "Email",
        ].filter(Boolean),
      };
    });
  };

  const mappedData = rawRows.length > 0 ? getMappedRows() : [];
  const validRecords = mappedData.filter((r) => r.isValid && !r.isDuplicate);
  const invalidRecords = mappedData.filter((r) => !r.isValid);
  const duplicateRecords = mappedData.filter((r) => r.isDuplicate);

  const handleConfirmImport = () => {
    if (validRecords.length === 0) {
      toast.error("No valid non-duplicate records to import.");
      return;
    }

    // Construct the payload for imported records
    const payload: Partial<Enquiry>[] = validRecords.map((r) => ({
      firstName: r.firstName,
      lastName: r.lastName,
      fullName: r.fullName || `${r.firstName} ${r.lastName}`.trim(),
      mobile: r.mobile,
      email: r.email,
      status: (r.status as EnquiryStatus) || "New",
      sourceType: (r.sourceType as LeadSource) || "Website",
      source: (r.sourceType as LeadSource) || "Website",
      priority: "Medium",
    }));

    console.log("Import CSV Enquiries Payload:", payload);

    const count = importEnquiries(payload);
    toast.success("Enquiries imported successfully", {
      description: `Successfully imported ${count} leads into the active pipeline.`,
    });
    setIsImportOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-dropdown max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import Enquiries</h2>
              <p className="text-xs text-slate-600">
                Upload CSV or Excel files with lead contact information
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsImportOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 bg-slate-50/50 text-xs">
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              step === "upload" ? "text-brand-600" : "text-slate-600"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">
              1
            </span>
            <span>Upload File</span>
          </div>
          <div className="h-px w-10 bg-slate-200" />
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              step === "map" ? "text-brand-600" : "text-slate-600"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">
              2
            </span>
            <span>Map Columns</span>
          </div>
          <div className="h-px w-10 bg-slate-200" />
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              step === "preview" ? "text-brand-600" : "text-slate-600"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">
              3
            </span>
            <span>Preview & Confirm</span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="p-6 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all ${
                isDragging
                  ? "border-brand-500 bg-brand-50/50"
                  : "border-slate-200 hover:border-brand-300 hover:bg-slate-50/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <UploadCloud className="h-6 w-6 stroke-[1.8]" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Supports CSV, XLSX, and XLS spreadsheets up to 10MB
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <span className="text-xs text-slate-700">Need a sample CSV with the 6 fields?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                <Download className="h-3.5 w-3.5" />
                Download Sample CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === "map" && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Map Spreadsheet Columns</h3>
                <p className="text-xs text-slate-600">
                  File: <span className="font-semibold text-slate-800">{fileName}</span> ({rawRows.length} rows found)
                </p>
              </div>
              <button
                onClick={() => setStep("upload")}
                className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Re-upload
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. First Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.firstNameCol}
                  onChange={(e) => setMapping({ ...mapping, firstNameCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* 2. Last Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name (Optional)
                </label>
                <select
                  value={mapping.lastNameCol}
                  onChange={(e) => setMapping({ ...mapping, lastNameCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Auto-split from First Name / None --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* 3. Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.mobileCol}
                  onChange={(e) => setMapping({ ...mapping, mobileCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* 4. Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.emailCol}
                  onChange={(e) => setMapping({ ...mapping, emailCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* 5. Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status (Optional)
                </label>
                <select
                  value={mapping.statusCol}
                  onChange={(e) => setMapping({ ...mapping, statusCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Default to "New" --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* 6. Source Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Type (Optional)
                </label>
                <select
                  value={mapping.sourceTypeCol}
                  onChange={(e) => setMapping({ ...mapping, sourceTypeCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Default to "Website" --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep("upload")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!mapping.firstNameCol || !mapping.mobileCol || !mapping.emailCol) {
                    toast.error("Please map the required fields: First Name, Mobile, and Email.");
                    return;
                  }
                  setStep("preview");
                }}
                className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                Continue to Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Validation */}
        {step === "preview" && (
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {/* Validation KPI Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[11px] font-semibold text-emerald-800">Ready to Import</span>
                <p className="text-xl font-bold text-emerald-700">{validRecords.length}</p>
                <span className="text-[10px] text-emerald-600">Valid & clean records</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80">
                <span className="text-[11px] font-semibold text-amber-800">Duplicates Detected</span>
                <p className="text-xl font-bold text-amber-700">{duplicateRecords.length}</p>
                <span className="text-[10px] text-amber-600">Already in database</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
                <span className="text-[11px] font-semibold text-rose-800">Invalid / Missing Values</span>
                <p className="text-xl font-bold text-rose-700">{invalidRecords.length}</p>
                <span className="text-[10px] text-rose-600">Will be skipped</span>
              </div>
            </div>

            {/* Table Preview */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">First Name</th>
                      <th className="py-2 px-3">Last Name</th>
                      <th className="py-2 px-3">Mobile</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Source Type</th>
                      <th className="py-2 px-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedData.slice(0, 15).map((row) => (
                      <tr key={row.rowIndex} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-slate-600">{row.rowIndex}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.firstName || "—"}</td>
                        <td className="py-2 px-3 text-slate-700">{row.lastName || "—"}</td>
                        <td className="py-2 px-3 text-slate-600">{row.mobile || "—"}</td>
                        <td className="py-2 px-3 text-slate-600">{row.email || "—"}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {row.status || "New"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-semibold">
                            {row.sourceType || "Website"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {row.isDuplicate ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                              Duplicate
                            </span>
                          ) : row.isValid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              Valid
                            </span>
                          ) : (
                            <span
                              className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold"
                              title={`Missing: ${row.missingFields.join(", ")}`}
                            >
                              Missing {row.missingFields.join(", ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setStep("map")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={validRecords.length === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                Confirm Import ({validRecords.length} Leads)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
