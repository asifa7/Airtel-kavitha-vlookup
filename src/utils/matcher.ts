import { RawDataRow, ProcessedItem, ProcessingStats } from '../types';
import { normalizeTelecomNumber, extractMasterSearchKeys } from './normalizer';

export interface MatcherConfig {
  masterVoiceCol?: string;
  masterDslCol?: string;
  masterAccountCol?: string;
  masterNameCol?: string;
  masterCircleCol?: string;
  masterStatusCol?: string;
  lookupKeyCol: string;
}

export interface MasterIndex {
  tenDigitMap: Map<string, RawDataRow>;
  exactMap: Map<string, RawDataRow>;
  fullDigitsMap: Map<string, RawDataRow>;
  dslBaseMap: Map<string, RawDataRow>;
  rawMasterRows: RawDataRow[];
  voiceCol: string;
  dslCol: string;
  accountCol: string;
  nameCol: string;
  circleCol: string;
  statusCol: string;
}

/**
 * Builds high-speed in-memory O(1) hash indices over the master dataset
 */
export function buildMasterIndex(
  masterRows: RawDataRow[],
  config: MatcherConfig
): MasterIndex {
  const tenDigitMap = new Map<string, RawDataRow>();
  const exactMap = new Map<string, RawDataRow>();
  const fullDigitsMap = new Map<string, RawDataRow>();
  const dslBaseMap = new Map<string, RawDataRow>();

  const voiceCol = config.masterVoiceCol || 'Voice_ID';
  const dslCol = config.masterDslCol || 'DSL_ID';
  const accountCol = config.masterAccountCol || 'Account_Number';
  const nameCol = config.masterNameCol || 'Customer_Name';
  const circleCol = config.masterCircleCol || 'Circle_Name';
  const statusCol = config.masterStatusCol || 'Del_Status';

  for (let i = 0; i < masterRows.length; i++) {
    const row = masterRows[i];

    // 1. Index Voice ID (Highest priority for telecom matching)
    const voiceVal = row[voiceCol];
    if (voiceVal !== undefined && voiceVal !== null && String(voiceVal).trim()) {
      const vStr = String(voiceVal).trim();
      exactMap.set(vStr.toLowerCase(), row);

      const norm = normalizeTelecomNumber(vStr);
      if (norm.cleanDigits) {
        fullDigitsMap.set(norm.cleanDigits, row);
      }
      if (norm.last10 && norm.last10.length >= 7) {
        tenDigitMap.set(norm.last10, row);
      }
    }

    // 2. Index DSL ID
    const dslVal = row[dslCol];
    if (dslVal !== undefined && dslVal !== null && String(dslVal).trim()) {
      const dStr = String(dslVal).trim();
      exactMap.set(dStr.toLowerCase(), row);

      // Suffix stripped DSL (e.g. 01118463713_wifi -> 01118463713)
      const baseDsl = dStr.replace(/_[a-zA-Z0-9]+$/i, '').trim();
      if (baseDsl) {
        dslBaseMap.set(baseDsl.toLowerCase(), row);
        const normDsl = normalizeTelecomNumber(baseDsl);
        if (normDsl.last10) {
          tenDigitMap.set(normDsl.last10, row);
        }
        if (normDsl.cleanDigits) {
          fullDigitsMap.set(normDsl.cleanDigits, row);
        }
      }
    }

    // 3. Index Account Number
    const accVal = row[accountCol];
    if (accVal !== undefined && accVal !== null && String(accVal).trim()) {
      const aStr = String(accVal).trim();
      exactMap.set(aStr.toLowerCase(), row);
      const cleanAcc = aStr.replace(/\D/g, '');
      if (cleanAcc) {
        fullDigitsMap.set(cleanAcc, row);
      }
    }

    // 4. Index additional generic keys for maximum recall
    const generalKeys = extractMasterSearchKeys(voiceVal);
    for (const k of generalKeys) {
      if (!exactMap.has(k)) {
        exactMap.set(k, row);
      }
    }
  }

  return {
    tenDigitMap,
    exactMap,
    fullDigitsMap,
    dslBaseMap,
    rawMasterRows: masterRows,
    voiceCol,
    dslCol,
    accountCol,
    nameCol,
    circleCol,
    statusCol
  };
}

/**
 * Runs matching on lookup rows with chunked callback support for non-blocking UI
 */
