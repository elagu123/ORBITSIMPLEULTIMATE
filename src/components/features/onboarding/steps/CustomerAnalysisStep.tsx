import React, { useState } from 'react';
import { Users, Target, TrendingUp, MapPin, Heart, DollarSign, Clock, UserCheck } from '../../ui/Icons';

interface CustomerAnalysisStepProps {
  data: any;
  updateData: (data: any) => void;
  errors: string[];
}

const CustomerAnalysisStep: React.FC<CustomerAnalysisStepProps> = ({ data, updateData, errors }) => {
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newJourneyStage, setNewJourneyStage] = useState('');

  const handleInputChange = (field: string, value: any, nested?: string) => {
    if (nested) {
      updateData({
        ...data,
        [nested]: {
          ...data[nested],
          [field]: value
        }
      });
    } else {
      updateData({
        ...data,
        [field]: value
      });
    }
  };

  const handleDemographicChange = (category: string, field: string, value: any) => {
    const demographics = data.customerProfile?.primaryDemographics || {};
    updateData({
      ...data,
      customerProfile: {
        ...data.customerProfile,
        primaryDemographics: {
          ...demographics,
          [category]: {
            ...demographics[category],
            [field]: value
          }
        }
      }
    });
  };

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      const painPoints = data.customerProfile?.painPoints || [];
      handleInputChange('painPoints', [...painPoints, newPainPoint.trim()], 'customerProfile');
      setNewPainPoint('');
    }
  };

  const removePainPoint = (index: number) => {
    const painPoints = data.customerProfile?.painPoints || [];
    handleInputChange('painPoints', painPoints.filter((_, i) => i !== index), 'customerProfile');
  };

  const addJourneyStage = () => {
    if (newJourneyStage.trim()) {
      const journey = data.customerProfile?.customerJourney || [];
      handleInputChange('customerJourney', [...journey, { stage: newJourneyStage.trim(), touchpoints: [], painPoints: [] }], 'customerProfile');
      setNewJourneyStage('');
    }
  };

  const removeJourneyStage = (index: number) => {
    const journey = data.customerProfile?.customerJourney || [];
    handleInputChange('customerJourney', journey.filter((_, i) => i !== index), 'customerProfile');
  };

  const ageRanges = [
    '18-24 años',
    '25-34 años',
    '35-44 años',
    '45-54 años',
    '55-64 años',
    '65+ años'
  ];

  const incomeRanges = [
    'Menos de $20,000',
    '$20,000 - $40,000',
    '$40,000 - $60,000',
    '$60,000 - $80,000',
    '$80,000 - $100,000',
    'Más de $100,000'
  ];

  const educationLevels = [
    'Educación básica',
    'Educación media',
    'Educación técnica',
    'Universidad',
    'Posgrado'
  ];

  const psychographicTraits = [
    'Orientado al precio',
    'Orientado a la calidad',
    'Innovadores tempranos',
    'Seguridores de tendencias',
    'Conservadores',
    'Impulsivos',
    'Planificadores',
    'Conscientes de la marca',
    'Ecológicos',
    'Tecnológicos'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Análisis Profundo de Clientes
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Definamos a su cliente ideal para crear estrategias súper personalizadas
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Demographics Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Demografía Principal *
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rango de Edad Principal *
                </label>
                <select
                  value={data.customerProfile?.primaryDemographics?.age?.primary || ''}
                  onChange={(e) => handleDemographicChange('age', 'primary', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione rango de edad</option>
                  {ageRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Género (distribución aproximada)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="% Mujeres"
                    min="0"
                    max="100"
                    value={data.customerProfile?.primaryDemographics?.gender?.female || ''}
                    onChange={(e) => handleDemographicChange('gender', 'female', parseInt(e.target.value) || 0)}
                    className="p-2 border rounded focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="% Hombres"
                    min="0"
                    max="100"
                    value={data.customerProfile?.primaryDemographics?.gender?.male || ''}
                    onChange={(e) => handleDemographicChange('gender', 'male', parseInt(e.target.value) || 0)}
                    className="p-2 border rounded focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="% Otros"
                    min="0"
                    max="100"
                    value={data.customerProfile?.primaryDemographics?.gender?.other || ''}
                    onChange={(e) => handleDemographicChange('gender', 'other', parseInt(e.target.value) || 0)}
                    className="p-2 border rounded focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Rango de Ingresos Principal *
                </label>
                <select
                  value={data.customerProfile?.primaryDemographics?.income?.primary || ''}
                  onChange={(e) => handleDemographicChange('income', 'primary', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione rango de ingresos</option>
                  {incomeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nivel Educativo Predominante
                </label>
                <select
                  value={data.customerProfile?.primaryDemographics?.education?.primary || ''}
                  onChange={(e) => handleDemographicChange('education', 'primary', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione nivel educativo</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ubicación Geográfica Principal
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="País principal"
                    value={data.customerProfile?.primaryDemographics?.location?.country || ''}
                    onChange={(e) => handleDemographicChange('location', 'country', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    placeholder="Estados/regiones principales (separar por comas)"
                    value={data.customerProfile?.primaryDemographics?.location?.regions?.join(', ') || ''}
                    onChange={(e) => handleDemographicChange('location', 'regions', e.target.value.split(',').map(r => r.trim()))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Psychographics */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-green-600" />
              Perfil Psicográfico
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Características Principales (seleccione hasta 5) *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {psychographicTraits.map(trait => (
                    <label key={trait} className="flex items-center p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.customerProfile?.psychographics?.traits?.includes(trait) || false}
                        onChange={(e) => {
                          const currentTraits = data.customerProfile?.psychographics?.traits || [];
                          const newTraits = e.target.checked
                            ? [...currentTraits, trait]
                            : currentTraits.filter(t => t !== trait);
                          handleInputChange('psychographics', { ...data.customerProfile?.psychographics, traits: newTraits }, 'customerProfile');
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{trait}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Valores y Motivaciones *
                </label>
                <textarea
                  value={data.customerProfile?.psychographics?.values || ''}
                  onChange={(e) => handleInputChange('psychographics', { ...data.customerProfile?.psychographics, values: e.target.value }, 'customerProfile')}
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="¿Qué valoran más sus clientes? ¿Qué los motiva a comprar? (Ej: calidad, precio, estatus, comodidad, etc.)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pain Points and Journey */}
        <div className="space-y-6">
          {/* Pain Points */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
              Puntos de Dolor del Cliente *
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPainPoint}
                  onChange={(e) => setNewPainPoint(e.target.value)}
                  placeholder="¿Qué problema o frustración tienen sus clientes?"
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
                />
                <button
                  onClick={addPainPoint}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(data.customerProfile?.painPoints || []).map((painPoint, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <span className="flex-1">{painPoint}</span>
                    <button
                      onClick={() => removePainPoint(index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                Mínimo 2 puntos de dolor requeridos. Ejemplos: "Demoras en entrega", "Precios altos", "Falta de personalización"
              </p>
            </div>
          </div>

          {/* Customer Journey */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Jornada del Cliente
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newJourneyStage}
                  onChange={(e) => setNewJourneyStage(e.target.value)}
                  placeholder="Etapa del proceso (Ej: Descubrimiento, Consideración, Compra, Post-venta)"
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && addJourneyStage()}
                />
                <button
                  onClick={addJourneyStage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(data.customerProfile?.customerJourney || []).map((stage, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{stage.stage}</span>
                      <button
                        onClick={() => removeJourneyStage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Puntos de contacto principales"
                        className="p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        value={stage.touchpoints?.join(', ') || ''}
                        onChange={(e) => {
                          const journey = [...(data.customerProfile?.customerJourney || [])];
                          journey[index] = { ...journey[index], touchpoints: e.target.value.split(',').map(t => t.trim()) };
                          handleInputChange('customerJourney', journey, 'customerProfile');
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Posibles fricciones"
                        className="p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        value={stage.painPoints?.join(', ') || ''}
                        onChange={(e) => {
                          const journey = [...(data.customerProfile?.customerJourney || [])];
                          journey[index] = { ...journey[index], painPoints: e.target.value.split(',').map(p => p.trim()) };
                          handleInputChange('customerJourney', journey, 'customerProfile');
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Lifetime Value */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-yellow-600" />
              Métricas de Cliente
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Valor Promedio por Cliente
                </label>
                <input
                  type="number"
                  value={data.customerProfile?.metrics?.averageOrderValue || ''}
                  onChange={(e) => handleInputChange('metrics', { ...data.customerProfile?.metrics, averageOrderValue: parseFloat(e.target.value) || 0 }, 'customerProfile')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="$"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Frecuencia de Compra (meses)
                </label>
                <input
                  type="number"
                  value={data.customerProfile?.metrics?.purchaseFrequency || ''}
                  onChange={(e) => handleInputChange('metrics', { ...data.customerProfile?.metrics, purchaseFrequency: parseInt(e.target.value) || 0 }, 'customerProfile')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Cada X meses"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tasa de Retención (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.customerProfile?.metrics?.retentionRate || ''}
                  onChange={(e) => handleInputChange('metrics', { ...data.customerProfile?.metrics, retentionRate: parseInt(e.target.value) || 0 }, 'customerProfile')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="% de clientes que regresan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Costo de Adquisición
                </label>
                <input
                  type="number"
                  value={data.customerProfile?.metrics?.acquisitionCost || ''}
                  onChange={(e) => handleInputChange('metrics', { ...data.customerProfile?.metrics, acquisitionCost: parseFloat(e.target.value) || 0 }, 'customerProfile')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="$ por cliente nuevo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
          👥 Análisis de Audiencia en Progreso
        </h3>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Información Básica
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Detalles de Industria
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Presencia Digital
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
            Análisis de Cliente
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Competencia
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Objetivos
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Identidad
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Análisis Final
          </div>
        </div>
        <p className="text-purple-700 dark:text-purple-300 text-sm mt-4">
          Información detallada del cliente = Estrategias de marketing más efectivas y personalizadas
        </p>
      </div>
    </div>
  );
};

export default CustomerAnalysisStep;