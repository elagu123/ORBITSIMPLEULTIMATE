import React, { TextareaHTMLAttributes } from 'react';

const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  );
};

export default Textarea;