import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { StatsOverview } from './components/StatsOverview';
import { ResultsTable } from './components/ResultsTable';
import { InspectorModal } from './components/InspectorModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { RawDataRow, ProcessedItem, ProcessingStats } from './types';
import { 
  parseFile, 
  detectLookupColumn, 
  detectMasterVoiceColumn, 
  detectMasterDslColumn,
  prepareExportData,
  downloadCsv,
  downloadExcel
} from './utils/fileParser';
import { buildMasterIndex, processLookupData } from './utils/matcher';
import { SAMPLE_MASTER_ROWS, SAMPLE_LOOKUP_ROWS } from './data/sampleData';
import { 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap,
  Info
} from 'lucide-react';

export default function App() {
  // File 1: Master Reference File State
  const [masterRows, setMasterRows] = useState<RawDataRow[]>([]);
  const [masterFileName, setMasterFileName] = useState<string>('');
  const [masterColumns, setMasterColumns] = useState<string[]>([]);
  const [masterVoiceCol, setMasterVoiceCol] = useState<string>('');
  const [masterDslCol, setMasterDslCol] = useState<string>('');

  // File 2: Lookup Search File State
  const [lookupRows, setLookupRows] = useState<RawDataRow[]>([]);
  const [lookupFileName, setLookupFileName] = useState<string>('');
  const [lookupColumns, setLookupColumns] = useState<string[]>([]);
  const [lookupKeyCol, setLookupKeyCol] = useState<string>('');

  // Processing & Results State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [inspectedItem, setInspectedItem] = useState<ProcessedItem | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Load Initial Airtel Sample Data automatically so the dashboard looks great immediately
  const handleLoadSampleData = useCallback(() => {
    // 1. Setup Master Rows
    const masterCols = Object.keys(SAMPLE_MASTER_ROWS[0]);
    setMasterRows(SAMPLE_MASTER_ROWS);
    setMasterFileName('Airtel_Master_Broadband_Database.xlsx');
    setMasterColumns(masterCols);
    setMasterVoiceCol('Voice_ID');
    setMasterDslCol('DSL_ID');

    // 2. Setup Lookup Rows
    const lookupCols = Object.keys(SAMPLE_LOOKUP_ROWS[0]);
    setLookupRows(SAMPLE_LOOKUP_ROWS);
    setLookupFileName('Search_Del_Numbers_List.xlsx');
    setLookupColumns(lookupCols);
    setLookupKeyCol('del_number');

    // Trigger immediate matching
    runMatchingWithData(
      SAMPLE_MASTER_ROWS,
      SAMPLE_LOOKUP_ROWS,
      'Voice_ID',
      'DSL_ID',
      'del_number'
    );

    showNotification('Airtel Broadband sample files loaded and processed successfully!');
  }, []);

  // Run on first load to populate realistic sample data
  useEffect(() => {
    handleLoadSampleData();
  }, [handleLoadSampleData]);

  // Handle Master File Upload
  const handleMasterFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      const parsed = await parseFile(file);
      setMasterRows(parsed.data);
      setMasterFileName(parsed.fileName);
      setMasterColumns(parsed.columns);

      const detectedVoice = detectMasterVoiceColumn(parsed.columns);
      const detectedDsl = detectMasterDslColumn(parsed.columns);
      setMasterVoiceCol(detectedVoice);
      setMasterDslCol(detectedDsl);

      setIsProcessing(false);
      showNotification(`Loaded Master File with ${parsed.rowCount.toLocaleString()} records`);

      // If lookup file is already present, clear previous results to encourage re-run
      setProcessedItems([]);
      setStats(null);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error reading master file: ${msg}`);
    }
  };

  // Handle Lookup File Upload
  const handleLookupFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      const parsed = await parseFile(file);
      setLookupRows(parsed.data);
      setLookupFileName(parsed.fileName);
      setLookupColumns(parsed.columns);

      const detectedKey = detectLookupColumn(parsed.columns);
      setLookupKeyCol(detectedKey);

      setIsProcessing(false);
      showNotification(`Loaded Lookup File with ${parsed.rowCount.toLocaleString()} rows`);

      setProcessedItems([]);
      setStats(null);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error reading lookup file: ${msg}`);
    }
  };

  // Core Processing Routine
  const runMatchingWithData = async (
    mRows: RawDataRow[],
    lRows: RawDataRow[],
    vCol: string,
    dCol: string,
    lKeyCol: string
  ) => {
    if (mRows.length === 0 || lRows.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(5);

    try {
      // Build in-memory fast hash index
      const index = buildMasterIndex(mRows, {
        masterVoiceCol: vCol,
        masterDslCol: dCol,
        lookupKeyCol: lKeyCol
      });

      setProgressPercent(25);

      // Run chunked matching
      const result = await processLookupData(lRows, index, lKeyCol, (pct) => {
        setProgressPercent(25 + Math.round(pct * 0.75));
      });

      setProcessedItems(result.items);
      setStats(result.stats);
      setIsProcessing(false);
      setProgressPercent(100);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error processing data: ${msg}`);
    }
  };

  const handleRunProcess = () => {
    runMatchingWithData(masterRows, lookupRows, masterVoiceCol, masterDslCol, lookupKeyCol);
  };

  // Reset State
  const handleReset = () => {
    setMasterRows([]);
    setMasterFileName('');
    setMasterColumns([]);
    setMasterVoiceCol('');
    setMasterDslCol('');

    setLookupRows([]);
    setLookupFileName('');
    setLookupColumns([]);
    setLookupKeyCol('');

    setProcessedItems([]);
    setStats(null);
    setInspectedItem(null);
    showNotification('All uploaded datasets and results have been cleared.');
  };

  // Export handlers
  const handleExportCsv = (filteredOnly: boolean = false) => {
    if (processedItems.length === 0) return;
    const dataToExport = prepareExportData(processedItems, masterColumns);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCsv(dataToExport, `Telecom_Processed_DSL_${dateStr}.csv`);
    showNotification('CSV exported successfully');
  };

  const handleExportExcel = (filteredOnly: boolean = false) => {
    if (processedItems.length === 0) return;
    const dataToExport = prepareExportData(processedItems, masterColumns);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadExcel(dataToExport, `Telecom_Processed_DSL_${dateStr}.xlsx`);
    showNotification('Excel (.xlsx) file exported successfully');
  };

  return (
    <div className="min-h-screen bg-[#fcfbfb] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onLoadSample={handleLoadSampleData}
        onReset={handleReset}
        isProcessing={isProcessing}
        hasData={masterRows.length > 0 || lookupRows.length > 0}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Title & Context Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 mb-2">
              <Zap className="w-3.5 h-3.5 text-red-600" />
              High-Throughput Telecom Matching Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Telecom <span className="text-red-600">DSL ID</span> &amp; Voice VLOOKUP Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Upload your Master file (with all customer and DSL records) and your Input list. Automatically normalizes <span className="font-mono font-semibold text-slate-800">+91</span> prefixes, STD codes, and <span className="font-mono font-semibold text-slate-800">.ims.airtel.in</span> URIs to match the standard last 10 digits in O(1) time.
            </p>
          </div>

          {stats && (
            <div className="flex items-center gap-2">
              <button
                id="quick-download-excel-btn"
                type="button"
                onClick={() => handleExportExcel(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 shadow-sm hover:shadow active:scale-95 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Enriched File (.xlsx)</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 1: File Upload & Configuration */}
        <UploadSection
          masterRows={masterRows}
          masterFileName={masterFileName}
          masterColumns={masterColumns}
          masterVoiceCol={masterVoiceCol}
          masterDslCol={masterDslCol}
          onSelectMasterVoiceCol={setMasterVoiceCol}
          onSelectMasterDslCol={setMasterDslCol}
          onMasterFileUpload={handleMasterFileUpload}
          lookupRows={lookupRows}
          lookupFileName={lookupFileName}
          lookupColumns={lookupColumns}
          lookupKeyCol={lookupKeyCol}
          onSelectLookupKeyCol={setLookupKeyCol}
          onLookupFileUpload={handleLookupFileUpload}
          onRunProcess={handleRunProcess}
          isProcessing={isProcessing}
          progressPercent={progressPercent}
        />

        {/* Section 2: Real-Time Stats Overview (Total, Fetched, Not Fetched, Duplicates, Speed) */}
        {stats && <StatsOverview stats={stats} />}

        {/* Section 3: Interactive Filterable Results Table & Download Actions */}
        {processedItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-red-600 text-white text-xs font-bold shadow-xs">
                  2
                </span>
                Processed Lookup Results &amp; Fetched DSL IDs
              </h2>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                All values automatically standardized
              </span>
            </div>

            <ResultsTable
              items={processedItems}
              onInspectItem={setInspectedItem}
              onExportCsv={handleExportCsv}
              onExportExcel={handleExportExcel}
            />
          </div>
        )}
      </main>

      {/* Record Inspector Drawer / Modal */}
      <InspectorModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
      />

      {/* How it Works Help Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Telecom DSL &amp; Voice VLOOKUP Engine &bull; Red &amp; White Edition</span>
          <span>Strict In-Browser O(1) Memory Model &bull; Standard 10-Digit Normalization</span>
        </div>
      </footer>
    </div>
  );
}
