// Smooth scrolling for anchor links with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    const targetId = this.getAttribute("href")
    const targetElement = document.querySelector(targetId)

    if (targetElement) {
      const headerHeight = document.querySelector("header").offsetHeight
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })

      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId)
      } else {
        window.location.hash = targetId
      }

      // Close mobile menu if open
      if (document.querySelector(".nav-menu").classList.contains("active")) {
        toggleMobileMenu()
      }
    }
  })
})

// Modal functionality with improved accessibility
document.addEventListener("DOMContentLoaded", () => {
  // Open modal
  document.querySelectorAll(".modal-trigger").forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault()
      const modalId = this.getAttribute("data-modal")
      const modal = document.getElementById(modalId)

      if (modal) {
        modal.classList.add("active")
        document.body.style.overflow = "hidden"

        // Focus on first focusable element
        const focusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable) focusable.focus()
      }
    })
  })

  // Close modal (button and ESC key)
  document.querySelectorAll(".modal-close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault()
      closeModal(this.closest(".modal"))
    })
  })

  // Close modal when clicking outside content
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal(this)
      }
    })
  })

  // Close modal with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(".modal.active")
      if (openModal) {
        closeModal(openModal)
      }
    }
  })

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = "auto"

      // Return focus to trigger
      const trigger = document.querySelector(`[data-modal="${modal.id}"]`)
      if (trigger) trigger.focus()
    }
  }

  // Quote buttons - close modal and scroll to contact
  document.querySelectorAll(".btn-quote").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const modal = this.closest(".modal")
      if (modal) {
        closeModal(modal)
      }

      // Scroll to contact after modal closes
      setTimeout(() => {
        const contactSection = document.querySelector("#contact")
        if (contactSection) {
          const headerHeight = document.querySelector("header").offsetHeight
          const targetPosition = contactSection.getBoundingClientRect().top + window.pageYOffset - headerHeight

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      }, 300)
    })
  })
})

// Mobile menu functionality
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
const navMenu = document.querySelector(".nav-menu")
const navCloseBtn = document.querySelector(".nav-close-btn")

function toggleMobileMenu() {
  navMenu.classList.toggle("active")

  // Toggle body scroll
  document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "auto"
}

mobileMenuToggle.addEventListener("click", toggleMobileMenu)
navCloseBtn.addEventListener("click", toggleMobileMenu)

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (navMenu.classList.contains("active")) {
      toggleMobileMenu()
    }
  })
})

// Handle window resize to reset mobile menu if screen size increases
window.addEventListener("resize", () => {
  if (window.innerWidth > 992 && navMenu.classList.contains("active")) {
    toggleMobileMenu()
  }
})
  
  // WhatsApp function with default message
  function openWhatsApp() {
    const phoneNumber = "18298261899";
    const defaultMessage = "Hola Globaline Logistic, tengo una consulta sobre sus servicios";
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }
  
  // FAQ accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });
  
  // Initialize all service links
  document.querySelectorAll('.service-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = document.querySelector(this.getAttribute('href'));
      const service = this.getAttribute('data-service');
      
      if (targetSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Optional: Highlight specific service
        if (service) {
          console.log(`Mostrar servicio: ${service}`);
          // Add your logic to highlight the specific service
        }
      }
    });
  });
  
  // Legal modals with improved handling
  const legalModals = {
    'show-terms-modal': 'terms-modal',
    'show-privacy-modal': 'privacy-modal'
  };
  
  Object.entries(legalModals).forEach(([triggerId, modalId]) => {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    
    if (trigger && modal) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on first focusable element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      });
      
      modal.querySelectorAll('.legal-modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
          modal.classList.remove('active');
          document.body.style.overflow = 'auto';
          
          // Return focus to trigger
          trigger.focus();
        });
      });
      
      // Close modal when clicking outside content
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          modal.classList.remove('active');
          document.body.style.overflow = 'auto';
          trigger.focus();
        }
      });
    }
  });
  
  // Form validation for contact form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple validation
      const requiredFields = contactForm.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'red';
          isValid = false;
        } else {
          field.style.borderColor = '#ddd';
        }
      });
      
      if (isValid) {
        // Here you would typically send the form data to a server
        alert('Formulario enviado con éxito. Nos pondremos en contacto contigo pronto.');
        contactForm.reset();
      } else {
        alert('Por favor complete todos los campos obligatorios.');
      }
    });
  }
  
    // Tracking form submission - MODIFICADO PARA REDIRECCIONAR
    // Tracking form submission - MODIFICADO PARA REDIRECCIONAR
const trackingForm = document.querySelector('.tracking-form');
if (trackingForm) {
  trackingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const trackingNumber = this.querySelector('input').value.trim();
    
    if (trackingNumber) {
      // Redireccionar a la página de seguimiento con el número como parámetro
      window.location.href = `../html/tracking-page.html?tracking=${encodeURIComponent(trackingNumber)}`;
    } else {
      alert('Por favor ingrese un número de seguimiento válido.');
    }
  }); 
  
  // Registrar en consola que el script se ha inicializado correctamente
  console.log('Script de seguimiento inicializado correctamente');
}
  
  // Add animation to elements when they come into view
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.service-card, .mvv-card, .feature-item, .stat-item');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (elementPosition < screenPosition) {
        element.classList.add('animate');
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Run once on page load
  
  // Add loading animation for better user experience
  window.addEventListener('load', function() {
    setTimeout(function() {
      document.body.classList.add('loaded');
    }, 500);
  });
  
  // Back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopButton.className = 'back-to-top';
  backToTopButton.setAttribute('aria-label', 'Volver arriba');
  document.body.appendChild(backToTopButton);
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });
  
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Add active class to current section in navigation
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav ul li a');
  
  window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
  
  // Add hover effect for social links
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.querySelector('i').style.transform = 'scale(1.2)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.querySelector('i').style.transform = 'scale(1)';
    });
  });
  
  // Add animation to hero section
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 300);
  }
  
  // Add animation to service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 500);
  });