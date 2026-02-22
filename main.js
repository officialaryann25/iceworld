/**
 * IceWorld - Main JavaScript
 * Handles: nav, scroll effects, auth modal, category filter,
 *           checkout modal, newsletter, wishlist, scroll reveal
 */

/* ============================================
   1. MOBILE NAVIGATION TOGGLE
   ============================================ */
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Toggle icon between menu and close
    const icon = menuBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('ri-menu-3-line');
      icon.classList.toggle('ri-close-line');
    }
  });

  // Close nav when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const icon = menuBtn.querySelector('i');
      if (icon) {
        icon.classList.add('ri-menu-3-line');
        icon.classList.remove('ri-close-line');
      }
    });
  });
}

/* ============================================
   2. STICKY NAV GLASSMORPHISM ON SCROLL
   ============================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ============================================
   3. AUTH STATE — update nav button on load
   ============================================ */
function updateAuthNav() {
  const loginBtn = document.getElementById('login-btn');
  const loginLabel = document.getElementById('login-label');
  if (!loginBtn || !loginLabel) return;

  const currentUser = getCurrentUser();
  if (currentUser) {
    loginLabel.textContent = currentUser.username;
    loginBtn.title = 'Logout';
    loginBtn.onclick = handleLogout;
  } else {
    loginLabel.textContent = 'Login';
    loginBtn.title = 'Login / Register';
    loginBtn.onclick = openAuthModal;
  }
}

function getCurrentUser() {
  try {
    const u = localStorage.getItem('iceworld_current_user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

/* ============================================
   4. AUTH MODAL — open / close / switch tabs
   ============================================ */
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  document.querySelectorAll('.modal__tab').forEach((btn, i) => {
    btn.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
  });
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

/* Close modal on overlay click */
const authModal = document.getElementById('auth-modal');
if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });
}

/* ============================================
   5. REGISTER
   ============================================ */
function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const errEl = document.getElementById('reg-error');

  if (pass.length < 6) {
    showFormError(errEl, 'Password must be at least 6 characters.');
    return;
  }

  let users = [];
  try { users = JSON.parse(localStorage.getItem('iceworld_users') || '[]'); } catch(e) {}

  if (users.find(u => u.email === email)) {
    showFormError(errEl, 'An account with this email already exists.');
    return;
  }

  // NOTE: Passwords are stored unencrypted because this is a client-side demo
  // with no backend. In production, always hash passwords server-side and
  // use a secure auth service — never store credentials in localStorage.
  users.push({ username: name, email, password: pass });
  localStorage.setItem('iceworld_users', JSON.stringify(users));

  // Auto-login after register
  const user = { username: name, email };
  localStorage.setItem('iceworld_current_user', JSON.stringify(user));
  updateAuthNav();
  closeAuthModal();
  showToast('Welcome to IceWorld, ' + name + '! 🍦', 'success');
}

/* ============================================
   6. LOGIN
   ============================================ */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');

  let users = [];
  try { users = JSON.parse(localStorage.getItem('iceworld_users') || '[]'); } catch(e) {}

  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) {
    showFormError(errEl, 'Invalid email or password. Please try again.');
    return;
  }

  const sessionUser = { username: user.username, email: user.email };
  localStorage.setItem('iceworld_current_user', JSON.stringify(sessionUser));
  updateAuthNav();
  closeAuthModal();
  showToast('Welcome back, ' + user.username + '! 🎉', 'success');
}

/* ============================================
   7. LOGOUT
   ============================================ */
function handleLogout() {
  localStorage.removeItem('iceworld_current_user');
  updateAuthNav();
  showToast('Logged out successfully.', '');
}

function showFormError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 4000);
}

/* ============================================
   8. CATEGORY FILTER (menu.html)
   ============================================ */
const filterBtns = document.querySelectorAll('.filter__btn');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = document.querySelectorAll('#menu-grid .product__card');
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================
   9. CHECKOUT MODAL
   ============================================ */
function openCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  // Require login
  if (!getCurrentUser()) {
    closeCart();
    showToast('Please login to checkout 🔑', 'error');
    setTimeout(() => openAuthModal(), 500);
    return;
  }

  // Build order summary
  const container = document.getElementById('checkout-items');
  const successEl = document.getElementById('order-success');
  const contentEl = document.getElementById('checkout-content');

  if (container) {
    let html = '<h4>Your Order</h4>';
    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      html += `<div class="checkout__item"><span>${item.name} x${item.qty}</span><span>&#x20B9;${subtotal}</span></div>`;
    });
    html += `<div class="checkout__total"><span>Total</span><span>&#x20B9;${total}</span></div>`;
    container.innerHTML = html;
  }

  if (successEl) successEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  closeCart();
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function placeOrder() {
  const contentEl = document.getElementById('checkout-content');
  const successEl = document.getElementById('order-success');
  if (contentEl) contentEl.style.display = 'none';
  if (successEl) successEl.style.display = 'block';

  // Clear cart
  saveCart([]);
  updateCartBadge();
  renderCartItems();
}

/* Close checkout on overlay click */
const checkoutModal = document.getElementById('checkout-modal');
if (checkoutModal) {
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeCheckout();
  });
}

/* ============================================
   10. NEWSLETTER FORM
   ============================================ */
function handleNewsletter(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  if (emailInput && emailInput.value) {
    showToast('Subscribed! Welcome to the IceWorld family 🍬', 'success');
    emailInput.value = '';
  }
}

/* ============================================
   11. WISHLIST (heart toggle)
   ============================================ */
document.querySelectorAll('.product__card__wish').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('ri-heart-line');
      icon.classList.toggle('ri-heart-fill');
    }
    const msg = btn.classList.contains('active') ? 'Added to wishlist ❤️' : 'Removed from wishlist';
    showToast(msg, btn.classList.contains('active') ? 'success' : '');
  });
});

/* ============================================
   12. TOAST NOTIFICATION
   ============================================ */
let toastTimer = null;
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================
   13. SCROLL REVEAL ANIMATIONS
   ============================================ */
if (typeof ScrollReveal !== 'undefined') {
  const sr = ScrollReveal({
    distance: '50px',
    origin: 'bottom',
    duration: 800,
    easing: 'ease',
    reset: false,
  });

  sr.reveal('.product__card',    { interval: 120 });
  sr.reveal('.review__card',     { interval: 150 });
  sr.reveal('.section__header',  { origin: 'bottom', distance: '30px' });
  sr.reveal('.promo__banner',    { origin: 'bottom', distance: '40px' });
  sr.reveal('.category__section__header', { origin: 'left', distance: '40px' });
  sr.reveal('.contact__card',    { interval: 150 });
  sr.reveal('.owner__card',      { interval: 200 });
  sr.reveal('.value__card',      { interval: 120 });
  sr.reveal('.hero__text',       { origin: 'left', distance: '60px', duration: 1000 });
  sr.reveal('.hero__float',      { origin: 'right', distance: '60px', duration: 1000, delay: 200 });

  // About page
  sr.reveal('.about__hero .section__header',      { origin: 'bottom' });
  sr.reveal('.about__hero .section__description', { origin: 'bottom', delay: 200 });
  sr.reveal('.contact__hero .section__header',    { origin: 'bottom' });
  sr.reveal('.contact__hero .section__description',{ origin: 'bottom', delay: 200 });
  sr.reveal('.contact__form__wrapper',            { origin: 'bottom', delay: 200 });
}

/* ============================================
   14. INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthNav();
  updateCartBadge();
  renderCartItems();
});
