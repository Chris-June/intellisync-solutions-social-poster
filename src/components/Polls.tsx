import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Trash2, 
  Copy, 
  Share2, 
  RefreshCw, 
  Image as ImageIcon, 
  Check, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AILoader from './AILoader';
import { UserPreferences } from '../types/preferences';
import { countTokens, getPlatformTokenLimit } from '../utils/tokenUtils';

interface PollOption {
  id: string;
  text: string;
}

interface PollsProps {
  preferences?: UserPreferences;
  onClear?: () => void;
  onRegenerate?: () => void;
}

const Polls: React.FC<PollsProps> = ({ 
  preferences = {
    platforms: {
      instagram: true,
      linkedin: true,
      twitter: true,
      facebook: true
    }
  }, 
  onClear, 
  onRegenerate 
}) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [style, setStyle] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPoll, setGeneratedPoll] = useState<{
    question: string;
    options: string[];
    explanation?: string;
    imageUrl?: string;
  } | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [sharedPlatform, setSharedPlatform] = useState<string | null>(null);

  const generatePoll = async () => {
    if (!topic.trim()) {
      alert('Please provide a topic for the poll');
      return;
    }

    setIsLoading(true);
    setGeneratedPoll(null);

    try {
      const response = await fetch('/api/generate-poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          audience,
          style,
          guidelines,
          preferences: {
            platforms: preferences.platforms
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate poll');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate poll');
      }

      // Generate image for the poll
      let imageUrl;
      try {
        const imageResponse = await fetch('/api/generateImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Create a visually engaging social media poll graphic with the following poll question: "${data.question}". Include poll options and use a clean, modern design that stands out on social media.`
          })
        });

        const imageData = await imageResponse.json();
        if (imageData.success && imageData.imageUrl) {
          imageUrl = imageData.imageUrl;
        }
      } catch (imageError) {
        console.error('Image generation failed:', imageError);
        // Continue with poll generation even if image fails
      }

      setGeneratedPoll({ 
        question: data.question, 
        options: data.options,
        explanation: data.explanation,
        imageUrl
      });
    } catch (error) {
      console.error('Error generating poll:', error);
      alert('Failed to generate poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPollToClipboard = () => {
    if (!generatedPoll) return;

    const pollText = `📊 ${generatedPoll.question}\n\n${generatedPoll.options
      .map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`)
      .join('\n')}`;

    navigator.clipboard.writeText(pollText);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const sharePoll = (platform: string) => {
    if (!generatedPoll) return;

    const shareText = `📊 ${generatedPoll.question}\n\n${generatedPoll.options
      .map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`)
      .join('\n')}`;

    // Placeholder for actual sharing logic
    setSharedPlatform(platform);
    setTimeout(() => setSharedPlatform(null), 2000);
  };

  const regeneratePoll = () => {
    generatePoll();
    onRegenerate?.();
  };

  const clearPoll = () => {
    setGeneratedPoll(null);
    setTopic('');
    setAudience('');
    setStyle('');
    setGuidelines('');
    onClear?.();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 space-y-4"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80 dark:text-foreground/70">
            Poll Topic
          </label>
          <textarea
            className="w-full p-4 rounded-lg bg-white dark:bg-secondary/20 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-lifted dark:shadow-dark-lifted placeholder-foreground/50"
            placeholder="What's the main topic or idea for your poll?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80 dark:text-foreground/70">
              Target Audience
            </label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-white dark:bg-secondary/20 border border-border/50"
              placeholder="e.g., Marketing Professionals"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80 dark:text-foreground/70">
              Style
            </label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-white dark:bg-secondary/20 border border-border/50"
              placeholder="e.g., Engaging, Professional"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80 dark:text-foreground/70">
            Additional Guidelines
          </label>
          <textarea
            className="w-full p-4 rounded-lg bg-white dark:bg-secondary/20 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-lifted dark:shadow-dark-lifted placeholder-foreground/50"
            placeholder="Any specific guidelines or constraints?"
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={generatePoll} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Poll'}
        </Button>

        {isLoading && <AILoader isLoading={isLoading} />}

        {generatedPoll && (
          <div className="mt-6 space-y-4">
            {generatedPoll.imageUrl && (
              <div className="w-full flex justify-center mb-4">
                <img 
                  src={generatedPoll.imageUrl} 
                  alt="Generated Poll Graphic" 
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="bg-background dark:bg-secondary/20 p-6 rounded-lg border border-border/50">
              <h3 className="text-xl font-bold mb-4">{generatedPoll.question}</h3>
              
              {generatedPoll.options.map((option, index) => (
                <div 
                  key={index}
                  className="p-3 bg-background dark:bg-secondary/40 rounded-md border border-border/50 mb-2"
                >
                  {String.fromCharCode(65 + index)}. {option}
                </div>
              ))}

              {generatedPoll.explanation && (
                <div className="mt-4 text-sm text-foreground/70 italic">
                  {generatedPoll.explanation}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={copyPollToClipboard} 
                className="flex-1 flex items-center justify-center"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={regeneratePoll} 
                className="flex-1 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
              </Button>

              <Button 
                variant="outline" 
                onClick={clearPoll} 
                className="flex-1 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>

            <div className="mt-4 flex justify-between">
              {Object.entries(preferences.platforms || {}).map(([platform, enabled]) => 
                enabled ? (
                  <Button 
                    key={platform} 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => sharePoll(platform)}
                    className={sharedPlatform === platform ? 'text-green-500' : ''}
                  >
                    {platform === 'twitter' && <Twitter className="w-5 h-5" />}
                    {platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                    {platform === 'facebook' && <Facebook className="w-5 h-5" />}
                    {platform === 'instagram' && <Instagram className="w-5 h-5" />}
                  </Button>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Polls;
