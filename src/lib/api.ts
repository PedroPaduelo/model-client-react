import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api';

// Configuração da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const auth = JSON.parse(authStorage);
            if (auth.state?.token) {
              config.headers.Authorization = `Bearer ${auth.state.token}`;
            }
          } catch (error) {
            console.warn('Erro ao ler token do localStorage:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Se o erro for 401 e não for uma tentativa de refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          // Se já estiver refrescando, adiciona à fila
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers!.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();

            // Atualiza todas as requisições na fila
            this.refreshSubscribers.forEach((callback) => callback(newToken));
            this.refreshSubscribers = [];

            // Refaz a requisição original
            originalRequest.headers!.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Se o refresh falhar, limpa o storage e redireciona
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      throw new Error('No auth storage found');
    }

    const auth = JSON.parse(authStorage);
    if (!auth.state?.refreshToken) {
      throw new Error('No refresh token found');
    }

    try {
      const response = await axios.post(`${API_URL}/sessions/refresh`, {
        refreshToken: auth.state.refreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Atualiza o localStorage
      const newAuthState = {
        ...auth.state,
        token: newToken,
        refreshToken: newRefreshToken,
      };

      localStorage.setItem('auth-storage', JSON.stringify({
        state: newAuthState,
        version: 0,
      }));

      return newToken;
    } catch (error) {
      throw error;
    }
  }

  private clearAuth() {
    localStorage.removeItem('auth-storage');
    // Limpa também qualquer cookie ou storage adicional
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  }

  // Métodos HTTP públicos
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Método para upload de arquivos
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Método para download de arquivos
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    // Cria URL para download
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename || 'download');
    document.body.appendChild(link);
    link.click();

    // Limpa
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }

  // Utilitários
  setAuthorizationHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthorizationHeader() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Obter URL base
  getBaseURL(): string {
    return this.client.defaults.baseURL as string;
  }
}

// Instância única do cliente
export const api = new ApiClient();

// Exportar URLs de configuração
export { API_URL, WS_URL };

// Função utilitária para tratamento de erros
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    return {
      error: axiosError.response?.data?.error || 'API Error',
      message: axiosError.response?.data?.message || axiosError.message,
      details: axiosError.response?.data?.details,
      statusCode: axiosError.response?.status || 500,
    };
  }

  return {
    error: 'Unknown Error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    statusCode: 500,
  };
};

// Função para verificar se o erro é de rede
export const isNetworkError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && !!error.request;
  }
  return false;
};

// Função para verificar se o erro é de timeout
export const isTimeoutError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  }
  return false;
};

// Função para verificar se o token expirou
export const isTokenExpiredError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
};

export default api;