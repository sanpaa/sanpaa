// Get property ID from URL
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

const loading = document.getElementById('loading');
const propertyContent = document.getElementById('propertyContent');
const notFound = document.getElementById('notFound');

// Fetch property data
async function loadProperty() {
    if (!propertyId) {
        showNotFound();
        return;
    }

    try {
        const response = await fetch(`/api/properties/${propertyId}`);
        
        if (!response.ok) {
            throw new Error('Property not found');
        }

        const property = await response.json();
        displayProperty(property);
    } catch (error) {
        console.error('Error loading property:', error);
        showNotFound();
    }
}

function displayProperty(property) {
    // Hide loading, show content
    loading.style.display = 'none';
    propertyContent.style.display = 'block';

    // Set title and meta
    document.title = `${property.title} - Alancarmo Corretor`;
    
    // Property Title & Location
    document.getElementById('propertyTitle').textContent = property.title;
    const locationText = `${property.neighborhood || property.city}, ${property.city} - ${property.state || 'SP'}`;
    document.getElementById('propertyLocation').querySelector('span').textContent = locationText;

    // Price
    const formattedPrice = property.price 
        ? `R$ ${property.price.toLocaleString('pt-BR')},00` 
        : 'Consulte-nos';
    document.getElementById('propertyPrice').textContent = formattedPrice;

    // Details
    document.getElementById('propertyBedrooms').textContent = property.bedrooms || '-';
    document.getElementById('propertyBathrooms').textContent = property.bathrooms || '-';
    document.getElementById('propertyArea').textContent = property.area ? `${property.area}m²` : '-';
    document.getElementById('propertyParking').textContent = property.parking || '-';

    // Description
    document.getElementById('propertyDescription').textContent = property.description || 'Descrição não disponível.';

    // Load Gallery Images
    loadGallery(property);

    // WhatsApp Button
    const whatsappMessage = `Olá! Tenho interesse no imóvel: ${property.title}`;
    const whatsappNumber = property.contact || '5511999999999';
    document.getElementById('whatsappBtn').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Google Maps Button
    if (property.latitude && property.longitude) {
        document.getElementById('mapsBtn').href = `https://www.google.com/maps?q=${property.latitude},${property.longitude}`;
        document.getElementById('mapsBtn').style.display = 'inline-flex';
        
        // Show map section
        loadMap(property);
    } else {
        document.getElementById('mapsBtn').style.display = 'none';
    }
}

function loadGallery(property) {
    const galleryContainer = document.getElementById('galleryImages');
    let images = [];

    // Get images from property
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
        images = property.images;
    } else if (property.imageUrl) {
        // Support old single image format
        images = [property.imageUrl];
    } else {
        // Default placeholder
        images = ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'];
    }

    // Create slides
    galleryContainer.innerHTML = images.map(img => `
        <div class="swiper-slide">
            <img src="${img}" alt="${property.title}" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994'">
        </div>
    `).join('');

    // Initialize Swiper
    new Swiper('.gallerySwiper', {
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
    });
}

function loadMap(property) {
    if (!property.latitude || !property.longitude) return;

    const mapSection = document.getElementById('mapSection');
    const mapContainer = document.getElementById('mapContainer');
    
    mapSection.style.display = 'block';

    // Create embedded Google Maps
    const mapIframe = document.createElement('iframe');
    mapIframe.width = '100%';
    mapIframe.height = '450';
    mapIframe.frameBorder = '0';
    mapIframe.style.border = '0';
    mapIframe.src = `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    mapContainer.appendChild(mapIframe);
}

function showNotFound() {
    loading.style.display = 'none';
    notFound.style.display = 'block';
}

// Load property on page load
loadProperty();
