import React, { useState } from 'react';
import { SpecialDate, PostContent, Page } from '../../../types/index';
import { Flag, Sparkles } from '../../ui/Icons';
import { aiService } from '../../../services/aiService';
import { useProfile } from '../../../store/profileContext';
import { useAppData } from '../../../store/appDataContext';
import { TEMPLATES } from '../content/TemplateSelector';

interface CalendarSidebarProps {
  onNavigateWithContent: (content: PostContent, page: Page) => void;
}


const MiniCalendar: React.FC = () => {
    // This is a static representation for UI purposes.
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const today = new Date().getDate();
    return (
        <div>
            <h4 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">July 2024</h4>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 text-center text-sm mt-2">
                 {/* Placeholder for days */}
                <span className="text-gray-400">30</span>
                {days.map(day => (
                    <span key={day} className={`w-8 h-8 flex items-center justify-center rounded-full ${day === today ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        {day}
                    </span>
                ))}
            </div>
        </div>
    )
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ onNavigateWithContent }) => {
    const { profile } = useProfile();
    const { specialDates } = useAppData();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSpecialDateClick = async (date: SpecialDate) => {
        setIsLoading(date.name);
        try {
            const generatedContent = await aiService.generateContentForSpecialDate(date.name, profile);
            
            // Find a promo template to get its variables structure
            const promoTemplate = TEMPLATES.find(t => t.id === 'seasonal_promo');
            const initialVariables = promoTemplate ? promoTemplate.variables.reduce((acc, key) => ({ ...acc, [key]: '' }), {}) : {};
            
            const newPostContent: PostContent = {
                structure: generatedContent.structure,
                variables: initialVariables
            };
            onNavigateWithContent(newPostContent, 'Content');
        } catch (error) {
            console.error("Failed to generate content from special date", error);
            alert("Sorry, the AI could not generate content for this event. Please try again.");
        } finally {
            setIsLoading(null);
        }
    };


    return (
        <div className="p-4 h-full space-y-6">
            <MiniCalendar />

            <div className="pt-4 border-t dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Filters</h4>
                <div className="space-y-2 text-sm">
                    <FilterCheckbox label="Scheduled Posts" color="bg-blue-500" />
                    <FilterCheckbox label="Post Ideas" color="bg-yellow-500" />
                    <FilterCheckbox label="Campaigns" color="bg-purple-500" />
                    <FilterCheckbox label="Holidays" color="bg-red-500" />
                </div>
            </div>

             <div className="pt-4 border-t dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming Special Dates</h4>
                <div className="space-y-2">
                    {specialDates.map(date => (
                        <button 
                            key={date.name}
                            onClick={() => handleSpecialDateClick(date)}
                            disabled={!!isLoading}
                            className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-wait group"
                        >
                            <div className="flex items-start gap-3">
                                <Flag className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{date.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(date.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isLoading === date.name ? (
                                        <div className="ai-typing-indicator !-mt-2"><span></span><span></span><span></span></div>
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-primary-500" />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FilterCheckbox: React.FC<{ label: string, color: string }> = ({ label, color }) => (
    <div className="flex items-center">
        <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
        <label className="ml-3 flex items-center text-gray-700 dark:text-gray-300">
            <span className={`w-2 h-2 mr-2 rounded-full ${color}`}></span>
            {label}
        </label>
    </div>
);

export default CalendarSidebar;