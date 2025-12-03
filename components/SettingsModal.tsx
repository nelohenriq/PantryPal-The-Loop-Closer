import React from 'react';
import { UserPreferences } from '../types';
import { X, Check } from 'lucide-react';

interface SettingsModalProps {
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ preferences, onSave, onClose }) => {
  const [localPrefs, setLocalPrefs] = React.useState<UserPreferences>(preferences);

  const toggleDiet = (key: keyof UserPreferences['dietary']) => {
    setLocalPrefs(prev => ({
      ...prev,
      dietary: {
        ...prev.dietary,
        [key]: !prev.dietary[key]
      }
    }));
  };

  const handleAllergiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrefs(prev => ({
      ...prev,
      allergies: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Dietary Preferences</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Diet Toggles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Restrictions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'vegan', label: 'Vegan' },
                { key: 'vegetarian', label: 'Vegetarian' },
                { key: 'glutenFree', label: 'Gluten Free' },
                { key: 'dairyFree', label: 'Dairy Free' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleDiet(key as keyof UserPreferences['dietary'])}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-medium transition-all ${
                    localPrefs.dietary[key as keyof UserPreferences['dietary']]
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  {localPrefs.dietary[key as keyof UserPreferences['dietary']] && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Allergies</h3>
            <textarea
              value={localPrefs.allergies}
              onChange={handleAllergiesChange}
              placeholder="e.g. Peanuts, Shellfish, Strawberries..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              We will instruct the AI to strictly avoid these ingredients.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={() => { onSave(localPrefs); onClose(); }}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};