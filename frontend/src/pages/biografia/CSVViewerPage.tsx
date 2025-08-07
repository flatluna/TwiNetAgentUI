import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { documentApiService } from "@/services/documentApiService";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    HardDrive,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Loader2
} from "lucide-react";

interface CSVData {
    headers: string[];
    rows: string[][];
}

interface FileInfo {
    nombre: string;
    tamaño: number;
    fechaSubida: string;
    url: string;
    tipo: string;
    categoria: string;
}

const CSVViewerPage: React.FC = () => {
    const { fileName } = useParams<{ fileName: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
    
    const [csvData, setCsvData] = useState<CSVData | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [sortColumn, setSortColumn] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const decodedFileName = fileName ? decodeURIComponent(fileName) : '';

    useEffect(() => {
        if (decodedFileName) {
            loadCSVFile();
        }
    }, [decodedFileName]);

    const loadCSVFile = async () => {
        try {
            setLoading(true);
            setError(null);

            const TWIN_ID = msalUser?.localAccountId || "TestTwin2024"; // Fallback para desarrollo

            // Buscar el archivo en los documentos estructurados
            console.log(`🔍 Buscando archivo CSV: ${decodedFileName}`);
            
            const response = await documentApiService.listStructuredDocuments(TWIN_ID, "Estructurado", "CSV");
            
            if (response.success && response.documents) {
                // Buscar el archivo específico por nombre
                const documento = response.documents.find(doc => 
                    doc.filename === decodedFileName || 
                    doc.filename.includes(decodedFileName.replace('.CSV', '').replace('.csv', ''))
                );
                
                if (documento) {
                    console.log(`✅ Archivo encontrado:`, documento);
                    
                    const fileInfo: FileInfo = {
                        nombre: documento.filename,
                        tamaño: documento.size_bytes || 0,
                        fechaSubida: documento.last_modified || new Date().toISOString(),
                        url: documento.public_url,
                        tipo: "text/csv",
                        categoria: "Documentos estructurados"
                    };
                    setFileInfo(fileInfo);

                    // Cargar datos CSV desde URL
                    await loadCSVFromURL(documento.public_url);
                } else {
                    throw new Error(`Archivo CSV "${decodedFileName}" no encontrado`);
                }
            } else {
                throw new Error('Error al obtener documentos estructurados del backend');
            }

        } catch (err) {
            console.error('Error cargando archivo CSV:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const loadCSVFromURL = async (url: string) => {
        try {
            console.log(`📥 Cargando CSV desde URL: ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            const lines = text.trim().split('\n');
            
            if (lines.length === 0) {
                throw new Error('El archivo CSV está vacío');
            }

            console.log(`📊 CSV cargado: ${lines.length} líneas`);

            // Parseamos el CSV
            const headers = parseCsvLine(lines[0]);
            const rows = lines.slice(1).map(line => parseCsvLine(line));

            console.log(`✅ CSV parseado: ${headers.length} columnas, ${rows.length} filas`);
            setCsvData({ headers, rows });
        } catch (err) {
            console.error('❌ Error al cargar CSV:', err);
            throw new Error(`Error al cargar CSV: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
    };

    const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSort = (columnIndex: number) => {
        if (sortColumn === columnIndex) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnIndex);
            setSortDirection('asc');
        }
    };

    const handleDownload = () => {
        if (fileInfo) {
            const link = document.createElement('a');
            link.href = fileInfo.url;
            link.download = fileInfo.nombre;
            link.click();
        }
    };

    const filteredAndSortedData = React.useMemo(() => {
        if (!csvData) return { headers: [], rows: [] };

        let filteredRows = csvData.rows;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filteredRows = filteredRows.filter(row =>
                row.some(cell => 
                    cell.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Ordenar
        if (sortColumn !== null) {
            filteredRows = [...filteredRows].sort((a, b) => {
                const aVal = a[sortColumn] || '';
                const bVal = b[sortColumn] || '';
                
                const result = aVal.localeCompare(bVal, undefined, { numeric: true });
                return sortDirection === 'asc' ? result : -result;
            });
        }

        return { headers: csvData.headers, rows: filteredRows };
    }, [csvData, searchTerm, sortColumn, sortDirection]);

    // Paginación
    const totalRows = filteredAndSortedData.rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = filteredAndSortedData.rows.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-gray-600">Cargando archivo CSV...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="text-red-500 text-lg mb-2">❌ Error al cargar el archivo</div>
                            <div className="text-gray-600 mb-4">{error}</div>
                            <Button onClick={() => navigate(-1)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con información del archivo */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver</span>
                            </Button>
                            
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-800">
                                        {fileInfo?.nombre || decodedFileName}
                                    </h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        {fileInfo && (
                                            <>
                                                <div className="flex items-center space-x-1">
                                                    <HardDrive className="w-4 h-4" />
                                                    <span>{formatFileSize(fileInfo.tamaño)}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(fileInfo.fechaSubida).toLocaleDateString('es-ES')}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{fileInfo.categoria}</span>
                                                </div>
                                            </>
                                        )}
                                        {csvData && (
                                            <div className="text-blue-600 font-medium">
                                                {totalRows} filas × {csvData.headers.length} columnas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles y filtros */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en los datos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Filas por página:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSortColumn(null);
                                    setCurrentPage(1);
                                }}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-auto max-h-[calc(100vh-300px)]">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {filteredAndSortedData.headers.map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort(index)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{header}</span>
                                                {sortColumn === index && (
                                                    <span className={`ml-2 ${sortDirection === 'asc' ? 'transform rotate-0' : 'transform rotate-180'}`}>
                                                        ↑
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.map((row, rowIndex) => (
                                    <tr 
                                        key={startIndex + rowIndex}
                                        className={`${(startIndex + rowIndex) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                                    >
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="border-t bg-gray-50 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalRows)} de {totalRows} filas
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = Math.max(1, currentPage - 2) + i;
                                            if (page > totalPages) return null;
                                            
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={page === currentPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => goToPage(page)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVViewerPage;
