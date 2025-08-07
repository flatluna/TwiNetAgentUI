/**
 * Intelligent Document Service
 * Uses Azure AI Document Intelligence to extract data from documents
 */

export interface DocumentAnalysisResult {
  success: boolean;
  data?: {
    content: string;
    styles: DocumentStyle[];
    pages: DocumentPage[];
    tables: DocumentTable[];
    keyValuePairs: KeyValuePair[];
    entities: DocumentEntity[];
  };
  error?: string;
}

export interface DocumentStyle {
  isHandwritten: boolean;
  confidence: number;
}

export interface DocumentPage {
  pageNumber: number;
  lines: DocumentLine[];
  selectionMarks: SelectionMark[];
  width: number;
  height: number;
}

export interface DocumentLine {
  content: string;
  boundingBox: number[];
  confidence: number;
}

export interface SelectionMark {
  state: 'selected' | 'unselected';
  confidence: number;
  boundingBox: number[];
}

export interface DocumentTable {
  rowCount: number;
  columnCount: number;
  cells: TableCell[];
}

export interface TableCell {
  content: string;
  rowIndex: number;
  columnIndex: number;
  confidence: number;
  boundingBox: number[];
}

export interface KeyValuePair {
  key: string;
  value: string;
  confidence: number;
}

export interface DocumentEntity {
  category: string;
  subcategory?: string;
  content: string;
  confidence: number;
  boundingBox: number[];
}

export interface AnalyzeDocumentRequest {
  documentUrl?: string;
  documentBase64?: string;
  modelId?: string;
  locale?: string;
  pages?: string;
  features?: string[];
}

class InteligentDocumentService {
  private baseUrl: string;

  constructor() {
    // Use the same backend API base URL
    this.baseUrl = 'http://localhost:8082';
  }

  /**
   * Analyze document using Azure AI Document Intelligence
   * @param request - Document analysis request
   * @returns Promise with analysis results
   */
  async analyzeDocument(request: AnalyzeDocumentRequest): Promise<DocumentAnalysisResult> {
    try {
      console.log('🧠 Starting document analysis with AI...', request);

      const response = await fetch(`${this.baseUrl}/api/ai/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Document analysis completed:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error analyzing document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Analyze document from URL (for PDFs stored in Azure Data Lake)
   * @param documentUrl - URL of the document to analyze
   * @param modelId - Model to use for analysis (default: prebuilt-layout)
   * @returns Promise with analysis results
   */
  async analyzeDocumentFromUrl(documentUrl: string, modelId: string = 'prebuilt-layout'): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument({
      documentUrl,
      modelId,
      features: ['languages', 'keyValuePairs']
    });
  }

  /**
   * Analyze document from base64 data
   * @param documentBase64 - Base64 encoded document
   * @param modelId - Model to use for analysis (default: prebuilt-layout)
   * @returns Promise with analysis results
   */
  async analyzeDocumentFromBase64(documentBase64: string, modelId: string = 'prebuilt-layout'): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument({
      documentBase64,
      modelId,
      features: ['languages', 'keyValuePairs']
    });
  }

  /**
   * Extract structured data from a form/invoice
   * @param documentUrl - URL of the document to analyze
   * @returns Promise with analysis results
   */
  async extractFormData(documentUrl: string): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument({
      documentUrl,
      modelId: 'prebuilt-invoice',
      features: ['keyValuePairs', 'entities']
    });
  }

  /**
   * Extract table data from document
   * @param documentUrl - URL of the document to analyze
   * @returns Promise with analysis results
   */
  async extractTableData(documentUrl: string): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument({
      documentUrl,
      modelId: 'prebuilt-layout',
      features: ['tables']
    });
  }

  /**
   * Get analysis status (for long-running operations)
   * @param operationId - ID of the analysis operation
   * @returns Promise with operation status
   */
  async getAnalysisStatus(operationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/analyze-document/status/${operationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting analysis status:', error);
      throw error;
    }
  }

  /**
   * Format analysis results for display
   * @param result - Analysis result from Azure AI Document Intelligence
   * @returns Formatted data for UI display
   */
  formatAnalysisResults(result: DocumentAnalysisResult): any {
    if (!result.success || !result.data) {
      return null;
    }

    const formatted = {
      summary: {
        totalPages: result.data.pages.length,
        totalTables: result.data.tables.length,
        totalKeyValuePairs: result.data.keyValuePairs.length,
        hasHandwriting: result.data.styles.some(style => style.isHandwritten),
      },
      content: {
        fullText: result.data.content,
        pages: result.data.pages.map(page => ({
          pageNumber: page.pageNumber,
          lines: page.lines.map(line => line.content),
          selectionMarks: page.selectionMarks.length,
        })),
      },
      structuredData: {
        tables: result.data.tables.map(table => ({
          dimensions: `${table.rowCount}x${table.columnCount}`,
          cells: table.cells.map(cell => ({
            position: `[${cell.rowIndex},${cell.columnIndex}]`,
            content: cell.content,
            confidence: Math.round(cell.confidence * 100),
          })),
        })),
        keyValuePairs: result.data.keyValuePairs.map(pair => ({
          key: pair.key,
          value: pair.value,
          confidence: Math.round(pair.confidence * 100),
        })),
      },
      entities: result.data.entities.map(entity => ({
        category: entity.category,
        subcategory: entity.subcategory,
        content: entity.content,
        confidence: Math.round(entity.confidence * 100),
      })),
    };

    return formatted;
  }
}

// Export singleton instance
export const inteligentDocumentService = new InteligentDocumentService();
export default inteligentDocumentService;
