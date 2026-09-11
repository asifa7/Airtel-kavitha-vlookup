import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RawDataRow, ProcessedItem } from '../types';

export interface ParseResult {
  fileName: string;
  rowCount: number;
  columns: string[];
  data: RawDataRow[];
}

/**
 * Parses a file (CSV, TSV, TXT, XLSX, XLS) into an array of objects
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else {
    return parseTextDelimitedFile(file);
  }
}

function parseTextDelimitedFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawDataRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const columns = results.meta.fields || [];
        const cleanData = results.data.filter((row) => {
          return Object.values(row).some((val) => val !== null && val !== undefined && String(val).trim() !== '');
        });

        resolve({
          fileName: file.name,
          rowCount: cleanData.length,
          columns,
          data: cleanData
        });
      },
      error: (err) => {
        reject(new Error(`Failed to parse CSV/text file: ${err.message}`));
      }
    });
  });
}

function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON array
        const rawJson: RawDataRow[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        });

        if (rawJson.length === 0) {
          return resolve({
            fileName: file.name,
            rowCount: 0,
            columns: [],
            data: []
          });
        }

        const columns = Object.keys(rawJson[0]);
        resolve({
          fileName: file.name,
          rowCount: rawJson.length,
          columns,
          data: rawJson
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        reject(new Error(`Failed to parse Excel file: ${msg}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Heuristics to auto-detect the best key column in a file
 */
export function detectLookupColumn(columns: string[]): string {
  const preferred = [
    'del_number',
    'voice_id',
    'dsl_id',
    'phone',
    'mobile',
    'contact',
    'telephone',
    'number',
    'mobile_number',
    'calling_number',
    'account_number'
  ];

  for (const pref of preferred) {
    const found = columns.find(c => c.toLowerCase().trim() === pref);
    if (found) return found;
  }

  for (const pref of preferred) {
    const found = columns.find(c => c.toLowerCase().includes(pref));
    if (found) return found;
  }

  return columns[0] || '';
}

export function detectMasterVoiceColumn(columns: string[]): string {
  const preferred = ['voice_id', 'voice id', 'phone', 'contact_number', 'del_number', 'del_no'];
  for (const p of preferred) {
    const found = columns.find(c => c.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, ''));
    if (found) return found;
  }
  return columns.find(c => c.toLowerCase().includes('voice')) || columns[0] || '';
}

export function detectMasterDslColumn(columns: string[]): string {
  const preferred = ['dsl_id', 'dsl id', 'dslid', 'broadband_id', 'wifi_id', 'service_id'];
  for (const p of preferred) {
    const found = columns.find(c => c.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, ''));
    if (found) return found;
  }
  return columns.find(c => c.toLowerCase().includes('dsl')) || '';
}

export function detectMasterAccountColumn(columns: string[]): string {
  const preferred = ['account_number', 'account_no', 'accountno', 'can_id', 'ca_number', 'billing_id'];
  for (const p of preferred) {
    const found = columns.find(c => c.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, ''));
    if (found) return found;
  }
  return columns.find(c => c.toLowerCase().includes('account')) || '';
}

/**
 * Prepares enriched dataset rows for export
 */
export function prepareExportData(items: ProcessedItem[], masterColumns: string[]): Record<string, unknown>[] {
  return items.map((item) => {
    const row: Record<string, unknown> = {
      ...item.originalInputRow,
      Lookup_Input: item.lookupRaw,
      Match_Status: item.matchStatus,
      Normalized_10_Digit: item.normalized10,
      Matched_DSL_ID: item.dslIdFound || 'NOT FOUND',
      Matched_Voice_ID: item.voiceIdFound || '',
      Matched_Account_Number: item.accountNumberFound || '',
      Customer_Name: item.customerNameFound || '',
      Circle_Name: item.circleFound || '',
      Del_Status: item.statusFound || '',
      Match_Method: item.matchMethod || 'None',
      Is_Duplicate_Input: item.isDuplicateInInput ? 'YES' : 'NO'
    };

    // Include other attributes from master record if available
    if (item.matchedRecord) {
      for (const col of masterColumns) {
        if (row[col] === undefined) {
          row[col] = item.matchedRecord[col] ?? '';
        }
      }
    }

    return row;
  });
}

/**
 * Downloads enriched data as CSV file
 */
export function downloadCsv(data: Record<string, unknown>[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads enriched data as Excel (.xlsx) file
 */
export function downloadExcel(data: Record<string, unknown>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enriched_Telecom_Data');
  
  // Set col widths
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    worksheet['!cols'] = keys.map(k => ({ wch: Math.max(k.length + 4, 16) }));
  }

  XLSX.writeFile(workbook, filename);
}
