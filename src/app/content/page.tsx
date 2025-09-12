import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { ComponentErrorBoundary } from '../../components/ui/ErrorBoundaries';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { ContentTemplate, PostContent, PromptAnalysis } from '../../types/index';
import TemplateSelector, { TEMPLATES } from '../../components/features/content/TemplateSelector';
import ContentEditor from '../../components/features/content/ContentEditor';
import ContentPreview from '../../components/features/content/ContentPreview';
import AIPrediction from '../../components/features/content/AIPrediction';
import { useGamification } from '../../store/gamificationContext';
import PublishingPanel from '../../components/features/content/PublishingPanel';
// Lazy load heavy components and modals for better performance
const AdvancedContentGenerator = React.lazy(() => import('../../components/features/content/AdvancedContentGenerator'));
const VisualAssetGenerator = React.lazy(() => import('../../components/features/content/VisualAssetGenerator'));
const ContentVariationsModal = React.lazy(() => import('../../components/features/content/ContentVariationsModal'));
const PromptEnhancementModal = React.lazy(() => import('../../components/features/content/PromptEnhancementModal'));
import { aiService } from '../../services/aiService';
import { useProfile } from '../../store/profileContext';

// A suitable template to use for the calendar integration feature.
const PROMO_TEMPLATE_ID = 'seasonal_promo';

interface ContentPageProps {
    prefilledContent?: PostContent | null;
    clearPrefilledContent?: () => void;
}

