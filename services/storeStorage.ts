import { SavedStore } from "../types";

const STORAGE_KEY = 'pantrypal_store_kb';

export const getSavedStores = (): SavedStore[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load stores", e);
    return [];
  }
};

export const saveStoreData = (newStores: SavedStore[]) => {
  const currentStores = getSavedStores();
  
  newStores.forEach(newStore => {
    const existingIndex = currentStores.findIndex(s => s.name.toLowerCase() === newStore.name.toLowerCase());
    
    if (existingIndex >= 0) {
      // Merge inventory
      const existing = currentStores[existingIndex];
      const mergedIngredients = Array.from(new Set([
        ...existing.knownIngredients,
        ...newStore.knownIngredients
      ])).sort();

      currentStores[existingIndex] = {
        ...existing,
        lastUpdated: Date.now(),
        knownIngredients: mergedIngredients,
        notes: newStore.notes || existing.notes
      };
    } else {
      // Add new
      currentStores.push(newStore);
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStores));
  return currentStores;
};

export const clearStoreData = () => {
  localStorage.removeItem(STORAGE_KEY);
};