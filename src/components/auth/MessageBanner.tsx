import React from 'react';
import type { AuthCode, AuthMessage } from '../../lib/auth/authLogic';

type MessageBannerProps = {
  message: AuthMessage;
};

const messageText: Record<AuthCode, (message: AuthMessage) => string> = {
  REGISTERED: ({ name }) => `Utente ${name} registrato con successo.`,
  EMPTY_FIELDS: () => 'Completa tutti i campi.',
  EMAIL_INVALID: () => 'Inserisci un indirizzo email valido.',
  PASSWORD_WEAK: () => 'La password deve avere almeno 8 caratteri, un numero e un carattere speciale.',
  EMAIL_TAKEN: () => 'Questo utente è già registrato.',
  LOGIN_SUCCESS: ({ name }) => `Bentornato, ${name}.`,
  INVALID_CREDENTIALS: () => 'Credenziali non valide.',
  LOGGED_OUT: () => 'Sei stato disconnesso.',
  WRITE_FAILED: () => 'Impossibile salvare la registrazione.',
  SESSION_WRITE_FAILED: () => 'Impossibile avviare la sessione.',
  SESSION_CLEAR_FAILED: () => 'Impossibile chiudere la sessione.',
};

export function getMessageText(message: AuthMessage): string {
  return messageText[message.code](message);
}

export function MessageBanner({ message }: MessageBannerProps) {
  return (
    <div style={{ marginBottom: 24, borderRadius: 12, padding: '12px 14px', border: '1px solid', background: message.type === 'success' ? '#052e16' : message.type === 'error' ? '#450a0a' : '#082f49', borderColor: message.type === 'success' ? '#166534' : message.type === 'error' ? '#991b1b' : '#0f766e', color: '#e2e8f0' }}>
      {getMessageText(message)}
    </div>
  );
}