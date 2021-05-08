// ==========================  SHOW MENU =============================//

const ShowMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId);

  // Validate that variable exist
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      // We add the show-menu class to the div with nav__menu class
      nav.classList.toggle("show-menu");
    });
  }
};

ShowMenu("nav-toggle", "nav-menu");

// ==========================  REMOVE MENU MOBILE =============================//

const navLink = document.querySelectorAll(".nav__link");

function linkAction() {
  const navMenu = document.getElementById("nav-menu");

  //When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
}

navLink.forEach((n) => n.addEventListener("click", linkAction));

// ==========================  SCROLL SECTIONS ACTIVE LINK =============================//

const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav__manu a[href*=" + sectionId + "]")
        .classList.add("active-link");
    } else {
      document
        .querySelector(".nav__manu a[href*=" + sectionId + "]")
        .classList.remove("active-link");
    }
  });
}

// ==================== SHOW SCROLL TOP =========================//

function scrollTop() {
  const scrollTop = document.getElementById("scroll-top");
  //When th scroll is higher than 560 viewporrt heigh, add the show-scroll class to the tag with scroll
  if (this.scrollY >= 200) scrollTop.classList.add("show-scroll");
  else scrollTop.classList.remove("show-scroll");
}

window.addEventListener("scroll", scrollTop);

// ==================== DARK LIGHT THEME =========================//
