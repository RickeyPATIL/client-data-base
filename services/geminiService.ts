import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithGemini = async (
  message: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    // Using gemini-3-pro-preview for advanced chatbot capabilities
    const modelId = "gemini-3-pro-preview";
    
    // Construct the full history for context if needed, but for simple chat:
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: "You are a helpful project management assistant named ProjectFlow Bot. You help users manage timelines, client communications, and general productivity tasks.",
      }
    });

    // Note: In a real app we'd hydrate chat history properly. 
    // For this single-turn/simple implementation we send the message.
    const response: GenerateContentResponse = await chat.sendMessage({
      message: message,
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string | null> => {
  try {
    const ai = getAiClient();
    // Using gemini-2.5-flash-image for image editing/generation tasks (Nano Banana)
    const modelId = "gemini-2.5-flash-image";

    // Extract mime type from base64 string
    const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = match ? match[1] : "image/png";

    // Clean base64 string if it has prefix
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, // Use extracted mimeType
              data: cleanBase64,
            },
          },
          {
            text: `Edit this image: ${prompt}. Return only the edited image.`,
          },
        ],
      },
      // Config for image generation often implicit in the model behavior for multimodal input
    });

    // Check for image in response
    // The API might return the image in inlineData within the parts
    // Safely access properties that might be undefined
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};