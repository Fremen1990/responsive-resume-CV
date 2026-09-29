#!/bin/sh
# Generate a text PDF from this checkout and copy it onto legacy filenames.
# Existing downloads stay in place until the new file passes validation.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
PREFERRED_PORT="${PORT:-8099}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
CANONICAL="$ROOT/assets/pdf/Tomasz-Stanisz-CV.pdf"
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/cv-export.XXXXXX")"
TMP_PDF="$WORKDIR/cv.pdf"
PROFILE_DIR="$WORKDIR/chrome-profile"
CHROME_LOG="$WORKDIR/chrome.log"
SERVER_LOG="$WORKDIR/server.log"
SERVER_PID=""
STARTED_SERVER=0

cleanup() {
    if [ "$STARTED_SERVER" -eq 1 ] && [ -n "$SERVER_PID" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    rm -rf "$WORKDIR"
    rm -f \
        "$CANONICAL.export-tmp" \
        "$ROOT/assets/pdf/Tomasz Stanisz - Resume - Light.pdf.export-tmp" \
        "$ROOT/assets/pdf/Tomasz Stanisz - Resume - Dark.pdf.export-tmp" \
        "$ROOT/assets/pdf/RESUME TOMASZ STANISZ - CV ENG.pdf.export-tmp" \
        "$ROOT/assets/Tomasz Stanisz - CV.pdf.export-tmp"
}

trap cleanup EXIT

fail() {
    echo "$1" >&2
    if [ -s "$CHROME_LOG" ]; then
        echo "--- chrome log ---" >&2
        cat "$CHROME_LOG" >&2
    fi
    if [ -s "$SERVER_LOG" ]; then
        echo "--- server log ---" >&2
        cat "$SERVER_LOG" >&2
    fi
    exit 1
}

if [ ! -x "$CHROME" ]; then
    fail "Google Chrome was not found at: $CHROME"
fi

if ! command -v pdfinfo >/dev/null 2>&1 || ! command -v pdftotext >/dev/null 2>&1; then
    fail "pdfinfo and pdftotext are required before an export can replace the CV downloads."
fi

port_is_free() {
    python3 - "$1" <<'PY'
import socket, sys
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    sock.bind(("127.0.0.1", int(sys.argv[1])))
except OSError:
    sys.exit(1)
finally:
    sock.close()
PY
}

serves_this_checkout() {
    curl -sf --max-time 3 -o "$WORKDIR/served.html" "http://127.0.0.1:$1/" \
        && cmp -s "$WORKDIR/served.html" "$ROOT/index.html"
}

start_server() {
    python3 -m http.server "$PORT" --bind 127.0.0.1 >"$SERVER_LOG" 2>&1 &
    SERVER_PID=$!
    STARTED_SERVER=1
    i=0
    while [ "$i" -lt 50 ]; do
        if serves_this_checkout "$PORT"; then
            return 0
        fi
        if ! kill -0 "$SERVER_PID" 2>/dev/null; then
            fail "Export server exited before serving this checkout."
        fi
        i=$((i + 1))
        sleep 0.1
    done
    fail "Export server on port $PORT did not serve this checkout."
}

PORT=""
if port_is_free "$PREFERRED_PORT"; then
    PORT="$PREFERRED_PORT"
    start_server
elif serves_this_checkout "$PREFERRED_PORT"; then
    PORT="$PREFERRED_PORT"
    echo "Using the existing server on port $PORT because it serves this checkout."
else
    echo "Port $PREFERRED_PORT is serving something else. Choosing a free port." >&2
    p=$((PREFERRED_PORT + 1))
    while [ "$p" -le $((PREFERRED_PORT + 30)) ]; do
        if port_is_free "$p"; then
            PORT="$p"
            break
        fi
        p=$((p + 1))
    done
    if [ -z "$PORT" ]; then
        fail "No free export port was available near $PREFERRED_PORT."
    fi
    start_server
fi

if ! serves_this_checkout "$PORT"; then
    fail "Refusing to export because port $PORT is not serving this checkout."
fi

mkdir -p "$PROFILE_DIR"
"$CHROME" \
    --headless=new \
    --disable-gpu \
    --disable-extensions \
    --disable-background-networking \
    --disable-component-update \
    --disable-sync \
    --no-first-run \
    --no-default-browser-check \
    --no-pdf-header-footer \
    --virtual-time-budget=15000 \
    --user-data-dir="$PROFILE_DIR" \
    --print-to-pdf="$TMP_PDF" \
    "http://127.0.0.1:$PORT/" >"$CHROME_LOG" 2>&1 &
CHROME_PID=$!

pdf_is_complete() {
    [ -s "$TMP_PDF" ] || return 1
    grep -q "bytes written to file" "$CHROME_LOG" 2>/dev/null || return 1
    tail -c 64 "$TMP_PDF" | grep -q '%%EOF'
}

i=0
stable=0
last_size=""
while [ "$i" -lt 80 ]; do
    if pdf_is_complete; then
        size="$(wc -c < "$TMP_PDF" | tr -d ' ')"
        if [ "$size" = "$last_size" ]; then
            stable=$((stable + 1))
        else
            stable=0
            last_size="$size"
        fi
        if [ "$stable" -ge 2 ]; then
            break
        fi
    fi
    if ! kill -0 "$CHROME_PID" 2>/dev/null; then
        break
    fi
    i=$((i + 1))
    sleep 0.5
done

if kill -0 "$CHROME_PID" 2>/dev/null; then
    if pdf_is_complete; then
        kill "$CHROME_PID" 2>/dev/null || true
        wait "$CHROME_PID" 2>/dev/null || true
    else
        kill "$CHROME_PID" 2>/dev/null || true
        wait "$CHROME_PID" 2>/dev/null || true
        fail "Timed out before Chrome finished a complete PDF."
    fi
fi

if ! pdf_is_complete; then
    fail "Chrome did not finish a complete PDF."
fi

header="$(dd if="$TMP_PDF" bs=5 count=1 2>/dev/null || true)"
if [ "$header" != "%PDF-" ]; then
    fail "Export output is not a PDF."
fi

INFO="$(pdfinfo "$TMP_PDF" 2>"$WORKDIR/pdfinfo.err" || true)"
if ! printf '%s\n' "$INFO" | grep -q 'A4'; then
    cat "$WORKDIR/pdfinfo.err" >&2
    fail "PDF is not A4."
fi

PAGES="$(printf '%s\n' "$INFO" | awk '/^Pages:/ { print $2 }')"
case "$PAGES" in
    1|2) ;;
    *) fail "Unexpected PDF page count: ${PAGES:-unknown}" ;;