const ContentPage: React.FC<ContentPageProps> = ({ prefilledContent, clearPrefilledContent }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
    const [postContent, setPostContent] = useState<PostContent | null>(null);
    const [postHtml, setPostHtml] = useState<Record<string, string>>({}); // For Rich Text Editor
    const [isVariationsModalOpen, setIsVariationsModalOpen] = useState(false);
    const { addXp, unlockAchievement } = useGamification();

    // New state for prompt enhancement flow
    const { profile } = useProfile();
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(null);
    const [originalPrompt, setOriginalPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const handleSelectTemplate = (template: ContentTemplate) => {
        setSelectedTemplate(template);
        const initialStructure = Object.keys(template.structure).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
        const initialVariables = template.variables.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
        setPostContent({ structure: initialStructure, variables: initialVariables });
        setPostHtml(initialStructure);
    };
    
    const handleContentChange = (section: 'structure' | 'variables', key: string, value: string) => {
        // This now handles HTML content from the rich text editor
        if (section === 'structure') {
            setPostHtml(prev => ({ ...prev, [key]: value }));
        }

        // Also update the plain text version for logic that doesn't need HTML
        setPostContent(prev => {
            if (!prev) return null;

            if (section === 'structure') {
                 const plainText = value.replace(/<[^>]*>?/gm, ''); // Basic strip html
                 return { ...prev, structure: { ...prev.structure, [key]: plainText } };
            }
            if (section === 'variables') {
                 return { ...prev, variables: { ...prev.variables, [key]: value } };
            }
            return prev;
        });
    };

    const handleImageSelect = (imageUrl: string) => {
        setPostContent(prev => {
            if (!prev) return null;
            return { ...prev, imageUrl, videoUrl: undefined };
        });
    };

    const handleVideoSelect = (videoUrl: string) => {
        setPostContent(prev => {
            if (!prev) return null;
            return { ...prev, videoUrl, imageUrl: undefined };
        });
    };
    
    useEffect(() => {
        if (prefilledContent) {
            const targetTemplate = TEMPLATES.find(t => t.id === PROMO_TEMPLATE_ID);
            if (targetTemplate) {
                handleSelectTemplate(targetTemplate);
                setPostContent(prefilledContent);
                // Prefill HTML state as well
                const initialHtml = Object.keys(prefilledContent.structure).reduce((acc, key) => ({ ...acc, [key]: `<p>${prefilledContent.structure[key]}</p>` }), {});
                setPostHtml(initialHtml);
            }
            clearPrefilledContent?.();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefilledContent, clearPrefilledContent]);

    const fullPostText = useMemo(() => {
        if (!postContent) return "";
        return Object.values(postContent.structure).join('\n\n');
    }, [postContent]);

    const handleApplyVariation = (variationText: string) => {
        if (!postContent || !selectedTemplate) return;
        const sections = Object.keys(postContent.structure);
        const newStructure: Record<string, string> = {};
        const newHtmlStructure: Record<string, string> = {};

        // A simple heuristic to split the text back into sections.
        // This works best if the variations maintain paragraph breaks.
        const lines = variationText.split(/\n{2,}/); // Split by 2 or more newlines

        sections.forEach((key, index) => {
            const lineContent = lines[index] || (index === 0 ? variationText : '');
            newStructure[key] = lineContent;
            newHtmlStructure[key] = `<p>${lineContent.replace(/\n/g, '</p><p>')}</p>`;
        });

        setPostContent(prev => prev ? { ...prev, structure: newStructure } : null);
        setPostHtml(newHtmlStructure);
        setIsVariationsModalOpen(false);
    };

    // --- New AI Prompt Enhancement Flow ---

    const handleStartGeneration = (prompt: string) => {
        if (!profile) return;
        setOriginalPrompt(prompt);
        setIsAiLoading(true);
        setPromptAnalysis(null);
        aiService.enhancePrompt(prompt, profile)
            .then(analysis => {
                setPromptAnalysis(analysis);
                setIsPromptModalOpen(true);
            })
            .catch(err => {
                console.error(err);
                // If enhancement fails, fallback to generating from original prompt
                handleGenerateFromPrompt(prompt);
            })
            .finally(() => setIsAiLoading(false));
    };

    const handleGenerateFromPrompt = async (finalPrompt: string) => {
        setIsPromptModalOpen(false);
        setIsAiLoading(true);
        if (!profile || !selectedTemplate) return;

        try {
            const result = await aiService.generatePostText(finalPrompt, "determined by prompt", profile);
            const combinedText = Object.values(result).join('\n\n');
            handleApplyVariation(combinedText); // Use the variation handler to apply the structured result
            addXp(15);
            unlockAchievement('firstContent');
        } catch (err) {
            console.error("Failed to generate final content", err);
            alert("Sorry, there was an error generating the content.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-8rem)] bg-gray-100 dark:bg-gray-900 gap-4">
                {/* Left Panel - Tools */}
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full lg:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 overflow-y-auto space-y-4"
                >
                    <TemplateSelector onSelect={handleSelectTemplate} selectedTemplateId={selectedTemplate?.id} />
                    
                    <div className="p-4">
                        <ComponentErrorBoundary name="advanced-content-generator">
                            <Suspense fallback={
                                <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading AI Generator...</span>
                                </div>
                            }>
                                <AdvancedContentGenerator
                                templates={TEMPLATES}
                                onContentGenerated={(content) => {
                                    // Apply generated content to current template
                                    if (selectedTemplate) {
                                        const newStructure = Object.keys(selectedTemplate.structure).reduce((acc, key) => ({
                                            ...acc,
                                            [key]: content.content
                                        }), {});
                                        
                                        setPostContent({
                                            structure: newStructure,
                                            variables: {},
                                        });
                                        setPostHtml(Object.keys(newStructure).reduce((acc, key) => ({
                                            ...acc,
                                            [key]: `<p>${content.content}</p>`
                                        }), {}));
                                        
                                        addXp(20);
                                        unlockAchievement('firstContent');
                                    }
                                }}
                            />
                            </Suspense>
                        </ComponentErrorBoundary>
                    </div>
                </motion.div>

                {/* Center Panel - Canvas / Editor */}
                <motion.div 
                     initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md min-w-0"
                >
                    <div className="flex-[3] min-h-0">
                        <ContentEditor 
                            template={selectedTemplate} 
                            htmlContent={postHtml}
                            postContent={postContent}
                            onContentChange={handleContentChange}
                            onStartGeneration={handleStartGeneration}
                            isLoading={isAiLoading}
                            onOpenVariations={() => setIsVariationsModalOpen(true)}
                        />
                    </div>
                    <div className="flex-[2] min-h-0 border-t dark:border-gray-700">
                        <VisualAssetGenerator
                            postText={fullPostText}
                            onImageSelect={handleImageSelect}
                            onVideoSelect={handleVideoSelect}
                            selectedImageUrl={postContent?.imageUrl}
                            isEnabled={!!selectedTemplate}
                        />
                    </div>
                </motion.div>

                {/* Right Panel - Preview & Publishing */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 flex flex-col"
                >
                    <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="font-semibold">Live Preview & Analysis</h3>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                        <ContentPreview postContent={postContent} postHtml={postHtml} />
                        <AIPrediction postText={fullPostText} imageUrl={postContent?.imageUrl} />
                    </div>
                    <div className="p-4 border-t dark:border-gray-700">
                        <PublishingPanel 
                            postContent={postContent} 
                            postText={fullPostText} 
                            isEnabled={!!(postContent && fullPostText)} 
                        />
                    </div>
                </motion.div>
            </div>
            
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="spinner"></div></div>}>
                <ContentVariationsModal
                    isOpen={isVariationsModalOpen}
                    onClose={() => setIsVariationsModalOpen(false)}
                    originalText={fullPostText}
                    onApplyVariation={handleApplyVariation}
                />
            </Suspense>

            {promptAnalysis && (
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="spinner"></div></div>}>
                    <PromptEnhancementModal
                        isOpen={isPromptModalOpen}
                        onClose={() => setIsPromptModalOpen(false)}
                        analysis={promptAnalysis}
                        originalPrompt={originalPrompt}
                        onConfirm={handleGenerateFromPrompt}
                    />
                </Suspense>
            )}
        </>
    );
};

export default ContentPage;