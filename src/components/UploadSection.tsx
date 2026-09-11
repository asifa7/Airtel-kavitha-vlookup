import React, { useRef } from 'react';
import { 
  Upload, 
  FileCheck, 
  FileText, 
  FileSpreadsheet,
  AlertCircle, 
  Layers, 
  PhoneCall, 
  Wifi, 
  SlidersHorizontal,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { RawDataRow } from '../types';

interface UploadSectionProps {
  masterRows: RawDataRow[];
  masterFileName: string;
  masterColumns: string[];
  masterVoiceCol: string;
  masterDslCol: string;
  onSelectMasterVoiceCol: (col: string) => void;
  onSelectMasterDslCol: (col: string) => void;
  onMasterFileUpload: (file: File) => void;

  lookupRows: RawDataRow[];
  lookupFileName: string;
  lookupColumns: string[];
  lookupKeyCol: string;
  onSelectLookupKeyCol: (col: string) => void;
  onLookupFileUpload: (file: File) => void;

  onRunProcess: () => void;
  isProcessing: boolean;
  progressPercent: number;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  masterRows,
  masterFileName,
  masterColumns,
  masterVoiceCol,
  masterDslCol,
  onSelectMasterVoiceCol,
  onSelectMasterDslCol,
  onMasterFileUpload,
  lookupRows,
  lookupFileName,
  lookupColumns,
  lookupKeyCol,
  onSelectLookupKeyCol,
  onLookupFileUpload,
  onRunProcess,
  isProcessing,
  progressPercent
}) => {
  const masterInputRef = useRef<HTMLInputElement>(null);
  const lookupInputRef = useRef<HTMLInputElement>(null);

  const handleMasterDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onMasterFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLookupDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onLookupFileUpload(e.dataTransfer.files[0]);
    }
  };

  const canRun = masterRows.length > 0 && lookupRows.length > 0 && !isProcessing;

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5 sm:p-6 mb-8 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold shadow-xs">
              1
            </span>
            File Ingestion &amp; Column Alignment
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Upload your master telecom database (File 1) and your input list to lookup (File 2).
          </p>
        </div>

        {/* Algorithm Highlights */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-medium border border-red-100">
            <Zap className="w-3 h-3 text-red-600" />
            +91 / STD Auto-Strip
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-medium border border-red-100">
            <PhoneCall className="w-3 h-3 text-red-600" />
            Last 10 Digits Match
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-medium border border-red-100">
            <Wifi className="w-3 h-3 text-red-600" />
            Fetches DSL ID
          </span>
        </div>
      </div>

      {/* Dual Upload Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FILE 1: Master Telecom Dataset */}
        <div 
          id="master-file-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleMasterDrop}
          className={`relative rounded-xl border-2 transition-all p-5 ${
            masterRows.length > 0 
              ? 'border-red-500/50 bg-red-50/10' 
              : 'border-dashed border-red-200 hover:border-red-400 bg-white hover:bg-red-50/20'
          }`}
        >
          <input
            ref={masterInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onMasterFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                F1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  Master Telecom Database
                  {masterRows.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Full reference file with Voice_ID, DSL_ID, Account_Number, Name
                </p>
              </div>
            </div>

            <button
              id="upload-master-btn"
              type="button"
              onClick={() => masterInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              {masterRows.length > 0 ? 'Change File' : 'Browse File'}
            </button>
          </div>

          {masterRows.length === 0 ? (
            <div 
              onClick={() => masterInputRef.current?.click()}
              className="cursor-pointer py-8 flex flex-col items-center justify-center text-center text-slate-500"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Click to upload Master File</p>
              <p className="text-xs text-slate-400 mt-1">Supports Excel (.xlsx, .xls) and CSV (.csv, .tsv)</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs bg-white border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileSpreadsheet className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate" title={masterFileName}>
                    {masterFileName}
                  </span>
                </div>
                <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 shrink-0">
                  {masterRows.length.toLocaleString()} records
                </span>
              </div>

              {/* Column Mapping Configuration */}
              <div className="bg-slate-50/70 rounded-lg p-3 border border-slate-200/80 text-xs space-y-2">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                  Detected Master Key Columns:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Voice / Phone Column:
                    </label>
                    <select
                      id="master-voice-col-select"
                      value={masterVoiceCol}
                      onChange={(e) => onSelectMasterVoiceCol(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    >
                      {masterColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DSL ID Column (Target Output):
                    </label>
                    <select
                      id="master-dsl-col-select"
                      value={masterDslCol}
                      onChange={(e) => onSelectMasterDslCol(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-bold text-red-700 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    >
                      {masterColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FILE 2: Search Numbers / Input List */}
        <div 
          id="lookup-file-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleLookupDrop}
          className={`relative rounded-xl border-2 transition-all p-5 ${
            lookupRows.length > 0 
              ? 'border-red-500/50 bg-red-50/10' 
              : 'border-dashed border-red-200 hover:border-red-400 bg-white hover:bg-red-50/20'
          }`}
        >
          <input
            ref={lookupInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onLookupFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                F2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  Input Lookup Numbers List
                  {lookupRows.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  File with few numbers to search (e.g. del_number, +91..., IMS URIs)
                </p>
              </div>
            </div>

            <button
              id="upload-lookup-btn"
              type="button"
              onClick={() => lookupInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors shadow-xs active:scale-95 cursor-pointer border border-slate-200"
            >
              {lookupRows.length > 0 ? 'Change File' : 'Browse File'}
            </button>
          </div>

          {lookupRows.length === 0 ? (
            <div 
              onClick={() => lookupInputRef.current?.click()}
              className="cursor-pointer py-8 flex flex-col items-center justify-center text-center text-slate-500"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Click to upload Lookup File</p>
              <p className="text-xs text-slate-400 mt-1">Single column or multi-column file (del_number)</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs bg-white border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="font-medium text-slate-800 truncate" title={lookupFileName}>
                    {lookupFileName}
                  </span>
                </div>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                  {lookupRows.length.toLocaleString()} rows to match
                </span>
              </div>

              {/* Column Mapping for Lookup */}
              <div className="bg-slate-50/70 rounded-lg p-3 border border-slate-200/80 text-xs space-y-2">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  Input Search Column:
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lookup Query Column (del_number / phone):
                  </label>
                  <select
                    id="lookup-key-col-select"
                    value={lookupKeyCol}
                    onChange={(e) => onSelectLookupKeyCol(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  >
                    {lookupColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Banner & Process Execution Button */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {!masterRows.length && !lookupRows.length ? (
            <span className="flex items-center gap-1.5 text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              Upload both files or click <strong className="text-red-700">"Load Airtel Sample Data"</strong> above to preview immediately.
            </span>
          ) : !canRun && !isProcessing ? (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <AlertCircle className="w-4 h-4" />
              Please provide both Master File (File 1) and Lookup File (File 2) to start matching.
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ready to process {lookupRows.length.toLocaleString()} lookup numbers against {masterRows.length.toLocaleString()} master records.
            </span>
          )}
        </div>

        <button
          id="run-matching-btn"
          type="button"
          onClick={onRunProcess}
          disabled={!canRun}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-md active:scale-95 ${
            canRun 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25 hover:shadow-red-500/40 cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Processing Index &amp; Matching... {progressPercent}%</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Run Normalized VLOOKUP Match</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Processing Progress Bar */}
      {isProcessing && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Executing O(1) in-memory hash calculation...</span>
            <span className="text-red-600 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
