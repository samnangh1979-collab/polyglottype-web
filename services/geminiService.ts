
import { GoogleGenAI } from "@google/genai";
import { Difficulty, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are a helper for a typing practice application. 
Your goal is to generate interesting, coherent, and grammatically correct paragraphs for typing practice.
Ensure the text is clean (no markdown, no bullets, no excessive punctuation unless appropriate for the difficulty).`;

export const generatePracticeText = async (language: Language, difficulty: Difficulty): Promise<string> => {
  try {
    let lengthPrompt = "";
    switch (difficulty) {
      case Difficulty.Easy:
        lengthPrompt = "Use simple vocabulary and short sentences. Length: 20-30 words.";
        break;
      case Difficulty.Medium:
        lengthPrompt = "Use standard vocabulary and mixed sentence structures. Length: 40-60 words.";
        break;
      case Difficulty.Hard:
        lengthPrompt = "Use complex vocabulary, advanced grammar, and longer sentences. Length: 70-100 words.";
        break;
    }

    const prompt = `Generate a random, interesting paragraph in ${language}. 
    ${lengthPrompt}
    Do not include any translations, titles, or introductory phrases like 'Here is a text'. Just the raw paragraph text.`;

    // Updated model to gemini-3-flash-preview as per the latest GenAI guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

    // Directly access response.text property as per the SDK documentation
    return response.text?.trim() || "Failed to generate text. Please try again.";
  } catch (error) {
    console.error("Error generating text:", error);
    return `Could not generate text for ${language}. Please check your connection and try again.`;
  }
};
