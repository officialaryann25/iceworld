// ===== NAV TOGGLE =====
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
  const menuBtnIcon = menuBtn.querySelector("i");

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-3-line");
  });

  navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-3-line");
  });
}

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem("iw_cart") || "[]");

function saveCart() {
  localStorage.setItem("iw_cart", JSON.stringify(cart));
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
  // Badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  // Cart items list
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="cart-empty"><i class="ri-shopping-cart-line" style="font-size:3rem;color:#ccc"></i><p>Your cart is empty</p></div>';
  } else {
    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}" />
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">₹${item.price}</div>
          <div class="cart-item__qty">
            <button onclick="updateQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart('${item.id}')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>`
      )
      .join("");
  }

  if (cartTotalEl) {
    cartTotalEl.textContent = "₹" + getCartTotal().toFixed(2);
  }
}

// ===== CART MODAL =====
function showCartModal() {
  const overlay = document.getElementById("cart-overlay");
  const modal = document.getElementById("cart-modal");
  if (overlay) overlay.classList.add("open");
  if (modal) modal.classList.add("open");
  updateCartUI();
}

function hideCartModal() {
  const overlay = document.getElementById("cart-overlay");
  const modal = document.getElementById("cart-modal");
  if (overlay) overlay.classList.remove("open");
  if (modal) modal.classList.remove("open");
}

// Bind cart button in nav
const cartBtn = document.getElementById("cart-btn");
if (cartBtn) {
  cartBtn.addEventListener("click", showCartModal);
}

const cartCloseBtn = document.getElementById("cart-close-btn");
if (cartCloseBtn) {
  cartCloseBtn.addEventListener("click", hideCartModal);
}

const cartOverlay = document.getElementById("cart-overlay");
if (cartOverlay) {
  cartOverlay.addEventListener("click", hideCartModal);
}

// Checkout
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    alert("Thank you for your order! Total: ₹" + getCartTotal().toFixed(2) + "\nWe will contact you soon.");
    cart = [];
    saveCart();
    hideCartModal();
  });
}

// ===== AUTH STATE =====
function getUser() {
  const u = localStorage.getItem("iw_user");
  return u ? JSON.parse(u) : null;
}

function updateAuthUI() {
  const user = getUser();
  const loginBtn = document.getElementById("login-btn");
  const userDisplay = document.getElementById("user-display");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (userDisplay) {
      userDisplay.style.display = "inline-block";
      userDisplay.textContent = user.name || user.email;
    }
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (userDisplay) userDisplay.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

// Login btn opens modal
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", showAuthModal);
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("iw_user");
    updateAuthUI();
  });
}

// ===== AUTH MODAL =====
function showAuthModal() {
  const overlay = document.getElementById("auth-overlay");
  if (overlay) overlay.classList.add("open");
}

function hideAuthModal() {
  const overlay = document.getElementById("auth-overlay");
  if (overlay) overlay.classList.remove("open");
}

const authOverlay = document.getElementById("auth-overlay");
if (authOverlay) {
  authOverlay.addEventListener("click", (e) => {
    if (e.target === authOverlay) hideAuthModal();
  });
}

const authCloseBtn = document.getElementById("auth-close-btn");
if (authCloseBtn) {
  authCloseBtn.addEventListener("click", hideAuthModal);
}

// Auth tabs
const authTabs = document.querySelectorAll(".auth-tab");
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    authTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.querySelectorAll(".auth-panel").forEach((p) => p.classList.remove("active"));
    const panel = document.getElementById(target + "-panel");
    if (panel) panel.classList.add("active");
    const authError = document.getElementById("auth-error");
    if (authError) authError.textContent = "";
  });
});

// Register form
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
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

    const users = JSON.parse(localStorage.getItem("iw_users") || "[]");
    if (users.find((u) => u.email === email)) {
      if (authError) authError.textContent = "Email already registered.";
      return;
    }

    users.push({ name, email, password: btoa(password) }); // NOTE: demo only — not production-safe
    localStorage.setItem("iw_users", JSON.stringify(users));
    localStorage.setItem("iw_user", JSON.stringify({ name, email }));
    updateAuthUI();
    hideAuthModal();
    registerForm.reset();
  });
}

