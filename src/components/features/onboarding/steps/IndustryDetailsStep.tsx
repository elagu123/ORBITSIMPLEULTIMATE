import React, { useState } from 'react';
import { Package, TrendingUp, Calendar, Award, Plus, Trash2 } from '../../ui/Icons';

interface IndustryDetailsStepProps {
  data: any;
  updateData: (data: any) => void;
  industryTemplate: any;
  errors: string[];
}

const IndustryDetailsStep: React.FC<IndustryDetailsStepProps> = ({ 
  data, 
  updateData, 
  industryTemplate,
  errors 
}) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    sku: ''
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

  const addProduct = () => {
    if (!newProduct.name || !newProduct.category) return;
    
    const products = data.industrySpecifics?.keyProducts || [];
    const updatedProducts = [...products, { ...newProduct, id: Date.now() }];
    
    handleInputChange('keyProducts', updatedProducts, 'industrySpecifics');
    setNewProduct({ name: '', category: '', price: '', sku: '' });
  };

  const removeProduct = (index: number) => {
    const products = data.industrySpecifics?.keyProducts || [];
    const updatedProducts = products.filter((_: any, i: number) => i !== index);
    handleInputChange('keyProducts', updatedProducts, 'industrySpecifics');
  };

  const getIndustrySpecificQuestions = () => {
    switch (data.industry) {
      case 'retail':
        return (
          <RetailSpecificFields 
            data={data} 
            handleInputChange={handleInputChange}
          />
        );
      case 'food':
        return (
          <FoodSpecificFields 
            data={data} 
            handleInputChange={handleInputChange}
          />
        );
      case 'services':
        return (
          <ServicesSpecificFields 
            data={data} 
            handleInputChange={handleInputChange}
          />
        );
      case 'manufacturing':
        return (
          <ManufacturingSpecificFields 
            data={data} 
            handleInputChange={handleInputChange}
          />
        );
      default:
        return (
          <GeneralSpecificFields 
            data={data} 
            handleInputChange={handleInputChange}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Detalles Específicos de {getIndustryDisplayName(data.industry)}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Información específica de su industria para generar contenido más relevante
        </p>
      </div>

      {/* Products/Services Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-green-600" />
          Productos/Servicios Principales *
        </h3>
        
        {/* Add New Product Form */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-4">Agregar Producto/Servicio</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nombre del producto/servicio"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500"
            />
            <input
              type="text"
              placeholder="Categoría"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500"
            />
            <input
              type="text"
              placeholder="Precio aprox."
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="SKU (opcional)"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 flex-1"
              />
              <button
                onClick={addProduct}
                disabled={!newProduct.name || !newProduct.category}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {(data.industrySpecifics?.keyProducts || []).map((product: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {product.category}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {product.price}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {product.sku || 'Sin SKU'}
                </div>
              </div>
              <button
                onClick={() => removeProduct(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {(data.industrySpecifics?.keyProducts?.length || 0) < 3 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Recomendamos agregar al menos 3 productos/servicios principales para mejores resultados de IA
            </p>
          </div>
        )}
      </div>

      {/* Seasonality Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Estacionalidad del Negocio
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.industrySpecifics?.seasonality?.hasSeasonality || false}
              onChange={(e) => handleInputChange('seasonality', { 
                ...data.industrySpecifics?.seasonality,
                hasSeasonality: e.target.checked 
              }, 'industrySpecifics')}
              className="mr-3"
            />
            <span>Mi negocio tiene variaciones estacionales</span>
          </label>

          {data.industrySpecifics?.seasonality?.hasSeasonality && (
            <div className="grid grid-cols-2 gap-6 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">Meses de Mayor Demanda</label>
                <SeasonalitySelector
                  value={data.industrySpecifics?.seasonality?.peakMonths || []}
                  onChange={(months) => handleInputChange('seasonality', {
                    ...data.industrySpecifics?.seasonality,
                    peakMonths: months
                  }, 'industrySpecifics')}
                  type="peak"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meses de Menor Demanda</label>
                <SeasonalitySelector
                  value={data.industrySpecifics?.seasonality?.lowMonths || []}
                  onChange={(months) => handleInputChange('seasonality', {
                    ...data.industrySpecifics?.seasonality,
                    lowMonths: months
                  }, 'industrySpecifics')}
                  type="low"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-600" />
          Regulaciones y Certificaciones
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Regulaciones que debe cumplir</label>
            <textarea
              value={data.industrySpecifics?.compliance?.regulations?.join('\n') || ''}
              onChange={(e) => handleInputChange('compliance', {
                ...data.industrySpecifics?.compliance,
                regulations: e.target.value.split('\n').filter(r => r.trim())
              }, 'industrySpecifics')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Una regulación por línea..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Certificaciones que posee</label>
            <textarea
              value={data.industrySpecifics?.compliance?.certifications?.join('\n') || ''}
              onChange={(e) => handleInputChange('compliance', {
                ...data.industrySpecifics?.compliance,
                certifications: e.target.value.split('\n').filter(c => c.trim())
              }, 'industrySpecifics')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Una certificación por línea..."
            />
          </div>
        </div>
      </div>

      {/* Industry-Specific Questions */}
      {getIndustrySpecificQuestions()}

      {/* Progress Indicator */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
          Información Específica de Industria
        </h3>
        <p className="text-green-700 dark:text-green-300 text-sm">
          Esta información permite que la IA genere contenido específicamente adaptado a su tipo de negocio
        </p>
      </div>
    </div>
  );
};

// Retail-specific fields component
const RetailSpecificFields: React.FC<any> = ({ data, handleInputChange }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Información Específica de Comercio Minorista</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tipo de Tienda</label>
        <select
          value={data.industrySpecifics?.storeType || ''}
          onChange={(e) => handleInputChange('storeType', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione tipo de tienda</option>
          <option value="fashion">Ropa y Moda</option>
          <option value="shoes">Calzado</option>
          <option value="electronics">Electrónicos</option>
          <option value="home">Hogar y Decoración</option>
          <option value="beauty">Belleza y Cosmética</option>
          <option value="sports">Deportes</option>
          <option value="jewelry">Joyería</option>
          <option value="books">Librería</option>
          <option value="toys">Juguetería</option>
          <option value="general">Tienda General</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Número de Ubicaciones Físicas</label>
        <select
          value={data.industrySpecifics?.physicalLocations || ''}
          onChange={(e) => handleInputChange('physicalLocations', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione número de ubicaciones</option>
          <option value="1">1 ubicación</option>
          <option value="2-5">2-5 ubicaciones</option>
          <option value="6-10">6-10 ubicaciones</option>
          <option value="11-25">11-25 ubicaciones</option>
          <option value="25+">Más de 25 ubicaciones</option>
          <option value="online-only">Solo en línea</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rango de Precios</label>
        <select
          value={data.industrySpecifics?.priceRange || ''}
          onChange={(e) => handleInputChange('priceRange', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione rango de precios</option>
          <option value="budget">Económico (Precio bajo)</option>
          <option value="mid-range">Rango medio</option>
          <option value="premium">Premium (Precio alto)</option>
          <option value="luxury">Lujo (Precio muy alto)</option>
          <option value="mixed">Variado (Todos los rangos)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ticket Promedio de Compra</label>
        <input
          type="text"
          value={data.industrySpecifics?.averageTicket || ''}
          onChange={(e) => handleInputChange('averageTicket', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Ej: $500 - $1,200"
        />
      </div>
    </div>

    <div className="mt-6">
      <label className="block text-sm font-medium mb-2">Canales de Venta</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          'Tienda física', 'Tienda en línea', 'Redes sociales', 'WhatsApp',
          'Marketplace (Amazon, ML)', 'Catálogo', 'Venta por teléfono', 'Venta directa'
        ].map((channel) => (
          <label key={channel} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="checkbox"
              checked={(data.industrySpecifics?.salesChannels || []).includes(channel)}
              onChange={(e) => {
                const channels = data.industrySpecifics?.salesChannels || [];
                const updated = e.target.checked 
                  ? [...channels, channel]
                  : channels.filter((c: string) => c !== channel);
                handleInputChange('salesChannels', updated, 'industrySpecifics');
              }}
              className="mr-2"
            />
            <span className="text-sm">{channel}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

// Food-specific fields component
const FoodSpecificFields: React.FC<any> = ({ data, handleInputChange }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Información Específica de Restaurante/Alimentos</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tipo de Cocina</label>
        <select
          value={data.industrySpecifics?.cuisineType || ''}
          onChange={(e) => handleInputChange('cuisineType', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione tipo de cocina</option>
          <option value="mexican">Mexicana</option>
          <option value="italian">Italiana</option>
          <option value="american">Americana</option>
          <option value="asian">Asiática</option>
          <option value="seafood">Mariscos</option>
          <option value="fast-food">Comida Rápida</option>
          <option value="healthy">Comida Saludable</option>
          <option value="bakery">Panadería/Repostería</option>
          <option value="fusion">Fusión</option>
          <option value="international">Internacional</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Formato de Servicio</label>
        <div className="space-y-2">
          {['Restaurante', 'Cafetería', 'Food Truck', 'Delivery/Take out', 'Catering', 'Bar'].map((format) => (
            <label key={format} className="flex items-center">
              <input
                type="checkbox"
                checked={(data.industrySpecifics?.serviceFormats || []).includes(format)}
                onChange={(e) => {
                  const formats = data.industrySpecifics?.serviceFormats || [];
                  const updated = e.target.checked 
                    ? [...formats, format]
                    : formats.filter((f: string) => f !== format);
                  handleInputChange('serviceFormats', updated, 'industrySpecifics');
                }}
                className="mr-2"
              />
              <span className="text-sm">{format}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Capacidad de Clientes (si aplica)</label>
        <input
          type="number"
          value={data.industrySpecifics?.capacity || ''}
          onChange={(e) => handleInputChange('capacity', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Número de personas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Horarios de Operación</label>
        <textarea
          value={data.industrySpecifics?.operatingHours || ''}
          onChange={(e) => handleInputChange('operatingHours', e.target.value, 'industrySpecifics')}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Ej: Lun-Vie 8:00-22:00, Sáb-Dom 9:00-23:00"
        />
      </div>
    </div>
  </div>
);

// Services-specific fields component
const ServicesSpecificFields: React.FC<any> = ({ data, handleInputChange }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Información Específica de Servicios</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tipo de Servicio</label>
        <select
          value={data.industrySpecifics?.serviceType || ''}
          onChange={(e) => handleInputChange('serviceType', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione tipo de servicio</option>
          <option value="consulting">Consultoría</option>
          <option value="legal">Legal</option>
          <option value="accounting">Contabilidad</option>
          <option value="marketing">Marketing</option>
          <option value="design">Diseño</option>
          <option value="it">Tecnología/IT</option>
          <option value="healthcare">Salud</option>
          <option value="education">Educación</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="personal">Servicios Personales</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Modalidad de Servicio</label>
        <div className="space-y-2">
          {['Presencial', 'Remoto/Virtual', 'Híbrido', 'A domicilio'].map((modality) => (
            <label key={modality} className="flex items-center">
              <input
                type="checkbox"
                checked={(data.industrySpecifics?.serviceModalities || []).includes(modality)}
                onChange={(e) => {
                  const modalities = data.industrySpecifics?.serviceModalities || [];
                  const updated = e.target.checked 
                    ? [...modalities, modality]
                    : modalities.filter((m: string) => m !== modality);
                  handleInputChange('serviceModalities', updated, 'industrySpecifics');
                }}
                className="mr-2"
              />
              <span className="text-sm">{modality}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Duración Promedio del Servicio</label>
        <select
          value={data.industrySpecifics?.averageDuration || ''}
          onChange={(e) => handleInputChange('averageDuration', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione duración</option>
          <option value="1-hour">Menos de 1 hora</option>
          <option value="few-hours">Algunas horas</option>
          <option value="1-day">1 día</option>
          <option value="few-days">Algunos días</option>
          <option value="weeks">Semanas</option>
          <option value="months">Meses</option>
          <option value="ongoing">Servicio continuo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rango de Precios por Proyecto/Hora</label>
        <input
          type="text"
          value={data.industrySpecifics?.priceRange || ''}
          onChange={(e) => handleInputChange('priceRange', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Ej: $500-2000/hora o $5000-15000/proyecto"
        />
      </div>
    </div>
  </div>
);

// Manufacturing-specific fields component
const ManufacturingSpecificFields: React.FC<any> = ({ data, handleInputChange }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Información Específica de Manufactura</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tipo de Manufactura</label>
        <select
          value={data.industrySpecifics?.manufacturingType || ''}
          onChange={(e) => handleInputChange('manufacturingType', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione tipo</option>
          <option value="automotive">Automotriz</option>
          <option value="textiles">Textiles</option>
          <option value="food-processing">Procesamiento de Alimentos</option>
          <option value="electronics">Electrónicos</option>
          <option value="chemicals">Químicos</option>
          <option value="machinery">Maquinaria</option>
          <option value="furniture">Muebles</option>
          <option value="packaging">Empaque</option>
          <option value="construction-materials">Materiales de Construcción</option>
          <option value="other">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Capacidad de Producción Mensual</label>
        <input
          type="text"
          value={data.industrySpecifics?.productionCapacity || ''}
          onChange={(e) => handleInputChange('productionCapacity', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Ej: 10,000 unidades/mes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mercados Objetivo</label>
        <div className="space-y-2">
          {['Local', 'Nacional', 'Exportación', 'B2B', 'B2C', 'Mayorista', 'Minorista'].map((market) => (
            <label key={market} className="flex items-center">
              <input
                type="checkbox"
                checked={(data.industrySpecifics?.targetMarkets || []).includes(market)}
                onChange={(e) => {
                  const markets = data.industrySpecifics?.targetMarkets || [];
                  const updated = e.target.checked 
                    ? [...markets, market]
                    : markets.filter((m: string) => m !== market);
                  handleInputChange('targetMarkets', updated, 'industrySpecifics');
                }}
                className="mr-2"
              />
              <span className="text-sm">{market}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tiempo de Producción Promedio</label>
        <select
          value={data.industrySpecifics?.leadTime || ''}
          onChange={(e) => handleInputChange('leadTime', e.target.value, 'industrySpecifics')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccione tiempo</option>
          <option value="same-day">Mismo día</option>
          <option value="1-3-days">1-3 días</option>
          <option value="1-week">1 semana</option>
          <option value="2-4-weeks">2-4 semanas</option>
          <option value="1-3-months">1-3 meses</option>
          <option value="3+ months">Más de 3 meses</option>
        </select>
      </div>
    </div>
  </div>
);

// General fields for other industries
const GeneralSpecificFields: React.FC<any> = ({ data, handleInputChange }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
    <h3 className="text-xl font-semibold mb-4">Información Adicional del Negocio</h3>
    
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Características Distintivas de su Negocio</label>
        <textarea
          value={data.industrySpecifics?.distinctiveFeatures || ''}
          onChange={(e) => handleInputChange('distinctiveFeatures', e.target.value, 'industrySpecifics')}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="¿Qué hace único a su negocio? ¿Qué lo diferencia de la competencia?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Proceso de Venta/Servicio</label>
        <textarea
          value={data.industrySpecifics?.salesProcess || ''}
          onChange={(e) => handleInputChange('salesProcess', e.target.value, 'industrySpecifics')}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Describa cómo es el proceso típico desde que un cliente se interesa hasta que completa la compra/contratación..."
        />
      </div>
    </div>
  </div>
);

// Seasonality selector component
const SeasonalitySelector: React.FC<any> = ({ value, onChange, type }) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const toggleMonth = (month: string) => {
    const current = value || [];
    const updated = current.includes(month)
      ? current.filter((m: string) => m !== month)
      : [...current, month];
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {months.map((month) => (
        <label
          key={month}
          className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer text-sm ${
            value?.includes(month)
              ? type === 'peak'
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'bg-red-100 border-red-500 text-red-800'
              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <input
            type="checkbox"
            checked={value?.includes(month) || false}
            onChange={() => toggleMonth(month)}
            className="sr-only"
          />
          {month.substring(0, 3)}
        </label>
      ))}
    </div>
  );
};

// Helper function to get industry display name
const getIndustryDisplayName = (industry: string) => {
  const displayNames: { [key: string]: string } = {
    retail: 'Comercio Minorista',
    food: 'Restaurantes y Alimentos',
    services: 'Servicios Profesionales',
    manufacturing: 'Manufactura',
    technology: 'Tecnología',
    health: 'Salud',
    beauty: 'Belleza',
    fitness: 'Fitness',
    education: 'Educación',
    'real-estate': 'Bienes Raíces',
    automotive: 'Automotriz',
    finance: 'Finanzas',
    travel: 'Turismo',
    construction: 'Construcción',
    entertainment: 'Entretenimiento',
    'non-profit': 'Sin Fines de Lucro'
  };
  return displayNames[industry] || 'su Industria';
};

export default IndustryDetailsStep;