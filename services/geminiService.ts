
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, GroundingChunk, SavedStore, UserPreferences, LabelAnalysis } from "../types";

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

  // Nutritional Goals
  const nutritionString = [];
  if (preferences.nutritionalGoals?.maxCaloriesPerServing) {
      nutritionString.push(`Max ${preferences.nutritionalGoals.maxCaloriesPerServing} calories per serving`);
  }
  if (preferences.nutritionalGoals?.minProteinPerServing) {
      nutritionString.push(`Min ${preferences.nutritionalGoals.minProteinPerServing}g protein per serving`);
  }
  const nutritionConstraint = nutritionString.length > 0 
    ? `NUTRITIONAL GOALS: The recipes MUST meet these targets: ${nutritionString.join(", ")}.` 
    : "";

  // New Preferences: Spice, Serving Size, Appliances
  const spiceLevel = preferences.spiceTolerance 
    ? `SPICE LEVEL: The user prefers ${preferences.spiceTolerance} heat. Adjust chili/spices accordingly.` 
    : "";
  
  const servingSize = preferences.servingSize 
    ? `SERVING SIZE: Scale ingredient quantities for ${preferences.servingSize} people.` 
    : "SERVING SIZE: Scale ingredient quantities for 2 people.";

  const availableAppliances = [];
  if (preferences.appliances?.wok) availableAppliances.push("Wok");
  if (preferences.appliances?.riceCooker) availableAppliances.push("Rice Cooker");
  if (preferences.appliances?.airFryer) availableAppliances.push("Air Fryer");
  if (preferences.appliances?.steamer) availableAppliances.push("Steamer");
  if (preferences.appliances?.instantPot) availableAppliances.push("Instant Pot");
  
  const applianceString = availableAppliances.length > 0
    ? `APPLIANCES: The user has access to: ${availableAppliances.join(", ")}. Suggest recipes or methods that utilize these tools if authentic and appropriate.`
    : "";

  // Seasonal Awareness
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const seasonalString = `It is currently ${currentMonth}. Prioritize ingredients that are typically in season during this month for authentic flavor and cost-efficiency.`;

  const prompt = `
    You are an expert Chef specializing in ASIAN CUISINE (East Asian, Southeast Asian, South Asian).
    Suggest 4 distinct recipes for: "${query}".
    
    CRITICAL INSTRUCTION - DUAL MODES:
    If the user's query is a foundational food item (e.g. "Kimchi", "Tofu", "Noodles", "Dumplings", "Curry Paste"), you MUST provide a mix of:
    1. 'Base Component': The authentic recipe to make that item FROM SCRATCH (e.g. "Homemade Napa Cabbage Kimchi").
    2. 'Meal': Delicious dishes that use that item as a main ingredient (e.g. "Kimchi Jjigae").
    
    If the query is already a specific dish (e.g. "Pad Thai"), just provide variations of that 'Meal'.
    
    ${pantryString}
    ${dietString}
    ${allergyString}
    ${nutritionConstraint}
    ${seasonalString}
    ${spiceLevel}
    ${servingSize}
    ${applianceString}
    
    Guidelines:
    1. Prioritize recipes that utilize the user's existing pantry ingredients where possible.
    2. For EVERY ingredient, you MUST assign a specific category (e.g., Produce, Meat, Dairy, Pantry, Spices, Bakery).
    3. For EVERY ingredient, you MUST provide a list of potential substitutes if applicable.
    4. Provide expert "Chef's Tips" for preparation or cooking techniques.
    5. Suggest a specific BEVERAGE PAIRING (tea, beer, sake, or non-alcoholic) that complements the dish.
    6. Estimate nutritional values (Calories, Protein, Carbs, Fat) for one serving.
    7. Ensure quantities are precise.
    8. STRICTLY adhere to the dietary restrictions and allergies provided.
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
            cuisine: { type: Type.STRING, description: "Specific Asian cuisine (e.g. Korean, Japanese, Thai)" },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            recipeType: { type: Type.STRING, enum: ["Meal", "Base Component"], description: "Is this a ready-to-eat meal or a base ingredient/staple made from scratch?" },
            timeMinutes: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Category (e.g. Produce, Meat, Dairy, Spices)" },
                  substitutes: { 
                      type: Type.ARRAY, 
                      items: { 
                          type: Type.OBJECT,
                          properties: {
                              name: { type: Type.STRING },
                              quantity: { type: Type.STRING },
                              note: { type: Type.STRING }
                          }
                      },
                      description: "List of valid substitutes" 
                  }
                }
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Expert cooking tips" },
            beveragePairing: { type: Type.STRING, description: "A drink that pairs well with this dish" },
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
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to parse recipes", e);
    return [];
  }
};

export const generateRecipeImage = async (recipeName: string, description: string): Promise<string | null> => {
  const ai = getClient();
  const prompt = `A professional, appetizing, high-resolution food photography shot of ${recipeName}, an Asian dish. ${description}. Studio lighting, 4k, delicious, gourmet plating.`;

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
  location: { lat: number, lng: number } | string
): Promise<StoreSearchResponse> => {
  const ai = getClient();
  
  let locationString = "";
  let retrievalConfig = undefined;

  if (typeof location === 'string') {
    // Manual location text
    locationString = `near ${location}`;
    // When using text, we rely on the prompt context, or we could leave retrievalConfig undefined
    // For 'googleMaps' tool, it strongly prefers latLng if available. 
    // If we only have text, we omit retrievalConfig so it infers from prompt.
  } else {
    // Coordinates
    locationString = `near me (Lat: ${location.lat}, Lng: ${location.lng})`;
    retrievalConfig = {
      latLng: {
        latitude: location.lat,
        longitude: location.lng
      }
    };
  }
  
  const query = `
    I need to purchase the following Asian ingredients: ${ingredients.join(", ")}.
    
    Using Google Maps, find the best Asian grocery stores, international markets, or supermarkets with good Asian sections ${locationString}.
    Prioritize specialized stores (e.g., H Mart, 99 Ranch, Mitsuwa, Patel Brothers, local Asian markets).
    
    TASK: Provide a granular inventory breakdown for each store found, detailed store info, AND the distance.
    
    IMPORTANT: Start your response by explicitly stating the location area you are searching in (e.g. "Searching for stores in San Francisco, CA..." or "Searching near 90210...").
    
    Structure your response exactly like this:
    
    ## 🗺️ Trip Plan
    [1-2 sentences on the most efficient route]
    
    ## 📍 Store Details
    
    **1. [Store Name]**
    *   🏠 **Address**: [Full address]
    *   🚗 **Distance**: [Approximate driving distance]
    *   ⭐ **Rating**: [Rating]/5
    *   ✅ **In Stock**: [Comma-separated list of SPECIFIC ingredients from my request available here]
    *   ❌ **Missing**: [Specific ingredients from my request likely NOT available here]
    *   💡 **Notes**: [e.g. "Dedicated Korean market", "Large Asian produce section"]
    
    ... (Repeat for top 3 relevant stores)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: retrievalConfig ? { retrievalConfig } : undefined
    }
  });

  return {
    text: response.text || "No store information found.",
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const extractStoreInventory = async (responseText: string): Promise<{ stores: SavedStore[], detectedLocation: string }> => {
  const ai = getClient();

  const prompt = `
    Analyze the following text which describes availability of ingredients at various stores.
    Extract structured data about each store including its address, rating, distance, and inventory.
    Also extract the "detectedLocation" which is the city/area name mentioned in the text as the search context (e.g. "San Francisco, CA").
    
    IMPORTANT: 
    - For 'knownIngredients', capture strictly the items listed under "In Stock", "Available", or "Has".
    - Normalize ingredient names.
    - Extract the full address if present.
    - Extract the numeric rating if present.
    - Extract the distance string (e.g. "2.3 miles", "0.5 km") if present.
    
    Text to analyze:
    "${responseText}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            detectedLocation: { type: Type.STRING, description: "The city/area extracted from the text, e.g. 'San Jose, CA'" },
            stores: {
                type: Type.ARRAY,
                items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                    distance: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    knownIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    notes: { type: Type.STRING }
                }
                }
            }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return { stores: [], detectedLocation: "" };

  try {
    const raw = JSON.parse(text);
    if (!raw || typeof raw !== 'object') return { stores: [], detectedLocation: "" };

    const stores = (raw.stores || []).map((r: any) => ({
      ...r,
      lastUpdated: Date.now(),
      knownIngredients: r.knownIngredients || [], // Ensure array
      // Use a consistent, reliable placeholder service
      imageUrl: `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(r.name)}`
    }));

    return {
        stores,
        detectedLocation: raw.detectedLocation || ""
    };
  } catch (e) {
    console.error("Failed to parse store inventory", e);
    return { stores: [], detectedLocation: "" };
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

export const identifyProductLabel = async (imageFile: File, searchingFor: string[]): Promise<LabelAnalysis> => {
  const ai = getClient();

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
  const base64Content = base64Data.split(',')[1];

  const shoppingContext = searchingFor.length > 0 
    ? `The user's shopping list is: [${searchingFor.join(", ")}]. Determine if this product matches any item on the list. The 'matchedIngredient' field in the JSON should be the exact string from the shopping list if a match is found.` 
    : "Identify this product.";

  const prompt = `
    You are an expert Asian grocery identifier. Analyze this image of a product label and return a structured JSON object.
    
    1.  **Identify**: What is the precise name of this product? Include brand and type (e.g., "Kikkoman Light Soy Sauce", "Lao Gan Ma Chili Crisp").
    2.  **Contextual Match**: ${shoppingContext} Your matching should be smart (e.g., if the user needs "Soy Sauce", "Kikkoman Light Soy Sauce" is a match).
    3.  **Describe**: Briefly explain what it is.
    4.  **Analyze Flavor**: List 3-4 keywords for its flavor profile (e.g., "Salty", "Umami", "Slightly Sweet", "Spicy", "Fermented").
    5.  **Provide Tips**: Give a concise usage tip.
    6.  **Fun Fact**: Add an interesting cultural or historical fact.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType: imageFile.type, data: base64Content } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isMatch: { type: Type.BOOLEAN, description: "True if the product is a good match for an item on the user's shopping list." },
          matchedIngredient: { type: Type.STRING, description: "The exact item from the shopping list that was matched. Null if no match." },
          productName: { type: Type.STRING, description: "The identified English name of the product." },
          productNameOriginal: { type: Type.STRING, description: "The product name in its original language, if visible." },
          description: { type: Type.STRING, description: "A brief explanation of the product." },
          flavorProfile: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 keywords describing the taste." },
          usageTips: { type: Type.STRING, description: "A concise tip on how to use it." },
          funFact: { type: Type.STRING, description: "An interesting fact about the product or its origins." }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to analyze label.");

  try {
    return JSON.parse(text) as LabelAnalysis;
  } catch (e) {
    console.error("Failed to parse label analysis", e);
    throw new Error("Could not parse AI response.");
  }
};
