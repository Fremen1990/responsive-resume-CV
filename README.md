# Tomasz Stanisz — CV

Interactive CV published at <https://cv.devthomas.pl/>.

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
| `assets/img/tomasz-stanisz.jpg` | Portrait used on screen and in print. |
| `assets/pdf/Tomasz-Stanisz-CV.pdf` | The only current CV file. The button always points here. |
| `scripts/export-pdf.sh` | Local Chrome export. It does not upload anything. |
| `package.json` | Marks the checkout as ES modules so `node --test` can import the `.js` helpers. It is not an application runtime. |
| `test/*.mjs` | Theme storage and menu state. They do not prove focus order or layout in a browser. |

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

The portfolio is a separate site. This repository does not build or change it. On 2026-09-29 the portfolio contact still showed `tomasz.stanisz@devthomas.pl`, while this CV uses `thomas.dev666@gmail.com`.

These filenames are copies of that same light PDF, kept so older links keep working. The “Dark” name is not a dark document.

- `assets/pdf/Tomasz Stanisz - Resume - Light.pdf`
- `assets/pdf/Tomasz Stanisz - Resume - Dark.pdf`
- `assets/pdf/RESUME TOMASZ STANISZ - CV ENG.pdf`
- `assets/Tomasz Stanisz - CV.pdf`

Screen icons come from Boxicons 2.1.4 (`https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css`). The typeface is Inter, loaded from Google Fonts, with a system-font fallback. Theme choices are stored in `localStorage` under `selected-theme`. The older misspelled key `seleceted-theme` is still read once and then removed.

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

## Deployment

This repository has no deploy command, no build, and no hosting config. Publishing means uploading the static files to the host for `https://cv.devthomas.pl/`. That host is Hostinger, served by LiteSpeed. JavaScript there is sent as `application/x-javascript`, which browsers accept for these modules.

`./scripts/export-pdf.sh` updates only the local PDFs. The public site stays on its last upload until those files are published separately. On 2026-09-29 the live HTML, scripts and PDF were last modified at 09:03 UTC. That live HTML still requests Boxicons from the unpinned `@latest` URL; the pin to 2.1.4 is in this checkout and is not on the public site yet.
