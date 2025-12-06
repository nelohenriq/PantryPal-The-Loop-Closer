
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
  timeMinutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
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
  distance?: string; // New field for distance string (e.g. "1.2 miles")
  lastUpdated: number;
  knownIngredients: string[]; // List of ingredients confirmed to be here
  notes?: string;
}

export interface UserPreferences {
  isPremium?: boolean; // Track subscription status
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  allergies: string;
  nutritionalGoals: {
    maxCaloriesPerServing?: number;
    minProteinPerServing?: number; // in grams
  };
  ratings: Record<string, number>; // Map of recipeId -> rating (1-5)
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