esac

pdftotext -layout "$TMP_PDF" "$WORKDIR/cv.txt"
TEXT="$(cat "$WORKDIR/cv.txt")"
if [ -z "$TEXT" ]; then
    fail "PDF text extraction was empty."
fi

require_text() {
    if ! printf '%s\n' "$TEXT" | grep -q "$1"; then
        fail "PDF is missing required text: $1"
    fi
}

reject_text() {
    if printf '%s\n' "$TEXT" | grep -q "$1"; then
        fail "PDF contains rejected text: $1"
    fi
}

require_text "thomas.dev666@gmail.com"
require_text "Orange Polska"
require_text "Inżynier DevOps"
require_text "TheEventa"
require_text "Concurrent role"
require_text "DareDrop"
require_text "Junior Full Stack Developer"
require_text "May"
require_text "June 2022"
require_text "ATOM"
require_text "Akademia Tworzenia Oprogramowania"
require_text "Accenture"
require_text "October 2022"
require_text "September 2025"
require_text "Associate Cloud Engineer"
require_text "University of Lodz"
require_text "Software Engineer"
reject_text "Orange LAB"
reject_text "tomasz.stanisz@devthomas.pl"
reject_text "approximately four years"

replace_file() {
    dest="$1"
    tmp="${dest}.export-tmp"
    cp "$TMP_PDF" "$tmp"
    mv "$tmp" "$dest"
}

replace_file "$CANONICAL"
replace_file "$ROOT/assets/pdf/Tomasz Stanisz - Resume - Light.pdf"
replace_file "$ROOT/assets/pdf/Tomasz Stanisz - Resume - Dark.pdf"
replace_file "$ROOT/assets/pdf/RESUME TOMASZ STANISZ - CV ENG.pdf"
replace_file "$ROOT/assets/Tomasz Stanisz - CV.pdf"

HASH="$(shasum -a 256 "$CANONICAL" | awk '{ print $1 }')"
for file in \
    "$CANONICAL" \
    "$ROOT/assets/pdf/Tomasz Stanisz - Resume - Light.pdf" \
    "$ROOT/assets/pdf/Tomasz Stanisz - Resume - Dark.pdf" \
    "$ROOT/assets/pdf/RESUME TOMASZ STANISZ - CV ENG.pdf" \
    "$ROOT/assets/Tomasz Stanisz - CV.pdf"
do
    other="$(shasum -a 256 "$file" | awk '{ print $1 }')"
    if [ "$other" != "$HASH" ]; then
        fail "Hash mismatch after copy: $file"
    fi
done

echo "Wrote $CANONICAL ($PAGES A4 page(s), sha256 $HASH)"
