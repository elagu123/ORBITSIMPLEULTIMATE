/**
 * MIGRATION TO SECURE AI SERVICE
 * 
 * This file has been updated to use the secure AI service that routes through our backend.
 * The old implementation that exposed API keys to the client has been replaced.
 * 
 * SECURITY: ✅ API keys are now handled server-side only
 * COMPATIBILITY: ✅ All existing imports continue to work
 */

import { aiServiceSecure } from "./aiServiceSecure";

// Re-export the secure service as the default aiService
// This maintains backward compatibility while using the secure implementation
export const aiService = aiServiceSecure;

// For any code that directly imports the class
export { aiServiceSecure as AIService } from "./aiServiceSecure";