import { useState, useEffect } from 'react';

export const useStorage = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        let stored;
        if (isWeb()) {
          stored = localStorage.getItem(key);
        } else {
          // React Native - AsyncStorage
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          stored = await AsyncStorage.default.getItem(key);
        }
        if (stored) {
          setValue(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Erreur lecture storage:', error);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = async (newValue) => {
    try {
      setValue(newValue);
      if (isWeb()) {
        localStorage.setItem(key, JSON.stringify(newValue));
      } else {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error('Erreur écriture storage:', error);
    }
  };

  return [value, updateValue];
};