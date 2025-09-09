import React, { useRef, useEffect, useState } from 'react';
import { Asset } from '../../../types/index';
import Button from '../../ui/Button';
import { ChevronLeft, Sparkles, Sliders } from '../../ui/Icons';
import { aiService } from '../../../services/aiService';

interface VisualEditorProps {
    asset: Asset;
    onSave: (updatedAsset: Asset) => void;
    onBack: () => void;
}

const VisualEditor: React.FC<VisualEditorProps> = ({ asset, onSave, onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState(asset.url);
    const [adjustments, setAdjustments] = useState({
        brightness: 100,
        contrast: 100,
        saturate: 100,
    });
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous"; // Important for saving from external URLs
        img.src = currentImageUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%)`;
            ctx.drawImage(img, 0, 0);
        };
    }, [currentImageUrl, adjustments]);

    const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdjustments(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleRemoveBackground = async () => {
        setIsLoading(true);
        try {
            const resultUrl = await aiService.removeBackground(currentImageUrl);
            setCurrentImageUrl(resultUrl);
        } catch (error) {
            console.error("Failed to remove background", error);
            alert("Could not remove background. The image might be too complex.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave({ ...asset, url: dataUrl, name: `${asset.name} (edited)` });
        }
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                <Button onClick={onBack} variant="secondary" size="sm">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
                </Button>
            </div>
            
            <div className="flex-1 aspect-square mb-4">
                <canvas ref={canvasRef} className="w-full h-full object-contain border dark:border-gray-700 rounded-lg" />
            </div>

            <div className="space-y-4">
                <ToolSection title="AI Tools" icon={<Sparkles />}>
                    <Button onClick={handleRemoveBackground} disabled={isLoading} variant="secondary" className="w-full">
                        {isLoading ? 'Processing...' : 'Remove Background'}
                    </Button>
                </ToolSection>

                <ToolSection title="Color Adjustments" icon={<Sliders />}>
                     <AdjustmentSlider
                        label="Brightness"
                        name="brightness"
                        value={adjustments.brightness}
                        onChange={handleAdjustmentChange}
                        min={50} max={150}
                    />
                    <AdjustmentSlider
                        label="Contrast"
                        name="contrast"
                        value={adjustments.contrast}
                        onChange={handleAdjustmentChange}
                        min={50} max={150}
                    />
                    <AdjustmentSlider
                        label="Saturation"
                        name="saturate"
                        value={adjustments.saturate}
                        onChange={handleAdjustmentChange}
                        min={0} max={200}
                    />
                </ToolSection>
            </div>
            
            <div className="mt-auto pt-4 border-t dark:border-gray-700">
                <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
        </div>
    );
};

const ToolSection: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({ title, icon, children }) => (
    <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {icon} {title}
        </h4>
        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {children}
        </div>
    </div>
);

const AdjustmentSlider: React.FC<{label:string, name:string, value: number, onChange: (e:React.ChangeEvent<HTMLInputElement>)=>void, min:number, max:number}> = ({label, name, value, onChange, min, max}) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <input 
            type="range" id={name} name={name} 
            min={min} max={max} value={value} 
            onChange={onChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-primary-500"
        />
    </div>
);


export default VisualEditor;