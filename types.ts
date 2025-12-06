
export interface Ingredient {
  name: string;
  quantity: string;
  category?: string;
  substitutes?: {
    name: string;
    quantity?: string;
    note?: string;
  }[];
}

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recipeType?: 'Meal' | 'Base Component'; // New field
  timeMinutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
  beveragePairing?: string; 
  nutrition: Nutrition;
  imageUrl?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  addedAt: number;
  expiryDate?: number; // timestamp
}

export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number; // 0 to 1
  ownedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  substitutableIngredients: Ingredient[];
}

export interface StoreResult {
  name: string;
  address: string;
  uri?: string;
  rating?: number;
  openNow?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            snippet: string;
        }[]
    }
  };
}

export interface SavedStore {
  name: string;
  address?: string; 
  placeId?: string; 
  imageUrl?: string; 
  rating?: number; 
  distance?: string; 
  lastUpdated: number;
  knownIngredients: string[]; 
  notes?: string;
  approved?: boolean; 
}

export interface UserPreferences {
  isPremium?: boolean; 
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  allergies: string;
  nutritionalGoals: {
    maxCaloriesPerServing?: number;
    minProteinPerServing?: number; 
  };
  ratings: Record<string, number>; 
}

// Analytics Types
export interface CookingEvent {
  timestamp: number;
  recipeId: string;
  recipeName: string;
  cuisine: string;
}

export interface ShoppingEvent {
  timestamp: number;
  itemCount: number;
  items: string[];
}
