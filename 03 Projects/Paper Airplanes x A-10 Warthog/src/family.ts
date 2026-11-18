// The family database sign-in (Supabase Auth). Browser code uses only the
// publishable key. Email and password are sent to the sign-in endpoint and never kept.
namespace PA {
  export const FAMILY_URL = 'https://twvqvutrcobedvuhnzxq.supabase.co';
  export const FAMILY_KEY = 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo';
  const SESSION_KEY = 'pa_warthog.family';

  export interface FamilySession {
    access: string;
    refresh: string;
    email: string;
    expires: number;   // seconds since the epoch
  }

  export function loadSession(): FamilySession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as FamilySession) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(s: FamilySession | null): void {
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // Not kept on this device: the user just signs in again next time.
    }
  }

  // Sign in with the family email and password. Throws with a plain message on failure.
  export async function signIn(email: string, password: string): Promise<FamilySession> {
    const res = await fetch(FAMILY_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: FAMILY_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({} as Record<string, string>));
    if (!res.ok || !body.access_token) {
      throw new Error(body.error_description || body.msg || 'Sign-in failed (' + res.status + ')');
    }
    const session: FamilySession = {
      access: body.access_token,
      refresh: body.refresh_token,
      email,
      expires: Math.floor(Date.now() / 1000) + (body.expires_in || 3600),
    };
    saveSession(session);
    return session;
  }

  export async function signOut(): Promise<void> {
    const s = loadSession();
    saveSession(null);
    if (!s) return;
    try {
      await fetch(FAMILY_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: { apikey: FAMILY_KEY, Authorization: 'Bearer ' + s.access },
      });
    } catch (e) {
      // Offline is fine: this device has already signed out.
    }
  }

  // Asks the database whether the saved sign-in still works.
  export async function checkSession(): Promise<{ ok: boolean; message: string }> {
    const s = loadSession();
    if (!s) return { ok: false, message: 'Not signed in: this device only.' };
    try {
      const res = await fetch(FAMILY_URL + '/auth/v1/user', {
        headers: { apikey: FAMILY_KEY, Authorization: 'Bearer ' + s.access },
      });
      if (res.ok) return { ok: true, message: 'Signed in and the database answers.' };
      return { ok: false, message: 'The database refused the sign-in (' + res.status + '). Sign in again.' };
    } catch (e) {
      return { ok: false, message: 'The database could not be reached: ' + String(e) };
    }
  }
}
