
import React, { useState, useCallback } from 'react';
import { describeImage } from './services/geminiService';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-brand-gray-200">AI is thinking...</p>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="w-full space-y-4 animate-pulse-fast">
    <div className="h-4 bg-brand-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-brand-gray-700 rounded w-full"></div>
    <div className="h-4 bg-brand-gray-700 rounded w-5/6"></div>
    <div className="h-4 bg-brand-gray-700 rounded w-1/2"></div>
  </div>
);

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative flex flex-col items-center justify-center w-full h-64 md:h-full min-h-[256px] border-2 border-brand-gray-600 border-dashed rounded-lg cursor-pointer bg-brand-gray-800 hover:bg-brand-gray-700 transition-colors duration-300"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="object-contain w-full h-full rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon className="w-10 h-10 mb-4 text-brand-gray-400" />
            <p className="mb-2 text-sm text-brand-gray-400"><span className="font-semibold text-brand-primary">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-brand-gray-500">PNG, JPG, GIF or WEBP</p>
          </div>
        )}
        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
};


interface ResultDisplayProps {
  description: string | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ description, isLoading, error }) => {
  return (
    <div className="w-full h-64 md:h-full min-h-[256px] p-6 bg-brand-gray-800 rounded-lg overflow-y-auto">
      <h2 className="text-lg font-semibold text-brand-gray-100 mb-4 border-b border-brand-gray-700 pb-2">AI Analysis</h2>
      {isLoading && !description && <SkeletonLoader />}
      {!isLoading && error && <p className="text-red-400">{error}</p>}
      {!isLoading && !description && !error && <p className="text-brand-gray-400">Upload an image and click "Recognize" to see the AI's analysis here.</p>}
      {description && (
        <p className="text-brand-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">{description}</p>
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setDescription(null);
    setError(null);
  };

  const handleRecognizeClick = useCallback(async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDescription(null);

    try {
      const result = await describeImage(imageFile, "Describe this image in detail. What objects are present? What is happening? What is the style?");
      setDescription(result);
    } catch (err) {
      setError(err instanceof Error ? `An error occurred: ${err.message}` : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <header className="py-4 border-b border-brand-gray-800">
          <h1 className="text-3xl font-bold text-center text-brand-gray-100 tracking-wider">
              AI Photo Recognizer
          </h1>
          <p className="text-center text-brand-gray-400 mt-1">Powered by Gemini</p>
      </header>
      
      <main className="p-4 md:p-8">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
              <ImageUploader onImageSelect={handleImageSelect} imageUrl={imageUrl} />
              <button
                onClick={handleRecognizeClick}
                disabled={!imageFile || isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:bg-brand-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
              >
                {isLoading ? (
                  <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Recognizing...
                  </>
                ) : "✨ Recognize Image"}
              </button>
          </div>
          <ResultDisplay description={description} isLoading={isLoading} error={error} />
        </div>
      </main>

      <footer className="text-center p-4 mt-8 text-brand-gray-500 text-sm border-t border-brand-gray-800">
        <p>&copy; {new Date().getFullYear()} AI Photo Recognizer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
