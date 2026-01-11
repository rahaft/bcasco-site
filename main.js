// Simple interactions for navigation and scrolling

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  // Load version information (if version element exists)
  const versionEl = document.getElementById("version-number");
  if (versionEl) {
    // Set a default immediately so it doesn't show "Loading..."
    const buildDate = new Date().toISOString().split("T")[0];
    versionEl.textContent = `1.0.0 - ${buildDate}`;
    
    // Then try to load the actual version
    fetch("version.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        let versionText = data.version || "1.0.0";
        if (data.commit) {
          versionText += ` (${data.commit.substring(0, 7)})`;
        }
        if (data.buildDate) {
          versionText += ` - ${data.buildDate}`;
        }
        versionEl.textContent = versionText;
      })
      .catch((error) => {
        console.error("Error loading version.json:", error);
        // Keep the fallback that was already set
      });
  }

  // Scroll from hero to events section (if scroll button exists)
  const scrollBtn = document.getElementById("scrollToActions");
  const eventsSection = document.getElementById("events-scroll");
  if (scrollBtn && eventsSection) {
    scrollBtn.addEventListener("click", () => {
      eventsSection.scrollIntoView({ behavior: "smooth" });
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

  // Dropdown menus (for mobile, always show; desktop uses hover via CSS)
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach((toggle) => {
    const dropdownContainer = toggle.closest(".has-dropdown");
    const menu = dropdownContainer?.querySelector(".dropdown-menu");
    if (!menu) return;

    // On mobile, always show the dropdown menu (no toggle needed)
    if (window.innerWidth <= 720) {
      menu.classList.add("show");
      toggle.setAttribute("aria-expanded", "true");
      // Prevent default link behavior on mobile for the toggle
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
      });
    }

    // On desktop, allow normal link behavior (hover will show dropdown)
    // Close dropdown when clicking outside (mobile only - but menu is always visible on mobile)
    document.addEventListener("click", (event) => {
      if (window.innerWidth > 720) {
        if (
          !menu.contains(event.target) &&
          !toggle.contains(event.target) &&
          !dropdownContainer.contains(event.target)
        ) {
          menu.classList.remove("show");
          toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
  
  // Handle window resize to update dropdown visibility
  window.addEventListener("resize", () => {
    dropdownToggles.forEach((toggle) => {
      const dropdownContainer = toggle.closest(".has-dropdown");
      const menu = dropdownContainer?.querySelector(".dropdown-menu");
      if (!menu) return;
      
      if (window.innerWidth <= 720) {
        menu.classList.add("show");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });
});
