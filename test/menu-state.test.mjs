import assert from "node:assert/strict";
import test from "node:test";
import { menuAttributes, menuEscapeAction, sectionIdFromHref } from "../assets/js/menu-state.mjs";

test("closed menu is inert and not expanded", () => {
    const state = menuAttributes(false);
    assert.equal(state.expanded, "false");
    assert.equal(state.label, "Open menu");
    assert.equal(state.inert, true);
    assert.equal(state.ariaHidden, "true");
});

test("open menu is exposed to assistive technology", () => {
    const state = menuAttributes(true);
    assert.equal(state.expanded, "true");
    assert.equal(state.label, "Close menu");
    assert.equal(state.inert, false);
    assert.equal(state.ariaHidden, "false");
});

test("escape inside an open menu closes it and restores focus", () => {
    assert.deepEqual(
        menuEscapeAction({ open: true, focusInsideMenu: true }),
        { open: false, restoreFocusToToggle: true }
    );
});

test("escape outside the menu does not steal focus", () => {
    assert.deepEqual(
        menuEscapeAction({ open: true, focusInsideMenu: false }),
        { open: true, restoreFocusToToggle: false }
    );
    assert.deepEqual(
        menuEscapeAction({ open: false, focusInsideMenu: false }),
        { open: false, restoreFocusToToggle: false }
    );
});

test("section links resolve to a visible target id", () => {
    assert.equal(sectionIdFromHref("#experience"), "experience");
    assert.equal(sectionIdFromHref("#"), null);
    assert.equal(sectionIdFromHref("https://devthomas.pl/"), null);
});
