// Contact Page Interactivity & Form Validation

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-us-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  const subjectInput = document.getElementById("contact-subject");
  const messageInput = document.getElementById("contact-message");
  const successMsg = document.getElementById("form-success-msg");

  if (!contactForm) return;

  // 1. Restrict Name Field: Prevent typing of numbers or special characters.
  // Allow only letters (a-z, A-Z) and spaces.
  nameInput.addEventListener("keypress", (e) => {
    // Control keys such as backspace, delete, tab, enter, arrow keys have charCode 0
    if (e.charCode === 0) return;

    const char = String.fromCharCode(e.charCode || e.keyCode);
    if (!/^[a-zA-Z\s]$/.test(char)) {
      e.preventDefault();
    }
  });

  // Sanitize name input value on input event to handle copy-paste and virtual keyboards
  nameInput.addEventListener("input", function () {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const originalValue = this.value;
    const sanitizedValue = originalValue.replace(/[^a-zA-Z\s]/g, "");

    if (originalValue !== sanitizedValue) {
      this.value = sanitizedValue;
      // Maintain cursor position
      this.setSelectionRange(
        start - (originalValue.length - sanitizedValue.length),
        end - (originalValue.length - sanitizedValue.length),
      );
    }
  });

  // 2. Restrict Phone Field: Prevent typing of alphabets or special characters.
  // Allow only digits (0-9).
  phoneInput.addEventListener("keypress", (e) => {
    // Control keys such as backspace, delete, tab, enter, arrow keys have charCode 0
    if (e.charCode === 0) return;

    const char = String.fromCharCode(e.charCode || e.keyCode);
    if (!/^[0-9]$/.test(char)) {
      e.preventDefault();
    }
  });

  // Sanitize phone input value on input event to handle copy-paste and virtual keyboards
  phoneInput.addEventListener("input", function () {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const originalValue = this.value;
    const sanitizedValue = originalValue.replace(/[^0-9]/g, "");

    if (originalValue !== sanitizedValue) {
      this.value = sanitizedValue;
      // Maintain cursor position
      this.setSelectionRange(
        start - (originalValue.length - sanitizedValue.length),
        end - (originalValue.length - sanitizedValue.length),
      );
    }
  });

  // 3. Form Submission Handling
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Reset success message
    successMsg.style.display = "none";

    // Validate fields programmatically (all are required)
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const subject = subjectInput.value;
    const message = messageInput.value.trim();

    if (!name || !email || !phone || !subject || !message) {
      alert("Please fill out all required fields.");
      return;
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    // Phone length validation (standard 10-15 digits for contact)
    if (phone.length < 8) {
      alert("Please enter a valid phone number (at least 8 digits).");
      phoneInput.focus();
      return;
    }

    // Mock API Success Action
    successMsg.style.display = "flex";
    successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Reset form after a small delay
    setTimeout(() => {
      contactForm.reset();
    }, 500);

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 6000);
  });
});
