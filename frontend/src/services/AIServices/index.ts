/**
 * AI Services Index
 * Exports all AI-related services
 */

export { 
  inteligentDocumentService,
  type DocumentAnalysisResult,
  type DocumentStyle,
  type DocumentPage,
  type DocumentLine,
  type SelectionMark,
  type DocumentTable,
  type TableCell,
  type KeyValuePair,
  type DocumentEntity,
  type AnalyzeDocumentRequest
} from './InteligentDocument';

// Export default
export { inteligentDocumentService as default } from './InteligentDocument';
