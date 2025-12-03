import React, { useState } from 'react';
import { GroundingChunk } from '../types';
import { MapPin, Navigation, ExternalLink, CheckSquare, Plus, ArrowRight } from 'lucide-react';

interface StoreMapProps {
  missingIngredients: string[];
  storeData: { text: string; chunks: GroundingChunk[] } | null;
  loading: boolean;
  onClose: () => void;
  onAddToPantry: (items: string[]) => void;
}

export const StoreMap: React.FC<StoreMapProps> = ({ missingIngredients, storeData, loading, onClose, onAddToPantry }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Extract Map items from chunks
  const mapItems = storeData?.chunks.filter(c => c.maps) || [];

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        return next;
    });
  };

  const handleFinish = () => {
    if (checkedItems.size > 0) {
        if (window.confirm(`Add ${checkedItems.size} bought items to your pantry?`)) {
            onAddToPantry(Array.from(checkedItems));
        }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:rounded-none">
      
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 bg-white">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Shopping Trip</h2>
          <p className="text-xs text-gray-500">Locating items for your recipe</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
            
            {/* Left Column: Interactive Checklist */}
            <div className="p-4 lg:p-6 lg:border-r border-gray-200 bg-white order-2 lg:order-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    Shopping Checklist
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Check items off as you buy them. We'll add them to your pantry when you finish!
                </p>
                
                <div className="space-y-2">
                    {missingIngredients.map(ing => {
                        const isChecked = checkedItems.has(ing);
                        return (
                            <label 
                                key={ing} 
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    isChecked 
                                    ? 'bg-emerald-50 border-emerald-200 opacity-75' 
                                    : 'bg-white border-gray-200 hover:border-emerald-300 shadow-sm'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                    isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'
                                }`}>
                                    {isChecked && <Plus className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={() => toggleCheck(ing)}
                                    className="hidden"
                                />
                                <span className={`font-medium ${isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                    {ing}
                                </span>
                            </label>
                        );
                    })}
                </div>

                {checkedItems.size > 0 && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                        <button 
                            onClick={handleFinish}
                            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                            Finish & Add to Pantry <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column: AI Map Results */}
            <div className="p-4 lg:p-6 space-y-4 lg:col-span-2 order-1 lg:order-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 animate-pulse">
                        <MapPin className="w-12 h-12 mb-4 text-emerald-500 opacity-50" />
                        <p>Scouting local stores...</p>
                        <span className="text-xs mt-2 text-gray-400">Powered by Google Maps Grounding</span>
                    </div>
                ) : (
                    <>
                        {/* AI Summary */}
                        {storeData?.text && (
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-900 text-sm leading-relaxed whitespace-pre-wrap">
                                {storeData.text}
                            </div>
                        )}

                        {/* Store Cards */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 mt-4">Suggested Locations</h3>
                            {mapItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapItems.map((chunk, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="bg-blue-100 p-2 rounded-lg h-fit">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{chunk.maps?.title}</h4>
                                                    {/* If we had review snippets, we could show them here */}
                                                    {chunk.maps?.placeAnswerSources?.reviewSnippets?.[0] && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">
                                                            "{chunk.maps.placeAnswerSources.reviewSnippets[0].snippet}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-50">
                                            <a 
                                                href={chunk.maps?.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                                            >
                                                <ExternalLink className="w-4 h-4" /> View
                                            </a>
                                            <a 
                                                href={chunk.maps?.uri} // In a real app, this would be a specific directions link
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                            >
                                                <Navigation className="w-4 h-4" /> Go
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No specific map locations returned. Try a different query.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};