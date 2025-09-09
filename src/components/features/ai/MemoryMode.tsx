import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../../../store/profileContext';
import { AILearningFact } from '../../../types/index';
import Label from '../../ui/Label';
import { Check, Store, Palette, Lightbulb, Brain } from '../../ui/Icons';
import { aiService } from '../../../services/aiService';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';

const MemoryMode: React.FC = () => {
    const { profile } = useProfile();
    const [learnedFacts, setLearnedFacts] = useState<AILearningFact[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
    const [answer, setAnswer] = useState('');
    const [isTeaching, setIsTeaching] = useState(false);
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        if (profile) {
            const initialFacts: AILearningFact[] = [
                { id: 'fact-name', text: `Tu negocio se llama "${profile.businessName}".`, source: 'profile' },
                { id: 'fact-industry', text: `Opera en la industria de "${profile.industry}".`, source: 'profile' },
                { id: 'fact-tone', text: `El tono de voz de tu marca es "${profile.brandVoice.tone}".`, source: 'profile' },
            ];
            setLearnedFacts(initialFacts);
            fetchNewQuestion(initialFacts);
        }
    }, [profile]);

    const fetchNewQuestion = useCallback(async (facts: AILearningFact[]) => {
        if (!profile) return;
        setIsLoadingQuestion(true);
        try {
            const question = await aiService.getAILearningQuestion(profile, facts);
            setCurrentQuestion(question);
        } catch (error) {
            console.error("Failed to fetch new question", error);
            setCurrentQuestion("¿Hay algo más que deba saber sobre tu negocio?");
        } finally {
            setIsLoadingQuestion(false);
        }
    }, [profile]);
    
    const handleTeachAI = async () => {
        if (!answer.trim() || !currentQuestion || !profile) return;
        setIsTeaching(true);
        setConfirmation('');
        try {
            const confirmationMessage = await aiService.submitAILearning(currentQuestion, answer);
            const newFact: AILearningFact = {
                id: `fact-${Date.now()}`,
                text: answer,
                source: 'user_taught'
            };
            const updatedFacts = [...learnedFacts, newFact];
            setLearnedFacts(updatedFacts);
            setConfirmation(confirmationMessage);
            setAnswer('');
            setTimeout(() => {
                setConfirmation('');
                fetchNewQuestion(updatedFacts);
            }, 3000);

        } catch (error) {
            console.error("Failed to teach AI", error);
            setConfirmation("Hubo un error al guardar la información. Por favor, inténtalo de nuevo.");
        } finally {
            setIsTeaching(false);
        }
    };


    if (!profile) {
        return <div className="p-4 text-center text-gray-500">Cargando perfil...</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <SettingsCard title="🧠 Centro de Aprendizaje de IA" icon={<Brain/>}>
                {isLoadingQuestion && <p className="text-sm italic text-gray-500">La IA está pensando qué preguntar...</p>}
                {!isLoadingQuestion && currentQuestion && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentQuestion}</p>
                        <Textarea 
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Tu respuesta aquí..."
                            rows={3}
                            disabled={isTeaching || !!confirmation}
                        />
                        <Button onClick={handleTeachAI} disabled={!answer.trim() || isTeaching || !!confirmation}>
                            {isTeaching ? 'Enseñando...' : 'Enseñar a la IA'}
                        </Button>
                        {confirmation && <p className="text-sm text-green-600 dark:text-green-400 animate-fade-in">{confirmation}</p>}
                    </div>
                )}
            </SettingsCard>
            
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 px-2">Registro de Aprendizaje</h4>
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {learnedFacts.map((fact, index) => (
                        <motion.div 
                            key={fact.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                        >
                            <div className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0">
                                {fact.source === 'profile' ? <Store className="w-4 h-4 text-gray-400" /> : <Lightbulb className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{fact.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SettingsCard: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({ title, icon, children }) => (
    <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 px-2">
            {icon} {title}
        </h4>
        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            {children}
        </div>
    </div>
);

export default MemoryMode;