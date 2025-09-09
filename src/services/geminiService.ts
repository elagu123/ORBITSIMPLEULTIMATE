// FIX: Corrected import path for types to point to the new single source of truth.
import { OldBusinessProfile, InitialMarketingPlan } from '../types/index';
import { GoogleGenAI } from '@google/genai';

class AIService {
    private ai: GoogleGenAI | null;

    constructor() {
        // In a real app, the key would be on a secure backend.
        // For this demo, we assume it might be available in env vars.
        if (process.env.API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            this.ai = null;
            console.warn("API_KEY for Gemini not found. Using mocked AI responses.");
        }
    }

    async generateInitialPlan(profile: OldBusinessProfile): Promise<InitialMarketingPlan> {
        // This is a mock implementation that simulates an AI call.
        // In a real scenario, you would send the 'profile' object to Gemini.
        console.log("Simulating AI plan generation with profile:", profile);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create mock data based on the profile
        const postIdeas = [
            {
                title: `Post de Bienvenida 🚀`,
                content: `¡Hola a todos! Somos ${profile.businessName} y estamos felices de estar aquí. Nuestro objetivo es resolver ${profile.customers.problem.toLowerCase()} con un estilo ${profile.tone.style}. ¡Síguenos para más!`,
            },
            {
                title: `Promo de ${profile.products.star}`,
                content: `¿Sabías que nuestro ${profile.products.star} es perfecto para ti? ¡Ven a probarlo! Es ideal para ${profile.customers.description.toLowerCase()}.`,
            },
            {
                title: `Historia del Negocio`,
                content: `Un poco sobre nosotros: ${profile.history || `somos un negocio familiar que ama lo que hace`}. ¡Gracias por ser parte de nuestra comunidad!`,
            }
        ];

        const nextSteps = [
            `Conecta tus redes sociales (${profile.marketing.socialMedia.join(', ') || 'Instagram, Facebook'}).`,
            "Sube fotos de tus productos, especialmente de tu producto estrella.",
            `Planifica tu primera campaña para lograr tu objetivo: ${profile.goals.shortTerm || 'aumentar las ventas'}.`
        ];

        return {
            postIdeas,
            nextSteps,
        };
    }
}

export const aiService = new AIService();