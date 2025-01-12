import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPreferences } from '@/types/preferences';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { generateNewsletterPrompt, NewsletterPromptParams } from '@/utils/prompts/newsletterPrompt';

interface NewsletterProps {
  preferences?: UserPreferences;
  onClear?: () => void;
  onRegenerate?: (prompt: string) => void;
}

const Newsletter: React.FC<NewsletterProps> = ({ 
  preferences = {
    platforms: {
      instagram: true,
      linkedin: true,
      twitter: true,
      facebook: true,
      tiktok: false,
      discord: false
    },
    contentTypes: {
      newsletter: true
    },
    tone: 'professional',
    platformFormats: {
      instagram: {
        imageGeneration: false,
        hashtagSuggestions: false
      },
      linkedin: {
        professionalTone: true
      },
      twitter: {
        characterLimitOptimization: false
      },
      tiktok: {
        trendingHashtags: false
      },
      facebook: {
        communityEngagement: false
      },
      discord: {
        threadedDiscussions: false
      }
    }
  }, 
  onClear, 
  onRegenerate 
}) => {
  const [newsletterType, setNewsletterType] = useState('industry');
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const newsletterTypes = [
    { value: 'industry', label: 'Industry Insights' },
    { value: 'product', label: 'Product Updates' },
    { value: 'educational', label: 'Educational' },
    { value: 'personal', label: 'Personal Branding' },
    { value: 'trend', label: 'Trend Analysis' }
  ];

  const handleGenerate = () => {
    // Validate inputs
    if (!topic || !targetAudience) {
      alert('Please provide a topic and target audience');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare prompt parameters
      const promptParams: NewsletterPromptParams = {
        topic,
        style: newsletterType,
        audience: targetAudience,
        guidelines: keyPoints,
        tone: preferences.tone === 'professional' ? 'professional' : 'conversational',
        length: 'medium'
      };

      // Generate prompt
      const prompt = generateNewsletterPrompt(promptParams, preferences);

      // Call parent component's generate handler with the prompt
      if (onRegenerate) {
        onRegenerate(prompt);
      }
    } catch (error) {
      console.error('Newsletter prompt generation error:', error);
      alert('Failed to generate newsletter prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setNewsletterType('industry');
    setTopic('');
    setKeyPoints('');
    setTargetAudience('');
    
    if (onClear) {
      onClear();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 p-4 bg-background rounded-lg shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Newsletter Type</Label>
          <Select 
            value={newsletterType} 
            onValueChange={setNewsletterType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Newsletter Type" />
            </SelectTrigger>
            <SelectContent>
              {newsletterTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Topic</Label>
          <Input 
            placeholder="Enter newsletter topic" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Key Points</Label>
        <Textarea 
          placeholder="List key points or sections for your newsletter" 
          value={keyPoints}
          onChange={(e) => setKeyPoints(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label>Target Audience</Label>
        <Input 
          placeholder="Describe your target audience" 
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </div>

      <div className="flex justify-between space-x-4">
        <Button 
          variant="outline" 
          onClick={handleClear}
          className="w-full"
          disabled={isGenerating}
        >
          Clear
        </Button>
        <Button 
          onClick={handleGenerate}
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Newsletter'}
        </Button>
      </div>
    </motion.div>
  );
};

export default Newsletter;
