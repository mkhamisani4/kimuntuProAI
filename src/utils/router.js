/**
 * Simple hash-based router for the application
 * Handles navigation between main app and footer pages
 */

export const navigateTo = (path) => {
  window.location.hash = path;
};

export const getCurrentRoute = () => {
  return window.location.hash.slice(1) || '/';
};

export const isPageRoute = (route) => {
  return route.startsWith('/page/');
};

export const getPageName = (route) => {
  if (isPageRoute(route)) {
    return route.replace('/page/', '');
  }
  return null;
};

export const goBack = () => {
  window.history.back();
};
