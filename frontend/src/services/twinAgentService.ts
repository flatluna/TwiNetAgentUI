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

  constructor(baseUrl: string = 'http://localhost:7072') {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  async sendMessage(twinId: string, message: string): Promise<TwinAgentResponse> {
    console.log('🚀 INICIANDO LLAMADA AL TWINAGENT SERVICE');
    console.log('🔍 TwinId recibido:', twinId);
    console.log('💬 Mensaje recibido:', message);
    
    try {
      const url = `${this.baseUrl}/api/twins/${twinId}/agent-direct`;
      console.log('🌐 URL COMPLETA LLAMADA:', url);
      console.log('📤 PAYLOAD ENVIADO:', {
        message: message,
        session_id: this.sessionId
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          session_id: this.sessionId
        })
      });

      const data = await response.json();
      console.log('📦 RESPUESTA COMPLETA DEL BACKEND (RAW):', data);
      console.log('🔍 ESTRUCTURA DE RESPUESTA:', Object.keys(data));
      
      if (data.success) {
        this.sessionId = data.session_id;
        return {
          success: data.success,
          message: data.message,
          sessionId: data.session_id,
          statistics: data.session_statistics,
          twinId: data.twin_id,
          agent_type: data.agent_type,
          fileNames: data.fileNames || [] // Incluir archivos encontrados
        };
      } else {
        throw new Error(data.error || 'Error desconocido del TwinAgent');
      }
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
export type { TwinAgentResponse, SessionStatistics };
