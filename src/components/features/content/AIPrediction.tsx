import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, FileText, Image, Star } from '../../ui/Icons';
import { aiService } from '../../../services/aiService';
import { useProfile } from '../../../store/profileContext';
import { AIPerformancePrediction } from '../../../types/index';

interface AIPredictionProps {
    postText: string;
    imageUrl?: string;
}

const AIPrediction: React.FC<AIPredictionProps> = ({ postText, imageUrl }) => {
    const { profile } = useProfile();
    const [prediction, setPrediction] = useState<AIPerformancePrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (postText.trim().length > 20 && profile) {
                const fetchPrediction = async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                        const result = await aiService.getPerformancePrediction(postText, imageUrl, profile);
                        setPrediction(result);
                    } catch (e) {
                        setError("Could not get AI prediction.");
                        console.error(e);
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchPrediction();
            } else {
                setPrediction(null);
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(handler);
    }, [postText, imageUrl, profile]);

    return (
        <div className="mt-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">AI Performance Prediction</h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg min-h-[220px]">
                {isLoading && <SkeletonLoader />}
                {!isLoading && error && <p className="text-sm text-red-500">{error}</p>}
                {!isLoading && !prediction && !error && (
                    <p className="text-sm text-center text-gray-500 pt-8">Write more content to get an AI analysis.</p>
                )}
                {!isLoading && prediction && (
                    <div className="space-y-4">
                        <ScoreBreakdown scores={prediction.scores} />
                         <div className="space-y-2">
                            <h5 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Suggestions</h5>
                            {[...prediction.suggestions.text, ...prediction.suggestions.visual].filter(s => s).map((sug, i) => (
                                <SuggestionItem key={i} text={sug} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ScoreBreakdown: React.FC<{scores: AIPerformancePrediction['scores']}> = ({ scores }) => (
    <div className="space-y-3">
        <ScoreBar label="Text Quality" score={scores.text} icon={<FileText className="w-4 h-4" />} />
        <ScoreBar label="Visual Appeal" score={scores.visual} icon={<Image className="w-4 h-4" />} />
        <ScoreBar label="CTA Clarity" score={scores.cta} icon={<Star className="w-4 h-4" />} />
    </div>
);

const ScoreBar: React.FC<{label: string, score: number, icon: React.ReactNode}> = ({ label, score, icon }) => {
    const getScoreColor = (s: number) => {
        if (s > 75) return 'bg-green-500';
        if (s > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <div className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-300">
                    {icon} {label}
                </div>
                <span className="font-bold">{score}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <motion.div
                    className={`h-1.5 rounded-full ${getScoreColor(score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}


const SkeletonLoader = () => (
    <div className="animate-pulse space-y-3">
        <ScoreBarSkeleton />
        <ScoreBarSkeleton />
        <ScoreBarSkeleton />
        <div className="pt-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mt-1"></div>
        </div>
    </div>
);

const ScoreBarSkeleton = () => (
    <div className="space-y-1">
         <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
        </div>
        <div className="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
);

const SuggestionItem: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-start gap-2 text-xs">
        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-gray-600 dark:text-gray-300">{text}</p>
    </div>
);

export default AIPrediction;