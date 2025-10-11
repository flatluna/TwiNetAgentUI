import React, { useState, useEffect } from 'react';
import { Search, Clock, AlertTriangle, ExternalLink, TrendingUp, Globe, Info, Sparkles, Image, FileText, X, ZoomIn, Download, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { googleSearchApiService, GoogleSearchRequest, GoogleSearchResponse } from '../services/googleSearchApiService';

const GoogleSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<GoogleSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Estados para el modal de imagen
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
    alt: string;
    sourceUrl?: string;
  } | null>(null);

  // Estados para el carrusel de imágenes
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselImages, setCarouselImages] = useState<Array<{src: string, title?: string, link?: string}>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageModal = (src: string, title: string, alt: string, sourceUrl?: string) => {
    console.log('🖼️ Abriendo modal de imagen:', { src, title, alt, sourceUrl });
    setSelectedImage({ src, title, alt, sourceUrl });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Funciones para el carrusel
  const openCarousel = (images: Array<{src: string, title?: string, link?: string}>, startIndex = 0) => {
    console.log('🎠 Abriendo carrusel con', images.length, 'imágenes, índice inicial:', startIndex);
    setCarouselImages(images);
    setCurrentImageIndex(startIndex);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
    setCarouselImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Navegación por teclado para el carrusel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showCarousel) {
        switch (e.key) {
          case 'Escape':
            closeCarousel();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            prevImage();
            break;
          case 'ArrowRight':
            e.preventDefault();
            nextImage();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showCarousel]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const request: GoogleSearchRequest = {
        UserPrompt: searchQuery.trim(),
        RequestId: `google_search_${Date.now()}`,
        Metadata: {
          timestamp: new Date().toISOString(),
          searchType: 'google'
        }
      };

      const response = await googleSearchApiService.searchGoogle(request);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda de Google');
    } finally {
      setLoading(false);
    }
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

  const getMetaDescription = (item: any): string => {
    if (item.PageMap?.metatags?.length > 0) {
      const meta = item.PageMap.metatags[0];
      return meta['og:description'] || item.Snippet || '';
    }
    return item.Snippet || '';
  };

  const getImageThumbnail = (item: any): string | null => {
    // Usar nombres originales CseThumbnail con Src
    if ((item.PageMap as any)?.CseThumbnail?.length > 0) {
      return (item.PageMap as any).CseThumbnail[0].Src;
    }
    if (item.PageMap?.metatags?.length > 0) {
      const meta = item.PageMap.metatags[0];
      return meta['og:image'] || meta['twitter:image'] || null;
    }
    return null;
  };

  const getSiteName = (item: any): string => {
    if (item.PageMap?.metatags?.length > 0) {
      const meta = item.PageMap.metatags[0];
      return meta['og:site_name'] || meta['application-name'] || item.DisplayLink;
    }
    return item.DisplayLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Google Search
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Búsqueda avanzada con Google. Accede a resultados completos, 
            metadatos enriquecidos y análisis detallado de contenido web.
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
                placeholder="Busca cualquier cosa en Google... Ej: 'React TypeScript mejores prácticas', 'Noticias tecnología 2025'"
                className="w-full pl-12 pr-40 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg backdrop-blur-sm"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setResults(null);
                      setError('');
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Search Suggestions (when no search has been made) */}
        {!results && !loading && !error && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Sugerencias de búsqueda:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[
                "JavaScript frameworks 2025 comparación",
                "Inteligencia artificial últimas noticias",
                "Tutorial Python para principiantes",
                "Mejores prácticas desarrollo web",
                "React vs Angular vs Vue performance",
                "Machine learning algoritmos explicados"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-left hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="flex items-center text-slate-300 group-hover:text-emerald-400">
                    <Globe className="w-4 h-4 mr-3 text-emerald-400" />
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-teal-500 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-slate-400 text-lg">Buscando en Google...</p>
            <p className="text-slate-500 text-sm mt-2">Obteniendo los mejores resultados</p>
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
            {/* Search Information Header */}
            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-700/50 rounded-xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Resultados</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {results.SearchResults.SearchInformation?.FormattedTotalResults || '0'}
                  </p>
                  <p className="text-slate-400 text-sm">encontrados</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-6 h-6 text-teal-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Tiempo</h3>
                  </div>
                  <p className="text-2xl font-bold text-teal-400">
                    {results.SearchResults.SearchInformation?.FormattedSearchTime || '0'}
                  </p>
                  <p className="text-slate-400 text-sm">segundos</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-cyan-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Páginas</h3>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {results.SearchResults.Items?.length || 0}
                  </p>
                  <p className="text-slate-400 text-sm">mostradas</p>
                </div>
              </div>

              {/* Spelling Suggestion */}
              {results.SearchResults.Spelling?.CorrectedQuery && (
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <div className="flex items-center text-yellow-400">
                    <Info className="w-5 h-5 mr-2" />
                    <span className="font-medium">Sugerencia de búsqueda:</span>
                  </div>
                  <p className="text-yellow-300 mt-1">
                    ¿Quisiste decir: <strong>{results.SearchResults.Spelling.CorrectedQuery}</strong>?
                  </p>
                </div>
              )}
            </div>

            {/* Two Column Layout: Search Results + AI Response */}
            {results.SearchResults.Items && results.SearchResults.Items.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Search Results (2/3 width) */}
                <div className="xl:col-span-2">
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Search className="w-6 h-6 mr-3 text-emerald-400" />
                      Resultados de Google ({results.SearchResults.Items.length})
                    </h2>
                    
                    <div className="space-y-6">
                      {results.SearchResults.Items.map((item, index) => {
                        const thumbnail = getImageThumbnail(item);
                        const siteName = getSiteName(item);
                        const description = getMetaDescription(item);
                        
                        // Obtener imágenes CSE - usando los nombres que funcionaban
                        const cseImages = [];
                        
                        // Usar nombres originales CseImage con Src
                        if ((item.PageMap as any)?.CseImage && Array.isArray((item.PageMap as any).CseImage)) {
                          cseImages.push(...(item.PageMap as any).CseImage.filter((img: any) => img && img.Src));
                        }
                        
                        // También obtener thumbnails CSE
                        const cseThumbnails = [];
                        
                        // Usar nombres originales CseThumbnail con Src
                        if ((item.PageMap as any)?.CseThumbnail && Array.isArray((item.PageMap as any).CseThumbnail)) {
                          cseThumbnails.push(...(item.PageMap as any).CseThumbnail.filter((thumb: any) => thumb && thumb.Src));
                        }
                        
                        // Combinar todas las imágenes disponibles
                        const allItemImages = [...cseImages, ...cseThumbnails];
                        
                        console.log(`🖼️ Item ${index} (${item.Title}):`, {
                          rawPageMap: item.PageMap,
                          CseImage: (item.PageMap as any)?.CseImage,
                          CseThumbnail: (item.PageMap as any)?.CseThumbnail,
                          filteredCseImages: cseImages,
                          filteredCseThumbnails: cseThumbnails,
                          totalImages: allItemImages.length
                        });
                        
                        return (
                          <div 
                            key={index} 
                            className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 group"
                          >
                            <div className="flex gap-4">
                              {/* Main Thumbnail */}
                              {thumbnail && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={thumbnail}
                                    alt={item.Title}
                                    className="w-24 h-24 object-cover rounded-lg border border-slate-600 group-hover:border-emerald-500/50 transition-colors cursor-pointer"
                                    onClick={() => openImageModal(
                                      thumbnail, 
                                      item.Title, 
                                      `Thumbnail de ${item.Title}`,
                                      item.Link
                                    )}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Content */}
                              <div className="flex-grow min-w-0">
                                {/* Site Name */}
                                <div className="flex items-center mb-2">
                                  <Globe className="w-4 h-4 text-emerald-400 mr-2" />
                                  <span className="text-emerald-400 text-sm font-medium">{siteName}</span>
                                </div>
                                
                                {/* Title */}
                                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                                  <a 
                                    href={item.Link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                    dangerouslySetInnerHTML={{ __html: item.HtmlTitle || item.Title }}
                                  />
                                </h3>
                                
                                {/* URL */}
                                <div className="flex items-center mb-3">
                                  <ExternalLink className="w-4 h-4 text-slate-400 mr-2" />
                                  <a 
                                    href={item.Link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sky-400 hover:text-sky-300 underline hover:no-underline transition-colors text-sm truncate"
                                  >
                                    {item.FormattedUrl || item.Link}
                                  </a>
                                </div>
                                
                                {/* Description */}
                                <div 
                                  className="text-slate-300 text-sm leading-relaxed mb-4"
                                  dangerouslySetInnerHTML={{ __html: item.HtmlSnippet || description }}
                                />
                                
                                {/* CSE Images Gallery */}
                                {allItemImages.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex items-center mb-3">
                                      <Image className="w-4 h-4 text-purple-400 mr-2" />
                                      <h4 className="text-purple-400 font-medium text-sm">
                                        Imágenes encontradas ({allItemImages.length})
                                      </h4>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                      {allItemImages.slice(0, 4).map((img, imgIndex) => (
                                        <div key={imgIndex} className="relative group/img">
                                          <img
                                            src={img.Src}
                                            alt={`Imagen ${imgIndex + 1} de ${item.Title}`}
                                            className="w-full h-16 object-cover rounded border border-slate-600 hover:border-purple-400/70 transition-all duration-200 cursor-pointer group-hover/img:scale-105"
                                            onClick={() => openImageModal(
                                              img.Src, 
                                              item.Title, 
                                              `Imagen ${imgIndex + 1} de ${item.Title}`,
                                              item.Link
                                            )}
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 rounded transition-all duration-200 flex items-center justify-center">
                                            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    {allItemImages.length > 4 && (
                                      <p className="text-purple-400/70 text-xs mt-2">
                                        +{allItemImages.length - 4} imágenes más disponibles
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {/* Metadata Tags */}
                                <div className="flex flex-wrap gap-2">
                                  {item.PageMap?.metatags?.[0]?.['og:type'] && (
                                    <span className="inline-block bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-2 py-1 rounded text-xs">
                                      📄 {item.PageMap.metatags[0]['og:type']}
                                    </span>
                                  )}
                                  
                                  {item.PageMap?.metatags?.[0]?.['twitter:card'] && (
                                    <span className="inline-block bg-blue-900/30 border border-blue-700 text-blue-400 px-2 py-1 rounded text-xs">
                                      🐦 {item.PageMap.metatags[0]['twitter:card']}
                                    </span>
                                  )}
                                  
                                  {allItemImages.length > 0 && (
                                    <span className="inline-block bg-purple-900/30 border border-purple-700 text-purple-400 px-2 py-1 rounded text-xs">
                                      🖼️ {allItemImages.length} imagen{allItemImages.length !== 1 ? 'es' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Response (1/3 width) */}
                {results.SearchResults.ResponseHTML && (
                  <div className="xl:col-span-1">
                    <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-700/50 rounded-xl p-6 shadow-xl sticky top-6">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                        Respuesta Procesada por IA
                      </h2>
                      
                      {/* Disclaimer más prominente */}
                      <div className="mb-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                        <p className="text-amber-300 text-sm flex items-start">
                          <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-amber-400" />
                          <span>
                            <strong>Importante:</strong> Esta respuesta fue generada por IA basándose únicamente en los resultados de búsqueda mostrados. 
                            La información podría estar incorrecta o desactualizada. Siempre verifica con fuentes oficiales.
                          </span>
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-inner max-h-[60vh] overflow-y-auto">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: results.SearchResults.ResponseHTML }}
                        />
                      </div>
                      
                      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                        <p className="text-purple-300 text-xs flex items-center">
                          <Info className="w-3 h-3 mr-2" />
                          Respuesta basada en interpretación automática de los {results.SearchResults.Items?.length || 0} resultados de búsqueda
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Images Gallery */}
            {results.SearchResults.Items && (
              (() => {
                const allImages: Array<{src: string, title?: string, link?: string}> = [];
                results.SearchResults.Items.forEach((item, itemIndex) => {
                  console.log(`🔍 Item ${itemIndex} - PageMap:`, item.PageMap);
                  
                  // Intentar con nombres en minúsculas
                  if (item.PageMap?.cse_image) {
                    item.PageMap.cse_image.forEach((img: any) => {
                      console.log(`�️ Procesando cse_image:`, img);
                      const imgSrc = img.src || img.Src;
                      if (imgSrc && !allImages.some(existing => existing.src === imgSrc)) {
                        allImages.push({
                          src: imgSrc,
                          title: item.Title,
                          link: item.Link
                        });
                      }
                    });
                  }
                  
                  // Intentar con nombres en PascalCase
                  if ((item.PageMap as any)?.CseImage) {
                    (item.PageMap as any).CseImage.forEach((img: any) => {
                      console.log(`🖼️ Procesando CseImage:`, img);
                      const imgSrc = img.Src;
                      if (imgSrc && !allImages.some(existing => existing.src === imgSrc)) {
                        allImages.push({
                          src: imgSrc,
                          title: item.Title,
                          link: item.Link
                        });
                      }
                    });
                  }
                  
                  // También thumbnails en minúsculas
                  if (item.PageMap?.cse_thumbnail) {
                    item.PageMap.cse_thumbnail.forEach((thumb: any) => {
                      console.log(`🖼️ Procesando cse_thumbnail:`, thumb);
                      const thumbSrc = thumb.src || thumb.Src;
                      if (thumbSrc && !allImages.some(existing => existing.src === thumbSrc)) {
                        allImages.push({
                          src: thumbSrc,
                          title: item.Title,
                          link: item.Link
                        });
                      }
                    });
                  }
                  
                  // También thumbnails en PascalCase
                  if ((item.PageMap as any)?.CseThumbnail) {
                    (item.PageMap as any).CseThumbnail.forEach((thumb: any) => {
                      console.log(`🖼️ Procesando CseThumbnail:`, thumb);
                      const thumbSrc = thumb.Src;
                      if (thumbSrc && !allImages.some(existing => existing.src === thumbSrc)) {
                        allImages.push({
                          src: thumbSrc,
                          title: item.Title,
                          link: item.Link
                        });
                      }
                    });
                  }
                });
                
                console.log('🖼️ Total de imágenes encontradas para galería:', allImages.length);
                
                return allImages.length > 0 ? (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <Image className="w-6 h-6 mr-3 text-purple-400" />
                        Galería de Imágenes Completa ({allImages.length})
                      </h2>
                      
                      <button
                        onClick={() => openCarousel(allImages, 0)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
                      >
                        <Grid3X3 className="w-5 h-5" />
                        Ver Carrusel
                      </button>
                    </div>
                    
                    {/* Preview de algunas imágenes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {allImages.slice(0, 6).map((imageData, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg border border-slate-600 hover:border-purple-500/50 transition-all duration-200">
                            <img
                              src={imageData.src}
                              alt={imageData.title || `Imagen ${index + 1}`}
                              className="w-full h-32 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                              onClick={() => openCarousel(allImages, index)}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            
                            {/* Overlay with info */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center p-2">
                                <ZoomIn className="w-5 h-5 text-white mx-auto mb-1" />
                                <p className="text-white text-xs font-medium truncate">Ver carrusel</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Image source info */}
                          <div className="mt-2">
                            <p className="text-slate-400 text-xs truncate" title={imageData.title}>
                              {imageData.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {allImages.length > 6 && (
                      <div className="mt-4 text-center">
                        <p className="text-purple-400 text-sm">
                          +{allImages.length - 6} imágenes más disponibles en el carrusel
                        </p>
                      </div>
                    )}
                  </div>
                ) : null;
              })()
            )}

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

      {/* Image Modal/Lightbox */}
      {selectedImage && (() => {
        console.log('🖼️ Renderizando modal de imagen:', selectedImage);
        return (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="relative bg-slate-900/50 border border-slate-700 rounded-xl p-4 max-w-full max-h-full overflow-hidden">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Image Info */}
              <div className="mt-4 p-4 bg-slate-800/80 rounded-lg">
                <h3 className="text-white font-semibold text-lg mb-2">{selectedImage.title}</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedImage.sourceUrl && (
                    <a
                      href={selectedImage.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sky-400 hover:text-sky-300 text-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ir a la página
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(selectedImage.src, '_blank');
                    }}
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Abrir imagen original
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Image Carousel Modal */}
      {showCarousel && carouselImages.length > 0 && (() => {
        console.log('🎠 Renderizando carrusel con', carouselImages.length, 'imágenes, índice actual:', currentImageIndex);
        return (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={closeCarousel}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeCarousel}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            {carouselImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Current Image Counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-lg">
              <span className="text-lg font-medium">
                {currentImageIndex + 1} / {carouselImages.length}
              </span>
            </div>

            {/* Main Image Container */}
            <div className="relative max-w-6xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
              <div className="relative bg-slate-900/30 border border-slate-700 rounded-xl p-4 max-w-full max-h-full overflow-hidden">
                <img
                  src={carouselImages[currentImageIndex]?.src}
                  alt={carouselImages[currentImageIndex]?.title || `Imagen ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Image Info */}
                <div className="mt-4 p-4 bg-slate-800/80 rounded-lg">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {carouselImages[currentImageIndex]?.title || `Imagen ${currentImageIndex + 1}`}
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    {carouselImages[currentImageIndex]?.link && (
                      <a
                        href={carouselImages[currentImageIndex].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sky-400 hover:text-sky-300 text-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ir a la página
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(carouselImages[currentImageIndex]?.src, '_blank');
                      }}
                      className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar imagen
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {carouselImages.length > 1 && (
                <div className="mt-4 max-w-full overflow-x-auto">
                  <div className="flex gap-2 px-4">
                    {carouselImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'border-purple-400 shadow-lg shadow-purple-400/30' 
                            : 'border-slate-600 hover:border-purple-400/50'
                        }`}
                      >
                        <img
                          src={img.src}
                          alt={img.title || `Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Navigation Hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
              <span>Use ← → para navegar • ESC para cerrar</span>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default GoogleSearchPage;