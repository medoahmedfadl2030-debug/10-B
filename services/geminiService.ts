
import { GoogleGenAI } from "@google/genai";

// Fix: Updated function to return a Part object with `inlineData` to match the expected format for image data,
// which resolves the TypeScript error. The comment was also updated to remove references to deprecated APIs.
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { mimeType: string, data: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        reject(new Error("Could not extract base64 data from file."));
        return;
      }
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      });
    };
    reader.onerror = (error) => reject(error);
  });
};


export const describeImage = async (imageFile: File, prompt: string): Promise<string> => {
    // Fix: Removed explicit API key check and simplified error handling to align with coding guidelines.
    // The `generateContent` call now uses the correctly structured image Part.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const text = response.text;
        if (text) {
          return text;
        } else {
          throw new Error("Failed to get a text response from the API.");
        }

    } catch (error) {
        console.error("Error in describeImage service:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
