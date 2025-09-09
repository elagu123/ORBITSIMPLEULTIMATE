import { GoogleGenAI, Type, Modality } from "@google/genai";
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile, EnhancedCustomer, SpecialDate, VideoIdea, VideoOperation, AppContextState, CreativeBrief, ContextualSuggestion, AIRecommendedAction, AIPerformancePrediction, ContentVariation, OptimalTimeSlot, PromptAnalysis, CalendarEvent, ContentGapSuggestion, HumanizedMetric, ActionableInsight, SmartNotification, AICampaignPlan, CalendarContentSuggestion, CollectiveInsight, AILearningFact, ProactiveTask } from "../types/index";

/**
 * AI Service (Simulated Backend)
 *
 * This service class encapsulates all interactions with the Google Gemini API.
 * In a real-world application, these methods would be endpoints on a secure backend server.
 * The API key is handled here and is not exposed to the UI components, fixing the security issue.
 */
class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.warn("API_KEY environment variable not set. AIService will not function.");
    }
  }

  private isConfigured(): boolean {
    if (!this.ai) {
        console.error("AI Service is not configured. An API key is required.");
        return false;
    }
    return true;
  }
  
  // =================================================================
  // NEW: Onboarding Intelligence
  // =================================================================
  public async runMagicOnboarding(businessName: string, industry: BusinessProfile['industry']): Promise<BusinessProfile> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are a "Magic Onboarding" AI for a marketing application called Orbit MKT. Your task is to take a business name and industry and automatically generate a complete, plausible, and well-structured business profile. This pre-fills the setup for the user, creating a "wow" experience.

      User's Input:
      - Business Name: "${businessName}"
      - Industry: "${industry}"

      Instructions:
      Based on the name and industry, generate a comprehensive BusinessProfile.
      1.  **marketingGoals**: Infer the most likely goals. For a new restaurant, it would be "increaseSales" and "buildBrandAwareness".
      2.  **brandVoice**: Infer a suitable tone and invent 2-3 relevant brand values.
      3.  **aiStrategy**: This is the most important part. Create a detailed strategy:
          -   **brandVoiceSpectrums**: Set the sliders (0.0 to 1.0) to match the inferred brand voice.
          -   **brandArchetype**: Choose the most fitting archetype.
          -   **keyTerminology**: Invent a few words to use and avoid.
          -   **targetAudience**: Describe a plausible target audience and their key pain points.
          -   **seoGuidelines**: Suggest 2-3 primary and secondary keywords.

      Your entire response MUST be a single, valid JSON object matching the BusinessProfile type definition provided in the schema. Do not add any other text or markdown.
    `;
    
    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              businessName: { type: Type.STRING },
              industry: { type: Type.STRING },
              marketingGoals: {
                type: Type.OBJECT,
                properties: {
                  increaseSales: { type: Type.BOOLEAN },
                  buildBrandAwareness: { type: Type.BOOLEAN },
                  customerRetention: { type: Type.BOOLEAN },
                  leadGeneration: { type: Type.BOOLEAN },
                },
                required: ["increaseSales", "buildBrandAwareness", "customerRetention", "leadGeneration"]
              },
              brandVoice: {
                type: Type.OBJECT,
                properties: {
                  tone: { type: Type.STRING },
                  values: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["tone", "values"]
              },
              aiStrategy: {
                type: Type.OBJECT,
                properties: {
                  brandVoiceSpectrums: {
                    type: Type.OBJECT,
                    properties: {
                      formalVsCasual: { type: Type.NUMBER },
                      seriousVsHumorous: { type: Type.NUMBER },
                      calmVsEnthusiastic: { type: Type.NUMBER },
                    },
                    required: ["formalVsCasual", "seriousVsHumorous", "calmVsEnthusiastic"]
                  },
                  brandArchetype: { type: Type.STRING },
                  keyTerminology: {
                    type: Type.OBJECT,
                    properties: {
                      wordsToUse: { type: Type.ARRAY, items: { type: Type.STRING } },
                      wordsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["wordsToUse", "wordsToAvoid"]
                  },
                  targetAudience: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      painPoints: { type: Type.STRING },
                    },
                    required: ["description", "painPoints"]
                  },
                  seoGuidelines: {
                    type: Type.OBJECT,
                    properties: {
                      primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                      secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["primaryKeywords", "secondaryKeywords"]
                  }
                },
                required: ["brandVoiceSpectrums", "brandArchetype", "keyTerminology", "targetAudience", "seoGuidelines"]
              }
            },
            required: ["businessName", "industry", "marketingGoals", "brandVoice", "aiStrategy"]
          }
        }
      });
      const parsedJson = JSON.parse(response.text.trim());
      // The model might not return the name/industry, so we ensure they are set.
      parsedJson.businessName = businessName;
      parsedJson.industry = industry;
      return parsedJson;
    } catch (error) {
      console.error("Error running magic onboarding:", error);
      throw error;
    }
  }


  // =================================================================
  // AI Campaign Orchestration
  // =================================================================
  public async generateAICampaignPlan(goal: string, profile: BusinessProfile): Promise<AICampaignPlan> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are a world-class marketing strategist AI for a small business. Your task is to take a high-level goal and create a complete, actionable, multi-channel marketing campaign plan.

      Business Profile:
      - Name: ${profile.businessName}
      - Industry: ${profile.industry}
      - Marketing Goals: ${Object.keys(profile.marketingGoals).filter(k => profile.marketingGoals[k as keyof typeof profile.marketingGoals]).join(', ')}
      - Brand Voice: ${profile.brandVoice.tone}, leaning towards ${profile.aiStrategy.brandVoiceSpectrums.formalVsCasual > 0.5 ? 'Formal' : 'Casual'}.
      - Target Audience: ${profile.aiStrategy.targetAudience.description}

      User's Campaign Goal: "${goal}"

      Instructions:
      1.  **Deconstruct the Goal**: Understand the user's intent.
      2.  **Define a Strategy**: Create a cohesive strategy for a short campaign (3-5 days).
      3.  **Audience Segmentation**: Describe the ideal customer segment for this campaign. Invent plausible criteria and an estimated reach number.
      4.  **Content Creation**: Plan 3-4 pieces of content across different channels (e.g., Instagram, Facebook, Email). For each piece, provide a catchy title and a one-sentence snippet of the content.
      5.  **Scheduling**: Create a day-by-day schedule for the content, assigning a day number and a specific time.
      6.  **Format Output**: Return a single, valid JSON object matching the AICampaignPlan type definition.

      Example for "Promote our new coffee blend":
      - campaignName: "Summer Brew Launch"
      - goal: "Generate buzz and initial sales for the new Summer Brew coffee blend."
      - durationDays: 3
      - audience: { "description": "Existing customers who have purchased coffee in the last 3 months.", "estimatedReach": 150, "criteria": ["Is a 'customer'", "Last purchase < 90 days"] }
      - content: [ { "title": "Teaser: Something New is Brewing", "channel": "Instagram", "contentSnippet": "Get ready to cool down this summer... ☀️ Something exciting is coming soon!" }, ... ]
      - schedule: [ { "day": 1, "time": "09:00 AM", "contentTitle": "Teaser: Something New is Brewing" }, ... ]
    `;

    try {
        const response = await this.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        campaignName: { type: Type.STRING },
                        goal: { type: Type.STRING },
                        durationDays: { type: Type.INTEGER },
                        audience: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                estimatedReach: { type: Type.INTEGER },
                                criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ["description", "estimatedReach", "criteria"]
                        },
                        content: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    channel: { type: Type.STRING, enum: ['Instagram', 'Facebook', 'Email'] },
                                    contentSnippet: { type: Type.STRING },
                                },
                                required: ["title", "channel", "contentSnippet"]
                            }
                        },
                        schedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.INTEGER },
                                    time: { type: Type.STRING },
                                    contentTitle: { type: Type.STRING },
                                },
                                required: ["day", "time", "contentTitle"]
                            }
                        }
                    },
                    required: ["campaignName", "goal", "durationDays", "audience", "content", "schedule"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating AI campaign plan:", error);
        throw error;
    }
  }

  // =================================================================
  // NEW: Systems - Intelligent Notifications
  // =================================================================
  
  public async getSmartNotifications(profile: BusinessProfile): Promise<SmartNotification[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");
    
    const prompt = `
      You are an AI notification engine for a ${profile.industry} business called "${profile.businessName}".
      Based on the following simulated real-time events, generate a list of 4-5 smart notifications for the business owner.
      
      Simulated Events:
      - A VIP customer, "John Doe", hasn't made a purchase in 45 days.
      - Sales for the "premium coffee" product are up 30% this week.
      - The connected payment processor (Mercado Pago) had a brief API outage 1 hour ago but is now stable.
      - The "Summer Sale" marketing campaign just finished.
      - A new customer made their first purchase of $120.

      Follow the user's specification for notification categories: 'critical', 'opportunity', 'warning', 'informational'.
      
      For each notification, generate a JSON object with:
      - 'id': A unique string id.
      - 'category': The category of the notification ('critical', 'opportunity', 'warning', 'informational').
      - 'icon': An icon name ('alert', 'trending_up', 'warning', 'info').
      - 'title': A short, clear title.
      - 'description': A one-sentence summary of the event.
      - 'timestamp': A relative time string (e.g., "5m ago", "1h ago").
      - 'actions': An object with a 'primary' action and an optional 'secondary' action, each with a 'label'.
      
      Return a valid JSON array of these objects, prioritized with critical items first.
    `;
    
    try {
        const response = await this.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            category: { type: Type.STRING, enum: ['critical', 'opportunity', 'warning', 'informational'] },
                            icon: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            timestamp: { type: Type.STRING },
                            actions: {
                                type: Type.OBJECT,
                                properties: {
                                    primary: {
                                        type: Type.OBJECT,
                                        properties: { label: { type: Type.STRING } },
                                        required: ["label"]
                                    },
                                    secondary: {
                                        type: Type.OBJECT,
                                        properties: { label: { type: Type.STRING } }
                                    }
                                },
                                required: ["primary"]
                            }
                        },
                        required: ["id", "category", "icon", "title", "description", "timestamp", "actions"]
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating smart notifications:", error);
        throw error;
    }
  }


  // =================================================================
  // Systems - Humanized Analytics
  // =================================================================

  public async getHumanizedMetrics(profile: BusinessProfile): Promise<HumanizedMetric[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");
    
    const prompt = `
      You are an AI that translates raw business data into simple, humanized metrics for a business owner.
      Business Profile: A ${profile.industry} called "${profile.businessName}".
      
      Analyze these key mock metrics for the past week:
      - Total Reach: 1,250 people (up 50% from last week)
      - Weekly Sales: $4,500 (driven mostly by Friday sales)
      - Active Customers: 324 (retention rate is 91%)
      
      For each metric, generate a JSON object with:
      - 'emoji': A single, relevant emoji.
      - 'simple': A simple, one-sentence summary of the metric.
      - 'context': A brief sentence explaining the trend or providing context.
      - 'action': A short, actionable recommendation based on the metric.
      
      Return a valid JSON array of these three objects.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                emoji: { type: Type.STRING },
                simple: { type: Type.STRING },
                context: { type: Type.STRING },
                action: { type: Type.STRING },
              },
              required: ["emoji", "simple", "context", "action"]
            }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error generating humanized metrics:", error);
      throw error;
    }
  }

  public async getActionableInsights(profile: BusinessProfile, customers: EnhancedCustomer[]): Promise<ActionableInsight[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");
    
    const atRiskCustomers = customers.filter(c => c.aiAnalysis.churnRisk.level === 'high').slice(0, 3);
    const mockOpportunities = [
        "Martes y jueves son los días con menos ventas.",
        "Los clientes que compran café también compran croissants el 80% de las veces."
    ];

    const prompt = `
      You are a proactive business analyst AI for a ${profile.industry} called "${profile.businessName}".
      Analyze the following data points and generate 2-3 of the most critical, actionable insights.

      Data Points:
      - At-Risk Customers (High Churn Probability): ${atRiskCustomers.map(c => c.personal.firstName).join(', ') || 'None'}
      - Potential Opportunities: ${mockOpportunities.join('; ')}

      For each insight, generate a JSON object with:
      - 'icon': A single, relevant emoji.
      - 'title': A short, clear title for the insight.
      - 'impact': A sentence describing the potential business impact (e.g., risk of loss, opportunity for gain).
      - 'actionText': A short, verb-based call to action for a button.

      Return a valid JSON array of these objects.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                icon: { type: Type.STRING },
                title: { type: Type.STRING },
                impact: { type: Type.STRING },
                actionText: { type: Type.STRING },
              },
              required: ["icon", "title", "impact", "actionText"]
            }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error generating actionable insights:", error);
      throw error;
    }
  }

  public async getIntegrationSummary(integrationName: string, profile: BusinessProfile): Promise<string> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are an AI assistant for a marketing app. The user has connected an external service.
      Generate a short, single-sentence "smart summary" of plausible, positive, recent activity for that service.
      
      Business Name: "${profile.businessName}"
      Connected Service: "${integrationName}"

      Example for "Mercado Pago": "Received 5 new payments today totaling $250."
      Example for "Google Calendar": "Successfully synced 3 new events for next week's campaign."
      Example for "Mailchimp": "Your latest newsletter has a 25% open rate so far."

      Keep it concise and positive. Output only the single sentence summary.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error(`Error generating summary for ${integrationName}:`, error);
      throw error;
    }
  }

  // =================================================================
  // DAM & Visual Editor Intelligence
  // =================================================================

  public async autoTagAsset(imageUrl: string): Promise<string[]> {
      if (!this.isConfigured()) throw new Error("AI client is not initialized.");

      const prompt = "Analyze this image and generate a list of 5-10 relevant, descriptive tags. The tags should include objects, the scene, concepts, and colors. Return only a JSON array of strings.";
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageUrl.split(',')[1] } };

      try {
          const response = await this.ai!.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, { text: prompt }] },
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                  }
              }
          });
          return JSON.parse(response.text.trim());
      } catch (error) {
          console.error("Error auto-tagging asset:", error);
          throw error;
      }
  }

  public async removeBackground(imageUrl: string): Promise<string> {
      if (!this.isConfigured()) throw new Error("AI client is not initialized.");

      const mimeType = imageUrl.split(';')[0].split(':')[1];
      const data = imageUrl.split(',')[1];
      const prompt = "Remove the background from this image completely, leaving only the main subject with a transparent background.";

      try {
          const response = await this.ai!.models.generateContent({
              model: 'gemini-2.5-flash-image-preview',
              contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] },
              config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
          });

          const parts = response.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
          }
          throw new Error("AI did not return an image with the background removed.");
      } catch (error) {
          console.error("Error removing background:", error);
          throw error;
      }
  }

  // =================================================================
  // Advanced Content & Scheduling Intelligence
  // =================================================================

  public async generateCalendarContentIdeas(specialDates: SpecialDate[], optimalTimes: OptimalTimeSlot[], profile: BusinessProfile): Promise<CalendarContentSuggestion[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");
    
    const prompt = `
      You are a creative content strategist AI for a ${profile.industry} business named "${profile.businessName}".
      Your goal is to generate 3 engaging and relevant content ideas for the user's content calendar.

      Analyze the following context:
      - Upcoming Special Dates: ${specialDates.length > 0 ? specialDates.map(d => `${d.name} on ${d.date}`).join(', ') : 'None'}
      - AI-suggested Optimal Posting Times: ${optimalTimes.length > 0 ? optimalTimes.map(t => t.time).join(', ') : 'None available'}
      - Brand Voice: ${profile.brandVoice.tone}
      - Target Audience: ${profile.aiStrategy.targetAudience.description}

      Instructions:
      1.  Create 3 unique content ideas. Each idea should be directly inspired by an upcoming special date or a general theme suitable for the business.
      2.  For each idea, provide:
          - 'id': a unique string identifier for the idea.
          - 'title': A short, catchy title for the content idea.
          - 'reason': A brief explanation of why this idea is relevant (e.g., "Ties into upcoming National Ice Cream Day").
          - 'suggestedDate': The most logical date (YYYY-MM-DD) for this post, usually the date of the special event.
          - 'prompt': A detailed, creative prompt for another AI to generate the full post content. This prompt should include the angle, desired tone, and a call to action.
      3.  Return a valid JSON array of these objects.
    `;

    try {
        const response = await this.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            reason: { type: Type.STRING },
                            suggestedDate: { type: Type.STRING },
                            prompt: { type: Type.STRING },
                        },
                        required: ["id", "title", "reason", "suggestedDate", "prompt"]
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating calendar content ideas:", error);
        throw error;
    }
  }

  public async getOptimalPostingTimes(events: CalendarEvent[]): Promise<OptimalTimeSlot[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");
    
    const prompt = `
      You are a social media analyst AI. Based on general best practices and the user's current schedule, suggest the top 3 optimal time slots to post content this week for maximum engagement.
      Current schedule has posts on: ${events.map(e => new Date(e.date).toLocaleDateString('en-us', { weekday: 'long' })).join(', ')}.
      Provide a brief 'reason' for each suggestion. Return a valid JSON array of objects.
    `;

    try {
        const response = await this.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            time: { type: Type.STRING, description: "e.g., 'Wednesday at 7:00 PM'" },
                            reason: { type: Type.STRING }
                        },
                        required: ["time", "reason"]
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error fetching optimal times:", error);
        return [ { time: "Wednesday at 7:00 PM", reason: "Mid-week evening slot often has high user activity." } ]; // Fallback
    }
  }
  
  public async findContentGaps(events: CalendarEvent[]): Promise<ContentGapSuggestion[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");
    
    const prompt = `
      You are a content strategist AI. Analyze the user's content calendar for the next 7 days and identify 2-3 empty days or "gaps" where they should post.
      Today is ${new Date().toISOString().split('T')[0]}.
      Current schedule has posts on these dates: ${events.map(e => e.date).join(', ')}.
      For each gap, provide the 'date' (YYYY-MM-DD) and a creative content 'idea'. Return a valid JSON array of objects.
    `;

    try {
        const response = await this.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING },
                            idea: { type: Type.STRING }
                        },
                        required: ["date", "idea"]
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error finding content gaps:", error);
        return [ { date: "Tomorrow", idea: "Ask an engaging question related to your industry." } ]; // Fallback
    }
  }


  public async enhancePrompt(initialPrompt: string, profile: BusinessProfile): Promise<PromptAnalysis> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are an expert AI Prompt Engineer. Your task is to analyze a user's prompt for generating social media content, research the topic, and then rewrite the prompt to be more effective, specific, and aligned with the user's brand.

      User's Business Profile:
      - Industry: ${profile.industry}
      - Brand Voice: ${profile.brandVoice.tone}, ${profile.aiStrategy.brandArchetype}
      - Target Audience: ${profile.aiStrategy.targetAudience.description}

      User's Initial Prompt: "${initialPrompt}"

      Instructions:
      1.  **Analyze & Research**: Use Google Search to understand the topic of the user's prompt. Find out what kind of content performs well for this topic and this industry.
      2.  **Rewrite the Prompt**: Based on your research, rewrite the user's prompt. Make it more detailed. Suggest a specific angle, format (e.g., list, question, story), and call-to-action that would be effective.
      3.  **Explain Your Changes**: Briefly explain *why* you made the changes in a few bullet points. Focus on how your changes will lead to a better result.
      4.  Your entire response MUST be a single, raw, valid JSON object with the keys 'suggestedPrompt' (string) and 'reasoning' (an array of strings). Do not include any surrounding text, explanations, or markdown formatting like \`\`\`json.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        }
      });
      const rawJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(rawJson);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      throw error;
    }
  }

  public async generateContentVariations(originalText: string, profile: BusinessProfile): Promise<ContentVariation[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are a versatile copywriter AI. Your task is to rewrite a given social media post in three different tones, while keeping the core message intact.
      
      Business Profile:
      - Industry: ${profile.industry}
      - Brand Voice: ${profile.brandVoice.tone}
      
      Original Text:
      "${originalText}"
      
      Instructions:
      Generate three variations of the text with the following tones:
      1.  **More Professional**: Use a more formal and authoritative voice.
      2.  **More Casual & Fun**: Use a relaxed, playful, and emoji-heavy style.
      3.  **More Direct & Urgent**: Create a sense of urgency and a clear, strong call to action.
      
      Return a valid JSON array of objects.
    `;
    
    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tone: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ["tone", "text"],
            }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error generating content variations:", error);
      throw error;
    }
  }

  public async getPerformancePrediction(postText: string, imageUrl: string | undefined, profile: BusinessProfile): Promise<AIPerformancePrediction> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are a social media expert AI. Analyze the provided post components and predict its performance.

      Business Profile:
      - Industry: ${profile.industry}
      - Target Audience: ${profile.aiStrategy.targetAudience.description}

      Post Components:
      - Text: "${postText}"
      - Has Image: ${!!imageUrl}
      
      Instructions:
      Provide a detailed performance analysis in a JSON object.
      1.  **scores**: Rate 'text' (clarity, engagement), 'visual' (appeal, relevance), and 'cta' (Call To Action clarity) from 0 to 100. If no image, score visual as 0.
      2.  **overallScore**: Calculate a weighted average score.
      3.  **suggestions**: Provide one short, actionable 'text' suggestion and one 'visual' suggestion for improvement.
    `;
    
    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              scores: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.INTEGER },
                  visual: { type: Type.INTEGER },
                  cta: { type: Type.INTEGER },
                },
                required: ["text", "visual", "cta"]
              },
              suggestions: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.ARRAY, items: { type: Type.STRING } },
                  visual: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["text", "visual"]
              }
            },
            required: ["overallScore", "scores", "suggestions"]
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error getting performance prediction:", error);
      throw error;
    }
  }
  
  // =================================================================
  // Strategic Content Generation & Deep CRM Analysis
  // =================================================================
  public async runCustomerDeepAnalysis(customer: EnhancedCustomer, profile: BusinessProfile): Promise<EnhancedCustomer['aiAnalysis']> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are a world-class CRM analyst AI. Your task is to perform a deep predictive analysis on a single customer based on their data.

      Business Profile:
      - Industry: ${profile.industry}
      - Business Name: ${profile.businessName}

      Customer Data:
      - Name: ${customer.personal.firstName} ${customer.personal.lastName}
      - Lifecycle Stage: ${customer.business.lifecycle}
      - Total Spent: $${customer.transactions.totalSpent.toFixed(2)}
      - Last Purchase Date: ${customer.transactions.lastPurchaseDate}
      - Date Added: ${customer.business.dateAdded}
      - Timeline History (last 5 events): ${JSON.stringify(customer.timeline.slice(0, 5))}

      Instructions:
      Analyze the provided data and return a JSON object with your predictions. Do not add any other text or markdown.
      1.  **churnRisk**:
          -   Calculate a 'score' (0.0 to 1.0) for churn probability. High score means high risk. Consider inactivity, low spending, or negative feedback.
          -   Determine a 'level' ('low', 'medium', 'high').
          -   Identify the single 'mainFactor' for the risk (e.g., "long time since last purchase", "low total spending", "recent complaint").
          -   Provide a one-sentence 'explanation' that elaborates on the factor, e.g., "He hasn't purchased in over a month, which is longer than his usual buying cycle."
      2.  **nextVisitPrediction**:
          -   Predict the 'predictedDate' (YYYY-MM-DD) for their next visit based on past behavior.
          -   Assess the 'confidence' of your prediction ('low', 'medium', 'high').
      3.  **upsellOpportunity**:
          -   Identify a potential 'productOrService' to upsell or cross-sell.
          -   Provide a brief 'reason' for the suggestion.
          -   Provide a one-sentence 'explanation' on why this is a good upsell for them, e.g., "Since they frequently buy coffee, offering a subscription could increase their loyalty and lifetime value."
          -   If no clear opportunity exists, return null for this entire object.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              churnRisk: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  level: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                  mainFactor: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["score", "level", "mainFactor", "explanation"]
              },
              nextVisitPrediction: {
                type: Type.OBJECT,
                properties: {
                  predictedDate: { type: Type.STRING },
                  confidence: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                },
                required: ["predictedDate", "confidence"]
              },
              upsellOpportunity: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  productOrService: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["productOrService", "reason", "explanation"]
              }
            },
            required: ["churnRisk", "nextVisitPrediction", "upsellOpportunity"]
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error running customer deep analysis:", error);
      throw error;
    }
  }
  
  public async generateAIRecommendedActions(customer: EnhancedCustomer, analysis: EnhancedCustomer['aiAnalysis'], profile: BusinessProfile): Promise<AIRecommendedAction[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are a proactive marketing assistant AI. Based on the customer's profile and a deep analysis, generate a prioritized list of 2-3 recommended actions.
      
      Customer: ${customer.personal.firstName}, a ${customer.business.lifecycle} customer.
      
      AI Analysis:
      - Churn Risk: ${analysis.churnRisk.level} (${analysis.churnRisk.mainFactor})
      - Next Visit Prediction: ${analysis.nextVisitPrediction.predictedDate}
      - Upsell Opportunity: ${analysis.upsellOpportunity?.productOrService || 'None'}

      Instructions:
      1.  Generate a list of 2-3 smart, actionable marketing recommendations.
      2.  For each action, provide:
          - 'priority': 'high', 'medium', or 'low'. High priority for high churn risk.
          - 'icon': An appropriate icon from this list: Mail, Star, Tag.
          - 'title': A short, catchy title for the action (e.g., "Send Retention Offer").
          - 'description': A brief explanation of why this action is recommended.
          - 'actionType': For now, always use 'generate_communication'.
          - 'prompt': A detailed instruction for another AI to generate the content (e.g., "Draft a friendly win-back email...").
      3.  Return a valid JSON array of objects. Do not include any other text or markdown.
      
      Example for a high churn risk customer:
      [
        { "id": "rec1", "priority": "high", "icon": "Mail", "title": "Send Retention Offer", "description": "High churn risk detected. A personalized offer could win them back.", "actionType": "generate_communication", "prompt": "Draft a warm, personalized 'we miss you' email for ${customer.personal.firstName}, including a special 15% discount offer to encourage their return." }
      ]
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                icon: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                actionType: { type: Type.STRING },
                prompt: { type: Type.STRING },
              },
              required: ["id", "priority", "icon", "title", "description", "actionType", "prompt"]
            }
          }
        }
      });
      // Add a random ID to each action for key purposes
      return JSON.parse(response.text.trim()).map((action: any) => ({...action, id: `action-${Math.random()}`}));
    } catch (error) {
      console.error("Error generating recommended actions:", error);
      return []; // Return empty array on failure
    }
  }


  public async generateContextualSuggestions(context: AppContextState, profile: BusinessProfile): Promise<ContextualSuggestion[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const marketingGoals = Object.entries(profile.marketingGoals)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(', ');

    const prompt = `
      You are a helpful AI assistant integrated into a marketing application called Orbit MKT. Your goal is to provide proactive, context-aware suggestions to the user.

      Based on the user's current context and their business profile, generate 4 short, actionable suggestions.

      Here is the context:
      - User is on the "${context.page}" page.
      ${context.entityName ? `- They are currently viewing: "${context.entityName}".` : ''}

      Here is the business profile:
      - Business Name: ${profile.businessName}
      - Industry: ${profile.industry}
      - Marketing Goals: ${marketingGoals || 'Not specified'}
      - Brand Voice: ${profile.brandVoice.tone}

      Instructions:
      1.  Analyze the context and profile to create highly relevant suggestions.
      2.  Each suggestion should have a short 'label' for a button (max 4 words) and a longer 'prompt' that will be sent to the chat if the user clicks it.
      3.  Assign an appropriate 'icon' for each suggestion from this list: FileText, Tag, Cake, Star, Users, Mail.
      4.  Return the output as a valid JSON array of objects. Do not include any other text or markdown.

      Example for Customers page viewing "John Doe":
      [
        { "label": "Draft follow-up", "prompt": "Draft a friendly follow-up email for John Doe about their last purchase.", "icon": "Mail" },
        { "label": "Offer VIP status", "prompt": "Check if John Doe qualifies for VIP status and write a message to offer it.", "icon": "Star" }
      ]

      Example for Content page:
      [
        { "label": "Create promo post", "prompt": "Create a new promotional post about our latest offers, focusing on increasing sales.", "icon": "Tag" },
        { "label": "Write educational content", "prompt": "Write an educational blog post about a topic relevant to the ${profile.industry} industry.", "icon": "FileText" }
      ]
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                prompt: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ["label", "prompt", "icon"]
            }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error generating contextual suggestions:", error);
      throw error;
    }
  }
  
  public async getCreativeBrief(prompt: string, profile: BusinessProfile, context: AppContextState): Promise<CreativeBrief> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const strategicContext = `
      Business Profile:
      - Name: ${profile.businessName}
      - Industry: ${profile.industry}
      - Brand Archetype: ${profile.aiStrategy.brandArchetype}
      - Tone: Leans towards ${profile.aiStrategy.brandVoiceSpectrums.formalVsCasual > 0.5 ? 'Formal' : 'Casual'}, ${profile.aiStrategy.brandVoiceSpectrums.seriousVsHumorous > 0.5 ? 'Serious' : 'Humorous'}, and ${profile.aiStrategy.brandVoiceSpectrums.calmVsEnthusiastic > 0.5 ? 'Enthusiastic' : 'Calm'}.
      
      Target Audience: ${profile.aiStrategy.targetAudience.description}
      Pain Points to Address: ${profile.aiStrategy.targetAudience.painPoints}
    `;

    const researchPrompt = `
      You are a world-class marketing strategist AI. Your task is to research a user's request and create a "Creative Intelligence Report" before any content is written.
      
      User's Request: "${prompt}"
      
      Current Application Context: The user is on the "${context.page}" page${context.entityName ? `, looking at "${context.entityName}"` : ''}.

      ${strategicContext}

      Instructions:
      1.  Analyze the user's request and the strategic context.
      2.  Use Google Search to research the topic in real-time. Find out what's currently popular, engaging, and effective related to the user's request.
      3.  Synthesize your findings into a structured report.
      4.  Your entire response MUST be a single, raw, valid JSON object with the following keys:
          - "identifiedTrend": A key trend or insight discovered from the web search. What's working for others right now?
          - "recommendedAngle": A creative and strategic angle for the content that aligns with the business profile and the identified trend.
          - "suggestedFormat": The best format for this content (e.g., 'Instagram Carousel', 'Short blog post', 'Facebook poll').
          - "recommendedHashtags": An array of 3-5 trending and relevant hashtags, without the '#' symbol.
      5.  Do not include any surrounding text, explanations, or markdown formatting like \`\`\`json.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: researchPrompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      const rawJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(rawJson);
    } catch (error) {
      console.error("Error generating creative brief:", error);
      throw error;
    }
  }

  public async generatePostFromBrief(brief: CreativeBrief, profile: BusinessProfile, context: AppContextState): Promise<string> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const generationPrompt = `
      You are a master social media copywriter AI. Your task is to write the final content based on a strategic brief.
      
      Business Profile:
      - Name: ${profile.businessName}
      - Industry: ${profile.industry}
      - Brand Archetype: ${profile.aiStrategy.brandArchetype}
      - Tone: Leans towards ${profile.aiStrategy.brandVoiceSpectrums.formalVsCasual > 0.5 ? 'Formal' : 'Casual'}, ${profile.aiStrategy.brandVoiceSpectrums.seriousVsHumorous > 0.5 ? 'Serious' : 'Humorous'}, and ${profile.aiStrategy.brandVoiceSpectrums.calmVsEnthusiastic > 0.5 ? 'Enthusiastic' : 'Calm'}.
      - Keywords to Use: ${profile.aiStrategy.keyTerminology.wordsToUse.join(', ') || 'None'}
      - Keywords to Avoid: ${profile.aiStrategy.keyTerminology.wordsToAvoid.join(', ') || 'None'}

      Target Audience: ${profile.aiStrategy.targetAudience.description}
      Pain Points to Address: ${profile.aiStrategy.targetAudience.painPoints}

      Strategic Brief:
      - Identified Trend: ${brief.identifiedTrend}
      - Recommended Angle: ${brief.recommendedAngle}
      - Suggested Format: ${brief.suggestedFormat}

      Instructions:
      - Write the social media post.
      - Strictly adhere to the brand voice and the strategic brief.
      - Incorporate the recommended hashtags naturally at the end of the post.
      - Be creative, engaging, and effective.
      - Do not add any commentary or titles. Just output the final post text.
    `;

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: generationPrompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating post from brief:", error);
      throw error;
    }
  }

  // =================================================================
  // AI Strategy - Collective Intelligence & Learning
  // =================================================================
  public async getCollectiveInsights(profile: BusinessProfile): Promise<CollectiveInsight[]> {
    if (!this.isConfigured()) throw new Error("AI client is not initialized.");

    const prompt = `
      You are an AI that provides insights based on aggregated data from similar businesses.
      The user's business is a "${profile.industry}" named "${profile.businessName}".

      Generate 3 short, powerful insights that this business could learn from a network of similar businesses.
      For each insight:
      - 'text': The insight itself, written as a direct learning.
      - 'source': The category of the insight from this list: 'promociones', 'horarios', 'tono'.

      Return a valid JSON array of these objects.
    `;
    
    try {
        const response = await this.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            source: { type: Type.STRING, enum: ['promociones', 'horarios', 'tono'] },
                        },
                        required: ["text", "source"]
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating collective insights:", error);
        throw error;
    }
  }

  public async getAILearningQuestion(profile: BusinessProfile, learnedFacts: AILearningFact[]): Promise<string> {
    if (!this.isConfigured()) return "What's your best-selling product this month?";

    const prompt = `
        You are the 'Memory' module of an AI marketing assistant. Your goal is to learn more about the user's business by asking simple, insightful questions.
        
        Business Profile: A ${profile.industry} called ${profile.businessName}.
        Their brand voice is ${profile.brandVoice.tone}.
        
        Facts you already know:
        ${learnedFacts.map(f => `- ${f.text}`).join('\n')}
        
        Based on what you know, ask ONE new, non-redundant question to better understand the business.
        The question should be something you can use to generate better marketing content.
        Keep the question friendly and simple.

        Good Examples:
        - "What's a fun fact about your business I could use in a social media post?"
        - "Who is your main competitor and what makes you different?"
        - "What is your best-selling product or service right now?"
        - "Is there a specific product you'd like to promote more this month?"

        Return only the question as a single string. Do not add any surrounding text or quotes.
    `;
    try {
        const response = await this.ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating learning question:", error);
        return "What's a fun fact about your business I can use in a post?";
    }
  }

  public async submitAILearning(question: string, answer: string): Promise<string> {
      if (!this.isConfigured()) return "Thanks, I'll remember that!";

      const prompt = `
          You are the 'Memory' module of an AI marketing assistant. A user has just taught you something new about their business.
          Question you asked: "${question}"
          User's answer: "${answer}"
          
          Generate a short, positive, encouraging confirmation message (1-2 sentences) acknowledging that you've learned this new information.
          
          Example: "Got it! Thanks for sharing. I'll use this to create even better content for you."
          Example: "Great, I've stored that in my memory. This will help me be a better assistant."
          
          Return only the confirmation message as a single string.
      `;
      try {
          const response = await this.ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          return response.text.trim();
      } catch (error) {
          console.error("Error submitting AI learning:", error);
          return "Thanks! I've saved that information.";
      }
  }

  // =================================================================
  // Mock implementations for methods not yet migrated to Gemini
  // These can be replaced with real Gemini calls later.
  // =================================================================
  
  async generateProactiveTasks(customers: EnhancedCustomer[], specialDates: SpecialDate[], profile: BusinessProfile | null): Promise<ProactiveTask[]> {
    const atRiskCustomer = customers.find(c => c.aiAnalysis.churnRisk.level === 'high' && !c.timeline.some(t => new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && t.type === 'communication'));
    const upcomingBirthday = customers.find(c => c.personal.birthDate && new Date(c.personal.birthDate).getMonth() === new Date().getMonth() && new Date(c.personal.birthDate).getDate() > new Date().getDate());
    const upcomingSpecialDate = specialDates.find(d => new Date(d.date) > new Date() && new Date(d.date) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    
    const tasks: ProactiveTask[] = [];
    if (atRiskCustomer) {
      tasks.push({ id: 'task-1', type: 'customer_retention', description: `Engage with ${atRiskCustomer.personal.firstName}, who is at high risk of churning.`, actionText: 'Create Message', relatedId: atRiskCustomer.id, isCompleted: false });
    }
    if (upcomingBirthday) {
        tasks.push({ id: 'task-2', type: 'celebratory_message', description: `It's ${upcomingBirthday.personal.firstName}'s birthday soon!`, actionText: 'Create Greeting', relatedId: upcomingBirthday.id, isCompleted: false });
    }
    if (upcomingSpecialDate) {
      tasks.push({ id: 'task-3', type: 'content_opportunity', description: `Create content for the upcoming "${upcomingSpecialDate.name}".`, actionText: 'Create Post', relatedId: upcomingSpecialDate.name, isCompleted: false });
    }
    
    // Fallback task if none are generated
    if (tasks.length === 0 && customers.length > 0) {
       tasks.push({ id: 'task-fallback', type: 'customer_retention', description: `Review the profile of ${customers[0].personal.firstName} for new opportunities.`, actionText: 'View Customer', relatedId: customers[0].id, isCompleted: false });
    }
    
    return tasks;
  }

  async generatePersonalizedCommunication(customer: EnhancedCustomer, profile: BusinessProfile | null, customPrompt?: string): Promise<{ structure: Record<string, string> }> {
    const prompt = customPrompt || `Generate a short, friendly message for ${customer.personal.firstName}. The goal is re-engagement. Mention their loyalty as a ${customer.business.lifecycle} customer.`;
    return { structure: { body: `AI generated message for ${customer.personal.firstName} based on prompt: "${prompt}"` } };
  }
  
  async generateContentForSpecialDate(eventName: string, profile: BusinessProfile | null): Promise<{ structure: Record<string, string> }> {
    return { structure: { hook: `Celebrating ${eventName}!`, body: `Come join us for our special ${eventName} promotion.` } };
  }
  
  async generatePostText(prompt: string, tone: string, profile: BusinessProfile | null): Promise<Record<string, string>> {
    // This now returns a structured object based on a simple heuristic
    const lines = `AI generated content for prompt: "${prompt}" with tone: "${tone}".\n\nThis is the main body of the post.\n\nAnd this is the call to action!`;
    const parts = lines.split('\n\n');
    return {
        hook: parts[0] || '',
        body: parts[1] || '',
        cta: parts[2] || '',
    };
  }

  async generatePostImage(prompt: string, profile: BusinessProfile | null): Promise<string[]> {
    // Returns a mock image URL. In a real app, this would be a base64 string from Gemini.
    return [`https://picsum.photos/seed/${encodeURIComponent(prompt)}/512`];
  }
  
  async summarizeForImagePrompt(text: string): Promise<string> {
    return `A visually appealing image related to: "${text.substring(0, 100)}..."`;
  }
  
  async generateVideoIdeas(text: string, profile: BusinessProfile | null): Promise<VideoIdea[]> {
    return [
      { title: 'Quick Teaser', description: 'A fast-paced video showing snippets related to your post.' },
      { title: 'Explainer Video', description: 'A short video explaining the core concept of your text.' },
      { title: 'Customer Testimonial', description: 'A video featuring a customer talking about this topic.' },
    ];
  }
  
  async generateVideo(prompt: string, image?: { imageBytes: string; mimeType: string; }, audio?: string): Promise<VideoOperation> {
    console.log("Simulating video generation with prompt:", prompt, "image:", !!image, "audio:", audio);
    // This would be the initial call to start the video generation.
    // It returns an operation object that needs to be polled.
    await new Promise(res => setTimeout(res, 1000));
    return {
        name: `operations/video-${Date.now()}`,
        done: false
    };
  }

  async checkVideoOperationStatus(operation: VideoOperation): Promise<VideoOperation> {
      console.log("Polling video operation:", operation.name);
      // Simulate that the operation is done after a few polls
      const isDone = Math.random() > 0.5;
      if (isDone) {
          return {
              ...operation,
              done: true,
              response: {
                  generatedVideos: [{ video: { uri: `https://mock-video-server.com/video_${Date.now()}.mp4` } }]
              }
          }
      }
      return operation; // Still in progress
  }

  async generateWeatherSuggestion(weather: { condition: string; temp: number }, profile: BusinessProfile | null): Promise<string> {
    if (!profile) return "Check out today's marketing tip!";
    const prompt = `Given the weather is ${weather.condition} at ${weather.temp}°C for a ${profile.industry} business called ${profile.businessName}, provide a short, creative marketing suggestion.`;
    // In a real app, you'd call Gemini here. This is a mock response.
    if (weather.condition === 'sunny' && weather.temp > 25) {
        return `It's a hot day! Perfect for promoting your cold drinks or offering a "beat the heat" discount.`;
    }
    return `Today's weather is ${weather.condition}. A good day to connect with customers online.`;
  }

  async generateMarketingSuggestion(profile: BusinessProfile | null): Promise<string> {
    if (!profile) return "Define your business profile to get personalized suggestions.";
    return `For a ${profile.industry} like yours, focus on showcasing customer testimonials this week to build trust. Use a ${profile.brandVoice.tone} tone.`;
  }

}

// Fix: Export a singleton instance of the AIService.
export const aiService = new AIService();