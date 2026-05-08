let logoutHandler = null;

export const setAuthLogout = (fn) => {
  logoutHandler = fn;
};

export const triggerLogout = (reason = 'session_expired') => {

  if (logoutHandler) {
    logoutHandler(reason);
  } else {
    // FAIL-CLOSED fallback
    console.warn('Logout handler not ready, forcing redirect');

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  }
};
