export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking?: number;
  imageUrl?: string;
  imageUrls?: string[];
  location?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  contact: string;
  featured?: boolean;
  sold?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyFilters {
  searchText?: string;
  type?: string;
  city?: string;
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
}

export interface AIPropertySuggestion {
  title?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking?: number;
  priceHint?: string;
}
