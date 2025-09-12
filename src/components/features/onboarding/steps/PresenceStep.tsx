import React, { useState } from 'react';
import { MapPin, Globe, Star, Plus, Trash2, ExternalLink } from '../../ui/Icons';

interface PresenceStepProps {
  data: any;
  updateData: (data: any) => void;
  errors: string[];
}

const PresenceStep: React.FC<PresenceStepProps> = ({ data, updateData, errors }) => {
  const [newLocation, setNewLocation] = useState({
    type: 'store',
    address: '',
    city: '',
    state: '',
    isMain: false
  });

  const [newMarketplace, setNewMarketplace] = useState({
    platform: '',
    storeUrl: '',
    isActive: true
  });

  const handleInputChange = (field: string, value: any, nested?: string, subNested?: string) => {
    if (subNested && nested) {
      updateData({
        ...data,
        [nested]: {
          ...data[nested],
          [subNested]: {
            ...data[nested]?.[subNested],
            [field]: value
          }
        }
      });
    } else if (nested) {
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

  const handleSocialMediaChange = (platform: string, field: string, value: any) => {
    const currentSocial = data.digitalPresence?.socialMediaProfiles || {};
    const platformData = currentSocial[platform] || {};
    
    handleInputChange(platform, {
      ...platformData,
      [field]: value
    }, 'digitalPresence', 'socialMediaProfiles');
  };

  const addPhysicalLocation = () => {
    if (!newLocation.address || !newLocation.city) return;
    
    const locations = data.locations?.physicalLocations || [];
    const updatedLocations = [...locations, { ...newLocation, id: Date.now() }];
    
    handleInputChange('physicalLocations', updatedLocations, 'locations');
    setNewLocation({ type: 'store', address: '', city: '', state: '', isMain: false });
  };

  const removeLocation = (index: number) => {
    const locations = data.locations?.physicalLocations || [];
    const updatedLocations = locations.filter((_: any, i: number) => i !== index);
    handleInputChange('physicalLocations', updatedLocations, 'locations');
  };

  const addMarketplace = () => {
    if (!newMarketplace.platform || !newMarketplace.storeUrl) return;
    
    const marketplaces = data.digitalPresence?.onlineMarketplaces || [];
    const updatedMarketplaces = [...marketplaces, { ...newMarketplace, id: Date.now() }];
    
    handleInputChange('onlineMarketplaces', updatedMarketplaces, 'digitalPresence');
    setNewMarketplace({ platform: '', storeUrl: '', isActive: true });
  };

  const removeMarketplace = (index: number) => {
    const marketplaces = data.digitalPresence?.onlineMarketplaces || [];
    const updatedMarketplaces = marketplaces.filter((_: any, i: number) => i !== index);
    handleInputChange('onlineMarketplaces', updatedMarketplaces, 'digitalPresence');
  };

  const socialPlatforms = [
    { key: 'facebook', name: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/tu-negocio' },
    { key: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/tu-negocio' },
    { key: 'twitter', name: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/tu-negocio' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/tu-negocio' },
    { key: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@tu-negocio' },
    { key: 'youtube', name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@tu-negocio' }
  ];

  const marketplacePlatforms = [
    'Amazon', 'Mercado Libre', 'eBay', 'Shopify', 'WooCommerce', 
    'Etsy', 'Facebook Marketplace', 'Instagram Shopping', 'WhatsApp Business',
    'Rappi', 'Uber Eats', 'DoorDash', 'Otro'
  ];

  const locationTypes = [
    { value: 'store', label: '🏪 Tienda/Local' },
    { value: 'warehouse', label: '📦 Bodega/Almacén' },
    { value: 'office', label: '🏢 Oficina' },
    { value: 'factory', label: '🏭 Fábrica/Planta' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Presencia Física y Digital
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Información sobre ubicaciones, sitio web, redes sociales y presencia online
        </p>
      </div>

      {/* Headquarters - MANDATORY */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-purple-600" />
          Sede Principal / Dirección Fiscal *
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Dirección Completa *</label>
            <input
              type="text"
              value={data.locations?.headquarters?.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value, 'locations', 'headquarters')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Calle, número, colonia..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ciudad *</label>
            <input
              type="text"
              value={data.locations?.headquarters?.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value, 'locations', 'headquarters')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Estado/Provincia *</label>
            <input
              type="text"
              value={data.locations?.headquarters?.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value, 'locations', 'headquarters')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">País *</label>
            <input
              type="text"
              value={data.locations?.headquarters?.country || 'México'}
              onChange={(e) => handleInputChange('country', e.target.value, 'locations', 'headquarters')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Código Postal</label>
            <input
              type="text"
              value={data.locations?.headquarters?.zipCode || ''}
              onChange={(e) => handleInputChange('zipCode', e.target.value, 'locations', 'headquarters')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Additional Physical Locations */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Ubicaciones Adicionales</h3>
        
        {/* Add New Location Form */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-4">Agregar Ubicación</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={newLocation.type}
                onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:border-gray-500"
              >
                {locationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dirección</label>
              <input
                type="text"
                placeholder="Dirección completa"
                value={newLocation.address}
                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ciudad</label>
              <input
                type="text"
                placeholder="Ciudad"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <input
                type="text"
                placeholder="Estado"
                value={newLocation.state}
                onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newLocation.isMain}
                  onChange={(e) => setNewLocation({ ...newLocation, isMain: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Principal</span>
              </label>
              <button
                onClick={addPhysicalLocation}
                disabled={!newLocation.address || !newLocation.city}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Locations List */}
        <div className="space-y-3">
          {(data.locations?.physicalLocations || []).map((location: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="font-medium">
                  {locationTypes.find(t => t.value === location.type)?.label || location.type}
                  {location.isMain && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Principal</span>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{location.address}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{location.city}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{location.state}</div>
              </div>
              <button
                onClick={() => removeLocation(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Website - MANDATORY */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-blue-600" />
          Sitio Web *
        </h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">URL del Sitio Web Principal *</label>
          <input
            type="url"
            value={data.digitalPresence?.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value, 'digitalPresence')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="https://www.tu-sitio-web.com"
          />
        </div>
      </div>

      {/* Social Media Profiles */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Redes Sociales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="space-y-3">
              <h4 className="font-medium flex items-center">
                <span className="text-xl mr-2">{platform.icon}</span>
                {platform.name}
              </h4>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">URL del Perfil</label>
                <input
                  type="url"
                  value={data.digitalPresence?.socialMediaProfiles?.[platform.key]?.url || ''}
                  onChange={(e) => handleSocialMediaChange(platform.key, 'url', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder={platform.placeholder}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Seguidores (aprox.)</label>
                  <input
                    type="number"
                    value={data.digitalPresence?.socialMediaProfiles?.[platform.key]?.followers || ''}
                    onChange={(e) => handleSocialMediaChange(platform.key, 'followers', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={data.digitalPresence?.socialMediaProfiles?.[platform.key]?.isActive || false}
                      onChange={(e) => handleSocialMediaChange(platform.key, 'isActive', e.target.checked)}
                      className="mr-2"
                    />
                    Activo
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google My Business */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-600" />
          Google My Business
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium mb-2">
              <input
                type="checkbox"
                checked={data.digitalPresence?.googleMyBusiness?.isVerified || false}
                onChange={(e) => handleInputChange('isVerified', e.target.checked, 'digitalPresence', 'googleMyBusiness')}
                className="mr-2"
              />
              Perfil Verificado en Google My Business
            </label>
          </div>
          
          {data.digitalPresence?.googleMyBusiness?.isVerified && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Calificación Promedio</label>
                <select
                  value={data.digitalPresence?.googleMyBusiness?.averageRating || ''}
                  onChange={(e) => handleInputChange('averageRating', parseFloat(e.target.value), 'digitalPresence', 'googleMyBusiness')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seleccionar calificación</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5.0</option>
                  <option value="4.5">⭐⭐⭐⭐☆ 4.5</option>
                  <option value="4">⭐⭐⭐⭐ 4.0</option>
                  <option value="3.5">⭐⭐⭐☆ 3.5</option>
                  <option value="3">⭐⭐⭐ 3.0</option>
                  <option value="2.5">⭐⭐☆ 2.5</option>
                  <option value="2">⭐⭐ 2.0</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Total de Reseñas</label>
                <input
                  type="number"
                  value={data.digitalPresence?.googleMyBusiness?.totalReviews || ''}
                  onChange={(e) => handleInputChange('totalReviews', parseInt(e.target.value) || 0, 'digitalPresence', 'googleMyBusiness')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Número de reseñas"
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-2">Categorías en Google</label>
                <input
                  type="text"
                  value={data.digitalPresence?.googleMyBusiness?.categories?.join(', ') || ''}
                  onChange={(e) => handleInputChange('categories', e.target.value.split(',').map(c => c.trim()).filter(c => c), 'digitalPresence', 'googleMyBusiness')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Restaurante, Comida mexicana, Servicio de entrega, etc. (separar por comas)"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Online Marketplaces */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Marketplaces y Plataformas Online</h3>
        
        {/* Add New Marketplace Form */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-4">Agregar Marketplace</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Plataforma</label>
              <select
                value={newMarketplace.platform}
                onChange={(e) => setNewMarketplace({ ...newMarketplace, platform: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              >
                <option value="">Seleccionar plataforma</option>
                {marketplacePlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL de la Tienda</label>
              <input
                type="url"
                placeholder="https://..."
                value={newMarketplace.storeUrl}
                onChange={(e) => setNewMarketplace({ ...newMarketplace, storeUrl: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMarketplace.isActive}
                  onChange={(e) => setNewMarketplace({ ...newMarketplace, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Activo</span>
              </label>
            </div>
            <div>
              <button
                onClick={addMarketplace}
                disabled={!newMarketplace.platform || !newMarketplace.storeUrl}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Marketplaces List */}
        <div className="space-y-3">
          {(data.digitalPresence?.onlineMarketplaces || []).map((marketplace: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="font-medium">{marketplace.platform}</div>
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                  <a 
                    href={marketplace.storeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm truncate"
                  >
                    {marketplace.storeUrl}
                  </a>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    marketplace.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {marketplace.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeMarketplace(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
        <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
          Presencia Digital Mapeada
        </h3>
        <p className="text-purple-700 dark:text-purple-300 text-sm">
          Esta información ayuda a la IA a crear contenido optimizado para cada canal y plataforma
        </p>
      </div>
    </div>
  );
};

export default PresenceStep;