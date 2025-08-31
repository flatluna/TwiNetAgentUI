// components/TwinResponse.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import './TwinResponse.css';

interface ProcessQuestionResponse {
  success: boolean;
  result?: string;      // Campo Result del backend (contenido HTML)
  question?: string;    // Pregunta original
  twinId?: string;
  processedAt?: string; // Timestamp del procesamiento
  errorMessage?: string;
}

interface TwinResponseProps {
  response: ProcessQuestionResponse;
}

export const TwinResponse: React.FC<TwinResponseProps> = ({ response }) => {
  if (!response.success) {
    return (
      <div className="twin-response-error">
        <div className="error-message">
          ❌ {response.errorMessage || 'Error procesando la pregunta'}
        </div>
        <div className="error-time">
          {new Date(response.processedAt || '').toLocaleString()}
        </div>
      </div>
    );
  }

  // Limpiar el contenido HTML del backend
  let htmlContent = response.result || '';
  
  // Remover los bloques ```html si existen
  htmlContent = htmlContent.replace(/```html\s*/g, '').replace(/```\s*/g, '');
  
  // Remover timestamps duplicados que pueden venir del backend
  htmlContent = htmlContent.replace(/\d{1,2}\/\d{1,2}\/\d{4},?\s*\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/gi, '');
  htmlContent = htmlContent.replace(/\d{2}:\d{2}\s*(AM|PM)/gi, '');
  
  // Limpiar espacios en blanco extra
  htmlContent = htmlContent.trim();

  return (
    <div className="twin-response-simple">
      <div 
        className="response-content"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(htmlContent) 
        }}
      />
      <div className="response-time">
        {new Date(response.processedAt || '').toLocaleString()}
      </div>
    </div>
  );
};
