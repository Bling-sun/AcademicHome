# MyHomepage

Personal academic homepage for **Bing Sun (孙冰)**, based on the supplied CV. The layout is inspired by [Yue Lin's homepage](https://yue-0.github.io/); all site code is newly written.

Public URL: **https://bling-sun.github.io/MyHomepage/**

## Edit the content

All biographical information, papers, projects, awards, and skills are in `content.json`. Each translated field has `en` and `zh` values. LECO uses the title in the submitted manuscript; UCON uses its public paper title.

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

Serve from the `main` branch and the repository root (`/`). The repository name is `MyHomepage`, while the account is `Bling-sun`, so GitHub serves this as a project site under `/MyHomepage/`. All asset links are relative and work at this path.

To update the website, regenerate the HTML, commit the edited files, and push to `main`. GitHub Pages publishes the new version automatically.

## Files

- `content.json`: editable bilingual content and material links
- `scripts/build.mjs`: dependency-free static page generator
- `assets/styles.css`: responsive layout, theme, and print styles
- `assets/main.js`: language, theme, and print controls
- `assets/portrait.jpg`: portrait extracted from the supplied CV
- `index.html` / `cv.html`: generated pages committed for GitHub Pages

The public CV page contains academic information and email contact. The source DOCX is not included in this repository.


## Demo galleries

Projects and papers accept a `media` array. An empty array reserves a media panel on the right with a bilingual placeholder. On desktop, projects and papers share the same text-left, media-right layout; on mobile, the media panel follows the text. To add a scene, put files in `assets/demos/` and add:

```json
"media": [{
  "type": "video",
  "src": "assets/demos/tea.mp4",
  "poster": "assets/demos/tea.jpg",
  "alt": { "en": "Robot preparing tea", "zh": "机器人茶艺操作" },
  "caption": { "en": "Real-robot experiment", "zh": "真机实验" }
}]
```

Use `type: "image"` for PNG/JPG/WebP/SVG or `type: "gif"` for an original animated GIF. GIFs and MP4s load on demand when Play demo is pressed. Videos provide native pause, timeline, and fullscreen controls; selecting another scene pauses the previous video. Images load lazily with reserved display space. Prefer web-compressed MP4 + a JPEG poster to large GIFs. A media error presents a retry message. Only publish assets you intend to make public.

UCON and LECO include web-optimized copies of the supplied experimental videos; source files remain unchanged. Each scene preserves the full duration. The interface supports English/Chinese, light/dark themes, mobile layouts, keyboard focus, and reduced motion. Media are omitted from the printable CV. Projects precede papers; Education has been removed from both pages.
