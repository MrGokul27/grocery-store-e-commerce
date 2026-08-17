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

    // Account dropdown (touch/mobile) and session handling
    const root = getRootPrefix();
    const accountBtn = this.querySelector("#user-account-btn");
    const accountDropdown = this.querySelector("#account-dropdown");
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";

    if (userLoggedIn && accountBtn && accountDropdown) {
      // Modify user label
      const subtext = accountBtn.querySelector(".action-subtext");
      if (subtext) {
        subtext.textContent = "Hello, user!";
      }
      const maintext = accountBtn.querySelector(".dropdown-trigger");
      if (maintext) {
        const userRole = localStorage.getItem("userRole") || "customer";
        const roleDisplay =
          userRole.charAt(0).toUpperCase() + userRole.slice(1);
        maintext.innerHTML = `${roleDisplay} <i class="fa-solid fa-chevron-down chevron-icon icon"></i>`;
      }

      // Update dropdown items
      accountDropdown.innerHTML = `
        <a href="${root}pages/dashboard.html" class="dropdown-item">Dashboard</a>
        <a href="#" id="header-logout-link" class="dropdown-item text-danger">Logout</a>
      `;

      // Bind logout action
      const logoutLink = accountDropdown.querySelector("#header-logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.clear();
          window.location.href = root + "pages/login.html";
        });
      }
    }

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

