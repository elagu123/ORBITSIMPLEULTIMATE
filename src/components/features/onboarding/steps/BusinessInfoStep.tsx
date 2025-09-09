import React from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile } from '../../../../types/index';
import Label from '../../../ui/Label';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';

interface Props {
  data: Partial<BusinessProfile>;
  updateData: (data: Partial<BusinessProfile>) => void;
}

const BusinessInfoStep: React.FC<Props> = ({ data, updateData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tell us about your business</h2>
      <div>
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          name="businessName"
          value={data.businessName || ''}
          onChange={handleChange}
          placeholder="e.g., The Corner Cafe"
        />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select
          id="industry"
          name="industry"
          value={data.industry || 'services'}
          onChange={handleChange}
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
  );
};

export default BusinessInfoStep;