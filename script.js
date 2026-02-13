/**
 * Portfolio - Nigel Tan Jin Chun
 * Interactive enhancements
 */

// Tunable UI timings (ms). Keep in one place for easy reuse across pages.
const WELCOME_SESSION_KEY = "portfolio_welcome_seen";
const WELCOME_AUTO_DISMISS_MS = 1200;
const WELCOME_FADE_MS = 350;
const BACK_TO_TOP_SCROLL_Y = 400;
const HEADER_SOLID_SCROLL_Y = 50;

// Hamburger menu
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const isOpen = menu.classList.toggle("open");
  icon.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

// Welcome overlay
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  // Skip the welcome screen after first visit in this browser tab/session.
  if (sessionStorage.getItem(WELCOME_SESSION_KEY) === "1") {
    loader.style.display = "none";
    return;
  }

  let dismissed = false;
  const dismissLoader = () => {
    if (dismissed) return;
    dismissed = true;
    loader.classList.add("hidden");
    document.body.style.overflow = "";
    sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
    setTimeout(() => {
      loader.style.display = "none";
    }, WELCOME_FADE_MS);
  };

  // Lock background scrolling while splash is visible.
  document.body.style.overflow = "hidden";
  const timer = setTimeout(dismissLoader, WELCOME_AUTO_DISMISS_MS);
  loader.addEventListener(
    "click",
    () => {
      // Allow fast skip on user intent.
      clearTimeout(timer);
      dismissLoader();
    },
    { once: true }
  );
});

// Close menu on outside click
document.addEventListener("click", (e) => {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const hamburgerNav = document.getElementById("hamburger-nav");

  if (hamburgerNav && !hamburgerNav.contains(e.target) && menu?.classList.contains("open")) {
    menu.classList.remove("open");
    icon?.classList.remove("open");
    document.body.style.overflow = "";
  }
});

// Header + progress + back-to-top
const header = document.querySelector(".header");
const backToTop = document.getElementById("back-to-top");
const progressBar = document.getElementById("scroll-progress");

const updateOnScroll = () => {
  if (header) {
    header.style.background =
      window.scrollY > HEADER_SOLID_SCROLL_Y ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.9)";
  }

  if (backToTop) {
    backToTop.classList.toggle("visible", window.scrollY > BACK_TO_TOP_SCROLL_Y);
  }

  if (progressBar) {
    // Scale the progress bar from 0 to 1 based on page scroll ratio.
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }
};

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

// Scroll reveal animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Active nav links while scrolling
const navLinks = [...document.querySelectorAll(".nav-links a, .menu-links a")];
const sectionLinks = new Map();

navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  const id = href.slice(1);
  // Map one section id to multiple links (desktop nav + mobile nav).
  if (!sectionLinks.has(id)) sectionLinks.set(id, []);
  sectionLinks.get(id).push(link);
});

const setActiveNav = (id) => {
  navLinks.forEach((link) => link.classList.remove("active"));
  (sectionLinks.get(id) || []).forEach((link) => link.classList.add("active"));
};

const sections = [...document.querySelectorAll("main section[id]")];
if (sections.length > 0) {
  // Keep a sensible default on first paint.
  setActiveNav(sections[0].id);

  const sectionSpy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        // Prefer the most visible section when multiple overlap.
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]?.target?.id) setActiveNav(visible[0].target.id);
    },
    { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -55% 0px" }
  );

  sections.forEach((section) => sectionSpy.observe(section));
}

// Skills tabs
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    const pane = document.getElementById(tabId);
    if (pane) pane.classList.add("active");
  });
});

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
