function getRootPrefix() {
  const depth = window.location.pathname.split("/pages/").length - 1;
  return depth > 0 ? "../".repeat(depth) : "";
}

function fixPaths(el, root) {
  if (!root) return;
  el.querySelectorAll("[src]").forEach((node) => {
    const src = node.getAttribute("src");
    if (
      src &&
      !src.startsWith("http") &&
      !src.startsWith("data:") &&
      !src.startsWith("/") &&
      !src.startsWith("..")
    ) {
      node.setAttribute("src", root + src);
    }
  });
  el.querySelectorAll("[href]").forEach((node) => {
    const href = node.getAttribute("href");
    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !href.startsWith("/") &&
      !href.startsWith("..")
    ) {
      node.setAttribute("href", root + href);
    }
  });
  el.querySelectorAll("[action]").forEach((node) => {
    const action = node.getAttribute("action");
    if (
      action &&
      !action.startsWith("http") &&
      !action.startsWith("/") &&
      !action.startsWith("..")
    ) {
      node.setAttribute("action", root + action);
    }
  });
}

async function loadComponent(selector, file) {
  const el = document.querySelector(selector);
  if (!el) return;
  const root = getRootPrefix();
  const res = await fetch((root || "") + "pages/components/" + file);
  el.innerHTML = await res.text();
  fixPaths(el, root);
}

// -------------------------------------------------------------
// Custom Web Components
// -------------------------------------------------------------

class CustomHeader extends HTMLElement {
  async connectedCallback() {
    await loadComponent("custom-header", "header.html");

    // Highlight active nav link
    const currentFile =
      window.location.pathname.split("/").pop() || "index.html";
    this.querySelectorAll(".nav-menu-link").forEach((link) => {
      const linkFile = link.getAttribute("href").split("/").pop();
      link.classList.toggle("active", linkFile === currentFile);
    });

    // Mobile menu toggle open/close
    const menuToggle = this.querySelector("#mobile-menu-toggle");
    const menuClose = this.querySelector("#mobile-menu-close");
    const menuWrapper = this.querySelector("#nav-menu-wrapper");

    if (menuToggle && menuWrapper) {
      menuToggle.addEventListener("click", () => {
        menuWrapper.classList.add("open");
        document.body.style.overflow = "hidden"; // Disable background scrolling
      });
    }

    if (menuClose && menuWrapper) {
      menuClose.addEventListener("click", () => {
        menuWrapper.classList.remove("open");
        document.body.style.overflow = ""; // Enable background scrolling
      });
    }

    // Close mobile menu when a link is clicked
    const menuLinks = this.querySelectorAll(".nav-menu-link");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (menuWrapper) {
          menuWrapper.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    });

    // Account dropdown (touch/mobile)
    const accountBtn = this.querySelector("#user-account-btn");
    const accountDropdown = this.querySelector("#account-dropdown");
    if (accountBtn && accountDropdown) {
      accountBtn.addEventListener("click", (e) => {
        if (window.innerWidth <= 992) {
          e.stopPropagation();
          accountDropdown.classList.toggle("show");
        }
      });
      document.addEventListener("click", () =>
        accountDropdown.classList.remove("show"),
      );
    }

    // Search validation
    const searchForm = this.querySelector("#search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        const input = searchForm.querySelector(".search-input");
        if (!input.value.trim()) {
          e.preventDefault();
          input.focus();
          input.style.borderColor = "red";
          input.style.transform = "translateX(4px)";
          setTimeout(() => (input.style.transform = "translateX(-4px)"), 50);
          setTimeout(() => (input.style.transform = "translateX(2px)"), 100);
          setTimeout(() => {
            input.style.transform = "none";
            input.style.borderColor = "";
          }, 150);
        }
      });
    }

    // Categories button feedback
    const categoriesBtn = this.querySelector("#all-categories-btn");
    if (categoriesBtn) {
      categoriesBtn.addEventListener("click", () => {
        categoriesBtn.style.transform = "scale(0.96)";
        setTimeout(() => (categoriesBtn.style.transform = "none"), 100);
      });
    }
  }
}

class CustomFooter extends HTMLElement {
  async connectedCallback() {
    await loadComponent("custom-footer", "footer.html");

    // Scroll to Top Button Functionality
    const scrollTopBtn = this.querySelector("#scroll-to-top");
    if (scrollTopBtn) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          scrollTopBtn.classList.add("visible");
        } else {
          scrollTopBtn.classList.remove("visible");
        }
      });

      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  }
}

customElements.define("custom-header", CustomHeader);
customElements.define("custom-footer", CustomFooter);

