import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from '../../../types/index';
import Button from '../../ui/Button';
import { Edit, Sparkles, Tag } from '../../ui/Icons';
import { aiService } from '../../../services/aiService';

interface AssetDetailPanelProps {
    asset: Asset;
    onEdit: () => void;
    onAssetUpdate: (updatedAsset: Asset) => void;
}

const AssetDetailPanel: React.FC<AssetDetailPanelProps> = ({ asset, onEdit, onAssetUpdate }) => {
    const [isLoadingTags, setIsLoadingTags] = useState(false);

    const handleGenerateTags = async () => {
        setIsLoadingTags(true);
        try {
            const newTags = await aiService.autoTagAsset(asset.url);
            onAssetUpdate({ ...asset, tags: [...new Set([...asset.tags, ...newTags])] });
        } catch (error) {
            console.error("Failed to generate tags", error);
            alert("Could not generate AI tags for this asset.");
        } finally {
            setIsLoadingTags(false);
        }
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex-1">
                <div className="aspect-square rounded-lg overflow-hidden mb-4">
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{asset.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded on {new Date(asset.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">AI Generated Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {asset.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md">{tag}</span>
                        ))}
                        {asset.tags.length === 0 && <p className="text-xs text-gray-400 italic">No tags yet. Use the AI to generate some!</p>}
                    </div>
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t dark:border-gray-700 space-y-2">
                <Button onClick={handleGenerateTags} disabled={isLoadingTags} variant="secondary" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2"/>
                    {isLoadingTags ? 'Analyzing...' : 'Auto-Tag with AI'}
                </Button>
                <Button onClick={onEdit} className="w-full">
                    <Edit className="w-4 h-4 mr-2"/>
                    Open in Visual Editor
                </Button>
            </div>
        </div>
    );
};

export default AssetDetailPanel;