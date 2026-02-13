/**
 * Portfolio — Nigel Tan Jin Chun
 * Interactive enhancements
 */

// Hamburger menu
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const isOpen = menu.classList.toggle("open");
  icon.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

// Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("hidden");
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }
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

// Header scroll
const header = document.querySelector(".header");
if (header) {
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 50) {
        header.style.background = "rgba(255, 255, 255, 0.98)";
      } else {
        header.style.background = "rgba(255, 255, 255, 0.9)";
      }
    },
    { passive: true }
  );
}

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

// Back to top button
const backToTop = document.getElementById("back-to-top");
if (backToTop) {
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
