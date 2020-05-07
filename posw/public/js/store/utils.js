import { getSetting } from './db';

export async function getRequestOptions() {
  const csrf_token = await getSetting('csrf_token');
  if (!csrf_token) {
    throw new Error('Cannot construct Request options without csrf_token');
  }
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json',
      'X-Frappe-CSRF-Token': csrf_token,
      'X-Frappe-CMD': '',
    },
  };
}
