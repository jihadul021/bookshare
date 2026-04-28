const DEFAULT_DEPLOYED_API_ORIGIN = 'https://bookshare-xbj2.onrender.com';

const getConfiguredApiBase = () => (import.meta.env.VITE_API_URL || '').trim();

export const getApiOrigin = () => {
  const configuredApiBase = getConfiguredApiBase();

  if (configuredApiBase) {
    try {
      return new URL(configuredApiBase).origin;
    } catch {
      return configuredApiBase.replace(/\/api\/?$/, '');
    }
  }

  if (typeof window === 'undefined') {
    return DEFAULT_DEPLOYED_API_ORIGIN;
  }

  const { hostname, origin } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return origin;
  }

  if (hostname === 'booksharenet.vercel.app') {
    return DEFAULT_DEPLOYED_API_ORIGIN;
  }

  return origin;
};

export const getApiBaseUrl = () => {
  const configuredApiBase = getConfiguredApiBase();

  if (configuredApiBase) {
    return configuredApiBase;
  }

  return `${getApiOrigin()}/api`;
};

export const buildApiUrl = (path = '') => {
  if (!path) {
    return getApiBaseUrl();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiBase = getApiBaseUrl();

  if (!apiBase) {
    return normalizedPath;
  }

  const normalizedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

  if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }

  if (normalizedBase.endsWith('/api') && normalizedPath === '/api') {
    return normalizedBase;
  }

  return `${normalizedBase}${normalizedPath}`;
};

export const getApiErrorMessage = async (response, fallbackMessage) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return data?.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  try {
    const text = await response.text();
    return text ? text.slice(0, 200) : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};
