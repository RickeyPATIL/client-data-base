import React, { useState } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';

export const ImageStudio: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSourceImage(evt.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await editImageWithGemini(sourceImage, prompt);
      if (result) {
        setGeneratedImage(result);
      } else {
        alert("Failed to generate image. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while communicating with Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl text-white">
            <Wand2 size={24} />
         </div>
         <div>
           <h2 className="text-2xl font-bold text-slate-800">Nano Banana Studio</h2>
           <p className="text-slate-500">AI-powered image editing with Gemini 2.5 Flash Image</p>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Input Section */}
         <div className="flex flex-col gap-6">
            <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden relative group">
               {sourceImage ? (
                 <div className="w-full h-full relative">
                    <img src={sourceImage} alt="Source" className="w-full h-full object-contain bg-slate-50" />
                    <button 
                      onClick={() => setSourceImage(null)}
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-slate-600"
                    >
                       <Upload size={16} className="rotate-45" />
                    </button>
                 </div>
               ) : (
                 <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                       <Upload size={32} />
                    </div>
                    <span className="font-medium text-slate-700">Upload Source Image</span>
                    <span className="text-sm text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                 </label>
               )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <label className="block text-sm font-medium text-slate-700 mb-2">Editing Prompt</label>
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Add a retro filter', 'Make it look like a sketch', 'Add fireworks'"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                 />
                 <button 
                    onClick={handleGenerate}
                    disabled={!sourceImage || !prompt || isLoading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200 flex items-center gap-2"
                 >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                    <span>Magic Edit</span>
                 </button>
               </div>
            </div>
         </div>

         {/* Output Section */}
         <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10 flex justify-between items-center">
               <span className="text-white/80 font-medium text-sm flex items-center gap-2">
                  <ImageIcon size={16} /> Result
               </span>
               {generatedImage && (
                  <a href={generatedImage} download="gemini-edit.png" className="text-white/80 hover:text-white transition-colors">
                     <Download size={20} />
                  </a>
               )}
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
               {generatedImage ? (
                  <img src={generatedImage} alt="Generated" className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg" />
               ) : (
                  <div className="text-center text-slate-600">
                     {isLoading ? (
                        <div className="flex flex-col items-center">
                           <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
                           <p className="text-slate-400">Gemini is dreaming up your image...</p>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center opacity-30">
                           <Wand2 size={64} className="mb-4" />
                           <p>Generated artwork will appear here</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};