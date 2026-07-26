import { getAuthenticatedUser, requestPasswordReset, signInWithPassword, signOut, updateAuthenticatedUser } from '../../supabase/auth.js';
import { getAuthState, resetAuthState } from './auth-state.js';
import { setSession, startAuthStateListener } from './session.js';

export async function login({ email, password }) {
  const { user, session } = await signInWithPassword({ email, password });
  if (!session) {
    throw new Error('Supabase did not return an active session.');
  }
  startAuthStateListener();
  setSession(session);
  return { user, session };
}

export async function logout() {
  try {
    await signOut();
  } finally {
    resetAuthState();
  }
}

export function sendPasswordReset(email, redirectTo) {
  return requestPasswordReset(email, redirectTo);
}

export function updatePassword(password) {
  return updateAuthenticatedUser({ password });
}

export async function getCurrentAuthenticatedUser() {
  const { user } = getAuthState();
  if (user) return user;

  const response = await getAuthenticatedUser();
  return response.user;
}
