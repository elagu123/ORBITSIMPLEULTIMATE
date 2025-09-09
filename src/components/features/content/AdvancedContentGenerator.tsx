import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentTemplate } from '../../../types/index';
import { useProfile } from '../../../store/profileContext';
import { useToastNotifications } from '../../../store/toastContext';
import { aiService } from '../../../services/aiService';
import {
  Wand2,
  Sparkles,
  Brain,
  Target,
  Zap,
  Copy,
  Download,
  RefreshCw,
  Settings,
  Clock,
  TrendingUp,
  Users,
  Hash,
  Type,
  Image as ImageIcon,
  Video,
  Mic,
  Calendar,
  Eye,
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  BarChart3
} from '../../ui/Icons';
import Button from '../../ui/Button';

interface ContentSuggestion {
  id: string;
  type: 'post' | 'story' | 'reel' | 'campaign';
  title: string;
  content: string;
  hashtags: string[];
  tone: string;
  targetAudience: string;
  estimatedPerformance: {
    engagement: number;
    reach: number;
    impressions: number;
  };
  suggestedTime: string;
  mediaType: 'text' | 'image' | 'video' | 'carousel';
}

interface ContentTemplate {
  name: string;
  description: string;
  structure: string[];
  variables: string[];
}

interface AdvancedContentGeneratorProps {
  onContentGenerated?: (content: ContentSuggestion) => void;
  templates: ContentTemplate[];
}

