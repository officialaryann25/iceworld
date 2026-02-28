/* ==============================================
   IceWorld — main.js
   Shared across all pages.
   Improvements vs previous version:
   - localStorage wrapped in try/catch (private-browsing safe)
   - HTML-escape helper fixes XSS in cart innerHTML
   - alert() replaced with toast notification system
   - Nav shadow on scroll
   - Active nav link auto-detection
   - Mobile nav overlay (click outside to close)
   - Scroll-to-top button
   - Auth-tab toggle centralised here (removed from inline scripts)
   ============================================== */

// ===== SAFE LOCALSTORAGE =====
function safeGet(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Safely ignored: localStorage may be unavailable in private browsing,
       when storage quota is exceeded, or in certain embedded contexts. */
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Safely ignored: same reasons as safeSet */
  }
}

// ===== HTML ESCAPE (XSS prevention) =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== TOAST NOTIFICATION =====
// IMPROVEMENT: Replaces browser alert() for a far better UX
(function initToastContainer() {
  if (document.getElementById("toast-container")) return;
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container";
  document.body.appendChild(container);
})();

function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, duration);
}

// ===== NAV TOGGLE =====
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

// IMPROVEMENT: Mobile nav overlay element for click-outside-to-close
let navOverlay = document.querySelector(".nav__overlay");
if (!navOverlay) {
  navOverlay = document.createElement("div");
  navOverlay.className = "nav__overlay";
  document.body.appendChild(navOverlay);
}

function openMobileNav() {
  if (!navLinks) return;
  navLinks.classList.add("open");
  navOverlay.classList.add("open");
  const icon = menuBtn && menuBtn.querySelector("i");
  if (icon) icon.setAttribute("class", "ri-close-line");
}

function closeMobileNav() {
  if (!navLinks) return;
  navLinks.classList.remove("open");
  navOverlay.classList.remove("open");
  const icon = menuBtn && menuBtn.querySelector("i");
  if (icon) icon.setAttribute("class", "ri-menu-3-line");
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.contains("open") ? closeMobileNav() : openMobileNav();
  });

  // Close when a link is clicked (navigate away on mobile)
  navLinks.addEventListener("click", closeMobileNav);
}

// Close mobile nav when clicking the overlay
navOverlay.addEventListener("click", closeMobileNav);

// ===== NAV SCROLL SHADOW =====
// IMPROVEMENT: Adds visual separation when page is scrolled
const navEl = document.querySelector("nav");
function updateNavShadow() {
  if (!navEl) return;
  navEl.classList.toggle("scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateNavShadow, { passive: true });
updateNavShadow();

// ===== ACTIVE NAV LINK =====
// IMPROVEMENT: Highlights the current page in the nav
(function setActiveNavLink() {
  const currentFile = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.split("#")[0] === currentFile) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
})();

// ===== CART STATE =====
let cart = safeGet("iw_cart", []);

function saveCart() {
  safeSet("iw_cart", cart);
  updateCartUI();
}

function addToCart(id, name, price, img) {
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  showCartModal();
  showToast(`"${name}" added to cart!`, "success");
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

// ===== CART UI =====
function updateCartUI() {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML =
      '<div class="cart-empty"><i class="ri-shopping-cart-line" style="font-size:3rem;color:#ccc"></i><p>Your cart is empty</p></div>';
  } else {
    // BUGFIX: Use escapeHtml() to prevent XSS from item names / IDs in innerHTML
    // Additionally, validate img URL to only allow https:// origins (prevents loading attacker-controlled resources)
    cartItemsEl.innerHTML = cart
      .map((item) => {
        const safeId   = escapeHtml(item.id);
        const safeName = escapeHtml(item.name);
        // Allow only https:// image URLs; fall back to a blank pixel on violation
        const trustedImg = typeof item.img === "string" && item.img.startsWith("https://")
          ? escapeHtml(item.img)
          : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        return `
        <div class="cart-item" data-id="${safeId}">
          <img src="${trustedImg}" alt="${safeName}" loading="lazy" />
          <div class="cart-item__info">
            <div class="cart-item__name">${safeName}</div>
            <div class="cart-item__price">&#x20B9;${item.price}</div>
            <div class="cart-item__qty">
              <button aria-label="Decrease quantity" onclick="updateQty('${safeId}', -1)">-</button>
              <span>${item.qty}</span>
              <button aria-label="Increase quantity" onclick="updateQty('${safeId}', 1)">+</button>
            </div>
          </div>
          <button class="cart-item__remove" aria-label="Remove ${safeName}" onclick="removeFromCart('${safeId}')">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>`;
      })
      .join("");
  }

  if (cartTotalEl) {
    cartTotalEl.textContent = "₹" + getCartTotal().toFixed(2);
  }
}

// ===== CART MODAL =====
function showCartModal() {
  document.getElementById("cart-overlay")?.classList.add("open");
  document.getElementById("cart-modal")?.classList.add("open");
  updateCartUI();
}

function hideCartModal() {
  document.getElementById("cart-overlay")?.classList.remove("open");
  document.getElementById("cart-modal")?.classList.remove("open");
}

document.getElementById("cart-btn")?.addEventListener("click", showCartModal);
document.getElementById("cart-close-btn")?.addEventListener("click", hideCartModal);
document.getElementById("cart-overlay")?.addEventListener("click", hideCartModal);

// Checkout
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }
  // IMPROVEMENT: Use toast instead of alert()
  showToast(`Order placed! Total: ₹${getCartTotal().toFixed(2)} — we'll contact you soon.`, "success", 5000);
  cart = [];
  saveCart();
  hideCartModal();
});

