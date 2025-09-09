import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from '../../types/index';
import { useAppData } from '../../store/appDataContext';
import AssetDetailPanel from '../../components/features/assets/AssetDetailPanel';
import VisualEditor from '../../components/features/assets/VisualEditor';
import { Layers, Grid, List, Command, UploadCloud } from '../../components/ui/Icons';
import AssetGrid from '../../components/features/assets/AssetGrid';
import AssetListView from '../../components/features/assets/AssetListView';
import CommandPalette from '../../components/features/assets/CommandPalette';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

type ViewMode = 'grid' | 'list';

const AssetsPage: React.FC = () => {
    const { assets, updateAsset, deleteAsset } = useAppData();
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets.length > 0 ? assets[0].id : null);
    const [view, setView] = useState<'browsing' | 'editing'>('browsing');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

    const handleSelectAsset = (asset: Asset) => {
        setSelectedAssetId(asset.id);
        setView('browsing');
    };
    
    const handleStartEditing = () => {
        if (selectedAsset) setView('editing');
    };
    
    const handleUpdateAndSave = (updatedAsset: Asset) => {
        updateAsset(updatedAsset);
        setSelectedAssetId(updatedAsset.id);
        setView('browsing');
    };

    const handleDeleteAsset = () => {
        if (selectedAssetId) {
            const currentIndex = assets.findIndex(a => a.id === selectedAssetId);
            deleteAsset(selectedAssetId);
            // Select the next asset or the previous one if the deleted one was the last
            const newIndex = Math.min(currentIndex, assets.length - 2);
            if (newIndex >= 0 && assets.length > 1) {
                setSelectedAssetId(assets[newIndex].id);
            } else {
                setSelectedAssetId(assets.length > 1 ? assets[0].id : null);
            }
        }
    };
    
    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (view !== 'browsing' || isCommandPaletteOpen) return;
            
            const currentIndex = assets.findIndex(a => a.id === selectedAssetId);
            if (currentIndex === -1) return;

            let nextIndex = currentIndex;
            
            // Command Palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(true);
                return;
            }

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    nextIndex = (currentIndex + 1) % assets.length;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    nextIndex = (currentIndex - 1 + assets.length) % assets.length;
                    break;
                default:
                    return; // Don't prevent default for other keys
            }
            e.preventDefault();
            setSelectedAssetId(assets[nextIndex].id);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [assets, selectedAssetId, view, isCommandPaletteOpen]);

    const EmptyState = () => (
        <div className="text-center p-12 h-full flex flex-col items-center justify-center">
            <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Tu biblioteca de assets está vacía</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Sube tus primeras imágenes o videos para empezar a gestionarlos y usarlos en tus contenidos.
            </p>
            <div className="mt-6">
                <Button onClick={() => alert('Upload feature mock.')}><UploadCloud className="w-4 h-4 mr-2" /> Subir Asset</Button>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex h-[calc(100vh-8rem)] bg-gray-100 dark:bg-gray-900 gap-4">
                {/* Main Panel */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Layers /> Digital Asset Management
                        </h2>
                        <div className="flex items-center gap-4">
                             <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:flex items-center gap-1">
                                <Command className="w-4 h-4" />+ K to open palette
                             </p>
                             <Toggle 
                                options={[{label: 'Grid', value: 'grid'}, {label: 'List', value: 'list'}]}
                                value={viewMode}
                                onChange={(value) => setViewMode(value as ViewMode)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {assets.length > 0 ? (
                            viewMode === 'grid' ? (
                                <AssetGrid assets={assets} onSelect={handleSelectAsset} selectedAssetId={selectedAsset?.id} />
                            ) : (
                                <AssetListView assets={assets} onSelect={handleSelectAsset} selectedAssetId={selectedAsset?.id} />
                            )
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <AnimatePresence>
                    {(selectedAsset && assets.length > 0) && (
                        <motion.div
                            key={view} // Animate when view changes
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0"
                        >
                            {view === 'browsing' ? (
                                <AssetDetailPanel 
                                    key={selectedAsset.id} // Re-render on asset change
                                    asset={selectedAsset} 
                                    onEdit={handleStartEditing} 
                                    onAssetUpdate={updateAsset}
                                />
                            ) : (
                                <VisualEditor 
                                    asset={selectedAsset} 
                                    onSave={handleUpdateAndSave} 
                                    onBack={() => setView('browsing')} 
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                asset={selectedAsset}
                onEdit={handleStartEditing}
                onDelete={handleDeleteAsset}
            />
        </>
    );
};

export default AssetsPage;