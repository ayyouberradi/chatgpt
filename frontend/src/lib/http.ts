export async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const csrf = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=');
  const response = await fetch(`/api${path}`, {
    ...options, credentials: 'same-origin',
    headers: { Accept: 'application/json', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(csrf ? { 'X-XSRF-TOKEN': decodeURIComponent(csrf) } : {}), ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
