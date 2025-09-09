import React, { useState } from 'react';
import { BusinessProfile } from '../../../types/index';
import { SettingsCard } from '../../../app/settings/page';
import Label from '../../ui/Label';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';

interface AIStrategySettingsProps {
  formData: BusinessProfile;
  setFormData: React.Dispatch<React.SetStateAction<BusinessProfile | null>>;
}

const AIStrategySettings: React.FC<AIStrategySettingsProps> = ({ formData, setFormData }) => {

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        if (!prev) return null;
        return { ...prev, aiStrategy: { ...prev.aiStrategy, brandVoiceSpectrums: { ...prev.aiStrategy.brandVoiceSpectrums, [name]: parseFloat(value) } } };
    });
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        if (!prev) return null;
        return { ...prev, aiStrategy: { ...prev.aiStrategy, targetAudience: { ...prev.aiStrategy.targetAudience, [name]: value } } };
    });
  };
  
    const handleKeywordsChange = (type: 'primaryKeywords' | 'secondaryKeywords', keywords: string[]) => {
        setFormData(prev => {
            if (!prev) return null;
            return { ...prev, aiStrategy: { ...prev.aiStrategy, seoGuidelines: { ...prev.aiStrategy.seoGuidelines, [type]: keywords }}};
        });
    };

  return (
    <div className="space-y-6">
        <SettingsCard title="Brand Voice & Personality">
            <div className="space-y-4">
                <Slider 
                    label="Tono" 
                    name="formalVsCasual"
                    value={formData.aiStrategy.brandVoiceSpectrums.formalVsCasual} 
                    onChange={handleSliderChange}
                    minLabel="Casual"
                    maxLabel="Formal"
                />
                <Slider 
                    label="Humor" 
                    name="seriousVsHumorous"
                    value={formData.aiStrategy.brandVoiceSpectrums.seriousVsHumorous} 
                    onChange={handleSliderChange}
                    minLabel="Serio"
                    maxLabel="Humorístico"
                />
                <Slider 
                    label="Energía" 
                    name="calmVsEnthusiastic"
                    value={formData.aiStrategy.brandVoiceSpectrums.calmVsEnthusiastic} 
                    onChange={handleSliderChange}
                    minLabel="Calmado"
                    maxLabel="Entusiasta"
                />
                 <div>
                    <Label htmlFor="brandArchetype">Arquetipo de Marca</Label>
                    <Select id="brandArchetype" name="brandArchetype" value={formData.aiStrategy.brandArchetype} onChange={(e) => setFormData(p => p && ({...p, aiStrategy: {...p.aiStrategy, brandArchetype: e.target.value as any}}))}>
                        <option value="everyman">The Everyman (Relatable)</option>
                        <option value="sage">The Sage (Wise)</option>
                        <option value="explorer">The Explorer (Adventurous)</option>
                        <option value="hero">The Hero (Brave)</option>
                         <option value="creator">The Creator (Imaginative)</option>
                        <option value="ruler">The Ruler (Authoritative)</option>
                        <option value="lover">The Lover (Passionate)</option>
                        <option value="jester">The Jester (Playful)</option>
                    </Select>
                </div>
            </div>
        </SettingsCard>

        <SettingsCard title="Público Objetivo">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="audienceDescription">Descripción del Público</Label>
                    <Textarea id="audienceDescription" name="description" value={formData.aiStrategy.targetAudience.description} onChange={handleAudienceChange} rows={3} placeholder="Ej: Mujeres de 25-40 años interesadas en bienestar y productos sostenibles."/>
                </div>
                 <div>
                    <Label htmlFor="audiencePainPoints">Puntos de Dolor</Label>
                    <Textarea id="audiencePainPoints" name="painPoints" value={formData.aiStrategy.targetAudience.painPoints} onChange={handleAudienceChange} rows={3} placeholder="Ej: Falta de tiempo para el autocuidado, dificultad para encontrar productos naturales."/>
                </div>
            </div>
        </SettingsCard>
        
        <SettingsCard title="Guía SEO">
            <div className="space-y-4">
                <div>
                    <Label>Palabras Clave Primarias</Label>
                    <TagInput
                        tags={formData.aiStrategy.seoGuidelines.primaryKeywords}
                        onTagsChange={(tags) => handleKeywordsChange('primaryKeywords', tags)}
                        placeholder="Añadir palabra clave principal..."
                    />
                </div>
                <div>
                    <Label>Palabras Clave Secundarias</Label>
                    <TagInput
                        tags={formData.aiStrategy.seoGuidelines.secondaryKeywords}
                        onTagsChange={(tags) => handleKeywordsChange('secondaryKeywords', tags)}
                        placeholder="Añadir palabra clave secundaria..."
                    />
                </div>
            </div>
        </SettingsCard>
    </div>
  );
};

const Slider: React.FC<{label: string, name: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, minLabel: string, maxLabel: string}> = 
({ label, name, value, onChange, minLabel, maxLabel }) => (
    <div>
        <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
        <input 
            id={name}
            name={name}
            type="range" 
            min="0" max="1" 
            step="0.1" 
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-primary-500"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

const TagInput: React.FC<{tags: string[], onTagsChange: (tags: string[]) => void, placeholder: string}> = ({ tags, onTagsChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onTagsChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1.5 text-primary-500 hover:text-primary-700">&times;</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent focus:outline-none text-sm"
                />
            </div>
        </div>
    );
};


export default AIStrategySettings;