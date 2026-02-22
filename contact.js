// ===== CONTACT FORM =====
// IMPROVEMENT: Uses showToast() (from main.js) instead of alert()
// IMPROVEMENT: Validates phone number format before submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // Phone validation: accepts international format (+91 8750141860),
    // digits, spaces, and hyphens. Minimum 8 chars, maximum 15 chars.
    // Examples: +91 8750141860, 8750-141860, +1-800-555-0199
    const phonePattern = /^[+\d][\d\s\-]{7,14}$/;
    if (phone && !phonePattern.test(phone)) {
      if (typeof showToast === 'function') {
        showToast('Please enter a valid phone number.', 'error');
      }
      document.getElementById('phone').focus();
      return;
    }

    if (typeof showToast === 'function') {
      showToast(`Thanks, ${name}! We'll get back to you soon.`, 'success', 4000);
    }

    contactForm.reset();
  });
}
