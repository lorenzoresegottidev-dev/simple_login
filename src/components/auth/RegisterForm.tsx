import React from 'react';
import type { FormEvent } from 'react';
import type { RegisterInput } from '../../lib/auth/authLogic';

type RegisterFormProps = {
  value: RegisterInput;
  onChange: (field: keyof RegisterInput, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({ value, onChange, onSubmit }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ background: '#020817', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Registrati</h2>
      <div style={{ display: 'grid', gap: 14 }}>
        <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
          Nome
          <input value={value.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Mario Rossi" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
        </label>
        <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
          Email
          <input type="email" value={value.email} onChange={(event) => onChange('email', event.target.value)} placeholder="mario@email.com" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
        </label>
        <label style={{ display: 'grid', gap: 8, color: '#cbd5e1' }}>
          Password
          <input type="password" value={value.password} onChange={(event) => onChange('password', event.target.value)} placeholder="••••••••" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' }} />
        </label>
      </div>
      <button type="submit" style={{ width: '100%', marginTop: 18, background: '#22d3ee', color: '#082f49', border: 'none', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontWeight: 700 }}>
        Registrami
      </button>
    </form>
  );
}