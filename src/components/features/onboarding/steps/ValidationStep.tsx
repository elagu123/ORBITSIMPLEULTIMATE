import React from 'react';
import { BusinessProfile, PartialBusinessProfile } from '../../../../types/index';
import Label from '../../../ui/Label';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Checkbox from '../../../ui/Checkbox';
import Textarea from '../../../ui/Textarea';
import { AlertTriangle } from '../../../ui/Icons';

interface Props {
  data: PartialBusinessProfile;
  updateData: (value: React.SetStateAction<PartialBusinessProfile>) => void;
  error: string;
}

const ValidationStep: React.FC<Props> = ({ data, updateData, error }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    const val = e.target.type === 'range' ? parseFloat(value) : value;

    updateData(prev => {
        if (!prev) return prev;
        
        if (keys.length === 3) { // e.g., aiStrategy.brandVoiceSpectrums.formalVsCasual
            const [key1, key2, key3] = keys as [keyof PartialBusinessProfile, string, string];
            const prevKey1 = prev[key1] as any;
            return {
                ...prev,
                [key1]: {
                    ...prevKey1,
                    [key2]: {
                        ...prevKey1[key2],
                        [key3]: val
                    }
                }
            };
        }
        
        if (keys.length === 2) { // e.g., aiStrategy.targetAudience.description
            const [key1, key2] = keys as [keyof PartialBusinessProfile, string];
            return {
                ...prev,
                [key1]: {
                    ...(prev[key1] as any),
                    [key2]: val
                }
            };
        }
        
        // keys.length === 1, e.g., businessName
        return {
            ...prev,
            [name]: val,
        };
    });
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // FIX: Ensure the marketingGoals object is always complete to satisfy the type.
    updateData(prev => ({
        ...prev,
        marketingGoals: {
            increaseSales: prev?.marketingGoals?.increaseSales || false,
            buildBrandAwareness: prev?.marketingGoals?.buildBrandAwareness || false,
            customerRetention: prev?.marketingGoals?.customerRetention || false,
            leadGeneration: prev?.marketingGoals?.leadGeneration || false,
            [name]: checked,
        },
    }));
  };
  
  const handleTagChange = (type: 'wordsToUse' | 'wordsToAvoid' | 'primaryKeywords' | 'secondaryKeywords', tags: string[]) => {
      const [section, field] = type.includes('Keywords') ? ['seoGuidelines', type] : ['keyTerminology', type];
      updateData(prev => ({
          ...prev,
          aiStrategy: {
              ...prev!.aiStrategy!,
              [section]: {
                  // @ts-ignore
                  ...prev!.aiStrategy[section],
                  [field]: tags
              }
          }
      }));
  };


  if (!data.aiStrategy) { // Fallback if AI fails completely
      return <p>Loading or AI Error...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">3. Review & Refine</h2>
      <p className="text-gray-600 dark:text-gray-400">
        The AI has created a starting profile for you. Check it over and make any adjustments you'd like.
      </p>

      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"/>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">{error}</p>
        </div>
      )}

      {/* Business Profile Section */}
      <h3 className="text-xl font-semibold border-b pb-2 dark:border-gray-700">Business Profile</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" value={data.businessName} onChange={handleInputChange} />
        </div>
        <div>
            <Label htmlFor="industry">Industry</Label>
            <Select id="industry" name="industry" value={data.industry} onChange={handleInputChange}>
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

       <Label>Marketing Goals</Label>
      <div className="grid grid-cols-2 gap-4">
        <Checkbox id="increaseSales" name="increaseSales" label="Increase Sales" checked={data.marketingGoals?.increaseSales} onChange={handleGoalChange} />
        <Checkbox id="buildBrandAwareness" name="buildBrandAwareness" label="Build Brand Awareness" checked={data.marketingGoals?.buildBrandAwareness} onChange={handleGoalChange} />
        <Checkbox id="customerRetention" name="customerRetention" label="Improve Retention" checked={data.marketingGoals?.customerRetention} onChange={handleGoalChange} />
        <Checkbox id="leadGeneration" name="leadGeneration" label="Generate Leads" checked={data.marketingGoals?.leadGeneration} onChange={handleGoalChange} />
      </div>

      {/* AI Strategy Section */}
      <h3 className="text-xl font-semibold border-b pb-2 dark:border-gray-700 pt-4">AI Strategy</h3>
       <div>
            <Label htmlFor="audienceDescription">Target Audience Description</Label>
            <Textarea id="audienceDescription" name="aiStrategy.targetAudience.description" value={data.aiStrategy.targetAudience.description} onChange={handleInputChange} rows={3}/>
        </div>
        <div>
            <Label>Primary Keywords</Label>
            <TagInput tags={data.aiStrategy.seoGuidelines.primaryKeywords} onTagsChange={(tags) => handleTagChange('primaryKeywords', tags)} placeholder="Add primary keyword..."/>
        </div>
    </div>
  );
};

const TagInput: React.FC<{tags: string[], onTagsChange: (tags: string[]) => void, placeholder: string}> = ({ tags, onTagsChange, placeholder }) => {
    const [inputValue, setInputValue] = React.useState('');

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

export default ValidationStep;