import React from 'react';

interface SwitchProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const Switch: React.FC<SwitchProps> = ({ isChecked, onChange, label }) => {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 pr-4">{label}</label>
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
      </div>
    </div>
  );
};

export default Switch;
