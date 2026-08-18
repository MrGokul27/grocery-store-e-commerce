document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  const roleInput = document.getElementById("user-role");
  const emailInput = document.getElementById("user-email");
  const passwordInput = document.getElementById("user-password");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const togglePasswordIcon = document.getElementById("toggle-password-icon");
  const googleBtn =
    document.getElementById("google-login-btn") ||
    document.getElementById("google-signup-btn");

  // Error Feedback Placeholders
  const roleError = document.getElementById("role-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  // Register specific fields
  const nameInput = document.getElementById("user-name");
  const nameError = document.getElementById("name-error");
  const confirmPasswordInput = document.getElementById("user-confirm-password");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error",
  );
  const toggleConfirmPasswordBtn = document.getElementById(
    "toggle-confirm-password",
  );
  const toggleConfirmPasswordIcon = document.getElementById(
    "toggle-confirm-password-icon",
  );
  const termsInput = document.getElementById("terms-agree");
  const termsError = document.getElementById("terms-error");

  // Password Strength elements
  const strengthContainer = document.getElementById(
    "password-strength-container",
  );
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");
  const reqLength = document.getElementById("req-length");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  // Set Error State
  function showError(input, errorEl, message) {
    if (!input || !errorEl) return;
    input.classList.add("is-invalid");
    if (input.parentElement) {
      input.parentElement.classList.add("is-invalid-wrapper");
    }
    errorEl.textContent = message;
    errorEl.classList.add("visible");
  }

  // Clear Error State
  function clearError(input, errorEl) {
    if (!input || !errorEl) return;
    input.classList.remove("is-invalid");
    if (input.parentElement) {
      input.parentElement.classList.remove("is-invalid-wrapper");
    }
    errorEl.textContent = "";
    errorEl.classList.remove("visible");
  }

  // Validate Email Syntax
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Update validation status icon
  function setRequirementValid(el, isValid) {
    if (!el) return;
    const icon = el.querySelector(".status-icon");
    if (isValid) {
      el.classList.remove("invalid");
      el.classList.add("valid");
      if (icon) {
        icon.className = "fa-solid fa-circle-check status-icon";
      }
    } else {
      el.classList.remove("valid");
      el.classList.add("invalid");
      if (icon) {
        icon.className = "fa-solid fa-circle-xmark status-icon";
      }
    }
  }

  // Check Password Strength
  function checkPasswordStrength(password) {
    let score = 0;

    // Requirement 1: Min 8 chars
    const hasMinLength = password.length >= 8;
    if (hasMinLength) score++;

    // Requirement 2: Has a number
    const hasNumber = /[0-9]/.test(password);
    if (hasNumber) score++;

    // Requirement 3: Has a letter or special char
    const hasLetterOrSpecial = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasLetterOrSpecial) score++;

    return {
      score,
      hasMinLength,
      hasNumber,
      hasLetterOrSpecial,
    };
  }

  // Password Matching Real-time check
  function validatePasswordsMatch() {
    if (!confirmPasswordInput || !passwordInput) return true;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
      clearError(confirmPasswordInput, confirmPasswordError);
      return false;
    }

    if (password !== confirmPassword) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Passwords do not match.",
      );
      return false;
    } else {
      clearError(confirmPasswordInput, confirmPasswordError);
      return true;
    }
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================

  // 1. Password Visibility Toggle
  if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Update eye icon class
      if (type === "text") {
        togglePasswordIcon.className = "fa-regular fa-eye-slash";
      } else {
        togglePasswordIcon.className = "fa-regular fa-eye";
      }
    });
  }

  // Confirm Password Visibility Toggle
  if (
    toggleConfirmPasswordBtn &&
    confirmPasswordInput &&
    toggleConfirmPasswordIcon
  ) {
    toggleConfirmPasswordBtn.addEventListener("click", () => {
      const type =
        confirmPasswordInput.getAttribute("type") === "password"
          ? "text"
          : "password";
      confirmPasswordInput.setAttribute("type", type);

      // Update eye icon class
      if (type === "text") {
        toggleConfirmPasswordIcon.className = "fa-regular fa-eye-slash";
      } else {
        toggleConfirmPasswordIcon.className = "fa-regular fa-eye";
      }
    });
  }

  // 2. Real-Time Role Field Validation
  if (roleInput) {
    roleInput.addEventListener("change", () => {
      if (roleInput.value) {
        clearError(roleInput, roleError);
      }
    });
  }

  // 3. Real-Time Email Validation
  if (emailInput) {
    emailInput.addEventListener("input", () => {
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        showError(emailInput, emailError, "Email address is required.");
      } else if (!isValidEmail(emailVal)) {
        showError(
          emailInput,
          emailError,
          "Please enter a valid email address.",
        );
      } else {
        clearError(emailInput, emailError);
      }
    });
  }

  // 4. Real-Time Password Validation & Strength Checker
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const password = passwordInput.value;

      // Handle empty inputs
      if (password === "") {
        if (strengthContainer) strengthContainer.classList.add("hidden");
        clearError(passwordInput, passwordError);
        return;
      }

      // Show indicator
      if (strengthContainer) strengthContainer.classList.remove("hidden");

      // Compute current strength score
      const strength = checkPasswordStrength(password);

      // Update checks list UI
      setRequirementValid(reqLength, strength.hasMinLength);
      setRequirementValid(reqNumber, strength.hasNumber);
      setRequirementValid(reqSpecial, strength.hasLetterOrSpecial);

      if (strengthBar && strengthText) {
        // Clean old states classes
        strengthBar.className = "strength-bar";
        strengthText.className = "strength-text";

        // Apply styling states based on security scores
        if (password.length < 6 || strength.score <= 1) {
          strengthBar.classList.add("weak");
          strengthText.textContent = "Weak";
          strengthText.classList.add("weak");
        } else if (strength.score === 2) {
          strengthBar.classList.add("medium");
          strengthText.textContent = "Medium";
          strengthText.classList.add("medium");
        } else if (strength.score === 3) {
          strengthBar.classList.add("strong");
          strengthText.textContent = "Strong";
          strengthText.classList.add("strong");
        }
      }

      // Automatically clear validation red borders if they start satisfying requirements
      if (strength.hasMinLength && strength.score >= 2) {
        clearError(passwordInput, passwordError);
      }

      // Validate matching in real-time
      if (confirmPasswordInput && confirmPasswordInput.value) {
        validatePasswordsMatch();
      }
    });
  }

  // Confirm Password Real-Time Match Check
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", validatePasswordsMatch);
  }

  // Username Input Restriction: prevent numbers or special characters in the field itself
  if (nameInput) {
    nameInput.addEventListener("keypress", (e) => {
      // Allow only letters and spaces (prevent keypress of numbers or special characters)
      const regex = /^[a-zA-Z\s]$/;
      if (!regex.test(e.key)) {
        e.preventDefault();
      }
    });

    nameInput.addEventListener("input", () => {
      // Also filter out any numbers or special characters that could be pasted/autocompleted
      nameInput.value = nameInput.value.replace(/[^a-zA-Z\s]/g, "");

      if (nameInput.value.trim()) {
        clearError(nameInput, nameError);
      } else {
        showError(nameInput, nameError, "Full Name is required.");
      }
    });
  }

  // Terms and Privacy Checkbox Handler
  if (termsInput) {
    termsInput.addEventListener("change", () => {
      if (termsInput.checked) {
        clearError(termsInput, termsError);
      }
    });
  }

  // Remember Me Checkbox validation handler
  const rememberMeInput = document.getElementById("remember-me");
  const rememberMeError = document.getElementById("remember-me-error");
  if (rememberMeInput && rememberMeError) {
    rememberMeInput.addEventListener("change", () => {
      if (rememberMeInput.checked) {
        clearError(rememberMeInput, rememberMeError);
      }
    });
  }

  // 5. Form Submit Validation & Handlers for Login Form
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let isFormValid = true;

      // Validate Role Selector
      if (!roleInput.value) {
        showError(roleInput, roleError, "Please select a login role.");
        isFormValid = false;
      } else {
        clearError(roleInput, roleError);
      }

      // Validate Email field
      const emailValue = emailInput.value.trim();
      if (!emailValue) {
        showError(emailInput, emailError, "Email address is required.");
        isFormValid = false;
      } else if (!isValidEmail(emailValue)) {
        showError(
          emailInput,
          emailError,
          "Please enter a valid email address.",
        );
        isFormValid = false;
      } else {
        clearError(emailInput, emailError);
      }

      // Validate Password field and Weak password check
      const passwordValue = passwordInput.value;
      if (!passwordValue) {
        showError(passwordInput, passwordError, "Password is required.");
        isFormValid = false;
      } else {
        const strength = checkPasswordStrength(passwordValue);

        // Strict Validation rule: Block if length is < 8 or strength is Weak
        if (passwordValue.length < 8) {
          showError(
            passwordInput,
            passwordError,
            "Password must be at least 8 characters long.",
          );
          isFormValid = false;
        } else if (strength.score <= 1) {
          showError(
            passwordInput,
            passwordError,
            "Your password is too weak. Please add numbers or special characters.",
          );
          isFormValid = false;
        } else {
          clearError(passwordInput, passwordError);
        }
      }

      // Validate Remember Me checkbox
      const rememberMeInput = document.getElementById("remember-me");
      const rememberMeError = document.getElementById("remember-me-error");
      if (rememberMeInput && !rememberMeInput.checked) {
        showError(
          rememberMeInput,
          rememberMeError,
          "You must check Remember Me to proceed.",
        );
        isFormValid = false;
      } else if (rememberMeInput) {
        clearError(rememberMeInput, rememberMeError);
      }

      // Execute login redirection or action if validation passes
      if (isFormValid) {
        const selectedRoleText =
          roleInput.options[roleInput.selectedIndex].text.split(" (")[0];

        // Save login details to localStorage
        localStorage.setItem("userRole", roleInput.value);
        localStorage.setItem("userEmail", emailValue);
        localStorage.setItem("userPassword", passwordValue);
        localStorage.setItem(
          "rememberMe",
          document.getElementById("remember-me")
            ? document.getElementById("remember-me").checked
            : false,
        );
        localStorage.setItem("userLoggedIn", "true");

        // Create premium login feedback modal or prompt
        const submitBtn = document.getElementById("login-submit-btn");
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1200);
      }
    });
  }

  // 6. Form Submit Validation & Handlers for Register Form
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let isFormValid = true;

      // Validate Full Name
      const nameValue = nameInput.value.trim();
      if (!nameValue) {
        showError(nameInput, nameError, "Full Name is required.");
        isFormValid = false;
      } else {
        clearError(nameInput, nameError);
      }

      // Validate Email field
      const emailValue = emailInput.value.trim();
      if (!emailValue) {
        showError(emailInput, emailError, "Email address is required.");
        isFormValid = false;
      } else if (!isValidEmail(emailValue)) {
        showError(
          emailInput,
          emailError,
          "Please enter a valid email address.",
        );
        isFormValid = false;
      } else {
        clearError(emailInput, emailError);
      }

      // Validate Role Selector
      if (!roleInput.value) {
        showError(roleInput, roleError, "Please select a registration role.");
        isFormValid = false;
      } else {
        clearError(roleInput, roleError);
      }

      // Validate Password field and Weak password check
      const passwordValue = passwordInput.value;
      if (!passwordValue) {
        showError(passwordInput, passwordError, "Password is required.");
        isFormValid = false;
      } else {
        const strength = checkPasswordStrength(passwordValue);

        // Strict Validation rule: Block if length is < 8 or strength is Weak
        if (passwordValue.length < 8) {
          showError(
            passwordInput,
            passwordError,
            "Password must be at least 8 characters long.",
          );
          isFormValid = false;
        } else if (strength.score <= 1) {
          showError(
            passwordInput,
            passwordError,
            "Your password is too weak. Please add numbers or special characters.",
          );
          isFormValid = false;
        } else {
          clearError(passwordInput, passwordError);
        }
      }

      // Validate Confirm Password field
      const confirmPasswordValue = confirmPasswordInput.value;
      if (!confirmPasswordValue) {
        showError(
          confirmPasswordInput,
          confirmPasswordError,
          "Please confirm your password.",
        );
        isFormValid = false;
      } else if (passwordValue !== confirmPasswordValue) {
        showError(
          confirmPasswordInput,
          confirmPasswordError,
          "Passwords do not match.",
        );
        isFormValid = false;
      }

      // Validate Terms and Privacy checkbox
      if (termsInput && !termsInput.checked) {
        showError(
          termsInput,
          termsError,
          "You must agree to the Terms and Privacy policy.",
        );
        isFormValid = false;
      } else if (termsInput) {
        clearError(termsInput, termsError);
      }

      // Execute register redirection if validation passes
      if (isFormValid) {
        localStorage.setItem("userName", nameValue);
        const submitBtn = document.getElementById("register-submit-btn");
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      }
    });
  }

  // 7. Google Sign In feedback
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      googleBtn.disabled = true;
      const isSignup = googleBtn.id === "google-signup-btn";
      googleBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Connecting to Google...`;

      if (!isSignup) {
        localStorage.setItem("userRole", "customer");
        localStorage.setItem("userEmail", "googleuser@gmail.com");
        localStorage.setItem("userPassword", "GoogleOAuth2026!");
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("userLoggedIn", "true");
      }

      setTimeout(() => {
        window.location.href = "../404.html";
      }, 1500);
    });
  }

  initScrollAnimations();
});

// =============================================================
// --- Scroll Animations System ---
// =============================================================
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -80px 0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const setupAutoReveal = (rootEl) => {
    rootEl.querySelectorAll(".reveal-children-fade-up").forEach((grid) => {
      Array.from(grid.children).forEach((child, index) => {
        if (!child.classList.contains("reveal-on-scroll")) {
          child.classList.add("reveal-on-scroll", "fade-up");
          const colCount = parseInt(grid.getAttribute("data-cols")) || 4;
          const colIndex = index % colCount;
          child.classList.add("delay-" + (colIndex + 1) * 100);
        }
      });
    });
  };

  // Helper to observe element and its children
  const observeNewElements = (rootEl) => {
    setupAutoReveal(rootEl);
    const targets = rootEl.querySelectorAll(".reveal-on-scroll");
    targets.forEach((el) => {
      if (!el.classList.contains("is-visible")) {
        observer.observe(el);
      }
    });
  };

  // Initial load observation
  observeNewElements(document);

  // MutationObserver to watch for dynamically loaded grid items/cards
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList.contains("reveal-on-scroll")) {
            observer.observe(node);
          }
          observeNewElements(node);
        }
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
