import { getApiOrigin } from './apiUrl';

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
    const apiBaseUrl = getApiOrigin();
    return apiBaseUrl ? `${apiBaseUrl}${trimmedPath}` : trimmedPath;
  }

  return trimmedPath;
};

export default getImageUrl;
