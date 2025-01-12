import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Sun, Moon, Settings,} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import GeneratedContent from './components/GeneratedContent';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import TemplatesPage from './pages/TemplatesPage';
import AILoader from './components/AILoader';
import PreferenceSelection from './components/PreferenceSelection';
import { UserPreferences } from './types/preferences';
import Polls from './components/Polls';
import { FileText, MessageSquare, PieChart } from 'lucide-react';
import Newsletter from '@/components/Newsletter';
import { NewsletterPromptParams, generateNewsletterPrompt } from './utils/prompts/newsletterPrompt';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'Professional' | 'Casual & Engaging' | 'Educational Content';
  tag: 'Business' | 'General' | 'Education';
  postType: 'short' | 'long' | 'thread';
  audience: string;
  style: string;
  guidelines: string;
}

function App() {
  const [isDark, setIsDark] = useState(true)
  const [activeTab, setActiveTab] = useState('newsletter')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  
  // Form state
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [style, setStyle] = useState('')
  const [guidelines, setGuidelines] = useState('')

  // Preference state
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    platforms: {
      instagram: true,
      linkedin: true,
      twitter: true,
      tiktok: true,
      facebook: true,
      discord: true
    },
    tone: 'professional',
    platformFormats: {
      instagram: {
        imageGeneration: true,
        hashtagSuggestions: true
      },
      linkedin: {
        professionalTone: true
      },
      twitter: {
        characterLimitOptimization: true
      },
      tiktok: {
        trendingHashtags: true
      },
      facebook: {
        communityEngagement: true
      },
      discord: {
        threadedDiscussions: true
      }
    },
    contentTypes: {
      motivational: true,
      educational: true,
      promotional: true,
      personal: true,
      newsletter: true
    }
  });

  const handleOpenPreferences = () => {
    setIsPreferencesOpen(true);
  };

  const handleClosePreferences = () => {
    setIsPreferencesOpen(false);
  };

  const handleSavePreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    // Additional logic for saving preferences
  };

  // Effect to handle theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [isDark])

  const handleTemplateSelect = (template: Template | null) => {
    setSelectedTemplate(template);
    if (template) {
      // Automatically set some default values based on the selected template
      setTopic(''); // Reset topic to allow user input
      setAudience(template.audience || '');
      setStyle(template.style || '');
      setGuidelines(template.guidelines || '');
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudience(e.target.value);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyle(e.target.value);
  };

  const handleGuidelinesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGuidelines(e.target.value);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const enhancedPrompt = `${topic} ${audience} ${style} ${guidelines}`;
      console.log('Sending request to generate content...');

      const apiEndpoint = import.meta.env.PROD 
        ? '/.netlify/functions/generatePost'
        : 'http://localhost:3000/api/generatePost';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postType: activeTab.replace('-form', ''),
          topic: enhancedPrompt,
          audience,
          style,
          guidelines,
        }),
      });

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse server response:', parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      if (!response.ok) {
        console.error('Server returned error:', data);
        throw new Error(data.error || 'Server returned an error');
      }

      console.log('Server response parsed:', data);

      if (data.success) {
        setGeneratedContent(data.content);
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        alert(error.message || 'Failed to generate content. Please try again.');
      } else {
        // Fallback for non-Error objects
        alert('Failed to generate content. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setGeneratedContent('');
  };

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/content-generator', label: 'Content Generator' },
    { path: '/templates', label: 'Templates' },
    { path: '/polls', label: 'Polls' },
    { path: '/pricing', label: 'Pricing' }
  ];

  const postTypeTabs = [
    { id: 'short-form', label: 'Short Form', icon: <FileText size={16} /> },
    { id: 'long-form', label: 'Long Form', icon: <FileText size={16} /> },
    { id: 'thread', label: 'Threads', icon: <MessageSquare size={16} /> },
    { id: 'newsletter', label: 'Newsletter', icon: <PieChart size={16} /> }
  ];

  const seoMetadata = {
    title: 'Intellisync Solutions Social Media Writer | AI Content Generation',
    description: 'Revolutionize your social media strategy with AI-powered content generation. Create engaging posts, threads, and long-form content effortlessly.',
    keywords: [
      'AI writing',
      'social media content',
      'content generation',
      'copywriting',
      'thread writer',
      'post generator',
      'marketing AI',
      'content strategy'
    ],
    canonical: 'https://home.intellisyncsolutions.io',
    ogImage: '/og-image.png',
    twitterImage: '/twitter-image.png'
  };

  const [currentView, setCurrentView] = useState<'generator' | 'landing' | 'polls' | 'pricing' | 'templates'>('generator');

  return (
    <HelmetProvider>
      <MainLayout>
        <Helmet>
          <title>IntelliSync Solutions - Social Media Writer</title>
          <meta name="description" content="AI-powered social media content generator" />
        </Helmet>

        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-bold text-xl">IntelliSync</span>
                  </motion.div>
                </a>
              </div>

              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="h-9 w-9"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenPreferences}
                  className="h-9 w-9"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex justify-center mb-4 space-x-4">
              <button
                onClick={() => setCurrentView('landing')}
                className={`
                  px-4 py-2 rounded-md transition-colors duration-300
                  ${currentView === 'landing' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('generator')}
                className={`
                  px-4 py-2 rounded-md transition-colors duration-300
                  ${currentView === 'generator' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                Content Generator
              </button>
              <button
                onClick={() => setCurrentView('templates')}
                className={`
                  px-4 py-2 rounded-md transition-colors duration-300
                  ${currentView === 'templates' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                Templates
              </button>
              <button
                onClick={() => setCurrentView('polls')}
                className={`
                  px-4 py-2 rounded-md transition-colors duration-300
                  ${currentView === 'polls' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                Polls
              </button>
            </div>

            {currentView === 'generator' && (
              <div className="max-w-4xl mx-auto p-4">
                <Card className="p-6">
                  <CardContent>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Topic</label>
                        <input
                          type="text"
                          value={topic}
                          onChange={handleTopicChange}
                          placeholder="Enter your content topic"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Target Audience</label>
                        <input
                          type="text"
                          value={audience}
                          onChange={handleAudienceChange}
                          placeholder="Describe your target audience"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Writing Style</label>
                        <input
                          type="text"
                          value={style}
                          onChange={handleStyleChange}
                          placeholder="Describe the desired writing style"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Additional Guidelines</label>
                        <textarea
                          value={guidelines}
                          onChange={handleGuidelinesChange}
                          placeholder="Any specific guidelines or requirements"
                          className="w-full p-2 border rounded"
                          rows={3}
                        />
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 transition-colors"
                      >
                        {isLoading ? 'Generating...' : 'Generate Content'}
                      </button>
                    </div>
                  </CardContent>

                  <Tabs defaultValue="short" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="short" className="flex items-center gap-2">
                        <FileText size={16} /> Short Form
                      </TabsTrigger>
                      <TabsTrigger value="long" className="flex items-center gap-2">
                        <MessageSquare size={16} /> Long Form
                      </TabsTrigger>
                      <TabsTrigger value="threads" className="flex items-center gap-2">
                        <PieChart size={16} /> Threads
                      </TabsTrigger>
                      <TabsTrigger value="newsletter" className="flex items-center gap-2">
                        <FileText size={16} /> Newsletter
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="short">
                      <GeneratedContent 
                        topic={topic} 
                        audience={audience} 
                        style={style} 
                        guidelines={guidelines}
                        isLoading={isLoading}
                        generatedContent={generatedContent}
                      />
                    </TabsContent>
                    
                    <TabsContent value="long">
                      <GeneratedContent 
                        topic={topic} 
                        audience={audience} 
                        style={style} 
                        guidelines={guidelines}
                        isLoading={isLoading}
                        generatedContent={generatedContent}
                      />
                    </TabsContent>
                    
                    <TabsContent value="threads">
                      <GeneratedContent 
                        topic={topic} 
                        audience={audience} 
                        style={style} 
                        guidelines={guidelines}
                        isLoading={isLoading}
                        generatedContent={generatedContent}
                      />
                    </TabsContent>
                    
                    <TabsContent value="newsletter">
                      <Newsletter 
                        preferences={userPreferences} 
                        onClear={() => {
                          setGeneratedContent('');
                          setTopic('');
                        }}
                        onRegenerate={() => {
                          const regenerateNewsletter = async () => {
                            try {
                              setIsLoading(true);
                              
                              // Use existing state for newsletter generation
                              const newsletterParams: NewsletterPromptParams = {
                                topic: topic || 'Technology Trends',  // Fallback topic if not set
                                style: style || 'Professional',       // Fallback style
                                audience: audience || 'Tech Professionals', // Fallback audience
                                guidelines: guidelines,
                                tone: 'professional',
                                length: 'medium'
                              };

                              // Generate prompt using existing utility
                              const prompt = generateNewsletterPrompt(newsletterParams, userPreferences);

                              // Call OpenAI API to generate newsletter content
                              const response = await fetch('/api/generate', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  prompt: prompt,
                                  model: 'gpt-4o-mini',  // Use the specified model from guidelines
                                  max_tokens: 1000,      // Adjust as needed
                                  temperature: 0.7       // Slight creativity for regeneration
                                })
                              });

                              if (!response.ok) {
                                throw new Error('Failed to generate newsletter');
                              }

                              const data = await response.json();
                              
                              // Update generated content
                              setGeneratedContent(data.content);
                              setIsLoading(false);
                            } catch (error) {
                              console.error('Newsletter regeneration error:', error);
                              setIsLoading(false);
                              // Optional: Add error handling UI
                            }
                          };

                          regenerateNewsletter();
                        }}
                      />
                    </TabsContent>
                  </Tabs>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-8"
                    >
                      <AILoader isLoading={isLoading} />
                    </motion.div>
                  )}
                </Card>
              </div>
            )}

            {currentView === 'landing' && <LandingPage />}
            
            {currentView === 'templates' && <TemplatesPage />}
            {currentView === 'polls' && <Polls />}
            {currentView === 'pricing' && <PricingPage />}
          </main>

          <Footer className="mt-auto" />
        </div>

        <PreferenceSelection
          open={isPreferencesOpen}
          onClose={handleClosePreferences}
          onSave={handleSavePreferences}
          onNavigate={setCurrentView}
        />
      </MainLayout>
    </HelmetProvider>
  );
}

export default App
