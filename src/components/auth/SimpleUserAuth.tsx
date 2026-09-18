'use client';

import React from 'react';
import { FormEvent, useState } from 'react';
import type { LoginInput, RegisterInput } from '../../lib/auth/authLogic';
import { useAuth } from '../../lib/auth/useAuth';
import { LoginForm } from './LoginForm';
import { MessageBanner } from './MessageBanner';
import { RegisterForm } from './RegisterForm';
import { SessionCard } from './SessionCard';

const initialRegister: RegisterInput = { name: '', email: '', password: '' };
const initialLogin: LoginInput = { email: '', password: '' };

export function SimpleUserAuth() {
  const [registerData, setRegisterData] = useState(initialRegister);
  const [loginData, setLoginData] = useState(initialLogin);
  const { currentUser, message, register, login, logout } = useAuth();

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (register(registerData)) setRegisterData(initialRegister);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (login(loginData)) setLoginData(initialLogin);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020817', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 980, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 18, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #1e293b', paddingBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.28em', color: '#67e8f9', textTransform: 'uppercase' }}>Auth demo</p>
            <h1 style={{ margin: '8px 0 0', fontSize: 32 }}>Registrazione e login</h1>
          </div>
        </div>

        {message ? <MessageBanner message={message} /> : null}

        {!currentUser ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <RegisterForm
              value={registerData}
              onChange={(field, value) => setRegisterData((current) => ({ ...current, [field]: value }))}
              onSubmit={handleRegister}
            />
            <LoginForm
              value={loginData}
              onChange={(field, value) => setLoginData((current) => ({ ...current, [field]: value }))}
              onSubmit={handleLogin}
            />
          </div>
        ) : (
          <SessionCard user={currentUser} onLogout={logout} />
        )}
      </div>
    </main>
  );
}