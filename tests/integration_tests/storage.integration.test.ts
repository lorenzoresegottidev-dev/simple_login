import { beforeEach, describe, expect, it } from 'vitest';
import { authStorage } from '../../src/lib/auth/storage';

describe('authStorage browser integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('restituisce una lista vuota quando il JSON degli utenti non è valido', () => {
    window.localStorage.setItem('simple-auth-users', '{invalid-json');

    expect(authStorage.readUsers()).toEqual([]);
  });

  it('usa il fallback quando la chiave degli utenti non esiste', () => {
    expect(authStorage.readUsers()).toEqual([]);
    expect(authStorage.readSession()).toBeNull();
  });

  it('restituisce false quando setItem fallisce', () => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };

    try {
      expect(authStorage.writeUsers([])).toBe(false);
    } finally {
      Storage.prototype.setItem = setItem;
    }
  });
});