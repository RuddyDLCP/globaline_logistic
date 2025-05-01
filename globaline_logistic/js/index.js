// FAQ functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentNode;
        item.classList.toggle('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Abrir modal
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            document.getElementById(modalId).classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Cerrar modal
    document.querySelectorAll('.modal-close, .modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Evitar que el clic en el contenido cierre el modal
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

});

// Función para WhatsApp
function openWhatsApp() {
    const phoneNumber = "8298261899";
    const message = "Hola Globaline Logistic, tengo una consulta sobre sus servicios";
    const url = `https://wa.me/1${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Redirección a servicios con scroll suave
document.querySelectorAll('.service-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSection = document.querySelector(this.getAttribute('href'));
        const service = this.getAttribute('data-service');
        
        // Scroll suave
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Opcional: Abrir modal específico después de un retraso
        setTimeout(() => {
            // Aquí puedes agregar lógica para resaltar o abrir el servicio específico
            console.log(`Mostrar servicio: ${service}`);
        }, 1000);
    });
});

// Control de modales legales
const legalModals = {
    'show-terms-modal': 'terms-modal',
    'show-privacy-modal': 'privacy-modal',
    // Agregar todos los modales aquí
};

Object.entries(legalModals).forEach(([triggerId, modalId]) => {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    
    if (trigger && modal) {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        modal.querySelectorAll('.legal-modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
});

// Cerrar modal al hacer clic fuera del contenido
document.querySelectorAll('.legal-modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});