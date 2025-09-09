import React from 'react';
import Modal from '../../ui/Modal';
import { PromptAnalysis } from '../../../types/index';
import Button from '../../ui/Button';
import { Sparkles, Check } from '../../ui/Icons';

interface PromptEnhancementModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysis: PromptAnalysis | null;
    originalPrompt: string;
    onConfirm: (finalPrompt: string) => void;
}

const PromptEnhancementModal: React.FC<PromptEnhancementModalProps> = ({ isOpen, onClose, analysis, originalPrompt, onConfirm }) => {
    return (
        <Modal title="AI Prompt Assistant" isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Let's improve your prompt!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Based on my research, here's a suggestion to get better results.</p>
                </div>

                {analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-y-auto max-h-40">
                            <h4 className="font-semibold mb-2">Your Original Prompt</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{originalPrompt}"</p>
                        </div>
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-500/30 overflow-y-auto max-h-40">
                            <h4 className="font-semibold mb-2 text-primary-800 dark:text-primary-200 flex items-center gap-2"><Sparkles /> AI Suggested Prompt</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{analysis.suggestedPrompt}"</p>
                        </div>
                    </div>
                ) : <div className="text-center p-4">Loading analysis...</div>}

                {analysis && (
                    <div>
                        <h4 className="font-semibold mb-2">Reasoning for Changes</h4>
                        <ul className="space-y-2">
                            {analysis.reasoning.map((reason, index) => (
                                <li key={index} className="flex items-start text-sm">
                                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" variant="secondary" onClick={() => onConfirm(originalPrompt)}>Use My Original</Button>
                    <Button type="button" onClick={() => onConfirm(analysis?.suggestedPrompt || originalPrompt)} disabled={!analysis}>Accept & Generate</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PromptEnhancementModal;