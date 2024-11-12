import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LocationService } from '../../services/location.service';
import { Location } from '../../interfaces/location.interface';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit {
  map!: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];
  selectedCategories: Set<string> = new Set(['Restaurante', 'Tienda']);
  currentPopup: mapboxgl.Popup | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.selectedCategories.add('Restaurante');
    this.selectedCategories.add('Tienda');
  }

  ngAfterViewInit(): void {
    this.locationService.getMapboxToken().subscribe(response => {
      this.initializeMap(response.mapboxToken);
    });
  }

  initializeMap(accessToken: string): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [2.1734, 41.3851],
      zoom: 12,
      accessToken: accessToken
    });

    this.map.on('load', () => {
      this.loadMarkers();
    });
  }

  loadMarkers(): void {
    this.locationService.getLocations().subscribe(locations => {
      locations.forEach((location: Location) => {
        const popupContent = this.createPopupContent(location);
        const markerColor = location.category === 'Restaurante' ? '#FF6200' : '#08AA2B';

        const popup = new mapboxgl.Popup({ closeOnClick: true }).setHTML(popupContent);

        const marker = new mapboxgl.Marker({
          color: markerColor
        })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(this.map);

        (marker as any).category = location.category.trim();

        // Close any open popup before opening a new one
        marker.getElement().addEventListener('click', () => {
          if (this.currentPopup) {
            this.currentPopup.remove();
          }
          this.currentPopup = popup;
        });

        this.markers.push(marker);
      });
    });
  }

  createPopupContent(location: Location): string {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(location.name)}`;
    const buttonColor = location.category === 'Restaurante' ? '#FF6200' : '#08AA2B';
  
    return `
      <div class="popup-content" style="font-family: 'Poppins', sans-serif; color: #333;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 1.2rem; font-weight: bold;">${location.name}</h3>
          <a style="font-size: 1.5rem; color: #333; cursor: pointer;" onclick="this.parentElement.parentElement.parentElement.remove()">✕</a>
        </div>
        <p style="margin-top: 10px; font-size: 0.8rem; color: #555;">${location.description}</p>
        <div style="margin-top: 15px;">
          <a href="${googleSearchUrl}" target="_blank" style="
            display: inline-block;
            padding: 10px 15px;
            background-color: ${buttonColor};
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9rem;
            //font-weight: bold;
            font-family: 'Poppins', sans-serif;
          ">
            Ver ${location.category === 'Restaurante' ? 'Restaurante' : 'Tienda'}
          </a>
        </div>
      </div>
    `;
  }
  

  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.filterMarkers();
  }

  filterMarkers(): void {
    this.markers.forEach(marker => {
      const category = (marker as any).category;
      marker.getElement().style.display = this.selectedCategories.has(category) ? 'block' : 'none';
    });
  }
}
