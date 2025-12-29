import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Upload, Image as ImageIcon, Loader2, Download, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ArtStyleSelector from '../components/ai-art/ArtStyleSelector';
import GeneratedArtCard from '../components/ai-art/GeneratedArtCard';

const BRAZILIAN_ART_STYLES = [
  { id: 'indigenous', name: 'Indigenous Patterns', prompt: 'traditional Brazilian indigenous art patterns with vibrant colors and geometric shapes' },
  { id: 'carnival', name: 'Carnival', prompt: 'colorful Brazilian carnival art style with feathers, sequins, and celebration themes' },
  { id: 'folk', name: 'Folk Art', prompt: 'Brazilian folk art style with bright colors and naive painting techniques' },
  { id: 'modern', name: 'Modern Brazilian', prompt: 'modern Brazilian art style inspired by Oscar Niemeyer and Brazilian modernism' },
  { id: 'amazon', name: 'Amazon Nature', prompt: 'lush Amazon rainforest art style with tropical plants and wildlife' },
  { id: 'capoeira', name: 'Capoeira', prompt: 'dynamic Brazilian capoeira martial arts dance movements in artistic form' }
];

export default function AIArtStudio() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(BRAZILIAN_ART_STYLES[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const profileId = localStorage.getItem('currentProfileId');
    if (profileId) {
      loadProfile(profileId);
    }
  }, []);

  const loadProfile = async (profileId) => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ id: profileId });
      if (profiles.length > 0) {
        setCurrentProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const { data: userArtworks = [] } = useQuery({
    queryKey: ['ai-artworks', currentProfile?.id],
    queryFn: async () => {
      if (!currentProfile) return [];
      return await base44.entities.ColoredArtwork.filter({ 
        profile_id: currentProfile.id,
        is_ai_generated: true 
      });
    },
    enabled: !!currentProfile
  });

  const handleGenerateArt = async () => {
    if (!prompt.trim() || !currentProfile) return;

    setIsGenerating(true);
    try {
      const fullPrompt = `${prompt}, ${selectedStyle.prompt}, Brazilian cultural theme, child-friendly, colorful, artistic`;
      
      const result = await base44.integrations.Core.GenerateImage({
        prompt: fullPrompt
      });

      setGeneratedArt({
        url: result.url,
        prompt: prompt,
        style: selectedStyle.name,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating art:', error);
      alert('Failed to generate artwork. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStyleTransfer = async () => {
    if (!uploadedImage || !currentProfile) return;

    setIsGenerating(true);
    try {
      const stylePrompt = `Apply ${selectedStyle.name} Brazilian art style to this image. ${selectedStyle.prompt}. Maintain the original composition but transform it with Brazilian cultural artistic elements.`;
      
      const result = await base44.integrations.Core.GenerateImage({
        prompt: stylePrompt,
        existing_image_urls: [uploadedImage]
      });

      setGeneratedArt({
        url: result.url,
        prompt: `Style transfer: ${selectedStyle.name}`,
        style: selectedStyle.name,
        timestamp: new Date().toISOString(),
        originalImage: uploadedImage
      });

    } catch (error) {
      console.error('Error applying style transfer:', error);
      alert('Failed to apply style transfer. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(result.file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedArt || !currentProfile) return;

    try {
      await base44.entities.ColoredArtwork.create({
        profile_id: currentProfile.id,
        artwork_url: generatedArt.url,
        is_ai_generated: true,
        ai_prompt: generatedArt.prompt,
        ai_style: generatedArt.style,
        is_showcased: false,
        coloring_time_seconds: 0
      });

      queryClient.invalidateQueries(['ai-artworks']);
      alert('Artwork saved to your gallery!');
    } catch (error) {
      console.error('Error saving artwork:', error);
      alert('Failed to save artwork. Please try again.');
    }
  };

  const handleShareToShowcase = async () => {
    if (!generatedArt || !currentProfile) return;

    try {
      await base44.entities.ColoredArtwork.create({
        profile_id: currentProfile.id,
        artwork_url: generatedArt.url,
        is_ai_generated: true,
        ai_prompt: generatedArt.prompt,
        ai_style: generatedArt.style,
        is_showcased: true,
        coloring_time_seconds: 0
      });

      queryClient.invalidateQueries(['ai-artworks']);
      alert('Artwork shared to showcase!');
    } catch (error) {
      console.error('Error sharing artwork:', error);
      alert('Failed to share artwork. Please try again.');
    }
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Please select a profile to use the AI Art Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Art Studio
        </h1>
        <p className="text-gray-600">
          Create amazing Brazilian-themed artwork with AI assistance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="w-4 h-4" />
            Generate Art
          </TabsTrigger>
          <TabsTrigger value="style-transfer" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Style Transfer
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <Eye className="w-4 h-4" />
            My Gallery
          </TabsTrigger>
        </TabsList>

        {/* Generate Art Tab */}
        <TabsContent value="generate">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-purple-500" />
                Describe Your Artwork
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What do you want to create?</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A colorful toucan in the rainforest, children playing capoeira, Brazilian festival dancers..."
                    className="min-h-32"
                  />
                </div>

                <ArtStyleSelector
                  styles={BRAZILIAN_ART_STYLES}
                  selected={selectedStyle}
                  onSelect={setSelectedStyle}
                />

                <Button
                  onClick={handleGenerateArt}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Your Art...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Artwork
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Preview Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Preview</h2>
              
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-purple-500" />
                      <p className="text-gray-600">Generating your artwork...</p>
                    </div>
                  </motion.div>
                ) : generatedArt ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <img
                      src={generatedArt.url}
                      alt={generatedArt.prompt}
                      className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleSaveToGallery} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Save to Gallery
                      </Button>
                      <Button onClick={handleShareToShowcase} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500">
                        <Heart className="w-4 h-4" />
                        Share to Showcase
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300"
                  >
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p>Your artwork will appear here</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </TabsContent>

        {/* Style Transfer Tab */}
        <TabsContent value="style-transfer">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                Upload Your Drawing
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload an image to transform</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Uploaded" className="max-h-48 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">Click to upload an image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <ArtStyleSelector
                  styles={BRAZILIAN_ART_STYLES}
                  selected={selectedStyle}
                  onSelect={setSelectedStyle}
                />

                <Button
                  onClick={handleStyleTransfer}
                  disabled={!uploadedImage || isGenerating}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Applying Style...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Apply Brazilian Style
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Result Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Transformed Art</h2>
              
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
                      <p className="text-gray-600">Transforming your artwork...</p>
                    </div>
                  </motion.div>
                ) : generatedArt ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <img
                      src={generatedArt.url}
                      alt="Transformed"
                      className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleSaveToGallery} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Save to Gallery
                      </Button>
                      <Button onClick={handleShareToShowcase} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500">
                        <Heart className="w-4 h-4" />
                        Share to Showcase
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300"
                  >
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p>Your transformed art will appear here</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Your AI Art Gallery</h2>
            
            {userArtworks.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">You haven't created any AI artwork yet</p>
                <p className="text-sm text-gray-400 mt-2">Generate your first artwork to see it here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userArtworks.map((artwork) => (
                  <GeneratedArtCard
                    key={artwork.id}
                    artwork={artwork}
                    onDelete={async () => {
                      await base44.entities.ColoredArtwork.delete(artwork.id);
                      queryClient.invalidateQueries(['ai-artworks']);
                    }}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}