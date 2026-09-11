export interface RawDataRow {
  [key: string]: string | number | null | undefined;
}

export interface NormalizationResult {
  raw: string;
  cleanDigits: string;
  last10: string;
  prefix: string;
  type: 'mobile_10' | 'std_landline' | 'ims_uri' | 'prefixed_91' | 'alphanumeric' | 'unknown';
}

export interface MasterIndexedRecord {
  id: string;
  originalRow: RawDataRow;
  dslId: string;
  voiceId: string;
  accountNumber: string;
  customerName: string;
  circleName: string;
  status: string;
  allKeys: string[]; // normalized search keys that point to this record
}

export interface ProcessedItem {
  index: number;
  lookupRaw: string;
  normalized10: string;
  keyType: string;
  matchStatus: 'MATCHED' | 'NOT_FOUND' | 'DUPLICATE_INPUT';
  isDuplicateInInput: boolean;
  duplicateCountInInput: number;
  masterMatchesCount: number;
  matchedRecord?: RawDataRow;
  dslIdFound?: string;
  voiceIdFound?: string;
  accountNumberFound?: string;
  customerNameFound?: string;
  circleFound?: string;
  statusFound?: string;
  matchMethod?: string;
  originalInputRow: RawDataRow;
}

export interface ProcessingStats {
  totalInputRows: number;
  successfullyFetched: number;
  notFetched: number;
  duplicateCount: number;
  matchRatePercent: number;
  durationMs: number;
  rowsPerSecond: number;
  circleBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export interface FileMetadata {
  name: string;
  size: number;
  rowCount: number;
  columns: string[];
  type: 'csv' | 'xlsx' | 'tsv' | 'txt';
}
