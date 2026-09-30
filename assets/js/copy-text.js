export const COPY_RESET_MS = 2000;

export async function copyText(text, { clipboard, fallback } = {}) {
    if (typeof text !== "string" || text.length === 0) return false;

    if (clipboard && typeof clipboard.writeText === "function") {
        try {
            await clipboard.writeText(text);
            return true;
        } catch {
            // Permission denied or insecure context: try the fallback.
        }
    }

    if (typeof fallback === "function") {
        try {
            return fallback(text) === true;
        } catch {
            return false;
        }
    }

    return false;
}

export function copyFeedback(copied, text) {
    return copied
        ? { label: "Copied", status: `Email address ${text} copied to clipboard.` }
        : { label: "Copy", status: "Copy failed. Select the email address to copy it." };
}
