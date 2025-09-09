import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import { ContentVariation } from '../../../types/index';
import { aiService } from '../../../services/aiService';
import { useProfile } from '../../../store/profileContext';
import Button from '../../ui/Button';
import { Copy } from '../../ui/Icons';

interface ContentVariationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalText: string;
    onApplyVariation: (text: string) => void;
}

const ContentVariationsModal: React.FC<ContentVariationsModalProps> = ({ isOpen, onClose, originalText, onApplyVariation }) => {
    const { profile } = useProfile();
    const [variations, setVariations] = useState<ContentVariation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && originalText && profile) {
            const fetchVariations = async () => {
                setIsLoading(true);
                setError(null);
                setVariations([]);
                try {
                    const result = await aiService.generateContentVariations(originalText, profile);
                    setVariations(result);
                } catch (e) {
                    setError('Failed to generate variations.');
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchVariations();
        }
    }, [isOpen, originalText, profile]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <Modal title="AI Content Variations" isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                {isLoading && <SkeletonLoader />}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && variations.map((variation, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{variation.tone}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{variation.text}</p>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => onApplyVariation(variation.text)}>Apply This Version</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleCopy(variation.text, index)}>
                                <Copy className="w-4 h-4 mr-2" />
                                {copiedIndex === index ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mt-2"></div>
            </div>
        ))}
    </div>
);

export default ContentVariationsModal;