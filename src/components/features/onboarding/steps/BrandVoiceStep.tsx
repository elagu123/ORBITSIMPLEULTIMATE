import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile } from '../../../../types/index';
import Label from '../../../ui/Label';
import Select from '../../../ui/Select';
import Input from '../../../ui/Input';

interface Props {
  data: Partial<BusinessProfile>;
  updateData: (data: Partial<BusinessProfile>) => void;
}

const BrandVoiceStep: React.FC<Props> = ({ data, updateData }) => {
  const [currentValue, setCurrentValue] = useState('');
  
  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateData({
      brandVoice: {
        ...data.brandVoice!,
        tone: e.target.value as BusinessProfile['brandVoice']['tone'],
      },
    });
  };

  const handleAddValue = () => {
    if (currentValue && !data.brandVoice?.values.includes(currentValue)) {
      updateData({
        brandVoice: {
          ...data.brandVoice!,
          values: [...data.brandVoice!.values, currentValue],
        },
      });
      setCurrentValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    updateData({
      brandVoice: {
        ...data.brandVoice!,
        values: data.brandVoice!.values.filter(v => v !== valueToRemove),
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Define Your Brand's Voice</h2>
      <p className="text-gray-600 dark:text-gray-400">This helps the AI match your communication style.</p>
      
      <div>
        <Label htmlFor="tone">What is your brand's overall tone?</Label>
        <Select
          id="tone"
          name="tone"
          value={data.brandVoice?.tone || 'friendly'}
          onChange={handleToneChange}
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="friendly">Friendly</option>
          <option value="authoritative">Authoritative</option>
          <option value="playful">Playful</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="values">List a few of your brand values (e.g., Quality, Innovation, Community)</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="values"
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddValue(); } }}
            placeholder="Type a value and press Enter"
          />
          <button type="button" onClick={handleAddValue} className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
            {data.brandVoice?.values.map(value => (
                <span key={value} className="flex items-center bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                    {value}
                    <button onClick={() => handleRemoveValue(value)} className="ml-1.5 text-primary-500 hover:text-primary-700">&times;</button>
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BrandVoiceStep;