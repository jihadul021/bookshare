const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';

  if (!apiUrl) {
    return '';
  }

  try {
    return new URL(apiUrl).origin;
  } catch {
    return apiUrl.replace(/\/api\/?$/, '');
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '';
  }

  const trimmedPath = imagePath.trim();

  if (!trimmedPath) {
    return '';
  }

  if (
    trimmedPath.startsWith('data:') ||
    trimmedPath.startsWith('blob:') ||
    trimmedPath.startsWith('http://') ||
    trimmedPath.startsWith('https://')
  ) {
    return trimmedPath;
  }

  if (trimmedPath.startsWith('/uploads/')) {
    const apiBaseUrl = getApiBaseUrl();
    return apiBaseUrl ? `${apiBaseUrl}${trimmedPath}` : trimmedPath;
  }

  return trimmedPath;
};

export default getImageUrl;
