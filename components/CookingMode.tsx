
import React, { useState } from 'react';
import { Recipe } from '../types';
import { X, ArrowRight, ArrowLeft, CircleCheck, ChefHat } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onComplete: () => void; // New prop to trigger logging
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = recipe.instructions;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleFinish = () => {
      onComplete();
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div>
           <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">
             <ChefHat className="w-4 h-4" /> Chef Mode
           </div>
           <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{recipe.name}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
          <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Main Content - Focus Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-4xl mx-auto w-full">
        
        <div className="mb-8">
           <span className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-sm font-semibold mb-6">
              Step {currentStep + 1} of {steps.length}
           </span>
           <h3 className="text-2xl sm:text-4xl font-medium text-gray-900 dark:text-white leading-tight">
             {steps[currentStep]}
           </h3>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-8 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
        </div>

      </div>

      {/* Controls */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirst}
            className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </button>
          
          {isLast ? (
            <button 
                onClick={handleFinish}
                className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
            >
                <CircleCheck className="w-6 h-6" /> Finish Cooking
            </button>
          ) : (
            <button 
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex-[2] py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
            >
                Next Step <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
