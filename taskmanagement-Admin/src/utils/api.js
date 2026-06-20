export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:7001';
  }
  // Try to construct API subdomain automatically in production
  return `${window.location.protocol}//api.${window.location.hostname.replace('admintask.', '')}`;
};
