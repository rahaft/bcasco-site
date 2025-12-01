// Simple interactions for navigation and scrolling

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  // Scroll from hero to action section
  const scrollBtn = document.getElementById("scrollToActions");
  const actionsSection = document.getElementById("actions");
  if (scrollBtn && actionsSection) {
    scrollBtn.addEventListener("click", () => {
      actionsSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Simple hero carousel (auto-advance)
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dot");
  let currentSlideIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) return;
    currentSlideIndex = index % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentSlideIndex);
    });

    heroDots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentSlideIndex);
    });
  }

  if (heroSlides.length > 1) {
    // Auto-advance every 8 seconds
    setInterval(() => {
      showHeroSlide(currentSlideIndex + 1);
    }, 8000);

    heroDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showHeroSlide(index);
      });
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // About dropdown
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", () => {
      const isOpen = dropdownMenu.classList.toggle("show");
      dropdownToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close dropdown when clicking outside (desktop)
    document.addEventListener("click", (event) => {
      if (
        !dropdownMenu.contains(event.target) &&
        !dropdownToggle.contains(event.target)
      ) {
        dropdownMenu.classList.remove("show");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
});


