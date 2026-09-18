import { describe, expect, it } from 'vitest';
import { decideLogin, logoutDecision, decideRegistration, StoredUser } from '../src/lib/auth/authLogic';

const existingUser: StoredUser = {
  id: '1',
  name: 'Anna Bianchi',
  email: 'anna@email.com',
  password: 'secret123',
};

describe('auth decisions', () => {
  it('registers a valid user with normalized fields', () => {
    const decision = decideRegistration(
      { name: ' Luca Verdi ', email: 'LUCA@EMAIL.COM ', password: 'password123' },
      [],
      '2',
    );

    expect(decision.user).toEqual({
      id: '2',
      name: 'Luca Verdi',
      email: 'luca@email.com',
      password: 'password123',
    });
    expect(decision.message).toEqual({ type: 'success', code: 'REGISTERED', name: 'Luca Verdi' });
  });

  it('rejects a duplicate email case-insensitively', () => {
    const decision = decideRegistration(
      { name: 'Nuovo utente', email: ' ANNA@EMAIL.COM ', password: 'password123' },
      [existingUser],
      '2',
    );

    expect(decision.user).toBeNull();
    expect(decision.message.code).toBe('EMAIL_TAKEN');
  });

  it('finds a matching user during login', () => {
    const decision = decideLogin({ email: ' ANNA@EMAIL.COM ', password: 'secret123' }, [existingUser]);

    expect(decision.user).toEqual(existingUser);
    expect(decision.message).toEqual({ type: 'success', code: 'LOGIN_SUCCESS', name: 'Anna Bianchi' });
  });

  it('rejects invalid login credentials', () => {
    const decision = decideLogin({ email: existingUser.email, password: 'wrong' }, [existingUser]);

    expect(decision.user).toBeNull();
    expect(decision.message.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns the logged-out state', () => {
    expect(logoutDecision).toEqual({
      user: null,
      message: { type: 'info', code: 'LOGGED_OUT' },
    });
  });
});