import React, { useState } from 'react';
import { EnhancedCustomer, Page, PostContent, AIRecommendedAction } from '../../../types/index';
import Button from '../../ui/Button';
import Textarea from '../../ui/Textarea';
import { Sparkles, Mail, Star, Tag } from '../../ui/Icons';
import { useProfile } from '../../../store/profileContext';
import { aiService } from '../../../services/aiService';
import { TEMPLATES } from '../content/TemplateSelector';
import { motion } from 'framer-motion';

interface CustomerDetailActionsProps {
  customer: EnhancedCustomer;
  onAddNote: (customerId: string, noteText: string) => void;
  onNavigateWithContent: (content: PostContent, page: Page) => void;
  recommendedActions: AIRecommendedAction[];
  isLoading: boolean;
}

const iconMap: { [key: string]: React.ElementType } = {
    Mail, Star, Tag
};


const CustomerDetailActions: React.FC<CustomerDetailActionsProps> = ({ customer, onAddNote, onNavigateWithContent, recommendedActions, isLoading }) => {
    const [newNote, setNewNote] = useState('');
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const { profile } = useProfile();

    const handleAddNote = () => {
        if (newNote.trim()) {
            onAddNote(customer.id, newNote.trim());
            setNewNote('');
        }
    };
    
    const handleActionClick = async (action: AIRecommendedAction) => {
        if (action.actionType === 'generate_communication') {
            setIsGenerating(action.id);
            try {
                const generatedContent = await aiService.generatePersonalizedCommunication(customer, profile, action.prompt);
                
                const promoTemplate = TEMPLATES.find(t => t.id === 'seasonal_promo');
                const initialVariables = promoTemplate ? promoTemplate.variables.reduce((acc, key) => ({ ...acc, [key]: '' }), {}) : {};
                
                const postContent: PostContent = {
                    structure: generatedContent.structure,
                    variables: initialVariables,
                };

                onNavigateWithContent(postContent, 'Content');
            } catch (error) {
                console.error("Failed to generate communication:", error);
                alert("Sorry, the AI could not generate a message for this action.");
            } finally {
                setIsGenerating(null);
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Sparkles className="text-primary-500" />
                    AI Recommended Actions
                </h4>
                {isLoading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                       {recommendedActions.map((action, index) => {
                           const Icon = iconMap[action.icon] || Sparkles;
                           const priorityColor = action.priority === 'high' ? 'border-red-500' : action.priority === 'medium' ? 'border-yellow-500' : 'border-gray-300 dark:border-gray-600';

                           return (
                               <motion.div 
                                    key={action.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 ${priorityColor}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-white">{action.title}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                                            <Button size="sm" className="mt-2" onClick={() => handleActionClick(action)} disabled={!!isGenerating}>
                                                {isGenerating === action.id ? 'Working...' : 'Act'}
                                            </Button>
                                        </div>
                                    </div>
                               </motion.div>
                           )
                       })}
                    </div>
                )}
                 { !isLoading && recommendedActions.length === 0 && (
                     <p className="text-sm text-center text-gray-500 p-4">No specific actions recommended at this time. Great job!</p>
                 )}
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Add an interaction</h4>
                <Textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`Log an interaction with ${customer.personal.firstName}...`}
                    rows={3}
                />
                <Button onClick={handleAddNote} className="mt-2" size="sm" disabled={!newNote.trim()}>Add Note</Button>
            </div>
        </div>
    )
};

export default CustomerDetailActions;