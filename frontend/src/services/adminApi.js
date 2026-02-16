const BASE_URL = '/api/admin';

export async function fetchStats(adminKey) {
  const response = await fetch(`${BASE_URL}/stats`, {
    headers: { 'X-Admin-Key': adminKey },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || `Request failed (${response.status})`);
  }

  return data.data;
}
