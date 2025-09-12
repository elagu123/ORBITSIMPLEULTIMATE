import React, { useState, useEffect } from 'react';
import { useProfile } from '../../../store/profileContext';
import { BusinessProfile, PartialBusinessProfile, Industry } from '../../../types/index';
import ProgressBar from './ProgressBar';
import Button from '../../ui/Button';
import { aiService } from '../../../services/aiService';
import { Sparkles, Building2, Target, Users, MapPin, ShoppingBag, TrendingUp } from '../../ui/Icons';

// Enhanced business profile with mandatory comprehensive information
interface EnhancedBusinessProfile extends BusinessProfile {
  // Core Business Information (MANDATORY)
  businessDetails: {
    legalName: string;
    brandName: string;
    description: string;
    yearEstablished: number;
    employeeCount: string;
    annualRevenue: string;
    businessModel: 'b2b' | 'b2c' | 'b2b2c';
    primaryLanguage: string;
    operatingCountries: string[];
  };

  // Industry-Specific Details (MANDATORY)
  industrySpecifics: {
    industrySegment: string;
    keyProducts: Array<{
      name: string;
      category: string;
      price: string;
      sku: string;
    }>;
    seasonality: {
      hasSeasonality: boolean;
      peakMonths: string[];
      lowMonths: string[];
    };
    compliance: {
      regulations: string[];
      certifications: string[];
    };
  };

