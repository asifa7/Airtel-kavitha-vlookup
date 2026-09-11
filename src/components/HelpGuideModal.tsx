import React from 'react';
import { X, PhoneCall, Zap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-rose-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">How Telecom VLOOKUP &amp; Normalization Works</h3>
              <p className="text-xs text-white/80">Rules, Indian phone standards &amp; speed optimizations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Rule 1: Phone Normalization to 10 Digits */}
          <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-700 text-sm">
              <PhoneCall className="w-4 h-4" />
              1. Last 10 Digits Telecom Standardization
            </div>
            <p className="leading-relaxed text-slate-600">
              Indian mobile and landline numbers vary across source systems (some with <code className="bg-white px-1 py-0.5 rounded border border-red-200 text-red-600">+91</code>, some with leading <code className="bg-white px-1 py-0.5 rounded border border-red-200 text-red-600">0</code> STD codes, and some with IMS/SIP domains).
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 font-mono text-[11px] bg-white p-2 rounded border border-red-200/60">
                <span className="text-slate-400">Input:</span>
                <span className="text-slate-800">+914045077795ap.ims.airtel.in</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600 shrink-0 mx-1" />
                <span className="text-red-700 font-bold">4045077795</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] bg-white p-2 rounded border border-red-200/60">
                <span className="text-slate-400">Input:</span>
                <span className="text-slate-800">01141437857 (with STD 011)</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600 shrink-0 mx-1" />
                <span className="text-red-700 font-bold">1141437857</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] bg-white p-2 rounded border border-red-200/60">
                <span className="text-slate-400">Input:</span>
                <span className="text-slate-800">912246192580 (with +91/91)</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600 shrink-0 mx-1" />
                <span className="text-red-700 font-bold">2246192580</span>
              </div>
            </div>
          </div>

          {/* Rule 2: Multi-Tier Matching */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Multi-Tier High Recall Matching Algorithm</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Tier 1: Normalized 10-Digit</div>
                <p className="text-slate-500 text-[11px]">
                  Matches the last 10 digits against Voice_ID and extracted digits of DSL_ID.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Tier 2: Direct DSL &amp; Prefix</div>
                <p className="text-slate-500 text-[11px]">
                  Matches DSL IDs even if input includes or excludes <code className="text-slate-700 font-mono">_wifi</code> suffix.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Tier 3: Account Number Fallback</div>
                <p className="text-slate-500 text-[11px]">
                  Matches numeric customer CAN / billing account IDs directly.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Tier 4: Exact String</div>
                <p className="text-slate-500 text-[11px]">
                  Case-insensitive exact alphanumeric match for custom identifiers.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 3: High Volume Speed Calculation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-red-600" />
              3. Processing Speed for Large Files (1-2+ Crores / Millions)
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Standard spreadsheet VLOOKUP is O(N × M), which freezes Excel on large lists. This engine uses pre-indexed O(1) JavaScript Hash Maps and asynchronous batch chunking (5,000 items per tick), ensuring the UI stays smooth and processing finishes at upwards of 100,000+ rows per second.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
