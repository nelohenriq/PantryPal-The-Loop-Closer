
import React, { useMemo } from 'react';
import { getAnalytics } from '../services/analyticsService';
import { X, TrendingUp, BarChart3, PieChart, ChefHat, ShoppingBag, Flame } from 'lucide-react';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const data = useMemo(() => getAnalytics(), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <BarChart3 className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Kitchen Stats</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usage trends & cooking habits</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
           
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                    <ChefHat className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Meals Cooked</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalMealsCooked}</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Est. Savings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${data.estimatedSavings}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">vs. Takeout</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                    <Flame className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Top Cuisine</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                        {data.topCuisines[0]?.[0] || 'N/A'}
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Cuisines Chart */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" /> Flavor Profile
                 </h3>
                 {data.topCuisines.length > 0 ? (
                     <div className="space-y-4">
                        {data.topCuisines.map(([cuisine, count]) => {
                           const percent = Math.round((count / data.totalMealsCooked) * 100);
                           return (
                              <div key={cuisine}>
                                 <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{cuisine}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{count} meals ({percent}%)</span>
                                 </div>
                                 <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500 rounded-full" 
                                        style={{ width: `${percent}%` }}
                                    />
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                 ) : (
                     <p className="text-center text-gray-400 py-8">Cook more meals to see your taste profile!</p>
                 )}
              </div>

              {/* Shopping Trends */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" /> Frequent Buys
                 </h3>
                 {data.topIngredients.length > 0 ? (
                     <div className="space-y-3">
                        {data.topIngredients.map(([item, count], i) => (
                           <div key={item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <div className="flex items-center gap-3">
                                 <span className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 shadow-sm">
                                    {i + 1}
                                 </span>
                                 <span className="font-medium text-gray-800 dark:text-white">{item}</span>
                              </div>
                              <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md">
                                 Bought {count}x
                              </span>
                           </div>
                        ))}
                     </div>
                 ) : (
                     <p className="text-center text-gray-400 py-8">Use the Shop feature to track your purchases!</p>
                 )}
              </div>
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