const AdvancedContentGenerator: React.FC<AdvancedContentGeneratorProps> = ({
  onContentGenerated,
  templates
}) => {
  const { profile } = useProfile();
  const { success, error, info } = useToastNotifications();
  const [activeTab, setActiveTab] = useState<'create' | 'optimize' | 'analyze' | 'batch'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ContentSuggestion[]>([]);
  const [contentToOptimize, setContentToOptimize] = useState('');
  const [batchCount, setBatchCount] = useState(5);
  const [contentSettings, setContentSettings] = useState({
    platform: 'instagram',
    tone: 'professional',
    length: 'medium',
    includeHashtags: true,
    includeCTA: true,
    audience: 'general'
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const contentTemplates: ContentTemplate[] = [
    {
      name: 'Educational Post',
      description: 'Share knowledge and tips with your audience',
      structure: ['Hook', 'Problem', 'Solution', 'Call to Action'],
      variables: ['topic', 'benefit', 'action']
    },
    {
      name: 'Behind the Scenes',
      description: 'Show the human side of your business',
      structure: ['Context', 'Process', 'Insight', 'Connection'],
      variables: ['activity', 'lesson', 'emotion']
    },
    {
      name: 'User Generated Content',
      description: 'Celebrate your customers and community',
      structure: ['Feature', 'Story', 'Appreciation', 'Encourage'],
      variables: ['customer_name', 'achievement', 'product']
    },
    {
      name: 'Trending Topic',
      description: 'Join current conversations and trends',
      structure: ['Trend Reference', 'Brand Connection', 'Value Add', 'Engagement'],
      variables: ['trend', 'connection', 'perspective']
    }
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !profile) {
      error('Missing Information', 'Please enter a prompt and ensure your profile is set up');
      return;
    }

    setIsGenerating(true);
    try {
      const suggestions: ContentSuggestion[] = [];
      
      for (let i = 0; i < (activeTab === 'batch' ? batchCount : 1); i++) {
        const content = await generateSingleContent();
        suggestions.push(content);
      }

      setGeneratedContent(suggestions);
      success('Content Generated', `Successfully generated ${suggestions.length} content suggestion${suggestions.length > 1 ? 's' : ''}`);
      
      if (suggestions.length > 0 && onContentGenerated) {
        onContentGenerated(suggestions[0]);
      }
    } catch (err) {
      console.error('Generation failed:', err);
      error('Generation Failed', 'Unable to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, profile, activeTab, batchCount, contentSettings, selectedTemplate, error, success, onContentGenerated]);

  const generateSingleContent = async (): Promise<ContentSuggestion> => {
    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const contentTypes = ['post', 'story', 'reel', 'campaign'] as const;
    const tones = ['professional', 'casual', 'inspiring', 'educational', 'entertaining'];
    const mediaTypes = ['text', 'image', 'video', 'carousel'] as const;
    
    const randomContent = {
      id: Date.now().toString() + Math.random(),
      type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      title: `${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`,
      content: `This is AI-generated content based on: "${prompt}". 

🎯 Key message: ${prompt}
💡 Value proposition: Engaging content that resonates with your audience
🚀 Call to action: Engage with your community

Generated with advanced AI to match your brand voice and objectives.`,
      hashtags: ['#content', '#marketing', '#engagement', '#socialmedia', '#business'],
      tone: contentSettings.tone,
      targetAudience: contentSettings.audience,
      estimatedPerformance: {
        engagement: Math.floor(Math.random() * 100) + 50,
        reach: Math.floor(Math.random() * 5000) + 1000,
        impressions: Math.floor(Math.random() * 10000) + 2000
      },
      suggestedTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      mediaType: mediaTypes[Math.floor(Math.random() * mediaTypes.length)]
    };

    return randomContent;
  };

  const handleOptimizeContent = useCallback(async () => {
    if (!contentToOptimize.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate optimization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const optimized = {
        id: Date.now().toString(),
        type: 'post' as const,
        title: 'Optimized Content',
        content: `OPTIMIZED VERSION:

${contentToOptimize}

✨ IMPROVEMENTS:
• Enhanced hook for better engagement
• Added emotional triggers
• Improved call-to-action
• Optimized for platform algorithm

📊 EXPECTED PERFORMANCE BOOST:
• +25% engagement rate
• +40% reach potential
• Better algorithm visibility`,
        hashtags: ['#optimized', '#performance', '#engagement'],
        tone: contentSettings.tone,
        targetAudience: contentSettings.audience,
        estimatedPerformance: {
          engagement: 85,
          reach: 3500,
          impressions: 7500
        },
        suggestedTime: new Date().toISOString(),
        mediaType: 'text' as const
      };

      setGeneratedContent([optimized]);
      success('Content Optimized', 'Your content has been enhanced for better performance');
    } catch (err) {
      error('Optimization Failed', 'Unable to optimize content');
    } finally {
      setIsGenerating(false);
    }
  }, [contentToOptimize, contentSettings, success, error]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'carousel': return Copy;
      default: return Type;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Content Generator</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, optimize, and analyze content with advanced AI
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Settings className="w-4 h-4" />}
            onClick={() => info('Settings', 'Content generation settings')}
          >
            Settings
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {[
            { key: 'create', label: 'Create', icon: Wand2 },
            { key: 'optimize', label: 'Optimize', icon: TrendingUp },
            { key: 'analyze', label: 'Analyze', icon: BarChart3 },
            { key: 'batch', label: 'Batch Generate', icon: Copy }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all
                  ${activeTab === tab.key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Create Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Template (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contentTemplates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => setSelectedTemplate(template)}
                        className={`
                          p-3 text-left border rounded-lg transition-all
                          ${selectedTemplate?.name === template.name
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }
                        `}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Settings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platform
                    </label>
                    <select
                      value={contentSettings.platform}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tone
                    </label>
                    <select
                      value={contentSettings.tone}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="inspiring">Inspiring</option>
                      <option value="educational">Educational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Length
                    </label>
                    <select
                      value={contentSettings.length}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, length: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Audience
                    </label>
                    <select
                      value={contentSettings.audience}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, audience: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="general">General</option>
                      <option value="young_adults">Young Adults</option>
                      <option value="professionals">Professionals</option>
                      <option value="seniors">Seniors</option>
                    </select>
                  </div>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Prompt
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to create... Be specific about your message, audience, and goals."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                  leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                >
                  {isGenerating ? 'Generating Content...' : 'Generate Content'}
                </Button>
              </div>
            )}

            {/* Optimize Tab */}
            {activeTab === 'optimize' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content to Optimize
                  </label>
                  <textarea
                    value={contentToOptimize}
                    onChange={(e) => setContentToOptimize(e.target.value)}
                    placeholder="Paste your existing content here to get optimization suggestions..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={6}
                  />
                </div>

                <Button
                  onClick={handleOptimizeContent}
                  disabled={!contentToOptimize.trim() || isGenerating}
                  className="w-full"
                  leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                >
                  {isGenerating ? 'Optimizing...' : 'Optimize Content'}
                </Button>
              </div>
            )}

            {/* Batch Generate Tab */}
            {activeTab === 'batch' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch Generation Settings
                  </label>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Number of variations
                      </label>
                      <select
                        value={batchCount}
                        onChange={(e) => setBatchCount(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <option value={3}>3 variations</option>
                        <option value={5}>5 variations</option>
                        <option value={10}>10 variations</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your base concept. AI will create multiple variations..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                  leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
                >
                  {isGenerating ? `Generating ${batchCount} Variations...` : `Generate ${batchCount} Variations`}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Generated Content Display */}
        {generatedContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Content ({generatedContent.length})
              </h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Export All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setGeneratedContent([])}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {generatedContent.map((content, index) => {
                const MediaIcon = getMediaTypeIcon(content.mediaType);
                return (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MediaIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {content.type} • {content.mediaType}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" leftIcon={<Copy className="w-3 h-3" />}>
                          Copy
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                          Preview
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                        {content.content}
                      </pre>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {content.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Engagement</div>
                        <div className={`font-semibold ${getPerformanceColor(content.estimatedPerformance.engagement)}`}>
                          {content.estimatedPerformance.engagement}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Estimated Reach</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {content.estimatedPerformance.reach.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Impressions</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {content.estimatedPerformance.impressions.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedContentGenerator;