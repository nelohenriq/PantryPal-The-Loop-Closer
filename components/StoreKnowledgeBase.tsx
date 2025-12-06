import React from 'react';
import { SavedStore } from '../types';
import { X, Store, Calendar, MapPin, Database } from 'lucide-react';

interface StoreKnowledgeBaseProps {
  stores: SavedStore[];
  onClose: () => void;
}

export const StoreKnowledgeBase: React.FC<StoreKnowledgeBaseProps> = ({ stores, onClose }) => {
  
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Database className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Store Knowledge Base</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {stores.map((store, idx) => (
                 <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-start gap-2.5">
                          <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                             <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{store.name}</h3>
                             {store.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{store.notes}</p>}
                          </div>
                       </div>
                       <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          Updated {formatDate(store.lastUpdated)}
                       </div>
                    </div>
                    
                    <div className="mt-4">
                       <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Confirmed Inventory</p>
                       <div className="flex flex-wrap gap-1.5">
                          {store.knownIngredients.map((item, i) => (
                             <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-100 dark:border-blue-900/30 font-medium">
                                {item}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
          <p className="text-xs text-gray-400 dark:text-gray-500 mr-auto flex items-center h-full">
            Data is saved locally on this device.
          </p>
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