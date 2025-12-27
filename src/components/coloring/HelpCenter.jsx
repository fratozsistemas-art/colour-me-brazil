import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Book, Paintbrush, Grid3x3, Palette, Lightbulb, X } from 'lucide-react';
import { motion } from 'framer-motion';

const HELP_ARTICLES = [
  {
    id: 'getting-started',
    title: 'Getting Started with Coloring',
    category: 'Basics',
    icon: Book,
    keywords: ['start', 'begin', 'intro', 'first', 'new'],
    content: `Welcome to Colour Me Brazil! Here's how to get started:

1. Choose Your Mode: Select between Freeform (brush drawing) or Fill (click to fill areas)
2. Pick Colors: Click on colors from the palette or use the color picker
3. Start Creating: Draw or click to fill areas with beautiful colors
4. Save Your Work: Your progress is automatically saved as you work

Tips for beginners:
• Use Freeform mode for detailed work
• Use Fill mode for large areas
• Zoom in/out with the zoom controls
• Undo mistakes with Ctrl+Z`
  },
  {
    id: 'brush-types',
    title: 'Understanding Brush Types',
    category: 'Brushes',
    icon: Paintbrush,
    keywords: ['brush', 'watercolor', 'airbrush', 'marker', 'pencil', 'ink', 'tool'],
    content: `We offer 10 unique brush types:

• Solid: Classic solid brush for crisp lines
• Watercolor: Soft, translucent effect with natural bleeding
• Airbrush: Spray paint effect for soft gradients
• Calligraphy: Elegant variable-width strokes
• Crayon: Textured, waxy appearance
• Marker: Bold, slightly transparent strokes
• Pencil: Sketchy, textured lines
• Ink: Smooth flowing lines with slight blur
• Chalk: Dusty, powdery texture
• Oil Paint: Thick, rich paint texture

Each brush has adjustable parameters like opacity, flow, blur, spacing, jitter, and texture intensity.`
  },
  {
    id: 'fill-mode',
    title: 'Mastering Fill Mode',
    category: 'Tools',
    icon: Grid3x3,
    keywords: ['fill', 'bucket', 'flood', 'area', 'click', 'tolerance'],
    content: `Fill mode lets you color large areas quickly:

How to Use:
1. Switch to Fill mode
2. Click on an enclosed area to fill it
3. Adjust tolerance if needed (15-30 recommended for line art)

Fill Tolerance:
• Lower values (5-15): Stricter boundaries, precise fills
• Medium values (15-30): Balanced, works for most line art
• Higher values (30-80): Looser, fills through gaps

Tips:
• Enable "Show fill preview" to see the area before clicking
• Fill preview shows you exactly what will be colored
• If fill spills over, lower the tolerance value`
  },
  {
    id: 'gradient-fills',
    title: 'Creating Gradient Fills',
    category: 'Advanced',
    icon: Palette,
    keywords: ['gradient', 'transition', 'blend', 'rainbow', 'multi-color'],
    content: `Gradient fills create smooth color transitions:

Steps:
1. Switch to Fill mode
2. Click "Gradient Fill Mode" button
3. Click on areas to select them (they'll highlight)
4. Choose 2-5 gradient colors using the color stops
5. Click "Apply Gradient" to fill all selected areas

Gradient Options:
• Add color stops: Click the + button
• Remove stops: Click the X on each stop
• Change colors: Click on any color stop to adjust
• Clear selection: Click "Clear" to start over

The gradient flows diagonally across all selected areas for a unified look.`
  },
  {
    id: 'texture-fills',
    title: 'Using Texture Patterns',
    category: 'Advanced',
    icon: Grid3x3,
    keywords: ['texture', 'pattern', 'dots', 'stripes', 'crosshatch', 'noise'],
    content: `Add interesting patterns to your coloring:

Available Textures:
• None: Standard solid fill
• Dots: Polka dot pattern
• Stripes: Vertical striped pattern
• Crosshatch: Grid/mesh pattern
• Noise: Random speckled texture

How to Use:
1. Switch to Fill mode
2. Select a texture from the Texture Fill section
3. Choose your base color
4. Click on an area to fill with textured pattern

The texture blends with your chosen color at 30% opacity for a subtle effect.`
  },
  {
    id: 'color-adjustment',
    title: 'Adjusting Colors Globally',
    category: 'Advanced',
    icon: Palette,
    keywords: ['adjust', 'hue', 'saturation', 'brightness', 'filter', 'effect'],
    content: `Fine-tune the entire artwork at once:

Color Adjustment Controls:
• Hue (-180° to +180°): Shift all colors on the color wheel
• Saturation (0-200%): Make colors more vivid or muted
• Brightness (0-200%): Lighten or darken the image

How to Use:
1. Click "Color Adjustment" to open controls
2. Adjust sliders to preview effects
3. Click "Apply" to make changes permanent
4. Use "Reset" to return to 0/100%/100%

Note: Adjustments affect colored areas only, not black lines.`
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'Tips',
    icon: Lightbulb,
    keywords: ['keyboard', 'shortcut', 'hotkey', 'key', 'ctrl', 'fast'],
    content: `Speed up your workflow with shortcuts:

Essential Shortcuts:
• Ctrl + Z: Undo last action
• Ctrl + Y: Redo action
• Ctrl + Click + Drag: Pan around the canvas
• Ctrl + Scroll: Zoom in/out
• Space + Drag: Alternative pan method

Mouse Controls:
• Left Click: Draw/Fill
• Middle Click + Drag: Pan
• Scroll Wheel: Zoom (when Ctrl held)

Mobile/Touch:
• Pinch: Zoom in/out
• Two-finger drag: Pan canvas
• Tap: Draw/Fill based on mode`
  },
  {
    id: 'saving-sharing',
    title: 'Saving and Sharing Your Art',
    category: 'Tips',
    icon: Lightbulb,
    keywords: ['save', 'download', 'share', 'export', 'gallery', 'showcase'],
    content: `Preserve and share your creations:

Save Options:
• Save Progress: Saves your current work automatically
• Download: Export as PNG image to your device
• Share to Gallery: Post your artwork to your personal gallery
• Share to Showcase: Make your art visible to others in the community

Your Progress:
• Work is auto-saved every time you save manually
• Coloring time is tracked
• Completion status is calculated based on strokes and fills

Session Stats:
View real-time stats including:
• Current mode and brush type
• Zoom level
• Number of strokes and fills
• Time spent coloring`
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    category: 'Help',
    icon: Lightbulb,
    keywords: ['problem', 'error', 'issue', 'fix', 'help', 'not working'],
    content: `Solutions to common problems:

Fill Not Working:
• Check if you're clicking inside an enclosed area
• Adjust fill tolerance (try 15-30 for line art)
• Make sure you're in Fill mode, not Freeform

Canvas is Laggy:
• Zoom out to see the whole image
• Clear your browser cache
• Try using fewer strokes (use fill instead)

Colors Look Wrong:
• Check if Color Adjustment is active
• Reset adjustments to defaults
• Choose a different palette

Can't See My Strokes:
• Increase brush size
• Check brush opacity isn't too low
• Make sure you're not in Eraser mode

Lost My Work:
• Check if you saved your progress
• Your session is auto-saved on manual save
• Downloaded images are in your device's downloads folder`
  }
];

export default function HelpCenter({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = HELP_ARTICLES.filter(article => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.keywords.some(keyword => keyword.includes(query)) ||
      article.content.toLowerCase().includes(query)
    );
  });

  const groupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {});

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Book className="w-6 h-6 text-purple-600" />
            Help Center
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Article List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {Object.entries(groupedArticles).map(([category, articles]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {articles.map(article => {
                      const Icon = article.icon;
                      return (
                        <motion.button
                          key={article.id}
                          whileHover={{ x: 4 }}
                          onClick={() => setSelectedArticle(article)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedArticle?.id === article.id
                              ? 'bg-purple-100 border-purple-300 border'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 line-clamp-1">
                              {article.title}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-6">
            {selectedArticle ? (
              <motion.div
                key={selectedArticle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3 mb-4">
                  {React.createElement(selectedArticle.icon, {
                    className: "w-8 h-8 text-purple-600 flex-shrink-0"
                  })}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedArticle.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedArticle.category}
                    </p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 mb-4 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Book className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Welcome to Help Center
                </h3>
                <p className="text-gray-500 max-w-md">
                  Select an article from the sidebar or search for specific topics to get help with the coloring tools.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}