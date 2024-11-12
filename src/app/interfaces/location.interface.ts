// src/app/interfaces/location.interface.ts
export interface Location {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    category: string;
    createdAt?: string;
    updatedAt?: string;
    
}