function setupInfiniteSlider(
  trackId,
  prevBtnId,
  nextBtnId,
  slideClass,
  options = {},
) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (track && prevBtn && nextBtn) {
    const GAP = 24;
    const origSlides = Array.from(track.querySelectorAll("." + slideClass));
    const origCount = origSlides.length;

    const maxVisible = options.maxVisible || 5;
    const autoPlay = options.autoPlay || false;
    const autoPlayDelay = options.autoPlayDelay || 4000;
    let autoPlayInterval = null;

    // Clone all slides and append for infinite effect
    origSlides.forEach((s) => {
      const clone = s.cloneNode(true);
      clone.setAttribute("data-is-clone", "true");
      track.appendChild(clone);
    });
    origSlides.forEach((s) => {
      const clone = s.cloneNode(true);
      clone.setAttribute("data-is-clone", "true");
      track.insertBefore(clone, track.firstChild);
    });

    // currentIndex starts at origCount (pointing to the real first slide)
    let currentIndex = origCount;
    let isTransitioning = false;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1200) return maxVisible;
      if (w >= 992) return Math.min(4, maxVisible);
      if (w >= 768) return Math.min(3, maxVisible);
      if (w >= 576) return Math.min(2, maxVisible);
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

    function nextSlide() {
      if (isTransitioning) return;

      // Do not autoPlay or scroll if the slider is currently filtered
      const sliderOuter = track.closest(".deals-slider-outer");
      if (sliderOuter && sliderOuter.classList.contains("is-filtered")) {
        return;
      }

      isTransitioning = true;
      currentIndex++;
      goTo(currentIndex, true);
    }

    function prevSlide() {
      if (isTransitioning) return;

      // Do not scroll if the slider is currently filtered
      const sliderOuter = track.closest(".deals-slider-outer");
      if (sliderOuter && sliderOuter.classList.contains("is-filtered")) {
        return;
      }

      isTransitioning = true;
      currentIndex--;
      goTo(currentIndex, true);
    }

    prevBtn.addEventListener("click", () => {
      prevSlide();
      if (autoPlay) resetAutoPlay();
    });

    nextBtn.addEventListener("click", () => {
      nextSlide();
      if (autoPlay) resetAutoPlay();
    });

    function startAutoPlay() {
      if (autoPlay && !autoPlayInterval) {
        autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
      }
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    if (autoPlay) {
      const sliderOuter = track.closest(".deals-slider-outer");
      const hoverTarget = sliderOuter || track;
      hoverTarget.addEventListener("mouseenter", stopAutoPlay);
      hoverTarget.addEventListener("mouseleave", startAutoPlay);
      startAutoPlay();
    }

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

// Redirect empty/# links to 404 page
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (href === "#" || href === "" || href === null) {
    e.preventDefault();
    const root = getRootPrefix();
    window.location.href = (root || "") + "404.html";
  }
});

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

  // --- Categories Page: Sidebar Filter ---
  const sidebarList = document.getElementById("sidebar-category-list");
  const categoryGrid = document.getElementById("categories-grid");
  const categoriesCount = document.getElementById("categories-count");
  const emptyState = document.getElementById("categories-empty-state");

  if (sidebarList && categoryGrid) {
    const sidebarItems = sidebarList.querySelectorAll(".sidebar-category-item");
    const gridCards = categoryGrid.querySelectorAll(".category-grid-card");

    sidebarItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const selected = item.getAttribute("data-category");

        // Update active state in sidebar
        sidebarItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        // Filter grid cards
        let visibleCount = 0;
        gridCards.forEach((card) => {
          const isMatch =
            selected === "all" ||
            card.getAttribute("data-category") === selected;
          card.classList.toggle("is-hidden", !isMatch);
          if (isMatch) visibleCount++;
        });

        // Update count label & empty state
        if (categoriesCount) {
          categoriesCount.textContent =
            selected === "all"
              ? "16 Categories"
              : `${visibleCount} ${visibleCount === 1 ? "Category" : "Categories"}`;
        }
        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? "block" : "none";
        }

        // Smooth scroll the grid into view on smaller screens
        if (window.innerWidth <= 850) {
          categoryGrid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // --- Offers Page: Slider & Filters ---
  const offersTrack = document.getElementById("offers-track");
  const offersCategoryList = document.getElementById("offers-category-list");
  const discountFilterGroup = document.getElementById("discount-filter-group");
  const sortFilterGroup = document.getElementById("sort-filter-group");
  const offersEmptyState = document.getElementById("offers-empty-state");
  const offersAlertBtn = document.getElementById("offers-alert-btn");

  if (offersTrack) {
    // 1. Initialize Offers Carousel
    setupInfiniteSlider(
      "offers-track",
      "offers-prev-btn",
      "offers-next-btn",
      "offer-product-slide",
      {
        maxVisible: 4,
        autoPlay: true,
        autoPlayDelay: 4000,
      },
    );

    const sliderOuter = offersTrack.closest(".deals-slider-outer");
    const couponsGrid = document.getElementById("coupons-grid");
    const couponCards = couponsGrid
      ? couponsGrid.querySelectorAll(".coupon-card")
      : [];

    let currentCategory = "all";
    let activeDiscounts = [];
    let currentSort = "popular";

    // Store original products list (excluding clones) for sorting and filtering
    const allSlides = Array.from(
      offersTrack.querySelectorAll(".offer-product-slide"),
    );
    // Keep reference to the non-cloned original product slides
    const originalSlides = allSlides.filter(
      (slide) => slide.getAttribute("data-is-clone") !== "true",
    );

    function updateOffersUI() {
      // Check if filter is active
      const isFilteringActive =
        currentCategory !== "all" || activeDiscounts.length > 0;

      // Minimum discount threshold
      const minDiscount =
        activeDiscounts.length > 0 ? Math.min(...activeDiscounts) : 0;

      // Filter product slides in DOM
      let visibleProductsCount = 0;

      allSlides.forEach((slide) => {
        const slideCategory = slide.getAttribute("data-category");
        const slideDiscount =
          parseInt(slide.getAttribute("data-discount")) || 0;
        const isClone = slide.getAttribute("data-is-clone") === "true";

        const categoryMatch =
          currentCategory === "all" || slideCategory === currentCategory;
        const discountMatch = slideDiscount >= minDiscount;
        const isVisible = categoryMatch && discountMatch;

        if (isVisible) {
          if (isFilteringActive) {
            // In filtering mode, we lay them out as a grid, so hide all clones to avoid duplicates
            if (isClone) {
              slide.classList.add("is-hidden");
            } else {
              slide.classList.remove("is-hidden");
              visibleProductsCount++;
            }
          } else {
            // In standard carousel mode, show both original and clones
            slide.classList.remove("is-hidden");
            if (!isClone) visibleProductsCount++;
          }
        } else {
          slide.classList.add("is-hidden");
        }
      });

      // Filter coupon cards
      let visibleCouponsCount = 0;
      couponCards.forEach((coupon) => {
        const couponCategory = coupon.getAttribute("data-category");
        const couponDiscount =
          parseInt(coupon.getAttribute("data-discount")) || 0;

        const categoryMatch =
          currentCategory === "all" || couponCategory === currentCategory;
        const discountMatch = couponDiscount >= minDiscount;

        if (categoryMatch && discountMatch) {
          coupon.classList.remove("is-hidden");
          visibleCouponsCount++;
        } else {
          coupon.classList.add("is-hidden");
        }
      });

      // Update layout class on outer slider container
      if (sliderOuter) {
        if (isFilteringActive) {
          sliderOuter.classList.add("is-filtered");
        } else {
          sliderOuter.classList.remove("is-filtered");
          // Force layout refresh for slider width calculations
          window.dispatchEvent(new Event("resize"));
        }
      }

      // Handle Empty State visual
      if (offersEmptyState) {
        if (visibleProductsCount === 0 && visibleCouponsCount === 0) {
          offersEmptyState.style.display = "block";
        } else {
          offersEmptyState.style.display = "none";
        }
      }
    }

    // Sort product slides in the DOM track
    function sortOffersProducts() {
      // Filter out clones and sort the original slides
      const sortedSlides = originalSlides.slice().sort((a, b) => {
        if (currentSort === "price-asc") {
          return (
            parseFloat(a.getAttribute("data-price")) -
            parseFloat(b.getAttribute("data-price"))
          );
        } else if (currentSort === "price-desc") {
          return (
            parseFloat(b.getAttribute("data-price")) -
            parseFloat(a.getAttribute("data-price"))
          );
        } else if (currentSort === "discount-desc") {
          return (
            parseInt(b.getAttribute("data-discount")) -
            parseInt(a.getAttribute("data-discount"))
          );
        } else if (currentSort === "newest") {
          return (
            new Date(b.getAttribute("data-date")) -
            new Date(a.getAttribute("data-date"))
          );
        } else {
          // Default: popular
          return (
            parseInt(b.getAttribute("data-popular")) -
            parseInt(a.getAttribute("data-popular"))
          );
        }
      });

      // Re-append elements to track in their sorted order
      sortedSlides.forEach((slide) => {
        offersTrack.appendChild(slide);
      });

      updateOffersUI();
    }

    // Category click handler
    if (offersCategoryList) {
      const categoryItems = offersCategoryList.querySelectorAll(
        ".category-filter-item",
      );
      categoryItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          categoryItems.forEach((i) => i.classList.remove("active"));
          item.classList.add("active");
          currentCategory = item.getAttribute("data-category");
          updateOffersUI();
        });
      });
    }

    // Discount checkbox change handler
    if (discountFilterGroup) {
      const checkboxes =
        discountFilterGroup.querySelectorAll(".filter-checkbox");
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", () => {
          activeDiscounts = Array.from(checkboxes)
            .filter((c) => c.checked)
            .map((c) => parseInt(c.value));
          updateOffersUI();
        });
      });
    }

    // Sort radio button change handler
    if (sortFilterGroup) {
      const radios = sortFilterGroup.querySelectorAll(".filter-radio");
      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.checked) {
            currentSort = radio.value;
            sortOffersProducts();
          }
        });
      });
    }

    // Alerts Button feedback
    if (offersAlertBtn) {
      offersAlertBtn.addEventListener("click", () => {
        const originalText = offersAlertBtn.innerHTML;
        offersAlertBtn.disabled = true;
        offersAlertBtn.innerHTML =
          '<i class="fa-solid fa-circle-check"></i> Alerts Subscribed!';
        offersAlertBtn.style.backgroundColor = "#2e7d32";
        offersAlertBtn.style.boxShadow = "none";

        setTimeout(() => {
          offersAlertBtn.innerHTML = originalText;
          offersAlertBtn.disabled = false;
          offersAlertBtn.style.backgroundColor = "";
          offersAlertBtn.style.boxShadow = "";
        }, 3000);
      });
    }
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

  // =============================================================
  // --- Best Sellers Page Logic ---
  // =============================================================
  const productsGrid = document.getElementById("bestsellers-products-grid");
  if (productsGrid) {
    // 1. Data Setup (48 products)
    const baseProducts = [
      {
        name: "Premium Bananas",
        category: "Fruits & Vegetables",
        qty: "1 Dozen",
        price: 45,
        originalPrice: 45,
        rating: 4.8,
        reviews: 120,
        image: "../assets/images/home/home-best-seller-img-1.webp",
        popularScore: 98,
        sales: 340,
        dateAdded: "2026-07-15",
      },
      {
        name: "Amul Fresh Milk",
        category: "Dairy & Eggs",
        qty: "1 L",
        price: 52,
        originalPrice: 61,
        rating: 4.7,
        reviews: 96,
        image: "../assets/images/home/home-top-deals-2-amul-fresh-milk.webp",
        popularScore: 95,
        sales: 290,
        dateAdded: "2026-07-20",
      },
      {
        name: "India Gate Basmati Rice",
        category: "Grocery & Staples",
        qty: "1 Kg",
        price: 112,
        originalPrice: 136,
        rating: 4.6,
        reviews: 78,
        image:
          "../assets/images/home/home-top-deals-4-india-gate-basmati-rice.webp",
        popularScore: 92,
        sales: 250,
        dateAdded: "2026-08-01",
      },
      {
        name: "Farm Eggs (White)",
        category: "Dairy & Eggs",
        qty: "6 pcs",
        price: 30,
        originalPrice: 30,
        rating: 4.8,
        reviews: 110,
        image: "../assets/images/home/home-best-seller-img-2.webp",
        popularScore: 97,
        sales: 320,
        dateAdded: "2026-08-05",
      },
    ];

    const allBestsellers = [];
    for (let i = 0; i < 48; i++) {
      const base = baseProducts[i % baseProducts.length];
      let name = base.name;
      let category = base.category;
      let price = base.price;
      let originalPrice = base.originalPrice;
      let rating = base.rating;
      let reviews = base.reviews + ((i * 4) % 31);
      let image = base.image;
      let qty = base.qty;

      // Inject other categories so sidebar filters are fully functional
      if (i >= 8 && i < 16) {
        if (base.name === "Premium Bananas") {
          name = "Fresh Organic Bananas";
          price = 48;
          originalPrice = 48;
        } else if (base.name === "Amul Fresh Milk") {
          name = "Mother Dairy Cow Milk";
          price = 50;
          originalPrice = 58;
        }
      } else if (i >= 16 && i < 24) {
        if (i % 2 === 0) {
          name = "Nescafe Classic Coffee Packet";
          category = "Beverages";
          qty = "100g";
          price = 185;
          originalPrice = 210;
          image = "../assets/images/home/home-best-seller-img-5.webp";
          rating = 4.5;
        } else {
          name = "Taj Mahal Premium Tea";
          category = "Beverages";
          qty = "250g";
          price = 145;
          originalPrice = 160;
          image = "../assets/images/home/home-best-seller-img-5.webp";
          rating = 4.6;
        }
      } else if (i >= 24 && i < 32) {
        if (i % 2 === 0) {
          name = "Lay's Classic Salted Chips";
          category = "Snacks & Munchies";
          qty = "50g";
          price = 20;
          originalPrice = 20;
          image =
            "../assets/images/home/home-top-deals-5-lay's-classic-salted.webp";
          rating = 4.7;
        } else {
          name = "Kurkure Masala Munch Crisps";
          category = "Snacks & Munchies";
          qty = "90g";
          price = 30;
          originalPrice = 30;
          image =
            "../assets/images/home/home-top-deals-5-lay's-classic-salted.webp";
          rating = 4.4;
        }
      } else if (i >= 32 && i < 40) {
        if (i % 2 === 0) {
          name = "Dettol Soothing Liquid Handwash";
          category = "Personal Care";
          qty = "200ml";
          price = 85;
          originalPrice = 99;
          image = "../assets/images/home/home-best-seller-img-4.webp";
          rating = 4.6;
        } else {
          name = "Vim Lemon Dishwash Gel";
          category = "Home Care";
          qty = "500ml";
          price = 105;
          originalPrice = 115;
          image = "../assets/images/home/home-best-seller-img-4.webp";
          rating = 4.5;
        }
      } else if (i >= 40) {
        name = "Huggies Sensitive Baby Wipes";
        category = "Baby Care";
        qty = "80 pcs";
        price = 120;
        originalPrice = 150;
        image = "../assets/images/home/home-best-seller-img-2.webp";
        rating = 4.7;
      }

      allBestsellers.push({
        id: i + 1,
        name,
        category,
        qty,
        price,
        originalPrice,
        rating,
        reviews,
        image,
        tag: "Bestseller",
        popularScore: 100 - i,
        sales: 450 - i * 6,
        dateAdded: new Date(2026, 7, 1 + (i % 28)).toISOString().split("T")[0],
      });
    }

    // 2. State management variables
    let currentCategory = "all";
    let currentSort = "popular";
    let minRating = 0;
    let currentPage = 1;
    const itemsPerPage = 12;
    const wishlist = new Set();

    // 3. Select DOM Elements
    const resultsCounter = document.getElementById("results-counter");
    const emptyState = document.getElementById("empty-results-box");
    const paginationWrapper = document.getElementById("pagination-wrapper");
    const sortBySelect = document.getElementById("sort-by-select");
    const btnClearAll = document.getElementById("btn-clear-all");

    const categoryListItems = document.querySelectorAll(
      "#category-filter-list .filter-option",
    );
    const sidebarSortItems = document.querySelectorAll(
      "#sidebar-sort-list .filter-option",
    );
    const ratingFilterItems = document.querySelectorAll(
      "#rating-filter-list .filter-option",
    );

    // 4. Render Function
    function render() {
      // A. Filter products
      let filtered = allBestsellers.filter((product) => {
        const matchesCategory =
          currentCategory === "all" || product.category === currentCategory;
        const matchesRating = minRating === 0 || product.rating >= minRating;
        return matchesCategory && matchesRating;
      });

      // B. Sort products
      filtered.sort((a, b) => {
        if (currentSort === "price-asc") {
          return a.price - b.price;
        } else if (currentSort === "price-desc") {
          return b.price - a.price;
        } else if (currentSort === "rated") {
          return b.rating - a.rating || b.reviews - a.reviews;
        } else if (currentSort === "selling") {
          return b.sales - a.sales;
        } else if (currentSort === "newest") {
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        } else {
          // Default: popular
          return b.popularScore - a.popularScore;
        }
      });

      // C. Handle Pagination calculations
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      if (currentPage > totalPages) {
        currentPage = 1;
      }

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
      const paginatedItems = filtered.slice(startIndex, endIndex);

      // D. Update counter label
      if (totalItems > 0) {
        resultsCounter.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalItems} results`;
        emptyState.style.display = "none";
        productsGrid.style.display = "grid";
      } else {
        resultsCounter.textContent = "Showing 0-0 of 0 results";
        emptyState.style.display = "block";
        productsGrid.style.display = "none";
      }

      // E. Render Product Cards Grid
      productsGrid.innerHTML = "";
      paginatedItems.forEach((product) => {
        const hasDiscount = product.originalPrice > product.price;
        const discountPct = hasDiscount
          ? Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100,
            )
          : 0;
        const isWishlisted = wishlist.has(product.id);

        const card = document.createElement("div");
        card.className = "bestseller-card";
        card.innerHTML = `
          <span class="bestseller-tag">${product.tag}</span>
          <button class="bestseller-wishlist-btn ${isWishlisted ? "active" : ""}" data-id="${product.id}" aria-label="Add to Wishlist">
            <i class="${isWishlisted ? "fa-solid" : "fa-regular"} fa-heart"></i>
          </button>
          <div class="bestseller-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="bestseller-img" />
          </div>
          <div class="bestseller-card-info">
            <span class="bestseller-card-category">${product.category}</span>
            <h3 class="bestseller-card-title">${product.name}</h3>
            <span class="bestseller-card-qty">${product.qty}</span>
            <div class="bestseller-card-rating">
              ${renderStars(product.rating)}
              <span class="bestseller-rating-count">(${product.reviews})</span>
            </div>
            <div class="bestseller-price-wrapper">
              <span class="bestseller-price-current">₹${product.price}</span>
              ${hasDiscount ? `<span class="bestseller-price-original">₹${product.originalPrice}</span>` : ""}
              ${hasDiscount ? `<span class="bestseller-discount-badge">${discountPct}% OFF</span>` : ""}
            </div>
            <button class="bestseller-add-btn" data-id="${product.id}">
              <i class="fa-solid fa-cart-shopping"></i> Add to Cart
            </button>
          </div>
        `;
        productsGrid.appendChild(card);
      });

      // F. Render Pagination controls
      renderPagination(totalPages);
      setupCardEventListeners();
    }

    // Star icons renderer helper
    function renderStars(rating) {
      let starsHTML = "";
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;

      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          starsHTML += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars + 1 && halfStar) {
          starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
          starsHTML += '<i class="fa-regular fa-star"></i>';
        }
      }
      return starsHTML;
    }

    // Render Pagination Controls
    function renderPagination(totalPages) {
      paginationWrapper.innerHTML = "";
      if (totalPages <= 1) return;

      // Prev Button
      const prevBtn = document.createElement("button");
      prevBtn.className = `pagination-btn ${currentPage === 1 ? "disabled" : ""}`;
      prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          render();
          scrollToTop();
        }
      });
      paginationWrapper.appendChild(prevBtn);

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `pagination-btn ${currentPage === i ? "active" : ""}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
          currentPage = i;
          render();
          scrollToTop();
        });
        paginationWrapper.appendChild(pageBtn);
      }

      // Next Button
      const nextBtn = document.createElement("button");
      nextBtn.className = `pagination-btn ${currentPage === totalPages ? "disabled" : ""}`;
      nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          render();
          scrollToTop();
        }
      });
      paginationWrapper.appendChild(nextBtn);
    }

    // Scroll back to page container smoothly on pagination click
    function scrollToTop() {
      const banner = document.querySelector(".best-sellers-hero");
      if (banner) {
        banner.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // Handle clicks inside product cards
    function setupCardEventListeners() {
      // Wishlist toggling
      document.querySelectorAll(".bestseller-wishlist-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute("data-id"));
          const icon = btn.querySelector("i");

          if (wishlist.has(id)) {
            wishlist.delete(id);
            btn.classList.remove("active");
            icon.className = "fa-regular fa-heart";
          } else {
            wishlist.add(id);
            btn.classList.add("active");
            icon.className = "fa-solid fa-heart";

            // Add subtle click pop animation
            btn.style.transform = "scale(1.2)";
            setTimeout(() => (btn.style.transform = "none"), 150);
          }
        });
      });

      // Add to cart buttons interaction
      document.querySelectorAll(".bestseller-add-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const originalContent = btn.innerHTML;
          btn.disabled = true;
          btn.style.backgroundColor = "var(--primary-color)";
          btn.style.color = "#ffffff";
          btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Added!';

          setTimeout(() => {
            btn.disabled = false;
            btn.style.backgroundColor = "";
            btn.style.color = "";
            btn.innerHTML = originalContent;
          }, 1500);
        });
      });
    }

    // 5. Sidebar Filter Action Listeners
    // Category Select
    categoryListItems.forEach((item) => {
      item.addEventListener("click", () => {
        categoryListItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        currentCategory = item.getAttribute("data-category");
        currentPage = 1;
        render();
      });
    });

    // Sidebar Sort Options Select (Syncs with select input)
    sidebarSortItems.forEach((item) => {
      item.addEventListener("click", () => {
        sidebarSortItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        currentSort = item.getAttribute("data-sort");
        sortBySelect.value = currentSort;
        currentPage = 1;
        render();
      });
    });

    // Top Select Sort (Syncs with sidebar options)
    sortBySelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      sidebarSortItems.forEach((i) => {
        i.classList.toggle(
          "active",
          i.getAttribute("data-sort") === currentSort,
        );
      });
      currentPage = 1;
      render();
    });

    // Ratings Filter Select
    ratingFilterItems.forEach((item) => {
      item.addEventListener("click", () => {
        const wasActive = item.classList.contains("active");
        ratingFilterItems.forEach((i) => i.classList.remove("active"));

        if (wasActive) {
          minRating = 0;
        } else {
          item.classList.add("active");
          minRating = parseFloat(item.getAttribute("data-rating"));
        }
        currentPage = 1;
        render();
      });
    });

    // Clear All Filters
    btnClearAll.addEventListener("click", () => {
      // Clear values
      currentCategory = "all";
      currentSort = "popular";
      minRating = 0;
      currentPage = 1;

      // Update UI active states
      categoryListItems.forEach((i) =>
        i.classList.toggle("active", i.getAttribute("data-category") === "all"),
      );
      sidebarSortItems.forEach((i) =>
        i.classList.toggle("active", i.getAttribute("data-sort") === "popular"),
      );
      ratingFilterItems.forEach((i) => i.classList.remove("active"));
      sortBySelect.value = "popular";

      render();
    });

    // Initial render
    render();
  }

  // --- 404 Page Interactivity ---
  const errorWrapper = document.querySelector(".error-page-wrapper");
  const cartCharacter = document.getElementById("cart-character");
  const errorLeaves = document.querySelectorAll(".error-leaf-wrapper");

  if (cartCharacter) {
    cartCharacter.addEventListener("click", () => {
      cartCharacter.classList.add("cart-wobble");
      setTimeout(() => {
        cartCharacter.classList.remove("cart-wobble");
      }, 600);
    });
  }

  if (errorWrapper && errorLeaves.length > 0) {
    errorWrapper.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = errorWrapper.getBoundingClientRect();

      // Calculate normalized cursor position relative to the error container
      const relX = clientX - left;
      const relY = clientY - top;
      const moveX = relX / width - 0.5;
      const moveY = relY / height - 0.5;

      errorLeaves.forEach((leaf, index) => {
        // Different weights for each leaf to create a natural parallax depth feel
        const factorX = (index + 1) * 12;
        const factorY = (index + 1) * 8;

        const x = moveX * factorX;
        const y = moveY * factorY;

        leaf.style.transform = `translate(${x}px, ${y}px)`;
      });
    });

    // Reset positioning when mouse leaves the page area
    errorWrapper.addEventListener("mouseleave", () => {
      errorLeaves.forEach((leaf) => {
        leaf.style.transform = "translate(0px, 0px)";
      });
    });
  }
});
