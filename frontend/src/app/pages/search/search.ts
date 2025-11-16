import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyCardComponent } from '../../components/property-card/property-card';
import { PropertyService } from '../../services/property';
import { Property, PropertyFilters } from '../../models/property.model';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class SearchComponent implements OnInit {
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
  
  constructor(private propertyService: PropertyService) {}
  
  ngOnInit(): void {
    this.loadProperties();
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
