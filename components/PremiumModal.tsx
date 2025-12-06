
import React from 'react';
import { X, Check, Crown, Zap, Sparkles, ChefHat } from 'lucide-react';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-amber-200 dark:border-amber-900/50 relative">
        
        {/* Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-100 to-white dark:from-amber-900/20 dark:to-gray-900 opacity-50 pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition z-10"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="p-8 text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200 dark:shadow-amber-900/20 transform rotate-3">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upgrade to <span className="text-amber-500">Pro</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Unlock the full potential of your AI sous-chef.
          </p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Unlimited Pantry Storage</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Store more than 20 items and track expiration dates for your entire kitchen.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
               <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full mt-0.5">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Priority AI Generation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get faster recipe suggestions and exclusive access to new models.</p>
              </div>
            </div>

             <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
               <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Advanced Meal Planning</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate weekly meal plans based on your specific nutritional goals.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-200 dark:shadow-amber-900/20 hover:scale-[1.02] transition flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5 fill-white/20" /> 
            Unlock Pro for $4.99/mo
          </button>
          <p className="text-xs text-gray-400 mt-4">Cancel anytime. 7-day free trial included.</p>
        </div>
      </div>
    </div>
  );
};
