// Search page functionality
let allProperties = [];
let filteredProperties = [];
let currentPage = 1;
const propertiesPerPage = 9;

// Load properties on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAllProperties();
    setupMobileMenu();
});

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
}

// Load all properties
async function loadAllProperties() {
    showSkeleton();
    
    try {
        const response = await fetch('/api/properties');
        allProperties = await response.json();
        
        // Filter out sold properties
        allProperties = allProperties.filter(p => !p.sold);
        
        // Populate city filter
        populateCityFilter();
        
        // Apply initial filters
        applyFilters();
    } catch (error) {
        console.error('Error loading properties:', error);
        showError();
    }
}

// Populate city filter with unique cities
function populateCityFilter() {
    const citySelect = document.getElementById('filterCity');
    const cities = [...new Set(allProperties.map(p => p.city).filter(c => c))].sort();
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const searchText = document.getElementById('searchText').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    const filterCity = document.getElementById('filterCity').value;
    const filterBedrooms = document.getElementById('filterBedrooms').value;
    const filterPriceMin = parseFloat(document.getElementById('filterPriceMin').value) || 0;
    const filterPriceMax = parseFloat(document.getElementById('filterPriceMax').value) || Infinity;
    
    filteredProperties = allProperties.filter(property => {
        // Text search
        if (searchText) {
            const searchableText = `${property.title} ${property.description} ${property.neighborhood} ${property.city}`.toLowerCase();
            if (!searchableText.includes(searchText)) return false;
        }
        
        // Type filter
        if (filterType && property.type !== filterType) return false;
        
        // City filter
        if (filterCity && property.city !== filterCity) return false;
        
        // Bedrooms filter
        if (filterBedrooms && property.bedrooms < parseInt(filterBedrooms)) return false;
        
        // Price range filter
        if (property.price < filterPriceMin || property.price > filterPriceMax) return false;
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Sort properties
    sortProperties();
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchText').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterCity').value = '';
    document.getElementById('filterBedrooms').value = '';
    document.getElementById('filterPriceMin').value = '';
    document.getElementById('filterPriceMax').value = '';
    document.getElementById('sortSelect').value = 'featured';
    
    applyFilters();
}

// Sort properties
function sortProperties() {
    const sortBy = document.getElementById('sortSelect').value;
    
    switch (sortBy) {
        case 'price-asc':
            filteredProperties.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProperties.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filteredProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'featured':
        default:
            filteredProperties.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;
    }
    
    renderResults();
}

// Render results
function renderResults() {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update count
    const totalResults = filteredProperties.length;
    resultsCount.textContent = `${totalResults} ${totalResults === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`;
    
    if (totalResults === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Nenhum imóvel encontrado</h3>
                <p>Tente ajustar os filtros ou entre em contato para mais opções</p>
                <a href="https://wa.me/5511999999999?text=Olá, estou procurando um imóvel" class="btn btn-primary" target="_blank">
                    <i class="fab fa-whatsapp"></i> Falar com Corretor
                </a>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(totalResults / propertiesPerPage);
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = Math.min(startIndex + propertiesPerPage, totalResults);
    const currentProperties = filteredProperties.slice(startIndex, endIndex);
    
    // Render properties
    resultsGrid.innerHTML = currentProperties.map(property => {
        const images = property.imageUrls || (property.imageUrl ? [property.imageUrl] : []);
        const firstImage = images.length > 0 ? images[0] : null;
        const location = property.city ? 
            `${property.neighborhood || ''}, ${property.city} - ${property.state}` : 
            (property.location || 'Localização não informada');
        
        return `
            <div class="property-card ${property.featured ? 'featured' : ''}">
                <div class="property-image">
                    ${firstImage ? 
                        `<img src="${firstImage}" alt="${property.title}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image fa-3x\\'></i>'">` : 
                        '<i class="fas fa-image fa-3x"></i>'
                    }
                    ${property.featured ? '<span class="property-badge featured"><i class="fas fa-star"></i> Destaque</span>' : ''}
                    ${images.length > 1 ? `<span class="property-badge images"><i class="fas fa-images"></i> ${images.length} fotos</span>` : ''}
                </div>
                <div class="property-content">
                    <span class="property-type">${property.type || 'Imóvel'}</span>
                    <h3 class="property-title">${property.title}</h3>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${location}
                    </div>
                    <div class="property-price">
                        R$ ${formatPrice(property.price)}
                    </div>
                    ${renderPropertyDetails(property)}
                    ${property.description ? `<p class="property-description">${property.description}</p>` : ''}
                    <a href="https://wa.me/${property.contact.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel: ${encodeURIComponent(property.title)}" 
                       class="btn btn-primary btn-block" target="_blank">
                        <i class="fab fa-whatsapp"></i> Tenho Interesse
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    // Render pagination
    renderPagination(totalPages);
    
    // Scroll to top of results
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// Render property details
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

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// Render pagination
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Anterior
    </button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Próxima <i class="fas fa-chevron-right"></i>
    </button>`;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderResults();
}

// Show skeleton loading
function showSkeleton() {
    const resultsGrid = document.getElementById('resultsGrid');
    const skeletonCards = Array(6).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-line short"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line short"></div>
            </div>
        </div>
    `).join('');
    
    resultsGrid.innerHTML = skeletonCards;
}

// Show error
function showError() {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro ao carregar imóveis</h3>
            <p>Por favor, tente novamente mais tarde ou entre em contato</p>
            <button class="btn btn-primary" onclick="loadAllProperties()">
                <i class="fas fa-redo"></i> Tentar Novamente
            </button>
        </div>
    `;
}
