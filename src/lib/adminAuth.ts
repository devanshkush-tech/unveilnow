// Lightweight admin session client. Token lives only in localStorage under a dedicated key,
// completely separate from the normal Supabase user session.
const KEY = 'unveil_admin_token_v1';
const ADMIN_KEY = 'unveil_admin_v1';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export type AdminUser = { id: string; email: string; display_name: string | null };

export const adminAuth = {
  getToken(): string | null {
    return localStorage.getItem(KEY);
  },
  getAdmin(): AdminUser | null {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  async login(email: string, password: string): Promise<AdminUser> {
    const r = await fetch(`${FN_BASE}/admin-auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error ?? 'Login failed');
    localStorage.setItem(KEY, data.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
    return data.admin;
  },
  async verify(): Promise<AdminUser | null> {
    const token = this.getToken();
    if (!token) return null;
    const r = await fetch(`${FN_BASE}/admin-auth?action=verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({}),
    });
    if (!r.ok) {
      this.clear();
      return null;
    }
    const data = await r.json();
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
    return data.admin;
  },
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await fetch(`${FN_BASE}/admin-auth?action=logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({}),
      }).catch(() => {});
    }
    this.clear();
  },
  clear() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
  async call<T = any>(action: string, body: any = {}, opts: { raw?: boolean } = {}): Promise<T> {
    const token = this.getToken();
    if (!token) throw new Error('Not signed in as admin');
    const r = await fetch(`${FN_BASE}/admin-data?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(body),
    });
    if (opts.raw) return r as unknown as T;
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((data as any)?.error ?? 'Request failed');
    return data as T;
  },
  async download(action: string, body: any, filename: string) {
    const token = this.getToken();
    if (!token) throw new Error('Not signed in');
    const r = await fetch(`${FN_BASE}/admin-data?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('Export failed');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  },
};
