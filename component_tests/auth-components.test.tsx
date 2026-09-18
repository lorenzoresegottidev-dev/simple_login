import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../src/components/auth/LoginForm';
import { MessageBanner } from '../src/components/auth/MessageBanner';
import { RegisterForm } from '../src/components/auth/RegisterForm';
import { SessionCard } from '../src/components/auth/SessionCard';
import { SimpleUserAuth } from '../src/components/auth/SimpleUserAuth';

afterEach(() => cleanup());

describe('auth presentational components', () => {
  it('renderizza il testo del banner dal codice del messaggio', () => {
    render(<MessageBanner message={{ type: 'error', code: 'INVALID_CREDENTIALS' }} />);

    expect(screen.getByText('Credenziali non valide.')).toBeTruthy();
  });

  it('inoltra submit e modifiche dei form tramite props', async () => {
    const user = userEvent.setup();
    const onRegisterChange = vi.fn();
    const onRegisterSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const onLoginChange = vi.fn();
    const onLoginSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <>
        <RegisterForm value={{ name: '', email: '', password: '' }} onChange={onRegisterChange} onSubmit={onRegisterSubmit} />
        <LoginForm value={{ email: '', password: '' }} onChange={onLoginChange} onSubmit={onLoginSubmit} />
      </>,
    );

    const registerForm = screen.getByRole('heading', { name: 'Registrati' }).closest('form');
    const loginForm = screen.getByRole('heading', { name: 'Accedi' }).closest('form');
    if (!registerForm || !loginForm) throw new Error('Form non trovati');

    await user.type(within(registerForm).getByPlaceholderText('Mario Rossi'), 'Luca');
    await user.click(within(registerForm).getByRole('button', { name: 'Registrami' }));
    await user.click(within(loginForm).getByRole('button', { name: 'Entra' }));

    expect(onRegisterChange).toHaveBeenCalled();
    expect(onRegisterSubmit).toHaveBeenCalledOnce();
    expect(onLoginSubmit).toHaveBeenCalledOnce();
  });

  it('mostra la sessione e inoltra il logout', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();

    render(
      <SessionCard
        user={{ id: '1', name: 'Anna', email: 'anna@email.com', password: 'secret' }}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByText('Ciao, Anna')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});

describe('SimpleUserAuth form reset', () => {
  beforeEach(() => window.localStorage.clear());

  it('svuota il form di registrazione dopo una scrittura riuscita', async () => {
    const user = userEvent.setup();
    render(<SimpleUserAuth />);
    const registerForm = screen.getByRole('heading', { name: 'Registrati' }).closest('form');
    if (!registerForm) throw new Error('Form di registrazione non trovato');

    const name = within(registerForm).getByPlaceholderText('Mario Rossi');
    await user.type(name, 'Luca');
    await user.type(within(registerForm).getByPlaceholderText('mario@email.com'), 'luca@email.com');
    await user.type(within(registerForm).getByPlaceholderText('••••••••'), 'secret');
    await user.click(within(registerForm).getByRole('button', { name: 'Registrami' }));

    expect((name as HTMLInputElement).value).toBe('');
  });

  it('mantiene i valori quando la scrittura fallisce', async () => {
    const user = userEvent.setup();
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };

    try {
      render(<SimpleUserAuth />);
      const registerForm = screen.getByRole('heading', { name: 'Registrati' }).closest('form');
      if (!registerForm) throw new Error('Form di registrazione non trovato');

      const name = within(registerForm).getByPlaceholderText('Mario Rossi');
      await user.type(name, 'Luca');
      await user.type(within(registerForm).getByPlaceholderText('mario@email.com'), 'luca@email.com');
      await user.type(within(registerForm).getByPlaceholderText('••••••••'), 'secret');
      await user.click(within(registerForm).getByRole('button', { name: 'Registrami' }));

      expect((name as HTMLInputElement).value).toBe('Luca');
      expect(screen.getByText('Impossibile salvare la registrazione.')).toBeTruthy();
    } finally {
      Storage.prototype.setItem = setItem;
    }
  });
});