export interface EnhancedBusinessProfile {
  businessName: string;
  industry: 'restaurant' | 'retail' | 'services' | 'healthcare' | 'education' | 'technology' | 'real_estate' | 'fitness' | 'beauty' | 'other';
  email?: string;
  phone?: string;
  website?: string;
  targetAudience?: string;
  goals?: string[];
  currentChallenges?: string[];
  description?: string;
  location?: string;
  established?: string;
}

export interface BusinessDetails {
  profile: EnhancedBusinessProfile;
  owner: {
    name: string;
    role: string;
    experience: string;
  };
  marketing: {
    currentChannels: string[];
    budget: string;
    mainObjective: string;
  };
}