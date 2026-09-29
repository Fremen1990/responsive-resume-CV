# Tomasz Stanisz — CV

Interactive CV published at <https://cv.devthomas.pl/>.

The page is static HTML. With no saved preference it follows the system light or dark appearance, and otherwise stays light. A saved choice wins on the next visit. Screen and print styles share that document, and the downloadable PDF is generated from the same page. Print stays light.

## Preview

```sh
python3 -m http.server 8081 --bind 127.0.0.1
```

Open <http://127.0.0.1:8081/>.

## PDF

Regenerate the text PDF locally with Google Chrome. This does not call an external document service and does not publish the file.

```sh
./scripts/export-pdf.sh
```

The script serves this checkout on port 8099, or reuses that port only when the process already serves these files. If another site owns the port, it picks a free port instead of stopping that process. Chrome writes a temporary PDF. The script checks that the file is A4, has one or two pages, and contains the current employers, contact address and community name before it replaces `assets/pdf/Tomasz-Stanisz-CV.pdf` and the older filenames. A failed export leaves the existing downloads in place.

## Checks

```sh
node --test
```
