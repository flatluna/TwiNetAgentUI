/**
 * API service for Twin Agent backend communication
 */

export interface TwinProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephoneNumber: string;
  countryId: string;
  createdAt?: string;
  lastModified?: string;
}

export interface TwinProfileCreate {
  firstName: string;
  lastName: string;
  email: string;
  telephoneNumber: string;
  countryId: string;
}

export interface TwinProfileUpdate {
  firstName?: string;
  lastName?: string;
  telephoneNumber?: string;
  countryId?: string;
}

export interface AgentChatRequest {
  message: string;
  twinId?: string;
  context?: Record<string, any>;
}

export interface AgentChatResponse {
  response: string;
  twinProfile?: TwinProfile;
  audioResponse?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  services: Record<string, string>;
}

class ApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    this.apiKey = import.meta.env.VITE_API_KEY || 'your-api-key-here';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Twin Profile Management
  async getAllTwins(): Promise<TwinProfile[]> {
    return this.request<TwinProfile[]>('/api/twins');
  }

  async getTwin(twinId: string): Promise<TwinProfile> {
    return this.request<TwinProfile>(`/api/twins/${encodeURIComponent(twinId)}`);
  }

  async createTwin(twinData: TwinProfileCreate): Promise<TwinProfile> {
    return this.request<TwinProfile>('/api/twins', {
      method: 'POST',
      body: JSON.stringify(twinData),
    });
  }

  async updateTwin(twinId: string, updateData: TwinProfileUpdate): Promise<TwinProfile> {
    return this.request<TwinProfile>(`/api/twins/${encodeURIComponent(twinId)}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteTwin(twinId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/twins/${encodeURIComponent(twinId)}`, {
      method: 'DELETE',
    });
  }

  // Agent Interactions
  async chatWithAgent(chatRequest: AgentChatRequest): Promise<AgentChatResponse> {
    return this.request<AgentChatResponse>('/api/agents/chat', {
      method: 'POST',
      body: JSON.stringify(chatRequest),
    });
  }

  async getAgentStatus(): Promise<Record<string, string>> {
    return this.request<Record<string, string>>('/api/agents/status');
  }

  // Health Checks
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }

  async getLivenessCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/health/live');
  }

  async getReadinessCheck(): Promise<{ status: string; reason?: string }> {
    return this.request<{ status: string; reason?: string }>('/api/health/ready');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
