
import React, { useState, useEffect, useMemo } from 'react';
import { generateRecipes, findStoresForIngredients, extractStoreInventory, StoreSearchResponse } from './services/geminiService';
import { Recipe, RecipeMatch, Ingredient, SavedStore, UserPreferences, PantryItem } from './types';
import { CUISINE_SUGGESTIONS } from './constants';
import { PantryManager } from './components/PantryManager';
import { RecipeCard } from './components/RecipeCard';
import { StoreMap } from './components/StoreMap';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { StoreKnowledgeBase } from './components/StoreKnowledgeBase';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PremiumModal } from './components/PremiumModal';
import { LandingPage } from './components/LandingPage';
import { logCookingEvent, logShoppingEvent } from './services/analyticsService';
import { saveStoreData, getSavedStores } from './services/storeStorage';
import { Search, ShoppingBag, ChefHat, Sparkles, Filter, Database, Settings, Lightbulb, Plus, Sun, Moon, Heart, BarChart3, Crown, Layers, Dices } from 'lucide-react';
import { isIngredientMatch, normalize } from './utils/ingredientMatching';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Landing Page State
  const [showLanding, setShowLanding] = useState(true);

  // State - Pantry Objects now
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('pantryItems');
       return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // State - Favorites
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('favoriteRecipes');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [cuisineQuery, setCuisineQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPantry, setShowPantry] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    isPremium: false,
    dietary: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false
    },
    allergies: '',
    spiceTolerance: 'Medium',
    servingSize: 2,
    appliances: {
      wok: false,
      riceCooker: false,
      airFryer: false,
      steamer: false,
      instantPot: false
    },
    nutritionalGoals: {
      maxCaloriesPerServing: undefined,
      minProteinPerServing: undefined
    },
    ratings: {} // Initialize ratings
  });

  // Load preferences from local storage if available
  useEffect(() => {
      const savedPrefs = localStorage.getItem('userPreferences');
      if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          // Ensure ratings and new fields exist for legacy data
          setUserPreferences({
             ...parsed,
             ratings: parsed.ratings || {},
             spiceTolerance: parsed.spiceTolerance || 'Medium',
             servingSize: parsed.servingSize || 2,
             appliances: parsed.appliances || {
                wok: false,
                riceCooker: false,
                airFryer: false,
                steamer: false,
                instantPot: false
             }
          });
      }
  }, []);

  // Save preferences
  useEffect(() => {
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);
  
  // Knowledge Base State
  const [savedStores, setSavedStores] = useState<SavedStore[]>([]);
  const [showStoreKB, setShowStoreKB] = useState(false);

  // Analytics State
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Premium State
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Detail View State
  const [selectedMatch, setSelectedMatch] = useState<RecipeMatch | null>(null);
  const [startCookingMode, setStartCookingMode] = useState(false);
  
  // Shopping State
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [showStoreMap, setShowStoreMap] = useState(false);
  const [foundStores, setFoundStores] = useState<SavedStore[]>([]);
  const [storeSearchText, setStoreSearchText] = useState<string>(""); 
  const [isLocatingStores, setIsLocatingStores] = useState(false);
  
  // Location Override State (e.g. "San Francisco")
  const [locationOverride, setLocationOverride] = useState<string | null>(null);
  // Detected Location from GPS Search (e.g. "San Jose, CA")
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Load stores on mount
  useEffect(() => {
    setSavedStores(getSavedStores());
  }, []);

  // Persist Pantry
  useEffect(() => {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
  }, [pantryItems]);

  // Persist Favorites
  useEffect(() => {
    localStorage.setItem('favoriteRecipes', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

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
  const goHome = () => {
    setRecipes([]);
    setCuisineQuery('');
    setShowLanding(true);
  };

  const addPantryItem = (name: string, expiry?: number, quantity?: string) => {
    // Premium Gate: Limit free users to 20 items
    if (!userPreferences.isPremium && pantryItems.length >= 20) {
        setShowPantry(false);
        setShowPremiumModal(true);
        return;
    }

    setPantryItems(prev => {
        const idx = prev.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { 
                ...updated[idx], 
                expiryDate: expiry || updated[idx].expiryDate,
                quantity: quantity || updated[idx].quantity 
            };
            return updated;
        }
        return [...prev, { id: crypto.randomUUID(), name, addedAt: Date.now(), expiryDate: expiry, quantity }];
    });
  };

  const removePantryItem = (name: string) => {
      setPantryItems(prev => prev.filter(i => i.name !== name));
  };

  const toggleFavorite = (recipeId: string) => {
      setFavorites(prev => {
          const next = new Set(prev);
          if (next.has(recipeId)) next.delete(recipeId);
          else next.add(recipeId);
          return next;
      });
  };

  const handleRateRecipe = (recipeId: string, rating: number) => {
    setUserPreferences(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [recipeId]: rating
      }
    }));
  };

  // Function to update recipe image URL in state
  const handleUpdateRecipeImage = (id: string, url: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, imageUrl: url } : r));
    
    // Also update selectedMatch if it matches, so the modal gets the new URL immediately
    if (selectedMatch && selectedMatch.recipe.id === id) {
        setSelectedMatch(prev => prev ? { ...prev, recipe: { ...prev.recipe, imageUrl: url } } : null);
    }
  };

  const handleUpgrade = () => {
      setUserPreferences(prev => ({ ...prev, isPremium: true }));
      setShowPremiumModal(false);
      alert("Welcome to PantryPal Pro! 🚀");
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const queryToUse = overrideQuery || cuisineQuery;

    if (!queryToUse.trim()) return;

    setIsGenerating(true);
    setRecipes([]); 
    setActiveFilter('All'); 
    
    try {
      const results = await generateRecipes(
          queryToUse, 
          pantryItems.map(i => i.name), // Pass just names to AI
          userPreferences
      );
      setRecipes(results);
    } catch (error) {
      console.error("Error generating recipes:", error);
      alert("Something went wrong generating recipes. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestFromPantry = async () => {
    if (pantryItems.length === 0) {
      setShowPantry(true);
      return;
    }
    
    const suggestionQuery = "Authentic Asian recipes using my current ingredients";
    setCuisineQuery(suggestionQuery);
    setIsGenerating(true);
    setRecipes([]);
    setActiveFilter('All');

    try {
      const results = await generateRecipes(
          suggestionQuery, 
          pantryItems.map(i => i.name), 
          userPreferences
      );
      setRecipes(results);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert("Could not generate suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeelingLucky = () => {
    const luckyQuery = "A unique, highly-rated Asian dish that fits my dietary preferences. Surprise me!";
    setCuisineQuery(luckyQuery);
    handleSearch(undefined, luckyQuery);
  };

  // Matching Logic
  const matchedRecipes = useMemo<RecipeMatch[]>(() => {
    if (!recipes.length) return [];

    const pantryNames = pantryItems.map(i => i.name);

    return recipes.map((recipe: Recipe) => {
      const owned: Ingredient[] = [];
      const missing: Ingredient[] = [];
      const substitutable: Ingredient[] = [];

      // Defensive check: Ensure recipe.ingredients is an array
      (recipe.ingredients || []).forEach((ing: Ingredient) => {
        // 1. Check direct match
        const isOwned = pantryNames.some((pName) => isIngredientMatch(ing.name, pName));
        
        if (isOwned) {
          owned.push(ing);
        } else {
          // 2. Check substitutes based on object structure or string (handle legacy)
          let isSubstitutable = false;
          if (ing.substitutes && ing.substitutes.length > 0) {
             // Handle if substitutes are strings or objects
             isSubstitutable = ing.substitutes.some((sub: any) => {
                 const subName = typeof sub === 'string' ? sub : sub.name;
                 return pantryNames.some(pName => isIngredientMatch(subName, pName));
             });
          }

          if (isSubstitutable) {
             substitutable.push(ing);
          } else {
             missing.push(ing);
          }
        }
      });

      const totalRequired = (recipe.ingredients || []).length;
      const effectiveOwned = owned.length + substitutable.length; 
      const matchScore = totalRequired === 0 ? 1 : effectiveOwned / totalRequired;

      return {
        recipe,
        matchScore,
        ownedIngredients: owned,
        missingIngredients: missing,
        substitutableIngredients: substitutable
      };
    }).sort((a, b) => b.matchScore - a.matchScore); 
  }, [recipes, pantryItems]);

  // Filtering Logic
  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'Favorites') return matchedRecipes.filter(m => favorites.has(m.recipe.id));
    if (activeFilter === 'All') return matchedRecipes;
    if (activeFilter === 'Cook Now') return matchedRecipes.filter(m => m.missingIngredients.length === 0);
    if (activeFilter === 'Staples') return matchedRecipes.filter(m => m.recipe.recipeType === 'Base Component');
    return matchedRecipes.filter(m => m.recipe.difficulty === activeFilter);
  }, [matchedRecipes, activeFilter, favorites]);
  
  // Check if any staples exist to show the filter
  const hasStaples = matchedRecipes.some(m => m.recipe.recipeType === 'Base Component');

  // SHOPPING LOGIC
  const handleShopForMissing = async (missing: Ingredient[], manualLocation?: string) => {
    const ingredientNames = missing.map(i => i.name);
    setShoppingList(ingredientNames);
    setShowStoreMap(true);
    setIsLocatingStores(true);
    setFoundStores([]);
    setStoreSearchText("");
    setDetectedLocation(null);

    const locToUse = manualLocation || locationOverride;

    try {
      if (locToUse) {
         // USE MANUAL LOCATION
         const result = await findStoresForIngredients(ingredientNames, locToUse);
         setStoreSearchText(result.text);

         if (result.text) {
             const { stores: parsedStores, detectedLocation: detected } = await extractStoreInventory(result.text);
             setFoundStores(parsedStores || []); // Defensive empty array
             if (detected) setDetectedLocation(detected);
             const updated = saveStoreData(parsedStores || []);
             setSavedStores(updated);
         }
         setIsLocatingStores(false);
      } else {
         // USE GPS
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
               const { latitude, longitude } = position.coords;
               
               const result = await findStoresForIngredients(ingredientNames, { lat: latitude, lng: longitude });
               setStoreSearchText(result.text);

               if (result.text) {
                 const { stores: parsedStores, detectedLocation: detected } = await extractStoreInventory(result.text);
                 setFoundStores(parsedStores || []); // Defensive empty array
                 if (detected) setDetectedLocation(detected);
                 
                 const updated = saveStoreData(parsedStores || []);
                 setSavedStores(updated);
               }
               
               setIsLocatingStores(false);
            }, (err) => {
               console.error("Geo error", err);
               alert("Could not get location. Try entering your city manually.");
               setIsLocatingStores(false);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0 // Force fresh location
            });
         } else {
            alert("Geolocation is not supported. Please enter a manual location.");
            setIsLocatingStores(false);
         }
      }
    } catch (e) {
      console.error(e);
      setIsLocatingStores(false);
    }
  };

  const handleUpdateLocation = (loc: string) => {
      setLocationOverride(loc);
      // Re-trigger search with new location but same items
      if (shoppingList.length > 0) {
          const missingObjs = shoppingList.map(name => ({ name, quantity: '' })); // Mock ingredient obj
          handleShopForMissing(missingObjs as Ingredient[], loc);
      }
  };

  const handleRefreshLocation = () => {
      setLocationOverride(null); // Clear override
      // Re-trigger search with GPS
      if (shoppingList.length > 0) {
        const missingObjs = shoppingList.map(name => ({ name, quantity: '' }));
        // Pass undefined to force GPS path
        handleShopForMissing(missingObjs as Ingredient[], undefined);
      }
  };

  const handleSuggestStore = (newStore: SavedStore) => {
    // Add to found stores to show immediately
    setFoundStores(prev => [...prev, newStore]);
    // Save to permanent storage
    const updated = saveStoreData([newStore]);
    setSavedStores(updated);
  };

  const handleAddBoughtItems = (items: string[]) => {
    items.forEach(item => {
         const clean = normalize(item);
         if (clean) {
             const display = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
             addPantryItem(display); // Add with no expiry by default
         }
    });
    // alert(`Added ${items.length} items to your pantry!`);
  };

  const handleLogPurchase = (items: string[]) => {
      logShoppingEvent(items);
  };

  const handleCompleteCooking = () => {
      if (selectedMatch) {
          logCookingEvent(selectedMatch.recipe);
      }
  };

  // Render Landing Page if active
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col pb-24 md:pb-0 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4 w-full">
          <div 
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
            onClick={goHome}
            title="Back to Home"
          >
            <div className="bg-emerald-500 p-2 rounded-lg text-white group-hover:bg-emerald-600 transition">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">PantryPal <span className="text-emerald-500 font-light">Asian</span></h1>
          </div>

          <form onSubmit={(e) => handleSearch(e)} className="flex-1 max-w-lg relative flex items-center self-center my-auto">
            <input 
              type="text" 
              value={cuisineQuery}
              onChange={(e) => setCuisineQuery(e.target.value)}
              placeholder="Craving Asian food? (e.g., Spicy Ramen)"
              className="w-full pl-10 pr-4 h-10 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-500 rounded-xl transition text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          </form>

          <div className="hidden md:flex items-center gap-2">
            {!userPreferences.isPremium && (
                <button
                    onClick={() => setShowPremiumModal(true)}
                    className="flex items-center gap-1 h-10 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition font-bold text-xs shadow-sm"
                >
                    <Crown className="w-3.5 h-3.5 fill-white" />
                    Pro
                </button>
            )}

            <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                title="Toggle Theme"
            >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
                onClick={() => setShowAnalytics(true)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                title="Analytics"
            >
                <BarChart3 className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                title="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setShowStoreKB(true)}
                className="flex items-center gap-2 h-10 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium text-sm"
            >
                <Database className="w-4 h-4" />
                Stores
            </button>
            <button 
                onClick={() => setShowPantry(true)}
                className="flex items-center gap-2 h-10 px-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition font-medium text-sm"
            >
                <ShoppingBag className="w-4 h-4" />
                Pantry ({pantryItems.length})
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

            <div className="w-full max-w-md space-y-3">
              {pantryItems.length > 0 ? (
                <button 
                  onClick={handleSuggestFromPantry}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-200" />
                  Suggest Asian dishes from pantry
                </button>
              ) : (
                 <button
                    onClick={() => setShowPantry(true)}
                    className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-2"
                 >
                    <Plus className="w-5 h-5" />
                    Add items to get suggestions
                 </button>
              )}

              <button 
                  onClick={handleFeelingLucky}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                  <Dices className="w-5 h-5 text-purple-200" />
                  I'm Feeling Lucky
              </button>

              <div className="pt-5">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Popular Dishes</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {CUISINE_SUGGESTIONS.map(c => (
                    <button 
                        key={c}
                        onClick={() => { 
                            setCuisineQuery(c); 
                            handleSearch(undefined, c); 
                        }}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-sm"
                    >
                        {c}
                    </button>
                    ))}
                </div>
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
              {['All', 'Cook Now', 'Favorites', ...(hasStaples ? ['Staples'] : []), 'Easy', 'Medium', 'Hard'].map(filter => {
                const isActive = activeFilter === filter;
                let className = `px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 `;
                
                if (filter === 'Cook Now') {
                    if (isActive) {
                        className += 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none';
                    } else {
                        className += 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30';
                    }
                } else if (filter === 'Favorites') {
                    if (isActive) {
                         className += 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-none';
                    } else {
                         className += 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30';
                    }
                } else if (filter === 'Staples') {
                    if (isActive) {
                        className += 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none';
                    } else {
                        className += 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30';
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
                      {filter === 'Favorites' && <Heart className="w-3.5 h-3.5 fill-current" />}
                      {filter === 'Staples' && <Layers className="w-3.5 h-3.5" />}
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
                        : activeFilter === 'Favorites' 
                             ? "You haven't saved any recipes yet. Heart items you love to find them here!"
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

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(match => (
                    <RecipeCard 
                      key={match.recipe.id} 
                      match={match}
                      isFavorite={favorites.has(match.recipe.id)} 
                      userRating={userPreferences.ratings[match.recipe.id]}
                      onToggleFavorite={() => toggleFavorite(match.recipe.id)}
                      onRate={(rating) => handleRateRecipe(match.recipe.id, rating)}
                      onShop={handleShopForMissing} 
                      onViewDetails={() => setSelectedMatch(match)}
                      onCook={() => {
                        setSelectedMatch(match);
                        setStartCookingMode(true);
                      }}
                      onImageUpdate={handleUpdateRecipeImage}
                    />
                  ))}
            </div>

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
            onClick={() => setShowAnalytics(true)}
            className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition flex items-center justify-center"
        >
            <BarChart3 className="w-5 h-5" />
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
            {pantryItems.length}
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

      {showPremiumModal && (
        <PremiumModal
            onClose={() => setShowPremiumModal(false)}
            onUpgrade={handleUpgrade}
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard 
            onClose={() => setShowAnalytics(false)}
        />
      )}

      {showPantry && (
        <PantryManager 
          items={pantryItems} 
          onAdd={addPantryItem}
          onRemove={removePantryItem}
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
          stores={foundStores}
          summaryText={storeSearchText}
          loading={isLocatingStores}
          userLocationLabel={locationOverride || detectedLocation || "Current Location"}
          onClose={() => setShowStoreMap(false)}
          onAddToPantry={handleAddBoughtItems}
          onLogPurchase={handleLogPurchase}
          onChangeLocation={handleUpdateLocation}
          onRefreshLocation={handleRefreshLocation}
          onSuggestStore={handleSuggestStore}
        />
      )}

      {selectedMatch && (
        <RecipeDetailModal
          match={selectedMatch}
          userRating={userPreferences.ratings[selectedMatch.recipe.id]}
          initialCookingMode={startCookingMode}
          onClose={() => {
            setSelectedMatch(null);
            setStartCookingMode(false);
          }}
          onShop={handleShopForMissing}
          onCompleteCooking={handleCompleteCooking}
          onRate={(rating) => handleRateRecipe(selectedMatch.recipe.id, rating)}
        />
      )}
    </div>
  );
}