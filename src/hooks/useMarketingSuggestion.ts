import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { useProfile } from '../store/profileContext';

export const useMarketingSuggestion = () => {
  const { profile } = useProfile();
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass the profile to the service
      const result = await aiService.generateMarketingSuggestion(profile);
      setSuggestion(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setSuggestion("Could not load AI suggestion. Please ensure your Gemini API key is configured correctly.");
    } finally {
      setIsLoading(false);
    }
  }, [profile]); // Rerun when profile changes

  useEffect(() => {
    if (process.env.API_KEY) {
      fetchSuggestion();
    } else {
      setSuggestion("AI suggestions are disabled. Please provide a Gemini API key to enable this feature.");
      setIsLoading(false);
      setError("API key is missing.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]); // Refetch when the profile is loaded/updated

  return { suggestion, isLoading, error, refetch: fetchSuggestion };
};
