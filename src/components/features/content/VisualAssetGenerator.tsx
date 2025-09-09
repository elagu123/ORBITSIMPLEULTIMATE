import React, { useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, Sparkles, Lightbulb, UploadCloud, Edit, Plus, Trash } from '../../ui/Icons';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Label from '../../ui/Label';
import Textarea from '../../ui/Textarea';
import { aiService } from '../../../services/aiService';
import { useProfile } from '../../../store/profileContext';
import { VideoIdea, VideoOperation } from '../../../types/index';
import Select from '../../ui/Select';

interface VisualAssetGeneratorProps {
    postText: string;
    onImageSelect: (imageUrl: string) => void;
    onVideoSelect: (videoUrl: string) => void;
    selectedImageUrl?: string | null;
    isEnabled: boolean;
}

type MainTab = 'image' | 'video';
type ImageTab = 'generate' | 'upload' | 'bank';
type VideoTab = 'generate' | 'ideas';

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const VisualAssetGenerator: React.FC<VisualAssetGeneratorProps> = (props) => {
    const [mainTab, setMainTab] = useState<MainTab>('image');
    
    if (!props.isEnabled) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-gray-500 dark:text-gray-400">Select a template above to activate visual generation.</p>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b dark:border-gray-700 flex items-center justify-between">
                 <h4 className="font-semibold text-sm ml-2 text-gray-700 dark:text-gray-300">Visual Assets Studio</h4>
                 <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
                    <TabButton icon={<Image/>} label="Image Tools" isActive={mainTab === 'image'} onClick={() => setMainTab('image')} />
                    <TabButton icon={<Video/>} label="Video Tools" isActive={mainTab === 'video'} onClick={() => setMainTab('video')} />
                 </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mainTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mainTab === 'image' ? <ImageTools {...props} /> : <VideoTools {...props} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const TabButton: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick:() => void}> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-2
        ${isActive ? 'bg-white dark:bg-gray-800 text-primary-500 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}
      `}
    >
      {icon} {label}
    </button>
);


// ===================================
// IMAGE TOOLS COMPONENT
// ===================================
const ImageTools: React.FC<VisualAssetGeneratorProps> = ({ postText, onImageSelect }) => {
    const [imageTab, setImageTab] = useState<ImageTab>('generate');
    const [editingImage, setEditingImage] = useState<string | null>(null);

    const handleSelectForEditing = (url: string) => {
        setEditingImage(url);
        onImageSelect(url); // also update the main preview
    };
    
    const handleUpdateImage = (url: string) => {
        setEditingImage(url); // Keep it in editing mode but with the new changes
        onImageSelect(url);
    }

    if (editingImage) {
        return <ImageCanvasEditor imageUrl={editingImage} onConfirm={handleUpdateImage} onBack={() => setEditingImage(null)} />;
    }

    return (
        <div className="p-4 space-y-4">
             <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <SubTabButton icon={<Sparkles/>} label="Generate" isActive={imageTab === 'generate'} onClick={() => setImageTab('generate')} />
                <SubTabButton icon={<UploadCloud/>} label="Upload" isActive={imageTab === 'upload'} onClick={() => setImageTab('upload')} />
                <SubTabButton icon={<Image/>} label="Bank" isActive={imageTab === 'bank'} onClick={() => setImageTab('bank')} />
             </div>
             <div>
                {imageTab === 'generate' && <ImageGenerator postText={postText} onImageSelect={handleSelectForEditing} />}
                {imageTab === 'upload' && <ImageUploader onImageSelect={handleSelectForEditing} />}
                {imageTab === 'bank' && <ImageBank onImageSelect={handleSelectForEditing} />}
             </div>
        </div>
    );
};

// ===================================
// VIDEO TOOLS COMPONENT
// ===================================
const VideoTools: React.FC<VisualAssetGeneratorProps> = ({ postText, onVideoSelect, selectedImageUrl }) => {
    const [videoTab, setVideoTab] = useState<VideoTab>('generate');
    return (
         <div className="p-4 space-y-4">
             <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <SubTabButton icon={<Sparkles/>} label="Generate Video" isActive={videoTab === 'generate'} onClick={() => setVideoTab('generate')} />
                <SubTabButton icon={<Lightbulb/>} label="Video Ideas" isActive={videoTab === 'ideas'} onClick={() => setVideoTab('ideas')} />
             </div>
             <div>
                {videoTab === 'generate' && <VideoGenerator onVideoSelect={onVideoSelect} selectedImageUrl={selectedImageUrl} />}
                {videoTab === 'ideas' && <VideoIdeaGenerator postText={postText} />}
            </div>
        </div>
    )
}

const SubTabButton: React.FC<{icon: React.ReactElement<{ className?: string }>, label: string, isActive: boolean, onClick: () => void}> = ({ icon, label, isActive, onClick }) => {
    return (
         <button
            onClick={onClick}
            className={`flex-1 px-2 py-1 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5
                ${isActive ? 'bg-white dark:bg-gray-800 text-primary-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}
            `}
        >
            {React.cloneElement(icon, { className: 'w-4 h-4' })}
            {label}
        </button>
    )
}


// --- Image Sub-Components ---
const ImageGenerator: React.FC<{postText: string; onImageSelect: (url: string) => void}> = ({ postText, onImageSelect }) => {
    const { profile } = useProfile();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true); setImages([]);
        try {
            const result = await aiService.generatePostImage(prompt, profile);
            setImages(result); if (result.length > 0) onImageSelect(result[0]);
        } catch (error) { console.error(error); alert("Failed to generate images."); }
        finally { setIsLoading(false); }
    };
    
    const suggestPrompt = async () => {
        if (!postText) return;
        setIsSuggesting(true);
        try {
            const suggestion = await aiService.summarizeForImagePrompt(postText); setPrompt(suggestion);
        } catch (error) { setPrompt(postText.split('.').slice(0, 2).join('.') || 'A marketing image'); }
        finally { setIsSuggesting(false); }
    };

    return (
        <div className="space-y-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div>
                <Label htmlFor="image-prompt">Image Prompt</Label>
                <div className="flex gap-2">
                    <Input id="image-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., Happy customer enjoying coffee"/>
                    <Button variant="secondary" onClick={suggestPrompt} disabled={isSuggesting || !postText} size="sm">
                        <Lightbulb className="w-4 h-4 mr-1"/> {isSuggesting ? '...' : 'Suggest'}
                    </Button>
                </div>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !prompt}>
                <Sparkles className="w-4 h-4 mr-2" /> {isLoading ? 'Generating...' : 'Generate Images'}
            </Button>
            {isLoading && <div className="text-center p-4">Loading images...</div>}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} onClick={() => onImageSelect(img)} className="rounded-lg overflow-hidden cursor-pointer aspect-square ring-2 ring-transparent hover:ring-primary-300">
                            <img src={img} alt={`Generated ${i+1}`} className="w-full h-full object-cover" />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ImageUploader: React.FC<{onImageSelect: (url: string) => void}> = ({ onImageSelect }) => {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const dataUrl = await readFileAsDataURL(file); onImageSelect(dataUrl); }
    };
    return (
        <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
             <Label htmlFor="file-upload">Upload an Image</Label>
             <Input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} />
        </div>
    )
};

const ImageBank: React.FC<{onImageSelect: (url: string) => void}> = ({ onImageSelect }) => {
    const stockImages = [ 'https://picsum.photos/seed/stock1/300', 'https://picsum.photos/seed/stock2/300', 'https://picsum.photos/seed/stock3/300', 'https://picsum.photos/seed/stock4/300' ];
    return (
         <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
             <Label>Select from Image Bank</Label>
            <div className="grid grid-cols-2 gap-2">
                {stockImages.map(img => <img key={img} src={img} alt="Stock" className="rounded-lg cursor-pointer aspect-square object-cover" onClick={() => onImageSelect(img)} />)}
            </div>
         </div>
    )
}

// --- Enhanced Canvas Editor ---
interface TextElement {
    id: number;
    text: string;
    fontSize: number;
    color: string;
    x: number;
    y: number;
    width?: number; // For hit detection
    height?: number; // For hit detection
}
const ImageCanvasEditor: React.FC<{imageUrl: string, onConfirm: (dataUrl: string) => void, onBack: () => void}> = ({ imageUrl, onConfirm, onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = () => {
            canvas.width = 512;
            canvas.height = 512;
            ctx.drawImage(img, 0, 0, 512, 512);

            const updatedElements = textElements.map(el => {
                ctx.fillStyle = el.color;
                ctx.font = `bold ${el.fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(el.text, el.x, el.y);
                
                // Measure text for hit detection and bounding box
                const metrics = ctx.measureText(el.text);
                const width = metrics.width;
                const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

                if (el.id === selectedElementId) {
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(el.x - width / 2 - 5, el.y - height / 2 - 5, width + 10, height + 10);
                }
                return { ...el, width, height };
            });
            // Silently update elements with their calculated dimensions
            if (JSON.stringify(updatedElements) !== JSON.stringify(textElements)) {
                setTextElements(updatedElements);
            }
        };
    }, [imageUrl, textElements, selectedElementId]);

    useEffect(() => { draw(); }, [draw]);
    
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check for hit on text elements in reverse order (topmost first)
        const clickedElement = [...textElements].reverse().find(el => 
            el.width && el.height &&
            x >= el.x - el.width / 2 && x <= el.x + el.width / 2 &&
            y >= el.y - el.height / 2 && y <= el.y + el.height / 2
        );

        if (clickedElement) {
            setSelectedElementId(clickedElement.id);
            setIsDragging(true);
            setDragOffset({ x: x - clickedElement.x, y: y - clickedElement.y });
        } else {
            setSelectedElementId(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !selectedElementId) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTextElements(prev => prev.map(el => 
            el.id === selectedElementId ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y } : el
        ));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleConfirm = () => {
        const tempSelected = selectedElementId;
        setSelectedElementId(null); // Deselect to remove bounding box
        setTimeout(() => { // Allow canvas to redraw without selection box
            const canvas = canvasRef.current;
            if (canvas) onConfirm(canvas.toDataURL('image/png'));
            setSelectedElementId(tempSelected); // Reselect after capture
        }, 50);
    }

    const addText = () => {
        const newElement: TextElement = { id: Date.now(), text: 'New Text', fontSize: 48, color: '#FFFFFF', x: 256, y: 256 };
        setTextElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }
    
    const updateSelectedElement = (prop: keyof TextElement, value: any) => {
        setTextElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, [prop]: value } : el));
    }

    const deleteSelectedElement = () => {
        setTextElements(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
    }

    const selectedElement = textElements.find(el => el.id === selectedElementId);

    return (
        <div className="p-2 space-y-3">
            <div className="flex justify-between items-center">
                <Button onClick={onBack} size="sm" variant="secondary">Back to Generation</Button>
                <Button onClick={addText} size="sm"><Plus className="w-4 h-4 mr-1"/> Add Text</Button>
            </div>
            <canvas 
                ref={canvasRef} 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
                className="w-full aspect-square rounded-lg border dark:border-gray-700 cursor-grab active:cursor-grabbing"
            ></canvas>
            
            {selectedElement ? (
                 <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                     <div className="flex justify-between items-center">
                        <Label>Edit Selected Text</Label>
                        <Button onClick={deleteSelectedElement} size="sm" variant="secondary" className="!p-1 h-6 w-6"><Trash className="w-4 h-4 text-red-500"/></Button>
                     </div>
                    <Input value={selectedElement.text} onChange={e => updateSelectedElement('text', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Font Size</Label>
                            <Input type="number" value={selectedElement.fontSize} onChange={e => updateSelectedElement('fontSize', parseInt(e.target.value, 10))}/>
                        </div>
                        <div>
                            <Label>Color</Label>
                            <Input type="color" value={selectedElement.color} onChange={e => updateSelectedElement('color', e.target.value)} className="!p-1"/>
                        </div>
                    </div>
                </div>
            ) : <p className="text-xs text-center text-gray-500">Add text or click an element on the canvas to edit.</p>}

             <Button onClick={handleConfirm}><Edit className="w-4 h-4 mr-2"/> Apply Changes & Update Preview</Button>
        </div>
    )
}


// --- Video Sub-Components ---
const VideoGenerator: React.FC<{onVideoSelect: (url: string) => void; selectedImageUrl?: string | null}> = ({ onVideoSelect, selectedImageUrl }) => {
    const [prompt, setPrompt] = useState('');
    const [audioTheme, setAudioTheme] = useState('none');
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [animateImage, setAnimateImage] = useState(false);

    const videoStatusMessages = useMemo(() => [
        "Initializing video creation...", "AI is directing your video...", "Conceptualizing scenes...",
        "Gathering digital props...", "Rendering initial frames...", "Adding special effects...",
        "Polishing the final cut...", "Finalizing render, almost there!",
    ], []);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (isGenerating) {
            let messageIndex = 0;
            setStatusMessage(videoStatusMessages[0]);
            intervalId = setInterval(() => {
                messageIndex++;
                setStatusMessage(videoStatusMessages[messageIndex % videoStatusMessages.length]);
            }, 3500);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isGenerating, videoStatusMessages]);

    const pollOperation = useCallback(async (operation: VideoOperation) => {
        let currentOperation = operation;
        while (!currentOperation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            try {
                currentOperation = await aiService.checkVideoOperationStatus(currentOperation);
            } catch (error) {
                setStatusMessage("An error occurred while checking video status.");
                setIsGenerating(false);
                return;
            }
        }
        
        const downloadLink = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink && process.env.API_KEY) {
            setStatusMessage("Fetching your video...");
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedVideoUrl(url); 
            onVideoSelect(url); 
        } else {
            setStatusMessage("Video ready, but failed to retrieve URL.");
        }
        setIsGenerating(false);

    }, [onVideoSelect]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true); setGeneratedVideoUrl(null);
        let imagePayload;
        if (animateImage && selectedImageUrl && selectedImageUrl.startsWith('data:')) {
            imagePayload = { imageBytes: selectedImageUrl.split(',')[1], mimeType: selectedImageUrl.split(';')[0].split(':')[1] }
        }
        try { const initialOperation = await aiService.generateVideo(prompt, imagePayload, audioTheme); pollOperation(initialOperation);
        } catch (error) { alert("Failed to start video generation."); setIsGenerating(false); }
    };
    
    return (
        <div className="space-y-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div>
                <Label htmlFor="video-prompt">Video Prompt</Label>
                <Textarea id="video-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder="e.g., A cinematic shot of a fresh pastry..."/>
            </div>
            <div>
                <Label htmlFor="audio-theme">Audio Theme</Label>
                <Select id="audio-theme" value={audioTheme} onChange={e => setAudioTheme(e.target.value)}>
                    <option value="none">None (Silent)</option>
                    <option value="an upbeat, happy soundtrack">Upbeat & Happy</option>
                    <option value="a calm and relaxing background score">Calm & Relaxing</option>
                    <option value="a dramatic and cinematic soundtrack">Cinematic</option>
                </Select>
            </div>
            {selectedImageUrl && (<div className="flex items-center"><input id="animate-image" type="checkbox" checked={animateImage} onChange={(e) => setAnimateImage(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500"/><label htmlFor="animate-image" className="ml-2 block text-sm">Animate selected image</label></div>)}
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt}><Sparkles className="w-4 h-4 mr-2" />{isGenerating ? 'Creating...' : 'Generate Video'}</Button>
            {isGenerating && <div className="text-center p-4 text-sm">{statusMessage}</div>}
            {generatedVideoUrl && (<div><h4 className="font-semibold text-sm mb-2">Generated Video:</h4><video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-lg" /></div>)}
        </div>
    )
};

const VideoIdeaGenerator: React.FC<{postText: string}> = ({ postText }) => {
    const { profile } = useProfile();
    const [isLoading, setIsLoading] = useState(false);
    const [ideas, setIdeas] = useState<VideoIdea[]>([]);

    const handleGenerate = async () => {
        if (!postText) { alert("Please write content first."); return; }
        setIsLoading(true); setIdeas([]);
        try { const result = await aiService.generateVideoIdeas(postText, profile); setIdeas(result); }
        catch (error) { console.error(error); alert("Failed to generate video ideas."); }
        finally { setIsLoading(false); }
    };

    return (
         <div className="space-y-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Creative video ideas based on your post.</p>
            <Button onClick={handleGenerate} disabled={isLoading || !postText}><Sparkles className="w-4 h-4 mr-2" />{isLoading ? 'Generating...' : 'Generate Ideas'}</Button>
            {isLoading && <div className="text-center p-4">Generating ideas...</div>}
            {ideas.length > 0 && (<div className="space-y-2">{ideas.map((idea, i) => (<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-3 bg-white dark:bg-gray-800 rounded-lg"><h5 className="font-semibold">{idea.title}</h5><p className="text-sm mt-1">{idea.description}</p></motion.div>))}</div>)}
        </div>
    );
};


export default VisualAssetGenerator;