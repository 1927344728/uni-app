import { Message } from '@arco-design/web-react';

const TOKEN_KEY = 'yizhao_admin_token';
const API_BASE = String(import.meta.env.VITE_SERVER_HOST || '').replace(/\/$/, '');

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value) && !value.length) return;
    query.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export async function request(path, options = {}) {
  const { params, headers, silent, ...rest } = options;
  const token = getAdminToken();
  const res = await fetch(`${resolveUrl(path)}${buildQuery(params)}`, {
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (res.status === 401) {
    clearAdminToken();
    const onLoginPage = window.location.pathname.startsWith('/arco-admin/login');
    if (!onLoginPage) {
      window.location.href = '/arco-admin/login';
    }
    throw new Error('未登录或登录已过期');
  }
  if (!res.ok || !body || !body.success || body.code !== 200) {
    const message = body?.message || `请求失败：${res.status}`;
    if (!silent) Message.error(message);
    throw new Error(message);
  }
  return body.data;
}

export async function uploadCos(file, dir) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('单文件不能超过 50MB');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dir', dir);
  return request('/api/cos/upload', {
    method: 'POST',
    body: formData,
  });
}
