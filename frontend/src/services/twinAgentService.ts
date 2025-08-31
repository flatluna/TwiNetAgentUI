interface ProcessQuestionRequest {
  twinId: string;
  question: string;
  sessionId?: string;
}

interface ProcessQuestionResponse {
  success: boolean;
  result?: string;      // Campo Result del backend (contenido HTML/Markdown)
  message: string;
  sessionId: string;
  statistics: any;
  twinId: string;
  agent_type?: string;
  fileNames?: string[]; // Archivos encontrados por el agente
  errorMessage?: string;
  question?: string;    // Pregunta original
  processedAt?: string; // Timestamp del procesamiento
}

interface TwinAgentResponse {
  success: boolean;
  message: string;
  sessionId: string;
  statistics: any;
  twinId: string;
  agent_type?: string;
  fileNames?: string[]; // Archivos encontrados por el agente
}

interface SessionStatistics {
  id: string;
  twinId: string;
  sessionName: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  tokenUsage: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    openaiCalls: number;
    modelUsed: string;
  };
  messageCount: {
    userMessages: number;
    assistantMessages: number;
    totalMessages: number;
  };
  status: string;
  createdAt: string;
  lastActivity: string;
}

class TwinAgentClient {
  private baseUrl: string;
  private sessionId: string | null;

  constructor(baseUrl: string = 'http://localhost:7011') {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  async sendMessage(twinId: string, message: string): Promise<TwinAgentResponse> {
    console.log('🚀 INICIANDO LLAMADA AL TWINAGENT SERVICE');
    console.log('🔍 TwinId recibido:', twinId);
    console.log('💬 Mensaje recibido:', message);
    
    try {
      const url = `${this.baseUrl}/api/ProcessQuestion`;
      console.log('🌐 URL COMPLETA LLAMADA:', url);
      
      const request: ProcessQuestionRequest = {
        twinId: twinId,
        question: message,
        sessionId: this.sessionId || undefined
      };
      
      console.log('📤 PAYLOAD ENVIADO:', request);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProcessQuestionResponse = await response.json();
      console.log('📦 RESPUESTA COMPLETA DEL BACKEND (RAW):', data);
      console.log('🔍 ESTRUCTURA DE RESPUESTA:', Object.keys(data));
      
      if (!data.success) {
        throw new Error(data.errorMessage || 'Unknown error occurred');
      }

      // Update session ID if provided
      if (data.sessionId) {
        this.sessionId = data.sessionId;
      }

      return {
        success: data.success,
        message: data.message,
        sessionId: data.sessionId,
        statistics: data.statistics,
        twinId: data.twinId,
        agent_type: data.agent_type,
        fileNames: data.fileNames || [] // Incluir archivos encontrados
      };
    } catch (error) {
      console.error('❌ Error llamando al TwinAgent:', error);
      throw error;
    }
  }

  // Método para limpiar la sesión
  clearSession(): void {
    this.sessionId = null;
  }

  // Getter para obtener el sessionId actual
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }
}

export default TwinAgentClient;
export type { TwinAgentResponse, SessionStatistics, ProcessQuestionRequest, ProcessQuestionResponse };
