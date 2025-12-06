import React, { useState, useRef } from 'react';
import { COMMON_PANTRY_ITEMS } from '../constants';
import { Plus, X, Search, Camera, LoaderCircle, CircleAlert } from 'lucide-react';
import { parseReceipt } from '../services/geminiService';

interface PantryManagerProps {
  items: Set<string>;
  onToggleItem: (item: string) => void;
  onClose: () => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({ items, onToggleItem, onClose }) => {
  const [customInput, setCustomInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onToggleItem(customInput.trim());
      setCustomInput('');
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const extractedItems = await parseReceipt(file);
      let addedCount = 0;
      
      if (extractedItems.length > 0) {
        extractedItems.forEach(item => {
          // Only add if not already in pantry
          // Normalized checks could be done here, but strict check is safer for now
          // to prevent removing items (since onToggleItem toggles)
          if (!items.has(item)) {
            onToggleItem(item);
            addedCount++;
          }
        });
        
        if (addedCount > 0) {
            // Optional: You could show a toast here
            // For now, the items appearing in the list is feedback enough
        } else {
             alert("No new items found. You might already have everything on this receipt!");
        }
      } else {
        alert("Could not identify any food items on this receipt.");
      }
    } catch (err) {
      console.error("Receipt scan failed", err);
      alert("Failed to process the receipt. Please try again.");
    } finally {
      setIsScanning(false);
      // Reset input to allow scanning same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sortedCommonItems = [...COMMON_PANTRY_ITEMS].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden relative border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Virtual Pantry</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">What do you have at home?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search / Add / Scan */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex gap-2">
          <form onSubmit={handleCustomAdd} className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add ingredient (e.g., Gochujang)"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button 
              type="submit"
              disabled={!customInput.trim()}
              className="absolute right-2 top-2 bg-emerald-600 text-white p-1.5 rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="relative">
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleReceiptUpload}
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isScanning}
               className="h-full px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition flex items-center gap-2 shadow-sm font-medium"
               title="Scan Receipt"
             >
               {isScanning ? (
                 <LoaderCircle className="w-5 h-5 animate-spin text-emerald-600" />
               ) : (
                 <Camera className="w-5 h-5" />
               )}
               <span className="hidden sm:inline">Scan</span>
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Active Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              In Your Pantry ({items.size})
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(items).map((item) => (
                <button
                  key={item}
                  onClick={() => setItemToRemove(item)}
                  className="group flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"
                >
                  {item}
                  <X className="w-3.5 h-3.5 ml-2 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-200" />
                </button>
              ))}
              {items.size === 0 && (
                <p className="text-sm text-gray-400 italic">Your pantry is empty. Add items or scan a receipt.</p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-gray-500 dark:text-gray-400">Quick Add Common Items</h3>
            <div className="flex flex-wrap gap-2">
              {sortedCommonItems.map((item) => {
                const isActive = items.has(item);
                if (isActive) return null; // Don't show in suggestions if already active
                return (
                  <button
                    key={item}
                    onClick={() => onToggleItem(item)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition bg-white dark:bg-gray-800"
                  >
                    + {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-lg shadow-gray-200 dark:shadow-none"
          >
            Done
          </button>
        </div>

        {/* Remove Confirmation Overlay */}
        {itemToRemove && (
          <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 w-full max-w-xs transform transition-all scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full">
                  <CircleAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Remove Item?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to remove <span className="font-semibold text-gray-800 dark:text-gray-200">{itemToRemove}</span> from your pantry?
                </p>
                <div className="flex gap-3 w-full mt-2">
                  <button 
                    onClick={() => setItemToRemove(null)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onToggleItem(itemToRemove);
                      setItemToRemove(null);
                    }}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-200 dark:shadow-none"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};