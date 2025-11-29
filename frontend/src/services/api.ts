import {
  ApiResponse,
  ApiError,
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  PromptQueryParams,
  PromptStats,
  GeneratedImage,
  GenerateImageInput,
  ImageQueryParams,
  ImageStats,
  PaginatedResponse,
  DashboardStats,
  AuthTokens,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      
      // Handle token expiration
      if (response.status === 401 && error.error.code === 'TOKEN_EXPIRED' && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          return this.request<T>(endpoint, options);
        } catch {
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      
      throw error;
    }

    return data as T;
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.setTokens(data.data.tokens);
  }

  // Auth endpoints
  async login(input: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.setTokens(response.data.tokens);
    return response;
  }

  async register(input: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.setTokens(response.data.tokens);
    return response;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.request('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch {
        // Ignore logout errors
      }
    }
    this.clearTokens();
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/api/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword: newPassword }),
    });
  }

  // User endpoints
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDashboard(): Promise<ApiResponse<DashboardStats>> {
    return this.request<ApiResponse<DashboardStats>>('/api/users/dashboard');
  }

  // Prompt endpoints
  async getPrompts(params?: PromptQueryParams): Promise<PaginatedResponse<Prompt>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request<PaginatedResponse<Prompt>>(`/api/prompts${query ? `?${query}` : ''}`);
  }

  async getPrompt(id: string): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>(`/api/prompts/${id}`);
  }

  async createPrompt(input: CreatePromptInput): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updatePrompt(id: string, input: UpdatePromptInput): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>(`/api/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deletePrompt(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/api/prompts/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePromptFavorite(id: string): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>(`/api/prompts/${id}/favorite`, {
      method: 'POST',
    });
  }

  async archivePrompt(id: string): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>(`/api/prompts/${id}/archive`, {
      method: 'POST',
    });
  }

  async restorePrompt(id: string): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>(`/api/prompts/${id}/restore`, {
      method: 'POST',
    });
  }

  async duplicatePrompt(id: string): Promise<ApiResponse<Prompt>> {
    return this.request<ApiResponse<Prompt>>(`/api/prompts/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async getPromptStats(): Promise<ApiResponse<PromptStats>> {
    return this.request<ApiResponse<PromptStats>>('/api/prompts/stats');
  }

  // Image endpoints
  async getImages(params?: ImageQueryParams): Promise<PaginatedResponse<GeneratedImage>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request<PaginatedResponse<GeneratedImage>>(`/api/images${query ? `?${query}` : ''}`);
  }

  async getImage(id: string): Promise<ApiResponse<GeneratedImage>> {
    return this.request<ApiResponse<GeneratedImage>>(`/api/images/${id}`);
  }

  async generateImage(input: GenerateImageInput): Promise<ApiResponse<GeneratedImage>> {
    return this.request<ApiResponse<GeneratedImage>>('/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteImage(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/api/images/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleImageFavorite(id: string): Promise<ApiResponse<GeneratedImage>> {
    return this.request<ApiResponse<GeneratedImage>>(`/api/images/${id}/favorite`, {
      method: 'POST',
    });
  }

  async bulkDeleteImages(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    return this.request<ApiResponse<{ deletedCount: number }>>('/api/images/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getImageStats(): Promise<ApiResponse<ImageStats>> {
    return this.request<ApiResponse<ImageStats>>('/api/images/stats');
  }
}

export const api = new ApiService();
export default api;


