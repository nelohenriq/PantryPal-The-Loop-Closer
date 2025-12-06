
import React, { useEffect, useRef, useState } from 'react';
import { X, LoaderCircle, ScanBarcode } from 'lucide-react';

interface BarcodeScannerProps {
  onDetected: (productName: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Html5QrcodeScanner: any;
  }
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready and library is loaded
    const timer = setTimeout(() => {
        if (!window.Html5QrcodeScanner) {
            setError("Scanner library not loaded.");
            return;
        }

        try {
            const scanner = new window.Html5QrcodeScanner(
                "reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0 
                },
                /* verbose= */ false
            );
            
            scanner.render(
                async (decodedText: string) => {
                    // Pause scanning on success
                    scanner.clear();
                    setLoading(true);
                    
                    try {
                        // Query OpenFoodFacts
                        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
                        const data = await response.json();
                        
                        if (data.status === 1 && data.product && data.product.product_name) {
                            onDetected(data.product.product_name);
                        } else {
                            setError(`Product not found for barcode: ${decodedText}`);
                            setTimeout(() => {
                                onClose(); // Close on failure so user can try manual
                            }, 2000);
                        }
                    } catch (err) {
                        console.error("API Error", err);
                        setError("Failed to look up product.");
                    } finally {
                        setLoading(false);
                    }
                },
                (errorMessage: string) => {
                    // parse error, ignore often
                }
            );
            scannerRef.current = scanner;

        } catch (e) {
            console.error("Scanner init error", e);
            setError("Could not initialize camera.");
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) {
                // ignore clear errors
            }
        }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-emerald-500" /> Scan Barcode
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>
        
        <div className="p-6 bg-black min-h-[300px] flex flex-col items-center justify-center relative">
            {loading ? (
                <div className="text-white flex flex-col items-center gap-3">
                    <LoaderCircle className="w-10 h-10 animate-spin text-emerald-500" />
                    <p>Fetching product details...</p>
                </div>
            ) : error ? (
                <div className="text-red-400 text-center">
                    <p>{error}</p>
                </div>
            ) : (
                <div id="reader" className="w-full h-full text-white"></div>
            )}
        </div>
        
        <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
            Point your camera at a food product barcode (UPC/EAN)
        </div>
      </div>
    </div>
  );
};
