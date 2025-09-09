import React from 'react';

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
}

const Toggle: React.FC<ToggleProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors
            ${
              value === option.value
                ? 'bg-white dark:bg-gray-800 text-primary-500 shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Toggle;