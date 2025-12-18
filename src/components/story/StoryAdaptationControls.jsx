import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wand2, BookOpen, Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StoryAdaptationControls({ 
  onApplyAdaptation, 
  onGenerateVariation,
  currentLanguage,
  isLoading = false,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('adapt');
  const [readingLevel, setReadingLevel] = useState('intermediate');
  const [vocabulary, setVocabulary] = useState('standard');
  const [variationType, setVariationType] = useState('sequel');

  const handleAdapt = () => {
    onApplyAdaptation({ reading_level: readingLevel, vocabulary_preference: vocabulary });
  };

  const handleGenerateVariation = () => {
    onGenerateVariation({ variation_type: variationType });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-40 w-96"
    >
      <Card className="p-4 shadow-2xl border-2" style={{ borderColor: '#FF6B35' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Wand2 className="w-5 h-5" style={{ color: '#FF6B35' }} />
            AI Story Tools
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'adapt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('adapt')}
            className="flex-1"
            style={activeTab === 'adapt' ? {
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
              color: '#FFFFFF'
            } : {}}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Adapt
          </Button>
          <Button
            variant={activeTab === 'generate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('generate')}
            className="flex-1"
            style={activeTab === 'generate' ? {
              background: 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
              color: '#FFFFFF'
            } : {}}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'adapt' && (
            <motion.div
              key="adapt"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Reading Level
                </label>
                <Select value={readingLevel} onValueChange={setReadingLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (Ages 6-8)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Ages 8-10)</SelectItem>
                    <SelectItem value="advanced">Advanced (Ages 10-12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vocabulary
                </label>
                <Select value={vocabulary} onValueChange={setVocabulary}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="enriched">Enriched</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAdapt} 
                disabled={isLoading}
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                  color: '#FFFFFF'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adapting...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Adapt Story
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                AI will adjust difficulty and vocabulary to match your preferences
              </p>
            </motion.div>
          )}

          {activeTab === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Variation Type
                </label>
                <Select value={variationType} onValueChange={setVariationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequel">
                      <div className="flex items-center gap-2">
                        <span>📖</span>
                        <div>
                          <div className="font-medium">Sequel</div>
                          <div className="text-xs text-gray-500">Continue the story</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="alternative">
                      <div className="flex items-center gap-2">
                        <span>🔀</span>
                        <div>
                          <div className="font-medium">Alternative Path</div>
                          <div className="text-xs text-gray-500">Different outcome</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="expanded">
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <div>
                          <div className="font-medium">Expanded Version</div>
                          <div className="text-xs text-gray-500">More details</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="personalized">
                      <div className="flex items-center gap-2">
                        <span>✨</span>
                        <div>
                          <div className="font-medium">Personalized</div>
                          <div className="text-xs text-gray-500">Based on your interests</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateVariation} 
                disabled={isLoading}
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
                  color: '#FFFFFF'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Story
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                AI will create a unique story variation just for you
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}