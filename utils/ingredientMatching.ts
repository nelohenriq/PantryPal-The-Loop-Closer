
// Common units to strip out for cleaner matching
const COMMON_UNITS = new Set([
  'cup', 'cups', 'c',
  'teaspoon', 'teaspoons', 'tsp',
  'tablespoon', 'tablespoons', 'tbsp',
  'ounce', 'ounces', 'oz',
  'pound', 'pounds', 'lb', 'lbs',
  'gram', 'grams', 'g',
  'kilogram', 'kilograms', 'kg',
  'liter', 'liters', 'l',
  'milliliter', 'milliliters', 'ml',
  'pinch', 'pinches',
  'dash', 'dashes',
  'clove', 'cloves',
  'can', 'cans',
  'bunch', 'bunches',
  'slice', 'slices',
  'piece', 'pieces',
  'package', 'packages', 'pkg',
  'stick', 'sticks',
  'bottle', 'bottles',
  'jar', 'jars',
  'head', 'heads',
  'stalk', 'stalks',
  'sprig', 'sprigs',
  'handful', 'handfuls',
  'fillet', 'fillets',
  'leaf', 'leaves'
]);

// Adjectives and prep methods to ignore during matching
const IGNORE_WORDS = new Set([
  'chopped', 'sliced', 'diced', 'minced', 'grated', 'shredded', 'crushed', 'ground',
  'fresh', 'dried', 'frozen', 'canned', 'cooked', 'raw',
  'large', 'medium', 'small', 'whole',
  'organic', 'natural',
  'beaten', 'melted', 'softened',
  'boneless', 'skinless',
  'lean', 'extra', 'virgin',
  'unsalted', 'salted',
  'sweet', 'dry',
  'style', 'type',
  'all', 'purpose', 'all-purpose',
  'and', 'or', 'of', 'in', 'with'
]);

// Calculate Levenshtein distance between two strings
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Convert plural words to singular (heuristic)
function singularize(word: string): string {
  // e.g. cherries -> cherry
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  
  // e.g. tomatoes -> tomato, potatoes -> potato
  if (word.endsWith('oes')) return word.slice(0, -2);
  
  // e.g. boxes -> box, lunches -> lunch
  if (word.endsWith('xes') || word.endsWith('shes') || word.endsWith('ches')) {
    return word.slice(0, -2);
  }
  
  // Skip 'ss' (e.g. glass, bass, molasses) to avoid 'gla'
  if (word.endsWith('ss')) return word;

  // Generic 's' removal (e.g. eggs -> egg, onions -> onion)
  // Also handles olives -> olive (ends in es, but not one of the special cases above)
  if (word.endsWith('s')) return word.slice(0, -1);
  
  return word;
}

// Clean up ingredient strings
export function normalize(text: string): string {
  // 1. Lowercase
  let clean = text.toLowerCase();
  
  // 2. Replace hyphens/slashes with spaces (e.g., "all-purpose" -> "all purpose")
  clean = clean.replace(/[-/]/g, ' ');

  // 3. Remove punctuation (non-word chars except spaces) and digits
  clean = clean.replace(/[^\w\s]|[\d]/g, '');

  // 4. Tokenize, filter, singularize, join
  return clean.split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .filter(w => !COMMON_UNITS.has(w)) // Remove units
    .filter(w => !IGNORE_WORDS.has(w)) // Remove adjectives/prep
    .map(singularize)
    .join(' ')
    .trim();
}

export function isIngredientMatch(recipeIngredient: string, pantryItem: string): boolean {
  const rNorm = normalize(recipeIngredient);
  const pNorm = normalize(pantryItem);

  if (!rNorm || !pNorm) return false;

  // 1. Exact Match
  if (rNorm === pNorm) return true;

  // 2. Bidirectional Subset Matching
  const rTokens = rNorm.split(' ');
  const pTokens = pNorm.split(' ');

  // Check if Pantry item is a subset of Recipe ingredient 
  // e.g. Pantry: "Rice" -> Recipe: "Jasmine Rice" (Match)
  // e.g. Pantry: "Chicken" -> Recipe: "Chicken Breast" (Match)
  const pIsSubset = pTokens.every(t => rTokens.includes(t));
  if (pIsSubset) return true;

  // Check if Recipe ingredient is a subset of Pantry item
  // e.g. Pantry: "Jasmine Rice" -> Recipe: "Rice" (Match: Use specific for generic)
  // e.g. Pantry: "Whole Wheat Flour" -> Recipe: "Flour" (Match)
  const rIsSubset = rTokens.every(t => pTokens.includes(t));
  if (rIsSubset) return true;

  // 3. Fuzzy Match for Typos (Levenshtein)
  // Only apply if strings are reasonably close in length to avoid false positives
  // on distinct short words (e.g. "Corn" vs "Pork" - though subset handles tokens better)
  if (Math.abs(rNorm.length - pNorm.length) < 3) {
      const dist = levenshtein(rNorm, pNorm);
      // Allow 1 edit for short words, 2 for longer
      const allowedEdits = rNorm.length > 5 ? 2 : 1;
      if (dist <= allowedEdits) return true;
  }

  return false;
}
