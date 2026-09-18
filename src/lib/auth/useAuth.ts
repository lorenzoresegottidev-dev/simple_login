'use client';

import { useEffect, useState } from 'react';
import {
  decideLogin,
  decideRegistration,
  logoutDecision,
} from './authLogic';
import type { AuthMessage, LoginInput, RegisterInput, StoredUser } from './authLogic';
import { authStorage } from './storage';
import type { AuthStorage } from './storage';

type UseAuthOptions = {
  storage?: AuthStorage;
  generateId?: () => string;
};

const defaultGenerateId = () => crypto.randomUUID();

export function useAuth({ storage = authStorage, generateId = defaultGenerateId }: UseAuthOptions = {}) {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  useEffect(() => {
    setCurrentUser(storage.readSession());
  }, [storage]);

  const register = (input: RegisterInput): boolean => {
    const users = storage.readUsers();
    const decision = decideRegistration(input, users, generateId());

    if (!decision.user) {
      setMessage(decision.message);
      return false;
    }

    if (!storage.writeUsers([...users, decision.user])) {
      setMessage({ type: 'error', code: 'WRITE_FAILED' });
      return false;
    }

    setMessage(decision.message);
    return true;
  };

  const login = (input: LoginInput): boolean => {
    const decision = decideLogin(input, storage.readUsers());

    if (!decision.user) {
      setMessage(decision.message);
      return false;
    }

    if (!storage.writeSession(decision.user)) {
      setMessage({ type: 'error', code: 'SESSION_WRITE_FAILED' });
      return false;
    }

    setCurrentUser(decision.user);
    setMessage(decision.message);
    return true;
  };

  const logout = (): boolean => {
    if (!storage.clearSession()) {
      setMessage({ type: 'error', code: 'SESSION_CLEAR_FAILED' });
      return false;
    }

    setCurrentUser(logoutDecision.user);
    setMessage(logoutDecision.message);
    return true;
  };

  return { currentUser, message, register, login, logout };
}