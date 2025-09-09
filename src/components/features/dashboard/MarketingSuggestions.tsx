import React from 'react';
import { useMarketingSuggestion } from '../../../hooks/useMarketingSuggestion';
import { motion } from 'framer-motion';

// A safe markdown component that renders React elements instead of using dangerouslySetInnerHTML
const parseInlineFormatting = (text: string) => {
  // Split by bold and italic markers, keeping the delimiters
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const Markdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
      {lines.map((line, index) => {
        if (line.trim().startsWith('* ')) {
          return (
            <ul key={index} className="list-disc pl-5">
              <li className="my-1">{parseInlineFormatting(line.substring(2))}</li>
            </ul>
          );
        }
        return <p key={index} className="my-1">{parseInlineFormatting(line)}</p>;
      })}
    </div>
  );
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const MarketingSuggestions: React.FC = () => {
  const { suggestion, isLoading, error, refetch } = useMarketingSuggestion();

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon />
            <span className="ml-2">AI Marketing Tip</span>
          </h3>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          aria-label="Refresh suggestion"
          className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshIcon isLoading={isLoading} />
        </button>
      </div>

      <div className="flex-grow">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ) : (
          <Markdown content={suggestion} />
        )}
        {error && <p className="text-xs text-red-500 mt-2">Error: Could not load suggestion.</p>}
      </div>
    </motion.div>
  );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12.586 2.586a2 2 0 012.828 0L16 3.172a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828-2.828l1.414-1.414zM16 9.172a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828-2.828L13.172 9.172a2 2 0 012.828 0z" clipRule="evenodd" />
    </svg>
);

const RefreshIcon = ({ isLoading }: { isLoading: boolean }) => (
    <svg 
        className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
    >
        <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.944 12.972a9 9 0 11-1.27-5.232M21 4v5h-5" 
        />
    </svg>
);

export default MarketingSuggestions;