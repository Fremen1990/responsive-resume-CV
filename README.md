# Tomasz Stanisz — CV

Interactive CV published at <https://cv.devthomas.pl/>. It is the full document; the portfolio at <https://devthomas.pl/> is the showcase, with case studies this CV links to.

The page is static HTML, CSS and browser JavaScript. It does not use a bundler or a production Node server. With no saved preference the page follows the system light or dark appearance. A saved choice wins on the next visit, including when the system appearance later changes. Print and the downloadable PDF stay light.

## Architecture

One HTML document is the content source for the screen and the PDF. There is no second copy of the career text and no build step.

| Path | Role |
| --- | --- |
| `index.html` | Name, contacts, experience and the download link. The canonical URL is `https://cv.devthomas.pl/`. |
| `assets/css/style.css` | Screen layout, light/dark tokens and A4 print rules. Print forces a white page and dark text. |
| `assets/js/main.js` | Menu, theme and the single download address. Loaded as `type="module"`. |
| `assets/js/theme-storage.js` | Saved theme, legacy key migration and system-theme fallback. |
| `assets/js/menu-state.js` | Open/closed menu state, Escape behavior and section ids. |
| `assets/js/copy-text.js` | Copy-email button: clipboard write with a fallback, and the announced result. |
| `assets/qr-code_devthomas-cv.svg` | QR code printed on page 2 of the PDF, pointing readers to the interactive version. |
| `assets/img/tomasz-stanisz.jpg` | Portrait used on screen and in print. |
| `assets/pdf/Tomasz-Stanisz-CV.pdf` | The only current CV file. The button always points here. |
| `scripts/export-pdf.sh` | Local Chrome export. It does not upload anything. |
| `package.json` | Marks the checkout as ES modules so `node --test` can import the `.js` helpers, and carries the release version. It is not an application runtime. |
| `test/*.mjs` | Theme storage, menu state and copy-to-clipboard. They do not prove focus order or layout in a browser. |

`main.js` imports the two helpers. The small script in `index.html` applies a saved or system theme before the modules load, so the first paint does not flash the wrong theme.

## How the public pieces connect

| From | To |
| --- | --- |
| This page | `https://cv.devthomas.pl/` |
| Portfolio link | `https://devthomas.pl/` |
| LinkedIn | `https://www.linkedin.com/in/tomasz-stanisz/` |
| GitHub | `https://github.com/Fremen1990` |
| Email | `mailto:thomas.dev666@gmail.com` |
| Phone | `tel:+48725214022` |
| Download | `assets/pdf/Tomasz-Stanisz-CV.pdf`, saved as `Tomasz Stanisz - CV.pdf` |

The portfolio is a separate site (repository `Fremen1990/react-portfolio-devthomas`). This repository does not build or change it. Both sites use the same contact address, `thomas.dev666@gmail.com`, and share one design family: the same palette and Fraunces, Geist and Geist Mono type.

These filenames are copies of that same light PDF, kept so older links keep working. The “Dark” name is not a dark document.

- `assets/pdf/Tomasz Stanisz - Resume - Light.pdf`
- `assets/pdf/Tomasz Stanisz - Resume - Dark.pdf`
- `assets/pdf/RESUME TOMASZ STANISZ - CV ENG.pdf`
- `assets/Tomasz Stanisz - CV.pdf`

Icons are inline SVG; there is no icon font. Type is Fraunces (display), Geist (text) and Geist Mono (labels and dates), loaded from Google Fonts, with system-font fallbacks. The page carries schema.org `ProfilePage`/`Person` JSON-LD so search engines can show the name, title and profile links. Theme choices are stored in `localStorage` under `selected-theme`. The older misspelled key `seleceted-theme` is still read once and then removed.

## Layout

On screen: a sticky top bar (section links on tablet and desktop, a menu button on phones), a hero with the portrait, pitch and contacts, a four-figure facts strip, then experience beside a sidebar with stack, credentials and community. Print collapses this to two A4 pages: page 1 is the header, facts, TheEventa and Orange; page 2 starts at `.print-running-head` and ends with a QR code to the interactive version. Page numbers come from `@page` margin boxes. Each role links to its portfolio case study (`https://devthomas.pl/work/…`); on screen the link shows its title, and in print it also shows the short address (for example `devthomas.pl/work/orange-cms`) so it can be typed from paper while staying clickable in the PDF.

The previous single-column design is the `v2.0.0` tag; the original CV is `v1.0.0` (see Versions).

## Consistency

- Screen and PDF read the same `index.html`.
- Light and dark web themes do not change the wording, the portrait or the download URL.
- Print and the PDF stay light from either web theme.
- A theme or Print click must not select an older PDF.
- The export script replaces the canonical file and the aliases only after the temporary PDF is A4, one or two pages, and contains the current contact and role text. A failed run leaves the existing files in place.

## Preview

```sh
python3 -m http.server 8081 --bind 127.0.0.1
```

Open <http://127.0.0.1:8081/>.

## Checks

Tests run on the current Node.js LTS lines: 22 (Maintenance) and 24 (Active). This checkout sets `"type": "module"` so the browser `.js` helpers are loaded as ES modules. The ordinary command does not need an experimental flag:

```sh
node --test
```

`npm test` runs the same command.

## PDF

Regenerate the text PDF locally with Google Chrome. This does not call an external document service and does not publish the file.

```sh
./scripts/export-pdf.sh
```

The script serves this checkout on port 8099, or reuses that port only when the process already serves these files. If another site owns the port, it picks a free port instead of stopping that process. Chrome writes a temporary PDF. The script checks that the file is A4, has one or two pages, and contains the current employers, contact address and community name before it replaces `assets/pdf/Tomasz-Stanisz-CV.pdf` and the older filenames. A failed export leaves the existing downloads in place.

On success, failure or interruption, the script stops only the temporary server and Chrome process it started.

## Versions

Releases are tagged on `main` and listed on the repository's Releases page. `package.json` carries the same version.

- `v3.0.0` — the tech-lead redesign with a matching two-page A4 print, outcomes and links to the portfolio case studies (current, live at cv.devthomas.pl)
- `v2.0.0` — the 2026 single-column refresh: accessibility, SEO, a theme that follows the system, and the local PDF export
- `v1.0.0` — the original CV, 2021–2024: a responsive one-page resume with an in-browser PDF download (html2pdf.js)

## Deployment

This repository has no deploy command, no build, and no hosting config. Publishing means uploading the static files to the host for `https://cv.devthomas.pl/`. That host is Hostinger, served by LiteSpeed. JavaScript there is sent as `application/x-javascript`, which browsers accept for these modules.

`./scripts/export-pdf.sh` updates only the local PDFs. The public site stays on its last upload until those files are published separately. The upload is the whole checkout, so `README.md` and `package.json` are public on the site too. On 2026-10-01 the live `index.html` matched `main`; the live HTML and PDF were last modified on 2026-09-30 at 19:37 UTC. 
