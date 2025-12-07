
import React from 'react';
import { UserPreferences } from '../types';
import { X, Check, Activity, Flame, Thermometer, Users, Utensils } from 'lucide-react';

interface SettingsModalProps {
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ preferences, onSave, onClose }) => {
  const [localPrefs, setLocalPrefs] = React.useState<UserPreferences>({
      ...preferences,
      appliances: preferences.appliances || {
          wok: false,
          riceCooker: false,
          airFryer: false,
          steamer: false,
          instantPot: false
      },
      spiceTolerance: preferences.spiceTolerance || 'Medium',
      servingSize: preferences.servingSize || 2
  });

  const toggleDiet = (key: keyof UserPreferences['dietary']) => {
    setLocalPrefs(prev => ({
      ...prev,
      dietary: {
        ...prev.dietary,
        [key]: !prev.dietary[key]
      }
    }));
  };

  const toggleAppliance = (key: keyof NonNullable<UserPreferences['appliances']>) => {
      setLocalPrefs(prev => ({
          ...prev,
          appliances: {
              ...prev.appliances!,
              [key]: !prev.appliances![key]
          }
      }));
  };

  const handleAllergiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrefs(prev => ({
      ...prev,
      allergies: e.target.value
    }));
  };

  const handleNutritionChange = (key: keyof UserPreferences['nutritionalGoals'], value: string) => {
      setLocalPrefs(prev => ({
          ...prev,
          nutritionalGoals: {
              ...prev.nutritionalGoals,
              [key]: value ? parseInt(value) : undefined
          }
      }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Preferences</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
          
          {/* Diet Toggles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Restrictions</h3>
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
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                  {localPrefs.dietary[key as keyof UserPreferences['dietary']] && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Spice & Serving */}
          <div className="grid grid-cols-1 gap-4">
             <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Thermometer className="w-4 h-4" /> Spice Tolerance
                </h3>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {['Mild', 'Medium', 'Spicy', 'Extra Hot'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setLocalPrefs(prev => ({ ...prev, spiceTolerance: level as any }))}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                                localPrefs.spiceTolerance === level 
                                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
             </div>

             <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" /> Serving Size
                </h3>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">People to feed:</span>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLocalPrefs(prev => ({ ...prev, servingSize: Math.max(1, (prev.servingSize || 2) - 1) }))}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold hover:bg-gray-50"
                        >
                            -
                        </button>
                        <span className="font-bold w-4 text-center">{localPrefs.servingSize || 2}</span>
                        <button 
                            onClick={() => setLocalPrefs(prev => ({ ...prev, servingSize: (prev.servingSize || 2) + 1 }))}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold hover:bg-gray-50"
                        >
                            +
                        </button>
                    </div>
                </div>
             </div>
          </div>

          {/* Kitchen Equipment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Kitchen Equipment
            </h3>
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'wok', label: 'Wok' },
                    { key: 'riceCooker', label: 'Rice Cooker' },
                    { key: 'airFryer', label: 'Air Fryer' },
                    { key: 'steamer', label: 'Steamer' },
                    { key: 'instantPot', label: 'Instant Pot' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => toggleAppliance(key as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                            localPrefs.appliances![key as keyof typeof localPrefs.appliances]
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
          </div>

          {/* Nutritional Goals */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Nutritional Goals</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Max Calories / Meal
                    </label>
                    <input 
                        type="number"
                        placeholder="e.g. 600"
                        value={localPrefs.nutritionalGoals?.maxCaloriesPerServing || ''}
                        onChange={(e) => handleNutritionChange('maxCaloriesPerServing', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Min Protein (g)
                    </label>
                    <input 
                        type="number"
                        placeholder="e.g. 30"
                        value={localPrefs.nutritionalGoals?.minProteinPerServing || ''}
                        onChange={(e) => handleNutritionChange('minProteinPerServing', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Allergies</h3>
            <textarea
              value={localPrefs.allergies}
              onChange={handleAllergiesChange}
              placeholder="e.g. Peanuts, Shellfish, Strawberries..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm min-h-[100px] resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              We will instruct the AI to strictly avoid these ingredients.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button 
            onClick={() => { onSave(localPrefs); onClose(); }}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-lg shadow-gray-200 dark:shadow-none"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};