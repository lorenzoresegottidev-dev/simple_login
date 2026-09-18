export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type AuthMessage = {
  type: 'success' | 'error' | 'info';
  code: AuthCode;
  name?: string;
};

export type AuthCode =
  | 'REGISTERED'
  | 'EMPTY_FIELDS'
  | 'EMAIL_TAKEN'
  | 'LOGIN_SUCCESS'
  | 'INVALID_CREDENTIALS'
  | 'LOGGED_OUT'
  | 'WRITE_FAILED'
  | 'SESSION_WRITE_FAILED'
  | 'SESSION_CLEAR_FAILED';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

type RegisterDecision = {
  user: StoredUser | null;
  message: AuthMessage;
};

type LoginDecision = {
  user: StoredUser | null;
  message: AuthMessage;
};

export function decideRegistration(
  input: RegisterInput,
  users: StoredUser[],
  userId: string,
): RegisterDecision {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email || !input.password.trim()) {
    return { user: null, message: { type: 'error', code: 'EMPTY_FIELDS' } };
  }

  if (users.some((user) => user.email.toLowerCase() === email)) {
    return { user: null, message: { type: 'error', code: 'EMAIL_TAKEN' } };
  }

  const user: StoredUser = {
    id: userId,
    name,
    email,
    password: input.password,
  };

  return {
    user,
    message: { type: 'success', code: 'REGISTERED', name: user.name },
  };
}

export function decideLogin(input: LoginInput, users: StoredUser[]): LoginDecision {
  const email = input.email.trim().toLowerCase();

  if (!email || !input.password.trim()) {
    return { user: null, message: { type: 'error', code: 'EMPTY_FIELDS' } };
  }

  const user = users.find(
    (candidate) => candidate.email.toLowerCase() === email && candidate.password === input.password,
  ) ?? null;

  return user
    ? { user, message: { type: 'success', code: 'LOGIN_SUCCESS', name: user.name } }
    : { user: null, message: { type: 'error', code: 'INVALID_CREDENTIALS' } };
}

export const logoutDecision: { user: null; message: AuthMessage } = {
  user: null,
  message: { type: 'info', code: 'LOGGED_OUT' },
};