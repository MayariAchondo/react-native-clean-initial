import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export function useImagePicker(initialUri?: string) {
  const [imageUri, setImageUri] = useState<string | null>(initialUri ?? null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const pickFromCamera = async () => {
    setPermissionError(null);
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      setPermissionError('Permiso de cámara denegado');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    setPermissionError(null);
    const { granted } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      setPermissionError('Permiso de galería denegado');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setPermissionError(null);
  };

  return {
    imageUri,
    permissionError,
    pickFromCamera,
    pickFromGallery,
    clearImage,
  };
}
