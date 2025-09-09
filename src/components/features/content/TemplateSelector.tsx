import React from 'react';
import { ContentTemplate, TemplateCategory } from '../../../types/index';
import { Tag, BookOpen, Heart, MessageCircle, Megaphone } from '../../ui/Icons';

interface TemplateSelectorProps {
    onSelect: (template: ContentTemplate) => void;
    selectedTemplateId?: string;
}

export const TEMPLATES: ContentTemplate[] = [
    { id: 'flash_sale', name: 'Flash Sale', category: 'promotional', structure: { hook: 'Urgency Hook', body: 'Offer Details', cta: 'Call to Action' }, variables: ['discount', 'product', 'duration'] },
    { id: 'seasonal_promo', name: 'Seasonal Promo', category: 'promotional', structure: { hook: 'Season Reference', body: 'Special Offer', cta: 'Time Limit & Action' }, variables: ['season', 'offer', 'end_date'] },
    { id: 'did_you_know', name: 'Did You Know?', category: 'educational', structure: { question: 'Curious Fact', explanation: 'Valuable Info', connection: 'Link to Business' }, variables: ['fact_topic'] },
    { id: 'tips_tricks', name: 'Tips & Tricks', category: 'educational', structure: { problem: 'Customer Pain Point', solution: 'Practical Tip', extra: 'Bonus Advice' }, variables: ['skill', 'tool'] },
    { id: 'client_story', name: 'Client Story', category: 'storytelling', structure: { setup: 'Emotional Intro', journey: 'Transformation', result: 'Happy Ending' }, variables: ['client_name'] },
    { id: 'behind_scenes', name: 'Behind the Scenes', category: 'storytelling', structure: { intro: 'Invitation', reveal: 'Process/Secret', connection: 'Value for Customer' }, variables: [] },
    { id: 'poll', name: 'Poll', category: 'interactive', structure: { question: 'Engaging Question', options: 'Option A vs Option B' }, variables: ['option_a', 'option_b'] },
    { id: 'new_service', name: 'New Service', category: 'announcement', structure: { excitement: 'Anticipation', details: 'Benefits & How-to', launch: 'Date & Action' }, variables: ['service_name', 'launch_date'] }
];

const CATEGORIES: Record<TemplateCategory, { name: string, icon: React.ElementType }> = {
    promotional: { name: 'Promotional', icon: Tag },
    educational: { name: 'Educational', icon: BookOpen },
    storytelling: { name: 'Storytelling', icon: Heart },
    interactive: { name: 'Interactive', icon: MessageCircle },
    announcement: { name: 'Announcements', icon: Megaphone }
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, selectedTemplateId }) => {
    return (
        <div className="p-4 h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Smart Templates</h3>
            <div className="space-y-4">
                {Object.entries(CATEGORIES).map(([key, { name, icon: Icon }]) => (
                    <div key={key}>
                        <h4 className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            <Icon className="w-4 h-4 mr-2" />
                            {name}
                        </h4>
                        <div className="space-y-1">
                            {TEMPLATES.filter(t => t.category === key).map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelect(template)}
                                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                                        selectedTemplateId === template.id
                                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-200'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {template.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;