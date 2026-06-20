export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:7001';
  }
  // Automatically construct backend API subdomain (e.g. teachers.tipsgalwar.in -> api.tipsgalwar.in)
  return `${window.location.protocol}//api.${window.location.hostname.replace('teachers.', '')}`;
};
