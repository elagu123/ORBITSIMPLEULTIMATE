import { EnhancedBusinessProfile } from '../types/business';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number;
}

export interface StepValidation {
  [key: string]: {
    required: boolean;
    validator?: (value: any) => boolean;
    message: string;
  };
}

// Industry-specific required fields
export const industryRequiredFields: Record<string, string[]> = {
  retail: [
    'industrySpecifics.productCategories',
    'industrySpecifics.averageTransactionValue',
    'industrySpecifics.seasonality',
    'locations.physicalLocations'
  ],
  food: [
    'industrySpecifics.serviceTypes',
    'industrySpecifics.healthCertifications',
    'locations.deliveryZones',
    'digitalPresence.googleMyBusiness'
  ],
  services: [
    'industrySpecifics.serviceOfferings',
    'industrySpecifics.averageProjectValue',
    'industrySpecifics.clientRetention',
    'customerProfile.primaryDemographics'
  ],
  manufacturing: [
    'industrySpecifics.productionCapacity',
    'industrySpecifics.qualityCertifications',
    'industrySpecifics.supplyChain',
    'locations.productionFacilities'
  ],
  technology: [
    'industrySpecifics.techStack',
    'industrySpecifics.deploymentModel',
    'industrySpecifics.securityCompliance',
    'competitive.technicalAdvantages'
  ]
};

// Step validation schemas
export const stepValidations: Record<string, StepValidation> = {
  businessBasics: {
    'businessDetails.legalName': {
      required: true,
      validator: (value: string) => value && value.length >= 2,
      message: 'El nombre legal de la empresa es obligatorio (mínimo 2 caracteres)'
    },
    'businessDetails.brandName': {
      required: true,
      validator: (value: string) => value && value.length >= 2,
      message: 'El nombre comercial es obligatorio (mínimo 2 caracteres)'
    },
    'businessDetails.description': {
      required: true,
      validator: (value: string) => value && value.length >= 50,
      message: 'La descripción del negocio es obligatoria (mínimo 50 caracteres)'
    },
    'industry': {
      required: true,
      validator: (value: string) => value && value.length > 0,
      message: 'Debe seleccionar una industria'
    },
    'businessDetails.businessModel': {
      required: true,
      validator: (value: string) => ['b2c', 'b2b', 'b2b2c'].includes(value),
      message: 'Debe seleccionar un modelo de negocio válido'
    },
    'businessDetails.employeeCount': {
      required: true,
      validator: (value: string) => value && value.length > 0,
      message: 'Debe indicar el número de empleados'
    },
    'businessDetails.annualRevenue': {
      required: true,
      validator: (value: string) => value && value.length > 0,
      message: 'Debe indicar el rango de ingresos anuales'
    }
  },
  industryDetails: {
    'industrySpecifics.industrySegment': {
      required: true,
      validator: (value: string) => value && value.length > 0,
      message: 'Debe especificar el segmento de industria'
    },
    'industrySpecifics.keyProducts': {
      required: true,
      validator: (value: any[]) => value && value.length > 0,
      message: 'Debe agregar al menos un producto o servicio'
    }
  },
  presence: {
    'locations.headquarters': {
      required: true,
      validator: (value: any) => value && value.address && value.address.length > 10,
      message: 'La dirección de la sede principal es obligatoria'
    },
    'digitalPresence.website': {
      required: true,
      validator: (value: string) => {
        if (!value) return false;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Debe proporcionar una URL de sitio web válida'
    }
  },
  customerAnalysis: {
    'customerProfile.primaryDemographics': {
      required: true,
      validator: (value: any) => value && Object.keys(value).length > 0,
      message: 'Debe definir la demografía principal de sus clientes'
    },
    'customerProfile.painPoints': {
      required: true,
      validator: (value: any[]) => value && value.length >= 2,
      message: 'Debe identificar al menos 2 puntos de dolor de sus clientes'
    }
  },
  competitive: {
    'competitive.directCompetitors': {
      required: true,
      validator: (value: any[]) => value && value.length >= 2,
      message: 'Debe identificar al menos 2 competidores directos'
    },
    'competitive.competitiveAdvantages': {
      required: true,
      validator: (value: any[]) => value && value.length >= 2,
      message: 'Debe definir al menos 2 ventajas competitivas'
    }
  },
  goals: {
    'detailedGoals.primaryObjectives': {
      required: true,
      validator: (value: any[]) => value && value.length >= 2,
      message: 'Debe definir al menos 2 objetivos principales'
    },
    'detailedGoals.kpis': {
      required: true,
      validator: (value: any[]) => value && value.length >= 3,
      message: 'Debe definir al menos 3 KPIs para medir el éxito'
    }
  },
  brandIdentity: {
    'brandIdentity.missionStatement': {
      required: true,
      validator: (value: string) => value && value.length >= 20,
      message: 'La declaración de misión es obligatoria (mínimo 20 caracteres)'
    },
    'brandIdentity.uniqueSellingProposition': {
      required: true,
      validator: (value: string) => value && value.length >= 15,
      message: 'La propuesta de valor única es obligatoria (mínimo 15 caracteres)'
    }
  }
};

// Get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Validate a specific step
export function validateStep(
  step: string, 
  data: Partial<EnhancedBusinessProfile>
): ValidationResult {
  const validation = stepValidations[step];
  if (!validation) {
    return { isValid: true, errors: [], warnings: [], completeness: 100 };
  }

  const errors: string[] = [];
  let totalFields = 0;
  let validFields = 0;

  // Check basic validations
  Object.entries(validation).forEach(([fieldPath, rules]) => {
    totalFields++;
    const value = getNestedValue(data, fieldPath);
    
    if (rules.required) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors.push(rules.message);
      } else if (rules.validator && !rules.validator(value)) {
        errors.push(rules.message);
      } else {
        validFields++;
      }
    }
  });

  // Add industry-specific validations
  if (data.industry && industryRequiredFields[data.industry]) {
    const industryFields = industryRequiredFields[data.industry];
    industryFields.forEach(fieldPath => {
      totalFields++;
      const value = getNestedValue(data, fieldPath);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors.push(`Campo específico de ${data.industry} requerido: ${fieldPath}`);
      } else {
        validFields++;
      }
    });
  }

  const completeness = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0;

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    completeness
  };
}

