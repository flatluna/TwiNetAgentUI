import React, { useState } from 'react';
import { Search, Clock, AlertTriangle, CheckCircle, ExternalLink, TrendingUp, MapPin, Calendar, DollarSign, Star, Info, Sparkles, Shield } from 'lucide-react';
import { webSearchApiService, WebSearchRequest, WebSearchResponse } from '../services/webSearchApiService';

const AIWebSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<WebSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const request: WebSearchRequest = {
        UserPrompt: searchQuery.trim(),
        RequestId: `web_search_${Date.now()}`,
        Metadata: {
          timestamp: new Date().toISOString(),
          searchType: 'comprehensive'
        }
      };

      const response = await webSearchApiService.searchWeb(request);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const getConfiabilidadColor = (confiabilidad: string) => {
    switch (confiabilidad?.toLowerCase()) {
      case 'alta':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'media':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'baja':
        return 'text-red-400 bg-red-900/20 border-red-700';
      default:
        return 'text-slate-400 bg-slate-900/20 border-slate-700';
    }
  };

  const getRelevanciaStars = (relevancia: string) => {
    const nivel = parseInt(relevancia) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < nivel ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
      />
    ));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Trigger search automatically
    const event = { preventDefault: () => {} } as React.FormEvent;
    setSearchQuery(suggestion);
    setTimeout(() => {
      handleSearch(event);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              AI Web Search
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Búsqueda inteligente con análisis avanzado de IA. Obtén información completa, 
            análisis contextual y datos específicos de cualquier tema.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué quieres descubrir hoy? Ej: 'Tendencias de IA en 2025', 'Mejores prácticas de desarrollo web'"
                className="w-full pl-12 pr-32 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg backdrop-blur-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
              >
                {loading ? 'Analizando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </form>

        {/* Search Suggestions (when no search has been made) */}
        {!results && !loading && !error && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Sugerencias populares:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[
                "Últimas tendencias en inteligencia artificial",
                "Cómo funciona ChatGPT y los LLMs",
                "Mejores frameworks de desarrollo web 2025",
                "Inversiones en tecnología blockchain",
                "Herramientas de IA para productividad",
                "Sostenibilidad y tecnología verde"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-left hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="flex items-center text-slate-300 group-hover:text-blue-400">
                    <Sparkles className="w-4 h-4 mr-3 text-blue-400" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-purple-500 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-slate-400 text-lg">Analizando información con IA...</p>
            <p className="text-slate-500 text-sm mt-2">Esto puede tomar unos momentos</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mb-6">
            <div className="flex items-center text-red-400 mb-2">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <h3 className="text-lg font-semibold">Error en la búsqueda</h3>
            </div>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {results?.Success && results.SearchResults && (
          <div className="space-y-8">
            {/* HTML Details Section - Prominent at the top */}
            {results.SearchResults.HtmlDetalles && (
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-xl p-6 shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Info className="w-8 h-8 mr-3 text-blue-400" />
                  Análisis Detallado con IA
                </h2>
                <div 
                  className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: results.SearchResults.HtmlDetalles }}
                />
              </div>
            )}

            {/* Links and Sources - Moved to the top for immediate access */}
            {results.SearchResults.LinksYFuentes && results.SearchResults.LinksYFuentes.length > 0 && (
              <div className="bg-gradient-to-r from-sky-900/20 to-blue-900/20 border border-sky-700/50 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <ExternalLink className="w-6 h-6 mr-3 text-sky-400" />
                  🚀 Fuentes y Enlaces de Referencia - Acceso Rápido
                </h2>
                <p className="text-slate-400 mb-6">Accede directamente a las fuentes originales para profundizar en el tema:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.SearchResults.LinksYFuentes.map((link, index) => (
                    <a
                      key={index}
                      href={link.Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-sky-500/50 hover:bg-slate-900/70 hover:shadow-lg transition-all duration-200 group transform hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                          {link.Titulo}
                        </h3>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors flex-shrink-0 ml-2" />
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                        {link.Descripcion}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block bg-purple-900/30 border border-purple-700 text-purple-400 px-2 py-1 rounded text-xs">
                          {link.TipoFuente}
                        </span>
                        
                        <div className={`inline-block px-2 py-1 rounded text-xs border ${getConfiabilidadColor(link.Confiabilidad)}`}>
                          <Shield className="w-3 h-3 inline mr-1" />
                          {link.Confiabilidad}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Summary */}
            {results.SearchResults.ResumenEjecutivo && (
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                  Resumen Ejecutivo
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {results.SearchResults.ResumenEjecutivo}
                </p>
              </div>
            )}

            {/* Search Results Grid */}
            {results.SearchResults.ResultadosBusqueda && results.SearchResults.ResultadosBusqueda.length > 0 && (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Search className="w-6 h-6 mr-3 text-blue-400" />
                  Resultados de Búsqueda ({results.SearchResults.ResultadosBusqueda.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {results.SearchResults.ResultadosBusqueda.map((resultado, index) => (
                    <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 hover:border-blue-500/50 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-blue-400 transition-colors">
                          {resultado.Titulo}
                        </h3>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getRelevanciaStars(resultado.Relevancia)}
                        </div>
                      </div>
                      
                      <p className="text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                        {resultado.Contenido}
                      </p>
                      
                      {/* Fotos - Gallery */}
                      {resultado.Fotos && resultado.Fotos.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {resultado.Fotos.slice(0, 6).map((foto, fotoIndex) => (
                              <div key={fotoIndex} className="relative group">
                                <img
                                  src={foto}
                                  alt={`Imagen ${fotoIndex + 1} de ${resultado.Titulo}`}
                                  className="w-full h-20 object-cover rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all duration-200 cursor-pointer group-hover:shadow-lg"
                                  onClick={() => window.open(foto, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                  <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                            ))}
                          </div>
                          {resultado.Fotos.length > 6 && (
                            <p className="text-slate-400 text-xs mt-2">
                              +{resultado.Fotos.length - 6} imágenes más
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {/* URL y Fuente */}
                        <div className="flex items-center text-sm text-slate-400">
                          <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                          <a 
                            href={resultado.Url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline hover:no-underline transition-colors truncate"
                            title={resultado.Url}
                          >
                            {resultado.Fuente}
                          </a>
                        </div>
                        
                        {/* Fecha de Publicación */}
                        {resultado.FechaPublicacion && (
                          <div className="flex items-center text-sm text-slate-400">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>Publicado: {resultado.FechaPublicacion}</span>
                          </div>
                        )}
                        
                        {/* Precios */}
                        {resultado.Precios && (
                          <div className="flex items-center text-sm text-green-400">
                            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="font-medium">{resultado.Precios}</span>
                          </div>
                        )}
                        
                        {/* Categoría y Relevancia */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {resultado.Categoria && (
                              <span className="inline-block bg-blue-900/30 border border-blue-700 text-blue-400 px-3 py-1 rounded-full text-sm">
                                📂 {resultado.Categoria}
                              </span>
                            )}
                          </div>
                          
                          {/* Indicador de relevancia con texto */}
                          <div className="flex items-center text-xs text-slate-500">
                            <span className="mr-1">Relevancia:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              resultado.Relevancia === 'alta' || resultado.Relevancia === '5' ? 'bg-green-900/30 text-green-400' :
                              resultado.Relevancia === 'media' || resultado.Relevancia === '3' || resultado.Relevancia === '4' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {resultado.Relevancia}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Data and Context Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Specific Data */}
              {results.SearchResults.DatosEspecificos && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
                    Datos Específicos
                  </h2>
                  
                  <div className="space-y-6">
                    {results.SearchResults.DatosEspecificos.Fechas && results.SearchResults.DatosEspecificos.Fechas.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                          Fechas Importantes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {results.SearchResults.DatosEspecificos.Fechas.map((fecha, index) => (
                            <span key={index} className="bg-blue-900/30 border border-blue-700 text-blue-400 px-3 py-2 rounded-lg text-sm">
                              {fecha}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.SearchResults.DatosEspecificos.Precios && results.SearchResults.DatosEspecificos.Precios.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                          Información de Precios
                        </h3>
                        <div className="space-y-2">
                          {results.SearchResults.DatosEspecificos.Precios.map((precio, index) => (
                            <div key={index} className="bg-green-900/30 border border-green-700 text-green-400 px-3 py-2 rounded-lg text-sm">
                              {precio}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.SearchResults.DatosEspecificos.Ubicaciones && results.SearchResults.DatosEspecificos.Ubicaciones.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-red-400" />
                          Ubicaciones Relevantes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {results.SearchResults.DatosEspecificos.Ubicaciones.map((ubicacion, index) => (
                            <span key={index} className="bg-red-900/30 border border-red-700 text-red-400 px-3 py-2 rounded-lg text-sm">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {ubicacion}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.SearchResults.DatosEspecificos.Estadisticas && results.SearchResults.DatosEspecificos.Estadisticas.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                          Estadísticas Clave
                        </h3>
                        <div className="space-y-2">
                          {results.SearchResults.DatosEspecificos.Estadisticas.map((stat, index) => (
                            <div key={index} className="bg-purple-900/30 border border-purple-700 text-purple-400 px-3 py-2 rounded-lg text-sm flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
                              {stat}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Context Analysis */}
              {results.SearchResults.AnalisisContexto && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-purple-400" />
                    Análisis de Contexto
                  </h2>
                  
                  <div className="space-y-4">
                    {results.SearchResults.AnalisisContexto.Tendencias && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                          Tendencias
                        </h3>
                        <p className="text-slate-300 bg-slate-900/50 border border-slate-700 p-4 rounded-lg leading-relaxed">
                          {results.SearchResults.AnalisisContexto.Tendencias}
                        </p>
                      </div>
                    )}
                    
                    {results.SearchResults.AnalisisContexto.Impacto && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                          Impacto
                        </h3>
                        <p className="text-slate-300 bg-slate-900/50 border border-slate-700 p-4 rounded-lg leading-relaxed">
                          {results.SearchResults.AnalisisContexto.Impacto}
                        </p>
                      </div>
                    )}
                    
                    {results.SearchResults.AnalisisContexto.Perspectivas && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                          <Info className="w-5 h-5 mr-2 text-cyan-400" />
                          Perspectivas
                        </h3>
                        <p className="text-slate-300 bg-slate-900/50 border border-slate-700 p-4 rounded-lg leading-relaxed">
                          {results.SearchResults.AnalisisContexto.Perspectivas}
                        </p>
                      </div>
                    )}
                    
                    {results.SearchResults.AnalisisContexto.Actualidad && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-green-400" />
                          Actualidad
                        </h3>
                        <p className="text-slate-300 bg-slate-900/50 border border-slate-700 p-4 rounded-lg leading-relaxed">
                          {results.SearchResults.AnalisisContexto.Actualidad}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations and Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recommendations */}
              {results.SearchResults.Recomendaciones && results.SearchResults.Recomendaciones.length > 0 && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                    Recomendaciones
                  </h2>
                  <div className="space-y-3">
                    {results.SearchResults.Recomendaciones.map((recomendacion, index) => (
                      <div key={index} className="flex items-start bg-slate-900/50 border border-slate-700 p-4 rounded-lg hover:border-green-500/50 transition-colors">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 leading-relaxed">{recomendacion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords and Confidence */}
              <div className="space-y-6">
                {/* Keywords */}
                {results.SearchResults.PalabrasClave && results.SearchResults.PalabrasClave.length > 0 && (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                      Palabras Clave
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {results.SearchResults.PalabrasClave.map((palabra, index) => (
                        <span key={index} className="bg-blue-900/30 border border-blue-700 text-blue-400 px-3 py-2 rounded-full text-sm hover:bg-blue-900/50 transition-colors">
                          #{palabra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Level */}
                {results.SearchResults.NivelConfianza && (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-purple-400" />
                      Nivel de Confianza
                    </h2>
                    <div className={`text-center p-6 rounded-lg border-2 ${getConfiabilidadColor(results.SearchResults.NivelConfianza)}`}>
                      <div className="text-3xl font-bold mb-2">{results.SearchResults.NivelConfianza}</div>
                      <div className="text-sm opacity-80">Nivel de confianza de la información</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Procesado en {results.ProcessingTimeMs}ms</span>
                </div>
                <div className="flex items-center">
                  <span>ID: {results.RequestId}</span>
                </div>
                <div className="flex items-center">
                  <span>{new Date(results.ProcessedAt).toLocaleString()}</span>
                </div>
              </div>
              
              {results.Disclaimer && (
                <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                  <p className="text-amber-400 text-sm flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{results.Disclaimer}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWebSearchPage;