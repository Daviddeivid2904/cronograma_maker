// src/lib/storage.js

const STORAGE_KEYS = {
  ACTIVITIES: 'cronograma_activities',
  BLOCKS: 'cronograma_blocks',
  SETTINGS: 'cronograma_settings'
};

// Función para guardar datos en localStorage
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
}

// Función para cargar datos del localStorage
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error cargando del localStorage:', error);
    return defaultValue;
  }
}

// Función para limpiar datos del localStorage
export function clearStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
    return false;
  }
}

// Función para limpiar todo el localStorage de la aplicación
export function clearAllStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error limpiando todo el localStorage:', error);
    return false;
  }
}

// Función para verificar si localStorage está disponible
export function isStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

export { STORAGE_KEYS };
