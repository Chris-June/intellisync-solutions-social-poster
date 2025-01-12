import React, { useState, useEffect, useRef } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  
  Youtube, 
  Copy, 
  Share2, 
  Check, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  Info 
} from 'lucide-react';
import { countTokens, getPlatformTokenLimit } from '../utils/tokenUtils';
import AILoader from './AILoader';
import { Tooltip } from '@mui/material'; 
import { ThreadList } from './threads/ThreadList';
import { ThreadPostProps } from './threads/ThreadPost';
import { UserPreferences } from '../types/preferences';

interface PlatformFormats {
  instagram?: {
    imageGeneration: boolean;
    hashtagSuggestions: boolean;
  };
  linkedin?: {
    professionalTone: boolean;
  };
  twitter?: {
    characterLimitOptimization: boolean;
  };
  tiktok?: {
    trendingHashtags: boolean;
  };
  facebook?: {
    communityEngagement: boolean;
  };
  discord?: {
    threadedDiscussions: boolean;
  };
  templates?: {
    template?: string;
  };
}

interface GeneratedContentProps {
  activeTab?: string;
  content?: string;
  onClear?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  preferences?: UserPreferences;
  topic?: string;
  audience?: string;
  style?: string;
  guidelines?: string;
  generatedContent?: string;
}

type PlatformKey = 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook' | 'discord';