// Validate entire business profile
export function validateBusinessProfile(data: Partial<EnhancedBusinessProfile>): ValidationResult {
  const steps = ['businessBasics', 'industryDetails', 'presence', 'customerAnalysis', 'competitive', 'goals', 'brandIdentity'];
  
  let allErrors: string[] = [];
  let allWarnings: string[] = [];
  let totalCompleteness = 0;

  steps.forEach(step => {
    const result = validateStep(step, data);
    allErrors = [...allErrors, ...result.errors];
    allWarnings = [...allWarnings, ...result.warnings];
    totalCompleteness += result.completeness;
  });

  const avgCompleteness = Math.round(totalCompleteness / steps.length);

  // Add warnings for low completeness
  if (avgCompleteness < 70) {
    allWarnings.push('El perfil empresarial necesita más información para generar resultados óptimos de IA');
  }

  if (avgCompleteness < 50) {
    allWarnings.push('Información crítica faltante. Los resultados de IA serán limitados');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    completeness: avgCompleteness
  };
}

// Calculate step completion percentage
export function calculateStepCompletion(
  step: string, 
  data: Partial<EnhancedBusinessProfile>
): number {
  const result = validateStep(step, data);
  return result.completeness;
}

// Check if user can proceed to next step
export function canProceedToNextStep(
  currentStep: string, 
  data: Partial<EnhancedBusinessProfile>,
  minCompleteness: number = 80
): boolean {
  const result = validateStep(currentStep, data);
  return result.isValid && result.completeness >= minCompleteness;
}

// Get required fields for a step
export function getRequiredFieldsForStep(step: string, industry?: string): string[] {
  const validation = stepValidations[step];
  const basicFields = validation ? Object.keys(validation) : [];
  
  if (industry && industryRequiredFields[industry]) {
    return [...basicFields, ...industryRequiredFields[industry]];
  }
  
  return basicFields;
}

// Generate validation summary for UI
export function generateValidationSummary(data: Partial<EnhancedBusinessProfile>) {
  const steps = [
    { key: 'businessBasics', name: 'Información Básica' },
    { key: 'industryDetails', name: 'Detalles de Industria' },
    { key: 'presence', name: 'Presencia Digital/Física' },
    { key: 'customerAnalysis', name: 'Análisis de Clientes' },
    { key: 'competitive', name: 'Análisis Competitivo' },
    { key: 'goals', name: 'Objetivos y KPIs' },
    { key: 'brandIdentity', name: 'Identidad de Marca' }
  ];

  return steps.map(step => {
    const result = validateStep(step.key, data);
    return {
      step: step.key,
      name: step.name,
      completeness: result.completeness,
      isValid: result.isValid,
      errors: result.errors,
      canProceed: result.completeness >= 80
    };
  });
}