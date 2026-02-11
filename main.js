// Mobile Menu Toggle
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// Close mobile menu when a link is clicked
if (navLinks) {
  const links = navLinks.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// ScrollReveal Animations
if (typeof ScrollReveal !== 'undefined') {
  const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
  };

  // Header animations
  ScrollReveal().reveal(".header__content h1", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".header__content .section__description", {
    ...scrollRevealOption,
    delay: 500,
  });

  ScrollReveal().reveal(".header__content .btn", {
    ...scrollRevealOption,
    delay: 1000,
  });

  ScrollReveal().reveal(".header__image", {
    ...scrollRevealOption,
    delay: 1500,
  });

  // Menu section animations
  ScrollReveal().reveal(".menu__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  // Categories section animations
  ScrollReveal().reveal(".category__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  // Banner section animations
  ScrollReveal().reveal(".banner__content", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".banner__image", {
    ...scrollRevealOption,
    delay: 500,
  });

  // Subscribe section animations
  ScrollReveal().reveal(".subscribe__container .section__header", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".subscribe__form", {
    ...scrollRevealOption,
    delay: 500,
  });

  // About page animations
  ScrollReveal().reveal(".about__hero .section__header", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".about__hero .section__description", {
    ...scrollRevealOption,
    delay: 500,
  });

  ScrollReveal().reveal(".about__content", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".owner__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  ScrollReveal().reveal(".value__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  // Contact page animations
  ScrollReveal().reveal(".contact__hero .section__header", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".contact__hero .section__description", {
    ...scrollRevealOption,
    delay: 500,
  });

  ScrollReveal().reveal(".contact__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  ScrollReveal().reveal(".contact__form__wrapper", {
    ...scrollRevealOption,
    delay: 300,
  });

  // Menu page animations
  ScrollReveal().reveal(".menu__hero .section__header", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".menu__filters", {
    ...scrollRevealOption,
    delay: 500,
  });

  // Gallery page animations
  ScrollReveal().reveal(".gallery__hero .section__header", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".gallery__item", {
    ...scrollRevealOption,
    interval: 150,
  });
}

// Subscribe Form Handler
const subscribeForm = document.getElementById("subscribeForm");
if (subscribeForm) {
  subscribeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById("subscribeEmail");
    const email = emailInput.value.trim();
    const successMessage = document.getElementById("subscribeSuccess");
    const errorMessage = document.getElementById("subscribeError");
    
    // Reset messages
    if (successMessage) successMessage.classList.remove("show");
    if (errorMessage) errorMessage.classList.remove("show");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (errorMessage) {
        errorMessage.textContent = "Please enter a valid email address.";
        errorMessage.classList.add("show");
      }
      return;
    }
    
    // Show success message
    if (successMessage) {
      successMessage.textContent = `Thank you for subscribing! We'll send updates to ${email}`;
      successMessage.classList.add("show");
    }
    
    // Reset form
    subscribeForm.reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      if (successMessage) successMessage.classList.remove("show");
    }, 5000);
  });
}

// Contact Form Handler
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject")?.value.trim() || "";
    const message = document.getElementById("message").value.trim();
    
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !phone || !message) {
      alert("Please fill in all required fields.");
      return;
    }
    
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    // Show success message
    alert(`Thank you for contacting us, ${name}! We will get back to you soon at ${email}.`);
    
    // Reset form
    contactForm.reset();
  });
}

// Shopping Cart Button Handler
const cartButtons = document.querySelectorAll(".nav__btns .btn:has(.ri-shopping-cart-line)");
cartButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "contact.html";
  });
});

// Notification Button Handler
const notificationButtons = document.querySelectorAll(".nav__btns .btn:has(.ri-notification-3-fill)");
notificationButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("No new notifications at the moment!");
  });
});

// Buy Now Buttons Handler
const buyNowButtons = document.querySelectorAll(".menu__card .btn, .buy-now-btn");
buyNowButtons.forEach((btn) => {
  if (!btn.classList.contains("filter__btn")) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".menu__card");
      if (card) {
        const productName = card.querySelector("h4")?.textContent || "Ice Cream";
        const productPrice = card.querySelector(".price")?.textContent || "";
        
        // Store product info in session storage
        sessionStorage.setItem("selectedProduct", productName);
        sessionStorage.setItem("selectedPrice", productPrice);
      }
      window.location.href = "contact.html";
    });
  }
});

// Pre-fill contact form if product was selected
if (window.location.pathname.includes("contact.html")) {
  const selectedProduct = sessionStorage.getItem("selectedProduct");
  const selectedPrice = sessionStorage.getItem("selectedPrice");
  
  if (selectedProduct) {
    const subjectField = document.getElementById("subject");
    const messageField = document.getElementById("message");
    
    if (subjectField && !subjectField.value) {
      subjectField.value = `Inquiry about ${selectedProduct}`;
    }
    
    if (messageField && !messageField.value) {
      messageField.value = `Hi, I am interested in ordering ${selectedProduct} (${selectedPrice}). Please provide more information.`;
    }
    
    // Clear session storage
    sessionStorage.removeItem("selectedProduct");
    sessionStorage.removeItem("selectedPrice");
  }
}

// Menu Filter Functionality
const filterButtons = document.querySelectorAll(".filter__btn");
const menuCards = document.querySelectorAll(".menu__card");

if (filterButtons.length > 0 && menuCards.length > 0) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      btn.classList.add("active");
      
      const filter = btn.getAttribute("data-filter");
      
      menuCards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
  
  // Set first filter as active by default
  if (filterButtons[0]) {
    filterButtons[0].classList.add("active");
  }
}

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#" && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
});

// Social Media Links Handler
document.querySelectorAll('.socials a[href="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const icon = link.querySelector("i");
    let platform = "social media";
    
    if (icon) {
      if (icon.classList.contains("ri-facebook-fill")) platform = "Facebook";
      else if (icon.classList.contains("ri-twitter-fill")) platform = "Twitter";
      else if (icon.classList.contains("ri-pinterest-line")) platform = "Pinterest";
      else if (icon.classList.contains("ri-phone-fill")) platform = "Phone";
    }
    
    if (platform === "Phone") {
      window.location.href = "tel:+918750141860";
    } else {
      alert(`Visit our ${platform} page for more updates! (Link to be added)`);
    }
  });
});
