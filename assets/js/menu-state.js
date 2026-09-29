export function menuAttributes(open) {
    const isOpen = open === true;
    return {
        expanded: isOpen ? "true" : "false",
        label: isOpen ? "Close menu" : "Open menu",
        inert: !isOpen,
        ariaHidden: isOpen ? "false" : "true",
    };
}

export function menuEscapeAction({ open, focusInsideMenu }) {
    if (open === true && focusInsideMenu === true) {
        return { open: false, restoreFocusToToggle: true };
    }
    return { open: open === true, restoreFocusToToggle: false };
}

export function sectionIdFromHref(href) {
    if (typeof href !== "string" || !href.startsWith("#") || href.length < 2) return null;
    return href.slice(1);
}