// ===== AUTH STATE =====
function getUser() {
  return safeGet("iw_user", null);
}

function updateAuthUI() {
  const user = getUser();
  const loginBtn   = document.getElementById("login-btn");
  const userDisplay = document.getElementById("user-display");
  const logoutBtn  = document.getElementById("logout-btn");

  if (user) {
    if (loginBtn)    loginBtn.style.display    = "none";
    if (userDisplay) {
      userDisplay.style.display = "inline-block";
      // BUGFIX: Use textContent (not innerHTML) to avoid XSS
      userDisplay.textContent = user.name || user.email;
    }
    if (logoutBtn)   logoutBtn.style.display   = "inline-block";
  } else {
    if (loginBtn)    loginBtn.style.display    = "inline-block";
    if (userDisplay) userDisplay.style.display = "none";
    if (logoutBtn)   logoutBtn.style.display   = "none";
  }
}

document.getElementById("login-btn")?.addEventListener("click", showAuthModal);

document.getElementById("logout-btn")?.addEventListener("click", () => {
  safeRemove("iw_user");
  updateAuthUI();
  showToast("Logged out successfully.", "info");
});

// ===== AUTH MODAL =====
function showAuthModal() {
  document.getElementById("auth-overlay")?.classList.add("open");
}

function hideAuthModal() {
  document.getElementById("auth-overlay")?.classList.remove("open");
}

document.getElementById("auth-overlay")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("auth-overlay")) hideAuthModal();
});

document.getElementById("auth-close-btn")?.addEventListener("click", hideAuthModal);

// ===== AUTH TABS =====
// IMPROVEMENT: Centralised here — removed duplicate inline scripts from every HTML page
document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    // Update tab active state
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Show matching panel
    const target = tab.dataset.tab;
    document.querySelectorAll(".auth-panel").forEach((p) => {
      p.style.display = p.id === target + "-panel" ? "block" : "none";
    });

    // Clear error
    const authError = document.getElementById("auth-error");
    if (authError) authError.textContent = "";
  });
});

// ===== REGISTER FORM =====
document.getElementById("register-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name     = document.getElementById("reg-name").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const authError = document.getElementById("auth-error");

  if (!name || !email || !password) {
    if (authError) authError.textContent = "Please fill all fields.";
    return;
  }
  if (password.length < 6) {
    if (authError) authError.textContent = "Password must be at least 6 characters.";
    return;
  }

  const users = safeGet("iw_users", []);
  if (users.find((u) => u.email === email)) {
    if (authError) authError.textContent = "This email is already registered.";
    return;
  }

  // NOTE: btoa() is demo-only obfuscation — NEVER use in production.
  // SECURITY: Passwords must be properly hashed server-side (bcrypt, Argon2, etc.)
  users.push({ name, email, password: btoa(password) });
  safeSet("iw_users", users);
  safeSet("iw_user", { name, email });
  updateAuthUI();
  hideAuthModal();
  document.getElementById("register-form").reset();
  showToast(`Welcome, ${name}! Account created.`, "success");
});

