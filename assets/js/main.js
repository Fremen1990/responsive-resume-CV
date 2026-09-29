import { menuAttributes, menuEscapeAction, sectionIdFromHref } from "./menu-state.js?v=20260929i";
import { persistTheme, readStoredTheme, themeForVisit } from "./theme-storage.js?v=20260929i";

const CV_HREF = "assets/pdf/Tomasz-Stanisz-CV.pdf";
const themeButton = document.getElementById("theme-button");
const darkThemeClass = "dark-theme";

document.documentElement.classList.add("js");

function syncDownloadLinks() {
    document.querySelectorAll(".home__button-download").forEach((link) => {
        link.setAttribute("href", CV_HREF);
    });
}

function readSavedTheme() {
    return readStoredTheme((key) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    });
}

function systemPrefersDark() {
    try {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
        return false;
    }
}

function applyTheme(theme, { persist = false } = {}) {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle(darkThemeClass, isDark);

    themeButton?.querySelector(".theme-icon--moon")?.toggleAttribute("hidden", isDark);
    themeButton?.querySelector(".theme-icon--sun")?.toggleAttribute("hidden", !isDark);

    if (themeButton) {
        themeButton.setAttribute("aria-pressed", String(isDark));
        themeButton.setAttribute(
            "aria-label",
            isDark ? "Switch to light theme" : "Switch to dark theme"
        );
    }

    if (persist) {
        try {
            persistTheme(isDark ? "dark" : "light", localStorage);
        } catch {
            // Storage can be unavailable in private browsing.
        }
    }

    syncDownloadLinks();
}

const savedTheme = readSavedTheme();
applyTheme(themeForVisit(savedTheme, systemPrefersDark()), {
    persist: savedTheme === "dark" || savedTheme === "light",
});

try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
        if (readSavedTheme()) return;
        applyTheme(event.matches ? "dark" : "light");
    });
} catch {
    // matchMedia can be unavailable.
}

document.getElementById("print-button")?.addEventListener("click", () => {
    window.print();
});

themeButton?.addEventListener("click", () => {
    const next = document.documentElement.classList.contains(darkThemeClass)
        ? "light"
        : "dark";
    applyTheme(next, { persist: true });
});

const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

function setMenuOpen(open) {
    if (!navMenu || !navToggle) return;
    const state = menuAttributes(open);
    navMenu.classList.toggle("show-menu", state.expanded === "true");
    navMenu.toggleAttribute("hidden", state.inert);
    navMenu.toggleAttribute("inert", state.inert);
    navMenu.setAttribute("aria-hidden", state.ariaHidden);
    navToggle.setAttribute("aria-expanded", state.expanded);
    navToggle.setAttribute("aria-label", state.label);
}

setMenuOpen(false);

navToggle?.addEventListener("click", () => {
    const open = navMenu?.classList.contains("show-menu");
    setMenuOpen(!open);
});

document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
        const id = sectionIdFromHref(link.getAttribute("href"));
        const target = id ? document.getElementById(id) : null;
        setMenuOpen(false);
        if (target) target.focus();
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !navMenu || !navToggle) return;
    const action = menuEscapeAction({
        open: navMenu.classList.contains("show-menu"),
        focusInsideMenu: navMenu.contains(document.activeElement),
    });
    if (!action.restoreFocusToToggle) return;
    event.preventDefault();
    setMenuOpen(action.open);
    navToggle.focus();
});

const navSectionIds = ["home", "profile", "experience", "skills", "education"];
const sections = navSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

function scrollActive() {
    const scrollY = window.scrollY;
    let currentId = "home";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 80;
        if (scrollY >= sectionTop) currentId = section.getAttribute("id") || currentId;
    });

    document.querySelectorAll(".nav__link").forEach((link) => {
        const href = link.getAttribute("href") || "";
        link.classList.toggle("active-link", href === `#${currentId}`);
    });
}

window.addEventListener("scroll", scrollActive, { passive: true });
scrollActive();

const scrollTopLink = document.getElementById("scroll-top");

function toggleScrollTop() {
    if (!scrollTopLink) return;
    const show = window.scrollY >= 200;
    scrollTopLink.classList.toggle("show-scroll", show);
    scrollTopLink.toggleAttribute("hidden", !show);
}

window.addEventListener("scroll", toggleScrollTop, { passive: true });
toggleScrollTop();
