const API_URL = '/api/properties';
let properties = [];
let editingId = null;

// Load properties on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    
    // Setup form submit handler
    document.getElementById('propertyForm').addEventListener('submit', handleFormSubmit);
    
    // Setup CEP auto-fill
    document.getElementById('cep').addEventListener('blur', handleCEPLookup);
    
    // Format CEP as user types
    document.getElementById('cep').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5, 8);
        }
        e.target.value = value;
    });
});

// Handle CEP lookup
async function handleCEPLookup() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    try {
        const response = await fetch(`/api/cep/${cep}`);
        
        if (!response.ok) {
            alert('CEP não encontrado');
            return;
        }
        
        const data = await response.json();
        
        // Fill address fields
        document.getElementById('street').value = data.street || '';
        document.getElementById('neighborhood').value = data.neighborhood || '';
        document.getElementById('city').value = data.city || '';
        document.getElementById('state').value = data.state || '';
        
        // Geocode the address
        await geocodeAddress(data.address);
        
    } catch (error) {
        console.error('Error looking up CEP:', error);
        alert('Erro ao buscar CEP. Tente novamente.');
    }
}

// Geocode address to get lat/lng
async function geocodeAddress(address) {
    try {
        const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('latitude').value = data.lat;
            document.getElementById('longitude').value = data.lng;
        }
    } catch (error) {
        console.error('Error geocoding address:', error);
    }
}

// Load all properties
async function loadProperties() {
    try {
        const response = await fetch(API_URL);
        properties = await response.json();
        renderProperties();
    } catch (error) {
        console.error('Error loading properties:', error);
        alert('Erro ao carregar imóveis. Verifique se o servidor está rodando.');
    }
}

// Render properties list
function renderProperties() {
    const container = document.getElementById('propertiesContainer');
    const emptyState = document.getElementById('emptyState');

    if (properties.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = properties.map(property => {
        const images = property.imageUrls || (property.imageUrl ? [property.imageUrl] : []);
        const firstImage = images.length > 0 ? images[0] : null;
        const location = property.city ? `${property.neighborhood}, ${property.city} - ${property.state}` : (property.location || 'Localização não informada');
        
        return `
        <div class="property-card">
            <div class="property-image">
                ${firstImage ? 
                    `<img src="${firstImage}" alt="${property.title}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image fa-3x\\'></i>'">` : 
                    '<i class="fas fa-image fa-3x"></i>'
                }
                ${property.featured ? '<span class="property-badge featured"><i class="fas fa-star"></i> Destaque</span>' : ''}
                ${property.sold ? '<span class="property-badge sold"><i class="fas fa-check"></i> Vendido</span>' : ''}
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
                <div class="property-actions">
                    <button class="btn btn-primary btn-sm" onclick="editProperty('${property.id}')" style="flex: 1;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProperty('${property.id}')" style="flex: 1;">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
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

// Open add modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Imóvel';
    document.getElementById('propertyForm').reset();
    document.getElementById('propertyId').value = '';
    document.getElementById('propertyModal').classList.add('active');
}

// Open edit modal
function editProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Imóvel';
    document.getElementById('propertyId').value = property.id;
    document.getElementById('type').value = property.type || '';
    document.getElementById('title').value = property.title || '';
    document.getElementById('description').value = property.description || '';
    document.getElementById('price').value = property.price || '';
    document.getElementById('cep').value = property.cep || '';
    document.getElementById('street').value = property.street || '';
    document.getElementById('neighborhood').value = property.neighborhood || '';
    document.getElementById('city').value = property.city || '';
    document.getElementById('state').value = property.state || '';
    document.getElementById('latitude').value = property.latitude || '';
    document.getElementById('longitude').value = property.longitude || '';
    document.getElementById('bedrooms').value = property.bedrooms || '';
    document.getElementById('bathrooms').value = property.bathrooms || '';
    document.getElementById('area').value = property.area || '';
    document.getElementById('parking').value = property.parking || '';
    
    // Handle image URLs
    const images = property.imageUrls || (property.imageUrl ? [property.imageUrl] : []);
    document.getElementById('imageUrls').value = images.join('\n');
    
    document.getElementById('featured').checked = property.featured || false;
    document.getElementById('sold').checked = property.sold || false;
    document.getElementById('contact').value = property.contact || '';
    
    document.getElementById('propertyModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
    editingId = null;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();

    // Parse image URLs from textarea
    const imageUrlsText = document.getElementById('imageUrls').value.trim();
    const imageUrls = imageUrlsText ? imageUrlsText.split('\n').filter(url => url.trim()).map(url => url.trim()) : [];

    const propertyData = {
        type: document.getElementById('type').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        cep: document.getElementById('cep').value,
        street: document.getElementById('street').value,
        neighborhood: document.getElementById('neighborhood').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        latitude: document.getElementById('latitude').value,
        longitude: document.getElementById('longitude').value,
        bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
        bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
        area: parseFloat(document.getElementById('area').value) || 0,
        parking: parseInt(document.getElementById('parking').value) || 0,
        imageUrls: imageUrls,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : '', // Keep backward compatibility
        featured: document.getElementById('featured').checked,
        sold: document.getElementById('sold').checked,
        contact: document.getElementById('contact').value
    };

    try {
        let response;
        if (editingId) {
            // Update existing property
            response = await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            });
        } else {
            // Create new property
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            });
        }

        if (response.ok) {
            closeModal();
            loadProperties();
            alert(editingId ? 'Imóvel atualizado com sucesso!' : 'Imóvel adicionado com sucesso!');
        } else {
            alert('Erro ao salvar imóvel. Tente novamente.');
        }
    } catch (error) {
        console.error('Error saving property:', error);
        alert('Erro ao salvar imóvel. Verifique sua conexão.');
    }
}

// Delete property
async function deleteProperty(id) {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProperties();
            alert('Imóvel excluído com sucesso!');
        } else {
            alert('Erro ao excluir imóvel. Tente novamente.');
        }
    } catch (error) {
        console.error('Error deleting property:', error);
        alert('Erro ao excluir imóvel. Verifique sua conexão.');
    }
}

// Close modal on outside click
document.getElementById('propertyModal').addEventListener('click', (e) => {
    if (e.target.id === 'propertyModal') {
        closeModal();
    }
});
