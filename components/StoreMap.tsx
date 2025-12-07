import React, { useState, useMemo } from 'react';
import { SavedStore } from '../types';
import { MapPin, Navigation, ExternalLink, SquareCheck, Plus, ArrowRight, Store, X, Star, Calendar, Filter, LocateFixed, Edit2, Search, ScanEye } from 'lucide-react';
import { isIngredientMatch } from '../utils/ingredientMatching';
import { LabelDecoder } from './LabelDecoder';

interface StoreMapProps {
  missingIngredients: string[];
  stores: SavedStore[];
  summaryText?: string;
  loading: boolean;
  userLocationLabel?: string; // e.g. "Current Location" or "Chicago, IL"
  onClose: () => void;
  onAddToPantry: (items: string[]) => void;
  onLogPurchase: (items: string[]) => void;
  onChangeLocation: (location: string) => void;
  onRefreshLocation: () => void;
  onSuggestStore: (store: SavedStore) => void; // New prop
}

export const StoreMap: React.FC<StoreMapProps> = ({ 
  missingIngredients, 
  stores, 
  summaryText, 
  loading, 
  userLocationLabel = "Current Location",
  onClose, 
  onAddToPantry, 
  onLogPurchase,
  onChangeLocation,
  onRefreshLocation,
  onSuggestStore
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [filteredItems, setFilteredItems] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<SavedStore | null>(null);
  
  // Location Editing State
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  // Suggest Store State
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreNotes, setNewStoreNotes] = useState("");

  // Label Decoder State
  const [showLabelDecoder, setShowLabelDecoder] = useState(false);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        return next;
    });
  };

  const toggleFilter = (item: string) => {
    setFilteredItems(prev => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        return next;
    });
  };

  const handleFinish = () => {
    if (checkedItems.size > 0) {
        const itemsArray = Array.from(checkedItems);
        onAddToPantry(itemsArray);
        onLogPurchase(itemsArray); 
    }
    onClose();
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      onChangeLocation(locationInput.trim());
      setIsEditingLocation(false);
    }
  };

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStoreName.trim()) {
        onSuggestStore({
            name: newStoreName.trim(),
            address: newStoreAddress.trim(),
            notes: newStoreNotes.trim(),
            lastUpdated: Date.now(),
            knownIngredients: [],
            approved: false // Mark as pending
        });
        setIsAddingStore(false);
        setNewStoreName("");
        setNewStoreAddress("");
        setNewStoreNotes("");
        alert("Thanks! Your store has been added and is pending approval.");
    }
  };

  const getDirectionsUrl = (store: SavedStore) => {
    const query = store.address ? encodeURIComponent(store.address) : encodeURIComponent(store.name);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  // Filter stores based on selected ingredients
  const visibleStores = useMemo(() => {
    if (filteredItems.size === 0) return stores;

    return stores.filter(store => {
      // The store must have AT LEAST ONE of the selected filter items (OR logic)
      return Array.from(filteredItems).some((filterItem: string) => {
        const ingredients = (store.knownIngredients || []) as string[];
        return ingredients.some((ingredient: string) => {
           const ingStr = String(ingredient) as string;
           // Use fuzzy match or simple inclusion
           return isIngredientMatch(filterItem, ingStr) || 
           ingStr.toLowerCase().includes(filterItem.toLowerCase()) ||
           filterItem.toLowerCase().includes(ingStr.toLowerCase());
        });
      });
    });
  }, [stores, filteredItems]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 sm:rounded-none">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm z-10 bg-white dark:bg-gray-900">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Shopping Trip</h2>
          <div className="flex items-center gap-2 mt-1">
             <MapPin className="w-3 h-3 text-emerald-500" />
             {isEditingLocation ? (
               <form onSubmit={handleLocationSubmit} className="flex items-center gap-1">
                 <input 
                   type="text" 
                   value={locationInput}
                   onChange={(e) => setLocationInput(e.target.value)}
                   placeholder="City, Zip..."
                   className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 w-32 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                   autoFocus
                 />
                 <button type="submit" className="bg-emerald-500 text-white p-0.5 rounded hover:bg-emerald-600">
                   <ArrowRight className="w-3 h-3" />
                 </button>
                 <button type="button" onClick={() => setIsEditingLocation(false)} className="text-gray-400 hover:text-gray-600">
                   <X className="w-3 h-3" />
                 </button>
               </form>
             ) : (
               <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                 Near <span className="font-semibold text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400">{userLocationLabel}</span>
                 <button 
                   onClick={() => { setLocationInput(""); setIsEditingLocation(true); }}
                   className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-500"
                   title="Change Search Area"
                 >
                   <Edit2 className="w-3 h-3" />
                 </button>
                 <button 
                   onClick={onRefreshLocation}
                   className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-emerald-500"
                   title="Use Current GPS Location"
                 >
                   <LocateFixed className="w-3 h-3" />
                 </button>
               </span>
             )}
          </div>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
            
            {/* Left Column: Interactive Checklist */}
            <div className="p-4 lg:p-6 lg:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <SquareCheck className="w-5 h-5 text-emerald-600" />
                        Checklist
                    </h3>
                    
                    {/* Scan Label Button */}
                    <button 
                        onClick={() => setShowLabelDecoder(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition"
                    >
                        <ScanEye className="w-4 h-4" /> Scan Label
                    </button>
                </div>
                
                <div className="space-y-2">
                    {missingIngredients.map(ing => {
                        const isChecked = checkedItems.has(ing);
                        const isFiltered = filteredItems.has(ing);
                        
                        return (
                            <div 
                                key={ing} 
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                    isChecked 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 opacity-75' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm'
                                }`}
                            >
                                {/* Checkbox for "Bought" */}
                                <button
                                    onClick={() => toggleCheck(ing)}
                                    className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${
                                        isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                    title="Mark as bought"
                                >
                                    {isChecked && <Plus className="w-4 h-4 text-white" />}
                                </button>

                                {/* Item Name (Click to Filter) */}
                                <div className="flex-1 min-w-0">
                                    <span className={`block text-sm font-medium truncate ${isChecked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-200'}`}>
                                        {ing}
                                    </span>
                                </div>

                                {/* Filter Toggle */}
                                <button
                                    onClick={() => toggleFilter(ing)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        isFiltered 
                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900' 
                                            : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                    }`}
                                    title={isFiltered ? "Remove filter" : "Filter stores by this item"}
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {checkedItems.size > 0 && (
                    <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in slide-in-from-bottom-2">
                        <button 
                            onClick={handleFinish}
                            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                            Finish & Add to Pantry <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column: AI Map Results */}
            <div className="p-4 lg:p-6 space-y-4 lg:col-span-2 order-1 lg:order-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 animate-pulse">
                        <MapPin className="w-12 h-12 mb-4 text-emerald-500 opacity-50" />
                        <p className="text-lg font-medium">Scouting local stores...</p>
                        <p className="text-sm mt-1">Searching near {userLocationLabel}</p>
                        <span className="text-xs mt-4 text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Powered by Google Maps Grounding
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Filter Status */}
                        {filteredItems.size > 0 && (
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300 font-medium">
                                    <Filter className="w-4 h-4" />
                                    Filtering by: {Array.from(filteredItems).join(', ')}
                                </div>
                                <button 
                                    onClick={() => setFilteredItems(new Set())}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            </div>
                        )}

                        {/* AI Summary (Only show if not filtering, or shorten it) */}
                        {summaryText && filteredItems.size === 0 && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {summaryText}
                            </div>
                        )}

                        {/* Store Cards */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4 flex justify-between items-center">
                                <span>Suggested Locations</span>
                                <span className="text-xs font-normal text-gray-500">Showing {visibleStores.length} of {stores.length}</span>
                            </h3>
                            
                            {visibleStores.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visibleStores.map((store, idx) => {
                                    return (
                                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition group">
                                        {/* Store Image Placeholder */}
                                        <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            <img 
                                                src={store.imageUrl || `https://placehold.co/600x300/e2e8f0/475569?text=${encodeURIComponent(store.name)}`}
                                                alt={store.name}
                                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 flex flex-col text-white">
                                                <div className="flex gap-2 items-center">
                                                    <Store className="w-4 h-4" />
                                                    <span className="font-bold text-sm shadow-black drop-shadow-md truncate max-w-[200px]">{store.name}</span>
                                                    {/* Pending Approval Badge */}
                                                    {store.approved === false && (
                                                        <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded uppercase font-bold tracking-wider">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                                {store.distance && (
                                                    <span className="text-xs opacity-90 ml-6 flex items-center gap-1">
                                                        🚗 {store.distance}
                                                    </span>
                                                )}
                                            </div>
                                            {store.rating && (
                                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 dark:bg-black/80 rounded text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm shadow-sm">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                    {store.rating}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex flex-col gap-2 flex-1">
                                            {/* Address */}
                                            {store.address && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5 line-clamp-2">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    {store.address}
                                                </p>
                                            )}

                                            {/* Notes in List View */}
                                            {store.notes && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 pl-5 italic line-clamp-1">
                                                    "{store.notes}"
                                                </p>
                                            )}
                                            
                                            {/* Inventory Snippet */}
                                            {(store.knownIngredients || []).length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {(store.knownIngredients as string[]).map((ingredient: string, i: number) => {
                                                        const ingStr = String(ingredient) as string;
                                                        // Highlight if matches filter
                                                        const isMatch = Array.from(filteredItems).some((f: string) => 
                                                            isIngredientMatch(f, ingStr) || 
                                                            ingStr.toLowerCase().includes(f.toLowerCase())
                                                        );
                                                        
                                                        // Only show first 3 unless matching
                                                        if (!isMatch && i > 3 && !filteredItems.size) return null;

                                                        return (
                                                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                                isMatch 
                                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                                {ingStr}
                                                            </span>
                                                        );
                                                    })}
                                                    {store.knownIngredients.length > 3 && filteredItems.size === 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 text-gray-400">
                                                            +{store.knownIngredients.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-2 mt-auto pt-3">
                                                <button 
                                                    onClick={() => setSelectedStore(store)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                >
                                                    <ExternalLink className="w-4 h-4" /> View Info
                                                </button>
                                                <a 
                                                    href={getDirectionsUrl(store)}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                                >
                                                    <Navigation className="w-4 h-4" /> Directions
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                    <Store className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No stores match your filters.</p>
                                    <button 
                                        onClick={() => setFilteredItems(new Set())}
                                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}

                             {/* Suggest Store Footer */}
                             <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                {!isAddingStore ? (
                                    <button 
                                        onClick={() => setIsAddingStore(true)}
                                        className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Can't find your store? Suggest one
                                    </button>
                                ) : (
                                    <form onSubmit={handleSuggestSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Suggest a Local Store</h4>
                                        <div className="space-y-3">
                                            <input 
                                                type="text" 
                                                placeholder="Store Name *"
                                                required
                                                value={newStoreName}
                                                onChange={(e) => setNewStoreName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Address / City"
                                                value={newStoreAddress}
                                                onChange={(e) => setNewStoreAddress(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                             <textarea 
                                                placeholder="Notes (e.g. 'Great selection of kimchi')"
                                                value={newStoreNotes}
                                                onChange={(e) => setNewStoreNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20"
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsAddingStore(false)}
                                                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                                                >
                                                    Submit for Approval
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                             </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Label Decoder Modal */}
      {showLabelDecoder && (
        <LabelDecoder 
            missingIngredients={missingIngredients}
            onClose={() => setShowLabelDecoder(false)}
            onAddFromScan={(item) => {
                // Future enhancement: Add to bought list
                setShowLabelDecoder(false);
            }}
        />
      )}

      {/* Store Info Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
                     <img 
                        src={selectedStore.imageUrl || `https://placehold.co/600x300/e2e8f0/475569?text=${encodeURIComponent(selectedStore.name)}`}
                        alt={selectedStore.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <button 
                        onClick={() => setSelectedStore(null)}
                        className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2">
                             <h3 className="text-xl font-bold leading-tight">{selectedStore.name}</h3>
                             {selectedStore.approved === false && (
                                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded uppercase font-bold tracking-wider">
                                    Pending
                                </span>
                             )}
                        </div>
                       
                        <div className="flex gap-2 text-xs mt-1 opacity-90">
                            {selectedStore.rating && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {selectedStore.rating}</span>}
                            {selectedStore.distance && <span>• {selectedStore.distance} away</span>}
                        </div>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-900">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedStore.address || "Address not available"}</p>
                        </div>

                        {selectedStore.notes && (
                             <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                <p className="text-sm text-amber-800 dark:text-amber-400 italic">"{selectedStore.notes}"</p>
                             </div>
                        )}

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Inventory Check</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedStore.knownIngredients.length > 0 ? (
                                    (selectedStore.knownIngredients as string[]).map((item: string, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-100 dark:border-emerald-900/30 text-xs font-medium">
                                            {item}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No specific inventory details available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <a 
                        href={getDirectionsUrl(selectedStore)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        <Navigation className="w-5 h-5" /> Get Directions on Maps
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};