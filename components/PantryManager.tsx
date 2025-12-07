
import React, { useState, useRef } from 'react';
import { COMMON_PANTRY_ITEMS } from '../constants';
import { Plus, X, Search, Camera, LoaderCircle, CircleAlert, CalendarDays, Trash2, Clock, FileSpreadsheet, ScanBarcode, Scale } from 'lucide-react';
import { parseReceipt } from '../services/geminiService';
import { PantryItem } from '../types';
import { BarcodeScanner } from './BarcodeScanner';

interface PantryManagerProps {
  items: PantryItem[];
  onAdd: (name: string, expiry?: number, quantity?: string) => void;
  onRemove: (name: string) => void;
  onClose: () => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({ items, onAdd, onRemove, onClose }) => {
  const [customInput, setCustomInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [expiryInput, setExpiryInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      const expiry = expiryInput ? new Date(expiryInput).getTime() : undefined;
      onAdd(customInput.trim(), expiry, quantityInput.trim());
      setCustomInput('');
      setQuantityInput('');
      setExpiryInput('');
    }
  };

  const handleBarcodeDetected = (name: string) => {
      onAdd(name);
      setShowBarcodeScanner(false);
      // alert(`Added ${name} to pantry!`);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const extractedItems = await parseReceipt(file);
      let addedCount = 0;
      
      const existingNames = new Set(items.map(i => i.name.toLowerCase()));

      if (extractedItems.length > 0) {
        extractedItems.forEach(item => {
          if (!existingNames.has(item.toLowerCase())) {
            onAdd(item);
            addedCount++;
          }
        });
        
        if (addedCount === 0) {
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      let count = 0;
      lines.forEach(line => {
        // Simple CSV parse: Name, Date
        const [name, dateStr] = line.split(',').map(s => s.trim());
        if (name) {
          const expiry = dateStr ? new Date(dateStr).getTime() : undefined;
          onAdd(name.replace(/['"]/g, ''), isNaN(Number(expiry)) ? undefined : expiry);
          count++;
        }
      });
      alert(`Imported ${count} items from CSV.`);
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const getFreshnessColor = (expiry?: number) => {
    if (!expiry) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
    
    const daysLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'; // Expired
    if (daysLeft <= 3) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'; // Expiring soon
    return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'; // Fresh
  };

  const sortedCommonItems = [...COMMON_PANTRY_ITEMS].sort();
  const existingSet = new Set(items.map(i => i.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden relative border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pantry Tracker</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage stock & expirations</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search / Add / Scan */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3">
          <form onSubmit={handleCustomAdd} className="flex gap-2">
            <div className="relative flex-[2]">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Item name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm"
              />
            </div>
            
            <div className="relative flex-1">
                <Scale className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input 
                    type="text"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    placeholder="Qty"
                    className="w-full pl-9 pr-2 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm"
                />
            </div>

            <div className="relative w-12 sm:w-32">
                <CalendarDays className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none hidden sm:block" />
                <input 
                    type="date"
                    value={expiryInput}
                    onChange={(e) => setExpiryInput(e.target.value)}
                    className="w-full sm:pl-10 px-2 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm"
                />
            </div>

            <button 
              type="submit"
              disabled={!customInput.trim()}
              className="bg-emerald-600 text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition shadow-sm shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex gap-2">
             <button
               onClick={() => setShowBarcodeScanner(true)}
               className="flex-1 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-2 shadow-sm font-medium text-xs sm:text-sm"
             >
                <ScanBarcode className="w-4 h-4" />
                Barcode
             </button>

             <div className="relative flex-1">
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
                   className="w-full py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-2 shadow-sm font-medium text-xs sm:text-sm"
                 >
                   {isScanning ? (
                     <LoaderCircle className="w-4 h-4 animate-spin text-emerald-600" />
                   ) : (
                     <Camera className="w-4 h-4" />
                   )}
                   Receipt
                 </button>
             </div>

             <div className="relative flex-1 group">
                 <input 
                    type="file" 
                    ref={csvInputRef} 
                    className="hidden" 
                    accept=".csv"
                    onChange={handleCSVUpload}
                 />
                 <button 
                   onClick={() => csvInputRef.current?.click()}
                   className="w-full py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-2 shadow-sm font-medium text-xs sm:text-sm"
                 >
                   <FileSpreadsheet className="w-4 h-4" />
                   Import CSV
                 </button>
                 
                 {/* Format Tooltip */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none text-center shadow-xl z-20">
                    <p className="font-bold mb-1">Format: Name, Date</p>
                    <p className="opacity-80">e.g. "Rice, 2024-12-31"</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                 </div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Active Items */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> In Pantry ({items.length})</span>
              <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Sorted by expiry</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.sort((a,b) => (a.expiryDate || Infinity) - (b.expiryDate || Infinity)).map((item) => {
                const daysLeft = item.expiryDate 
                    ? Math.ceil((item.expiryDate - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                
                return (
                    <div
                        key={item.id}
                        className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${getFreshnessColor(item.expiryDate)}`}
                    >
                        <div className="flex flex-col min-w-0 flex-1 mr-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm truncate">{item.name}</span>
                                {item.quantity && (
                                    <span className="text-[10px] font-bold bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded ml-2">
                                        {item.quantity}
                                    </span>
                                )}
                            </div>
                            {item.expiryDate && (
                                <span className="text-[10px] opacity-80 flex items-center gap-1 font-medium mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {daysLeft && daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={() => setItemToRemove(item.name)}
                            className="p-1.5 hover:bg-black/10 rounded-lg transition shrink-0"
                        >
                            <Trash2 className="w-4 h-4 opacity-70" />
                        </button>
                    </div>
                );
              })}
              {items.length === 0 && (
                <p className="text-sm text-gray-400 italic col-span-2 text-center py-4">Your pantry is empty.</p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 text-gray-500 dark:text-gray-400">Quick Add Staples</h3>
            <div className="flex flex-wrap gap-2">
              {sortedCommonItems.map((item) => {
                const isActive = existingSet.has(item);
                if (isActive) return null;
                return (
                  <button
                    key={item}
                    onClick={() => onAdd(item)}
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

        {/* Barcode Scanner Overlay */}
        {showBarcodeScanner && (
            <BarcodeScanner 
                onDetected={handleBarcodeDetected}
                onClose={() => setShowBarcodeScanner(false)}
            />
        )}

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
                  Remove <span className="font-semibold text-gray-800 dark:text-gray-200">{itemToRemove}</span> from pantry?
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
                      onRemove(itemToRemove);
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
