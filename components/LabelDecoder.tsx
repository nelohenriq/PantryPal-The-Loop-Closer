
import React, { useRef, useState } from 'react';
import { X, Camera, ScanEye, Languages, LoaderCircle, Check, ArrowRight, CircleCheck, CircleX } from 'lucide-react';
import { identifyProductLabel } from '../services/geminiService';
import { LabelAnalysis } from '../types';

interface LabelDecoderProps {
  onClose: () => void;
  missingIngredients?: string[];
  onConfirmMatch?: (itemName: string) => void;
}

export const LabelDecoder: React.FC<LabelDecoderProps> = ({ onClose, missingIngredients = [], onConfirmMatch }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LabelAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
        const result = await identifyProductLabel(file, missingIngredients);
        setAnalysis(result);
    } catch (err) {
        setError("Failed to analyze image. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleFoundIt = () => {
    if (analysis?.isMatch && analysis.matchedIngredient && onConfirmMatch) {
      onConfirmMatch(analysis.matchedIngredient);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ScanEye className="w-5 h-5 text-emerald-500" /> Label Decoder
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
                                setError(null);
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
                        <p className="text-xs opacity-70 text-center max-w-[200px]">Is this the right soy sauce? Let's find out.</p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cross-referencing your shopping list</p>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            ) : analysis ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
                    
                    {/* Verdict */}
                    <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                        analysis.isMatch 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}>
                        {analysis.isMatch ? 
                            <CircleCheck className="w-8 h-8 text-emerald-500 shrink-0" /> : 
                            <CircleX className="w-8 h-8 text-red-500 shrink-0" />
                        }
                        <div>
                           <h3 className="font-bold text-lg leading-tight">
                                {analysis.isMatch ? "Match Found!" : "Not a Match"}
                           </h3>
                           <p className="text-sm">
                                {analysis.isMatch 
                                    ? `This is a good match for "${analysis.matchedIngredient}".` 
                                    : "This doesn't seem to match any item on your list."}
                           </p>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                        <h4 className="text-lg font-bold">{analysis.productName}</h4>
                        {analysis.productNameOriginal && <p className="text-sm text-gray-500 -mt-3">{analysis.productNameOriginal}</p>}
                        
                        <p className="text-sm">{analysis.description}</p>
                        
                        <div>
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Flavor Profile</h5>
                            <div className="flex flex-wrap gap-2">
                                {analysis.flavorProfile.map(f => (
                                    <span key={f} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-medium rounded">{f}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Usage Tip</h5>
                            <p className="text-sm italic">"{analysis.usageTips}"</p>
                        </div>
                        
                        {analysis.funFact && (
                             <p className="text-xs pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-500">
                                <strong>Did you know?</strong> {analysis.funFact}
                             </p>
                        )}
                    </div>
                    
                    {/* Action Button */}
                     <button 
                        onClick={handleFoundIt}
                        className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg hover:scale-105 active:scale-100 ${
                            analysis.isMatch 
                            ? 'bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/30' 
                            : 'bg-gray-500 shadow-gray-200 dark:shadow-gray-900/30'
                        }`}
                     >
                        {analysis.isMatch ? "Found It! Add to Cart" : "Got it"}
                     </button>
                </div>
            ) : null}

        </div>
      </div>
    </div>
  );
};
