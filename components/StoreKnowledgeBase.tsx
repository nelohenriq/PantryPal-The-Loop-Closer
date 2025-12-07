
import React, { useState } from 'react';
import { SavedStore } from '../types';
import { X, Store, Calendar, MapPin, Database, Navigation, Star, Plus } from 'lucide-react';
import { saveStoreData } from '../services/storeStorage';

interface StoreKnowledgeBaseProps {
  stores: SavedStore[];
  onClose: () => void;
}

export const StoreKnowledgeBase: React.FC<StoreKnowledgeBaseProps> = ({ stores: initialStores, onClose }) => {
  // Local state for stores to reflect immediate updates
  const [stores, setStores] = useState<SavedStore[]>(initialStores);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreNotes, setNewStoreNotes] = useState("");

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getDirectionsUrl = (store: SavedStore) => {
    const query = store.address ? encodeURIComponent(store.address) : encodeURIComponent(store.name);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStoreName.trim()) {
        const newStore: SavedStore = {
            name: newStoreName.trim(),
            address: newStoreAddress.trim(),
            notes: newStoreNotes.trim(),
            lastUpdated: Date.now(),
            knownIngredients: [],
            approved: false // Mark as pending
        };
        
        // Save to storage and update local state
        const updatedStores = saveStoreData([newStore]);
        setStores(updatedStores);
        
        setIsAddingStore(false);
        setNewStoreName("");
        setNewStoreAddress("");
        setNewStoreNotes("");
        alert("Thanks! Your store has been added and is pending approval.");
    }
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
          
          {stores.length === 0 && !isAddingStore ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
               <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                  <Store className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No stores learned yet</h3>
               <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2 mb-6">
                 Search for recipes and use the "Shop" feature, or manually add your favorite local market.
               </p>
               <button 
                  onClick={() => setIsAddingStore(true)}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
               >
                  <Plus className="w-5 h-5" /> Add First Store
               </button>
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                            <div className="absolute bottom-3 left-3 flex flex-col text-white">
                                <div className="flex gap-2 items-center">
                                    <h3 className="font-bold text-lg leading-tight shadow-black drop-shadow-md">{store.name}</h3>
                                    {store.approved === false && (
                                        <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded uppercase font-bold tracking-wider shadow-sm">
                                            Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                            {store.rating && (
                                <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {store.rating}
                                </div>
                            )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            {store.address && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-start gap-1">
                                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                    {store.address}
                                </p>
                            )}

                            {store.notes && (
                                <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    <p className="text-xs text-amber-800 dark:text-amber-400 italic">"{store.notes}"</p>
                                </div>
                            )}
                            
                            {(store.knownIngredients || []).length > 0 && (
                                <div className="mt-2 mb-4">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Confirmed Inventory</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(store.knownIngredients || []).slice(0, 5).map((item, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-100 dark:border-blue-900/30 font-medium">
                                                {item}
                                            </span>
                                        ))}
                                        {(store.knownIngredients || []).length > 5 && (
                                            <span className="text-[10px] px-1.5 py-0.5 text-gray-400">
                                                +{(store.knownIngredients || []).length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

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

                {/* Add Store Section */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    {!isAddingStore ? (
                        <button 
                            onClick={() => setIsAddingStore(true)}
                            className="w-full py-4 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Know a great spot? Add a Store
                        </button>
                    ) : (
                        <form onSubmit={handleSuggestSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Add New Store
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Store Name *"
                                        required
                                        value={newStoreName}
                                        onChange={(e) => setNewStoreName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Address / City"
                                        value={newStoreAddress}
                                        onChange={(e) => setNewStoreAddress(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                    <textarea 
                                    placeholder="Notes (e.g. 'Best place for fresh kimchi', 'Cash only')"
                                    value={newStoreNotes}
                                    onChange={(e) => setNewStoreNotes(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                                />
                                <div className="flex gap-3 justify-end">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingStore(false)}
                                        className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition"
                                    >
                                        Add Store
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </>
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
