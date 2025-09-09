import React from 'react';
import { motion } from 'framer-motion';
import { CreativeBrief } from '../../../types/index';
import { TrendingUp, Lightbulb, Tag } from '../../ui/Icons';
import Button from '../../ui/Button';

interface CreativeBriefCardProps {
  brief: CreativeBrief;
  onGenerate: (brief: CreativeBrief) => void;
}

const CreativeBriefCard: React.FC<CreativeBriefCardProps> = ({ brief, onGenerate }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-800 dark:text-white">He investigado un poco. Aquí está el plan:</h4>
      
      <BriefSection icon={<TrendingUp />} title="Tendencia Identificada">
        {brief.identifiedTrend}
      </BriefSection>
      
      <BriefSection icon={<Lightbulb />} title="Ángulo Recomendado">
        {brief.recommendedAngle}
      </BriefSection>
      
      <div>
        <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            <Tag className="w-4 h-4" />
            <span>Hashtags Recomendados</span>
        </h5>
        <div className="flex flex-wrap gap-1">
            {brief.recommendedHashtags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 rounded-full">
                    #{tag}
                </span>
            ))}
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
        <Button size="sm" onClick={() => onGenerate(brief)}>Crear Contenido</Button>
        <Button size="sm" variant="secondary" onClick={() => alert('La función para modificar el plan estará disponible pronto!')}>Modificar Plan</Button>
      </div>
    </div>
  );
};

const BriefSection: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode}> = ({ icon, title, children }) => (
    <div>
        <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {icon}
            <span>{title}</span>
        </h5>
        <p className="text-sm text-gray-800 dark:text-gray-200">{children}</p>
    </div>
)

export default CreativeBriefCard;