export const GeneratedContent: React.FC<GeneratedContentProps> = ({ 
  activeTab, 
  content, 
  onClear, 
  onRegenerate,
  isLoading = false,
  preferences,
  topic,
  audience,
  style,
  guidelines,
  generatedContent
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [truncatedContent, setTruncatedContent] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [threads, setThreads] = useState<ThreadPostProps[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const infoIconRef = useRef<HTMLDivElement>(null);

  const dummyContent: string = content ?? "Your generated content will appear here. Fill out the form and click generate to create new content.";

  // Type guard to validate platform keys
  const isPlatformKey = (key: string | undefined): key is PlatformKey => 
    ['instagram', 'linkedin', 'twitter', 'tiktok', 'facebook', 'discord'].includes(key ?? '');

  const platformLimit = isPlatformKey(activeTab) 
    ? getPlatformTokenLimit(activeTab) 
    : 280; // Default to Twitter's limit as a fallback

  // Format content based on platform preferences
  const formatContentForPlatform = (content: string, platform?: string): string => {
    // Early return if no content or platform is provided
    if (!content || !platform) return content;

    // Validate platform key
    if (!isPlatformKey(platform)) return content;

    // Early return if no platform formats are defined
    if (!preferences?.platformFormats) return content;

    let formattedContent = content;

    // Safely access platform format with optional chaining
    const platformFormat = preferences.platformFormats[platform];
    if (!platformFormat) return content;

    // Type guard to check if the platform format has templates
    const hasTemplate = (format: any): format is { template?: string } => 
      format && 'template' in format;

    // Apply template if available
    if (hasTemplate(platformFormat) && platformFormat.template) {
      formattedContent = platformFormat.template.replace('{{content}}', formattedContent);
    }

    return formattedContent;
  };

  // Helper function to safely convert platform to PlatformKey
  const getPlatformKey = (platform: string | null): PlatformKey | null => {
    const validPlatforms: PlatformKey[] = ['instagram', 'linkedin', 'twitter', 'tiktok', 'facebook', 'discord'];
    return platform && validPlatforms.includes(platform as PlatformKey) 
      ? platform as PlatformKey 
      : null;
  };

  useEffect(() => {
    if (dummyContent) {
      const tokens = countTokens(dummyContent);
      setTokenCount(tokens);
      setEditableContent(dummyContent);
      setCharacterCount(dummyContent.length);

      // Generate hashtags for Instagram if enabled
      if (preferences?.platformFormats?.instagram?.hashtagSuggestions) {
        // This would typically call an API to generate relevant hashtags
        setHashtags(['#content', '#socialmedia', '#digital']);
      }

      if (tokens > platformLimit) {
        console.warn(`Content exceeds recommended token limit for ${activeTab} (${tokens} > ${platformLimit})`);
      }

      // Format content based on selected platform
      const platform: PlatformKey = selectedPlatform as PlatformKey;
      const formattedContent = platform 
        ? formatContentForPlatform(dummyContent, platform)
        : dummyContent;

      setTruncatedContent(formattedContent);
    }
  }, [dummyContent, selectedPlatform, preferences, platformLimit]);

  useEffect(() => {
    // Convert content to threads when content changes
    if (content && activeTab === 'Threads') {
      const threadContent = formatThreadedPost(content);
      const newThreads: ThreadPostProps[] = threadContent.split('\n\n').map((content, index) => ({
        id: `thread-${index + 1}`,
        content: content,
        likes: 0,
        retweets: 0
      }));

      setThreads(newThreads);
    }
  }, [content, activeTab]);

  const handleContentEdit = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    
    // Check character limit
    if (newContent.length > platformLimit) {
      // Prevent typing beyond limit
      e.preventDefault();
      return;
    }

    setEditableContent(newContent);
    setCharacterCount(newContent.length);
  };

  const getCharacterCountColor = () => {
    const percentageFilled = (characterCount / platformLimit) * 100;
    if (percentageFilled < 50) return 'text-green-500';
    if (percentageFilled < 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleShare = async (platform: string) => {
    // Check if platform is enabled in preferences
    if (preferences?.platforms && !preferences.platforms[platform as keyof typeof preferences.platforms]) {
      console.warn(`Platform ${platform} is disabled in preferences`);
      return;
    }

    setSelectedPlatform(platform);
    
    // Format content with platform-specific preferences
    const formattedContent = formatContentForPlatform(dummyContent, platform);
    const shareText = encodeURIComponent(formattedContent);
    
    // Get platform-specific token limit
    const maxTokens = getPlatformTokenLimit(platform);
    const tokens = countTokens(formattedContent);

    if (tokens > maxTokens) {
      console.warn(`Content exceeds ${platform} token limit (${tokens} > ${maxTokens})`);
    }

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${shareText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${shareText}`;
        break;
      case 'instagram':
        shareUrl = `https://www.instagram.com/direct/new/?text=${shareText}`;
        break;
      case 'tiktok':
        shareUrl = `https://www.tiktok.com/create/react?text=${shareText}`;
        break;
      case 'youtube':
        shareUrl = `https://www.youtube.com/upload?text=${shareText}`;
        break;
      default:
        console.warn(`Unsupported sharing platform: ${platform}`);
        return;
    }

    // Open share URL in a new window
    window.open(shareUrl, '_blank');
  };

  const handleGenerateImage = async () => {
    // Check if image generation is enabled for Instagram
    if (!preferences?.platformFormats?.instagram?.imageGeneration) {
      setImageError('Image generation is disabled in preferences');
      return;
    }

    if (!content) {
      console.error('No content available for image generation');
      return;
    }

    setIsGeneratingImage(true);
    setImageError(null);
    setImageLoadError(false);
    setGeneratedImageUrl(null);

    try {
      console.log('Starting image generation request...');
      const apiEndpoint = import.meta.env.PROD 
        ? '/api/generateImage'
        : 'http://localhost:3000/api/generateImage';
        
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create an image that visually represents the following social media content: ${content}`,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response from image generation service');
      }

      setGeneratedImageUrl(data.imageUrl);
      setImageLoadError(false);
    } catch (error: unknown) {
      console.error('Image generation error:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const proxyImageUrl = async (originalUrl: string) => {
    try {
      const response = await fetch(`/api/imageProxy?url=${encodeURIComponent(originalUrl)}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to proxy image');
      }

      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (error) {
      console.error('Error proxying image:', error);
      return null;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dummyContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to copy text:', err.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
    console.error('Failed to load generated image');
  };

  // Thread-specific methods
  const formatThreadedPost = (content: string): string => {
    // Break long content into multiple threads if needed
    const MAX_THREAD_LENGTH = 140; // Twitter-like character limit
    const threads: string[] = [];
    
    let remainingContent = content;
    while (remainingContent.length > 0) {
      const threadContent = remainingContent.slice(0, MAX_THREAD_LENGTH);
      threads.push(threadContent);
      remainingContent = remainingContent.slice(MAX_THREAD_LENGTH);
    }

    return threads.join('\n\n');
  };

  const handleCopyThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      navigator.clipboard.writeText(thread.content);
      console.log(`Thread ${threadId} copied to clipboard`);
    }
  };

  const handleGenerateThreadImage = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    setSelectedThreadId(threadId);
    setIsGeneratingImage(true);
    setImageError(null);
    setImageLoadError(false);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch('/api/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create an image that visually represents the following social media thread: ${thread.content}`,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
    } catch (error) {
      console.error('Thread image generation error:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    // Convert content to threads when content changes
    if (content && activeTab === 'Threads') {
      const threadContent = formatThreadedPost(content);
      const newThreads: ThreadPostProps[] = threadContent.split('\n\n').map((content, index) => ({
        id: `thread-${index + 1}`,
        content: content,
        likes: 0,
        retweets: 0
      }));

      setThreads(newThreads);
    }
  }, [content, activeTab]);

  // Utility component to wrap disabled buttons
  const TooltipWrapper: React.FC<{ 
    children: React.ReactElement; 
    title: string; 
    disabled?: boolean; 
  }> = ({ children, title, disabled }) => {
    return disabled ? (
      <Tooltip title={title}>
        <span style={{ cursor: 'not-allowed', display: 'inline-block' }}>
          {React.cloneElement(children, { 
            style: { 
              ...children.props.style, 
              pointerEvents: 'none', 
              opacity: 0.5 
            } 
          })}
        </span>
    </Tooltip>
    ) : (
      <Tooltip title={title}>
        {children}
      </Tooltip>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    const editableContent = content || dummyContent;

    switch (activeTab) {
      case 'Threads':
        return formatThreadedPost(editableContent);
      case 'Templates':
        return content || 'Select a template to generate content.';
      case 'short-form':
      case 'long-form':
      case 'image':
      default:
        return editableContent;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Generated {activeTab === 'short-form' ? 'Posts' : activeTab === 'long-form' ? 'Long Form Post' : activeTab === 'image' ? 'Image' : activeTab === 'Threads' ? 'Thread' : activeTab === 'Templates' ? 'Template' : 'Content'}
      </h2>

      <div className="bg-secondary/20 dark:bg-[#1a1b26] rounded-lg p-6 border border-border/50 backdrop-blur-sm shadow-soft dark:shadow-[0_0_15px_rgba(0,0,0,0.1)]">
        <div 
          ref={contentEditableRef}
          contentEditable={isEditing}
          onInput={handleContentEdit}
          onClick={() => setIsEditing(true)}
          className={`
            ${isEditing ? 'border-2 border-blue-500' : 'border-2 border-transparent'}
            p-2 rounded-md cursor-text
          `}
        >
          {renderContent()}
        </div>

        {/* Character Count and Info Icon */}
        <div className="flex items-center justify-between mt-2">
          <div 
            ref={infoIconRef}
            className="relative"
            onMouseEnter={() => setShowInfoTooltip(true)}
            onMouseLeave={() => setShowInfoTooltip(false)}
          >
            {showInfoTooltip && (
              <Tooltip 
                title="Edit your generated content. Formatting and character limits apply based on the selected platform."
                placement="top"
              >
                <span>
                  <Info className="w-5 h-5 text-gray-500 cursor-help" />
                </span>
              </Tooltip>
            )}
            {!showInfoTooltip && (
              <Info className="w-5 h-5 text-gray-500 cursor-help" />
            )}
          </div>
          
          <div className={`text-sm ${getCharacterCountColor()}`}>
            {characterCount} / {platformLimit} characters
          </div>
        </div>

        <div className="flex space-x-2 items-center">
          {tokenCount > 0 && (
            <div className="text-xs text-foreground/50 mr-4">
              Tokens: {tokenCount}
            </div>
          )}
          <TooltipWrapper title="Share on Twitter" disabled={isLoading}>
            <button 
              onClick={() => handleShare('twitter')}
              className={`
                p-2 rounded-full 
                ${selectedPlatform === 'twitter' ? 'bg-[#1DA1F2] text-white' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <Twitter size={20} />
            </button>
          </TooltipWrapper>
          
          <TooltipWrapper title="Share on LinkedIn" disabled={isLoading}>
            <button 
              onClick={() => handleShare('linkedin')}
              className={`
                p-2 rounded-full 
                ${selectedPlatform === 'linkedin' ? 'bg-[#0A66C2] text-white' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <Linkedin size={20} />
            </button>
          </TooltipWrapper>
          
          <TooltipWrapper title="Share on Facebook" disabled={isLoading}>
            <button 
              onClick={() => handleShare('facebook')}
              className={`
                p-2 rounded-full 
                ${selectedPlatform === 'facebook' ? 'bg-[#1877F2] text-white' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <Facebook size={20} />
            </button>
          </TooltipWrapper>
          
          <TooltipWrapper title="Share on Instagram" disabled={isLoading}>
            <button 
              onClick={() => handleShare('instagram')}
              className={`
                p-2 rounded-full 
                ${selectedPlatform === 'instagram' ? 'bg-[#E1306C] text-white' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <Instagram size={20} />
            </button>
          </TooltipWrapper>
          
        
          
          <TooltipWrapper title="Share on YouTube" disabled={isLoading}>
            <button 
              onClick={() => handleShare('youtube')}
              className={`
                p-2 rounded-full 
                ${selectedPlatform === 'youtube' ? 'bg-[#FF0000] text-white' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <Youtube size={20} />
            </button>
          </TooltipWrapper>
          
          <TooltipWrapper title="Copy Content" disabled={isLoading}>
            <button 
              onClick={copyToClipboard}
              className={`
                p-2 rounded-full 
                ${copied ? 'bg-green-500 text-white' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </TooltipWrapper>

          <TooltipWrapper title="Clear Content" disabled={isLoading}>
            <button 
              onClick={handleClear}
              className="p-2 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors duration-300"
            >
              <Trash2 size={20} />
            </button>
          </TooltipWrapper>

          <TooltipWrapper title="Regenerate Content" disabled={isLoading}>
            <button 
              onClick={handleRegenerate}
              disabled={isLoading}
              className={`
                p-2 rounded-full 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <RefreshCw size={20} />
            </button>
          </TooltipWrapper>

          <TooltipWrapper title="Generate Image" disabled={isLoading || !content}>
            <button 
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !content}
              className={`
                p-2 rounded-full 
                ${isGeneratingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 dark:hover:bg-secondary/20'}
                transition-colors duration-300
              `}
            >
              <ImageIcon size={20} />
            </button>
          </TooltipWrapper>

          <TooltipWrapper title="Token Information" disabled={isLoading}>
            <div 
              ref={infoIconRef}
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              className="p-2 rounded-full hover:bg-secondary/50 dark:hover:bg-secondary/20 transition-colors duration-300 cursor-help"
            >
              <Info size={20} />
            </div>
          </TooltipWrapper>
        </div>
      </div>

      {threads.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Threaded Posts</h3>
          <ThreadList 
            threads={threads}
            onCopyThread={handleCopyThread}
            onGenerateThreadImage={handleGenerateThreadImage}
          />
        </div>
      )}

      {(generatedImageUrl || isGeneratingImage) && (
        <div className="w-full flex flex-col items-center justify-center gap-4 mt-4">
          {isGeneratingImage ? (
            <div className="w-full max-w-md">
              <AILoader 
                isLoading={true}
                message="Generating your image with AI..."
                disabled={true}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              {generatedImageUrl && (
                <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={generatedImageUrl}
                    alt="Generated content"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', {
                        url: generatedImageUrl,
                        error: e
                      });
                      setImageLoadError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', generatedImageUrl);
                      setImageLoadError(false);
                    }}
                  />
                  {imageLoadError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-500 mb-2">Failed to load image.</p>
                        <button
                          onClick={handleGenerateImage}
                          className="text-sm text-primary hover:text-primary/80"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedPlatform && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Share2 className="w-4 h-4" />
          <span>Opening share dialog for {selectedPlatform}...</span>
        </div>
      )}
    </div>
  );
};

export default GeneratedContent;
