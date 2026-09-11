import React from 'react';
import { Database, FileSpreadsheet, RefreshCw, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
  onReset: () => void;
  isProcessing: boolean;
  hasData: boolean;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onReset,
  isProcessing,
  hasData,
  onOpenHelp
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Telecom<span className="text-red-600">Lookup</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  DSL &amp; Voice VLOOKUP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Auto-normalizes +91, IMS URIs &amp; STD codes to match last 10 digits
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="help-guide-btn"
              onClick={onOpenHelp}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-rose-50/60 transition-colors border border-slate-200 hover:border-red-200"
              title="How normalization and matching works"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
              <span className="hidden md:inline">How It Works</span>
            </button>

            <button
              id="load-sample-btn"
              onClick={onLoadSample}
              disabled={isProcessing}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Load Airtel Sample Data</span>
            </button>

            {hasData && (
              <button
                id="reset-dashboard-btn"
                onClick={onReset}
                disabled={isProcessing}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side Safe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
