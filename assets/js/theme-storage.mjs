export const THEME_KEY = "selected-theme";
export const LEGACY_THEME_KEY = "seleceted-theme";

const KNOWN_THEMES = new Set(["dark", "light"]);

export function readStoredTheme(getItem) {
    const current = getItem(THEME_KEY);
    if (KNOWN_THEMES.has(current)) return current;

    const legacy = getItem(LEGACY_THEME_KEY);
    if (KNOWN_THEMES.has(legacy)) return legacy;

    return "light";
}

export function persistTheme(theme, storage) {
    if (!KNOWN_THEMES.has(theme)) return false;
    storage.setItem(THEME_KEY, theme);
    storage.removeItem(LEGACY_THEME_KEY);
    return true;
}
