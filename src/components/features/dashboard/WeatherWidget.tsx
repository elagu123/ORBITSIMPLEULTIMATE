import React from 'react';
import { motion } from 'framer-motion';
import { useWeatherSuggestion } from '../../../hooks/useWeatherSuggestion';
import { Sun, Lightbulb } from '../../ui/Icons';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const WeatherWidget: React.FC = () => {
  const { suggestion, isLoading, weather } = useWeatherSuggestion();

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gradient-to-br from-blue-400 to-primary-500 p-6 rounded-lg shadow-lg text-white"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Today's Weather</h3>
          <p className="text-sm opacity-90">Marketing Opportunity</p>
        </div>
        <div className="text-right flex items-center gap-3">
           <p className="font-bold text-3xl">{weather.temp}°C</p>
           <Sun className="w-10 h-10 drop-shadow-lg" />
        </div>
      </div>
      <div className="bg-white/20 p-4 rounded-md">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
          {isLoading ? (
            <div className="space-y-2 w-full animate-pulse">
              <div className="h-3 bg-white/40 rounded w-3/4"></div>
              <div className="h-3 bg-white/40 rounded w-full"></div>
            </div>
          ) : (
            <p className="text-sm font-medium">{suggestion}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
