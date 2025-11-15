// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');

mobileMenuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        nav.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Testimonials Carousel
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.depoimento-card');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.remove('active');
        if (i === index) {
            testimonial.classList.add('active');
        }
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
}

if (nextBtn) {
    nextBtn.addEventListener('click', nextTestimonial);
}

if (prevBtn) {
    prevBtn.addEventListener('click', prevTestimonial);
}

// Auto-advance testimonials
setInterval(nextTestimonial, 5000);

// Contact Form
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const servico = document.getElementById('servico').value;
        const mensagem = document.getElementById('mensagem').value;
        
        // Create WhatsApp message
        const whatsappMessage = `*Nova mensagem do site*%0A%0A*Nome:* ${encodeURIComponent(nome)}%0A*Email:* ${encodeURIComponent(email)}%0A*Telefone:* ${encodeURIComponent(telefone)}%0A*Serviço:* ${encodeURIComponent(servico)}%0A*Mensagem:* ${encodeURIComponent(mensagem)}`;
        
        // Open WhatsApp
        window.open(`https://wa.me/5511999999999?text=${whatsappMessage}`, '_blank');
        
        // Reset form
        contactForm.reset();
        
        // Show success message
        alert('Obrigado! Você será redirecionado para o WhatsApp para completar o envio da mensagem.');
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.servico-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.style.color = 'var(--primary-color)';
            } else {
                navLink.style.color = '';
            }
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Load and display properties
async function loadProperties() {
    const propertiesGrid = document.getElementById('propertiesGrid');
    
    try {
        const response = await fetch('/api/properties');
        const properties = await response.json();
        
        if (properties.length === 0) {
            propertiesGrid.innerHTML = `
                <div class="empty-properties">
                    <i class="fas fa-building fa-3x"></i>
                    <h3>Em breve novos imóveis</h3>
                    <p>Estamos preparando imóveis incríveis para você. Entre em contato para mais informações!</p>
                    <a href="https://wa.me/5511999999999?text=Olá, gostaria de informações sobre imóveis" class="btn btn-primary" target="_blank">
                        <i class="fab fa-whatsapp"></i> Falar com Corretor
                    </a>
                </div>
            `;
        } else {
            propertiesGrid.innerHTML = properties.map(property => `
                <div class="property-card">
                    <div class="property-image">
                        ${property.imageUrl ? 
                            `<img src="${property.imageUrl}" alt="${property.title}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image fa-3x\\'></i>'">` : 
                            '<i class="fas fa-image fa-3x"></i>'
                        }
                    </div>
                    <div class="property-content">
                        <span class="property-type">${property.type || 'Imóvel'}</span>
                        <h3 class="property-title">${property.title}</h3>
                        <div class="property-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${property.location}
                        </div>
                        <div class="property-price">
                            R$ ${formatPropertyPrice(property.price)}
                        </div>
                        ${renderPropertyDetails(property)}
                        ${property.description ? `<p class="property-description">${property.description}</p>` : ''}
                        <a href="https://wa.me/${property.contact.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel: ${encodeURIComponent(property.title)}" 
                           class="btn btn-primary btn-block" target="_blank">
                            <i class="fab fa-whatsapp"></i> Tenho Interesse
                        </a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        propertiesGrid.innerHTML = `
            <div class="empty-properties">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Não foi possível carregar os imóveis</h3>
                <p>Entre em contato para conhecer nossos imóveis disponíveis!</p>
                <a href="https://wa.me/5511999999999?text=Olá, gostaria de informações sobre imóveis" class="btn btn-primary" target="_blank">
                    <i class="fab fa-whatsapp"></i> Falar com Corretor
                </a>
            </div>
        `;
    }
}

function renderPropertyDetails(property) {
    const details = [];
    
    if (property.bedrooms) {
        details.push(`<span class="property-detail"><i class="fas fa-bed"></i> ${property.bedrooms} quartos</span>`);
    }
    if (property.bathrooms) {
        details.push(`<span class="property-detail"><i class="fas fa-bath"></i> ${property.bathrooms} banheiros</span>`);
    }
    if (property.area) {
        details.push(`<span class="property-detail"><i class="fas fa-ruler-combined"></i> ${property.area}m²</span>`);
    }
    if (property.parking) {
        details.push(`<span class="property-detail"><i class="fas fa-car"></i> ${property.parking} vagas</span>`);
    }

    return details.length > 0 ? `<div class="property-details">${details.join('')}</div>` : '';
}

function formatPropertyPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showTestimonial(currentTestimonial);
    highlightNavigation();
    loadProperties();
});
