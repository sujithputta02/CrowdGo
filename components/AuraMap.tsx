"use client";

import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { NIGHT_THEME, DAY_THEME } from '@/lib/maps-theme';
import { MapsService } from '@/lib/services/maps.service';
import { logger } from '@/lib/logger.client';

interface AuraMapProps {
  center?: { lat: number, lng: number };
  zoom?: number;
  isNightMode?: boolean;
  mapType?: 'roadmap' | 'satellite';
  polyline?: string;
  activeCategory?: 'all' | 'food' | 'restroom' | 'info';
  onPoiClick?: (location: { lat: number, lng: number }, name: string) => void;
}

// Global persistent guard to silence setOptions warnings across HMR
if (typeof window !== 'undefined' && !(window as any)._AURA_MAP_INITIALIZED) {
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    v: "weekly"
  });
  (window as any)._AURA_MAP_INITIALIZED = true;
}

export default function AuraMap({ 
  center = MapsService.WANKHEDE, 
  zoom = 18, 
  isNightMode = true,
  mapType = 'roadmap',
  polyline,
  activeCategory = 'all',
  onPoiClick
}: AuraMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const fetchPOIs = async (currentMap: any, MarkerClass: any, PinClass: any) => {
      try {
        const { Place } = await importLibrary("places") as any;
        
        const categoryTypes = [
          { type: 'restaurant', color: '#fbbf24', label: 'Snacks', id: 'food' },
          { type: 'cafe', color: '#fbbf24', label: 'Snacks', id: 'food' },
          { type: 'tourist_attraction', color: '#2dd4bf', label: 'Restroom', id: 'restroom' },
          { type: 'stadium', color: '#8b5cf6', label: 'Info', id: 'info' }
        ];

        const newMarkers: any[] = [];

        for (const cat of categoryTypes) {
          const request = {
            fields: ['displayName', 'location', 'businessStatus', 'types'],
            locationRestriction: {
              center: MapsService.WANKHEDE,
              radius: 300,
            },
            includedPrimaryTypes: [cat.type],
            maxResultCount: 15,
          };

          const { places } = await Place.searchNearby(request);

          if (places) {
            places.forEach((place: any) => {
              const pin = new PinClass({
                background: cat.color,
                borderColor: '#fff',
                glyphColor: '#fff',
                scale: 0.8
              });

              const marker = new MarkerClass({
                map: currentMap,
                position: place.location,
                title: place.displayName,
                content: pin, // Use the PinElement instance directly as per the latest SDK warning
                zIndex: 100
              });
              
              marker.addListener('gmp-click', () => {
                if (onPoiClick) {
                  onPoiClick(
                    { lat: place.location.lat(), lng: place.location.lng() }, 
                    place.displayName
                  );
                }
              });

              (marker as any).auraCategory = cat.id;
              newMarkers.push(marker);
            });
          }
        }
        setMarkers(newMarkers);
      } catch (err) {
        logger.warn("POI fetching skipped", { error: err });
      }
    };

    const initMap = async () => {
      try {
        const { Map, InfoWindow } = await importLibrary("maps") as any;
        const { AdvancedMarkerElement, PinElement } = await importLibrary("marker") as any;
        const { Place, SearchNearbyRequest } = await importLibrary("places") as any;
        await importLibrary("geometry");
        
        if (mapRef.current && !map) {
          const newMap = new Map(mapRef.current, {
            center,
            zoom,
            mapId: 'AURA_MAP_STADIUM',
            mapTypeId: mapType,
            disableDefaultUI: false,
            gestureHandling: "greedy",
            mapTypeControl: false,
            streetViewControl: false,
            backgroundColor: "#000"
          });
          setMap(newMap);

          // Fetch POIs once map is ready
          fetchPOIs(newMap, AdvancedMarkerElement, PinElement);
          setIsLoading(false);
        }
      } catch (error) {
        logger.error("AuraMap handshake error", error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [center, zoom, mapType, map, onPoiClick]);

  // Sync Category Visibility
  useEffect(() => {
    markers.forEach(marker => {
      if (activeCategory === 'all' || marker.auraCategory === activeCategory) {
        marker.map = map;
      } else {
        marker.map = null;
      }
    });
  }, [activeCategory, markers, map]);

  // Map Styles are now controlled via Google Cloud Console (Map ID)

  // Sync Polyline
  useEffect(() => {
    if (map && polyline) {
      const decodedPath = (window as any).google.maps.geometry.encoding.decodePath(polyline);
      const newPath = new (window as any).google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: isNightMode ? "#8b5cf6" : "#4f46e5",
        strokeOpacity: 1.0,
        strokeWeight: 6, // Premium visibility
        map: map
      });

      const bounds = new (window as any).google.maps.LatLngBounds();
      decodedPath.forEach((point: any) => bounds.extend(point));

      if (decodedPath.length > 0) {
        // Sea-Zoom Guard: Only fit bounds if the route is within 20km of the active venue
        const routeCenter = bounds.getCenter();
        const venueCenter = new (window as any).google.maps.LatLng(center.lat, center.lng);
        const distance = (window as any).google.maps.geometry.spherical.computeDistanceBetween(routeCenter, venueCenter);

        if (distance < 20000) {
          map.fitBounds(bounds, 80); // Increased padding
        } else {
          logger.warn('AuraMap route too far from venue, maintaining venue focus', { 
            distance: Math.round(distance) 
          });
        }
      }

      return () => {
        newPath.setMap(null);
      };
    }
  }, [polyline, map, isNightMode, center.lat, center.lng]);

  return (
    <div 
      className="w-full h-full relative min-h-[500px] bg-black rounded-[40px] overflow-hidden"
      role="application"
      aria-label="Interactive Stadium Map with real-time crowd flow"
    >
      <div ref={mapRef} className="w-full h-full absolute inset-0" />
      
      {/* Live region for real-time accessibility updates */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
      >
        {activeCategory !== 'all' ? `Filtering map by ${activeCategory}` : 'Showing all stadium points of interest'}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl z-20">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6" />
          <h3 className="text-xl font-black uppercase tracking-[0.3em] animate-pulse">Syncing Aura</h3>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mt-2">Handshaking with Google Cloud...</p>
        </div>
      )}
      
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />
    </div>
  );
}
