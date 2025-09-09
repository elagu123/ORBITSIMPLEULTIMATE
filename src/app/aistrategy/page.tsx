import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { AICampaignPlan } from '../../types/index';
import { useProfile } from '../../store/profileContext';
import { aiService } from '../../services/aiService';
import { Sparkles, Brain, CheckCircle, Lightbulb } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AICampaignPlanCard from '../../components/features/aistrategy/AICampaignPlanCard';
import DataFlywheelWidget from '../../components/features/aistrategy/DataFlywheelWidget';

type ViewState = 'idle' | 'loading' | 'plan_ready';

const SuggestedPrompts: React.FC<{ onSelect: (prompt: string) => void }> = ({ onSelect }) => {
    const prompts = [
        "Lanzar una promo 2x1 en cafés para la próxima semana.",
        "Atraer nuevos clientes para el servicio de manicura.",
        "Celebrar nuestro aniversario con un sorteo en Instagram.",
        "Promocionar nuestro nuevo tratamiento capilar."
    ];
    return (
        <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">O prueba con una sugerencia:</h4>
            <div className="flex flex-wrap gap-2">
                {prompts.map(p => (
                    <button key={p} onClick={() => onSelect(p)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                        {p}
                    </button>
                ))}
            </div>
        </div>
    )
};

const AIStrategyPage: React.FC = () => {
    const { profile } = useProfile();
    const [prompt, setPrompt] = useState('');
    const [viewState, setViewState] = useState<ViewState>('idle');
    const [campaignPlan, setCampaignPlan] = useState<AICampaignPlan | null>(null);

    const handleGeneratePlan = async () => {
        if (!prompt || !profile) return;
        setViewState('loading');
        setCampaignPlan(null);
        try {
            const plan = await aiService.generateAICampaignPlan(prompt, profile);
            setCampaignPlan(plan);
            setViewState('plan_ready');
        } catch (error) {
            console.error("Failed to generate campaign plan:", error);
            alert("Sorry, the AI could not generate a campaign plan. Please try a different goal.");
            setViewState('idle');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3"><Brain /> Centro de Comando y Estrategia de IA</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Define tus objetivos y deja que la IA cree y orqueste campañas completas por ti.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Input & Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">1. Define tu Objetivo</h2>
                        <p className="text-sm text-gray-500 mb-4">Describe la campaña que quieres lanzar. La IA se encargará del resto.</p>
                        <div className="space-y-3">
                            <Input 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ej: Lanzar una promo para el Día de la Madre"
                                disabled={viewState === 'loading'}
                            />
                            <SuggestedPrompts onSelect={setPrompt} />
                             <Button onClick={handleGeneratePlan} disabled={!prompt || viewState === 'loading'} className="w-full mt-4">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {viewState === 'loading' ? 'Generando Estrategia...' : 'Generar Plan de Campaña'}
                            </Button>
                        </div>
                    </div>
                    <DataFlywheelWidget />
                     <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-3">Rendimiento de la IA</h3>
                        <div className="space-y-3">
                            <AIPerformanceStat icon={CheckCircle} label="Contenidos Generados" value={128} />
                            <AIPerformanceStat icon={Lightbulb} label="Insights Descubiertos" value={42} />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Plan Display */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={viewState}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {viewState === 'idle' && <IdleState />}
                            {viewState === 'loading' && <LoadingState />}
                            {viewState === 'plan_ready' && campaignPlan && (
                                <AICampaignPlanCard plan={campaignPlan} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const AIPerformanceStat: React.FC<{icon: React.ElementType, label: string, value: number}> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Icon className="w-5 h-5 text-gray-400"/>
            <span>{label}</span>
        </div>
        <span className="font-bold text-gray-800 dark:text-white">{value}</span>
    </div>
);

const IdleState = () => (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md mb-4">
            <Sparkles className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold">Tu lienzo estratégico</h2>
        <p className="text-gray-500 mt-2">El plan de campaña generado por la IA aparecerá aquí, listo para tu revisión y aprobación.</p>
    </div>
);

const LoadingState = () => (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8">
        <div className="animate-pulse">
            <Sparkles className="w-12 h-12 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold mt-4">La IA está pensando...</h2>
        <p className="text-gray-500 mt-2">Analizando tu audiencia, creando contenido y planificando el calendario perfecto.</p>
    </div>
);


export default AIStrategyPage;