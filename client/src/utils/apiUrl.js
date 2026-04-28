const getConfiguredApiBase = () => (import.meta.env.VITE_API_URL || '').trim();

export const buildApiUrl = (path = '') => {
  if (!path) {
    return getConfiguredApiBase();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiBase = getConfiguredApiBase();

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
