import React, { useState, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Eye, 
  Download, 
  FileSpreadsheet,
  Filter,
  Check
} from 'lucide-react';
import { ProcessedItem } from '../types';

interface ResultsTableProps {
  items: ProcessedItem[];
  onInspectItem: (item: ProcessedItem) => void;
  onExportCsv: (filteredOnly: boolean) => void;
  onExportExcel: (filteredOnly: boolean) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  items,
  onInspectItem,
  onExportCsv,
  onExportExcel
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MATCHED' | 'NOT_FOUND' | 'DUPLICATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    let matched = 0;
    let notFound = 0;
    let duplicates = 0;

    for (const it of items) {
      if (it.matchStatus === 'MATCHED') matched++;
      if (it.matchStatus === 'NOT_FOUND') notFound++;
      if (it.isDuplicateInInput) duplicates++;
    }

    return {
      all: items.length,
      matched,
      notFound,
      duplicates
    };
  }, [items]);

  // Filtered rows based on tab + search query
  const filteredItems = useMemo(() => {
    let list = items;

    if (activeTab === 'MATCHED') {
      list = list.filter(it => it.matchStatus === 'MATCHED');
    } else if (activeTab === 'NOT_FOUND') {
      list = list.filter(it => it.matchStatus === 'NOT_FOUND');
    } else if (activeTab === 'DUPLICATE') {
      list = list.filter(it => it.isDuplicateInInput);
    }

    if (!searchQuery.trim()) {
      return list;
    }

    const q = searchQuery.toLowerCase().trim();
    return list.filter(it => {
      return (
        it.lookupRaw.toLowerCase().includes(q) ||
        it.normalized10.toLowerCase().includes(q) ||
        (it.dslIdFound && it.dslIdFound.toLowerCase().includes(q)) ||
        (it.customerNameFound && it.customerNameFound.toLowerCase().includes(q)) ||
        (it.circleFound && it.circleFound.toLowerCase().includes(q)) ||
        (it.voiceIdFound && it.voiceIdFound.toLowerCase().includes(q)) ||
        (it.accountNumberFound && it.accountNumberFound.toLowerCase().includes(q))
      );
    });
  }, [items, activeTab, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden mb-12">
      {/* Table Header: Filters, Search, and Export Buttons */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navigation / Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full">
            <button
              id="filter-tab-all"
              type="button"
              onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({tabCounts.all.toLocaleString()})
            </button>

            <button
              id="filter-tab-matched"
              type="button"
              onClick={() => { setActiveTab('MATCHED'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'MATCHED'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-50/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              DSL Fetched ({tabCounts.matched.toLocaleString()})
            </button>

            <button
              id="filter-tab-not-found"
              type="button"
              onClick={() => { setActiveTab('NOT_FOUND'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'NOT_FOUND'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50/50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Not Found ({tabCounts.notFound.toLocaleString()})
            </button>

            <button
              id="filter-tab-duplicates"
              type="button"
              onClick={() => { setActiveTab('DUPLICATE'); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'DUPLICATE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50/50'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicates ({tabCounts.duplicates.toLocaleString()})
            </button>
          </div>

          {/* Search & Export Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="results-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search number, DSL, name..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Export Dropdown / Action */}
            <div className="flex items-center gap-2">
              <button
                id="export-excel-btn"
                type="button"
                onClick={() => onExportExcel(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 shadow-xs hover:shadow-sm active:scale-95 transition-all"
                title="Download full enriched file with DSL IDs and all details"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Processed (.xlsx)</span>
              </button>

              <button
                id="export-csv-btn"
                type="button"
                onClick={() => onExportCsv(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-red-600 bg-white hover:bg-red-50/50 border border-slate-200 transition-colors shadow-2xs"
                title="Download as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Indicator */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredItems.length.toLocaleString()}</strong> of {items.length.toLocaleString()} rows
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <span className="hidden md:inline text-slate-400">
            Click on any DSL ID or Phone Number to copy
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">Input Number (File 2)</th>
              <th className="py-3 px-3">Normalized 10-Digit</th>
              <th className="py-3 px-4 font-extrabold text-red-700">Fetched DSL ID</th>
              <th className="py-3 px-3">Voice ID</th>
              <th className="py-3 px-3">Customer Name</th>
              <th className="py-3 px-3">Circle</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Match Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different tab</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const isMatched = item.matchStatus === 'MATCHED';
                return (
                  <tr 
                    key={item.index} 
                    className={`hover:bg-rose-50/20 transition-colors ${
                      item.isDuplicateInInput ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {item.index}
                    </td>

                    {/* Lookup Raw Input */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => handleCopy(item.lookupRaw)}
                          className="cursor-pointer hover:text-red-600 hover:underline"
                          title="Click to copy raw number"
                        >
                          {item.lookupRaw}
                        </span>
                        {item.isDuplicateInInput && (
                          <span 
                            className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                            title={`Duplicate: appears ${item.duplicateCountInInput} times in File 2`}
                          >
                            x{item.duplicateCountInInput}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Normalized 10-Digit */}
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      <span 
                        onClick={() => handleCopy(item.normalized10)}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-800"
                        title="Normalized last 10 digits"
                      >
                        {item.normalized10}
                      </span>
                    </td>

                    {/* Fetched DSL ID */}
                    <td className="py-2.5 px-4 font-mono font-extrabold">
                      {item.dslIdFound ? (
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={() => handleCopy(item.dslIdFound!)}
                            className="cursor-pointer text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 px-2 py-1 rounded-md border border-red-200 font-mono tracking-tight"
                            title="Click to copy DSL ID"
                          >
                            {item.dslIdFound}
                          </span>
                          {copiedText === item.dslIdFound && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Copied!
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal italic">-- Not Found --</span>
                      )}
                    </td>

                    {/* Voice ID */}
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {item.voiceIdFound || <span className="text-slate-300">--</span>}
                    </td>

                    {/* Customer Name */}
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[150px] truncate">
                      {item.customerNameFound || <span className="text-slate-300">--</span>}
                    </td>

                    {/* Circle */}
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {item.circleFound ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.circleFound}
                        </span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Del Status */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {item.statusFound ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.statusFound.toLowerCase() === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {item.statusFound}
                        </span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Match Status Badge */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                          <CheckCircle2 className="w-3 h-3 text-red-600" />
                          MATCHED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          NOT FOUND
                        </span>
                      )}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspectItem(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50/60 border border-slate-200 hover:border-red-200 transition-colors"
                        title="View Full Master Record Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Details</span>
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
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span>Rows per page:</span>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-red-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <span className="text-slate-400">|</span>
          <span>
            Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="prev-page-btn"
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            id="next-page-btn"
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
