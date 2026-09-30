import assert from "node:assert/strict";
import test from "node:test";
import { copyFeedback, copyText } from "../assets/js/copy-text.js";

test("uses the async clipboard when it is available", async () => {
    let written = null;
    const clipboard = { writeText: async (value) => { written = value; } };
    assert.equal(await copyText("a@b.c", { clipboard }), true);
    assert.equal(written, "a@b.c");
});

test("falls back when the clipboard rejects", async () => {
    const clipboard = { writeText: async () => { throw new Error("denied"); } };
    let fallbackValue = null;
    const fallback = (value) => { fallbackValue = value; return true; };
    assert.equal(await copyText("a@b.c", { clipboard, fallback }), true);
    assert.equal(fallbackValue, "a@b.c");
});

test("reports failure when nothing can copy", async () => {
    assert.equal(await copyText("a@b.c"), false);
    assert.equal(await copyText("a@b.c", { fallback: () => false }), false);
    assert.equal(await copyText("a@b.c", { fallback: () => { throw new Error("x"); } }), false);
});

test("refuses empty text", async () => {
    let called = false;
    const clipboard = { writeText: async () => { called = true; } };
    assert.equal(await copyText("", { clipboard }), false);
    assert.equal(called, false);
});

test("feedback announces the result", () => {
    assert.equal(copyFeedback(true, "a@b.c").label, "Copied");
    assert.match(copyFeedback(true, "a@b.c").status, /a@b\.c copied/);
    assert.equal(copyFeedback(false, "a@b.c").label, "Copy");
    assert.match(copyFeedback(false, "a@b.c").status, /failed/);
});
