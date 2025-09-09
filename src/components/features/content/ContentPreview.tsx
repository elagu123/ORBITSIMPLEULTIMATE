import React, { useState, useMemo } from 'react';
import Toggle from '../../ui/Toggle';
import { Heart, MessageCircle, ArrowRight } from '../../ui/Icons';
import { useProfile } from '../../../store/profileContext';
import { PostContent } from '../../../types/index';

interface ContentPreviewProps {
    postContent: PostContent | null;
    postHtml: Record<string, string>;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ postContent, postHtml }) => {
    const [platform, setPlatform] = useState('instagram');
    const { profile } = useProfile();

    const resolvedHtml = useMemo(() => {
        if (!postContent) return '';
        let fullHtml = Object.values(postHtml).join('');

        const variablesToReplace = {
            ...postContent.variables,
            negocio_nombre: profile?.businessName || 'Your Business',
            dia_semana: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        };

        Object.entries(variablesToReplace).forEach(([key, value]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            // Wrap in strong tags for emphasis, unless it's already inside a tag
            fullHtml = fullHtml.replace(regex, `<strong>${value || `{${key}}`}</strong>`);
        });

        return fullHtml;
    }, [postHtml, postContent, profile]);
    
    return (
        <div className="space-y-4">
            <div className="flex justify-center">
                 <Toggle 
                    options={[{label: 'Instagram', value: 'instagram'}, {label: 'Facebook', value: 'facebook'}]}
                    value={platform}
                    onChange={setPlatform}
                />
            </div>
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="flex items-center p-3 border-b dark:border-gray-700 flex-shrink-0">
                    <img src="https://picsum.photos/100" alt="avatar" className="w-8 h-8 rounded-full" />
                    <span className="ml-3 font-semibold text-sm text-gray-800 dark:text-white">{profile?.businessName || 'Your Business'}</span>
                </div>
                {/* Image/Video Placeholder */}
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {postContent?.videoUrl ? (
                        <video src={postContent.videoUrl} controls autoPlay loop muted className="w-full h-full object-cover" />
                    ) : postContent?.imageUrl ? (
                        <img src={postContent.imageUrl} alt="Generated preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Visual Asset Preview</span>
                    )}
                </div>
                {/* Actions & Text */}
                <div className="p-3 overflow-y-auto">
                    <div className="flex items-center space-x-4 mb-2">
                        <Heart className="w-6 h-6" />
                        <MessageCircle className="w-6 h-6" />
                        <ArrowRight className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-gray-800 dark:text-white font-semibold">1,234 likes</p>
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 prose prose-sm dark:prose-invert max-w-none">
                         <div dangerouslySetInnerHTML={{ __html: `<strong>${profile?.businessName || 'Your Business'}</strong> ${resolvedHtml || 'Your post content will appear here...'}` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentPreview;