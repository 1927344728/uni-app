import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAdminToken, request, setAdminToken } from '../api/http';

const AuthContext = createContext(null);

function readToken(data) {
  return String(data?.token || data?.jwt || data?.accessToken || '');
}

function readUser(data) {
  const user = data?.user || data;
  if (!user) return null;
  return {
    ...user,
    pages: data?.pages ?? user.pages,
    buttons: data?.buttons ?? user.buttons,
    permissions: data?.permissions ?? user.permissions,
  };
}

function normalizeButtons(user) {
  const raw = user?.permissions?.buttons ?? user?.buttons;
  if (!raw) return new Set();
  if (Array.isArray(raw)) return new Set(raw);
  const result = new Set();
  Object.entries(raw).forEach(([page, buttons]) => {
    if (buttons === true) {
      result.add(page);
      return;
    }
    if (Array.isArray(buttons)) {
      buttons.forEach((button) => result.add(button.includes('.') ? button : `${page}.${button}`));
    }
  });
  return result;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yizhao_admin_token');
      if (!token) {
        setUser(null);
        return;
      }
      const data = await request('/api/admin/me', { silent: true });
      setUser(readUser(data));
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone, password) => {
    const data = await request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    const token = readToken(data);
    if (token) setAdminToken(token);
    setUser(readUser(data));
  }, []);

  const logout = useCallback(async () => {
    await request('/api/admin/logout', { method: 'POST', silent: true }).catch(() => undefined);
    clearAdminToken();
    setUser(null);
  }, []);

  useEffect(() => {
    refreshMe().catch(() => {
      clearAdminToken();
      setUser(null);
      setLoading(false);
    });
  }, [refreshMe]);

  const value = useMemo(() => {
    const pageSet = new Set(user?.permissions?.pages || user?.pages || []);
    const buttonSet = normalizeButtons(user);
    const isSuper = user?.adminRole === 1;
    return {
      user,
      loading,
      login,
      logout,
      refreshMe,
      canPage: (permission) => isSuper || pageSet.has('*') || pageSet.has(permission),
      canButton: (permission) => isSuper || buttonSet.has('*') || buttonSet.has(permission),
    };
  }, [user, loading, login, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
