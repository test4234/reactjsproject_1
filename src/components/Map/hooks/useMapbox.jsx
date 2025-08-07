import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const useMapbox = (containerRef, initialCenter, onMoveEnd) => {
  const mapRef = useRef(null);

  // Memoize the move handler to avoid reattaching unnecessarily
  const handleMapMove = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      onMoveEnd({
        latitude: parseFloat(center.lat.toFixed(6)),
        longitude: parseFloat(center.lng.toFixed(6)),
      });
    }
  }, [onMoveEnd]);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialCenter.longitude, initialCenter.latitude],
        zoom: 12,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapRef.current.on('moveend', handleMapMove);
      mapRef.current.on('load', handleMapMove);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', handleMapMove);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef, initialCenter, handleMapMove]);

  return mapRef;
};

export default useMapbox;