  // Physical Presence (MANDATORY)
  locations: {
    headquarters: {
      address: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    physicalLocations: Array<{
      type: 'store' | 'warehouse' | 'office' | 'factory';
      address: string;
      city: string;
      state: string;
      isMain: boolean;
    }>;
    serviceAreas: string[];
    deliveryZones: string[];
  };

  // Digital Presence (MANDATORY)
  digitalPresence: {
    website: string;
    socialMediaProfiles: {
      facebook: { url: string; followers: number; isActive: boolean };
      instagram: { url: string; followers: number; isActive: boolean };
      twitter: { url: string; followers: number; isActive: boolean };
      linkedin: { url: string; followers: number; isActive: boolean };
      tiktok: { url: string; followers: number; isActive: boolean };
      youtube: { url: string; followers: number; isActive: boolean };
    };
    googleMyBusiness: {
      isVerified: boolean;
      averageRating: number;
      totalReviews: number;
      categories: string[];
    };
    onlineMarketplaces: Array<{
      platform: string;
      storeUrl: string;
      isActive: boolean;
    }>;
  };

  // Customer Analysis (MANDATORY)
  customerProfile: {
    primaryDemographics: {
      ageRange: string;
      gender: string;
      incomeLevel: string;
      education: string;
      location: string;
    };
    psychographics: {
      interests: string[];
      values: string[];
      lifestyle: string[];
      purchasingBehavior: string[];
    };
    painPoints: Array<{
      problem: string;
      severity: 'low' | 'medium' | 'high';
      frequency: 'rare' | 'occasional' | 'frequent';
    }>;
    customerJourney: {
      awareness: string[];
      consideration: string[];
      decision: string[];
      retention: string[];
    };
  };

  // Competition Analysis (MANDATORY)
  competitive: {
    directCompetitors: Array<{
      name: string;
      website: string;
      strengths: string[];
      weaknesses: string[];
      marketShare: string;
    }>;
    competitiveAdvantages: Array<{
      advantage: string;
      description: string;
      strength: 'weak' | 'moderate' | 'strong';
    }>;
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  };

  // Marketing Goals & KPIs (MANDATORY)
  detailedGoals: {
    primaryObjectives: Array<{
      objective: string;
      priority: 'high' | 'medium' | 'low';
      timeline: string;
      targetMetric: string;
      currentValue: string;
      targetValue: string;
    }>;
    kpis: Array<{
      metric: string;
      currentValue: number;
      targetValue: number;
      timeframe: string;
      importance: 'critical' | 'important' | 'nice-to-have';
    }>;
    budget: {
      monthlyMarketingBudget: number;
      digitalMarketingBudget: number;
      contentCreationBudget: number;
      paidAdvertisingBudget: number;
    };
  };

  // Brand Identity (MANDATORY)
  brandIdentity: {
    missionStatement: string;
    visionStatement: string;
    coreValues: string[];
    brandPersonality: string[];
    brandPromise: string;
    uniqueSellingProposition: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logoDescription: string;
    brandGuidelines: string;
  };
}

const EnhancedOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const { saveProfile } = useProfile();
  const [profileData, setProfileData] = useState<Partial<EnhancedBusinessProfile>>({
    industry: 'retail',
    businessDetails: {
      legalName: '',
      brandName: '',
      description: '',
      yearEstablished: new Date().getFullYear(),
      employeeCount: '1-10',
      annualRevenue: 'under-100k',
      businessModel: 'b2c',
      primaryLanguage: 'es',
      operatingCountries: ['México']
    }
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const totalSteps = 8; // Increased number of steps for comprehensive data collection

  const stepTitles = [
    'Bienvenida',
    'Información Básica del Negocio',
    'Detalles de Industria',
    'Presencia Física y Digital',
    'Análisis de Clientes',
    'Análisis Competitivo',
    'Objetivos y KPIs',
    'Identidad de Marca',
    'Análisis Final por IA'
  ];

  // Industry-specific templates for different business types
  const industryTemplates = {
    retail: {
      requiredFields: ['productCategories', 'averageTransactionValue', 'seasonality', 'storeLocations'],
      questions: [
        { field: 'productCategories', label: 'Categorías de productos principales', type: 'multiselect', required: true },
        { field: 'averageTransactionValue', label: 'Valor promedio de transacción', type: 'currency', required: true },
        { field: 'inventoryCount', label: 'Cantidad aproximada de SKUs', type: 'number', required: true },
        { field: 'seasonalProducts', label: '¿Productos estacionales?', type: 'boolean', required: true }
      ]
    },
    services: {
      requiredFields: ['serviceTypes', 'averageProjectValue', 'clientRetention'],
      questions: [
        { field: 'serviceTypes', label: 'Tipos de servicios ofrecidos', type: 'multiselect', required: true },
        { field: 'averageProjectValue', label: 'Valor promedio por proyecto', type: 'currency', required: true },
        { field: 'serviceDeliveryTime', label: 'Tiempo promedio de entrega', type: 'text', required: true },
        { field: 'recurringServices', label: '¿Servicios recurrentes?', type: 'boolean', required: true }
      ]
    },
    manufacturing: {
      requiredFields: ['productionCapacity', 'distributionChannels', 'qualityStandards'],
      questions: [
        { field: 'productionCapacity', label: 'Capacidad de producción mensual', type: 'number', required: true },
        { field: 'distributionChannels', label: 'Canales de distribución', type: 'multiselect', required: true },
        { field: 'qualityStandards', label: 'Estándares de calidad/certificaciones', type: 'multiselect', required: true },
        { field: 'leadTimes', label: 'Tiempos de producción promedio', type: 'text', required: true }
      ]
    },
    food: {
      requiredFields: ['menuItems', 'serviceType', 'healthCertifications', 'deliveryOptions'],
      questions: [
        { field: 'cuisineType', label: 'Tipo de cocina', type: 'select', required: true },
        { field: 'serviceType', label: 'Tipo de servicio', type: 'multiselect', required: true, options: ['Dine-in', 'Takeout', 'Delivery', 'Catering'] },
        { field: 'averageTicket', label: 'Ticket promedio por cliente', type: 'currency', required: true },
        { field: 'operatingHours', label: 'Horarios de operación', type: 'text', required: true }
      ]
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (step) {
      case 1: // Basic Business Information
        if (!profileData.businessDetails?.legalName?.trim()) {
          errors.push('El nombre legal del negocio es obligatorio');
        }
        if (!profileData.businessDetails?.brandName?.trim()) {
          errors.push('El nombre comercial es obligatorio');
        }
        if (!profileData.businessDetails?.description?.trim() || profileData.businessDetails.description.length < 50) {
          errors.push('La descripción del negocio debe tener al menos 50 caracteres');
        }
        break;
      
      case 2: // Industry Details
        if (!profileData.industrySpecifics?.keyProducts?.length) {
          errors.push('Debe agregar al menos 3 productos o servicios principales');
        }
        break;
      
      case 3: // Physical and Digital Presence
        if (!profileData.locations?.headquarters?.address) {
          errors.push('La dirección principal es obligatoria');
        }
        if (!profileData.digitalPresence?.website) {
          errors.push('El sitio web es obligatorio');
        }
        break;
      
      case 4: // Customer Analysis
        if (!profileData.customerProfile?.primaryDemographics?.ageRange) {
          errors.push('El rango de edad del cliente objetivo es obligatorio');
        }
        if (!profileData.customerProfile?.painPoints?.length) {
          errors.push('Debe identificar al menos 3 problemas que resuelve para sus clientes');
        }
        break;
      
      case 5: // Competitive Analysis
        if (!profileData.competitive?.directCompetitors?.length) {
          errors.push('Debe identificar al menos 3 competidores directos');
        }
        break;
      
      case 6: // Goals and KPIs
        if (!profileData.detailedGoals?.primaryObjectives?.length) {
          errors.push('Debe definir al menos 3 objetivos principales');
        }
        if (!profileData.detailedGoals?.budget?.monthlyMarketingBudget) {
          errors.push('El presupuesto mensual de marketing es obligatorio');
        }
        break;
      
      case 7: // Brand Identity
        if (!profileData.brandIdentity?.missionStatement?.trim()) {
          errors.push('La misión de la empresa es obligatoria');
        }
        if (!profileData.brandIdentity?.uniqueSellingProposition?.trim()) {
          errors.push('La propuesta única de valor es obligatoria');
        }
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(prev => Math.min(prev + 1, totalSteps - 1));
      setCurrentSubStep(0);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
    setCurrentSubStep(0);
  };

  const updateProfileData = (data: Partial<EnhancedBusinessProfile>) => {
    setProfileData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleAIAnalysis = async () => {
    setIsAiLoading(true);
    try {
      // Send comprehensive business data to AI for analysis and strategy generation
      const aiAnalysis = await aiService.generateComprehensiveStrategy(profileData as EnhancedBusinessProfile);
      
      // Update profile with AI-generated insights
      updateProfileData({
        aiStrategy: aiAnalysis.strategy,
        recommendations: aiAnalysis.recommendations,
        contentStrategy: aiAnalysis.contentStrategy,
        competitiveInsights: aiAnalysis.competitiveInsights
      });
      
      nextStep();
    } catch (error) {
      console.error('AI Analysis failed:', error);
      // Continue without AI analysis but notify user
      nextStep();
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WelcomeStepEnhanced onStart={() => nextStep()} />;
      case 1:
        return (
          <BusinessBasicsStep 
            data={profileData} 
            updateData={updateProfileData}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <IndustryDetailsStep 
            data={profileData} 
            updateData={updateProfileData}
            industryTemplate={industryTemplates[profileData.industry as keyof typeof industryTemplates]}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <PresenceStep 
            data={profileData} 
            updateData={updateProfileData}
            errors={validationErrors}
          />
        );
      case 4:
        return (
          <CustomerAnalysisStep 
            data={profileData} 
            updateData={updateProfileData}
            errors={validationErrors}
          />
        );
      case 5:
        return (
          <CompetitiveAnalysisStep 
            data={profileData} 
            updateData={updateProfileData}
            errors={validationErrors}
          />
        );
      case 6:
        return (
          <GoalsKPIsStep 
            data={profileData} 
            updateData={updateProfileData}
            errors={validationErrors}
          />
        );
      case 7:
        return (
          <BrandIdentityStep 
            data={profileData} 
            updateData={updateProfileData}
            errors={validationErrors}
          />
        );
      case 8:
        return (
          <AIAnalysisStep 
            data={profileData} 
            onAnalyze={handleAIAnalysis}
            isLoading={isAiLoading}
          />
        );
      default:
        return <WelcomeStepEnhanced onStart={() => nextStep()} />;
    }
  };

  const completionPercentage = Math.round((step / (totalSteps - 1)) * 100);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header with Progress */}
        <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuración Empresarial Completa
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {stepTitles[step]} - {completionPercentage}% completado
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{step + 1}</div>
              <div className="text-sm text-gray-500">de {totalSteps}</div>
            </div>
          </div>
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">Información requerida:</h3>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Footer with Navigation */}
        <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
          <Button 
            variant="secondary" 
            onClick={prevStep} 
            disabled={step === 0}
            className="flex items-center gap-2"
          >
            ← Anterior
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Información empresarial completa = Mejores resultados de IA
            </p>
          </div>

          {step === totalSteps - 1 ? (
            <Button 
              onClick={() => saveProfile(profileData as BusinessProfile)}
              className="flex items-center gap-2"
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  Finalizar Configuración
                  <Target className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              className="flex items-center gap-2"
              disabled={validationErrors.length > 0}
            >
              Siguiente →
            </Button>
          )}
        </div>
      </div>

      {/* AI Loading Overlay */}
      {isAiLoading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
          <div className="bg-white/10 rounded-xl p-8 text-center max-w-md">
            <Sparkles className="w-16 h-16 animate-pulse text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">IA Analizando su Negocio</h3>
            <p className="text-sm opacity-90 mb-4">
              Estamos procesando toda la información empresarial para crear estrategias 
              de marketing personalizadas y generar contenido adaptado a su industria...
            </p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Welcome Step Component
const WelcomeStepEnhanced: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
          <Building2 className="w-16 h-16 text-white" />
        </div>
      </div>
      
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Configuración Empresarial Completa
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Para crear contenido de marketing verdaderamente efectivo, necesitamos conocer 
          <strong> todo sobre su negocio</strong>. Esta información detallada permitirá 
          que nuestra IA genere estrategias y contenido perfectamente adaptados a su empresa.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 my-12">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Información Específica</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Detalles de productos, ubicaciones, competencia y objetivos específicos
          </p>
        </div>
        
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <Users className="w-8 h-8 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Análisis de Clientes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Demografía, comportamiento y problemas que resuelve su negocio
          </p>
        </div>
        
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Estrategia Personalizada</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            IA genera contenido y estrategias basadas en su información específica
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚡ ¿Por qué es obligatorio?
        </h3>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          Sin información específica de su negocio, la IA solo puede generar contenido genérico. 
          Con datos completos, creamos estrategias que realmente funcionen para SU industria y audiencia.
        </p>
      </div>

      <div className="pt-8">
        <Button onClick={onStart} size="lg" className="px-12 py-4 text-lg">
          Comenzar Configuración Completa
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          ⏱️ Tiempo estimado: 15-20 minutos para resultados óptimos
        </p>
      </div>
    </div>
  );
};

export default EnhancedOnboardingWizard;