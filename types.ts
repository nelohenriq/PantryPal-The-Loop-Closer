export interface Ingredient {
  name: string;
  quantity: string;
  category?: string;
  substitutes?: string[];
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
  nutrition: Nutrition;
  imageUrl?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  addedAt: number;
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
  lastUpdated: number;
  knownIngredients: string[]; // List of ingredients confirmed to be here
  notes?: string;
}

export interface UserPreferences {
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  allergies: string;
}