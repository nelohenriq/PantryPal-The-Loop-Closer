
import { CookingEvent, ShoppingEvent, Recipe } from "../types";

const COOKING_KEY = 'pantrypal_analytics_cooking';
const SHOPPING_KEY = 'pantrypal_analytics_shopping';

export const logCookingEvent = (recipe: Recipe) => {
  try {
    const history: CookingEvent[] = JSON.parse(localStorage.getItem(COOKING_KEY) || '[]');
    const event: CookingEvent = {
      timestamp: Date.now(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      cuisine: recipe.cuisine
    };
    history.push(event);
    localStorage.setItem(COOKING_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to log cooking event", e);
  }
};

export const logShoppingEvent = (items: string[]) => {
  try {
    const history: ShoppingEvent[] = JSON.parse(localStorage.getItem(SHOPPING_KEY) || '[]');
    const event: ShoppingEvent = {
      timestamp: Date.now(),
      itemCount: items.length,
      items: items
    };
    history.push(event);
    localStorage.setItem(SHOPPING_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to log shopping event", e);
  }
};

export const getAnalytics = () => {
  const cookingHistory: CookingEvent[] = JSON.parse(localStorage.getItem(COOKING_KEY) || '[]');
  const shoppingHistory: ShoppingEvent[] = JSON.parse(localStorage.getItem(SHOPPING_KEY) || '[]');

  // Cuisine Distribution
  const cuisineCounts: Record<string, number> = {};
  cookingHistory.forEach(e => {
    const c = e.cuisine || 'Other';
    cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
  });

  // Top Ingredients Bought
  const ingredientCounts: Record<string, number> = {};
  shoppingHistory.forEach(e => {
    e.items.forEach(item => {
      ingredientCounts[item] = (ingredientCounts[item] || 0) + 1;
    });
  });

  const topCuisines = Object.entries(cuisineCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topIngredients = Object.entries(ingredientCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalMealsCooked = cookingHistory.length;
  // Arbitrary estimation: $15 saved per meal vs takeout
  const estimatedSavings = totalMealsCooked * 15;

  return {
    totalMealsCooked,
    estimatedSavings,
    topCuisines,
    topIngredients,
    recentActivity: cookingHistory.slice(-5).reverse()
  };
};
