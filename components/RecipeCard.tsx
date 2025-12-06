
import React from 'react';
import { RecipeMatch, Ingredient } from '../types';
import { Clock, ChefHat, ShoppingCart, CircleCheck, RefreshCw, Eye, Flame, Heart, Star, Share2 } from 'lucide-react';

interface RecipeCardProps {
  match: RecipeMatch;
  isFavorite: boolean;
  userRating?: number;
  onShop: (missing: Ingredient[]) => void;
  onViewDetails: () => void;
  onCook: () => void;
  onToggleFavorite: () => void;
  onRate: (rating: number) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ match, isFavorite, userRating, onShop, onViewDetails, onCook, onToggleFavorite, onRate }) => {
  const { recipe, matchScore, missingIngredients, substitutableIngredients } = match;
  
  // Format score as percentage
  const scorePercent = Math.round(matchScore * 100);
  
  // Dynamic styling based on score
  const isHighMatch = scorePercent >= 80;
  const isMediumMatch = scorePercent >= 50 && scorePercent < 80;
  
  const scoreColor = isHighMatch 
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' 
    : isMediumMatch 
      ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' 
      : 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';

  const barColor = isHighMatch ? 'bg-emerald-500' : isMediumMatch ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600';

  // Group missing ingredients by category
  const groupedMissing = missingIngredients.reduce((acc, ing) => {
    const cat = ing.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const sortedCategories = Object.keys(groupedMissing).sort();
  const displayCategories = sortedCategories.slice(0, 3); // Show max 3 categories
  const hiddenCount = missingIngredients.length - displayCategories.reduce((sum, cat) => sum + groupedMissing[cat].length, 0);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: `PantryPal: ${recipe.name}`,
      text: `Check out this recipe for ${recipe.name}: ${recipe.description}\n\nCook time: ${recipe.timeMinutes}m\nDifficulty: ${recipe.difficulty}`,
      url: window.location.href 
    };

    try {
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            // Fallback to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                alert("Recipe details copied to clipboard!");
            } else {
                throw new Error("Clipboard not supported");
            }
        }
    } catch (err) {
        console.error("Share failed:", err);
        // Fallback for when clipboard API fails (e.g. non-secure context) or share fails
        alert("Could not share. You might need to be on HTTPS or a supported browser.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full hover:shadow-md transition duration-300 group relative">
      
      {/* Top Action Buttons */}
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
        </button>
        <button 
            type="button"
            onClick={handleShare}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            title="Share recipe"
        >
            <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Placeholder */}
      <div 
        onClick={onViewDetails}
        className="h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden cursor-pointer"
      >
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/400`} 
          alt={recipe.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-3 right-3 flex gap-2">
            <div className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-bold shadow-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.timeMinutes}m
            </div>
            {recipe.nutrition && (
                <div className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-bold shadow-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {recipe.nutrition.calories}
                </div>
            )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          <h3 className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">{recipe.name}</h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Match Header */}
        <div className="flex items-center justify-between mb-4">
           <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreColor} flex items-center gap-1.5`}>
             <ChefHat className="w-3.5 h-3.5" />
             {scorePercent}% Match
           </div>
           
           {/* Rating Stars */}
           <div className="flex gap-0.5">
             {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRate(star); }}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-3.5 h-3.5 ${
                        (userRating || 0) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`} 
                  />
                </button>
             ))}
           </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${scorePercent}%` }}></div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">{recipe.description}</p>

        {/* Ingredients Status Preview */}
        <div className="mb-4">
            {missingIngredients.length > 0 ? (
                <div className="space-y-2">
                    {displayCategories.map(cat => (
                        <div key={cat} className="flex items-start text-xs leading-snug">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 w-16 shrink-0 truncate mt-0.5">{cat}</span>
                            <div className="flex flex-wrap gap-1">
                                {groupedMissing[cat].map((ing, i) => (
                                    <span key={i} className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100/50 dark:border-red-900/30">
                                        {ing.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {hiddenCount > 0 && (
                        <div className="pl-16 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            +{hiddenCount} more items...
                        </div>
                    )}
                </div>
            ) : (
                 <span className="flex items-center gap-1 text-xs px-2 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800 font-medium w-full justify-center">
                   <CircleCheck className="w-3.5 h-3.5" /> All ingredients ready
                </span>
            )}
            
            {/* Substitutions */}
            {substitutableIngredients.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        <RefreshCw className="w-3 h-3" />
                        {substitutableIngredients.length} Swap{substitutableIngredients.length > 1 ? 's' : ''} available
                    </span>
                </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <button 
             type="button"
             onClick={onViewDetails}
             className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition flex items-center justify-center gap-2"
          >
             <Eye className="w-4 h-4" /> View
          </button>
          
          {missingIngredients.length > 0 ? (
            <button 
              type="button"
              onClick={() => onShop(missingIngredients)}
              className="flex-[1.5] py-2 rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-600 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop ({missingIngredients.length})
            </button>
          ) : (
            <button 
              type="button"
              onClick={onCook}
              className="flex-[1.5] py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
            >
              <ChefHat className="w-4 h-4" />
              Cook
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
