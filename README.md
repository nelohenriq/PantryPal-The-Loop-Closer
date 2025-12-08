# PantryPal: Asian Cuisine Edition 🍜

**PantryPal** is an intelligent, AI-powered culinary assistant designed specifically for Asian cuisine enthusiasts. It bridges the gap between your kitchen inventory and authentic Asian recipes, helping you cook delicious meals with what you have and guiding you to specific local markets for what you need.

## ✨ Key Features

### 🧠 Intelligent Recipe Engine
*   **Pantry-First Generation**: Creates recipes based on your existing ingredients to minimize food waste.
*   **Asian Cuisine Focus**: Specialized AI prompts for authentic Korean, Japanese, Thai, Vietnamese, Chinese, and South Asian dishes.
*   **Dual Mode Suggestions**:
    *   **Meals**: Ready-to-eat dishes (e.g., *Kimchi Jjigae*).
    *   **Base Components**: Instructions to make staples from scratch (e.g., *Homemade Kimchi*).
*   **"I'm Feeling Lucky"**: One-click generation of a unique, highly-rated dish based on your preferences.
*   **Visuals & Data**: AI-generated photorealistic images and calculated nutritional macros (Calories, Protein, Carbs, Fat) for every recipe.

### ⚙️ Deep Personalization
*   **Dietary Restrictions**: Toggle Vegan, Vegetarian, Gluten-Free, or Dairy-Free modes.
*   **Allergy Safety**: Strict exclusion of specific allergens defined in settings.
*   **Advanced Preferences**:
    *   **Spice Tolerance**: Adjust heat levels from *Mild* to *Extra Hot*.
    *   **Serving Size**: Scale recipes automatically (1-6+ people).
    *   **Kitchen Equipment**: Tell the AI if you have a Wok, Rice Cooker, Air Fryer, Steamer, or Instant Pot to get optimized cooking methods.
*   **Nutritional Goals**: Set targets for Max Calories or Min Protein per serving.

### 🛒 Smart Shopping & Store Locator
*   **Gap Analysis**: Automatically calculates missing ingredients for any recipe.
*   **AI Store Locator**: Uses **Google Maps Grounding** to find specialized Asian markets (e.g., H-Mart, 99 Ranch, Patel Brothers) near you.
*   **Real-Time Inventory Estimates**: The AI analyzes store data to predict which specific ingredients are "In Stock" at each location.
*   **Store Knowledge Base**: The app "learns" as you search, building a local directory of stores and their confirmed inventory.
*   **Interactive Shopping List**: Filter stores by specific items on your list and check off items to move them directly to your pantry.

### 🏠 Pantry Management
*   **Receipt Scanning**: Snap a photo of a grocery receipt to automatically extract and categorize ingredients.
*   **Barcode Scanning**: Use the device camera to scan product barcodes (UPC/EAN) for quick entry.
*   **CSV Import**: Bulk import inventory using a simple `Name, Date` format.
*   **Expiration Tracking**: Color-coded freshness indicators (Green/Yellow/Red) to prevent spoilage.

### 👨‍🍳 Chef Mode
*   **Cooking View**: A distraction-free, large-text interface designed for use while cooking.
*   **Voice Control**: Hands-free navigation. Say **"Next"**, **"Back"**, **"Read"**, or **"Finish"** to control steps without touching the screen with messy hands.
*   **Text-to-Speech**: Listen to ingredient lists and instructions for better accessibility and pronunciation help.

### 🔍 Utility Tools
*   **Snap-to-Translate (Label Decoder)**: Take a photo of an ingredient label (e.g., a jar of sauce in a foreign language). The AI identifies the product, explains how to use it, and translates key text.
*   **Beverage Pairing**: Get AI-curated drink recommendations (Sake, Tea, Beer, Wine) that perfectly complement the flavor profile of your dish.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
    *   **Gemini 2.5 Flash**: Core logic, recipe generation, receipt/label vision, store extraction.
    *   **Gemini 2.5 Flash Image**: Photorealistic food image generation.
    *   **Google Maps Grounding**: Real-time location search and verification.
*   **Vision & Audio**:
    *   `html5-qrcode`: Barcode scanning integration.
    *   `SpeechRecognition` API: Browser-native voice commands.
    *   `SpeechSynthesis` API: Text-to-speech functionality.
*   **Icons**: Lucide React
*   **State Persistence**: LocalStorage (Pantry, Settings, Favorites, Store Knowledge Base, Analytics).

## 🚀 Getting Started

### Prerequisites
1.  **Node.js** (v18 or higher)
2.  A **Google Gemini API Key** (Paid tier recommended for Maps Grounding/Search features).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/pantrypal-asian.git
    cd pantrypal-asian
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_actual_google_gemini_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📱 User Guide

1.  **Onboarding**: Click "Get Started" to enter the app.
2.  **Stock Pantry**: Click the **Pantry** button. Add items manually, scan a receipt, or scan a barcode.
3.  **Configure Settings**: Click the **Gear** icon. Set your spice tolerance, available appliances (e.g., Rice Cooker), and dietary restrictions.
4.  **Discover Recipes**:
    *   Type a craving (e.g., "Spicy Noodles").
    *   Click **"Suggest from Pantry"** for AI recommendations based on what you have.
    *   Click **"I'm Feeling Lucky"** for a surprise high-rated dish.
5.  **Shop**:
    *   Select a recipe. Click **Shop** to see missing items.
    *   The map shows nearby stores that likely have these items.
    *   Use the **Label Scanner** in the store if you aren't sure about a product.
6.  **Cook**:
    *   Click **Cook** to enter Chef Mode.
    *   Click "Voice Off" to enable microphone permissions and use voice commands like "Next Step".

## 📄 License

This project is licensed under the MIT License.