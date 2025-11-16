import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyCardComponent } from '../../components/property-card/property-card';
import { PropertyService } from '../../services/property';
import { Property, PropertyFilters } from '../../models/property.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class SearchComponent implements OnInit, AfterViewInit {
  allProperties: Property[] = [];
  filteredProperties: Property[] = [];
  displayedProperties: Property[] = [];
  
  // Filters
  filters: PropertyFilters = {
    searchText: '',
    type: '',
    city: '',
    bedrooms: undefined,
    priceMin: undefined,
    priceMax: undefined
  };
  
  // Pagination
  currentPage = 1;
  propertiesPerPage = 9;
  totalPages = 0;
  
  // View state
  loading = true;
  error = false;
  currentView: 'grid' | 'map' = 'grid';
  sortBy = 'featured';
  
  // Available cities
  availableCities: string[] = [];
  
  // Map
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  
  constructor(private propertyService: PropertyService) {}
  
  ngOnInit(): void {
    this.loadProperties();
  }
  
  ngAfterViewInit(): void {
    // Map will be initialized when user switches to map view
  }
  
  loadProperties(): void {
    this.loading = true;
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.allProperties = properties.filter(p => !p.sold);
        this.populateCityFilter();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  populateCityFilter(): void {
    const cities = this.allProperties
      .map(p => p.city)
      .filter((c): c is string => !!c);
    this.availableCities = Array.from(new Set(cities)).sort();
  }
  
  applyFilters(): void {
    this.filteredProperties = this.propertyService.filterProperties(this.allProperties, this.filters);
    this.currentPage = 1;
    this.sortProperties();
  }
  
  clearFilters(): void {
    this.filters = {
      searchText: '',
      type: '',
      city: '',
      bedrooms: undefined,
      priceMin: undefined,
      priceMax: undefined
    };
    this.sortBy = 'featured';
    this.applyFilters();
  }
  
  sortProperties(): void {
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.filteredProperties.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'featured':
      default:
        this.filteredProperties.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }
    
    this.updatePagination();
  }
  
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProperties.length / this.propertiesPerPage);
    const startIndex = (this.currentPage - 1) * this.propertiesPerPage;
    const endIndex = Math.min(startIndex + this.propertiesPerPage, this.filteredProperties.length);
    this.displayedProperties = this.filteredProperties.slice(startIndex, endIndex);
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }
  
  switchView(view: 'grid' | 'map'): void {
    this.currentView = view;
    if (view === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
  }
  
  private initMap(): void {
    if (this.map) {
      this.updateMapMarkers();
      return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Default center (São Paulo)
    this.map = L.map('map').setView([-23.550520, -46.633308], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    const validProperties = this.filteredProperties.filter(p => p.latitude && p.longitude);

    if (validProperties.length === 0) {
      this.map.setView([-23.550520, -46.633308], 12);
      return;
    }

    const bounds: L.LatLngTuple[] = [];

    validProperties.forEach(property => {
      const lat = parseFloat(String(property.latitude));
      const lng = parseFloat(String(property.longitude));

      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });

      const images = property.imageUrls || (property.imageUrl ? [property.imageUrl] : []);
      const firstImage = images.length > 0 ? images[0] : null;
      const location = property.city ? 
        `${property.neighborhood || ''}, ${property.city} - ${property.state}` : 
        (property.location || '');

      const marker = L.marker([lat, lng], { icon });

      const popupContent = `
        <div style="min-width: 250px;">
          ${firstImage ? `<img src="${firstImage}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">${property.title}</h3>
          <div style="color: #666; font-size: 14px; margin-bottom: 10px;">
            <i class="fas fa-map-marker-alt" style="color: #004AAD;"></i> ${location}
          </div>
          <div style="font-size: 18px; font-weight: bold; color: #004AAD; margin-bottom: 10px;">
            R$ ${this.propertyService.formatPrice(property.price)}
          </div>
          <div style="color: #666; font-size: 14px; margin-bottom: 15px;">
            ${property.bedrooms ? `<i class="fas fa-bed"></i> ${property.bedrooms} quartos | ` : ''}
            ${property.area ? `<i class="fas fa-ruler-combined"></i> ${property.area}m²` : ''}
          </div>
          <a href="https://wa.me/${property.contact.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel: ${encodeURIComponent(property.title)}" 
             class="btn btn-primary" target="_blank" 
             style="display: inline-block; background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; width: 100%; text-align: center;">
            <i class="fab fa-whatsapp"></i> Tenho Interesse
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      marker.addTo(this.map!);
      this.markers.push(marker);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
  
  get resultsCount(): string {
    const total = this.filteredProperties.length;
    return `${total} ${total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`;
  }
  
  get paginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        pages.push(i);
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        pages.push(-1); // Represents ellipsis
      }
    }
    return pages;
  }
}
