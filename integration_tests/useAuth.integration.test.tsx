import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { StoredUser } from '../src/lib/auth/authLogic';
import { useAuth } from '../src/lib/auth/useAuth';
import type { AuthStorage } from '../src/lib/auth/storage';

function createMemoryStorage(initialUsers: StoredUser[] = []): AuthStorage & { failWrites: boolean } {
  let users = initialUsers;
  let session: StoredUser | null = null;

  const storage: AuthStorage & { failWrites: boolean } = {
    failWrites: false,
    readUsers: () => users,
    writeUsers: (nextUsers) => {
      if (storage.failWrites) return false;
      users = nextUsers;
      return true;
    },
    readSession: () => session,
    writeSession: (user) => {
      if (storage.failWrites) return false;
      session = user;
      return true;
    },
    clearSession: () => {
      if (storage.failWrites) return false;
      session = null;
      return true;
    },
  };

  return storage;
}

describe('useAuth orchestration', () => {
  it('collabora con uno storage in memoria per registrazione, login e logout', () => {
    const memoryStorage = createMemoryStorage();
    const { result } = renderHook(() => useAuth({ storage: memoryStorage, generateId: () => 'fixed-id' }));

    act(() => {
      expect(result.current.register({ name: 'Luca', email: 'luca@email.com', password: 'secret' })).toBe(true);
    });
    expect(result.current.message).toEqual({ type: 'success', code: 'REGISTERED', name: 'Luca' });

    act(() => {
      expect(result.current.login({ email: 'luca@email.com', password: 'secret' })).toBe(true);
    });
    expect(result.current.currentUser?.id).toBe('fixed-id');

    act(() => {
      expect(result.current.logout()).toBe(true);
    });
    expect(result.current.currentUser).toBeNull();
  });

  it('espone un errore quando lo storage rifiuta la registrazione', () => {
    const memoryStorage = createMemoryStorage();
    memoryStorage.failWrites = true;
    const { result } = renderHook(() => useAuth({ storage: memoryStorage, generateId: () => 'fixed-id' }));

    act(() => {
      expect(result.current.register({ name: 'Luca', email: 'luca@email.com', password: 'secret' })).toBe(false);
    });

    expect(result.current.currentUser).toBeNull();
    expect(result.current.message).toEqual({
      type: 'error',
      code: 'WRITE_FAILED',
    });
  });

  it('idrata la sessione già presente nello storage all avvio', () => {
    const existingUser: StoredUser = {
      id: 'existing-id',
      name: 'Anna',
      email: 'anna@email.com',
      password: 'secret',
    };
    const memoryStorage = createMemoryStorage([existingUser]);
    memoryStorage.writeSession(existingUser);

    const { result } = renderHook(() => useAuth({ storage: memoryStorage }));

    expect(result.current.currentUser).toEqual(existingUser);
  });
});