// -------------------------------------------------------------
// Sliders Setup Function — infinite loop, moves 1 slide at a time
// -------------------------------------------------------------

function setupInfiniteSlider(trackId, prevBtnId, nextBtnId, slideClass) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (track && prevBtn && nextBtn) {
    const GAP = 24;
    const origSlides = Array.from(track.querySelectorAll("." + slideClass));
    const origCount = origSlides.length;

    // Clone all slides and append for infinite effect
    origSlides.forEach((s) => track.appendChild(s.cloneNode(true)));
    origSlides.forEach((s) =>
      track.insertBefore(s.cloneNode(true), track.firstChild),
    );

    // currentIndex starts at origCount (pointing to the real first slide)
    let currentIndex = origCount;
    let isTransitioning = false;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1200) return 5;
      if (w >= 992) return 4;
      if (w >= 768) return 3;
      if (w >= 576) return 2;
      return 1;
    }

    function getSlideWidth() {
      const visible = getVisibleCount();
      const wrapperWidth = track.parentElement.offsetWidth;
      return (wrapperWidth - GAP * (visible - 1)) / visible;
    }

    function setSlideWidths() {
      const w = getSlideWidth();
      track.querySelectorAll("." + slideClass).forEach((s) => {
        s.style.width = w + "px";
      });
    }

    function getStep() {
      return getSlideWidth() + GAP;
    }

    function goTo(index, animate) {
      track.style.transition = animate
        ? "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none";
      track.style.transform = `translateX(-${index * getStep()}px)`;
    }

    function initSlider() {
      setSlideWidths();
      goTo(currentIndex, false);
    }

    track.addEventListener("transitionend", () => {
      if (currentIndex >= origCount * 2) {
        currentIndex = origCount;
        goTo(currentIndex, false);
      } else if (currentIndex < origCount) {
        currentIndex = origCount * 2 - 1;
        goTo(currentIndex, false);
      }
      isTransitioning = false;
    });

    prevBtn.addEventListener("click", () => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex--;
      goTo(currentIndex, true);
    });

    nextBtn.addEventListener("click", () => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      goTo(currentIndex, true);
    });

    window.addEventListener("resize", () => initSlider());
    initSlider();
  }
}

