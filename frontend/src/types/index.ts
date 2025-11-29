// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Prompt types
export type PromptCategory =
  | 'portrait'
  | 'landscape'
  | 'abstract'
  | 'fantasy'
  | 'scifi'
  | 'anime'
  | 'realistic'
  | 'artistic'
  | 'other';

export type PromptStatus = 'draft' | 'active' | 'archived';

export interface PromptSettings {
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  negativePrompt?: string;
  description?: string;
  category: PromptCategory;
  status: PromptStatus;
  tags?: string[];
  settings?: PromptSettings;
  isFavorite: boolean;
  usageCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptInput {
  title: string;
  content: string;
  negativePrompt?: string;
  description?: string;
  category?: PromptCategory;
  tags?: string[];
  settings?: PromptSettings;
  isFavorite?: boolean;
}

export interface UpdatePromptInput extends Partial<CreatePromptInput> {
  status?: PromptStatus;
}

// Image types
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationSettings {
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  sampler: string;
  seed: number;
  model?: string;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  originalFilename?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  status: ImageStatus;
  promptUsed?: string;
  negativePromptUsed?: string;
  generationSettings?: GenerationSettings;
  generationTimeMs?: number;
  isFavorite: boolean;
  tags?: string[];
  errorMessage?: string;
  userId: string;
  promptId?: string;
  prompt?: Prompt;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  promptId?: string;
  settings?: Partial<GenerationSettings>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query params
export interface PromptQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: PromptCategory | '';
  status?: PromptStatus | '';
  isFavorite?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'usageCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ImageQueryParams {
  page?: number;
  limit?: number;
  promptId?: string;
  status?: ImageStatus | '';
  isFavorite?: boolean;
  sortBy?: 'createdAt' | 'fileSize';
  sortOrder?: 'ASC' | 'DESC';
}

// Stats types
export interface PromptStats {
  totalPrompts: number;
  favoriteCount: number;
  categoryCounts: Record<string, number>;
}

export interface ImageStats {
  totalImages: number;
  completedCount: number;
  failedCount: number;
  favoriteCount: number;
  totalGenerationTime: number;
}

export interface DashboardStats {
  user: User;
  promptCount: number;
  imageCount: number;
  favoritePromptsCount: number;
  favoriteImagesCount: number;
}


