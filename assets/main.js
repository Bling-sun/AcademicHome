(() => {
  'use strict';
  const root = document.documentElement;
  const translations = JSON.parse(document.getElementById('translations').textContent);
  const languageButton = document.getElementById('language-toggle');
  const themeButton = document.getElementById('theme-toggle');
  // Storage is optional: language and theme controls also work when it is blocked.
  const stored = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let language = new URLSearchParams(location.search).get('lang') || stored('bing-language') || 'en';
  let theme = stored('bing-theme') || 'light';
  if (!['en', 'zh'].includes(language)) language = 'en';
  if (!['light', 'dark'].includes(theme)) theme = 'light';

  function renderLanguage() {
    root.lang = language === 'zh' ? 'zh-CN' : 'en';
    for (const element of document.querySelectorAll('[data-i18n]')) {
      const translation = translations[element.dataset.i18n];
      if (translation) element.textContent = translation[language];
    }
    document.getElementById('language-label').textContent = language === 'en' ? '中文' : 'EN';
    languageButton.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
    document.title = language === 'zh' ? `孙冰${document.body.classList.contains('cv-page') ? ' — 简历' : ' | 机器人与具身智能'}` : `Bing Sun${document.body.classList.contains('cv-page') ? ' — CV' : ' | Robotics & Embodied AI'}`;
    const cvLink = document.getElementById('cv-link');
    if (cvLink) cvLink.href = `cv.html?lang=${language}`;
    renderTheme();
  }

  function renderTheme() {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-label', language === 'zh' ? (theme === 'light' ? '切换为深色主题' : '切换为浅色主题') : (theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'));
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  languageButton.addEventListener('click', () => {
    language = language === 'en' ? 'zh' : 'en';
    save('bing-language', language);
    // Keep an explicit CV language query in sync with the chosen language.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
    }
    renderLanguage();
  });
  themeButton.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    save('bing-theme', theme);
    renderTheme();
  });
  document.getElementById('print-cv')?.addEventListener('click', () => window.print());
  renderLanguage();
})();
