import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AIPropertySuggestion } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private apiUrl = '/api/ai';

  constructor(private http: HttpClient) {}

  getPropertySuggestions(data: {
    title?: string;
    description?: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    parking?: number;
    city?: string;
    neighborhood?: string;
  }): Observable<AIPropertySuggestion> {
    return this.http.post<AIPropertySuggestion>(`${this.apiUrl}/suggest`, data);
  }
}
