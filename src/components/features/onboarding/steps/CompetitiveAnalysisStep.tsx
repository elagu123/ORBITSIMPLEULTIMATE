import React, { useState } from 'react';
import { Target, TrendingUp, Shield, Award, Search, ExternalLink } from '../../ui/Icons';

interface CompetitiveAnalysisStepProps {
  data: any;
  updateData: (data: any) => void;
  errors: string[];
}

const CompetitiveAnalysisStep: React.FC<CompetitiveAnalysisStepProps> = ({ data, updateData, errors }) => {
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    website: '',
    strengths: '',
    weaknesses: '',
    marketShare: '',
    targetAudience: '',
    pricingStrategy: '',
    marketingChannels: ''
  });
  const [newAdvantage, setNewAdvantage] = useState('');

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

  const addCompetitor = () => {
    if (newCompetitor.name.trim() && newCompetitor.strengths.trim()) {
      const competitors = data.competitive?.directCompetitors || [];
      handleInputChange('directCompetitors', [...competitors, {
        ...newCompetitor,
        strengths: newCompetitor.strengths.split(',').map(s => s.trim()),
        weaknesses: newCompetitor.weaknesses.split(',').map(w => w.trim()),
        marketingChannels: newCompetitor.marketingChannels.split(',').map(c => c.trim())
      }], 'competitive');
      setNewCompetitor({
        name: '',
        website: '',
        strengths: '',
        weaknesses: '',
        marketShare: '',
        targetAudience: '',
        pricingStrategy: '',
        marketingChannels: ''
      });
    }
  };

  const removeCompetitor = (index: number) => {
    const competitors = data.competitive?.directCompetitors || [];
    handleInputChange('directCompetitors', competitors.filter((_, i) => i !== index), 'competitive');
  };

  const addCompetitiveAdvantage = () => {
    if (newAdvantage.trim()) {
      const advantages = data.competitive?.competitiveAdvantages || [];
      handleInputChange('competitiveAdvantages', [...advantages, newAdvantage.trim()], 'competitive');
      setNewAdvantage('');
    }
  };

  const removeAdvantage = (index: number) => {
    const advantages = data.competitive?.competitiveAdvantages || [];
    handleInputChange('competitiveAdvantages', advantages.filter((_, i) => i !== index), 'competitive');
  };

  const marketPositions = [
    'Líder del mercado',
    'Retador',
    'Seguidor',
    'Especialista de nicho',
    'Disruptor/Innovador'
  ];

  const pricingStrategies = [
    'Premium (precio alto)',
    'Competitivo (precio medio)',
    'Económico (precio bajo)',
    'Dinámico (varía según demanda)',
    'Por valor agregado',
    'Freemium/Suscripción'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Análisis Competitivo Profundo
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Identifique a su competencia y defina sus ventajas competitivas únicas
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Competitors */}
        <div className="space-y-6">
          {/* Add New Competitor */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-red-600" />
              Agregar Competidor Directo *
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del competidor *"
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="url"
                  placeholder="Sitio web (opcional)"
                  value={newCompetitor.website}
                  onChange={(e) => setNewCompetitor({...newCompetitor, website: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <textarea
                placeholder="Fortalezas principales (separar por comas) *"
                value={newCompetitor.strengths}
                onChange={(e) => setNewCompetitor({...newCompetitor, strengths: e.target.value})}
                rows={2}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <textarea
                placeholder="Debilidades identificadas (separar por comas)"
                value={newCompetitor.weaknesses}
                onChange={(e) => setNewCompetitor({...newCompetitor, weaknesses: e.target.value})}
                rows={2}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Participación de mercado estimada"
                  value={newCompetitor.marketShare}
                  onChange={(e) => setNewCompetitor({...newCompetitor, marketShare: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                  value={newCompetitor.pricingStrategy}
                  onChange={(e) => setNewCompetitor({...newCompetitor, pricingStrategy: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Estrategia de precios</option>
                  {pricingStrategies.map(strategy => (
                    <option key={strategy} value={strategy}>{strategy}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Audiencia objetivo principal"
                value={newCompetitor.targetAudience}
                onChange={(e) => setNewCompetitor({...newCompetitor, targetAudience: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <input
                type="text"
                placeholder="Canales de marketing principales (separar por comas)"
                value={newCompetitor.marketingChannels}
                onChange={(e) => setNewCompetitor({...newCompetitor, marketingChannels: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <button
                onClick={addCompetitor}
                disabled={!newCompetitor.name.trim() || !newCompetitor.strengths.trim()}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Agregar Competidor
              </button>
            </div>
          </div>

          {/* Competitors List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Competidores Identificados ({(data.competitive?.directCompetitors || []).length}/5)
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(data.competitive?.directCompetitors || []).map((competitor, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-semibold text-lg">{competitor.name}</h5>
                      {competitor.website && (
                        <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => removeCompetitor(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold text-green-700">Fortalezas:</span>
                      <ul className="list-disc list-inside mt-1">
                        {competitor.strengths?.map((strength, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">{strength}</li>
                        ))}
                      </ul>
                    </div>

                    {competitor.weaknesses?.length > 0 && (
                      <div>
                        <span className="font-semibold text-red-700">Debilidades:</span>
                        <ul className="list-disc list-inside mt-1">
                          {competitor.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-gray-700 dark:text-gray-300">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {competitor.marketShare && (
                      <div>
                        <span className="font-semibold">Participación:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{competitor.marketShare}</span>
                      </div>
                    )}

                    {competitor.pricingStrategy && (
                      <div>
                        <span className="font-semibold">Precios:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{competitor.pricingStrategy}</span>
                      </div>
                    )}

                    {competitor.targetAudience && (
                      <div className="md:col-span-2">
                        <span className="font-semibold">Audiencia:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{competitor.targetAudience}</span>
                      </div>
                    )}

                    {competitor.marketingChannels?.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-semibold">Canales de Marketing:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {competitor.marketingChannels.map((channel, i) => (
                            <span key={i} className="inline-block bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {(data.competitive?.directCompetitors || []).length < 2 && (
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Se requieren mínimo 2 competidores</strong> para un análisis efectivo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Competitive Advantages */}
        <div className="space-y-6">
          {/* Market Position */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Posición en el Mercado *
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ¿Cómo se posiciona su empresa en el mercado? *
                </label>
                <select
                  value={data.competitive?.marketPosition || ''}
                  onChange={(e) => handleInputChange('marketPosition', e.target.value, 'competitive')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione posición en el mercado</option>
                  {marketPositions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Participación de mercado estimada (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.competitive?.marketShare || ''}
                  onChange={(e) => handleInputChange('marketShare', parseInt(e.target.value) || 0, 'competitive')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ej: 15%"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tamaño del mercado objetivo (descripción)
                </label>
                <textarea
                  value={data.competitive?.marketSize || ''}
                  onChange={(e) => handleInputChange('marketSize', e.target.value, 'competitive')}
                  rows={2}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ej: Mercado regional de $50M anuales, crecimiento del 8% anual"
                />
              </div>
            </div>
          </div>

          {/* Competitive Advantages */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              Ventajas Competitivas *
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  placeholder="¿Qué hace único a su negocio vs la competencia?"
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && addCompetitiveAdvantage()}
                />
                <button
                  onClick={addCompetitiveAdvantage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(data.competitive?.competitiveAdvantages || []).map((advantage, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <span className="flex-1">{advantage}</span>
                    <button
                      onClick={() => removeAdvantage(index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                Mínimo 2 ventajas competitivas requeridas. Ejemplos: "Tecnología patentada", "Atención 24/7", "Precios más bajos", "Mayor calidad"
              </p>
            </div>
          </div>

          {/* Barriers to Entry */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Barreras de Entrada
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ¿Qué dificultades enfrentaría un nuevo competidor? *
                </label>
                <textarea
                  value={data.competitive?.barriersToEntry || ''}
                  onChange={(e) => handleInputChange('barriersToEntry', e.target.value, 'competitive')}
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ej: Inversión inicial alta, regulaciones estrictas, lealtad de clientes establecida, contratos exclusivos..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amenaza de nuevos entrantes (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={data.competitive?.threatOfNewEntrants || 5}
                  onChange={(e) => handleInputChange('threatOfNewEntrants', parseInt(e.target.value), 'competitive')}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muy baja (1)</span>
                  <span>Actual: {data.competitive?.threatOfNewEntrants || 5}</span>
                  <span>Muy alta (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Poder de negociación de clientes (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={data.competitive?.buyerPower || 5}
                  onChange={(e) => handleInputChange('buyerPower', parseInt(e.target.value), 'competitive')}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muy bajo (1)</span>
                  <span>Actual: {data.competitive?.buyerPower || 5}</span>
                  <span>Muy alto (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amenaza de productos sustitutos (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={data.competitive?.substituteThreat || 5}
                  onChange={(e) => handleInputChange('substituteThreat', parseInt(e.target.value), 'competitive')}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muy baja (1)</span>
                  <span>Actual: {data.competitive?.substituteThreat || 5}</span>
                  <span>Muy alta (10)</span>
                </div>
              </div>
            </div>
          </div>

          {/* SWOT Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Resumen FODA (Fortalezas, Oportunidades, Debilidades, Amenazas)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                  Fortalezas Internas
                </label>
                <textarea
                  value={data.competitive?.swot?.strengths || ''}
                  onChange={(e) => handleInputChange('swot', { ...data.competitive?.swot, strengths: e.target.value }, 'competitive')}
                  rows={2}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Recursos y capacidades únicas..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Oportunidades Externas
                </label>
                <textarea
                  value={data.competitive?.swot?.opportunities || ''}
                  onChange={(e) => handleInputChange('swot', { ...data.competitive?.swot, opportunities: e.target.value }, 'competitive')}
                  rows={2}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Tendencias favorables del mercado..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  Debilidades Internas
                </label>
                <textarea
                  value={data.competitive?.swot?.weaknesses || ''}
                  onChange={(e) => handleInputChange('swot', { ...data.competitive?.swot, weaknesses: e.target.value }, 'competitive')}
                  rows={2}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Áreas de mejora identificadas..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-700 dark:text-orange-400 mb-1">
                  Amenazas Externas
                </label>
                <textarea
                  value={data.competitive?.swot?.threats || ''}
                  onChange={(e) => handleInputChange('swot', { ...data.competitive?.swot, threats: e.target.value }, 'competitive')}
                  rows={2}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Riesgos y desafíos del entorno..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
          🎯 Análisis Competitivo en Progreso
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
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Análisis de Cliente
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
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
        <p className="text-red-700 dark:text-red-300 text-sm mt-4">
          Conocer a fondo su competencia = Estrategias más efectivas para diferenciarse y ganar mercado
        </p>
      </div>
    </div>
  );
};

export default CompetitiveAnalysisStep;