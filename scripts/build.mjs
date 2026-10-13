import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(await readFile(path.join(root, 'content.json'), 'utf8'));
const base = 'https://bling-sun.github.io/MyHomepage/';
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const icons = {
  github: '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.9a3.4 3.4 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3a5.7 5.7 0 0 0-1.5-4A5.3 5.3 0 0 0 19.2.2S18-.2 15 1.7a13.5 13.5 0 0 0-7 0C5-.2 3.8.2 3.8.2a5.3 5.3 0 0 0-.1 3.9 5.7 5.7 0 0 0-1.5 4c0 5.7 3.5 6.9 6.8 7.3a3.4 3.4 0 0 0-1 2.7V22"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  cv: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  theme: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  translate: '<path d="M3 5h12M9 3v2M5 5c0 5 6 9 6 9M13 5c0 5-4 9-10 12M13 21l4-10 4 10M14.5 17h5"/>',
  print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6zM18 12h.01"/>'
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;

function build(cv = false) {
  const translations = {};
  const text = (value, key, tag = 'span', attrs = '') => {
    if (typeof value === 'string') return `<${tag}${attrs}>${escape(value)}</${tag}>`;
    translations[key] = value;
    return `<${tag} data-i18n="${key}"${attrs}>${escape(value.en)}</${tag}>`;
  };
  const ui = (en, zh, key, tag = 'span', attrs = '') => text({ en, zh }, key, tag, attrs);
  const authorText = (value, key) => {
    if (!['en', 'zh'].every(lang => value[lang].startsWith(content.name[lang]))) return text(value, key);
    const remaining = Object.fromEntries(['en', 'zh'].map(lang => [lang, value[lang].slice(content.name[lang].length)]));
    return `<span class="authors">${text(content.name, `${key}.name`, 'strong')}${text(remaining, `${key}.remaining`)}</span>`;
  };
  const link = (url, label, attrs = '') => `<a href="${escape(url)}"${attrs}>${label}</a>`;
  const materialLinks = (entry, key) => {
    const labels = { paper: ['Paper', '论文'], code: ['Code', '代码'], video: ['Video', '视频'] };
    const actual = Object.entries(entry.links).filter(([, url]) => url);
    if (!actual.length) return ui('Materials forthcoming', '资料待发布', `${key}.forthcoming`, 'span', ' class="pending"');
    return actual.map(([type, url]) => link(url, ui(...labels[type], `${key}.link.${type}`), ' target="_blank" rel="noopener noreferrer"')).join('<span aria-hidden="true" class="link-divider">/</span>');
  };
  const media = (entry, key) => {
    if (cv || !entry.media?.length) return '';
    return `<div class="media-gallery" aria-label="${escape(entry.acronym || entry.id)} demos">${entry.media.map((item, i) => {
      const altKey = `${key}.media.${i}.alt`;
      translations[altKey] = item.alt || entry.title;
      const alt = escape(translations[altKey].en);
      const video = item.type === 'video';
      const gif = item.type === 'gif';
      return `<figure class="entry-media" ${i ? 'hidden' : ''}>
        <div class="media-stage">
        ${video ? `<video playsinline loop preload="none" data-src="${escape(item.src)}" poster="${escape(item.poster || '')}" aria-label="${alt}" data-i18n-alt="${altKey}" width="960" height="540"></video>` : `<img ${gif ? `data-src="${escape(item.src)}" ${item.poster ? `src="${escape(item.poster)}"` : 'hidden'}` : `src="${escape(item.src)}"`} alt="${alt}" data-i18n-alt="${altKey}" loading="lazy" decoding="async" width="960" height="540">`}
        ${video || gif ? `<button class="demo-toggle" type="button" data-kind="${item.type}" ${item.poster ? `data-poster="${escape(item.poster)}"` : ''} aria-pressed="false"><span class="play-icon" aria-hidden="true">▶</span><span data-demo-text>${ui('Play demo', '播放演示', `${key}.media.${i}.play`)}</span></button>` : ''}
        </div>${item.caption ? text(item.caption, `${key}.media.${i}.caption`, 'figcaption') : ''}
      </figure>`;
    }).join('')}${entry.media.length > 1 ? `<div class="media-selector" role="group" aria-label="Demo scenes">${entry.media.map((item, i) => `<button type="button" data-media-index="${i}" aria-pressed="${i === 0}">${text(item.caption || item.alt, `${key}.media.${i}.selector`)}</button>`).join('')}</div>` : ''}</div>`;
  };
  const article = (entry, type, index) => {
    const key = `${type}.${index}`;
    const publication = type === 'paper';
    const head = `<div class="entry-heading">${text(entry.title, `${key}.title`, 'h3')}
      <div class="entry-meta">${publication ? `<span class="venue">${escape(entry.venue)}</span>${text(entry.status, `${key}.status`, 'span', ` class="status ${entry.statusType}"`)}` : text(entry.date, `${key}.date`, 'span', ' class="date"')}</div></div>`;
    const description = text(entry.description, `${key}.description`, 'p');
    return `<article class="entry ${publication ? 'paper' : 'project'}${entry.media?.length ? ' has-media' : ''}" id="${entry.id}">
      ${media(entry, key)}<div class="entry-content">
      <div class="entry-kicker">${publication ? escape(entry.acronym) : `<span class="project-number">${String(index + 1).padStart(2, '0')}</span><div class="tags">${entry.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div>`}</div>
      ${head}
      <div class="attribution">${publication ? authorText(entry.author, `${key}.attribution`) : text(entry.affiliation, `${key}.attribution`)}</div>
      <div class="entry-body">${text(entry.result, `${key}.result`, 'p', ' class="result"')}
      ${cv ? description : `<details class="project-details"><summary>${ui('Method & details', '方法与细节', `${key}.details`)}<span class="detail-plus" aria-hidden="true">+</span></summary>${description}</details>`}</div>
      <div class="entry-footer"><div class="material-links">${materialLinks(entry, key)}</div>${publication ? text(entry.date, `${key}.date`, 'span', ' class="date"') : ''}</div>
      </div></article>`;
  };

  const section = (id, en, zh, body, count) => `<section id="${id}" aria-labelledby="${id}-heading"><div class="section-heading">${ui(en, zh, `heading.${id}`, 'h2', ` id="${id}-heading"`)}${count ? `<span class="section-count">${String(count).padStart(2, '0')}</span>` : ''}</div>${body}</section>`;
  const bio = content.bio.map((p, i) => text(p, `bio.${i}`, 'p')).join('');
  const awards = `<ul class="awards-list">${content.awards.map((award, i) => text(award, `award.${i}`, 'li')).join('')}</ul>`;
  const skills = `<dl class="skills-list">${content.skills.map((skill, i) => `<div>${text(skill.label, `skill.${i}.label`, 'dt')}<dd>${escape(skill.detail)}</dd></div>`).join('')}</dl>`;
  const name = text(content.name, 'name', 'h1');
  const role = text(content.role, 'role', 'p', ' class="role"');
  const interests = text(content.interests, 'interests', 'p', ' class="interests"');
  const nav = [['projects', 'Projects', '项目'], ['papers', 'Papers', '论文'], ['awards', 'Awards', '竞赛'], ['skills', 'Skills', '技能']];
  const toolbar = `<div class="toolbar" aria-label="Links and display options">
    ${cv ? link('./', ui('Homepage', '主页', 'ui.home'), ' class="tool-link"') : link('cv.html', `${icon('cv')}${ui('CV', '简历', 'ui.cv')}`, ' class="tool-link" id="cv-link"')}
    ${link(content.github, `${icon('github')}<span>GitHub</span>`, ' class="tool-link" target="_blank" rel="noopener noreferrer"')}
    ${link(`mailto:${content.email}`, `${icon('mail')}${ui('Email', '邮箱', 'ui.email')}`, ' class="tool-link"')}
    <span class="toolbar-divider" aria-hidden="true"></span>
    <button class="tool-link" id="language-toggle" type="button" aria-label="切换为中文">${icon('translate')}<span id="language-label">中文</span></button>
    <button class="tool-link theme-toggle" id="theme-toggle" type="button" aria-label="Switch to dark theme">${icon('theme')}</button>
    ${cv ? `<button class="tool-link" id="print-cv" type="button">${icon('print')}${ui('Print / PDF', '打印 / PDF', 'ui.print')}</button>` : ''}
  </div>`;
  const person = { '@context': 'https://schema.org', '@type': 'Person', name: 'Bing Sun', alternateName: '孙冰', url: base, image: `${base}assets/portrait.jpg`, email: content.email, sameAs: [content.github], affiliation: { '@type': 'CollegeOrUniversity', name: 'Dalian University of Technology' }, knowsAbout: ['Robot Navigation', 'Motion Planning', 'Vision–Language–Action Models'] };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="Bing Sun (孙冰), master's student at Dalian University of Technology. Research in robot navigation, motion planning, and vision–language–action models.">
  <meta property="og:title" content="Bing Sun | Robotics & Embodied AI">
  <meta property="og:description" content="Research and projects in autonomous navigation, motion planning, and vision–language–action policies.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${base}${cv ? 'cv.html' : ''}">
  <meta property="og:image" content="${base}assets/portrait.jpg">
  <link rel="canonical" href="${base}${cv ? 'cv.html' : ''}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/styles.css">
  <title>Bing Sun${cv ? ' — CV' : ' | Robotics & Embodied AI'}</title>
  <script src="assets/main.js" defer></script>
  <script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>
</head>
<body${cv ? ' class="cv-page"' : ''}>
  ${ui('Skip to content', '跳转到内容', 'ui.skip', 'a', ' class="skip-link" href="#main"')}
  <header class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        ${ui('ROBOTICS / EMBODIED AI', '机器人 / 具身智能', 'hero.eyebrow', 'p', ' class="eyebrow"')}
        ${name}${role}${interests}${toolbar}
        ${!cv ? link('#projects', `${ui('Explore my work', '探索我的项目', 'hero.explore')}<span aria-hidden="true">↗</span>`, ' class="hero-cta"') : ''}
      </div>
      <div class="portrait-wrap"><img class="portrait" src="assets/portrait.jpg" alt="Bing Sun" width="240" height="288"><span class="portrait-caption">DALIAN · CHINA</span></div>

    </div>
  </header>
  ${!cv ? `<nav class="section-nav" aria-label="Sections">${nav.map(([id, en, zh]) => link(`#${id}`, ui(en, zh, `nav.${id}`))).join('')}</nav>` : ''}
  <main class="container" id="main">
    <section class="profile" aria-labelledby="about-heading">${ui(cv ? 'Profile' : 'About Me', '个人简介', 'heading.about', 'h2', ' id="about-heading"')}${bio}</section>
    ${section('projects', 'Projects', '项目', `<div class="project-grid">${content.projects.map((p, i) => article(p, 'project', i)).join('')}</div>`, content.projects.length)}
    ${section('papers', 'Papers', '论文', content.papers.map((p, i) => article(p, 'paper', i)).join('') + ui('Additional research materials will be linked as they become public.', '更多研究资料将在公开后补充链接。', 'papers.note', 'p', ' class="section-note"'), content.papers.length)}
    ${section('awards', 'Competition & Awards', '竞赛与荣誉', awards)}
    ${section('skills', 'Technical Skills', '专业技能', skills)}
  </main>
  <footer class="site-footer"><div><span>© 2026 </span>${text(content.name, 'footer.name')}<span class="footer-dot" aria-hidden="true">·</span>${link(`mailto:${content.email}`, escape(content.email))}</div><div class="updated">${ui('Last updated: October 2026', '最近更新：2026 年 10 月', 'footer.updated')}</div></footer>
  <script id="translations" type="application/json">${JSON.stringify(translations).replace(/</g, '\\u003c')}</script>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}

await writeFile(path.join(root, 'index.html'), build());
await writeFile(path.join(root, 'cv.html'), build(true));
console.log(`Built index.html and cv.html: ${content.papers.length} papers, ${content.projects.length} projects.`);
