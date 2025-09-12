import React, { useState, useEffect } from 'react';
import { Sparkles, Target, Users, TrendingUp, CheckCircle, AlertCircle } from '../../ui/Icons';
import Button from '../../../ui/Button';

interface AIAnalysisStepProps {
  data: any;
  onAnalyze: () => void;
  isLoading: boolean;
}

const AIAnalysisStep: React.FC<AIAnalysisStepProps> = ({ data, onAnalyze, isLoading }) => {
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Calculate completeness score
  const calculateCompletenessScore = () => {
    let totalFields = 0;
    let completedFields = 0;

    // Business basics
    totalFields += 8;
    if (data.businessDetails?.legalName) completedFields++;
    if (data.businessDetails?.brandName) completedFields++;
    if (data.businessDetails?.description?.length > 50) completedFields++;
    if (data.businessDetails?.yearEstablished) completedFields++;
    if (data.businessDetails?.employeeCount) completedFields++;
    if (data.businessDetails?.annualRevenue) completedFields++;
    if (data.businessDetails?.businessModel) completedFields++;
    if (data.businessDetails?.primaryLanguage) completedFields++;

    // Industry specifics
    totalFields += 3;
    if (data.industrySpecifics?.keyProducts?.length >= 3) completedFields++;
    if (data.industrySpecifics?.seasonality) completedFields++;
    if (data.industrySpecifics?.compliance) completedFields++;

    // Physical presence
    totalFields += 3;
    if (data.locations?.headquarters?.address) completedFields++;
    if (data.digitalPresence?.website) completedFields++;
    if (data.digitalPresence?.socialMediaProfiles) completedFields++;

    // Customer analysis
    totalFields += 3;
    if (data.customerProfile?.primaryDemographics?.ageRange) completedFields++;
    if (data.customerProfile?.painPoints?.length >= 3) completedFields++;
    if (data.customerProfile?.psychographics?.interests?.length > 0) completedFields++;

    // Competition
    totalFields += 2;
    if (data.competitive?.directCompetitors?.length >= 3) completedFields++;
    if (data.competitive?.competitiveAdvantages?.length > 0) completedFields++;

    // Goals
    totalFields += 2;
    if (data.detailedGoals?.primaryObjectives?.length >= 3) completedFields++;
    if (data.detailedGoals?.budget?.monthlyMarketingBudget) completedFields++;

    // Brand identity
    totalFields += 3;
    if (data.brandIdentity?.missionStatement) completedFields++;
    if (data.brandIdentity?.uniqueSellingProposition) completedFields++;
    if (data.brandIdentity?.coreValues?.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const completenessScore = calculateCompletenessScore();

  // Mock analysis results (in real app, this would come from AI service)
  const getMockAnalysisResults = () => ({
    overallScore: completenessScore,
    insights: {
      strengths: [
        'Strong brand identity foundation',
        'Clear target audience definition',
        'Comprehensive competitive analysis',
        'Well-defined business goals'
      ],
      opportunities: [
        'Expand social media presence',
        'Develop content calendar strategy',
        'Implement customer journey optimization',
        'Enhance local SEO approach'
      ],
      recommendations: [
        'Focus on Instagram and Facebook for your demographic',
        'Create seasonal content aligned with business peaks',
        'Develop customer testimonial campaigns',
        'Implement location-based marketing strategies'
      ]
    },
    contentStrategy: {
      primaryPillars: [
        'Product Education',
        'Customer Success Stories',
        'Behind the Scenes',
        'Industry Expertise',
        'Community Building'
      ],
      recommendedFrequency: {
        facebook: '5-7 posts per week',
        instagram: '1-2 posts daily',
        twitter: '3-5 tweets daily',
        linkedin: '3-4 posts per week'
      },
      optimalPostingTimes: {
        facebook: '1:00 PM - 3:00 PM',
        instagram: '11:00 AM - 1:00 PM',
        twitter: '12:00 PM - 3:00 PM',
        linkedin: '8:00 AM - 10:00 AM'
      }
    },
    predictedOutcomes: {
      engagementIncrease: '+40-60%',
      leadGeneration: '+25-35%',
      brandAwareness: '+50-70%',
      customerRetention: '+15-25%'
    }
  });

  useEffect(() => {
    if (!isLoading && analysisComplete) {
      // Simulate getting results
      setAnalysisResults(getMockAnalysisResults());
    }
  }, [isLoading, analysisComplete]);

  const handleStartAnalysis = async () => {
    setAnalysisComplete(false);
    await onAnalyze();
    setAnalysisComplete(true);
  };

  if (isLoading) {
    return (
      <div className="text-center space-y-8">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Sparkles className="w-24 h-24 text-blue-500 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            IA Analizando su Negocio...
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Procesando {completenessScore}% de información empresarial completa
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm font-medium">Analizando perfil de clientes...</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm font-medium">Generando estrategia de contenido...</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm font-medium">Creando calendario de contenido...</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{width: '55%'}}></div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⏱️ El análisis puede tardar 30-60 segundos dependiendo de la cantidad de información proporcionada
          </p>
        </div>
      </div>
    );
  }

  if (analysisComplete && analysisResults) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Análisis de IA Completado
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Hemos procesado toda su información empresarial para crear una estrategia personalizada
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Puntuación de Completitud Empresarial
          </h3>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysisResults.overallScore / 100)}`}
                className="text-green-600"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analysisResults.overallScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completo</div>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {analysisResults.overallScore >= 90 ? 'Excelente' : 
             analysisResults.overallScore >= 75 ? 'Muy bueno' :
             analysisResults.overallScore >= 60 ? 'Bueno' : 'Necesita mejoras'}
          </p>
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Fortalezas Identificadas
            </h3>
            <ul className="space-y-2">
              {analysisResults.insights.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
              <Target className="w-5 h-5 mr-2" />
              Oportunidades
            </h3>
            <ul className="space-y-2">
              {analysisResults.insights.opportunities.map((opportunity: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
              <Sparkles className="w-5 h-5 mr-2" />
              Recomendaciones IA
            </h3>
            <ul className="space-y-2">
              {analysisResults.insights.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Strategy Preview */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
            Estrategia de Contenido Generada
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4">Pilares de Contenido Principales</h4>
              <div className="space-y-2">
                {analysisResults.contentStrategy.primaryPillars.map((pillar: string, index: number) => (
                  <div key={index} className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{pillar}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Frecuencia Recomendada por Plataforma</h4>
              <div className="space-y-3">
                {Object.entries(analysisResults.contentStrategy.recommendedFrequency).map(([platform, frequency]) => (
                  <div key={platform} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <span className="font-medium capitalize">{platform}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{frequency as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Predicted Outcomes */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-center text-purple-900 dark:text-purple-100">
            Resultados Esperados con Esta Estrategia
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(analysisResults.predictedOutcomes).map(([metric, value]) => (
              <div key={metric} className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{value as string}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">🚀 Próximos Pasos</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Implementación Inmediata:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Configurar perfiles de redes sociales faltantes</li>
                <li>• Crear calendario de contenido mensual</li>
                <li>• Desarrollar plantillas de contenido</li>
                <li>• Establecer métricas de seguimiento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Desarrollo a Mediano Plazo:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Implementar automatizaciones</li>
                <li>• Desarrollar campañas estacionales</li>
                <li>• Optimizar basado en métricas</li>
                <li>• Expandir a nuevas plataformas</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ ¡Análisis de IA Completado!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Su perfil empresarial está configurado y optimizado. La IA ahora puede generar 
              contenido específicamente adaptado a su negocio, industria y audiencia objetivo.
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              <strong>Resultados esperados:</strong> Contenido 300% más relevante y efectivo
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - ready to analyze
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Análisis Final de IA
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          La IA procesará toda su información empresarial para crear una estrategia personalizada
        </p>
      </div>

      {/* Information Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
          📊 Resumen de Información Recopilada
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Información Básica del Negocio</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.businessDetails?.brandName && data.businessDetails?.description 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.businessDetails?.brandName && data.businessDetails?.description ? 'Completo' : 'Parcial'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Detalles de Industria</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.industrySpecifics?.keyProducts?.length >= 3
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.industrySpecifics?.keyProducts?.length >= 3 ? 'Completo' : 'Parcial'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Presencia Digital</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.digitalPresence?.website 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.digitalPresence?.website ? 'Completo' : 'Parcial'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Análisis de Clientes</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.customerProfile?.primaryDemographics?.ageRange && data.customerProfile?.painPoints?.length >= 2
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.customerProfile?.primaryDemographics?.ageRange && data.customerProfile?.painPoints?.length >= 2 ? 'Completo' : 'Parcial'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Análisis Competitivo</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.competitive?.directCompetitors?.length >= 2
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.competitive?.directCompetitors?.length >= 2 ? 'Completo' : 'Parcial'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Objetivos y KPIs</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.detailedGoals?.primaryObjectives?.length >= 2
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.detailedGoals?.primaryObjectives?.length >= 2 ? 'Completo' : 'Parcial'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Identidad de Marca</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.brandIdentity?.missionStatement && data.brandIdentity?.uniqueSellingProposition
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.brandIdentity?.missionStatement && data.brandIdentity?.uniqueSellingProposition ? 'Completo' : 'Parcial'}
              </span>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/20 rounded-lg">
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {completenessScore}% Completitud Total
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {completenessScore >= 80 ? 'Excelente para análisis óptimo' : 
                 completenessScore >= 60 ? 'Suficiente para buen análisis' : 
                 'Se recomienda completar más información'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What the AI will analyze */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">🤖 Lo que la IA Analizará</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              Estrategia de Marketing
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Pilares de contenido específicos para su industria</li>
              <li>• Calendario de contenido adaptado a estacionalidad</li>
              <li>• Estrategia de redes sociales por plataforma</li>
              <li>• Mensajes clave para su audiencia objetivo</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Optimización de Audiencia
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Segmentación detallada de clientes</li>
              <li>• Mapeo de customer journey</li>
              <li>• Identificación de pain points específicos</li>
              <li>• Estrategias de engagement personalizadas</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
              Ventaja Competitiva
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Análisis de diferenciación vs competencia</li>
              <li>• Posicionamiento único en el mercado</li>
              <li>• Estrategias para destacar ventajas</li>
              <li>• Oportunidades de mercado no explotadas</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-orange-600" />
              Personalización IA
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Tono de voz específico para su marca</li>
              <li>• Templates adaptados a su industria</li>
              <li>• Hashtags y keywords relevantes</li>
              <li>• Horarios óptimos de publicación</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completeness Warning */}
      {completenessScore < 60 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Recomendación: Completar más información
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                Su perfil está {completenessScore}% completo. Para obtener los mejores resultados de IA, 
                recomendamos completar al menos 75% de la información empresarial.
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Puede proceder ahora</strong> y completar la información restante más tarde, 
                pero el análisis será más genérico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleStartAnalysis}
          size="lg"
          className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="w-6 h-6 mr-2" />
          Iniciar Análisis Completo de IA
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          ⏱️ El análisis tomará 30-60 segundos • Se ejecuta una sola vez • Resultados permanentes
        </p>
      </div>
    </div>
  );
};

export default AIAnalysisStep;