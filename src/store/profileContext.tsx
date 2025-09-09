import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile } from '../types/index';

interface ProfileContextType {
  profile: BusinessProfile | null;
  hasOnboarded: boolean;
  saveProfile: (profileData: BusinessProfile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultProfile: BusinessProfile = {
  businessName: 'My Local Business',
  industry: 'services',
  marketingGoals: {
    increaseSales: true,
    buildBrandAwareness: true,
    customerRetention: false,
    leadGeneration: false,
  },
  brandVoice: {
    tone: 'friendly',
    values: ['Quality', 'Community'],
  },
  aiStrategy: {
    brandVoiceSpectrums: {
        formalVsCasual: 0.3,
        seriousVsHumorous: 0.4,
        calmVsEnthusiastic: 0.6,
    },
    brandArchetype: 'everyman',
    keyTerminology: {
        wordsToUse: [],
        wordsToAvoid: [],
    },
    targetAudience: {
        description: 'Local residents aged 25-55 interested in quality products and community events.',
        painPoints: 'Finding high-quality, reliable local services; feeling disconnected from the community.'
    },
    seoGuidelines: {
        primaryKeywords: [],
        secondaryKeywords: [],
    }
  }
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('businessProfile');
      const storedOnboardedFlag = localStorage.getItem('hasOnboarded');

      if (storedProfile && storedOnboardedFlag === 'true') {
        const parsedProfile = JSON.parse(storedProfile);
        // Ensure aiStrategy exists for backward compatibility
        if (!parsedProfile.aiStrategy) {
            parsedProfile.aiStrategy = defaultProfile.aiStrategy;
        }
        setProfile(parsedProfile);
        setHasOnboarded(true);
      } else {
        // For demo purposes, we can set a default if nothing is stored
        // setProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      // localStorage.clear(); // Optional: clear corrupted storage
    }
    setIsLoading(false);
  }, []);

  const saveProfile = (profileData: BusinessProfile) => {
    try {
      // Ensure aiStrategy is present when saving
      const profileToSave = {
        ...profileData,
        aiStrategy: profileData.aiStrategy || defaultProfile.aiStrategy,
      };
      localStorage.setItem('businessProfile', JSON.stringify(profileToSave));
      localStorage.setItem('hasOnboarded', 'true');
      setProfile(profileToSave);
      setHasOnboarded(true);
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading Profile...</div>
        </div>
    );
  }

  return (
    <ProfileContext.Provider value={{ profile, hasOnboarded, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};