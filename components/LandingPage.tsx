
import React from 'react';
import { ChefHat, ArrowRight, Camera, Sparkles, MapPin, Search, Star, PlayCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PantryPal <span className="text-emerald-500 font-light">Asian</span></h1>
        </div>
        <button 
          onClick={onGetStarted}
          className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          Log In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12 py-12 md:py-20 relative overflow-hidden">
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>

        {/* Left: Text */}
        <div className="flex-1 space-y-8 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider animate-fade-in-up">
            <Sparkles className="w-3 h-3" /> New: AI Receipt Scanning
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Master Asian Cuisine <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
              With What You Have
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Stop wondering "what's for dinner?". Turn your random pantry ingredients into authentic recipes, and find the exact local stores to complete the dish.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 hover:scale-105 transition shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center gap-2 group"
            >
              Start Cooking Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <PlayCircle className="w-5 h-5" /> Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                ))}
             </div>
             <div className="text-sm">
                <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Loved by 10,000+ home chefs</p>
             </div>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="flex-1 relative w-full max-w-lg">
           <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 rotate-3 hover:rotate-0 transition duration-500">
              {/* Fake UI Preview */}
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600">
                    <ChefHat className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg">Spicy Miso Ramen</h3>
                    <p className="text-xs text-gray-500">Match Score: 92%</p>
                 </div>
                 <div className="ml-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                    Easy
                 </div>
              </div>
              
              <div className="space-y-3 mb-6">
                 <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl w-full"></div>
                 <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                 <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
              </div>

              <div className="flex gap-2">
                 <div className="flex-1 h-10 bg-emerald-600 rounded-lg"></div>
                 <div className="flex-1 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute -left-8 top-12 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Camera className="w-5 h-5"/></div>
                 <div>
                    <p className="text-xs text-gray-500 font-medium">Scanned</p>
                    <p className="font-bold text-sm">Receipt.jpg</p>
                 </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -right-6 bottom-20 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                 <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><MapPin className="w-5 h-5"/></div>
                 <div>
                    <p className="text-xs text-gray-500 font-medium">Found at</p>
                    <p className="font-bold text-sm">H-Mart</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Feature Steps */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20 border-t border-gray-100 dark:border-gray-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-3xl font-bold mb-4">How PantryPal Works</h2>
               <p className="text-gray-500 dark:text-gray-400">Three simple steps to elevate your home cooking game using the power of Artificial Intelligence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   icon: <Camera className="w-8 h-8 text-blue-500" />, 
                   title: "1. Scan & Stock", 
                   desc: "Snap a photo of your receipt or manually add ingredients. We track what you have so you don't have to." 
                 },
                 { 
                   icon: <Sparkles className="w-8 h-8 text-purple-500" />, 
                   title: "2. Get AI Recipes", 
                   desc: "Our AI Chef suggests authentic Asian dishes based on your inventory, dietary needs, and macros." 
                 },
                 { 
                   icon: <Search className="w-8 h-8 text-emerald-500" />, 
                   title: "3. Fill the Gaps", 
                   desc: "Missing something? We find the nearest Asian markets carrying exactly what you need." 
                 }
               ].map((step, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                     <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                        {step.icon}
                     </div>
                     <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                     <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
        <p>© 2024 PantryPal Asian. Powered by Gemini 2.5 & Google Maps.</p>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};
