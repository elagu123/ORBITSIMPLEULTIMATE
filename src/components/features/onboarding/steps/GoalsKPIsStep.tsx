import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, DollarSign, Users, BarChart, Clock, Award } from '../../ui/Icons';

interface GoalsKPIsStepProps {
  data: any;
  updateData: (data: any) => void;
  errors: string[];
}

const GoalsKPIsStep: React.FC<GoalsKPIsStepProps> = ({ data, updateData, errors }) => {
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    timeframe: '',
    priority: '',
    measurable: ''
  });
  const [newKPI, setNewKPI] = useState({
    name: '',
    currentValue: '',
    targetValue: '',
    unit: '',
    frequency: '',
    category: ''
  });

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

  const addObjective = () => {
    if (newObjective.title.trim() && newObjective.description.trim()) {
      const objectives = data.detailedGoals?.primaryObjectives || [];
      handleInputChange('primaryObjectives', [...objectives, newObjective], 'detailedGoals');
      setNewObjective({
        title: '',
        description: '',
        timeframe: '',
        priority: '',
        measurable: ''
      });
    }
  };

  const removeObjective = (index: number) => {
    const objectives = data.detailedGoals?.primaryObjectives || [];
    handleInputChange('primaryObjectives', objectives.filter((_, i) => i !== index), 'detailedGoals');
  };

  const addKPI = () => {
    if (newKPI.name.trim() && newKPI.targetValue.trim()) {
      const kpis = data.detailedGoals?.kpis || [];
      handleInputChange('kpis', [...kpis, newKPI], 'detailedGoals');
      setNewKPI({
        name: '',
        currentValue: '',
        targetValue: '',
        unit: '',
        frequency: '',
        category: ''
      });
    }
  };

  const removeKPI = (index: number) => {
    const kpis = data.detailedGoals?.kpis || [];
    handleInputChange('kpis', kpis.filter((_, i) => i !== index), 'detailedGoals');
  };

  const timeframes = [
    '1-3 meses',
    '3-6 meses',
    '6-12 meses',
    '1-2 años',
    '2-3 años',
    'Más de 3 años'
  ];

  const priorities = [
    'Crítico/Urgente',
    'Alta',
    'Media',
    'Baja'
  ];

  const kpiCategories = [
    'Ventas/Ingresos',
    'Marketing/Adquisición',
    'Operaciones',
    'Satisfacción del Cliente',
    'Recursos Humanos',
    'Financiero',
    'Crecimiento',
    'Calidad/Eficiencia'
  ];

  const frequencies = [
    'Diario',
    'Semanal',
    'Quincenal',
    'Mensual',
    'Trimestral',
    'Semestral',
    'Anual'
  ];

  const budgetRanges = [
    'Menos de $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000 - $250,000',
    '$250,000 - $500,000',
    'Más de $500,000'
  ];

  const expectedROI = [
    '100-200%',
    '200-300%',
    '300-500%',
    '500-1000%',
    'Más de 1000%'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Objetivos Estratégicos y KPIs
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Defina metas específicas y métricas para medir el éxito de su estrategia de marketing
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Objectives */}
        <div className="space-y-6">
          {/* Add New Objective */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              Agregar Objetivo Estratégico *
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título del objetivo *"
                value={newObjective.title}
                onChange={(e) => setNewObjective({...newObjective, title: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <textarea
                placeholder="Descripción detallada del objetivo *"
                value={newObjective.description}
                onChange={(e) => setNewObjective({...newObjective, description: e.target.value})}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newObjective.timeframe}
                  onChange={(e) => setNewObjective({...newObjective, timeframe: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Marco de tiempo</option>
                  {timeframes.map(timeframe => (
                    <option key={timeframe} value={timeframe}>{timeframe}</option>
                  ))}
                </select>

                <select
                  value={newObjective.priority}
                  onChange={(e) => setNewObjective({...newObjective, priority: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Prioridad</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="¿Cómo medirá el éxito de este objetivo?"
                value={newObjective.measurable}
                onChange={(e) => setNewObjective({...newObjective, measurable: e.target.value})}
                rows={2}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <button
                onClick={addObjective}
                disabled={!newObjective.title.trim() || !newObjective.description.trim()}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Agregar Objetivo
              </button>
            </div>
          </div>

          {/* Objectives List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Objetivos Definidos ({(data.detailedGoals?.primaryObjectives || []).length}/8)
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(data.detailedGoals?.primaryObjectives || []).map((objective, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-lg">{objective.title}</h5>
                    <button
                      onClick={() => removeObjective(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{objective.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {objective.timeframe && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{objective.timeframe}</span>
                      </div>
                    )}
                    
                    {objective.priority && (
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          objective.priority === 'Crítico/Urgente' ? 'bg-red-100 text-red-800' :
                          objective.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                          objective.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {objective.priority}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {objective.measurable && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <strong>Medición:</strong> {objective.measurable}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {(data.detailedGoals?.primaryObjectives || []).length < 2 && (
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Se requieren mínimo 2 objetivos</strong> para un análisis estratégico efectivo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - KPIs */}
        <div className="space-y-6">
          {/* Add New KPI */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-blue-600" />
              Agregar KPI (Indicador Clave) *
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del KPI *"
                value={newKPI.name}
                onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Valor actual"
                  value={newKPI.currentValue}
                  onChange={(e) => setNewKPI({...newKPI, currentValue: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Meta/Objetivo *"
                  value={newKPI.targetValue}
                  onChange={(e) => setNewKPI({...newKPI, targetValue: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Unidad (%, $, #)"
                  value={newKPI.unit}
                  onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newKPI.category}
                  onChange={(e) => setNewKPI({...newKPI, category: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Categoría</option>
                  {kpiCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={newKPI.frequency}
                  onChange={(e) => setNewKPI({...newKPI, frequency: e.target.value})}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Frecuencia de medición</option>
                  {frequencies.map(frequency => (
                    <option key={frequency} value={frequency}>{frequency}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={addKPI}
                disabled={!newKPI.name.trim() || !newKPI.targetValue.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Agregar KPI
              </button>
            </div>
          </div>

          {/* KPIs List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              KPIs Definidos ({(data.detailedGoals?.kpis || []).length}/10)
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(data.detailedGoals?.kpis || []).map((kpi, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold">{kpi.name}</h5>
                    <button
                      onClick={() => removeKPI(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Actual:</span>
                      <span className="ml-2 font-semibold">{kpi.currentValue || 'N/A'} {kpi.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Meta:</span>
                      <span className="ml-2 font-semibold text-green-600">{kpi.targetValue} {kpi.unit}</span>
                    </div>
                    {kpi.category && (
                      <div>
                        <span className="text-gray-500">Categoría:</span>
                        <span className="ml-2">{kpi.category}</span>
                      </div>
                    )}
                    {kpi.frequency && (
                      <div>
                        <span className="text-gray-500">Medición:</span>
                        <span className="ml-2">{kpi.frequency}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {(data.detailedGoals?.kpis || []).length < 3 && (
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Se requieren mínimo 3 KPIs</strong> para medir el éxito efectivamente
                </p>
              </div>
            )}
          </div>

          {/* Budget and ROI */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
              Presupuesto y ROI
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Presupuesto Mensual de Marketing *
                </label>
                <select
                  value={data.detailedGoals?.budget?.monthly || ''}
                  onChange={(e) => handleInputChange('budget', { ...data.detailedGoals?.budget, monthly: e.target.value }, 'detailedGoals')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione rango de presupuesto</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ROI Esperado en 12 meses *
                </label>
                <select
                  value={data.detailedGoals?.budget?.expectedROI || ''}
                  onChange={(e) => handleInputChange('budget', { ...data.detailedGoals?.budget, expectedROI: e.target.value }, 'detailedGoals')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione ROI esperado</option>
                  {expectedROI.map(roi => (
                    <option key={roi} value={roi}>{roi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Distribución de Presupuesto por Canal (%)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Redes sociales %"
                    min="0"
                    max="100"
                    value={data.detailedGoals?.budget?.channelDistribution?.socialMedia || ''}
                    onChange={(e) => handleInputChange('budget', { 
                      ...data.detailedGoals?.budget, 
                      channelDistribution: { 
                        ...data.detailedGoals?.budget?.channelDistribution, 
                        socialMedia: parseInt(e.target.value) || 0 
                      }
                    }, 'detailedGoals')}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Google Ads %"
                    min="0"
                    max="100"
                    value={data.detailedGoals?.budget?.channelDistribution?.googleAds || ''}
                    onChange={(e) => handleInputChange('budget', { 
                      ...data.detailedGoals?.budget, 
                      channelDistribution: { 
                        ...data.detailedGoals?.budget?.channelDistribution, 
                        googleAds: parseInt(e.target.value) || 0 
                      }
                    }, 'detailedGoals')}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Email marketing %"
                    min="0"
                    max="100"
                    value={data.detailedGoals?.budget?.channelDistribution?.email || ''}
                    onChange={(e) => handleInputChange('budget', { 
                      ...data.detailedGoals?.budget, 
                      channelDistribution: { 
                        ...data.detailedGoals?.budget?.channelDistribution, 
                        email: parseInt(e.target.value) || 0 
                      }
                    }, 'detailedGoals')}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Contenido/SEO %"
                    min="0"
                    max="100"
                    value={data.detailedGoals?.budget?.channelDistribution?.content || ''}
                    onChange={(e) => handleInputChange('budget', { 
                      ...data.detailedGoals?.budget, 
                      channelDistribution: { 
                        ...data.detailedGoals?.budget?.channelDistribution, 
                        content: parseInt(e.target.value) || 0 
                      }
                    }, 'detailedGoals')}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Métricas de Costo Objetivo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Costo por Lead ($)</label>
                    <input
                      type="number"
                      value={data.detailedGoals?.budget?.targetCostPerLead || ''}
                      onChange={(e) => handleInputChange('budget', { ...data.detailedGoals?.budget, targetCostPerLead: parseFloat(e.target.value) || 0 }, 'detailedGoals')}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Costo por Venta ($)</label>
                    <input
                      type="number"
                      value={data.detailedGoals?.budget?.targetCostPerSale || ''}
                      onChange={(e) => handleInputChange('budget', { ...data.detailedGoals?.budget, targetCostPerSale: parseFloat(e.target.value) || 0 }, 'detailedGoals')}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">ROAS Objetivo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.detailedGoals?.budget?.targetROAS || ''}
                      onChange={(e) => handleInputChange('budget', { ...data.detailedGoals?.budget, targetROAS: parseFloat(e.target.value) || 0 }, 'detailedGoals')}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Ej: 4.0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline and Milestones */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Cronograma de Revisión
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Frecuencia de Revisión de Objetivos *
                </label>
                <select
                  value={data.detailedGoals?.reviewFrequency || ''}
                  onChange={(e) => handleInputChange('reviewFrequency', e.target.value, 'detailedGoals')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccione frecuencia</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Primera Revisión Programada
                </label>
                <input
                  type="date"
                  value={data.detailedGoals?.firstReviewDate || ''}
                  onChange={(e) => handleInputChange('firstReviewDate', e.target.value, 'detailedGoals')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hitos Importantes (separar por líneas)
                </label>
                <textarea
                  value={data.detailedGoals?.milestones || ''}
                  onChange={(e) => handleInputChange('milestones', e.target.value, 'detailedGoals')}
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ej: Lanzamiento de nueva campaña (Febrero)&#10;Revisión trimestral (Abril)&#10;Optimización de estrategia (Julio)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
          🎯 Objetivos y Métricas en Progreso
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
          <div className="flex items-center text-gray-400">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            Competencia
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
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
        <p className="text-green-700 dark:text-green-300 text-sm mt-4">
          Objetivos claros y KPIs específicos = Estrategias medibles y resultados cuantificables
        </p>
      </div>
    </div>
  );
};

export default GoalsKPIsStep;