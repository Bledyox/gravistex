const configUtils = (function () {
  'use strict';

  window.addEventListener('load', () => {
    const storedTheme = localStorage.getItem('theme');
    const mediaTheme = window.matchMedia('(prefers-color-scheme:dark').matches ? 'dark' : 'light';
    const theme = storedTheme || mediaTheme;
    if (theme) document.documentElement.setAttribute('data-theme', theme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleThemeMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  return {
    toggleThemeMode: toggleThemeMode,
  };
}());









