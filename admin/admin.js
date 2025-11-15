const API_URL = '/api/properties';
let properties = [];
let editingId = null;

// Load properties on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    
    // Setup form submit handler
    document.getElementById('propertyForm').addEventListener('submit', handleFormSubmit);
});

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
    container.innerHTML = properties.map(property => `
        <div class="property-card">
            <div class="property-image">
                ${property.imageUrl ? 
                    `<img src="${property.imageUrl}" alt="${property.title}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image fa-3x\\'></i>'">` : 
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
    `).join('');
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
    document.getElementById('location').value = property.location || '';
    document.getElementById('bedrooms').value = property.bedrooms || '';
    document.getElementById('bathrooms').value = property.bathrooms || '';
    document.getElementById('area').value = property.area || '';
    document.getElementById('parking').value = property.parking || '';
    document.getElementById('imageUrl').value = property.imageUrl || '';
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

    const propertyData = {
        type: document.getElementById('type').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        location: document.getElementById('location').value,
        bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
        bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
        area: parseFloat(document.getElementById('area').value) || 0,
        parking: parseInt(document.getElementById('parking').value) || 0,
        imageUrl: document.getElementById('imageUrl').value,
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
