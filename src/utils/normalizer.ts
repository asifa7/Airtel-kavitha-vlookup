import { NormalizationResult } from '../types';

/**
 * Advanced Telecom Number Normalizer
 * Handles Indian Mobile, Landline STD, Airtel IMS URIs, +91 prefixes, leading 0s, and DSL suffixes.
 */
export function normalizeTelecomNumber(input: unknown): NormalizationResult {
  if (input === null || input === undefined) {
    return {
      raw: '',
      cleanDigits: '',
      last10: '',
      prefix: '',
      type: 'unknown'
    };
  }

  const raw = String(input).trim();
  if (!raw) {
    return {
      raw: '',
      cleanDigits: '',
      last10: '',
      prefix: '',
      type: 'unknown'
    };
  }

  // Check if it's an IMS / SIP Airtel URI format like "+914045077795ap.ims.airtel.in"
  const isImsUri = raw.toLowerCase().includes('.ims.') || raw.toLowerCase().includes('airtel.in');
  
  // Extract number part before domain if it is IMS URI
  let processableStr = raw;
  if (isImsUri) {
    // E.g. "+914045077795ap.ims.airtel.in" -> extract the initial digits
    const match = raw.match(/^(?:\+?91|0)?([0-9]{8,12})/i) || raw.match(/([0-9]{8,12})/);
    if (match && match[1]) {
      processableStr = match[1];
    }
  }

  // Strip all non-digit characters
  const cleanDigits = processableStr.replace(/\D/g, '');

  let last10 = '';
  let prefix = '';
  let type: NormalizationResult['type'] = 'unknown';

  if (cleanDigits.length >= 10) {
    // Standard rule: Calculate from the last 10 digits
    last10 = cleanDigits.slice(-10);
    prefix = cleanDigits.slice(0, cleanDigits.length - 10);

    if (isImsUri) {
      type = 'ims_uri';
    } else if (raw.startsWith('+91') || cleanDigits.startsWith('91') && cleanDigits.length === 12) {
      type = 'prefixed_91';
    } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
      type = 'std_landline';
    } else if (cleanDigits.length === 10) {
      type = 'mobile_10';
    } else {
      type = 'mobile_10';
    }
  } else if (cleanDigits.length > 0) {
    last10 = cleanDigits;
    type = 'unknown';
  } else {
    // Alphanumeric with no digits (e.g. some DSL tag)
    last10 = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    type = 'alphanumeric';
  }

  return {
    raw,
    cleanDigits,
    last10,
    prefix,
    type
  };
}

/**
 * Extracts possible search keys from a Master File value (e.g., Voice_ID, DSL_ID, Account_Number)
 * to ensure maximum matching recall.
 */
export function extractMasterSearchKeys(val: unknown): string[] {
  if (val === null || val === undefined) return [];
  const str = String(val).trim();
  if (!str) return [];

  const keys = new Set<string>();

  // Exact raw key (lowercase trimmed)
  keys.add(str.toLowerCase());

  // If it has _wifi or similar suffix (e.g. 01118463713_wifi)
  const withoutSuffix = str.replace(/_[a-zA-Z0-9]+$/i, '').trim();
  if (withoutSuffix && withoutSuffix !== str) {
    keys.add(withoutSuffix.toLowerCase());
  }

  // Normalized telecom result
  const norm = normalizeTelecomNumber(str);
  if (norm.cleanDigits) {
    keys.add(norm.cleanDigits);
  }
  if (norm.last10) {
    keys.add(norm.last10);
  }

  // If without suffix has digits
  if (withoutSuffix) {
    const withoutSuffixNorm = normalizeTelecomNumber(withoutSuffix);
    if (withoutSuffixNorm.last10) {
      keys.add(withoutSuffixNorm.last10);
    }
  }

  return Array.from(keys);
}
