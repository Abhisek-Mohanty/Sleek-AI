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
import { Enquiry } from "@/types";
import { toast } from "sonner";

interface ColumnMapping {
  nameCol: string;
  mobileCol: string;
  emailCol: string;
  cityCol: string;
  companyCol: string;
  sourceCol: string;
}

export function ImportEnquiriesModal() {
  const { isImportOpen, setIsImportOpen, importEnquiries, enquiries } = useApp();

  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");
  const [fileName, setFileName] = useState<string>("");
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    nameCol: "",
    mobileCol: "",
    emailCol: "",
    cityCol: "",
    companyCol: "",
    sourceCol: "",
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportOpen) return null;

  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Full Name": "Devon Vance",
        "Mobile Number": "+1 (415) 399-2810",
        "Email": "devon.vance@solardrive.io",
        "City": "San Francisco",
        "Company": "SolarDrive Systems",
        "Source": "Website",
        "Estimated Value": 45000,
      },
      {
        "Full Name": "Alisha Verma",
        "Mobile Number": "+91 98201 44556",
        "Email": "alisha@apexfin.com",
        "City": "Mumbai",
        "Company": "Apex Financial",
        "Source": "LinkedIn",
        "Estimated Value": 60000,
      },
      {
        "Full Name": "Liam Thorne",
        "Mobile Number": "+44 20 7123 4567",
        "Email": "liam.t@cloudmesh.co.uk",
        "City": "London",
        "Company": "CloudMesh UK",
        "Source": "Referral",
        "Estimated Value": 35000,
      },
      {
        "Full Name": "Missing Email Lead",
        "Mobile Number": "+1 (555) 000-1111",
        "Email": "",
        "City": "Chicago",
        "Company": "NoEmail Corp",
        "Source": "Partner",
        "Estimated Value": 20000,
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

        // Auto-detect columns intelligently
        const autoMap: ColumnMapping = {
          nameCol: headers.find((h) => /name|full/i.test(h)) || headers[0] || "",
          mobileCol: headers.find((h) => /mobile|phone|contact/i.test(h)) || headers[1] || "",
          emailCol: headers.find((h) => /email|mail/i.test(h)) || headers[2] || "",
          cityCol: headers.find((h) => /city|location|address/i.test(h)) || headers[3] || "",
          companyCol: headers.find((h) => /company|org|business/i.test(h)) || "",
          sourceCol: headers.find((h) => /source|channel/i.test(h)) || "",
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

  // Build mapped objects
  const getMappedRows = () => {
    const nameIdx = rawHeaders.indexOf(mapping.nameCol);
    const mobileIdx = rawHeaders.indexOf(mapping.mobileCol);
    const emailIdx = rawHeaders.indexOf(mapping.emailCol);
    const cityIdx = rawHeaders.indexOf(mapping.cityCol);
    const companyIdx = rawHeaders.indexOf(mapping.companyCol);
    const sourceIdx = rawHeaders.indexOf(mapping.sourceCol);

    return rawRows.map((r, i) => {
      const name = nameIdx >= 0 ? String(r[nameIdx] || "").trim() : "";
      const mobile = mobileIdx >= 0 ? String(r[mobileIdx] || "").trim() : "";
      const email = emailIdx >= 0 ? String(r[emailIdx] || "").trim() : "";
      const city = cityIdx >= 0 ? String(r[cityIdx] || "").trim() : "";
      const company = companyIdx >= 0 ? String(r[companyIdx] || "").trim() : "";
      const source = sourceIdx >= 0 ? String(r[sourceIdx] || "").trim() : "Website";

      const hasRequired = Boolean(name && mobile && email && city);
      const isDuplicate = enquiries.some(
        (existing) =>
          existing.email.toLowerCase() === email.toLowerCase() ||
          existing.mobile === mobile
      );

      return {
        rowIndex: i + 1,
        fullName: name,
        mobile,
        email,
        city,
        company,
        source: source || "Website",
        isValid: hasRequired,
        isDuplicate,
        missingFields: [
          !name && "Name",
          !mobile && "Mobile",
          !email && "Email",
          !city && "City",
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

    const payload: Partial<Enquiry>[] = validRecords.map((r) => ({
      fullName: r.fullName,
      mobile: r.mobile,
      email: r.email,
      city: r.city,
      company: r.company || "Independent",
      source: (r.source as any) || "Website",
      priority: "Medium",
    }));

    importEnquiries(payload);
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
                Support for CSV and Excel files (.csv, .xlsx, .xls)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsImportOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
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
                <span className="text-xs text-slate-700">Need a pre-formatted template?</span>
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.nameCol}
                  onChange={(e) => setMapping({ ...mapping, nameCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.mobileCol}
                  onChange={(e) => setMapping({ ...mapping, mobileCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.emailCol}
                  onChange={(e) => setMapping({ ...mapping, emailCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.cityCol}
                  onChange={(e) => setMapping({ ...mapping, cityCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name (Optional)
                </label>
                <select
                  value={mapping.companyCol}
                  onChange={(e) => setMapping({ ...mapping, companyCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="">-- Skip / None --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Source (Optional)
                </label>
                <select
                  value={mapping.sourceCol}
                  onChange={(e) => setMapping({ ...mapping, sourceCol: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="">-- Skip / Default to Website --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep("upload")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!mapping.nameCol || !mapping.mobileCol || !mapping.emailCol || !mapping.cityCol) {
                    toast.error("Please map all 4 required fields: Name, Mobile, Email, and City.");
                    return;
                  }
                  setStep("preview");
                }}
                className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs"
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
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Mobile</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedData.slice(0, 15).map((row) => (
                      <tr key={row.rowIndex} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-slate-600">{row.rowIndex}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.fullName || "—"}</td>
                        <td className="py-2 px-3 text-slate-600">{row.mobile || "—"}</td>
                        <td className="py-2 px-3 text-slate-600">{row.email || "—"}</td>
                        <td className="py-2 px-3 text-slate-600">{row.city || "—"}</td>
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
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold" title={`Missing: ${row.missingFields.join(", ")}`}>
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
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
