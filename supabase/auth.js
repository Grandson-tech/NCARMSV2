import { getSupabaseClient } from './client.js';

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

export function signInWithPassword({ email, password }) {
  return getSupabaseClient().auth.signInWithPassword({ email, password }).then(unwrap);
}

export function signOut() {
  return getSupabaseClient().auth.signOut().then(unwrap);
}

export function requestPasswordReset(email, redirectTo) {
  return getSupabaseClient().auth.resetPasswordForEmail(email, { redirectTo }).then(unwrap);
}

export function getSession() {
  return getSupabaseClient().auth.getSession().then(unwrap);
}

export function getAuthenticatedUser() {
  return getSupabaseClient().auth.getUser().then(unwrap);
}

export function updateAuthenticatedUser(attributes) {
  return getSupabaseClient().auth.updateUser(attributes).then(unwrap);
}

export function onAuthStateChange(callback) {
  return getSupabaseClient().auth.onAuthStateChange(callback);
}
