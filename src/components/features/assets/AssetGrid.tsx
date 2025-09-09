import React from 'react';
import { motion } from 'framer-motion';
import { Asset } from '../../../types/index';

interface AssetGridProps {
    assets: Asset[];
    onSelect: (asset: Asset) => void;
    selectedAssetId?: string | null;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, onSelect, selectedAssetId }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map((asset, index) => (
            <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(asset)}
                className={`aspect-square rounded-lg overflow-hidden cursor-pointer group relative transition-all duration-200 ${selectedAssetId === asset.id ? 'ring-4 ring-primary-500' : 'ring-2 ring-transparent hover:ring-primary-400'}`}
            >
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <p className="text-white text-xs font-semibold truncate">{asset.name}</p>
                </div>
            </motion.div>
        ))}
    </div>
);

export default AssetGrid;