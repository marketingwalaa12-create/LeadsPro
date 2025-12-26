
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Lead, SearchParams, LeadSource } from "../types";

const extractJsonFromText = (text: string) => {
  if (!text) return null;
  const cleanedText = text.trim();
  try {
    // Attempt direct parse first
    return JSON.parse(cleanedText);
  } catch (e) {
    // Attempt to extract from markdown blocks or common JSON patterns
    const jsonRegex = /(\[[\s\S]*\]|\{[\s\S]*\})/;
    const match = cleanedText.match(/```json\s*([\s\S]*?)\s*```/) || cleanedText.match(jsonRegex);
    
    if (match) {
      try {
        const jsonStr = (match[1] || match[0]).trim();
        return JSON.parse(jsonStr);
      } catch (e2) {
        console.error("Manual JSON extraction failed:", e2);
        return null;
      }
    }
    return null;
  }
};

export const extractLeadsWithGemini = async (params: SearchParams): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isMaps = params.sourceType === 'maps';
  // Use gemini-3-flash-preview for both to ensure consistent tool handling and speed
  const modelName = isMaps ? "gemini-2.5-flash" : "gemini-3-flash-preview";

  // System instruction should be concise to avoid distracting the model from extraction
  const systemInstruction = `You are a specialized Lead Extraction Engine. 
  Your primary goal is to find AS MANY businesses as possible from the search data provided by your tools. 
  Do not limit yourself to 10; try to provide 20-30 leads if the data is available. 
  Extract emails and websites ONLY if clearly visible in the data or official links.`;

  // Simplify the prompt to reduce token usage and prevent timeouts
  const prompt = `Find businesses for "${params.keyword}" in "${params.location}". 
  Provide a long list of leads. For each lead, extract:
  - name (required)
  - phone (if available)
  - website (official URL)
  - address (physical)
  - email (if found in search snippets)
  - rating (numeric)

  Output as a JSON array. Do not provide conversational text.`;

  try {
    const config: GenerateContentParameters = {
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.0, // Set to 0 for maximum consistency and speed
      }
    };

    if (isMaps) {
      config.config!.tools = [{ googleMaps: {} }];
      // Maps tool in 2.5-flash is optimized for location-based queries
    } else {
      config.config!.tools = [{ googleSearch: {} }];
      // Use responseMimeType for Search to ensure valid JSON output
      config.config!.responseMimeType = "application/json";
      config.config!.responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            phone: { type: Type.STRING, nullable: true },
            website: { type: Type.STRING, nullable: true },
            address: { type: Type.STRING, nullable: true },
            email: { type: Type.STRING, nullable: true },
            rating: { type: Type.NUMBER, nullable: true }
          },
          required: ["name"]
        }
      };
    }

    if (isMaps && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        config.config!.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }
        };
      } catch (e) {
        console.warn("Geolocation skipped", e);
      }
    }

    const response = await ai.models.generateContent(config);
    
    if (!response.text) {
      throw new Error("The search engine returned no text. Try a different source or keyword.");
    }

    const parsedData = extractJsonFromText(response.text);
    if (!parsedData || !Array.isArray(parsedData)) {
      throw new Error("The data format received was invalid. Please try again.");
    }

    // Capture grounding URLs for mandatory citations
    const sources: LeadSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title || 'Web Result', url: chunk.web.uri });
        } else if (chunk.maps) {
          sources.push({ title: chunk.maps.title || 'Google Maps', url: chunk.maps.uri });
        }
      });
    }

    return parsedData.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.name || 'Unknown Business',
      phone: item.phone || 'N/A',
      email: item.email || 'N/A',
      website: item.website || '#',
      address: item.address || 'Location N/A',
      rating: item.rating || 0,
      source: isMaps ? 'Google Maps' : 'Web Search',
      searchKeyword: params.keyword,
      searchLocation: params.location,
      sources: sources.length > 0 ? sources : undefined
    }));

  } catch (error: any) {
    console.error("Extraction Service Error:", error);
    throw error;
  }
};
