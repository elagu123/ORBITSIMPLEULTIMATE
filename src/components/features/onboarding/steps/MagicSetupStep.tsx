import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile, PartialBusinessProfile } from '../../../../types/index';
import Label from '../../../ui/Label';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { Check, Link, WhatsAppIcon } from '../../../ui/Icons';
import { motion } from 'framer-motion';

interface Props {
  data: PartialBusinessProfile;
  updateData: (data: Partial<BusinessProfile>) => void;
  onStart: () => void;
}

const MagicSetupStep: React.FC<Props> = ({ data, updateData }) => {
  const [connectedSources, setConnectedSources] = useState<Set<string>>(new Set());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const toggleSource = (source: string) => {
    setConnectedSources(prev => {
        const newSet = new Set(prev);
        if (newSet.has(source)) {
            newSet.delete(source);
        } else {
            newSet.add(source);
        }
        return newSet;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">The Magic Setup ✨</h2>
        <p className="text-gray-600 dark:text-gray-400">
            Just give us the basics. Our AI will analyze your business name, industry, and any connected sources to create a complete marketing profile for you in seconds.
        </p>
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            value={data.businessName || ''}
            onChange={handleChange}
            placeholder="e.g., The Corner Cafe"
            className="!text-lg !py-2"
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select
            id="industry"
            name="industry"
            value={data.industry || 'services'}
            onChange={handleChange}
            className="!text-lg !py-2"
          >
            <option value="restaurant">Restaurant</option>
            <option value="retail">Retail</option>
            <option value="beauty">Beauty</option>
            <option value="fitness">Fitness</option>
            <option value="healthcare">Healthcare</option>
            <option value="services">Professional Services</option>
            <option value="other">Other</option>
          </Select>
        </div>
      </div>
       <div className="space-y-6">
           <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Connect Sources (Optional)</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Connect these sources to give our AI more context for an even better setup. (This is a simulation).</p>
           <div className="space-y-3">
               <SourceButton 
                label="Connect WhatsApp Business"
                icon={<WhatsAppIcon />}
                isConnected={connectedSources.has('whatsapp')}
                onClick={() => toggleSource('whatsapp')}
               />
               <SourceButton 
                label="Connect Google My Business"
                icon={<Link />}
                isConnected={connectedSources.has('gmb')}
                onClick={() => toggleSource('gmb')}
               />
           </div>
       </div>
    </div>
  );
};

const SourceButton: React.FC<{label: string, icon: React.ReactNode, isConnected: boolean, onClick: () => void}> = ({ label, icon, isConnected, onClick }) => {
    return (
        <motion.button 
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${isConnected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'}`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-semibold">{label}</span>
            </div>
            {isConnected && <Check className="w-6 h-6 text-green-500" />}
        </motion.button>
    )
}

export default MagicSetupStep;