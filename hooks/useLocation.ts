import * as Location from 'expo-location';
import { useState } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setPermissionError(null);
    setLoading(true);
    try {
      const { granted } =
        await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setPermissionError('Permiso de ubicación denegado');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setPermissionError(null);
  };

  return {
    location,
    loading,
    permissionError,
    getCurrentLocation,
    clearLocation,
  };
}
