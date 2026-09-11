import React from 'react';
import { 
  Hash, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Gauge, 
  TrendingUp, 
  MapPin, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { ProcessingStats } from '../types';

interface StatsOverviewProps {
  stats: ProcessingStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const topCircles = Object.entries(stats.circleBreakdown)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5);

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Numbers */}
        <div 
          id="stat-total-numbers"
          className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs relative overflow-hidden group hover:border-red-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Numbers Uploaded
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalInputRows.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
            <span>From Input File (File 2)</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200" />
        </div>

        {/* Metric 2: Successfully Fetched (Matched) */}
        <div 
          id="stat-successfully-fetched"
          className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs relative overflow-hidden group hover:border-red-400 transition-all bg-gradient-to-b from-white to-red-50/20"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Successfully Fetched
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-600 tracking-tight">
            {stats.successfullyFetched.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.matchRatePercent}% Match Rate (DSL ID Found)</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
        </div>

        {/* Metric 3: Not Fetched (Unmatched) */}
        <div 
          id="stat-not-fetched"
          className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Not Fetched (Missing)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.notFetched.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 font-medium">
            <span>
              {stats.totalInputRows > 0
                ? ((stats.notFetched / stats.totalInputRows) * 100).toFixed(1)
                : 0}
              % unmapped in Master
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
        </div>

        {/* Metric 4: Duplicates Found */}
        <div 
          id="stat-duplicates-found"
          className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Duplicate Numbers
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-xs">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.duplicateCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-medium">
            <span>Repeated entries in File 2</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400" />
        </div>
      </div>

      {/* Second Row: Calculation Performance Speed & Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Speed & Complexity Benchmark */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Speed &amp; Logic Performance
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              O(1) Hash Map
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Processing Time:</span>
              <span className="font-mono font-bold text-slate-900">
                {stats.durationMs} ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Throughput Velocity:</span>
              <span className="font-mono font-bold text-red-600">
                {stats.rowsPerSecond.toLocaleString()} rows / sec
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Normalization Rule:</span>
              <span className="font-semibold text-slate-800">
                Last 10 Digits + IMS Clean
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Memory Model:</span>
              <span className="font-medium text-slate-700">Zero-Heap Leak Typed Index</span>
            </div>
          </div>
        </div>

        {/* Visual Match Ratio Bar */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Match Distribution
              </h3>
            </div>
            <span className="text-[11px] font-bold text-red-600">
              {stats.matchRatePercent}% Success
            </span>
          </div>

          <div className="space-y-3">
            {/* Visual Multi-Segment Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
              <div 
                style={{ width: `${stats.matchRatePercent}%` }}
                className="bg-red-600 h-full transition-all duration-500"
                title={`Matched: ${stats.successfullyFetched}`}
              />
              <div 
                style={{ 
                  width: `${stats.totalInputRows > 0 ? (stats.notFetched / stats.totalInputRows) * 100 : 0}%` 
                }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Not Fetched: ${stats.notFetched}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span className="text-slate-600">Matched DSL:</span>
                <span className="font-bold text-slate-900 ml-auto">{stats.successfullyFetched}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-600">Not Found:</span>
                <span className="font-bold text-slate-900 ml-auto">{stats.notFetched}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 mt-2">
              {stats.duplicateCount > 0 ? (
                <span className="text-rose-700 font-semibold">
                  ⚠️ Note: {stats.duplicateCount} duplicate input rows detected in File 2.
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  ✓ Clean input: No duplicate numbers in File 2.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Circles / Regions */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Matched Circles
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {Object.keys(stats.circleBreakdown).length} Circles
            </span>
          </div>

          <div className="space-y-2">
            {topCircles.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No circles matched yet</p>
            ) : (
              topCircles.map(([circle, count]) => {
                const numericCount = Number(count);
                const percent = stats.successfullyFetched > 0 
                  ? Math.round((numericCount / stats.successfullyFetched) * 100) 
                  : 0;
                return (
                  <div key={circle} className="text-xs space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700 font-semibold">{circle}</span>
                      <span className="text-slate-500 font-mono font-bold">
                        {count} <span className="text-[10px] text-slate-400">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
