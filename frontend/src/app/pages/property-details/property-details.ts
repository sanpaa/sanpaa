import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property';
import { Property } from '../../models/property.model';
import * as L from 'leaflet';

// Fix Leaflet's default icon path issue with webpack
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-property-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css',
})
export class PropertyDetailsComponent implements OnInit, AfterViewInit {
  property: Property | null = null;
  loading = true;
  error = false;
  currentImageIndex = 0;
  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(id);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // Map will be initialized after property loads
  }

  loadProperty(id: string): void {
    this.loading = true;
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.property = properties.find(p => p.id === id) || null;
        this.loading = false;
        if (!this.property) {
          this.error = true;
        } else {
          // Initialize map after a short delay to ensure DOM is ready
          setTimeout(() => this.initMap(), 200);
        }
      },
      error: (err) => {
        console.error('Error loading property:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private initMap(): void {
    if (!this.property || !this.property.latitude || !this.property.longitude) return;

    const mapElement = document.getElementById('property-map');
    if (!mapElement) return;

    const lat = parseFloat(String(this.property.latitude));
    const lng = parseFloat(String(this.property.longitude));

    if (isNaN(lat) || isNaN(lng)) return;

    this.map = L.map('property-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(`<strong>${this.property.title}</strong><br>${this.getLocation()}`)
      .openPopup();
  }

  nextImage(): void {
    if (!this.property || !this.property.imageUrls) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.property.imageUrls.length;
  }

  prevImage(): void {
    if (!this.property || !this.property.imageUrls) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.property.imageUrls.length) % this.property.imageUrls.length;
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  getLocation(): string {
    if (!this.property) return '';
    if (this.property.city) {
      return `${this.property.street ? this.property.street + ', ' : ''}${this.property.neighborhood || ''}, ${this.property.city} - ${this.property.state}`;
    }
    return this.property.location || '';
  }

  formatPrice(price: number): string {
    return this.propertyService.formatPrice(price);
  }

  getWhatsAppLink(): string {
    if (!this.property) return '#';
    const phone = this.property.contact.replace(/\D/g, '');
    const message = `Olá, tenho interesse no imóvel: ${encodeURIComponent(this.property.title)}`;
    return `https://wa.me/${phone}?text=${message}`;
  }

  getMapsLink(): string {
    if (!this.property) return '#';
    return `https://www.google.com/maps?q=${this.property.latitude},${this.property.longitude}`;
  }

  get images(): string[] {
    if (!this.property) return [];
    return this.property.imageUrls || (this.property.imageUrl ? [this.property.imageUrl] : []);
  }

  get currentImage(): string | null {
    const imgs = this.images;
    return imgs.length > 0 ? imgs[this.currentImageIndex] : null;
  }
}
