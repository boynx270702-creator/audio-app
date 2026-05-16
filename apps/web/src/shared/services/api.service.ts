import { apiClient } from './api-client';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export const authApi = {
  register: (data: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data).then((r) => r.data),

  getMe: () =>
    apiClient.get('/auth/me').then((r) => r.data),
};

export const storiesApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get('/stories', { params: { page, limit } }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get(`/stories/${slug}`).then((r) => r.data),

  getChapter: (slug: string, chapter: number) =>
    apiClient.get(`/stories/${slug}/chapters/${chapter}`).then((r) => r.data),

  getPaginatedChapters: (slug: string, page = 1, limit = 100) =>
    apiClient.get(`/stories/${slug}/chapters`, { params: { page, limit } }).then((r) => r.data),

  unlockChapter: (chapterId: string) =>
    apiClient.post(`/stories/chapters/${chapterId}/unlock`).then((r) => r.data),
};

export const readingApi = {
  saveProgress: (data: { storyId: string; chapterId: string; progressPct: number }) =>
    apiClient.post('/reading-history/progress', data).then((r) => r.data),

  getHistory: () =>
    apiClient.get('/reading-history').then((r) => r.data),
};

export const socialApi = {
  getComments: (targetId: string, targetType: string, page = 1) =>
    apiClient.get('/social/comments', { params: { targetId, targetType, page } }).then((r) => r.data),

  createComment: (data: { targetId: string, targetType: string, content: string, parentId?: string }) =>
    apiClient.post('/social/comments', data).then((r) => r.data),

  toggleLike: (targetId: string, targetType: string) =>
    apiClient.post('/social/likes/toggle', { targetId, targetType }).then((r) => r.data),

  getLikeStatus: (targetId: string, targetType: string) =>
    apiClient.get('/social/likes/status', { params: { targetId, targetType } }).then((r) => r.data),
};

export const adminApi = {
  stories: {
    findAll: (page = 1, limit = 10, search = '', status = 'ALL') =>
      apiClient.get('/admin/stories', { params: { page, limit, search, status } }).then((r) => r.data),

    findOne: (id: string) =>
      apiClient.get(`/admin/stories/${id}`).then((r) => r.data),

    create: (data: any) =>
      apiClient.post('/admin/stories', data).then((r) => r.data),

    update: (id: string, data: any) =>
      apiClient.put(`/admin/stories/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
      apiClient.delete(`/admin/stories/${id}`).then((r) => r.data),

    addChapter: (storyId: string, data: any) =>
      apiClient.post(`/admin/stories/${storyId}/chapters`, data).then((r) => r.data),

    getChapters: (storyId: string, page = 1, limit = 50) =>
      apiClient.get(`/admin/stories/${storyId}/chapters`, { params: { page, limit } }).then((r) => r.data),

    updateChapter: (chapterId: string, data: any) =>
      apiClient.put(`/admin/stories/chapters/${chapterId}`, data).then((r) => r.data),

    deleteChapter: (chapterId: string) =>
      apiClient.delete(`/admin/stories/chapters/${chapterId}`).then((r) => r.data),
  },

  authors: {
    findAll: (page = 1, limit = 10, search = '') =>
      apiClient.get('/admin/authors', { params: { page, limit, search } }).then((r) => r.data),

    create: (data: { name: string, bio?: string, avatarUrl?: string }) =>
      apiClient.post('/admin/authors', data).then((r) => r.data),

    update: (id: string, data: any) =>
      apiClient.put(`/admin/authors/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
      apiClient.delete(`/admin/authors/${id}`).then((r) => r.data),
  },

  categories: {
    findAll: (page = 1, limit = 10, search = '') =>
      apiClient.get('/admin/categories', { params: { page, limit, search } }).then((r) => r.data),

    create: (data: { name: string, description?: string }) =>
      apiClient.post('/admin/categories', data).then((r) => r.data),

    update: (id: string, data: any) =>
      apiClient.put(`/admin/categories/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
      apiClient.delete(`/admin/categories/${id}`).then((r) => r.data),
  },

  users: {
    findAll: (page = 1, limit = 10, search = '') =>
      apiClient.get('/admin/users', { params: { page, limit, search } }).then((r) => r.data),

    update: (id: string, data: any) =>
      apiClient.put(`/admin/users/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
      apiClient.delete(`/admin/users/${id}`).then((r) => r.data),
  },

  wallets: {
    findAll: (page = 1, limit = 10, search = '') =>
      apiClient.get('/admin/wallets', { params: { page, limit, search } }).then((r) => r.data),

    adjust: (data: { userId: string, amount: number, currency: string, type: string, description?: string }) =>
      apiClient.post('/admin/wallets/adjust', data).then((r) => r.data),
  },

  transactions: {
    findAll: (page = 1, limit = 10, search = '', type = '', currency = '') =>
      apiClient.get('/admin/wallets/transactions', { params: { page, limit, search, type, currency } }).then((r) => r.data),
  },

  quests: {
    findAll: (page = 1, limit = 10, search = '') =>
      apiClient.get('/admin/quests', { params: { page, limit, search } }).then((r) => r.data),

    create: (data: any) =>
      apiClient.post('/admin/quests', data).then((r) => r.data),

    update: (id: string, data: any) =>
      apiClient.put(`/admin/quests/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
      apiClient.delete(`/admin/quests/${id}`).then((r) => r.data),
  }
};
