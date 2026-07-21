export type ApiItem = Record<string, unknown> & {
  id?: string | number;
  title?: string;
  name?: string;
  image?: string;
  thumb?: string;
  cover?: string;
  note?: string;
  url?: string;
  jumpTo?: 'navigate' | 'webview' | 'web';
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://app.izhao.com.cn:9443';

export async function request<T>(path: string, params: Record<string, unknown> = {}, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [key, String(value)]),
  );
  const response = await fetch(`${API_URL}/${path}${method === 'GET' && query.size ? `?${query}` : ''}`, {
    method,
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    body: method === 'POST' ? JSON.stringify(params) : undefined,
  });
  const body = await response.json() as { success?: boolean; code?: number; message?: string; data?: T };
  if (!response.ok || !body.success || body.code !== 200) throw new Error(body.message ?? '请求异常');
  return body.data as T;
}

export const api = {
  welcome: () => request<unknown>('api/hello/welcome'),
  user: () => request<ApiItem>('api/user/getUserInfo'),
  banners: () => request<ApiItem[]>('api/common/getBannerList'),
  categories: () => request<ApiItem[]>('api/common/getCategoryEnum'),
  articlePage: (params: Record<string, unknown> = {}) => request<{ content?: ApiItem[] }>('api/article/getArticlePageList', params),
  bookPage: (params: Record<string, unknown> = {}) => request<{ content?: ApiItem[] }>('api/book/getBookPageList', params),
  taskTargeters: () => request<string[]>('api/task/getTaskTargeterList'),
  taskPage: (params: Record<string, unknown> = {}) => request<{ content?: ApiItem[] }>('api/task/getTaskPageList', params),
  task: (id: string) => request<ApiItem>('api/task/getTaskById', { id }),
  // The existing backend exposes these endpoints as GET requests, matching uni-vite's request wrapper.
  login: (phone: string, password: string) => request<unknown>('api/login', { phone, password }),
  updatePassword: (password: string, newPassword: string) => request<unknown>('api/updatePassword', { password, newPassword }),
  logout: () => request<unknown>('api/logout'),
  words: (params: Record<string, unknown> = {}) => request<{ content?: ApiItem[] }>('api/study/getChineseWordList', params),
  book: (id: string) => request<ApiItem>('api/book/getBookById', { id }),
  article: (id: string) => request<ApiItem>('api/article/getArticleById', { id }),
  musicPage: (params: Record<string, unknown> = {}) => request<{ content?: ApiItem[] }>('api/music/getMusicPageList', params),
  musicMenus: () => request<ApiItem[]>('api/music/getMusicMenuList'),
  music: (id: string) => request<ApiItem>('api/music/getMusicById', { id }),
  musicByIds: (ids: string[]) => request<ApiItem[]>('api/music/getMusicByIds', { ids }),
  videoPage: (params: Record<string, unknown> = {}) => request<{ content?: ApiItem[] }>('api/video/getVideoPageList', params),
  videoMenus: () => request<ApiItem[]>('api/video/getVideoMenuList'),
  video: (id: string) => request<ApiItem>('api/video/getVideoById', { id }),
  videoByIds: (ids: string[]) => request<ApiItem[]>('api/video/getVideoByIds', { ids }),
};
