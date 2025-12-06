# PantryPal: Asian Cuisine Edition 🍜

Your AI-powered sous-chef and shopping assistant, specialized in authentic Asian cuisine. PantryPal helps you bridge the gap between "What do I have?" and "What's for dinner?" by intelligently matching your pantry ingredients to delicious recipes and guiding you to the local stores that have what you're missing.

## ✨ Key Features

### 🍳 Intelligent Recipe Generation
- **Pantry-First Approach**: Generates recipes based on what you already own to minimize waste.
- **Asian Cuisine Focus**: Specialized prompts ensuring authentic suggestions for Korean, Japanese, Thai, Vietnamese, Chinese, and South Asian dishes.
- **Dietary Customization**: Full support for Vegan, Vegetarian, Gluten-Free, and Dairy-Free preferences, plus strict allergy exclusions.
- **Visuals & Nutrition**: AI-generated photorealistic images of dishes and estimated nutritional breakdowns (Calories, Macros).

### 🛒 Smart Shopping & Knowledge Base
- **Gap Analysis**: Automatically identifies exactly which ingredients you are missing for a recipe.
- **Store Locator**: Uses **Google Maps Grounding** to find specialized Asian markets (e.g., H-Mart, 99 Ranch) near you that stock specific missing items.
- **Local Knowledge Base**: "Learns" and saves which stores carry which ingredients over time, building a personal local database in your browser.
- **Interactive Checklist**: A digital shopping list that automatically moves checked-off items into your pantry.

### 🏠 Pantry Management
- **Receipt Scanning**: Upload a photo of your grocery receipt, and the AI extracts ingredients to populate your pantry automatically.
- **Fuzzy Matching**: Advanced logic handles variations like "2 lbs Bok Choy" vs "Bok Choy" or "Soy Sauce" vs "Light Soy Sauce".

### 👨‍🍳 Chef Mode
- **Distraction-Free Cooking**: A step-by-step, large-text interface designed to be used while your hands are busy cooking.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Models**: 
  - `gemini-2.5-flash`: Logic, recipe generation, store extraction, receipt parsing.
  - `gemini-2.5-flash-image`: Food image generation.
  - **Google Maps Grounding**: Real-time store location and verification.
- **Icons**: Lucide React
- **Persistence**: LocalStorage (for Pantry, Settings, and Store Knowledge Base)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A **Google Gemini API Key** (Paid tier required for Grounding/Search features).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pantrypal-asian.git
   cd pantrypal-asian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   Create a `.env` file in the root directory and add your API key:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📱 How to Use

1. **Stock Your Pantry**: 
   - Click "Pantry" in the top right.
   - Manually type items (e.g., "Gochujang", "Rice") or click the Camera icon to scan a receipt.
2. **Set Preferences**:
   - Click the **Settings** (Gear icon) to set dietary restrictions (e.g., "Vegetarian") or allergies (e.g., "Peanuts").
3. **Find Recipes**:
   - Enter a craving (e.g., "Spicy Noodle Soup") or click "Suggest Asian dishes from pantry".
   - Filter by "Cook Now" to see recipes you can make immediately.
4. **Shop**:
   - If a recipe has missing ingredients, click **Shop**.
   - The app will locate nearby stores and tell you exactly what is in stock where.
   - As you buy items, check them off to add them to your pantry.
5. **Cook**:
   - Click **Cook** (or the Play icon) to enter **Chef Mode** for a guided cooking experience.

## 📂 Project Structure

- `src/App.tsx`: Main application controller and layout.
- `src/services/geminiService.ts`: Core AI logic (Recipes, Images, Receipt Parsing, Store Finding).
- `src/components/`:
  - `RecipeCard.tsx`: Displays recipe match score and missing ingredients.
  - `PantryManager.tsx`: Modal for managing inventory.
  - `StoreMap.tsx`: Interface for finding stores and managing the shopping list.
  - `CookingMode.tsx`: Step-by-step view.
- `src/utils/ingredientMatching.ts`: Normalization and fuzzy matching logic.

## 📄 License

This project is licensed under the MIT License.
