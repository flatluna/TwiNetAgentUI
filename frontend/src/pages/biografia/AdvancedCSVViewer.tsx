import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from "@azure/msal-react";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  FileText, 
  Calendar, 
  HardDrive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { documentApiService } from '../../services/documentApiService';

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface SortConfig {
  key: number;
  direction: 'asc' | 'desc';
}

interface ColumnFilter {
  [key: number]: string;
}

const AdvancedCSVViewer: React.FC = () => {
  const { filename } = useParams<{ filename: string }>();
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
  
  // Data state
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // View options - removed unused variables

  useEffect(() => {
    if (filename) {
      loadCSVFile(filename);
    }
  }, [filename]);

  const loadCSVFile = async (filename: string) => {
    try {
      setLoading(true);
      const twinId = msalUser?.localAccountId || 'TestTwin2024'; // Fallback para desarrollo
      const response = await documentApiService.getStructuredDocumentContent(twinId, filename);
      
      if (response.success && response.content) {
        const parsed = parseCSV(response.content);
        setCsvData(parsed);
        setFileInfo({
          name: filename,
          size: response.content.length,
          lastModified: new Date().toLocaleDateString(),
          rowCount: parsed.rows.length,
          columnCount: parsed.headers.length
        });
      } else {
        setError('Error al cargar el archivo CSV');
      }
    } catch (err) {
      setError('Error al cargar el archivo CSV');
      console.error('Error loading CSV:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (content: string): CSVData => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Better CSV parsing to handle quotes and commas
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));
    
    return { headers, rows };
  };

  // Memoized processed data with search, filter, and sort
  const processedData = useMemo(() => {
    if (!csvData) return [];
    
    let filtered = csvData.rows.filter(row => {
      // Global search across all columns
      const matchesSearch = searchTerm === '' || row.some(cell => 
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Column-specific filters
      const matchesFilters = Object.entries(columnFilters).every(([colIndex, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row[parseInt(colIndex)] || '';
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
      
      return matchesSearch && matchesFilters;
    });

    // Sort data
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        
        // Try numeric comparison first
        const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
        const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Fall back to string comparison
        const result = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }
    
    return filtered;
  }, [csvData, searchTerm, columnFilters, sortConfig]);

  // Pagination calculations
  const totalRows = processedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = processedData.slice(startIndex, endIndex);

  // Event handlers
  const handleSort = (columnIndex: number) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === columnIndex) {
        if (prevConfig.direction === 'asc') {
          return { key: columnIndex, direction: 'desc' };
        } else {
          return null; // Remove sort
        }
      } else {
        return { key: columnIndex, direction: 'asc' };
      }
    });
  };

  const handleColumnFilter = (columnIndex: number, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnIndex]: value
    }));
    setCurrentPage(1);
  };

  const clearFilter = (columnIndex: number) => {
    setColumnFilters(prev => {
      const updated = { ...prev };
      delete updated[columnIndex];
      return updated;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchTerm('');
    setSortConfig(null);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Utility functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSortIcon = (columnIndex: number) => {
    if (sortConfig?.key === columnIndex) {
      return sortConfig.direction === 'asc' ? 
        <SortAsc className="h-4 w-4 text-blue-600" /> : 
        <SortDesc className="h-4 w-4 text-blue-600" />;
    }
    return <SortAsc className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />;
  };

  const downloadCSV = () => {
    if (!csvData) return;
    
    const csvContent = [
      csvData.headers.join(','),
      ...processedData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render page numbers for pagination
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando archivo CSV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{fileInfo?.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <HardDrive className="h-4 w-4" />
                      <span>{formatFileSize(fileInfo?.size || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{fileInfo?.lastModified}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{fileInfo?.rowCount} filas × {fileInfo?.columnCount} columnas</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>Mostrando {Math.min(startIndex + 1, totalRows)}-{Math.min(endIndex, totalRows)} de {totalRows}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en toda la tabla..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
                    showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                  {Object.keys(columnFilters).length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                      {Object.keys(columnFilters).length}
                    </span>
                  )}
                </button>

                {(Object.keys(columnFilters).length > 0 || searchTerm || sortConfig) && (
                  <button 
                    onClick={clearAllFilters}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Limpiar todo</span>
                  </button>
                )}

                <button 
                  onClick={downloadCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {csvData && (
          <div className="bg-white rounded-lg shadow-lg">
            {/* Controls Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 font-medium">Filas por página:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={250}>250</option>
                    </select>
                  </div>
                  
                  {totalRows !== fileInfo?.rowCount && (
                    <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
                      Mostrando {totalRows} de {fileInfo?.rowCount} filas (filtrado)
                    </div>
                  )}
                </div>
                
                {/* Main Pagination Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Primera página"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {renderPageNumbers()}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Última página"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {/* Column Filters Row */}
                  {showFilters && (
                    <tr className="bg-blue-50">
                      {csvData.headers.map((_, index) => (
                        <th key={`filter-${index}`} className="px-4 py-2">
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              placeholder={`Filtrar...`}
                              value={columnFilters[index] || ''}
                              onChange={(e) => handleColumnFilter(index, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                            {columnFilters[index] && (
                              <button
                                onClick={() => clearFilter(index)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  )}
                  
                  {/* Headers Row */}
                  <tr>
                    {csvData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="group px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
                        onClick={() => handleSort(index)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{header}</span>
                          <div className="ml-2 flex-shrink-0">
                            {getSortIcon(index)}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.map((row, rowIndex) => (
                    <tr key={startIndex + rowIndex} className="hover:bg-gray-50 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                          title={cell} // Show full content on hover
                        >
                          <div className="max-w-xs truncate">
                            {cell || <span className="text-gray-400 italic">vacío</span>}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {/* Empty state */}
                  {currentRows.length === 0 && (
                    <tr>
                      <td 
                        colSpan={csvData.headers.length} 
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Search className="h-8 w-8 text-gray-400 mb-2" />
                          <p>No se encontraron resultados</p>
                          <p className="text-sm">Intenta ajustar tus filtros de búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <div>
                  Mostrando <span className="font-medium">{Math.min(startIndex + 1, totalRows)}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, totalRows)}</span> de{' '}
                  <span className="font-medium">{totalRows}</span> resultados
                  {totalRows !== fileInfo?.rowCount && (
                    <span className="text-orange-600"> (filtrado de {fileInfo?.rowCount} total)</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span>Página {currentPage} de {totalPages}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {renderPageNumbers()}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCSVViewer;
