/**
 * IceWorld - Cart JavaScript
 * Manages cart state, rendering, and quantity controls
 */

const CART_KEY = 'iceworld_cart';

/* ============================================
   CART STATE — localStorage persistence
   ============================================ */

/** Retrieve cart array from localStorage */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

/** Persist cart array to localStorage */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/** Add or increment an item in the cart */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.qty += (product.qty || 1);
  } else {
    cart.push({
      name:  product.name,
      price: product.price,
      img:   product.img,
      qty:   product.qty || 1,
    });
  }
  saveCart(cart);
  updateCartBadge();
  renderCartItems();
}

/** Remove an item by name */
function removeFromCart(name) {
  const cart = getCart().filter(item => item.name !== name);
  saveCart(cart);
  updateCartBadge();
  renderCartItems();
}

/** Update quantity for an item by name */
function updateQty(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    return removeFromCart(name);
  }
  saveCart(cart);
  updateCartBadge();
  renderCartItems();
}

/* ============================================
   CART BADGE COUNT
   ============================================ */
function updateCartBadge() {
  const cart  = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ============================================
   CART TOTAL
   ============================================ */
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/* ============================================
   RENDER CART ITEMS IN SIDEBAR
   ============================================ */
function renderCartItems() {
  const listEl  = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total');
  if (!listEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart__empty">
        <i class="ri-shopping-basket-2-line"></i>
        <p>Your cart is empty.<br>Add some delicious items!</p>
      </div>`;
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  // Build DOM nodes safely using createElement to avoid XSS
  const fragment = document.createDocumentFragment();

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart__item';

    const img = document.createElement('img');
    img.className = 'cart__item__img';
    img.src = item.img;
    img.alt = item.name;
    img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'; };

    const info = document.createElement('div');
    info.className = 'cart__item__info';

    const nameEl = document.createElement('p');
    nameEl.className = 'cart__item__name';
    nameEl.textContent = item.name;

    const priceEl = document.createElement('p');
    priceEl.className = 'cart__item__price';
    priceEl.textContent = '₹' + item.price + ' each';

    const controls = document.createElement('div');
    controls.className = 'cart__item__controls';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty__btn';
    minusBtn.textContent = '-';
    minusBtn.addEventListener('click', () => updateQty(item.name, -1));

    const qtySpan = document.createElement('span');
    qtySpan.className = 'qty__value';
    qtySpan.textContent = item.qty;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty__btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => updateQty(item.name, 1));

    controls.append(minusBtn, qtySpan, plusBtn);
    info.append(nameEl, priceEl, controls);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart__item__remove';
    removeBtn.title = 'Remove';
    removeBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
    removeBtn.addEventListener('click', () => removeFromCart(item.name));

    row.append(img, info, removeBtn);
    fragment.appendChild(row);
  });

  listEl.innerHTML = '';
  listEl.appendChild(fragment);

  if (totalEl) {
    totalEl.textContent = '₹' + calculateTotal(cart);
  }
}

/* ============================================
   CART SIDEBAR OPEN / CLOSE
   ============================================ */
function openCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* Attach cart button listener */
const cartBtn = document.getElementById('cart-btn');
if (cartBtn) {
  cartBtn.addEventListener('click', openCart);
}

/* ============================================
   ADD TO CART FROM PRODUCT CARD BUTTON
   Reads data-name, data-price, data-img attributes
   and respects the qty selector if present
   ============================================ */
function addToCartFromCard(btn) {
  const card = btn.closest('.product__card');
  const name  = btn.dataset.name;
  const price = parseInt(btn.dataset.price, 10);
  const img   = btn.dataset.img;

  // Get qty from selector if present
  let qty = 1;
  if (card) {
    const qtyEl = card.querySelector('.qty__value');
    if (qtyEl) qty = parseInt(qtyEl.textContent, 10) || 1;
  }

  addToCart({ name, price, img, qty });

  // Feedback animation on the button
  const origHTML = btn.innerHTML;
  btn.innerHTML = '<i class="ri-check-line"></i> Added!';
  btn.style.background = 'linear-gradient(135deg,#4caf50,#2e7d32)';
  setTimeout(() => {
    btn.innerHTML = origHTML;
    btn.style.background = '';
  }, 1200);

  if (typeof showToast === 'function') {
    showToast(name + ' added to cart 🛒', 'success');
  }
}

/* ============================================
   QUANTITY SELECTOR on product cards
   ============================================ */
function changeQty(btn, delta) {
  const card    = btn.closest('.product__card');
  if (!card) return;
  const qtyEl   = card.querySelector('.qty__value');
  if (!qtyEl) return;
  let current   = parseInt(qtyEl.textContent, 10) || 1;
  current = Math.max(1, current + delta);
  qtyEl.textContent = current;
}

/* ============================================
   INIT on load
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartItems();
});
