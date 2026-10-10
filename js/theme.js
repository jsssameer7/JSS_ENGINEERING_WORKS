// Theme switcher utility for JSS Engineering Works Portal
(function() {
  const THEME_KEY = 'jss_theme';
  
  // Get initial theme (default to dark for premium steel look)
  const getSavedTheme = () => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  };

  // Run immediately to prevent layout flashes
  const currentTheme = getSavedTheme();
  applyTheme(currentTheme);

  // Setup event listeners after DOM load
  document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('#theme-toggle-btn');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(activeTheme);
      });
    });
  });
})();
