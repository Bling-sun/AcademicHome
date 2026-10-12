# Bing Sun's Homepage

Personal academic homepage for **Bing Sun (孙冰)**, based on the supplied CV. The layout is inspired by [Yue Lin's homepage](https://yue-0.github.io/); all site code is newly written.

Public URL: **https://bling-sun.github.io/Bling.github.io/**

## Edit the content

All biographical information, papers, projects, education, awards, and skills are in `content.json`. Each translated field has `en` and `zh` values. The current research titles are descriptive translations from the CV, rather than verified bibliographic titles. Replace them and add full author lists when the official citations are available.

Add public material URLs to a paper or project:

```json
"links": {
  "paper": "https://arxiv.org/abs/...",
  "code": "https://github.com/Bling-sun/...",
  "video": "https://..."
}
```

Use `null` for materials that are not yet public. The page shows “Materials forthcoming” when there are no public links. Paper acceptance and review status are taken from the supplied CV.

After editing, regenerate the pages:

```bash
node scripts/build.mjs
```

The output is `index.html` and `cv.html`. Both include complete English content without requiring JavaScript. JavaScript adds Chinese translation and theme controls; the CV page also offers printing or saving as a PDF using the browser's print dialog.

## Preview locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/. No dependencies or build framework are required.

## GitHub Pages

Serve from the `main` branch and the repository root (`/`). The repository name is `Bling.github.io`, while the account is `Bling-sun`, so GitHub serves this as a project site under `/Bling.github.io/`. All asset links are relative and work at this path.

To update the website, regenerate the HTML, commit the edited files, and push to `main`. GitHub Pages publishes the new version automatically.

## Files

- `content.json`: editable bilingual content and material links
- `scripts/build.mjs`: dependency-free static page generator
- `assets/styles.css`: responsive layout, theme, and print styles
- `assets/main.js`: language, theme, and print controls
- `assets/portrait.jpg`: portrait extracted from the supplied CV
- `index.html` / `cv.html`: generated pages committed for GitHub Pages

The public CV page contains academic information and email contact. The source DOCX is not included in this repository.