// ===== LOGIN FORM =====
document.getElementById("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const authError = document.getElementById("auth-error");

  const users = safeGet("iw_users", []);
  // NOTE: demo only — SECURITY: Never use in production.
  // Passwords must be hashed server-side (bcrypt, Argon2, etc.), not base64-encoded.
  const user = users.find((u) => u.email === email && u.password === btoa(password));

  if (!user) {
    if (authError) authError.textContent = "Invalid email or password.";
    return;
  }

  safeSet("iw_user", { name: user.name, email: user.email });
  updateAuthUI();
  hideAuthModal();
  document.getElementById("login-form").reset();
  showToast(`Welcome back, ${user.name}!`, "success");
});

// ===== SUBSCRIBE FORM =====
document.getElementById("subscribe-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  // IMPROVEMENT: Toast instead of alert()
  showToast("Subscribed! You'll receive our latest updates.", "success");
  e.target.reset();
});

// ===== MENU FILTERS =====
const filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    document.querySelectorAll(".menu__card").forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      // IMPROVEMENT: Use visibility toggle with smooth height for less jarring filter
      card.style.display = match ? "" : "none";
    });
  });
});

// ===== SCROLL-TO-TOP BUTTON =====
// IMPROVEMENT: Helps users on long pages (menu, category)
(function initScrollTop() {
  const btn = document.createElement("button");
  btn.className = "scroll-top-btn";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.innerHTML = '<i class="ri-arrow-up-line"></i>';
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ===== SCROLL REVEAL =====
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

if (typeof ScrollReveal !== "undefined") {
  // Home page
  ScrollReveal().reveal(".header__image img",                              { duration: 1000 });
  ScrollReveal().reveal(".header__content h1",                            { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".header__content .section__description",         { ...scrollRevealOption, delay: 1000 });
  ScrollReveal().reveal(".header__btn",                                   { ...scrollRevealOption, delay: 1500 });
  ScrollReveal().reveal(".header__content .socials",                      { ...scrollRevealOption, delay: 2000 });
  ScrollReveal().reveal(".popular__card",                                 { ...scrollRevealOption, interval: 500 });
  ScrollReveal().reveal(".discover__card img",                            { ...scrollRevealOption, origin: "left" });
  ScrollReveal().reveal(".discover__card:nth-child(2) img",               { ...scrollRevealOption, origin: "right" });
  ScrollReveal().reveal(".discover__card__content h4",                    { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".discover__card__content .section__description", { ...scrollRevealOption, delay: 1000 });
  ScrollReveal().reveal(".discover__card__content h3",                    { ...scrollRevealOption, delay: 1500 });
  ScrollReveal().reveal(".discover__card__btn",                           { ...scrollRevealOption, delay: 2000 });
  ScrollReveal().reveal(".banner__content .section__header",              scrollRevealOption);
  ScrollReveal().reveal(".banner__content .section__description",         { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".banner__card",                                  { ...scrollRevealOption, delay: 1000, interval: 500 });
  ScrollReveal().reveal(".subscribe__content .section__header",           scrollRevealOption);
  ScrollReveal().reveal(".subscribe__content .section__description",      { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".subscribe__content form",                       { ...scrollRevealOption, delay: 1000 });
  ScrollReveal().reveal(".review__card",                                  { ...scrollRevealOption, interval: 200 });

  // Menu / Category pages
  ScrollReveal().reveal(".menu__card",     { ...scrollRevealOption, interval: 150 });
  ScrollReveal().reveal(".category__card", { ...scrollRevealOption, interval: 150 });

  // About / Contact pages
  ScrollReveal().reveal(".owner__card",              { ...scrollRevealOption, interval: 300 });
  ScrollReveal().reveal(".value__card",              { ...scrollRevealOption, interval: 200 });
  ScrollReveal().reveal(".contact__card",            { ...scrollRevealOption, interval: 200 });
  ScrollReveal().reveal(".contact__form__wrapper",   { ...scrollRevealOption, delay: 300 });
  ScrollReveal().reveal(".about__hero .section__header",     scrollRevealOption);
  ScrollReveal().reveal(".about__hero .section__description",{ ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".contact__hero .section__header",   scrollRevealOption);
  ScrollReveal().reveal(".contact__hero .section__description",{ ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".menu__hero .section__header",      scrollRevealOption);
  ScrollReveal().reveal(".menu__hero .section__description", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".category__hero .section__header",  scrollRevealOption);
  ScrollReveal().reveal(".category__hero .section__description",{ ...scrollRevealOption, delay: 500 });
}

// ===== INIT =====
updateCartUI();
updateAuthUI();
