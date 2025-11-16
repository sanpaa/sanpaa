import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyCardComponent } from '../../components/property-card/property-card';
import { PropertyService } from '../../services/property';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, PropertyCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  error = false;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.properties = properties.filter(p => !p.sold);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
