const configUtils = (function () {
  'use strict';

  window.addEventListener('load', () => {
    const storedTheme = localStorage.getItem('theme');
    const mediaTheme = window.matchMedia('(prefers-color-scheme:light').matches ? 'light' : 'dark';
    const theme = storedTheme || mediaTheme;
    setTheme(theme);
  });

  function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const themeImage = document.getElementById('theme-image');
    if (!themeImage) return;
    if (theme === 'light') {
      themeImage.src = '../img/pictogram/moon.svg';
      themeImage.alt = 'Dark mode';
    } else {
      themeImage.src = '../img/pictogram/sun.svg';
      themeImage.alt = 'Light mode';
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const theme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
  }

  return {
    toggleTheme: toggleTheme,
  };
}());
