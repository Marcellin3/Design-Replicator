import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Clé API Gemini non trouvée. Veuillez configurer GEMINI_API_KEY.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const analyzeImage = async (base64Image: string) => {
  const ai = getAI();

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: "image/png",
    },
  };

  const prompt = `Analyse ce design d'interface utilisateur en détail. 
  Retourne un objet JSON avec cette structure :
  {
    "layout": ["liste des sections principales"],
    "colors": ["codes hexadécimaux dominants"],
    "typography": "description des polices et styles",
    "elements": ["boutons", "cartes", "navigation", etc.],
    "mood": "adjectifs décrivant l'ambiance"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          layout: { type: Type.ARRAY, items: { type: Type.STRING } },
          colors: { type: Type.ARRAY, items: { type: Type.STRING } },
          typography: { type: Type.STRING },
          elements: { type: Type.ARRAY, items: { type: Type.STRING } },
          mood: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("L'IA n'a pas pu analyser l'image.");
  }

  return JSON.parse(response.text);
};

export const generateReplicatedImage = async (base64Original: string, analysis: any, userPrompt: string, base64Reference?: string | null) => {
  const ai = getAI();

  const prompt = `Tu es un Designer d'Interface de Classe Mondiale.
  Structure actuelle : ${analysis?.layout?.join(', ') || 'Moderne'}
  Palette : ${analysis?.colors?.join(', ') || 'Professionnelle'}
  Style : ${analysis?.typography || 'Sleek'}

  Basé sur cette analyse et l'instruction : "${userPrompt}"
  ${base64Reference ? "Utilise l'image de référence pour le style visuel." : ""}

  Génère une NOUVELLE image de design haute résolution qui réplique la structure mais applique les modifications demandées.`;

  const parts: any[] = [
    {
      inlineData: {
        data: base64Original.startsWith('data:') ? base64Original.split(',')[1] : base64Original,
        mimeType: "image/png",
      },
    },
    { text: prompt }
  ];

  if (base64Reference) {
    parts.push({
      inlineData: {
        data: base64Reference.startsWith('data:') ? base64Reference.split(',')[1] : base64Reference,
        mimeType: "image/png",
      },
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  const responseText = response.text;
  if (responseText) {
    console.warn("L'IA a retourné du texte :", responseText);
    throw new Error("L'IA a généré du texte au lieu d'une image. Essayez une instruction plus visuelle.");
  }
  
  throw new Error("Aucune image n'a été générée.");
};
