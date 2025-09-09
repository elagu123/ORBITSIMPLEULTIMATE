import React from 'react';
import { useProfile } from '../../../store/profileContext';
import { aiService } from '../../../services/aiService';
import { Brain, Users, TrendingUp, Check, Lightbulb } from '../../ui/Icons';
import Switch from '../../ui/Switch';
// FIX: Corrected import path for types to point to the new single source of truth.
import { CollectiveInsight } from '../../../types/index';

const DataFlywheelWidget: React.FC = () => {
    const { profile } = useProfile();
    const [insights, setInsights] = React.useState<CollectiveInsight[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isContributing, setIsContributing] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (profile) {
            setIsLoading(true);
            setError(null);
            aiService.getCollectiveInsights(profile)
                .then(setInsights)
                .catch((err: any) => {
                    console.error("Error fetching collective insights:", err);
                    const errorMessage = (err.message || String(err)).toLowerCase();
                    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                        setError("AI is cooling down. Insights are temporarily unavailable.");
                    } else {
                        setError("Could not load insights.");
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [profile]);
    
    const insightIcons: Record<CollectiveInsight['source'], React.ElementType> = {
        promociones: Check,
        horarios: TrendingUp,
        tono: Lightbulb,
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain /> IA Colectiva (Data Flywheel)
            </h2>
            
            {/* Visual Representation */}
            <div className="my-4 flex items-center justify-around text-center text-xs text-gray-500 dark:text-gray-400">
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center"><Users className="w-6 h-6 text-primary-500"/></div>
                    <p>Negocios Similares</p>
                </div>
                <div className="text-gray-300 dark:text-gray-600 font-mono">&lt;---&gt;</div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"><Brain className="w-6 h-6 text-green-500"/></div>
                    <p>IA Mejorada</p>
                </div>
                 <div className="text-gray-300 dark:text-gray-600 font-mono">&lt;---&gt;</div>
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Users className="w-6 h-6 text-gray-500"/></div>
                    <p>Tu Negocio</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Tu IA aprende de los datos anónimos de negocios como el tuyo para darte mejores recomendaciones.
            </p>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3 min-h-[112px]">
                <h4 className="text-sm font-semibold">Aprendizajes Recientes de la Red:</h4>
                {isLoading ? (
                    <div className="text-sm text-gray-500">Cargando insights...</div>
                ) : error ? (
                    <div className="text-sm text-red-500">{error}</div>
                ) : insights.length > 0 ? (
                    insights.map((insight, index) => {
                        const Icon = insightIcons[insight.source] || Lightbulb;
                        return (
                             <div key={index} className="flex items-start gap-2 text-xs">
                                <Icon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{insight.text}</span>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-sm text-gray-500">No new insights from the network right now.</div>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <Switch 
                    isChecked={isContributing} 
                    onChange={setIsContributing}
                    label="Contribuir datos anónimos a la IA Colectiva"
                />
            </div>
        </div>
    );
};
export default DataFlywheelWidget;