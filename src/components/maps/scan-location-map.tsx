'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ScanLocationPoint } from '@/lib/actions/tags';

type ScanLocationMapProps = {
  locations: ScanLocationPoint[];
  accessToken: string;
  className?: string;
};

export function ScanLocationMap({
  locations,
  accessToken,
  className,
}: ScanLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = accessToken;

    // Calculate initial center from locations or default to Indonesia
    let initialCenter: [number, number] = [117.0, -2.5]; // Indonesia center
    let initialZoom = 4;

    if (locations.length > 0) {
      const lngs = locations.map((l) => l.longitude);
      const lats = locations.map((l) => l.latitude);
      initialCenter = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
      ];
      initialZoom = 5;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: initialZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [accessToken, locations]);

  useEffect(() => {
    if (!map.current || !mapLoaded || locations.length === 0) return;

    // Wait for style to be fully loaded before adding sources
    if (!map.current.isStyleLoaded()) {
      const handleStyleLoad = () => {
        if (map.current) {
          addMapLayers();
        }
      };
      map.current.once('styledata', handleStyleLoad);
      return;
    }

    addMapLayers();

    function addMapLayers() {
      if (!map.current) return;

      // Convert locations to GeoJSON
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: locations.map((loc) => ({
          type: 'Feature',
          properties: {
            id: loc.id,
            tagCode: loc.tagCode,
            locationName: loc.locationName || 'Unknown location',
            isClaimed: loc.isClaimed,
            createdAt: loc.createdAt,
          },
          geometry: {
            type: 'Point',
            coordinates: [loc.longitude, loc.latitude],
          },
        })),
      };

      // Remove existing source and layers if they exist
      if (map.current.getSource('scans')) {
        if (map.current.getLayer('cluster-count'))
          map.current.removeLayer('cluster-count');
        if (map.current.getLayer('clusters'))
          map.current.removeLayer('clusters');
        if (map.current.getLayer('unclustered-point'))
          map.current.removeLayer('unclustered-point');
        map.current.removeSource('scans');
      }

      // Add source with clustering enabled
      map.current.addSource('scans', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circle layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'scans',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#8b5cf6', // violet for small clusters
            10,
            '#6366f1', // indigo for medium clusters
            50,
            '#3b82f6', // blue for large clusters
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Cluster count text
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'scans',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Unclustered point layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'scans',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['get', 'isClaimed'],
            '#10b981', // emerald for claimed
            '#f59e0b', // amber for unclaimed
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Click on cluster to zoom
      map.current.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId === undefined) return;

        const source = map.current!.getSource(
          'scans'
        ) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !zoom) return;

          const geometry = features[0].geometry;
          if (geometry.type === 'Point') {
            map.current!.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom,
            });
          }
        });
      });

      // Show popup on unclustered point click
      map.current.on('click', 'unclustered-point', (e) => {
        const features = e.features;
        if (!features || features.length === 0) return;

        const geometry = features[0].geometry;
        if (geometry.type !== 'Point') return;

        const coordinates = geometry.coordinates.slice() as [number, number];
        const props = features[0].properties;

        // Format date
        const date = new Date(props?.createdAt);
        const formattedDate = date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const html = `
          <div class="p-2 min-w-[180px]">
            <div class="font-semibold text-sm mb-1">${props?.tagCode || 'Unknown'}</div>
            <div class="text-xs text-gray-500 mb-2">${props?.locationName || 'Unknown location'}</div>
            <div class="flex items-center gap-2 text-xs">
              <span class="px-2 py-0.5 rounded-full ${props?.isClaimed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                ${props?.isClaimed ? 'Claimed' : 'Not Claimed'}
              </span>
            </div>
            <div class="text-xs text-gray-400 mt-2">${formattedDate}</div>
          </div>
        `;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Fit bounds to show all points if we have locations
      if (locations.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach((loc) => {
          bounds.extend([loc.longitude, loc.latitude]);
        });
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12,
        });
      } else if (locations.length === 1) {
        map.current.flyTo({
          center: [locations[0].longitude, locations[0].latitude],
          zoom: 12,
        });
      }
    }
  }, [mapLoaded, locations]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
    </div>
  );
}
