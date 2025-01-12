import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook, 
  MessageSquare,
  Save,
  X,
  CreditCard 
} from 'lucide-react';
import { UserPreferences } from '../types/preferences';

type ViewType = 'generator' | 'landing' | 'polls' | 'pricing' | 'templates';

interface PreferenceSelectionProps {
  open: boolean;
  onClose: () => void;
  onSave: (preferences: UserPreferences) => void;
  onNavigate: (view: ViewType) => void;
}

const PreferenceSelection: React.FC<PreferenceSelectionProps> = ({
  open,
  onClose,
  onSave,
  onNavigate
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
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

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Content Preferences</DialogTitle>
          <DialogDescription>
            Customize your content generation settings
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-8 py-4">
            {/* Platforms Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platforms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.platforms.instagram}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        platforms: { ...preferences.platforms, instagram: checked }
                      })
                    }
                  />
                  <Label className="flex items-center space-x-2">
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.platforms.linkedin}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        platforms: { ...preferences.platforms, linkedin: checked }
                      })
                    }
                  />
                  <Label className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.platforms.twitter}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        platforms: { ...preferences.platforms, twitter: checked }
                      })
                    }
                  />
                  <Label className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.platforms.facebook}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        platforms: { ...preferences.platforms, facebook: checked }
                      })
                    }
                  />
                  <Label className="flex items-center space-x-2">
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.platforms.discord}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        platforms: { ...preferences.platforms, discord: checked }
                      })
                    }
                  />
                  <Label className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Discord</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Tone Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Tone</h3>
              <RadioGroup
                value={preferences.tone}
                onValueChange={(value: any) =>
                  setPreferences({ ...preferences, tone: value })
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional">Professional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual">Casual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inspirational" id="inspirational" />
                  <Label htmlFor="inspirational">Inspirational</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="humorous" id="humorous" />
                  <Label htmlFor="humorous">Humorous</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Content Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Types</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.contentTypes.motivational}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        contentTypes: { ...preferences.contentTypes, motivational: checked }
                      })
                    }
                  />
                  <Label>Motivational</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.contentTypes.educational}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        contentTypes: { ...preferences.contentTypes, educational: checked }
                      })
                    }
                  />
                  <Label>Educational</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.contentTypes.promotional}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        contentTypes: { ...preferences.contentTypes, promotional: checked }
                      })
                    }
                  />
                  <Label>Promotional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.contentTypes.personal}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        contentTypes: { ...preferences.contentTypes, personal: checked }
                      })
                    }
                  />
                  <Label>Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.contentTypes.newsletter}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        contentTypes: { ...preferences.contentTypes, newsletter: checked }
                      })
                    }
                  />
                  <Label>Newsletter</Label>
                </div>
              </div>
            </div>

            {/* Pricing Link */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('pricing');
                }}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>View Pricing & Plans</span>
              </button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreferenceSelection;
