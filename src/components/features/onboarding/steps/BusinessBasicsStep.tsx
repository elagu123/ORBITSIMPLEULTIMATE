import React from 'react';
import { Building2, Users, Globe, Calendar, DollarSign } from '../../ui/Icons';

interface BusinessBasicsStepProps {
  data: any;
  updateData: (data: any) => void;
  errors: string[];
}

const BusinessBasicsStep: React.FC<BusinessBasicsStepProps> = ({ data, updateData, errors }) => {
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

  const industries = [
    { value: 'retail', label: '🛍️ Comercio Minorista / Tiendas' },
    { value: 'food', label: '🍽️ Restaurantes / Alimentos' },
    { value: 'services', label: '💼 Servicios Profesionales' },
    { value: 'manufacturing', label: '🏭 Manufactura / Producción' },
    { value: 'technology', label: '💻 Tecnología / Software' },
    { value: 'health', label: '🏥 Salud / Medicina' },
    { value: 'beauty', label: '💄 Belleza / Cuidado Personal' },
    { value: 'fitness', label: '🏋️ Fitness / Deportes' },
    { value: 'education', label: '📚 Educación / Capacitación' },
    { value: 'real-estate', label: '🏠 Bienes Raíces' },
    { value: 'automotive', label: '🚗 Automotriz' },
    { value: 'finance', label: '💰 Finanzas / Seguros' },
    { value: 'travel', label: '✈️ Turismo / Viajes' },
    { value: 'construction', label: '🔨 Construcción' },
    { value: 'entertainment', label: '🎭 Entretenimiento' },
    { value: 'non-profit', label: '❤️ Organizaciones sin fines de lucro' }
  ];

  const employeeCounts = [
    '1 (Solo yo)',
    '2-5 empleados',
    '6-10 empleados',
    '11-25 empleados',
    '26-50 empleados',
    '51-100 empleados',
    '101-500 empleados',
    '500+ empleados'
  ];

  const revenueRanges = [
    'Menos de $50,000 al año',
    '$50,000 - $100,000 al año',
    '$100,000 - $500,000 al año',
    '$500,000 - $1,000,000 al año',
    '$1,000,000 - $5,000,000 al año',
    'Más de $5,000,000 al año',
    'Prefiero no decir'
  ];

  const businessModels = [
    { value: 'b2c', label: 'B2C - Venta directa a consumidores' },
    { value: 'b2b', label: 'B2B - Venta a otras empresas' },
    { value: 'b2b2c', label: 'B2B2C - Híbrido (empresas y consumidores)' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Información Básica del Negocio
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Cuéntenos sobre su empresa para entender mejor su contexto
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Business Names */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre Legal de la Empresa *
              </label>
              <input
                type="text"
                value={data.businessDetails?.legalName || ''}
                onChange={(e) => handleInputChange('legalName', e.target.value, 'businessDetails')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                placeholder="Ej: Zapaterías Premium S.A. de C.V."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre Comercial / Marca *
              </label>
              <input
                type="text"
                value={data.businessDetails?.brandName || ''}
                onChange={(e) => handleInputChange('brandName', e.target.value, 'businessDetails')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                placeholder="Ej: ZapaStyle"
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Industria / Sector *
            </label>
            <select
              value={data.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Seleccione su industria</option>
              {industries.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          {/* Business Model */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Modelo de Negocio *
            </label>
            <div className="space-y-2">
              {businessModels.map((model) => (
                <label key={model.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="businessModel"
                    value={model.value}
                    checked={data.businessDetails?.businessModel === model.value}
                    onChange={(e) => handleInputChange('businessModel', e.target.value, 'businessDetails')}
                    className="mr-3"
                  />
                  <span className="text-sm">{model.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Business Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descripción del Negocio * (mínimo 50 caracteres)
            </label>
            <textarea
              value={data.businessDetails?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value, 'businessDetails')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              placeholder="Describa qué hace su empresa, qué productos/servicios ofrece y qué la hace especial..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {data.businessDetails?.description?.length || 0} caracteres
            </p>
          </div>

          {/* Year Established */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Año de Fundación *
            </label>
            <select
              value={data.businessDetails?.yearEstablished || new Date().getFullYear()}
              onChange={(e) => handleInputChange('yearEstablished', parseInt(e.target.value), 'businessDetails')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            >
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Employee Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Número de Empleados *
            </label>
            <select
              value={data.businessDetails?.employeeCount || ''}
              onChange={(e) => handleInputChange('employeeCount', e.target.value, 'businessDetails')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Seleccione el tamaño</option>
              {employeeCounts.map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>

          {/* Annual Revenue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Ingresos Anuales Aproximados *
            </label>
            <select
              value={data.businessDetails?.annualRevenue || ''}
              onChange={(e) => handleInputChange('annualRevenue', e.target.value, 'businessDetails')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Seleccione rango de ingresos</option>
              {revenueRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Primary Language and Countries */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Idioma Principal *
              </label>
              <select
                value={data.businessDetails?.primaryLanguage || 'es'}
                onChange={(e) => handleInputChange('primaryLanguage', e.target.value, 'businessDetails')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
                <option value="fr">Francés</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                País Principal
              </label>
              <input
                type="text"
                value={data.businessDetails?.operatingCountries?.[0] || 'México'}
                onChange={(e) => handleInputChange('operatingCountries', [e.target.value], 'businessDetails')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                placeholder="País donde opera"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          📊 Progreso de Información Empresarial
        </h3>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
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
            Análisis Final
          </div>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-sm mt-4">
          Mientras más específica sea la información, mejores serán los resultados de IA
        </p>
      </div>
    </div>
  );
};

export default BusinessBasicsStep;