export function processLookupData(
  lookupRows: RawDataRow[],
  masterIndex: MasterIndex,
  lookupCol: string,
  onProgress?: (progress: number, itemsProcessed: number) => void
): Promise<{ items: ProcessedItem[]; stats: ProcessingStats }> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const total = lookupRows.length;
    const items: ProcessedItem[] = new Array(total);

    // Track input frequency for duplicate identification
    const frequencyMap = new Map<string, number>();
    for (let i = 0; i < total; i++) {
      const rawVal = String(lookupRows[i][lookupCol] ?? '').trim().toLowerCase();
      if (rawVal) {
        frequencyMap.set(rawVal, (frequencyMap.get(rawVal) || 0) + 1);
      }
    }

    let successfullyFetched = 0;
    let notFetched = 0;
    let duplicateCount = 0;
    const circleBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};

    let currentIndex = 0;
    const CHUNK_SIZE = 5000;

    function processChunk() {
      const end = Math.min(currentIndex + CHUNK_SIZE, total);

      for (let i = currentIndex; i < end; i++) {
        const row = lookupRows[i];
        const rawLookup = String(row[lookupCol] ?? '').trim();
        const norm = normalizeTelecomNumber(rawLookup);

        const freq = frequencyMap.get(rawLookup.toLowerCase()) || 1;
        const isDuplicate = freq > 1;
        if (isDuplicate) {
          duplicateCount++;
        }

        let matchedRow: RawDataRow | undefined = undefined;
        let matchMethod = 'None';

        // 1. Try 10-digit normalized match (Core requirement: "the mobile number is an 10 digit number so calculate from the last 10 digit to match")
        if (norm.last10 && norm.last10.length >= 7) {
          matchedRow = masterIndex.tenDigitMap.get(norm.last10);
          if (matchedRow) {
            matchMethod = 'Normalized 10-Digit';
          }
        }

        // 2. Try Exact raw match
        if (!matchedRow && rawLookup) {
          matchedRow = masterIndex.exactMap.get(rawLookup.toLowerCase());
          if (matchedRow) {
            matchMethod = 'Exact String';
          }
        }

        // 3. Try Clean all-digits match
        if (!matchedRow && norm.cleanDigits) {
          matchedRow = masterIndex.fullDigitsMap.get(norm.cleanDigits);
          if (matchedRow) {
            matchMethod = 'Full Numeric';
          }
        }

        // 4. Try DSL Base (without _wifi)
        if (!matchedRow && rawLookup) {
          const stripped = rawLookup.replace(/_[a-zA-Z0-9]+$/i, '').trim().toLowerCase();
          matchedRow = masterIndex.dslBaseMap.get(stripped);
          if (matchedRow) {
            matchMethod = 'DSL Prefix';
          }
        }

        const isMatched = !!matchedRow;
        if (isMatched) {
          successfullyFetched++;
          const circle = String(matchedRow![masterIndex.circleCol] || 'Unknown');
          circleBreakdown[circle] = (circleBreakdown[circle] || 0) + 1;

          const status = String(matchedRow![masterIndex.statusCol] || 'Active');
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        } else {
          notFetched++;
        }

        items[i] = {
          index: i + 1,
          lookupRaw: rawLookup,
          normalized10: norm.last10 || rawLookup,
          keyType: norm.type,
          matchStatus: isMatched ? 'MATCHED' : 'NOT_FOUND',
          isDuplicateInInput: isDuplicate,
          duplicateCountInInput: freq,
          masterMatchesCount: isMatched ? 1 : 0,
          matchedRecord: matchedRow,
          dslIdFound: matchedRow ? String(matchedRow[masterIndex.dslCol] ?? '') : undefined,
          voiceIdFound: matchedRow ? String(matchedRow[masterIndex.voiceCol] ?? '') : undefined,
          accountNumberFound: matchedRow ? String(matchedRow[masterIndex.accountCol] ?? '') : undefined,
          customerNameFound: matchedRow ? String(matchedRow[masterIndex.nameCol] ?? '') : undefined,
          circleFound: matchedRow ? String(matchedRow[masterIndex.circleCol] ?? '') : undefined,
          statusFound: matchedRow ? String(matchedRow[masterIndex.statusCol] ?? '') : undefined,
          matchMethod,
          originalInputRow: row
        };
      }

      currentIndex = end;

      if (onProgress && total > 0) {
        onProgress(Math.round((currentIndex / total) * 100), currentIndex);
      }

      if (currentIndex < total) {
        setTimeout(processChunk, 0);
      } else {
        const endTime = performance.now();
        const durationMs = Math.max(1, Math.round(endTime - startTime));
        const rowsPerSecond = Math.round((total / (durationMs / 1000)));

        const stats: ProcessingStats = {
          totalInputRows: total,
          successfullyFetched,
          notFetched,
          duplicateCount,
          matchRatePercent: total > 0 ? Number(((successfullyFetched / total) * 100).toFixed(1)) : 0,
          durationMs,
          rowsPerSecond,
          circleBreakdown,
          statusBreakdown
        };

        resolve({ items, stats });
      }
    }

    processChunk();
  });
}