function setupTestimonialSlider(trackId, dotsContainerId, slideClass) {
  const track = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsContainerId);

  if (track && dotsContainer) {
    const GAP = 24;
    const origSlides = Array.from(track.querySelectorAll("." + slideClass));
    const origCount = origSlides.length;

    // Create dots
    dotsContainer.innerHTML = "";
    for (let i = 0; i < origCount; i++) {
      const dot = document.createElement("button");
      dot.className = `testimonial-dot${i === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dotsContainer.appendChild(dot);
    }
    const dots = Array.from(dotsContainer.querySelectorAll(".testimonial-dot"));

    // Clone slides
    origSlides.forEach((s) => track.appendChild(s.cloneNode(true)));
    origSlides.forEach((s) =>
      track.insertBefore(s.cloneNode(true), track.firstChild),
    );

    let currentIndex = origCount;
    let isTransitioning = false;
    let autoPlayInterval;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 992) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    function getSlideWidth() {
      const visible = getVisibleCount();
      const wrapperWidth = track.parentElement.offsetWidth;
      return (wrapperWidth - GAP * (visible - 1)) / visible;
    }

    function setSlideWidths() {
      const w = getSlideWidth();
      track.querySelectorAll("." + slideClass).forEach((s) => {
        s.style.width = w + "px";
      });
    }

    function getStep() {
      return getSlideWidth() + GAP;
    }

    function goTo(index, animate) {
      track.style.transition = animate
        ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none";
      track.style.transform = `translateX(-${index * getStep()}px)`;

      const realIndex = (index - origCount + origCount) % origCount;
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === realIndex);
      });
    }

    function initSlider() {
      setSlideWidths();
      goTo(currentIndex, false);
    }

    track.addEventListener("transitionend", () => {
      if (currentIndex >= origCount * 2) {
        currentIndex = origCount;
        goTo(currentIndex, false);
      } else if (currentIndex < origCount) {
        currentIndex = origCount * 2 - 1;
        goTo(currentIndex, false);
      }
      isTransitioning = false;
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        if (isTransitioning) return;
        resetAutoPlay();
        isTransitioning = true;
        currentIndex = origCount + idx;
        goTo(currentIndex, true);
      });
    });

    function nextSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      goTo(currentIndex, true);
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    track.addEventListener("mouseenter", stopAutoPlay);
    track.addEventListener("mouseleave", startAutoPlay);

    window.addEventListener("resize", () => initSlider());
    initSlider();
    startAutoPlay();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // --- Initialize Sliders ---
  setupInfiniteSlider(
    "deals-track",
    "deals-prev-btn",
    "deals-next-btn",
    "deal-slide",
  );
  setupInfiniteSlider(
    "best-seller-track",
    "best-seller-prev-btn",
    "best-seller-next-btn",
    "deal-slide",
  );
  setupTestimonialSlider(
    "testimonials-track",
    "testimonials-dots",
    "testimonial-slide",
  );

  // --- Categories Slider — infinite auto-scroll ---
  const catTrack = document.getElementById("categories-track");
  if (catTrack) {
    const origCatSlides = Array.from(
      catTrack.querySelectorAll(".category-slide"),
    );
    // Clone the set once and append for seamless loop
    origCatSlides.forEach((s) => catTrack.appendChild(s.cloneNode(true)));

    let catOffset = 0;
    const SPEED = 0.6; // px per frame
    let rafId;
    let paused = false;

    function getSetWidth() {
      const slide = catTrack.querySelector(".category-slide");
      if (!slide) return 0;
      const style = getComputedStyle(catTrack);
      const gap = parseFloat(style.gap) || 30;
      return origCatSlides.length * (slide.offsetWidth + gap);
    }

    function animateCat() {
      if (!paused) {
        catOffset += SPEED;
        const setWidth = getSetWidth();
        if (setWidth > 0 && catOffset >= setWidth) {
          catOffset -= setWidth;
        }
        catTrack.style.transition = "none";
        catTrack.style.transform = `translateX(-${catOffset}px)`;
      }
      rafId = requestAnimationFrame(animateCat);
    }

    catTrack.addEventListener("mouseenter", () => {
      paused = true;
    });
    catTrack.addEventListener("mouseleave", () => {
      paused = false;
    });

    animateCat();
  }

  // --- Countdown Timer ---
  const hoursEl = document.getElementById("timer-hours");
  const minutesEl = document.getElementById("timer-minutes");
  const secondsEl = document.getElementById("timer-seconds");
  if (hoursEl && minutesEl && secondsEl) {
    let total =
      parseInt(hoursEl.textContent) * 3600 +
      parseInt(minutesEl.textContent) * 60 +
      parseInt(secondsEl.textContent);

    const interval = setInterval(() => {
      if (total <= 0) {
        clearInterval(interval);
        return;
      }
      total--;
      hoursEl.textContent = String(Math.floor(total / 3600)).padStart(2, "0");
      minutesEl.textContent = String(Math.floor((total % 3600) / 60)).padStart(
        2,
        "0",
      );
      secondsEl.textContent = String(total % 60).padStart(2, "0");
    }, 1000);
  }

  // --- Flash Sale Countdown Timer ---
  const flashHoursEl = document.getElementById("flash-hours");
  const flashMinutesEl = document.getElementById("flash-minutes");
  const flashSecondsEl = document.getElementById("flash-seconds");
  if (flashHoursEl && flashMinutesEl && flashSecondsEl) {
    let flashTotal =
      parseInt(flashHoursEl.textContent) * 3600 +
      parseInt(flashMinutesEl.textContent) * 60 +
      parseInt(flashSecondsEl.textContent);

    const flashInterval = setInterval(() => {
      if (flashTotal <= 0) {
        clearInterval(flashInterval);
        return;
      }
      flashTotal--;
      flashHoursEl.textContent = String(Math.floor(flashTotal / 3600)).padStart(
        2,
        "0",
      );
      flashMinutesEl.textContent = String(
        Math.floor((flashTotal % 3600) / 60),
      ).padStart(2, "0");
      flashSecondsEl.textContent = String(flashTotal % 60).padStart(2, "0");
    }, 1000);
  }

  // --- Newsletter Subscription Form Handler ---
  const homeNewsletterForm = document.getElementById("home-newsletter-form");
  const newsletterSuccessMsg = document.getElementById(
    "newsletter-success-msg",
  );
  if (homeNewsletterForm && newsletterSuccessMsg) {
    homeNewsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = homeNewsletterForm.querySelector(".btn-subscribe");
      const emailInput = homeNewsletterForm.querySelector(".newsletter-input");

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      // Simulate API call
      setTimeout(() => {
        homeNewsletterForm.style.display = "none";
        newsletterSuccessMsg.style.display = "flex";
        emailInput.value = "";

        // Reset after 6 seconds to let them subscribe another email if they want
        setTimeout(() => {
          homeNewsletterForm.style.display = "flex";
          newsletterSuccessMsg.style.display = "none";
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 6000);
      }, 1000);
    });
  }
});
