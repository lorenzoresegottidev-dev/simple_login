'use client';

import { FormEvent, useEffect, useState } from 'react';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

const USERS_KEY = 'simple-auth-users';
const SESSION_KEY = 'simple-auth-session';

const initialRegister = { name: '', email: '', password: '' };
const initialLogin = { email: '', password: '' };

export function SimpleUserAuth() {
  const [registerData, setRegisterData] = useState(initialRegister);
  const [loginData, setLoginData] = useState(initialLogin);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as StoredUser | null;
      if (parsed) setCurrentUser(parsed);
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    const { name, email, password } = registerData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Completa tutti i campi.' });
      return;
    }

    const users: StoredUser[] = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]');
    const alreadyExists = users.some(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (alreadyExists) {
      setMessage({ type: 'error', text: 'Questo utente è già registrato.' });
      return;
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    users.push(newUser);
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setRegisterData(initialRegister);
    setMessage({ type: 'success', text: `Utente ${newUser.name} registrato con successo.` });
  };

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    const { email, password } = loginData;

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Inserisci email e password.' });
      return;
    }

    const users: StoredUser[] = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]');
    const matchingUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
    );

    if (!matchingUser) {
      setMessage({ type: 'error', text: 'Credenziali non valide.' });
      return;
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(matchingUser));
    setCurrentUser(matchingUser);
    setLoginData(initialLogin);
    setMessage({ type: 'success', text: `Bentornato, ${matchingUser.name}.` });
  };

  const handleLogout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setMessage({ type: 'info', text: 'Sei stato disconnesso.' });
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020817', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 980, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 18, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #1e293b', paddingBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.28em', color: '#67e8f9', textTransform: 'uppercase' }}>Auth demo</p>
            <h1 style={{ margin: '8px 0 0', fontSize: 32 }}>Registrazione e login</h1>
          </div>
          {currentUser ? (
            <button type="button" onClick={handleLogout} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px', cursor: 'pointer' }}>
              Logout
            </button>
          ) : null}
        </div>

        {message ? (
          <div style={{ marginBottom: 24, borderRadius: 12, padding: '12px 14px', border: '1px solid', background: message.type === 'success' ? '#052e16' : message.type === 'error' ? '#450a0a' : '#082f49', borderColor: message.type === 'success' ? '#166534' : message.type === 'error' ? '#991b1b' : '#0f766e', color: '#e2e8f0' }}>
            {message.text}
          </div>
        ) : null}

        {!currentUser ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <form onSubmit={handleRegister} style={{ background: '#020817', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Registrati</h2>

              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
                  Nome
                  <input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} placeholder="Mario Rossi" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
                </label>

                <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
                  Email
                  <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="mario@email.com" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
                </label>

                <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
                  Password
                  <input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} placeholder="••••••••" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
                </label>
              </div>

              <button type="submit" style={{ width: '100%', marginTop: 18, background: '#22d3ee', color: '#082f49', border: 'none', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontWeight: 700 }}>
                Registrami
              </button>
            </form>

            <form onSubmit={handleLogin} style={{ background: '#020817', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Accedi</h2>

              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
                  Email
                  <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="mario@email.com" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
                </label>

                <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
                  Password
                  <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="••••••••" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
                </label>
              </div>

              <button type="submit" style={{ width: '100%', marginTop: 18, background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontWeight: 700 }}>
                Entra
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 16, padding: 20 }}>
            <p style={{ margin: 0, color: '#86efac', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: 12 }}>Sessione attiva</p>
            <h2 style={{ margin: '12px 0 8px', fontSize: 30 }}>Ciao, {currentUser.name}</h2>
            <p style={{ margin: 0, color: '#d1fae5' }}>Email: {currentUser.email}</p>
          </div>
        )}
      </div>
    </main>
  );
}
