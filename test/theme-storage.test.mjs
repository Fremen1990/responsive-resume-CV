import assert from "node:assert/strict";
import test from "node:test";
import { LEGACY_THEME_KEY, THEME_KEY, persistTheme, readStoredTheme } from "../assets/js/theme-storage.mjs";

test("uses the correctly spelled storage key", () => {
    const getItem = (key) => (key === THEME_KEY ? "light" : "dark");
    assert.equal(readStoredTheme(getItem), "light");
});

test("falls back to the legacy misspelled key", () => {
    const getItem = (key) => (key === LEGACY_THEME_KEY ? "light" : null);
    assert.equal(readStoredTheme(getItem), "light");
});

test("defaults to light when nothing valid is stored", () => {
    assert.equal(readStoredTheme(() => null), "light");
    assert.equal(
        readStoredTheme((key) => (key === THEME_KEY ? "blue" : null)),
        "light"
    );
});

test("persistTheme writes the current key and removes the legacy key", () => {
    const data = new Map([[LEGACY_THEME_KEY, "dark"]]);
    const storage = {
        setItem(key, value) {
            data.set(key, value);
        },
        removeItem(key) {
            data.delete(key);
        },
    };

    assert.equal(persistTheme("light", storage), true);
    assert.equal(data.get(THEME_KEY), "light");
    assert.equal(data.has(LEGACY_THEME_KEY), false);
});

test("persistTheme ignores unknown themes", () => {
    let writes = 0;
    const storage = {
        setItem() {
            writes += 1;
        },
        removeItem() {
            writes += 1;
        },
    };

    assert.equal(persistTheme("blue", storage), false);
    assert.equal(writes, 0);
});
