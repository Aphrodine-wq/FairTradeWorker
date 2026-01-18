
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LeadScore, CallLog, Job } from "../types";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
// Check if we are in mock mode (no key or explicit mock key)
const IS_MOCK_MODE = !API_KEY || API_KEY === 'mock_key_for_development' || API_KEY === 'undefined';

const ai = new GoogleGenAI({ apiKey: API_KEY || 'mock_key' });

const SCOPER_SYSTEM_INSTRUCTION = `
You are a highly experienced Master Tradesperson and Project Estimator.
Look at job photos, videos, listen to audio notes, and read text notes to write a professional scope of work.
Include SKU-specific materials, labor estimates, and hidden risks.
`;

// --- MOCK HELPERS ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_DATA = {
  jobAnalysis: {
    title: "Kitchen Renovation",
    scope: ["Demolish existing cabinets", "Install new plumbing fixtures", "Lay tile flooring", "Mount wall cabinets"],
    materials: [{ description: "Ceramic Tiles", quantity: 100, unitPrice: 5 }, { description: "Grout", quantity: 5, unitPrice: 20 }],
    budgetRange: "$5,000 - $8,000",
    complexity: 7,
    duration: "2 weeks",
    riskFactors: ["Hidden water damage", "Electrical wiring updates needed"]
  },
  leadScore: {
    total: 85,
    commitment: 90,
    urgency: 80,
    budgetFit: 85,
    rationale: "Client is responsive and has a realistic budget."
  },
  chatResponse: "I can help you with that! Based on your current projects, I recommend focusing on the high-margin plumbing jobs first.",
  marketIntel: {
    text: "The local market is seeing a surge in demand for eco-friendly renovations. Competitors are booking 3 weeks out.",
    sources: [{ title: "Local Construction Trends 2024", uri: "http://example.com/trends" }]
  },
  dailyBriefing: {
    summary: "Clear skies today. Perfect for outdoor work. You have 2 scheduled jobs.",
    weather: { temp: "72°F", condition: "Sunny", precip: "0%", wind: "5 mph" },
    tasks: [
      { time: "09:00 AM", title: "Smith Residence Inspection", location: "123 Maple St", type: "JOB" },
      { time: "02:00 PM", title: "Material Pickup", location: "Home Depot", type: "TASK" }
    ],
    alerts: [
      { type: "info", text: "Material prices for lumber dropped 2%." },
      { type: "warning", text: "Traffic delay on I-95." }
    ]
  },
  estimate: [
    { description: "Labor", quantity: 40, unitPrice: 75 },
    { description: "Materials", quantity: 1, unitPrice: 1500 }
  ],
  bidSuggestion: {
    amount: 4500,
    rationale: "This bid covers all materials and labor with a 20% margin, staying competitive for the area."
  },
  callLogAnalysis: {
    sentimentTrend: [80, 85, 70, 90, 95, 85, 88],
    topIssues: ["Scheduling conflicts", "Pricing questions"],
    followUpActions: [{ client: "John Doe", action: "Send revised estimate" }],
    revenueOpportunity: "Upsell maintenance packages to recent clients."
  },
  homeHealth: {
    predictions: [
      { 
        systemName: "HVAC", 
        riskLevel: "MEDIUM", 
        failureProbability: 45, 
        predictedFailureDate: "2025-11-01", 
        reasoning: "Unit is 12 years old.", 
        recommendedAction: "Schedule preventative maintenance." 
      }
    ],
    overallHealthScore: 78
  }
};

export const analyzeJobMultimodal = async (
  base64Images: string[], 
  userNotes: string, 
  base64Audio?: string,
  base64Videos: string[] = [],
  videoMimeTypes: string[] = [],
  category?: string
) => {
  if (IS_MOCK_MODE) {
    console.log("Mocking analyzeJobMultimodal...");
    await wait(1000);
    return MOCK_DATA.jobAnalysis;
  }

  try {
    const parts: any[] = [];
    base64Images.forEach(img => {
      parts.push({ inlineData: { data: img, mimeType: 'image/jpeg' } });
    });
    
    if (base64Audio) {
      parts.push({ inlineData: { data: base64Audio, mimeType: 'audio/webm' } });
    }

    if (base64Videos.length > 0) {
      base64Videos.forEach((vid, index) => {
        parts.push({ 
          inlineData: { 
            data: vid, 
            mimeType: videoMimeTypes[index] || 'video/mp4' 
          } 
        });
      });
    }
    parts.push({
      text: `Review this project. ${category ? `Trade: ${category}` : ''}. Notes: "${userNotes}". 
      Return JSON with title, scope (array), materials (array), budget range, complexity (1-10), duration, and riskFactors (array).`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SCOPER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    return MOCK_DATA.jobAnalysis; // Fallback to mock on error too
  }
};

/**
 * Scores the quality of a lead based on homeowner interaction.
 */
export const scoreLeadQuality = async (description: string, imageCount: number): Promise<LeadScore> => {
  if (IS_MOCK_MODE) {
    await wait(500);
    return MOCK_DATA.leadScore;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate this job lead for a contractor. Description: "${description}". Images provided: ${imageCount}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            total: { type: Type.NUMBER },
            commitment: { type: Type.NUMBER },
            urgency: { type: Type.NUMBER },
            budgetFit: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          },
          required: ["total", "commitment", "urgency", "budgetFit", "rationale"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as LeadScore;
  } catch (e) {
    return MOCK_DATA.leadScore;
  }
};

export const chatWithCopilot = async (history: any[], newMessage: string, profile: UserProfile) => {
  if (IS_MOCK_MODE) {
    await wait(800);
    return MOCK_DATA.chatResponse;
  }

  try {
    const systemPrompt = `You are an expert business coach for ${profile.role === 'HOMEOWNER' ? 'homeowners managing repairs' : 'contractors scaling their business'}.
    User Tier: ${profile.tier}. Style: ${profile.preferences.aiPersonality}. 
    Current Context: ${profile.role} in ${profile.avgResponseTime || 'standard'} tempo.`;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: systemPrompt },
      history: history 
    });
    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    return MOCK_DATA.chatResponse;
  }
};

