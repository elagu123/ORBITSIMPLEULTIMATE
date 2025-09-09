import React from 'react';
import { motion } from 'framer-motion';
import { Asset } from '../../../types/index';
import { Image, Video } from '../../ui/Icons';

interface AssetListViewProps {
    assets: Asset[];
    onSelect: (asset: Asset) => void;
    selectedAssetId?: string | null;
}

const AssetListView: React.FC<AssetListViewProps> = ({ assets, onSelect, selectedAssetId }) => (
    <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Created</div>
            <div className="col-span-2">Tags</div>
        </div>
        {/* Rows */}
        <ul className="space-y-2">
            {assets.map((asset, index) => (
                <motion.li
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(asset)}
                    className={`grid grid-cols-12 gap-4 items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedAssetId === asset.id ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                    <div className="col-span-5 flex items-center gap-3">
                        <img src={asset.url} alt={asset.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                        <span className="font-medium text-sm text-gray-800 dark:text-white truncate">{asset.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300 capitalize flex items-center gap-2">
                        {asset.type === 'image' ? <Image className="w-4 h-4"/> : <Video className="w-4 h-4"/>}
                        {asset.type}
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(asset.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {asset.tags.join(', ')}
                    </div>
                </motion.li>
            ))}
        </ul>
    </div>
);

export default AssetListView;