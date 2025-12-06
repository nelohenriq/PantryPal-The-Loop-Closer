
import React, { useState, useEffect, useMemo } from 'react';
import { generateRecipes, findStoresForIngredients, extractStoreInventory, StoreSearchResponse } from './services/geminiService';
import { Recipe, RecipeMatch, Ingredient, SavedStore, UserPreferences } from './types';
import { COMMON_PANTRY_ITEMS, CUISINE_SUGGESTIONS } from './constants';
import { PantryManager } from './components/PantryManager';
import { RecipeCard } from './components/RecipeCard';
import { StoreMap } from './components/StoreMap';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { StoreKnowledgeBase } from './components/StoreKnowledgeBase';
import { SettingsModal } from './components/SettingsModal';
import { saveStoreData, getSavedStores } from './services/storeStorage';
import { Search, ShoppingBag, ChefHat, Sparkles, MapPin, Filter, Store, Database, Settings, Lightbulb, Plus, Sun, Moon } from 'lucide-react';
import { isIngredientMatch, normalize } from './utils/ingredientMatching';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // State
  const [pantryItems, setPantryItems] = useState<Set<string>>(new Set([]));
  const [cuisineQuery, setCuisineQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPantry, setShowPantry] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    dietary: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false
    },
    allergies: ''
  });
  
  // Knowledge Base State
  const [savedStores, setSavedStores] = useState<SavedStore[]>([]);
  const [showStoreKB, setShowStoreKB] = useState(false);

  // Detail View State
  const [selectedMatch, setSelectedMatch] = useState<RecipeMatch | null>(null);
  const [startCookingMode, setStartCookingMode] = useState(false);
  
  // Shopping State
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [showStoreMap, setShowStoreMap] = useState(false);
  const [storeData, setStoreData] = useState<StoreSearchResponse | null>(null);
  const [isLocatingStores, setIsLocatingStores] = useState(false);

  // Load stores on mount
  useEffect(() => {
    setSavedStores(getSavedStores());
  }, []);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Handlers
  const togglePantryItem = (item: string) => {
    setPantryItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!cuisineQuery.trim()) return;

    setIsGenerating(true);
    setRecipes([]); // Clear previous results
    setActiveFilter('All'); // Reset filter
    try {
      const results = await generateRecipes(cuisineQuery, Array.from(pantryItems), userPreferences);
      setRecipes(results);
    } catch (error) {
      console.error("Error generating recipes:", error);
      alert("Something went wrong generating recipes. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestFromPantry = async () => {
    if (pantryItems.size === 0) {
      setShowPantry(true);
      return;
    }
    
    const suggestionQuery = "Authentic Asian recipes using my current ingredients";
    setCuisineQuery(suggestionQuery);
    setIsGenerating(true);
    setRecipes([]);
    setActiveFilter('All');

    try {
      const results = await generateRecipes(suggestionQuery, Array.from(pantryItems), userPreferences);
      setRecipes(results);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert("Could not generate suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Matching Logic
  const matchedRecipes = useMemo<RecipeMatch[]>(() => {
    if (!recipes.length) return [];

    const pantryList: string[] = Array.from(pantryItems);

    return recipes.map((recipe: Recipe) => {
      const owned: Ingredient[] = [];
      const missing: Ingredient[] = [];
      const substitutable: Ingredient[] = [];

      recipe.ingredients.forEach((ing: Ingredient) => {
        // 1. Check direct match
        const isOwned = pantryList.some((pantryItem: string) => 
            isIngredientMatch(ing.name, pantryItem)
        );
        
        if (isOwned) {
          owned.push(ing);
        } else {
          // 2. Check substitutes
          let isSubstitutable = false;
          if (ing.substitutes && ing.substitutes.length > 0) {
             isSubstitutable = ing.substitutes.some(sub => 
                 pantryList.some(pItem => isIngredientMatch(sub, pItem))
             );
          }

          if (isSubstitutable) {
             substitutable.push(ing);
          } else {
             missing.push(ing);
          }
        }
      });

      const totalRequired = recipe.ingredients.length;
      // Substitutes count towards the score now
      const effectiveOwned = owned.length + substitutable.length; 
      const matchScore = totalRequired === 0 ? 1 : effectiveOwned / totalRequired;

      return {
        recipe,
        matchScore,
        ownedIngredients: owned,
        missingIngredients: missing,
        substitutableIngredients: substitutable
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Sort best match first
  }, [recipes, pantryItems]);

  // Filtering Logic
  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'All') return matchedRecipes;
    if (activeFilter === 'Cook Now') return matchedRecipes.filter(m => m.missingIngredients.length === 0);
    return matchedRecipes.filter(m => m.recipe.difficulty === activeFilter);
  }, [matchedRecipes, activeFilter]);

  const handleShopForMissing = async (missing: Ingredient[]) => {
    const ingredientNames = missing.map(i => i.name);
    setShoppingList(ingredientNames);
    setShowStoreMap(true);
    setIsLocatingStores(true);
    setStoreData(null);

    try {
      // Get location (simplified for browser)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
           const { latitude, longitude } = position.coords;
           
           // 1. Find Stores
           const result = await findStoresForIngredients(ingredientNames, { lat: latitude, lng: longitude });
           setStoreData(result);
           setIsLocatingStores(false);

           // 2. Background process: Extract structured data and save to "Knowledge Base"
           if (result.text) {
             extractStoreInventory(result.text).then(newStores => {
               const updated = saveStoreData(newStores);
               setSavedStores(updated);
             });
           }

        }, (err) => {
           console.error("Geo error", err);
           alert("We need your location to find stores. Please enable permissions.");
           setIsLocatingStores(false);
           setShowStoreMap(false);
        });
      } else {
          alert("Geolocation is not supported by this browser.");
          setIsLocatingStores(false);
      }
    } catch (e) {
      console.error(e);
      setIsLocatingStores(false);
    }
  };

  const handleAddBoughtItems = (items: string[]) => {
    setPantryItems(prev => {
        const next = new Set(prev);
        items.forEach(item => {
             // Normalize to strip quantity and ensure consistent storage
             const clean = normalize(item);
             if (clean) {
                 // Convert "bok choy" to "Bok Choy" for display
                 const display = clean.split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                 next.add(display);
             }
        });
        return next;
    });
    // Optional feedback
    alert(`Added ${items.length} items to your pantry!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col pb-24 md:pb-0 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">PantryPal <span className="text-emerald-500 font-light">Asian</span></h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
            <input 
              type="text" 
              value={cuisineQuery}
              onChange={(e) => setCuisineQuery(e.target.value)}
              placeholder="Craving Asian food? (e.g., Spicy Ramen)"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-500 rounded-xl transition text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-4 h-4" />
          </form>

          {/* Nav Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                title="Toggle Theme"
            >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                title="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setShowStoreKB(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium text-sm"
            >
                <Database className="w-4 h-4" />
                Stores
            </button>
            <button 
                onClick={() => setShowPantry(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition font-medium text-sm"
            >
                <ShoppingBag className="w-4 h-4" />
                Pantry ({pantryItems.size})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-6">
        
        {/* Onboarding / Empty State */}
        {!recipes.length && !isGenerating && (
          <div className="flex flex-col items-center justify-center mt-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 dark:shadow-none">
               <Sparkles className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Discover Authentic Asian Flavors</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
              Tell us what ingredients you have, and we'll connect you to delicious Asian recipes and the local markets that sell what you're missing.
            </p>

            <div className="w-full max-w-md">
              {pantryItems.size > 0 ? (
                <button 
                  onClick={handleSuggestFromPantry}
                  className="w-full mb-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-200" />
                  Suggest Asian dishes from pantry
                </button>
              ) : (
                 <button
                    onClick={() => setShowPantry(true)}
                    className="w-full mb-8 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-2"
                 >
                    <Plus className="w-5 h-5" />
                    Add items to get suggestions
                 </button>
              )}

              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Popular Dishes</p>
              <div className="flex flex-wrap justify-center gap-2">
                {CUISINE_SUGGESTIONS.map(c => (
                  <button 
                    key={c}
                    onClick={() => { setCuisineQuery(c); handleSearch(); }}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-sm"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                 <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
                 <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                 <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                 <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
               </div>
             ))}
          </div>
        )}

        {/* Filter Bar */}
        {matchedRecipes.length > 0 && !isGenerating && (
           <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mr-2">
                <Filter className="w-4 h-4" /> Filter:
              </div>
              {['All', 'Cook Now', 'Easy', 'Medium', 'Hard'].map(filter => {
                const isActive = activeFilter === filter;
                let className = `px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 `;
                
                if (filter === 'Cook Now') {
                    if (isActive) {
                        className += 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none';
                    } else {
                        className += 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30';
                    }
                } else {
                    if (isActive) {
                        className += 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md';
                    } else {
                        className += 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
                    }
                }

                return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={className}
                    >
                      {filter === 'Cook Now' && <ChefHat className="w-3.5 h-3.5" />}
                      {filter}
                    </button>
                );
              })}
           </div>
        )}

        {/* Results */}
        {matchedRecipes.length > 0 && (
          <div className="space-y-8">
            
            {/* Filter Empty State */}
            {filteredRecipes.length === 0 && (
               <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeFilter === 'Cook Now' 
                        ? "No recipes matched exactly. Try the 'All' filter to see what you can make with a quick shopping trip!" 
                        : `No ${activeFilter.toLowerCase()} recipes found. Try a different filter.`}
                  </p>
                  <button 
                     onClick={() => setActiveFilter('All')}
                     className="mt-3 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                     Show all recipes
                  </button>
               </div>
            )}

            {/* High Matches */}
            {filteredRecipes.some(r => r.matchScore >= 0.8) && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cook Now</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">You have almost everything</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.filter(r => r.matchScore >= 0.8).map(match => (
                    <RecipeCard 
                      key={match.recipe.id} 
                      match={match} 
                      onShop={handleShopForMissing} 
                      onViewDetails={() => setSelectedMatch(match)}
                      onCook={() => {
                        setSelectedMatch(match);
                        setStartCookingMode(true);
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Shopping Trips */}
            {filteredRecipes.some(r => r.matchScore < 0.8) && (
              <section className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4 mt-4">
                   <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Worth a Quick Run</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">A few Asian ingredients missing</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.filter(r => r.matchScore < 0.8).map(match => (
                    <RecipeCard 
                      key={match.recipe.id} 
                      match={match} 
                      onShop={handleShopForMissing} 
                      onViewDetails={() => setSelectedMatch(match)}
                      onCook={() => {
                        setSelectedMatch(match);
                        setStartCookingMode(true);
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button 
            onClick={toggleTheme}
            className="w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition flex items-center justify-center"
        >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button 
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition flex items-center justify-center"
        >
            <Settings className="w-5 h-5" />
        </button>
        <button 
            onClick={() => setShowStoreKB(true)}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition flex items-center justify-center"
        >
            <Database className="w-5 h-5" />
        </button>
        <button 
            onClick={() => setShowPantry(true)}
            className="relative w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition flex items-center justify-center"
        >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
            {pantryItems.size}
            </span>
        </button>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal 
          preferences={userPreferences}
          onSave={setUserPreferences}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPantry && (
        <PantryManager 
          items={pantryItems} 
          onToggleItem={togglePantryItem} 
          onClose={() => setShowPantry(false)} 
        />
      )}

      {showStoreKB && (
        <StoreKnowledgeBase
            stores={savedStores}
            onClose={() => setShowStoreKB(false)}
        />
      )}

      {showStoreMap && (
        <StoreMap 
          missingIngredients={shoppingList}
          storeData={storeData}
          loading={isLocatingStores}
          onClose={() => setShowStoreMap(false)}
          onAddToPantry={handleAddBoughtItems}
        />
      )}

      {selectedMatch && (
        <RecipeDetailModal
          match={selectedMatch}
          initialCookingMode={startCookingMode}
          onClose={() => {
            setSelectedMatch(null);
            setStartCookingMode(false);
          }}
          onShop={handleShopForMissing}
        />
      )}
    </div>
  );
}
