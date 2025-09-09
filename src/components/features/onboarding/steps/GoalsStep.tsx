import React from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile } from '../../../../types/index';
import Checkbox from '../../../ui/Checkbox';

interface Props {
  data: Partial<BusinessProfile>;
  updateData: (data: Partial<BusinessProfile>) => void;
}

const GoalsStep: React.FC<Props> = ({ data, updateData }) => {
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateData({
      ...data,
      marketingGoals: {
        ...data.marketingGoals!,
        [name]: checked,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">What are your main marketing goals?</h2>
      <p className="text-gray-600 dark:text-gray-400">Select all that apply. This helps the AI focus on what matters most to you.</p>
      <div className="space-y-4">
        <Checkbox
          id="increaseSales"
          name="increaseSales"
          label="Increase Sales & Revenue"
          checked={data.marketingGoals?.increaseSales}
          onChange={handleGoalChange}
        />
        <Checkbox
          id="buildBrandAwareness"
          name="buildBrandAwareness"
          label="Build Brand Awareness"
          checked={data.marketingGoals?.buildBrandAwareness}
          onChange={handleGoalChange}
        />
        <Checkbox
          id="customerRetention"
          name="customerRetention"
          label="Improve Customer Retention"
          checked={data.marketingGoals?.customerRetention}
          onChange={handleGoalChange}
        />
        <Checkbox
          id="leadGeneration"
          name="leadGeneration"
          label="Generate More Leads"
          checked={data.marketingGoals?.leadGeneration}
          onChange={handleGoalChange}
        />
      </div>
    </div>
  );
};

export default GoalsStep;