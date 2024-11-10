import { Component, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LocationService } from '../../services/location.service';
import { Location } from '../../interfaces/location.interface';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  map!: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];
  selectedCategories: Set<string> = new Set();

  constructor(private locationService: LocationService) {}

  ngAfterViewInit(): void {
    // Obtenemos el token desde el servicio
    this.locationService.getMapboxToken().subscribe(response => {
      this.initializeMap(response.mapboxToken);
    });
  }

  initializeMap(accessToken: string): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [2.1734, 41.3851], // Coordenadas de Barcelona
      zoom: 12,
      accessToken: accessToken // Asignamos el token aquí
    });

    this.map.on('load', () => {
      this.loadMarkers();
    });
  }

  loadMarkers(): void {
    this.locationService.getLocations().subscribe(locations => {
      locations.forEach((location: Location) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([location.longitude, location.latitude])
          .setPopup(new mapboxgl.Popup().setText(location.description))
          .addTo(this.map);

        (marker as any).category = location.category;
        this.markers.push(marker);
      });
    });
  }

  applyFilter(category: string): void {
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
      if (this.selectedCategories.size === 0 || this.selectedCategories.has(category)) {
        marker.getElement().style.display = 'block';
      } else {
        marker.getElement().style.display = 'none';
      }
    });
  }
}
