import React from 'react';
import { RecipeMatch, Ingredient } from '../types';
import { Clock, ChefHat, ShoppingCart, CheckCircle2, AlertCircle, RefreshCw, Eye, Flame } from 'lucide-react';

interface RecipeCardProps {
  match: RecipeMatch;
  onShop: (missing: Ingredient[]) => void;
  onViewDetails: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ match, onShop, onViewDetails }) => {
  const { recipe, matchScore, missingIngredients, substitutableIngredients } = match;
  
  // Format score as percentage
  const scorePercent = Math.round(matchScore * 100);
  
  // Dynamic styling based on score
  const isHighMatch = scorePercent >= 80;
  const isMediumMatch = scorePercent >= 50 && scorePercent < 80;
  
  const scoreColor = isHighMatch 
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
    : isMediumMatch 
      ? 'text-amber-600 bg-amber-50 border-amber-200' 
      : 'text-gray-600 bg-gray-100 border-gray-200';

  const barColor = isHighMatch ? 'bg-emerald-500' : isMediumMatch ? 'bg-amber-500' : 'bg-gray-300';

  // Group missing ingredients by category
  const groupedMissing = missingIngredients.reduce((acc, ing) => {
    const cat = ing.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // Sort categories alphabetically or by custom order if needed
  const sortedCategories = Object.keys(groupedMissing).sort();
  const displayCategories = sortedCategories.slice(0, 3); // Show max 3 categories
  const hiddenCount = missingIngredients.length - displayCategories.reduce((sum, cat) => sum + groupedMissing[cat].length, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition duration-300 group">
      
      {/* Image Placeholder */}
      <div 
        onClick={onViewDetails}
        className="h-40 bg-gray-100 relative overflow-hidden cursor-pointer"
      >
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/400`} 
          alt={recipe.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-3 right-3 flex gap-2">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold shadow-sm text-gray-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.timeMinutes}m
            </div>
            {recipe.nutrition && (
                <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold shadow-sm text-orange-600 flex items-center gap-1">
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
           <span className="text-xs text-gray-400 font-medium">{recipe.difficulty}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${scorePercent}%` }}></div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{recipe.description}</p>

        {/* Ingredients Status Preview */}
        <div className="mb-4">
            {missingIngredients.length > 0 ? (
                <div className="space-y-2">
                    {displayCategories.map(cat => (
                        <div key={cat} className="flex items-start text-xs leading-snug">
                            <span className="font-semibold text-gray-500 w-16 shrink-0 truncate mt-0.5">{cat}</span>
                            <div className="flex flex-wrap gap-1">
                                {groupedMissing[cat].map((ing, i) => (
                                    <span key={i} className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100/50">
                                        {ing.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {hiddenCount > 0 && (
                        <div className="pl-16 text-[10px] text-gray-400 font-medium">
                            +{hiddenCount} more items...
                        </div>
                    )}
                </div>
            ) : (
                 <span className="flex items-center gap-1 text-xs px-2 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 font-medium w-full justify-center">
                   <CheckCircle2 className="w-3.5 h-3.5" /> All ingredients ready
                </span>
            )}
            
            {/* Substitutions */}
            {substitutableIngredients.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                        <RefreshCw className="w-3 h-3" />
                        {substitutableIngredients.length} Swap{substitutableIngredients.length > 1 ? 's' : ''} available
                    </span>
                </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <button 
             onClick={onViewDetails}
             className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2"
          >
             <Eye className="w-4 h-4" /> View
          </button>
          
          {missingIngredients.length > 0 ? (
            <button 
              onClick={() => onShop(missingIngredients)}
              className="flex-[1.5] py-2 rounded-xl bg-gray-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop ({missingIngredients.length})
            </button>
          ) : (
            <button className="flex-[1.5] py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition">
              <ChefHat className="w-4 h-4" />
              Cook
            </button>
          )}
        </div>
      </div>
    </div>
  );
};