export const getTerritoryMarketIntelligence = async (locationName: string, zipCode: string) => {
  if (IS_MOCK_MODE) {
    await wait(1000);
    return MOCK_DATA.marketIntel;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize local construction market in ${locationName} (${zipCode}). Trends, hardware stores, and competition.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Reference",
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];
    return { text: response.text, sources };
  } catch (error) {
    return MOCK_DATA.marketIntel;
  }
};

/**
 * Generates a concise daily briefing based on the user's profile and current day context.
 */
export const generateDailyBriefing = async (profile: UserProfile, date: string, city: string) => {
  if (IS_MOCK_MODE) {
    // console.log("Mocking daily briefing...");
    await wait(600);
    return MOCK_DATA.dailyBriefing;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a structured daily briefing for a ${profile.role} named ${profile.name} in ${city} on ${date}.
      Include a weather forecast, 3 realistic tasks for a tradesperson, and 2 system alerts (one warning, one info).
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            weather: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.STRING },
                condition: { type: Type.STRING },
                precip: { type: Type.STRING },
                wind: { type: Type.STRING }
              }
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  location: { type: Type.STRING },
                  type: { type: Type.STRING } // JOB, ESTIMATE, TASK
                }
              }
            },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING }, // warning or info
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) { 
    console.error(error);
    return MOCK_DATA.dailyBriefing; 
  }
};

export const generateEstimate = async (description: string) => {
  if (IS_MOCK_MODE) {
    await wait(1000);
    return MOCK_DATA.estimate;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate line-item estimate for: "${description}". JSON array of objects with description, quantity, and unitPrice.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
            },
            required: ["description", "quantity", "unitPrice"],
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  } catch (error) { return MOCK_DATA.estimate; }
};

export const generateBidSuggestion = async (job: Job) => {
  if (IS_MOCK_MODE) {
    await wait(800);
    return MOCK_DATA.bidSuggestion;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert estimator. Suggest a competitive, winning bid for this job based on description and location market rates.
      Title: ${job.title}
      Category: ${job.category}
      Description: ${job.description}
      Location: ${job.location}
      Client Budget: ${job.budgetRange}
      Urgency: ${job.isUrgent ? 'High' : 'Normal'}
      
      Return JSON with a specific numeric 'amount' and a short 'rationale' explaining why this price wins.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          },
          required: ["amount", "rationale"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Bid Gen Error:", error);
    return MOCK_DATA.bidSuggestion;
  }
};

/**
 * Analyzes call logs to provide structured intelligence and business insights.
 */
export const analyzeCallLogsIntelligence = async (calls: CallLog[]) => {
  if (IS_MOCK_MODE) {
    await wait(1500);
    return MOCK_DATA.callLogAnalysis;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these customer call logs for a service business: ${JSON.stringify(calls)}.
      Determine customer sentiment trends, list top recurring issues, and suggest follow-up actions.
      Provide one major revenue growth opportunity based on the data.
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentimentTrend: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Array of daily sentiment scores (0-100) for a 7-day trend"
            },
            topIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Primary customer pain points or common service requests"
            },
            followUpActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  client: { type: Type.STRING },
                  action: { type: Type.STRING }
                },
                required: ["client", "action"]
              }
            },
            revenueOpportunity: {
              type: Type.STRING,
              description: "Actionable business insight to increase profitability"
            }
          },
          required: ["sentimentTrend", "topIssues", "followUpActions", "revenueOpportunity"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Call Log Intelligence Error:", error);
    return MOCK_DATA.callLogAnalysis;
  }
};

/**
 * Analyzes home systems to predict potential failures and maintenance needs.
 */
export const analyzeHomeHealth = async (systems: any[]) => {
  if (IS_MOCK_MODE) {
    await wait(1200);
    return MOCK_DATA.homeHealth;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these home systems for potential failures. Systems: ${JSON.stringify(systems)}.
      Predict failures based on age and status.
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  systemName: { type: Type.STRING },
                  riskLevel: { type: Type.STRING }, // LOW, MEDIUM, HIGH, CRITICAL
                  failureProbability: { type: Type.NUMBER }, // 0-100
                  predictedFailureDate: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  recommendedAction: { type: Type.STRING }
                },
                required: ["systemName", "riskLevel", "failureProbability", "reasoning", "recommendedAction"]
              }
            },
            overallHealthScore: { type: Type.NUMBER }
          },
          required: ["predictions", "overallHealthScore"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Home Health Analysis Error:", error);
    return MOCK_DATA.homeHealth;
  }
};
