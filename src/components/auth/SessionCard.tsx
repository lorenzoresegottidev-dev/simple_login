import React from 'react';
import type { StoredUser } from '../../lib/auth/authLogic';

type SessionCardProps = {
  user: StoredUser;
  onLogout: () => void;
};

export function SessionCard({ user, onLogout }: SessionCardProps) {
  return (
    <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 16, padding: 20 }}>
      <p style={{ margin: 0, color: '#86efac', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: 12 }}>Sessione attiva</p>
      <h2 style={{ margin: '12px 0 8px', fontSize: 30 }}>Ciao, {user.name}</h2>
      <p style={{ margin: 0, color: '#d1fae5' }}>Email: {user.email}</p>
      <button type="button" onClick={onLogout} style={{ marginTop: 18, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
}