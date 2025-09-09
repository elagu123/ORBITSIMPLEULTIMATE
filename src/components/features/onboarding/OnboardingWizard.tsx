import React, { useState } from 'react';
import { useProfile } from '../../../store/profileContext';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile, PartialBusinessProfile } from '../../../types/index';
import ProgressBar from './ProgressBar';
import WelcomeStep from './steps/WelcomeStep';
import FinalStep from './steps/FinalStep';
import MagicSetupStep from './steps/MagicSetupStep';
import ValidationStep from './steps/ValidationStep';
import Button from '../../ui/Button';
import { aiService } from '../../../services/aiService';
import { Sparkles } from '../../ui/Icons';

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const { saveProfile } = useProfile();
  const [profileData, setProfileData] = useState<PartialBusinessProfile>({
    businessName: '',
    industry: 'services',
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const totalSteps = 4;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const updateProfileData = (data: Partial<BusinessProfile>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const handleMagicSetup = async () => {
    if (!profileData.businessName || !profileData.industry) {
        alert("Please provide a business name and industry.");
        return;
    }
    setIsAiLoading(true);
    setAiError('');
    try {
        const fullProfile = await aiService.runMagicOnboarding(profileData.businessName, profileData.industry);
        setProfileData(fullProfile);
        nextStep();
    } catch (error) {
        console.error("Magic Onboarding failed", error);
        const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
        const friendlyError = errorMessage.includes('429') || errorMessage.includes('quota')
            ? "The AI is a bit busy (rate limit hit)! We couldn't auto-generate a full profile. Please review the pre-filled details and complete the rest manually."
            : "Sorry, the AI couldn't generate a profile. Please fill in the details manually in the next step.";
        setAiError(friendlyError);

        // Create a default profile structure so the validation step doesn't break
        const defaultAiStrategy: BusinessProfile['aiStrategy'] = {
            brandVoiceSpectrums: { formalVsCasual: 0.3, seriousVsHumorous: 0.4, calmVsEnthusiastic: 0.6 },
            brandArchetype: 'everyman',
            keyTerminology: { wordsToUse: [], wordsToAvoid: [] },
            targetAudience: { description: '', painPoints: '' },
            seoGuidelines: { primaryKeywords: [], secondaryKeywords: [] }
        };

        setProfileData(prev => ({
            ...prev,
            marketingGoals: { increaseSales: true, buildBrandAwareness: true, customerRetention: false, leadGeneration: false },
            brandVoice: { tone: 'friendly', values: ['Quality', 'Community'] },
            aiStrategy: defaultAiStrategy,
        }));
        nextStep(); // Go to validation step even on error, with a partially filled profile
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleFinish = () => {
    saveProfile(profileData as BusinessProfile);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <MagicSetupStep data={profileData} updateData={updateProfileData} onStart={handleMagicSetup} />;
      case 2:
        return <ValidationStep data={profileData} updateData={setProfileData} error={aiError} />;
      case 3:
        return <FinalStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
     <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex flex-col justify-center items-center p-4">
      
      {isAiLoading && (
        <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center text-white">
          <Sparkles className="w-16 h-16 animate-pulse text-primary-400" />
          <p className="mt-4 text-xl font-semibold">AI is building your profile...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-fade-in">
        <div className="p-6 border-b dark:border-gray-700">
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
        </div>
        
        <div className="p-8 flex-grow overflow-y-auto max-h-[75vh]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between p-6 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
          <Button variant="secondary" onClick={prevStep} disabled={step === 0}>
            Back
          </Button>
          {step === 1 ? (
             <Button onClick={handleMagicSetup} disabled={!profileData.businessName || !profileData.industry}>
              Next
            </Button>
          ) : step < totalSteps - 1 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleFinish}>
              Finish Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;