// Login form
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const authError = document.getElementById("auth-error");

    const users = JSON.parse(localStorage.getItem("iw_users") || "[]");
    // NOTE: demo only — passwords are base64-encoded for obfuscation, not production-safe hashing
    const user = users.find((u) => u.email === email && u.password === btoa(password));

    if (!user) {
      if (authError) authError.textContent = "Invalid email or password.";
      return;
    }

    localStorage.setItem("iw_user", JSON.stringify({ name: user.name, email: user.email }));
    updateAuthUI();
    hideAuthModal();
    loginForm.reset();
  });
}

// ===== MENU FILTERS =====
const filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    document.querySelectorAll(".menu__card").forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// ===== SCROLL REVEAL =====
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

if (typeof ScrollReveal !== "undefined") {
  // Home page
  ScrollReveal().reveal(".header__image img", { duration: 1000 });
  ScrollReveal().reveal(".header__content h1", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".header__content .section__description", { ...scrollRevealOption, delay: 1000 });
  ScrollReveal().reveal(".header__btn", { ...scrollRevealOption, delay: 1500 });
  ScrollReveal().reveal(".header__content .socials", { ...scrollRevealOption, delay: 2000 });
  ScrollReveal().reveal(".popular__card", { ...scrollRevealOption, interval: 500 });
  ScrollReveal().reveal(".discover__card img", { ...scrollRevealOption, origin: "left" });
  ScrollReveal().reveal(".discover__card:nth-child(2) img", { ...scrollRevealOption, origin: "right" });
  ScrollReveal().reveal(".discover__card__content h4", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".discover__card__content .section__description", { ...scrollRevealOption, delay: 1000 });
  ScrollReveal().reveal(".discover__card__content h3", { ...scrollRevealOption, delay: 1500 });
  ScrollReveal().reveal(".discover__card__btn", { ...scrollRevealOption, delay: 2000 });
  ScrollReveal().reveal(".banner__content .section__header", scrollRevealOption);
  ScrollReveal().reveal(".banner__content .section__description", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".banner__card", { ...scrollRevealOption, delay: 1000, interval: 500 });
  ScrollReveal().reveal(".subscribe__content .section__header", scrollRevealOption);
  ScrollReveal().reveal(".subscribe__content .section__description", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".subscribe__content form", { ...scrollRevealOption, delay: 1000 });
  ScrollReveal().reveal(".review__card", { ...scrollRevealOption, interval: 200 });

  // Menu/Category pages
  ScrollReveal().reveal(".menu__card", { ...scrollRevealOption, interval: 150 });
  ScrollReveal().reveal(".category__card", { ...scrollRevealOption, interval: 150 });

  // About/Contact
  ScrollReveal().reveal(".owner__card", { ...scrollRevealOption, interval: 300 });
  ScrollReveal().reveal(".value__card", { ...scrollRevealOption, interval: 200 });
  ScrollReveal().reveal(".contact__card", { ...scrollRevealOption, interval: 200 });
  ScrollReveal().reveal(".contact__form__wrapper", { ...scrollRevealOption, delay: 300 });
  ScrollReveal().reveal(".about__hero .section__header", scrollRevealOption);
  ScrollReveal().reveal(".about__hero .section__description", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".contact__hero .section__header", scrollRevealOption);
  ScrollReveal().reveal(".contact__hero .section__description", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".menu__hero .section__header", scrollRevealOption);
  ScrollReveal().reveal(".menu__hero .section__description", { ...scrollRevealOption, delay: 500 });
  ScrollReveal().reveal(".category__hero .section__header", scrollRevealOption);
  ScrollReveal().reveal(".category__hero .section__description", { ...scrollRevealOption, delay: 500 });
}

// ===== INIT =====
updateCartUI();
updateAuthUI();
