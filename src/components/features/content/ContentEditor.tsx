import React, { useState } from 'react';
import { ContentTemplate, PostContent } from '../../../types/index';
import Button from '../../ui/Button';
import Label from '../../ui/Label';
import Input from '../../ui/Input';
import { Sparkles, FileText } from '../../ui/Icons';
import RichTextEditor from './RichTextEditor';

interface ContentEditorProps {
    template: ContentTemplate | null;
    htmlContent: Record<string, string>;
    postContent: PostContent | null;
    onContentChange: (section: 'structure' | 'variables', key: string, value: string) => void;
    onStartGeneration: (prompt: string) => void;
    isLoading: boolean;
    onOpenVariations: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ template, htmlContent, postContent, onContentChange, onStartGeneration, isLoading, onOpenVariations }) => {
    const [prompt, setPrompt] = useState('');

    if (!template || !htmlContent || !postContent) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Start creating</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Select a template from the left panel to begin.</p>
            </div>
        );
    }
    
    const availableVariables = [
        { label: 'Business Name', value: 'negocio_nombre' },
        { label: 'Day of Week', value: 'dia_semana' },
        ...(template.variables.map(v => ({ label: v.replace(/_/g, ' '), value: v })))
    ];

    return (
        <div className="flex flex-col h-full">
             <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white">{template.name}</h3>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={onOpenVariations} disabled={isLoading}>Generate Variations</Button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* AI Prompt Section */}
                <div>
                    <Label htmlFor="ai-prompt">AI Generation Prompt</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="ai-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A post about our new summer coffee blend"
                            disabled={isLoading}
                        />
                        <Button onClick={() => onStartGeneration(prompt)} disabled={isLoading || !prompt}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isLoading ? 'Thinking...' : 'Generate with AI'}
                        </Button>
                    </div>
                </div>

                <hr className="dark:border-gray-700" />

                <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Content Structure</h4>
                    <div className="space-y-3 mt-2">
                        {Object.entries(template.structure).map(([key, description]) => (
                             <div key={key}>
                                <Label htmlFor={`structure-${key}`} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                                <RichTextEditor
                                    id={`structure-${key}`}
                                    value={htmlContent[key] || ''}
                                    // FIX: Explicitly type `html` to resolve 'unknown' type error.
                                    onChange={(html: string) => onContentChange('structure', key, html)}
                                    placeholder={description}
                                    variables={availableVariables}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {template.variables.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Variables</h4>
                         <div className="grid grid-cols-2 gap-3">
                            {template.variables.map(key => (
                                <div key={key}>
                                    <Label htmlFor={`var-${key}`} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                                    <Input
                                        id={`var-${key}`}
                                        value={postContent.variables[key] || ''}
                                        onChange={(e) => onContentChange('variables', key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentEditor;