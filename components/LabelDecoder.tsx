
import React, { useRef, useState } from 'react';
import { X, Camera, ScanEye, Languages, LoaderCircle, Check, ArrowRight } from 'lucide-react';
import { identifyProductLabel } from '../services/geminiService';

interface LabelDecoderProps {
  onClose: () => void;
  missingIngredients?: string[];
  onAddFromScan?: (itemName: string) => void;
}

export const LabelDecoder: React.FC<LabelDecoderProps> = ({ onClose, missingIngredients = [], onAddFromScan }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    setAnalysis(null);

    try {
        const result = await identifyProductLabel(file, missingIngredients);
        setAnalysis(result);
    } catch (err) {
        setAnalysis("Failed to analyze image. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ScanEye className="w-5 h-5 text-emerald-500" /> Snap-to-Translate
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
            
            {/* Image Preview / Upload Area */}
            <div className="mb-6">
                {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm aspect-[4/3] bg-black">
                         <img src={imagePreview} alt="Label" className="w-full h-full object-contain" />
                         <button 
                            onClick={() => {
                                setImagePreview(null);
                                setAnalysis(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-md hover:bg-black/70 transition"
                         >
                            Retake
                         </button>
                    </div>
                ) : (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition cursor-pointer gap-3 aspect-[4/3]"
                    >
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                            <Camera className="w-8 h-8" />
                        </div>
                        <p className="font-medium text-center">Tap to Scan Label</p>
                        <p className="text-xs opacity-70 text-center max-w-[200px]">Take a photo of a jar, bottle, or package to translate and identify.</p>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={handleCapture}
                />
            </div>

            {/* Analysis Result */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in">
                    <LoaderCircle className="w-10 h-10 animate-spin text-emerald-500" />
                    <div className="space-y-1">
                        <p className="font-bold text-gray-900 dark:text-white">Analyzing Label...</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Translating text & identifying ingredients</p>
                    </div>
                </div>
            ) : analysis ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                        <Languages className="w-4 h-4" /> AI Analysis
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm prose dark:prose-invert prose-sm max-w-none">
                        <div className="markdown-content whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                            {analysis}
                        </div>
                    </div>

                    {/* Quick Actions (Future implementation) */}
                    <div className="mt-4 flex gap-2">
                       {onAddFromScan && (
                           <button 
                                onClick={() => {
                                    // Extract simple name from analysis if possible, or trigger manual add
                                    // For now just close, user has the info
                                    onClose();
                                }}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none"
                           >
                               Got it!
                           </button>
                       )}
                    </div>
                </div>
            ) : null}

        </div>
      </div>
    </div>
  );
};
