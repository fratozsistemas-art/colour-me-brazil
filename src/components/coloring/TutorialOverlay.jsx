import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const TUTORIALS = {
  basics: {
    id: 'basics',
    title: 'Coloring Basics',
    steps: [
      {
        title: 'Welcome! 🎨',
        description: 'Let\'s learn how to use the coloring tools. This tutorial will show you the basics.',
        target: null
      },
      {
        title: 'Choose Paint Mode',
        description: 'Switch between Freeform (drawing with brushes) and Fill (clicking to fill areas).',
        target: 'paint-mode',
        highlight: { top: 100, left: 20, width: 300, height: 60 }
      },
      {
        title: 'Select Colors',
        description: 'Pick colors from the palette. Your recent colors will be saved for quick access.',
        target: 'color-palette',
        highlight: { top: 400, left: 20, width: 300, height: 150 }
      },
      {
        title: 'Adjust Brush Size',
        description: 'In Freeform mode, use the slider to change your brush size.',
        target: 'brush-size',
        highlight: { top: 600, left: 20, width: 300, height: 100 }
      },
      {
        title: 'Undo & Redo',
        description: 'Made a mistake? Use Undo/Redo to fix it. Your work is automatically saved.',
        target: 'undo-redo',
        highlight: { top: 800, left: 20, width: 300, height: 80 }
      }
    ]
  },
  gradient: {
    id: 'gradient',
    title: 'Gradient Fills',
    steps: [
      {
        title: 'Advanced Gradient Fills 🌈',
        description: 'Create beautiful color transitions across multiple areas.',
        target: null
      },
      {
        title: 'Enable Gradient Mode',
        description: 'Switch to Fill mode, then click "Gradient Fill Mode" button.',
        target: 'gradient-button'
      },
      {
        title: 'Select Areas',
        description: 'Click on different areas you want to fill with a gradient. They\'ll be highlighted.',
        target: null
      },
      {
        title: 'Choose Gradient Colors',
        description: 'Pick 2-5 colors for your gradient. You can add or remove color stops.',
        target: 'gradient-colors'
      },
      {
        title: 'Apply Gradient',
        description: 'Click "Apply Gradient" to fill all selected areas with a smooth color transition.',
        target: 'apply-gradient'
      }
    ]
  },
  texture: {
    id: 'texture',
    title: 'Texture Fills',
    steps: [
      {
        title: 'Texture Patterns 🎨',
        description: 'Add interesting patterns to your coloring.',
        target: null
      },
      {
        title: 'Switch to Fill Mode',
        description: 'Make sure you\'re in Fill mode to use textures.',
        target: 'paint-mode'
      },
      {
        title: 'Select a Texture',
        description: 'Choose from Dots, Stripes, Crosshatch, or Noise patterns.',
        target: 'texture-selector'
      },
      {
        title: 'Click to Apply',
        description: 'Click on an area to fill it with the selected texture overlay.',
        target: null
      },
      {
        title: 'Mix with Colors',
        description: 'Textures blend with your chosen colors for unique effects.',
        target: null
      }
    ]
  },
  colorAdjust: {
    id: 'colorAdjust',
    title: 'Color Adjustments',
    steps: [
      {
        title: 'Fine-tune Your Colors 🎨',
        description: 'Adjust the overall look of your artwork.',
        target: null
      },
      {
        title: 'Open Color Adjustment',
        description: 'Click the "Color Adjustment" button to reveal controls.',
        target: 'color-adjust-button'
      },
      {
        title: 'Hue Slider',
        description: 'Shift all colors in your artwork. Great for changing the mood!',
        target: 'hue-slider'
      },
      {
        title: 'Saturation Control',
        description: 'Make colors more vivid or more muted.',
        target: 'saturation-slider'
      },
      {
        title: 'Brightness Control',
        description: 'Lighten or darken the overall image.',
        target: 'brightness-slider'
      },
      {
        title: 'Apply Changes',
        description: 'Click "Apply" to save your adjustments. Use "Reset" to start over.',
        target: 'apply-adjust'
      }
    ]
  }
};

export default function TutorialOverlay({ tutorialId, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorial = TUTORIALS[tutorialId];

  if (!tutorial) return null;

  const step = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onSkip} />

      {/* Tutorial card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Step {currentStep + 1} of {tutorial.steps.length}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onSkip}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorial.steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <p className="text-gray-700 mb-6 leading-relaxed">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onSkip} className="text-gray-500">
                Skip Tutorial
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-pink-500 gap-2"
              >
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { TUTORIALS };