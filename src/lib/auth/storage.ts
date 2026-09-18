import type { StoredUser } from './authLogic';

const USERS_KEY = 'simple-auth-users';
const SESSION_KEY = 'simple-auth-session';

function withStorage<T>(operation: () => T, fallback: T): T {
  try {
    return operation();
  } catch {
    return fallback;
  }
}

function read<T>(key: string, fallback: T): T {
  return withStorage(() => {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  }, fallback);
}

export type AuthStorage = {
  readUsers: () => StoredUser[];
  writeUsers: (users: StoredUser[]) => boolean;
  readSession: () => StoredUser | null;
  writeSession: (user: StoredUser) => boolean;
  clearSession: () => boolean;
};

export const authStorage: AuthStorage = {
  readUsers() {
    return read<StoredUser[]>(USERS_KEY, []);
  },

  writeUsers(users) {
    return withStorage(() => {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    }, false);
  },

  readSession() {
    return read<StoredUser | null>(SESSION_KEY, null);
  },

  writeSession(user) {
    return withStorage(() => {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return true;
    }, false);
  },

  clearSession() {
    return withStorage(() => {
      window.localStorage.removeItem(SESSION_KEY);
      return true;
    }, false);
  },
};