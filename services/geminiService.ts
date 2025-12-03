import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, GroundingChunk, SavedStore, UserPreferences } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateRecipes = async (
  query: string, 
  pantryItems: string[],
  preferences: UserPreferences
): Promise<Recipe[]> => {
  const ai = getClient();
  
  const pantryString = pantryItems.length > 0 
    ? `The user has the following ingredients: ${pantryItems.join(", ")}.` 
    : "The user has an empty pantry.";

  // Construct Dietary Constraints String
  const dietaryRestrictions = [];
  if (preferences.dietary.vegan) dietaryRestrictions.push("Vegan");
  if (preferences.dietary.vegetarian) dietaryRestrictions.push("Vegetarian");
  if (preferences.dietary.glutenFree) dietaryRestrictions.push("Gluten-Free");
  if (preferences.dietary.dairyFree) dietaryRestrictions.push("Dairy-Free");
  
  const allergyString = preferences.allergies.trim() 
    ? `CRITICAL: The user has severe allergies to: ${preferences.allergies}. Do NOT include these ingredients.` 
    : "";

  const dietString = dietaryRestrictions.length > 0
    ? `The user follows these dietary rules: ${dietaryRestrictions.join(", ")}.`
    : "";

  const prompt = `
    Suggest 4 distinct recipes for: "${query}".
    ${pantryString}
    ${dietString}
    ${allergyString}
    
    Guidelines:
    1. Prioritize recipes that utilize the user's existing pantry ingredients where possible.
    2. For EVERY ingredient, you MUST assign a specific category (e.g., Produce, Meat, Dairy, Pantry, Spices, Bakery).
    3. For EVERY ingredient, you MUST provide a list of potential substitutes if applicable.
    4. Estimate nutritional values (Calories, Protein, Carbs, Fat) for one serving.
    5. Ensure quantities are precise.
    6. STRICTLY adhere to the dietary restrictions and allergies provided.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            cuisine: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            timeMinutes: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Category (e.g. Produce, Meat, Dairy, Spices)" },
                  substitutes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of valid substitutes" }
                }
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrition: {
                type: Type.OBJECT,
                properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.STRING },
                    carbs: { type: Type.STRING },
                    fat: { type: Type.STRING }
                }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    return JSON.parse(text) as Recipe[];
  } catch (e) {
    console.error("Failed to parse recipes", e);
    return [];
  }
};

export const generateRecipeImage = async (recipeName: string, description: string): Promise<string | null> => {
  const ai = getClient();
  const prompt = `A professional, appetizing, high-resolution food photography shot of ${recipeName}. ${description}. Studio lighting, 4k, delicious, gourmet plating.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Failed to generate image", e);
    return null;
  }
};

export interface StoreSearchResponse {
  text: string;
  chunks: GroundingChunk[];
}

export const findStoresForIngredients = async (
  ingredients: string[], 
  location: { lat: number, lng: number }
): Promise<StoreSearchResponse> => {
  const ai = getClient();
  
  const query = `
    I need to purchase the following specific ingredients: ${ingredients.join(", ")}.
    
    Using Google Maps, find the best grocery stores, supermarkets, or specialty markets near me.
    
    You MUST provide a detailed item-by-item breakdown for each store found.
    
    Structure your response exactly like this:
    
    ## 🗺️ Trip Plan
    [1-2 sentences on the most efficient route]
    
    ## 📍 Store Details
    
    **1. [Store Name]**
    *   ✅ **Has**: [List specific ingredients from my request available here]
    *   ⚠️ **Might Miss**: [List specific ingredients likely not available here]
    *   💡 **Why**: [e.g. "Large supermarket", "Specialty Asian grocer"]
    
    ... (Repeat for top 3 relevant stores)
    
    CRITICAL INSTRUCTIONS:
    - Do NOT say "all ingredients" or "most items". List the specific names.
    - If I need "Gochujang" and you find a general supermarket, check if they likely carry international items. If you find an Asian market, prioritize it for that item.
    - Ensure EVERY ingredient in my list is covered by at least one store.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      }
    }
  });

  return {
    text: response.text || "No store information found.",
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// New helper to convert the text response into a structured "Database" of stores
export const extractStoreInventory = async (responseText: string): Promise<SavedStore[]> => {
  const ai = getClient();

  const prompt = `
    Analyze the following text which describes availability of ingredients at various stores.
    Extract structured data about each store and what ingredients they have.
    Look for sections indicating what is "Available", "In Stock", or what the store "Has".
    Normalize the ingredient names.
    
    Text to analyze:
    "${responseText}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            knownIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];

  try {
    const raw = JSON.parse(text);
    // Add timestamps
    return raw.map((r: any) => ({
      ...r,
      lastUpdated: Date.now()
    }));
  } catch (e) {
    console.error("Failed to parse store inventory", e);
    return [];
  }
};

export const parseReceipt = async (imageFile: File): Promise<string[]> => {
  const ai = getClient();
  
  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  // Strip prefix (data:image/jpeg;base64,) if present
  const base64Content = base64Data.split(',')[1];
  const mimeType = imageFile.type;

  const prompt = `
    Analyze this receipt image. 
    Identify all grocery food items and ingredients.
    Ignore non-food items, prices, taxes, totals, and store information.
    Normalize the names to be simple, singular pantry ingredients (e.g., convert "Org Bananas 1lb" to "Banana", "Kraft Cheddar" to "Cheddar Cheese").
    Return purely a JSON array of strings.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Content } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const text = response.text;
  if (!text) return [];

  try {
    return JSON.parse(text) as string[];
  } catch (e) {
    console.error("Failed to parse receipt items", e);
    return [];
  }
};