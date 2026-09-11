import React from 'react';
import { X, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { ProcessedItem } from '../types';

interface InspectorModalProps {
  item: ProcessedItem | null;
  onClose: () => void;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({ item, onClose }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!item) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const isMatched = item.matchStatus === 'MATCHED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-rose-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              #{item.index}
            </div>
            <div>
              <h3 className="font-bold text-base">Record Details &amp; Lookup Result</h3>
              <p className="text-xs text-white/80">Input query: {item.lookupRaw}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isMatched 
              ? 'bg-red-50/50 border-red-200 text-red-900' 
              : 'bg-amber-50/50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {isMatched ? (
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-extrabold text-sm block">
                  {isMatched ? 'MATCH SUCCESSFUL' : 'NOT FOUND IN MASTER DATABASE'}
                </span>
                <span className="text-[11px] opacity-80">
                  {isMatched 
                    ? `Matched using logic: ${item.matchMethod}` 
                    : 'No matching Voice ID, DSL ID, or 10-digit number located'}
                </span>
              </div>
            </div>

            {item.dslIdFound && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">DSL ID</span>
                <span className="font-mono font-extrabold text-sm text-red-600">{item.dslIdFound}</span>
              </div>
            )}
          </div>

          {/* Normalization Analysis */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Normalization Diagnostics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 text-[10px] block">Raw Input Value</span>
                <span className="font-mono font-semibold text-slate-900 break-all">{item.lookupRaw}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Calculated Last 10 Digits</span>
                <span className="font-mono font-bold text-red-600">{item.normalized10}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Detected Format</span>
                <span className="font-semibold text-slate-800 capitalize">{item.keyType.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Input Frequency</span>
                <span className="font-semibold text-slate-800">
                  {item.duplicateCountInInput > 1 ? `Appears ${item.duplicateCountInInput} times` : 'Unique (1 time)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Algorithm Match Tier</span>
                <span className="font-semibold text-slate-800">{item.matchMethod || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Master Record Attributes */}
          {item.matchedRecord ? (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Full Master Database Attributes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(item.matchedRecord).map(([key, val]) => (
                  <div 
                    key={key} 
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div className="overflow-hidden mr-2">
                      <span className="text-[10px] text-slate-400 font-semibold block truncate">{key}</span>
                      <span className="font-semibold text-slate-900 text-xs truncate block">
                        {String(val ?? '--')}
                      </span>
                    </div>
                    {val && (
                      <button
                        type="button"
                        onClick={() => handleCopy(String(val), key)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors shrink-0"
                        title={`Copy ${key}`}
                      >
                        {copiedKey === key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500">
              <p>No master row data associated with this query.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
