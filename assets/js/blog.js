document.addEventListener("DOMContentLoaded", () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Benefits of Eating Fresh Fruits Daily",
      category: "Healthy Lifestyle",
      categorySlug: "healthy-lifestyle",
      excerpt:
        "Discover how adding fresh fruits to your daily diet can boost your energy, improve skin health, and strengthen immunity.",
      date: "2024-05-10",
      dateFormatted: "May 10, 2024",
      readTime: "5 min read",
      img: "../assets/images/blog/blog-img-1-fresh-fruits.webp",
      tags: ["Healthy Eating", "Fresh Fruit", "Nutrition", "Wellness"],
    },
    {
      id: 2,
      title: "How to Store Vegetables The Right Way",
      category: "Nutrition",
      categorySlug: "nutrition",
      excerpt:
        "Learn the best way to store vegetables and keep them fresh for longer, reducing waste and saving money.",
      date: "2024-05-08",
      dateFormatted: "May 8, 2024",
      readTime: "4 min read",
      img: "../assets/images/blog/blog-img-2-vegetables.webp",
      tags: ["Vegetables", "Tips", "Wellness", "Organic"],
    },
    {
      id: 3,
      title: "Easy & Healthy Breakfast Ideas",
      category: "Recipes",
      categorySlug: "recipes",
      excerpt:
        "Kickstart your day with these quick, healthy, and delicious breakfast recipes that take less than 15 minutes.",
      date: "2024-05-05",
      dateFormatted: "May 5, 2024",
      readTime: "6 min read",
      img: "../assets/images/blog/blog-img-3-breakfast.webp",
      tags: ["Recipes", "Healthy Eating", "Wellness"],
    },
    {
      id: 4,
      title: "Seasonal Vegetables: What to Buy & When",
      category: "Product Tips",
      categorySlug: "product-tips",
      excerpt:
        "A complete guide to seasonal vegetables, helping you choose the freshest produce at the best prices.",
      date: "2024-04-28",
      dateFormatted: "April 28, 2024",
      readTime: "7 min read",
      img: "../assets/images/blog/blog-img-4-seasonal-veggies.webp",
      tags: ["Vegetables", "Tips", "Fresh Fruit", "Organic"],
    },
    {
      id: 5,
      title: "Simple Habits for a Healthy You",
      category: "Healthy Lifestyle",
      categorySlug: "healthy-lifestyle",
      excerpt:
        "Small daily habits that can make a big difference in your physical and mental health over time.",
      date: "2024-04-25",
      dateFormatted: "April 25, 2024",
      readTime: "5 min read",
      img: "../assets/images/blog/blog-img-5-healthy-habits.webp",
      tags: ["Wellness", "Healthy Eating", "Nutrition"],
    },
    {
      id: 6,
      title: "Sustainable Living: Small Steps, Big Impact",
      category: "Sustainability",
      categorySlug: "sustainability",
      excerpt:
        "Easy and eco-friendly choices you can make in your daily life to live more sustainably and help protect the environment.",
      date: "2024-04-18",
      dateFormatted: "April 18, 2024",
      readTime: "8 min read",
      img: "../assets/images/blog/blog-img-1-sustainable-living.webp",
      tags: ["Organic", "Tips", "Wellness"],
    },
    {
      id: 7,
      title: "5 Refreshing Summer Smoothies",
      category: "Recipes",
      categorySlug: "recipes",
      excerpt:
        "Beat the heat with these delicious, nutrient-packed smoothie recipes that are easy to make at home.",
      date: "2024-04-15",
      dateFormatted: "April 15, 2024",
      readTime: "4 min read",
      img: "../assets/images/blog/blog-img-7-smoothies.webp",
      tags: ["Recipes", "Fresh Fruit", "Healthy Eating"],
    },
    {
      id: 8,
      title: "Understanding Food Labels Better",
      category: "Nutrition",
      categorySlug: "nutrition",
      excerpt:
        "A beginner's guide to reading nutrition labels, helping you make healthier choices at the grocery store.",
      date: "2024-04-10",
      dateFormatted: "April 10, 2024",
      readTime: "6 min read",
      img: "../assets/images/blog/blog-img-8-food-labels.webp",
      tags: ["Nutrition", "Tips", "Wellness"],
    },
    {
      id: 9,
      title: "Organic vs. Regular Produce: What's Best?",
      category: "Product Tips",
      categorySlug: "product-tips",
      excerpt:
        "Explore the differences between organic and conventional produce to decide what's best for your family.",
      date: "2024-04-05",
      dateFormatted: "April 5, 2024",
      readTime: "7 min read",
      img: "../assets/images/blog/blog-img-9-organic-produce.webp",
      tags: ["Organic", "Vegetables", "Nutrition", "Tips"],
    },
    {
      id: 10,
      title: "Superfoods to Boost Your Immune System",
      category: "Nutrition",
      categorySlug: "nutrition",
      excerpt:
        "Integrate these nutrient-dense superfoods into your meals to naturally build strong defenses against common illnesses.",
      date: "2024-03-28",
      dateFormatted: "March 28, 2024",
      readTime: "5 min read",
      img: "../assets/images/blog/blog-img-1-fresh-fruits.webp",
      tags: ["Healthy Eating", "Nutrition", "Wellness"],
    },
    {
      id: 11,
      title: "Meal Prep Guide for Busy Weekdays",
      category: "Recipes",
      categorySlug: "recipes",
      excerpt:
        "Save time and eat healthier during the week with our ultimate guide to meal planning and batch cooking.",
      date: "2024-03-22",
      dateFormatted: "March 22, 2024",
      readTime: "8 min read",
      img: "../assets/images/blog/blog-img-3-breakfast.webp",
      tags: ["Recipes", "Tips", "Healthy Eating"],
    },
    {
      id: 12,
      title: "Zero Waste Grocery Shopping Tips",
      category: "Sustainability",
      categorySlug: "sustainability",
      excerpt:
        "Discover simple strategies to reduce plastic packaging waste during your weekly grocery run.",
      date: "2024-03-15",
      dateFormatted: "March 15, 2024",
      readTime: "6 min read",
      img: "../assets/images/blog/blog-img-1-sustainable-living.webp",
      tags: ["Organic", "Tips", "Wellness"],
    },
  ];

  // -------------------------------------------------------------
  // State Variables
  // -------------------------------------------------------------
  let currentCategory = "all";
  let currentTag = "";
  let searchQuery = "";
  let sortBy = "latest";
  let currentPage = 1;
  const itemsPerPage = 9;

  // -------------------------------------------------------------
  // DOM References
  // -------------------------------------------------------------
  const blogGrid = document.getElementById("blog-grid");
  const resultsCount = document.getElementById("results-count");
  const sortSelect = document.getElementById("blog-sort");
  const paginationWrapper = document.getElementById("blog-pagination");
  const searchForm = document.getElementById("blog-search-form");
  const searchInput = document.getElementById("blog-search-input");
  const categoryLinks = document.querySelectorAll(".category-link");
  const tagBadges = document.querySelectorAll(".tag-badge");
  const popularPostsList = document.getElementById("popular-posts-list");

  // -------------------------------------------------------------
  // Filter, Sort, and Render Logic
  // -------------------------------------------------------------
  function filterAndSortBlogs() {
    return blogPosts
      .filter((post) => {
        // Category Filter
        if (
          currentCategory !== "all" &&
          post.categorySlug !== currentCategory
        ) {
          return false;
        }
        // Tag Filter
        if (currentTag && !post.tags.includes(currentTag)) {
          return false;
        }
        // Search Filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(query);
          const matchExcerpt = post.excerpt.toLowerCase().includes(query);
          if (!matchTitle && !matchExcerpt) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        // Sort Logic
        if (sortBy === "latest") {
          return new Date(b.date) - new Date(a.date);
        } else if (sortBy === "oldest") {
          return new Date(a.date) - new Date(b.date);
        } else if (sortBy === "title-az") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }

  function renderBlogs() {
    const filteredList = filterAndSortBlogs();
    const totalItems = filteredList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Boundary check for current page
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentPageItems = filteredList.slice(startIndex, endIndex);

    // Update Showing text
    if (totalItems === 0) {
      resultsCount.textContent = "Showing 0 articles";
    } else {
      resultsCount.textContent = `Showing ${startIndex + 1} - ${endIndex} of ${totalItems} articles`;
    }

    // Clear grid
    blogGrid.innerHTML = "";

    if (currentPageItems.length === 0) {
      blogGrid.innerHTML = `
        <div class="col-12">
          <div class="blog-empty-state">
            <i class="fa-solid fa-magnifying-glass"></i>
            <h3>No articles found</h3>
            <p>We couldn't find any articles matching your filters. Try adjusting your search query or selecting a different category.</p>
          </div>
        </div>
      `;
      paginationWrapper.innerHTML = "";
      return;
    }

    // Render Cards
    currentPageItems.forEach((post) => {
      const cardCol = document.createElement("div");
      cardCol.className = "col-lg-4 col-md-6 col-sm-12";

      cardCol.innerHTML = `
        <article class="blog-card">
          <div class="blog-card-img-wrapper">
            <img src="${post.img}" alt="${post.title}" class="blog-card-img" loading="lazy" />
          </div>
          <div class="blog-card-body">
            <span class="blog-card-category badge-${post.categorySlug}">${post.category}</span>
            <h2 class="blog-card-title">${post.title}</h2>
            <p class="blog-card-excerpt">${post.excerpt}</p>
            <div class="blog-card-footer">
              <div class="blog-card-meta">
                <i class="fa-regular fa-calendar"></i>
                <span>${post.dateFormatted}</span>
              </div>
              <div class="blog-card-meta">
                <i class="fa-regular fa-clock"></i>
                <span>${post.readTime}</span>
              </div>
            </div>
          </div>
        </article>
      `;
      blogGrid.appendChild(cardCol);
    });

    // Render Pagination
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationWrapper.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = `pagination-btn ${currentPage === 1 ? "disabled" : ""}`;
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.setAttribute("aria-label", "Previous page");
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderBlogs();
        scrollToTop();
      }
    });
    paginationWrapper.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `pagination-btn ${currentPage === i ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.setAttribute("aria-label", `Page ${i}`);
      pageBtn.addEventListener("click", () => {
        if (currentPage !== i) {
          currentPage = i;
          renderBlogs();
          scrollToTop();
        }
      });
      paginationWrapper.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = `pagination-btn ${currentPage === totalPages ? "disabled" : ""}`;
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.setAttribute("aria-label", "Next page");
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderBlogs();
        scrollToTop();
      }
    });
    paginationWrapper.appendChild(nextBtn);
  }

  function renderPopularPosts() {
    popularPostsList.innerHTML = "";
    // Display the first 3 posts as popular ones
    const popularPosts = blogPosts.slice(0, 3);

    popularPosts.forEach((post) => {
      const postItem = document.createElement("div");
      postItem.className = "popular-post-item";
      postItem.innerHTML = `
        <div class="popular-post-img-wrapper">
          <img src="${post.img}" alt="${post.title}" class="popular-post-img" />
        </div>
        <div class="popular-post-info">
          <a class="popular-post-title">${post.title}</a>
          <span class="popular-post-date">${post.dateFormatted}</span>
        </div>
      `;
      popularPostsList.appendChild(postItem);
    });
  }

  function scrollToTop() {
    const mainSection = document.querySelector("main");
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  // -------------------------------------------------------------
  // Event Listeners setup
  // -------------------------------------------------------------

  // Category Filtering
  categoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Update Active Styling
      categoryLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Update State
      currentCategory = link.dataset.category;
      currentTag = ""; // Reset tag filter on category switch
      currentPage = 1;

      // Reset Tag UI active state
      tagBadges.forEach((t) => t.classList.remove("active"));

      renderBlogs();
    });
  });

  // Tag Filtering
  tagBadges.forEach((badge) => {
    badge.addEventListener("click", (e) => {
      e.preventDefault();

      const selectedTag = badge.dataset.tag;

      if (currentTag === selectedTag) {
        // Toggle off
        currentTag = "";
        badge.classList.remove("active");
      } else {
        // Toggle on
        currentTag = selectedTag;
        tagBadges.forEach((t) => t.classList.remove("active"));
        badge.classList.add("active");
      }

      currentPage = 1;
      renderBlogs();
    });
  });

  // Sorting
  sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    currentPage = 1;
    renderBlogs();
  });

  // Search Submission
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    renderBlogs();
  });

  // Real-time search (optional, keyup with debouncing or just input)
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    currentPage = 1;
    renderBlogs();
  });

  // Redirect click on blog card title to 404 page
  if (blogGrid) {
    blogGrid.addEventListener("click", (e) => {
      const title = e.target.closest(".blog-card-title");
      if (title) {
        const getRootPrefixLocal = () => {
          if (typeof getRootPrefix === "function") {
            return getRootPrefix();
          }
          const depth = window.location.pathname.split("/pages/").length - 1;
          return depth > 0 ? "../".repeat(depth) : "";
        };
        const root = getRootPrefixLocal();
        window.location.href = (root || "") + "404.html";
      }
    });
  }

  // -------------------------------------------------------------
  // Initial Render
  // -------------------------------------------------------------
  renderPopularPosts();
  renderBlogs();
});
