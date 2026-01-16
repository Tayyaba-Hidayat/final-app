
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSkinImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: "Analyze this skin image as a professional dermatologist. Identify potential issues (e.g., Acne, Eczema, Healthy) and provide a recommendation. Output in JSON format with fields: condition, confidence (0-1), recommendation." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
          },
          required: ["condition", "confidence", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { condition: "Unknown", confidence: 0, recommendation: "Please consult a doctor for accurate diagnosis." };
  }
};

export const dermaChat = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are LumeBot, a helpful dermatology assistant for the Lume Skin app. Provide advice on skin care, products, and general health. Always advise seeing a doctor for serious concerns."
    }
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};
