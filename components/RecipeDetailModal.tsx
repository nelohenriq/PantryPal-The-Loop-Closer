import React, { useState, useEffect } from 'react';
import { RecipeMatch, Ingredient } from '../types';
import { X, CircleCheck, CircleAlert, RefreshCw, ShoppingCart, Clock, ChefHat, Check, PlayCircle, Flame, Activity, LoaderCircle } from 'lucide-react';
import { CookingMode } from './CookingMode';
import { generateRecipeImage } from '../services/geminiService';

interface RecipeDetailModalProps {
  match: RecipeMatch;
  onClose: () => void;
  onShop: (missing: Ingredient[]) => void;
  initialCookingMode?: boolean;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ match, onClose, onShop, initialCookingMode = false }) => {
  const [showCookingMode, setShowCookingMode] = useState(initialCookingMode);
  const [imageUrl, setImageUrl] = useState<string | null>(match.recipe.imageUrl || null);
  const [loadingImage, setLoadingImage] = useState(false);
  
  const { recipe, ownedIngredients, missingIngredients, substitutableIngredients } = match;

  useEffect(() => {
    // Generate an image if one doesn't exist
    if (!imageUrl) {
        setLoadingImage(true);
        generateRecipeImage(recipe.name, recipe.description)
            .then(url => {
                if (url) {
                    setImageUrl(url);
                    // In a real app, update the parent state here to cache it
                    match.recipe.imageUrl = url; 
                }
            })
            .finally(() => setLoadingImage(false));
    }
  }, [recipe.name, recipe.id]);
  
  if (showCookingMode) {
    return <CookingMode recipe={recipe} onClose={() => setShowCookingMode(false)} />;
  }

  const groupByCategory = (items: Ingredient[]) => {
    const groups: Record<string, Ingredient[]> = {};
    items.forEach(item => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  };

  const missingGrouped = groupByCategory(missingIngredients);
  const substitutableGrouped = groupByCategory(substitutableIngredients);
  const ownedGrouped = groupByCategory(ownedIngredients);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
       <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="relative h-48 sm:h-64 bg-gray-200 dark:bg-gray-800 shrink-0 group">
             {loadingImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                    <LoaderCircle className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
                    <span className="text-xs font-medium">Generating AI photo...</span>
                </div>
             ) : (
                <img 
                    src={imageUrl || `https://picsum.photos/seed/${recipe.id}/800/400`} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover transition duration-700" 
                />
             )}
             
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition">
               <X className="w-5 h-5" />
             </button>
             <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 shadow-black drop-shadow-md">{recipe.name}</h2>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {recipe.timeMinutes} min</span>
                  <span className="flex items-center gap-1.5"><ChefHat className="w-4 h-4" /> {recipe.difficulty}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">{recipe.cuisine}</span>
                </div>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-gray-900">
             
             {/* Nutrition Grid */}
             {recipe.nutrition && (
                 <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex justify-center items-center gap-1"><Flame className="w-3 h-3 text-orange-500"/> Cal</p>
                        <p className="font-bold text-gray-900 dark:text-white">{recipe.nutrition.calories}</p>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Protein</p>
                        <p className="font-bold text-gray-900 dark:text-white">{recipe.nutrition.protein}</p>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Carbs</p>
                        <p className="font-bold text-gray-900 dark:text-white">{recipe.nutrition.carbs}</p>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Fat</p>
                        <p className="font-bold text-gray-900 dark:text-white">{recipe.nutrition.fat}</p>
                    </div>
                 </div>
             )}

             {/* Ingredients Section */}
             <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">Ingredients</h3>
                
                <div className="space-y-6">
                   {/* Missing Ingredients - High Priority */}
                   {missingIngredients.length > 0 && (
                      <div>
                         <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> To Buy ({missingIngredients.length})
                         </h4>
                         <div className="space-y-4">
                           {Object.entries(missingGrouped).map(([cat, items]) => (
                             <div key={`missing-cat-${cat}`}>
                               <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{cat}</h5>
                               <div className="space-y-2">
                                 {items.map((ing, i) => (
                                    <div key={`missing-${i}`} className="flex items-start justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                                       <div className="flex items-start gap-3 relative z-10">
                                          <div className="mt-0.5 p-1.5 bg-white dark:bg-red-950 rounded-full text-red-500 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-900/50">
                                             <CircleAlert className="w-4 h-4" />
                                          </div>
                                          <div>
                                             <p className="font-bold text-gray-900 dark:text-white">{ing.name}</p>
                                             <p className="text-sm text-red-800 dark:text-red-300 font-medium">{ing.quantity}</p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                   )}

                   {/* Substitutable Ingredients - Medium Priority */}
                   {substitutableIngredients.length > 0 && (
                      <div>
                         <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Substitutions ({substitutableIngredients.length})
                         </h4>
                         <div className="space-y-4">
                           {Object.entries(substitutableGrouped).map(([cat, items]) => (
                             <div key={`subst-cat-${cat}`}>
                               <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{cat}</h5>
                               <div className="space-y-2">
                                 {items.map((ing, i) => (
                                    <div key={`sub-${i}`} className="flex items-start justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-900/30">
                                       <div className="flex items-start gap-3">
                                          <div className="mt-0.5 p-1.5 bg-white dark:bg-amber-950 rounded-full text-amber-500 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/50">
                                             <RefreshCw className="w-4 h-4" />
                                          </div>
                                          <div>
                                             <p className="font-semibold text-gray-900 dark:text-white">{ing.name}</p>
                                             <p className="text-sm text-gray-500 dark:text-gray-400">{ing.quantity}</p>
                                             <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium bg-amber-100/50 dark:bg-amber-900/40 px-2 py-0.5 rounded-md inline-block">
                                                Use pantry substitute
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                   )}

                   {/* Owned Ingredients - Low Priority */}
                   {ownedIngredients.length > 0 && (
                      <div>
                         <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4" /> In Pantry ({ownedIngredients.length})
                         </h4>
                         <div className="space-y-4">
                           {Object.entries(ownedGrouped).map(([cat, items]) => (
                             <div key={`owned-cat-${cat}`}>
                               <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{cat}</h5>
                               <div className="space-y-2">
                                 {items.map((ing, i) => (
                                    <div key={`owned-${i}`} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                       <div className="flex items-center gap-3">
                                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                                             <CircleCheck className="w-4 h-4" />
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-700 dark:text-gray-200">{ing.name}</p>
                                             <p className="text-xs text-gray-500 dark:text-gray-400">{ing.quantity}</p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>

             {/* Instructions Section */}
             <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Instructions</h3>
                    <button 
                        onClick={() => setShowCookingMode(true)}
                        className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                        <PlayCircle className="w-4 h-4" /> Start Cooking
                    </button>
                </div>
                <ol className="space-y-6">
                   {recipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-4 group">
                         <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold text-sm border border-emerald-200 dark:border-emerald-800 mt-0.5">
                            {idx + 1}
                         </span>
                         <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{step}</p>
                      </li>
                   ))}
                </ol>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-3 shrink-0">
             {missingIngredients.length > 0 ? (
                <button 
                  onClick={() => { onClose(); onShop(missingIngredients); }}
                  className="flex-1 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-600 transition shadow-lg shadow-gray-200 dark:shadow-none active:scale-95 duration-200"
                >
                   <ShoppingCart className="w-5 h-5" /> Shop for Missing ({missingIngredients.length})
                </button>
             ) : (
                <button 
                  onClick={() => setShowCookingMode(true)}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 duration-200"
                >
                   <PlayCircle className="w-5 h-5" /> Start Cooking Mode
                </button>
             )}
          </div>
       </div>
    </div>
  );
};