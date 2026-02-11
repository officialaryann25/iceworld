// Contact form handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Here you can add functionality to send the form data to a server
    // For now, we'll just show a success message
    
    alert(`Thank you for contacting us, ${name}! We will get back to you soon.`);
    
    // Reset form
    contactForm.reset();
  });
}

// ScrollReveal animations for contact page
if (typeof ScrollReveal !== 'undefined') {
  const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
  };

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
}