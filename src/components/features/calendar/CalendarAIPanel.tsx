import React, { useState } from 'react';
import { OptimalTimeSlot, ContentGapSuggestion, CalendarContentSuggestion, CalendarEvent } from '../../../types/index';
import Button from '../../ui/Button';
import { Sparkles, Lightbulb, Clock } from '../../ui/Icons';
import { aiService } from '../../../services/aiService';
import { useOptimizedAppData } from '../../../store/optimized/appDataContext';
import { useProfile } from '../../../store/profileContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarAIPanelProps {
    onSuggestions: (slots: OptimalTimeSlot[]) => void;
    onAddDraft: (event: CalendarEvent) => void;
    optimalTimes: OptimalTimeSlot[];
}

const CalendarAIPanel: React.FC<CalendarAIPanelProps> = ({ onSuggestions, onAddDraft, optimalTimes }) => {
    const { calendarEvents, specialDates } = useOptimizedAppData();
    const { profile } = useProfile();
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);
    const [isLoadingGaps, setIsLoadingGaps] = useState(false);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
    const [isDrafting, setIsDrafting] = useState<string | null>(null);
    const [gapSuggestions, setGapSuggestions] = useState<ContentGapSuggestion[]>([]);
    const [contentIdeas, setContentIdeas] = useState<CalendarContentSuggestion[]>([]);

    const handleFindOptimalTimes = async () => {
        setIsLoadingTimes(true);
        try {
            const times = await aiService.getOptimalPostingTimes(calendarEvents);
            onSuggestions(times);
        } catch (error) {
            console.error(error);
            alert("Could not fetch optimal times.");
        } finally {
            setIsLoadingTimes(false);
        }
    };

    const handleFindGaps = async () => {
        setIsLoadingGaps(true);
        setGapSuggestions([]);
        try {
            const gaps = await aiService.findContentGaps(calendarEvents);
            setGapSuggestions(gaps);
        } catch (error) {
            console.error(error);
            alert("Could not find content gaps.");
        } finally {
            setIsLoadingGaps(false);
        }
    };

    const handleGenerateIdeas = async () => {
        if (!profile) return;
        setIsLoadingIdeas(true);
        setContentIdeas([]);
        try {
            const ideas = await aiService.generateCalendarContentIdeas(specialDates, optimalTimes, profile);
            setContentIdeas(ideas);
        } catch (error) {
            console.error(error);
            alert("Could not generate content ideas.");
        } finally {
            setIsLoadingIdeas(false);
        }
    };

    const handleGenerateDraft = async (idea: CalendarContentSuggestion) => {
        if (!profile) return;
        setIsDrafting(idea.id);
        try {
            const content = await aiService.generatePostText(idea.prompt, profile.brandVoice.tone, profile);
            const fullText = Object.values(content).join('\n\n');
            const newEvent: CalendarEvent = {
                id: `draft-${Date.now()}`,
                title: `DRAFT: ${idea.title}`,
                date: idea.suggestedDate,
                time: optimalTimes.length > 0 ? optimalTimes[0].time.split(' at ')[1] : '10:00', // Use first optimal time or default
                type: 'post_idea',
                status: 'draft',
                content: fullText,
            };
            onAddDraft(newEvent);
        } catch (error) {
            console.error("Failed to generate draft", error);
            alert("Failed to generate draft from idea.");
        } finally {
            setIsDrafting(null);
        }
    };
    
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Sparkles className="text-primary-500" />
                    AI Calendar Co-pilot
                </h4>
            </div>
            <div className="space-y-2">
                <Button onClick={handleFindOptimalTimes} disabled={isLoadingTimes} size="sm" variant="secondary" className="w-full">
                    <Clock className="w-4 h-4 mr-2" />
                    {isLoadingTimes ? 'Analyzing...' : 'Find Optimal Times'}
                </Button>
                <Button onClick={handleFindGaps} disabled={isLoadingGaps} size="sm" variant="secondary" className="w-full">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {isLoadingGaps ? 'Searching...' : 'Suggest Content for Gaps'}
                </Button>
                <Button onClick={handleGenerateIdeas} disabled={isLoadingIdeas} size="sm" variant="secondary" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoadingIdeas ? 'Ideating...' : 'Generate Content Ideas'}
                </Button>
            </div>
            
            <AnimatePresence>
                {gapSuggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2"
                    >
                        <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Content Gap Suggestions:</h5>
                        {gapSuggestions.map((gap, index) => (
                            <div key={index} className="p-2 text-xs bg-gray-100 dark:bg-gray-700/50 rounded-md">
                                <p className="font-bold">{new Date(gap.date).toLocaleDateString('en-us', { weekday: 'long' })}:</p>
                                <p>{gap.idea}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {contentIdeas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2"
                    >
                        <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400">New Content Ideas:</h5>
                        {contentIdeas.map((idea, index) => (
                            <div key={index} className="p-3 text-xs bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                <p className="font-bold text-sm">{idea.title}</p>
                                <p className="text-gray-500 dark:text-gray-400 my-1">{idea.reason}</p>
                                <Button size="sm" onClick={() => handleGenerateDraft(idea)} disabled={!!isDrafting}>
                                    {isDrafting === idea.id ? 'Drafting...' : 'Generate Draft'}
                                </Button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarAIPanel;