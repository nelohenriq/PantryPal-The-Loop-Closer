
import React from 'react';
import { SavedStore } from '../types';
import { X, Store, Calendar, MapPin, Database, Navigation, Star } from 'lucide-react';

interface StoreKnowledgeBaseProps {
  stores: SavedStore[];
  onClose: () => void;
}

export const StoreKnowledgeBase: React.FC<StoreKnowledgeBaseProps> = ({ stores, onClose }) => {
  
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getDirectionsUrl = (store: SavedStore) => {
    const query = store.address ? encodeURIComponent(store.address) : encodeURIComponent(store.name);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Database className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Store Directory</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Places found & ingredients confirmed</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
               <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                  <Store className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No stores learned yet</h3>
               <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
                 Search for recipes and use the "Shop" feature. The app will automatically remember which stores have your ingredients.
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {stores.map((store, idx) => (
                 <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                    
                    {/* Store Image Placeholder */}
                    <div className="h-32 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                        <img 
                            src={store.imageUrl || `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(store.name)}`}
                            alt={store.name}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(store.name)}`;
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {store.rating || 'N/A'}
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{store.name}</h3>
                                {store.address && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1">
                                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                        {store.address}
                                    </p>
                                )}
                            </div>
                        </div>

                        {store.notes && (
                            <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                <p className="text-xs text-amber-800 dark:text-amber-400 italic">"{store.notes}"</p>
                            </div>
                        )}
                        
                        <div className="mt-2 mb-4">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Confirmed Inventory</p>
                            <div className="flex flex-wrap gap-1.5">
                                {store.knownIngredients.map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-100 dark:border-blue-900/30 font-medium">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Updated {formatDate(store.lastUpdated)}
                            </span>
                            <a 
                                href={getDirectionsUrl(store)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                <Navigation className="w-3 h-3" /> Get Directions
                            </a>
                        </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

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
