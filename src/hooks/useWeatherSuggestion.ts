import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { useProfile } from '../store/profileContext';

// Mock weather data for demonstration purposes
const MOCK_WEATHER = {
  condition: 'sunny',
  temp: 28,
};

export const useWeatherSuggestion = () => {
  const { profile } = useProfile();
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSuggestion = useCallback(async () => {
    if (!profile) return; // Wait for profile to be loaded
    setIsLoading(true);
    try {
      // Add a small delay to stagger API calls on dashboard load and help avoid rate limits.
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await aiService.generateWeatherSuggestion(MOCK_WEATHER, profile);
      setSuggestion(result);
    } catch (err: any) {
      console.error(err);
      const errorMessage = (err.message || 'An unknown error occurred.').toLowerCase();
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        setSuggestion("AI is a bit busy! Weather tip is unavailable due to rate limits. Try again in a minute.");
      } else {
        setSuggestion("Could not load weather tip. Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchSuggestion();
    }
  }, [profile, fetchSuggestion]);

  return { suggestion, isLoading, weather: MOCK_WEATHER, refetch: fetchSuggestion };
};