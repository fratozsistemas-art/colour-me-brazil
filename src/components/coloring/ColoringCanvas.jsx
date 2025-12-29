import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Undo, Redo, Eraser, Save, Download, X, Paintbrush, Grid3x3, ZoomIn, ZoomOut, Maximize2, Share2, Palette, Loader2, Upload, HelpCircle, GraduationCap, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ShareButton from '../social/ShareButton';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookPalette, THEME_PALETTES, getAllPaletteNames } from './colorPalettes';
import BrushSelector, { BRUSH_TYPES } from './BrushSelector';
import AdvancedTextures, { createAdvancedTexture } from './AdvancedTextures';
import ColorBalancePanel from './ColorBalancePanel';
import TutorialOverlay from './TutorialOverlay';
import HelpCenter from './HelpCenter';
import ContextualTip from './ContextualTip';

export default function ColoringCanvas({ 
  pageId, 
  bookId, 
  profileId, 
  illustrationUrl,
  onSave,
  onClose,
  initialStrokes = [],
  bookData = null,
  lineArtUrl = null // PNG line art from manifest
}) {
  const canvasRef = useRef(null);
  const fillCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Get theme-based palette
  const currentPalette = bookData ? getBookPalette(bookData) : THEME_PALETTES.culture;
  const [availablePalettes] = useState(getAllPaletteNames());
  const [selectedPaletteKey, setSelectedPaletteKey] = useState(
    bookData?.collection === 'amazon' ? 'amazon' : 'culture'
  );
  const [currentColor, setCurrentColor] = useState(currentPalette.colors[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [strokes, setStrokes] = useState(initialStrokes);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [history, setHistory] = useState([{ strokes: initialStrokes, fills: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [startTime] = useState(Date.now());
  const [paintMode, setPaintMode] = useState('freeform');
  const [fillHistory, setFillHistory] = useState([]);
  const [recentColors, setRecentColors] = useState([]);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [brushType, setBrushType] = useState('solid');
  const [brushParams, setBrushParams] = useState({});
  const [fillTolerance, setFillTolerance] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [fillPreview, setFillPreview] = useState(null);
  const [showFillPreview, setShowFillPreview] = useState(true);
  const [gradientMode, setGradientMode] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [gradientColors, setGradientColors] = useState([currentPalette.colors[0], currentPalette.colors[1]]);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [showColorAdjust, setShowColorAdjust] = useState(false);
  const [texturePattern, setTexturePattern] = useState(null);
  const [showTutorial, setShowTutorial] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTip, setActiveTip] = useState(null);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [textureIntensity, setTextureIntensity] = useState(0.5);
  const [showAdvancedTextures, setShowAdvancedTextures] = useState(false);
  const [showColorBalance, setShowColorBalance] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Use lineArtUrl if provided, otherwise fall back to illustrationUrl
  const effectiveImageUrl = lineArtUrl || illustrationUrl;

  // Check if user has seen intro tutorial
  useEffect(() => {
    const seen = localStorage.getItem('coloringIntroSeen');
    if (!seen) {
      setHasSeenIntro(false);
      setShowTutorial('basics');
    } else {
      setHasSeenIntro(true);
    }
  }, []);

  // Show contextual tips based on actions
  useEffect(() => {
    if (!hasSeenIntro) return;

    if (paintMode === 'freeform' && !activeTip) {
      setActiveTip('first-freeform');
    } else if (paintMode === 'fill' && !gradientMode && !activeTip) {
      setActiveTip('first-fill');
    }
  }, [paintMode, hasSeenIntro]);

  useEffect(() => {
    if (gradientMode && hasSeenIntro) {
      setActiveTip('first-gradient');
    }
  }, [gradientMode, hasSeenIntro]);

  useEffect(() => {
    if (texturePattern && hasSeenIntro) {
      setActiveTip('first-texture');
    }
  }, [texturePattern, hasSeenIntro]);

  useEffect(() => {
    if (showColorAdjust && hasSeenIntro) {
      setActiveTip('first-color-adjust');
    }
  }, [showColorAdjust, hasSeenIntro]);

  // Load background image
  useEffect(() => {
    if (effectiveImageUrl) {
      setIsLoading(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImage(img);
        setIsLoading(false);
      };
      img.onerror = (error) => {
        console.error('Failed to load illustration from:', effectiveImageUrl, error);
        setIsLoading(false);
        setImageLoadError(true);
      };
      img.src = effectiveImageUrl;
    }
  }, [effectiveImageUrl]);

  // Redraw canvas whenever strokes, fills, or background image changes
  useEffect(() => {
    if (backgroundImage) {
      redrawCanvas();
    }
  }, [strokes, backgroundImage, fillHistory]);

  // ✅ CRITICAL FIX: Enhanced cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('🧹 ColoringCanvas unmounting, cleaning up resources...');
      
      const canvas = canvasRef.current;
      const fillCanvas = fillCanvasRef.current;
      
      // Clear main canvas
      if (canvas) {
        try {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 1;
          canvas.height = 1;
        } catch (error) {
          console.error('Error clearing main canvas:', error);
        }
      }
      
      // Clear fill canvas
      if (fillCanvas) {
        try {
          const ctx = fillCanvas.getContext('2d');
          ctx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
          fillCanvas.width = 1;
          fillCanvas.height = 1;
        } catch (error) {
          console.error('Error clearing fill canvas:', error);
        }
      }
      
      // Revoke blob URLs
      if (backgroundImage) {
        if (typeof backgroundImage === 'string' && backgroundImage.startsWith('blob:')) {
          URL.revokeObjectURL(backgroundImage);
        }
      }
      
      // Clear texture patterns
      if (texturePattern && texturePattern instanceof HTMLCanvasElement) {
        texturePattern.width = 1;
        texturePattern.height = 1;
      }
      
      console.log('✅ ColoringCanvas cleanup completed');
    };
  }, [backgroundImage, texturePattern]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw all fill regions first
    fillHistory.forEach(fill => {
      smartFill(ctx, fill.x, fill.y, fill.color, false);
    });

    // Draw all strokes on top
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  };

  const drawStroke = (ctx, stroke) => {
    if (stroke.points.length < 2) return;

    const brush = BRUSH_TYPES.find(b => b.id === (stroke.brushType || 'solid')) || BRUSH_TYPES[0];
    const params = stroke.params || {};

    const opacity = params.opacity ?? brush.opacity;
    const blur = params.blur ?? brush.blur;
    const flow = params.flow ?? brush.flow ?? 1.0;
    const spacing = params.spacing ?? brush.spacing ?? 0.1;
    const jitter = params.jitter ?? brush.jitter ?? 0;
    const textureIntensity = params.textureIntensity ?? brush.textureIntensity ?? 0;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = stroke.isEraser ? 1.0 : opacity * flow;

    // Apply blur
    if (blur > 0) {
      ctx.shadowBlur = blur;
      ctx.shadowColor = stroke.color;
    }

    // Add texture effects
    if (brush.texture === 'crayon' && textureIntensity > 0) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha *= (1 - textureIntensity * 0.3);
    } else if (brush.texture === 'marker') {
      ctx.lineCap = 'square';
    }

    if (stroke.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    // Calculate passes based on flow and brush type
    const passes = Math.max(1, Math.ceil((1 - flow) * 3));

    for (let pass = 0; pass < passes; pass++) {
      ctx.beginPath();

      // Apply spacing and jitter
      const step = Math.max(1, Math.floor(spacing * 20));

      for (let i = 0; i < stroke.points.length; i += step) {
        const point = stroke.points[i];
        let x = point.x;
        let y = point.y;

        // Apply jitter
        if (jitter > 0) {
          const jitterAmount = stroke.size * jitter;
          x += (Math.random() - 0.5) * jitterAmount;
          y += (Math.random() - 0.5) * jitterAmount;
        }

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

    // Reset
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  };

  const addToRecentColors = (color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width * scale);
    const scaleY = canvas.height / (rect.height * scale);

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: ((clientX - rect.left) / scale - pan.x) * scaleX,
      y: ((clientY - rect.top) / scale - pan.y) * scaleY
    };
  };

  const saveToHistory = (newStrokes, newFills) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ strokes: newStrokes, fills: newFills });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCanvasClick = (e) => {
    e.preventDefault();

    if (isLoading || !backgroundImage) {
      return;
    }

    if (paintMode === 'fill') {
      const point = getCanvasPoint(e);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (gradientMode) {
        // In gradient mode, add area to selection
        const result = smartFill(ctx, Math.floor(point.x), Math.floor(point.y), currentColor, true);
        if (result && result.length > 0) {
          const newArea = { 
            x: Math.floor(point.x), 
            y: Math.floor(point.y), 
            pixels: result,
            bounds: calculateBounds(result)
          };
          setSelectedAreas([...selectedAreas, newArea]);
          setFillPreview(null);
        }
      } else if (texturePattern) {
        // Texture fill mode
        applyTextureFill(point.x, point.y);
        setFillPreview(null);
      } else {
        // Normal fill mode
        const result = smartFill(ctx, Math.floor(point.x), Math.floor(point.y), currentColor, false);

        if (result && result.length > 0) {
          const newFill = { x: Math.floor(point.x), y: Math.floor(point.y), color: currentColor };
          const newFillHistory = [...fillHistory, newFill];
          setFillHistory(newFillHistory);

          saveToHistory(strokes, newFillHistory);
          addToRecentColors(currentColor);
          setFillPreview(null);
        }
      }
    }
  };

  const handleCanvasHover = (e) => {
    if (paintMode !== 'fill' || !gradientMode || !showFillPreview || isLoading) {
      if (fillPreview) setFillPreview(null);
      return;
    }

    const point = getCanvasPoint(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const pixels = smartFill(ctx, Math.floor(point.x), Math.floor(point.y), currentColor, true);

    if (pixels && pixels.length > 0) {
      setFillPreview({ x: Math.floor(point.x), y: Math.floor(point.y), pixels });
    } else {
      setFillPreview(null);
    }
  };

  const smartFill = (ctx, startX, startY, fillColor, preview = false) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert hex color to RGB
    const fillRGB = hexToRgb(fillColor);
    if (!fillRGB) return null;

    // Get target color at click point
    const targetIndex = (startY * width + startX) * 4;
    const targetR = data[targetIndex];
    const targetG = data[targetIndex + 1];
    const targetB = data[targetIndex + 2];
    const targetA = data[targetIndex + 3];

    // Enhanced boundary detection - check if pixel is part of a line
    const isBoundaryPixel = (r, g, b, a) => {
      // Check for dark colors (black lines)
      const brightness = (r + g + b) / 3;
      if (brightness < 60) return true;

      // Check for semi-transparent pixels (anti-aliasing edges)
      if (a < 200) return true;

      return false;
    };

    // Don't fill if clicking on a boundary
    if (isBoundaryPixel(targetR, targetG, targetB, targetA)) {
      return null;
    }

    // Don't fill if target is already the fill color
    if (Math.abs(targetR - fillRGB.r) < 5 && 
        Math.abs(targetG - fillRGB.g) < 5 && 
        Math.abs(targetB - fillRGB.b) < 5) {
      return null;
    }

    const tolerance = fillTolerance;

    // Scanline flood fill for better performance
    const stack = [[startX, startY]];
    const visited = new Set();
    const fillPixels = [];

    // Helper function to check if color matches target
    const matchesTarget = (r, g, b, a) => {
      if (isBoundaryPixel(r, g, b, a)) return false;

      const dr = Math.abs(r - targetR);
      const dg = Math.abs(g - targetG);
      const db = Math.abs(b - targetB);
      return dr <= tolerance && dg <= tolerance && db <= tolerance;
    };

    while (stack.length > 0) {
      const point = stack.pop();
      if (!point) continue;

      let [x, y] = point;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (!matchesTarget(r, g, b, a)) continue;

      // Scanline fill - find left and right boundaries
      let leftX = x;
      let rightX = x;

      // Scan left
      while (leftX > 0) {
        const leftIndex = (y * width + (leftX - 1)) * 4;
        if (!matchesTarget(data[leftIndex], data[leftIndex + 1], data[leftIndex + 2], data[leftIndex + 3])) break;
        leftX--;
      }

      // Scan right
      while (rightX < width - 1) {
        const rightIndex = (y * width + (rightX + 1)) * 4;
        if (!matchesTarget(data[rightIndex], data[rightIndex + 1], data[rightIndex + 2], data[rightIndex + 3])) break;
        rightX++;
      }

      // Fill the scanline and mark as visited
      for (let fillX = leftX; fillX <= rightX; fillX++) {
        const fillKey = `${fillX},${y}`;
        if (!visited.has(fillKey)) {
          visited.add(fillKey);
          const fillIndex = (y * width + fillX) * 4;
          fillPixels.push([fillX, y, fillIndex]);

          // Check pixels above and below
          if (y > 0) {
            const aboveIndex = ((y - 1) * width + fillX) * 4;
            if (matchesTarget(data[aboveIndex], data[aboveIndex + 1], data[aboveIndex + 2], data[aboveIndex + 3])) {
              stack.push([fillX, y - 1]);
            }
          }
          if (y < height - 1) {
            const belowIndex = ((y + 1) * width + fillX) * 4;
            if (matchesTarget(data[belowIndex], data[belowIndex + 1], data[belowIndex + 2], data[belowIndex + 3])) {
              stack.push([fillX, y + 1]);
            }
          }
        }
      }
    }

    if (fillPixels.length === 0) return null;

    // If preview, return the pixel list
    if (preview) {
      return fillPixels;
    }

    // Apply fill to all collected pixels
    fillPixels.forEach(([x, y, index]) => {
      data[index] = fillRGB.r;
      data[index + 1] = fillRGB.g;
      data[index + 2] = fillRGB.b;
      data[index + 3] = 255;
    });

    ctx.putImageData(imageData, 0, 0);
    return fillPixels;
  };

  // Draw fill preview overlay
  useEffect(() => {
    if (!fillPreview || paintMode !== 'fill') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const fillRGB = hexToRgb(currentColor);

    if (!fillRGB) return;

    // Apply semi-transparent preview
    fillPreview.pixels.forEach(([x, y, index]) => {
      data[index] = Math.floor((data[index] + fillRGB.r) / 2);
      data[index + 1] = Math.floor((data[index + 1] + fillRGB.g) / 2);
      data[index + 2] = Math.floor((data[index + 2] + fillRGB.b) / 2);
    });

    ctx.putImageData(imageData, 0, 0);

    // Redraw on next hover or click
    const timeoutId = setTimeout(() => {
      redrawCanvas();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fillPreview]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const calculateBounds = (pixels) => {
    if (!pixels || pixels.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pixels.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    return { minX, minY, maxX, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  };

  const interpolateColor = (color1, color2, factor) => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const adjustColor = (color, hueShift, satShift, brightShift) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    // Convert RGB to HSL
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    // Apply adjustments
    h = (h + hueShift / 360) % 1;
    s = Math.max(0, Math.min(1, s * (satShift / 100)));
    l = Math.max(0, Math.min(1, l * (brightShift / 100)));

    // Convert back to RGB
    let r2, g2, b2;
    if (s === 0) {
      r2 = g2 = b2 = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r2 = hue2rgb(p, q, h + 1/3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1/3);
    }

    const red = Math.round(r2 * 255);
    const green = Math.round(g2 * 255);
    const blue = Math.round(b2 * 255);

    return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
  };

  const applyColorAdjustment = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Skip black lines (boundaries)
      const bright = (r + g + b) / 3;
      if (bright < 50) continue;

      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const adjusted = adjustColor(hexColor, hue, saturation, brightness);
      const rgb = hexToRgb(adjusted);
      
      if (rgb) {
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory(strokes, fillHistory);
  };

  const applyAdvancedColorBalance = (params) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Skip black lines (boundaries)
      const bright = (r + g + b) / 3;
      if (bright < 50) continue;

      // Apply RGB balance
      r = Math.max(0, Math.min(255, r + params.redBalance));
      g = Math.max(0, Math.min(255, g + params.greenBalance));
      b = Math.max(0, Math.min(255, b + params.blueBalance));

      // Apply warmth
      if (params.warmth !== 0) {
        r = Math.max(0, Math.min(255, r + params.warmth));
        b = Math.max(0, Math.min(255, b - params.warmth));
      }

      // Convert to hex for HSL adjustment
      const hexColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
      const adjusted = adjustColor(hexColor, params.hue, params.saturation, params.lightness);
      const rgb = hexToRgb(adjusted);
      
      if (rgb) {
        // Apply contrast
        const contrast = params.contrast / 100;
        r = ((rgb.r / 255 - 0.5) * contrast + 0.5) * 255;
        g = ((rgb.g / 255 - 0.5) * contrast + 0.5) * 255;
        b = ((rgb.b / 255 - 0.5) * contrast + 0.5) * 255;

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory(strokes, fillHistory);
    setShowColorBalance(false);
  };

  const createTexturePattern = (type) => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 100;
    patternCanvas.height = 100;
    const ctx = patternCanvas.getContext('2d');

    switch (type) {
      case 'dots':
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(i * 10 + 5, j * 10 + 5, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'stripes':
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)';
          ctx.fillRect(i * 10, 0, 10, 100);
        }
        break;
      case 'crosshatch':
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 10, 0);
          ctx.lineTo(i * 10, 100);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * 10);
          ctx.lineTo(100, i * 10);
          ctx.stroke();
        }
        break;
      case 'noise':
        const imgData = ctx.createImageData(100, 100);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const noise = Math.random() * 50;
          imgData.data[i] = noise;
          imgData.data[i + 1] = noise;
          imgData.data[i + 2] = noise;
          imgData.data[i + 3] = 100;
        }
        ctx.putImageData(imgData, 0, 0);
        break;
    }

    return patternCanvas;
  };

  const applyTextureFill = (x, y) => {
    if (!texturePattern) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Get the fill area
    const pixels = smartFill(ctx, Math.floor(x), Math.floor(y), currentColor, true);
    if (!pixels || pixels.length === 0) return;

    // Create pattern
    const pattern = ctx.createPattern(texturePattern, 'repeat');
    
    // Save current state
    ctx.save();
    
    // Create path from pixels
    ctx.beginPath();
    pixels.forEach(([px, py]) => {
      ctx.fillRect(px, py, 1, 1);
    });

    // Fill with base color first
    const rgb = hexToRgb(currentColor);
    if (rgb) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      pixels.forEach(([px, py, index]) => {
        data[index] = rgb.r;
        data[index + 1] = rgb.g;
        data[index + 2] = rgb.b;
        data[index + 3] = 255;
      });
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply texture overlay
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = pattern;
    pixels.forEach(([px, py]) => {
      ctx.fillRect(px, py, 1, 1);
    });

    ctx.restore();

    const newFill = { x: Math.floor(x), y: Math.floor(y), color: currentColor, texture: true };
    const newFillHistory = [...fillHistory, newFill];
    setFillHistory(newFillHistory);
    saveToHistory(strokes, newFillHistory);
    addToRecentColors(currentColor);
  };

  const applyGradientToAreas = () => {
    if (selectedAreas.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate global bounds
    let globalMinX = Infinity, globalMinY = Infinity, globalMaxX = -Infinity, globalMaxY = -Infinity;
    selectedAreas.forEach(area => {
      globalMinX = Math.min(globalMinX, area.bounds.minX);
      globalMinY = Math.min(globalMinY, area.bounds.minY);
      globalMaxX = Math.max(globalMaxX, area.bounds.maxX);
      globalMaxY = Math.max(globalMaxY, area.bounds.maxY);
    });

    const globalWidth = globalMaxX - globalMinX;
    const globalHeight = globalMaxY - globalMinY;

    // Apply gradient to each area based on global position
    selectedAreas.forEach(area => {
      area.pixels.forEach(([x, y, index]) => {
        const relativeX = (x - globalMinX) / globalWidth;
        const relativeY = (y - globalMinY) / globalHeight;
        
        // Use diagonal gradient
        const gradientFactor = (relativeX + relativeY) / 2;
        
        // Interpolate between gradient colors
        let color;
        if (gradientColors.length === 2) {
          color = interpolateColor(gradientColors[0], gradientColors[1], gradientFactor);
        } else {
          const segment = gradientFactor * (gradientColors.length - 1);
          const idx = Math.floor(segment);
          const localFactor = segment - idx;
          const c1 = gradientColors[Math.min(idx, gradientColors.length - 1)];
          const c2 = gradientColors[Math.min(idx + 1, gradientColors.length - 1)];
          color = interpolateColor(c1, c2, localFactor);
        }

        const rgb = hexToRgb(color);
        if (rgb) {
          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
          data[index + 3] = 255;
        }
      });
    });

    ctx.putImageData(imageData, 0, 0);

    // Save to fill history
    selectedAreas.forEach(area => {
      const centerColor = interpolateColor(gradientColors[0], gradientColors[1], 0.5);
      const newFill = { x: area.x, y: area.y, color: centerColor };
      fillHistory.push(newFill);
    });

    setFillHistory([...fillHistory]);
    saveToHistory(strokes, fillHistory);
    setSelectedAreas([]);
    setGradientMode(false);
  };

  const startDrawing = (e) => {
    if (paintMode === 'fill') return;
    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentStroke([point]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getCanvasPoint(e);
    const newStroke = [...currentStroke, point];
    setCurrentStroke(newStroke);

    // Draw current stroke immediately for responsiveness
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (newStroke.length >= 2) {
      const lastPoint = newStroke[newStroke.length - 2];
      const brush = BRUSH_TYPES.find(b => b.id === brushType) || BRUSH_TYPES[0];

      const opacity = brushParams.opacity ?? brush.opacity;
      const blur = brushParams.blur ?? brush.blur;
      const flow = brushParams.flow ?? brush.flow ?? 1.0;

      ctx.strokeStyle = isErasing ? '#FFFFFF' : currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = isErasing ? 1.0 : opacity * flow;

      if (blur > 0 && !isErasing) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = currentColor;
      }

      if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      const newStroke = {
        points: currentStroke,
        color: currentColor,
        size: brushSize,
        isEraser: isErasing,
        brushType: brushType,
        params: brushParams
      };

      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      saveToHistory(newStrokes, fillHistory);
      addToRecentColors(currentColor);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex].strokes);
      setFillHistory(history[newIndex].fills);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex].strokes);
      setFillHistory(history[newIndex].fills);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const startPanning = (e) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ 
        x: e.clientX - pan.x, 
        y: e.clientY - pan.y 
      });
    }
  };

  const doPan = (e) => {
    if (isPanning) {
      e.preventDefault();
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const stopPanning = () => {
    setIsPanning(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const thumbnail = canvas.toDataURL('image/jpeg', 0.5);
    const coloringTime = Math.floor((Date.now() - startTime) / 1000);
    const isCompleted = strokes.length > 10 || fillHistory.length > 5;
    
    if (onSave) {
      await onSave({
        strokes: JSON.stringify({ strokes, fillHistory }),
        thumbnail_data: thumbnail,
        coloring_time: coloringTime,
        is_completed: isCompleted,
        canvas: canvas,
        basename: effectiveImageUrl || illustrationUrl // Include basename
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `colour-me-brazil-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShareInApp = async () => {
    const canvas = canvasRef.current;
    try {
      // Convert canvas to blob
      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/png', 1.0)
      );
      
      // Upload the artwork
      const uploadResult = await base44.integrations.Core.UploadFile({
        file: blob
      });
      
      // Create ColoredArtwork entity with showcased flag
      await base44.entities.ColoredArtwork.create({
        profile_id: profileId,
        book_id: bookId,
        page_id: pageId,
        artwork_url: uploadResult.file_url,
        coloring_time_seconds: Math.floor((Date.now() - startTime) / 1000),
        is_showcased: true
      });

      // Navigate to showcase or gallery
      window.location.href = '/ArtGallery';
    } catch (error) {
      console.error('Error sharing artwork:', error);
      alert('Failed to share artwork. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          tutorialId={showTutorial}
          onComplete={() => {
            setShowTutorial(null);
            if (showTutorial === 'basics') {
              localStorage.setItem('coloringIntroSeen', 'true');
              setHasSeenIntro(true);
            }
          }}
          onSkip={() => {
            setShowTutorial(null);
            if (showTutorial === 'basics') {
              localStorage.setItem('coloringIntroSeen', 'true');
              setHasSeenIntro(true);
            }
          }}
        />
      )}

      {/* Help Center */}
      <HelpCenter isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Contextual Tips */}
      {activeTip && (
        <ContextualTip
          tipId={activeTip}
          onDismiss={() => setActiveTip(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">Color Your Page 🎨</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial('basics')}
              className="gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Tutorial
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 relative">
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                className="bg-white shadow-lg"
                title="Zoom In (Ctrl + Scroll)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                className="bg-white shadow-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetView}
                className="bg-white shadow-lg"
                title="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <div 
              ref={containerRef}
              className="relative max-w-3xl w-full aspect-square bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ cursor: isLoading ? 'wait' : (isPanning ? 'grabbing' : (paintMode === 'fill' ? 'pointer' : 'crosshair')) }}
            >
              {isLoading && !imageLoadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading image...</p>
                  </div>
                </div>
              )}
              {imageLoadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 z-10">
                  <div className="text-center max-w-md p-4">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-red-700 mb-2">Failed to load illustration</p>
                    <p className="text-xs text-red-600 mb-3">
                      The coloring page image could not be loaded. Please check your internet connection or try again later.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageLoadError(false);
                        setIsLoading(true);
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                          setBackgroundImage(img);
                          setIsLoading(false);
                        };
                        img.onerror = () => {
                          console.error('Retry failed to load illustration');
                          setIsLoading(false);
                          setImageLoadError(true);
                        };
                        img.src = effectiveImageUrl;
                      }}
                      className="mr-2"
                    >
                      Retry
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={1024}
                height={1024}
                className="w-full h-full touch-none"
                style={{
                  transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: '0 0'
                }}
                onMouseDown={(e) => {
                  if (e.ctrlKey || e.metaKey || e.button === 1) {
                    startPanning(e);
                  } else if (paintMode === 'fill') {
                    handleCanvasClick(e);
                  } else {
                    startDrawing(e);
                  }
                }}
                onMouseMove={(e) => {
                  if (isPanning) {
                    doPan(e);
                  } else if (paintMode === 'freeform') {
                    draw(e);
                  } else if (paintMode === 'fill') {
                    handleCanvasHover(e);
                  }
                }}
                onMouseUp={(e) => {
                  if (isPanning) {
                    stopPanning();
                  } else if (paintMode === 'freeform') {
                    stopDrawing();
                  }
                }}
                onMouseLeave={(e) => {
                  if (isPanning) {
                    stopPanning();
                  } else if (paintMode === 'freeform') {
                    stopDrawing();
                  }
                }}
                onTouchStart={paintMode === 'fill' ? handleCanvasClick : startDrawing}
                onTouchMove={paintMode === 'freeform' ? draw : undefined}
                onTouchEnd={paintMode === 'freeform' ? stopDrawing : undefined}
              />
            </div>
          </div>

          {/* Tools Panel */}
          <div className="w-full md:w-80 p-4 border-l bg-gray-50 overflow-y-auto">
            {/* Paint Mode Toggle */}
            <div className="mb-6" id="paint-mode">
              <h3 className="font-semibold text-gray-700 mb-3">Paint Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paintMode === 'freeform' ? 'default' : 'outline'}
                  onClick={() => setPaintMode('freeform')}
                  className="w-full"
                >
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Freeform
                </Button>
                <Button
                  variant={paintMode === 'fill' ? 'default' : 'outline'}
                  onClick={() => {
                    setPaintMode('fill');
                    setGradientMode(false);
                    setSelectedAreas([]);
                  }}
                  className="w-full"
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Fill Areas
                </Button>
              </div>
              {paintMode === 'fill' && (
                <div className="mt-3 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      💡 Fill Mode Active
                    </p>
                    <p className="text-xs text-blue-600">
                      Click on enclosed areas to fill. Hover to preview fill zones.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showPreview"
                      checked={showFillPreview}
                      onChange={(e) => setShowFillPreview(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showPreview" className="text-xs text-gray-700">
                      Show fill preview on hover
                    </label>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-medium">Fill Tolerance: {fillTolerance}</label>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={fillTolerance}
                      onChange={(e) => setFillTolerance(Number(e.target.value))}
                      className="w-full accent-blue-500 mt-1"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Precise (5)</span>
                      <span>Loose (80)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Lower values = stricter boundaries. Recommended: 15-30 for line art.
                    </p>
                  </div>

                  {/* Gradient Fill Mode */}
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <Button
                        variant={gradientMode ? 'default' : 'outline'}
                        onClick={() => {
                          setGradientMode(!gradientMode);
                          if (!gradientMode) setSelectedAreas([]);
                        }}
                        className="flex-1"
                        id="gradient-button"
                      >
                        🌈 Gradient Fill Mode
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowTutorial('gradient')}
                        title="Learn about gradients"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </Button>
                    </div>

                    {gradientMode && (
                      <div className="mt-3 space-y-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700 font-medium">
                          💡 Click areas to select, then apply gradient
                        </p>

                        {/* Gradient Color Stops */}
                        <div id="gradient-colors">
                          <label className="text-xs font-medium text-gray-700 mb-2 block">
                            Gradient Colors ({gradientColors.length} stops)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {gradientColors.map((color, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={color}
                                  onChange={(e) => {
                                    const newColors = [...gradientColors];
                                    newColors[idx] = e.target.value;
                                    setGradientColors(newColors);
                                  }}
                                  className="w-8 h-8 rounded cursor-pointer"
                                />
                                {gradientColors.length > 2 && (
                                  <button
                                    onClick={() => {
                                      const newColors = gradientColors.filter((_, i) => i !== idx);
                                      setGradientColors(newColors);
                                    }}
                                    className="text-red-500 text-xs"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            {gradientColors.length < 5 && (
                              <button
                                onClick={() => setGradientColors([...gradientColors, currentColor])}
                                className="w-8 h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-gray-400"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Selected Areas Count */}
                        <div className="text-xs text-purple-700">
                          Selected areas: <strong>{selectedAreas.length}</strong>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2" id="apply-gradient">
                          <Button
                            size="sm"
                            onClick={applyGradientToAreas}
                            disabled={selectedAreas.length === 0}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                          >
                            Apply Gradient
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAreas([])}
                            disabled={selectedAreas.length === 0}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced Texture Library */}
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedTextures(!showAdvancedTextures)}
                      className="w-full justify-start mb-2"
                    >
                      🎨 Texture Library ({showAdvancedTextures ? 'Hide' : 'Show'})
                    </Button>
                    
                    {showAdvancedTextures && (
                      <AdvancedTextures
                        selectedTexture={texturePattern?.id || null}
                        onTextureChange={(pattern) => setTexturePattern(pattern)}
                        textureIntensity={textureIntensity}
                        onIntensityChange={setTextureIntensity}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">Recent Colors</h3>
                <div className="flex gap-2 flex-wrap">
                  {recentColors.map((color, index) => (
                    <motion.button
                      key={`${color}-${index}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCurrentColor(color);
                        setIsErasing(false);
                      }}
                      className={`w-8 h-8 rounded-full border-3 transition-all ${
                        currentColor === color && !isErasing
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-300'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Palette Selector */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Theme Palette
              </h3>
              <select
                value={selectedPaletteKey}
                onChange={(e) => {
                  setSelectedPaletteKey(e.target.value);
                  setCurrentColor(THEME_PALETTES[e.target.value].colors[0]);
                }}
                className="w-full p-2 border rounded-lg text-sm"
              >
                {availablePalettes.map(palette => (
                  <option key={palette.id} value={palette.id}>
                    {palette.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {THEME_PALETTES[selectedPaletteKey].name}
              </p>
            </div>

            {/* Color Palette */}
            <div className="mb-6" id="color-palette">
              <h3 className="font-semibold text-gray-700 mb-3">Watercolor Palette</h3>
              <div className="grid grid-cols-6 gap-2">
                {THEME_PALETTES[selectedPaletteKey].colors.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentColor(color);
                      setIsErasing(false);
                    }}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${
                      currentColor === color && !isErasing
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Brush Type - Only show in freeform mode */}
            {paintMode === 'freeform' && (
              <div className="mb-6">
                <BrushSelector
                  selectedBrush={brushType}
                  onBrushChange={setBrushType}
                  brushParams={brushParams}
                  onBrushParamsChange={setBrushParams}
                />
              </div>
            )}

            {/* Brush Size - Only show in freeform mode */}
            {paintMode === 'freeform' && (
              <div className="mb-6" id="brush-size">
                <h3 className="font-semibold text-gray-700 mb-3">Brush Size</h3>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fine</span>
                  <span className="font-semibold">{brushSize}px</span>
                  <span>Thick</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBrushSize(3)}
                    className="flex-1 text-xs"
                  >
                    Fine
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBrushSize(10)}
                    className="flex-1 text-xs"
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBrushSize(25)}
                    className="flex-1 text-xs"
                  >
                    Bold
                  </Button>
                </div>
              </div>
            )}

            {/* Advanced Color Balance Panel */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowColorBalance(!showColorBalance)}
                className="w-full justify-start mb-2"
              >
                🎨 Advanced Color Balance ({showColorBalance ? 'Hide' : 'Show'})
              </Button>
              
              {showColorBalance && (
                <ColorBalancePanel onApply={applyAdvancedColorBalance} />
              )}
            </div>

            {/* Tools */}
            <div className="space-y-2 mb-6" id="undo-redo">
              {paintMode === 'freeform' && (
                <Button
                  variant={isErasing ? 'default' : 'outline'}
                  onClick={() => setIsErasing(!isErasing)}
                  className="w-full justify-start"
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Eraser
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="w-full justify-start"
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="outline"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="w-full justify-start"
              >
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </Button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <ShareButton
                    title="My Coloring Page"
                    text="Check out my coloring page on Colour Me Brazil! 🎨"
                    variant="outline"
                    size="default"
                    showText={false}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleShareInApp}
                  className="w-full bg-purple-50 hover:bg-purple-100 border-purple-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Share to Gallery
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 p-4 bg-white rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Session Stats</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-medium capitalize">
                    {gradientMode ? 'Gradient' : paintMode}
                  </span>
                </div>
                {gradientMode && (
                  <div className="flex justify-between">
                    <span>Selected:</span>
                    <span className="font-medium">{selectedAreas.length} areas</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Brush:</span>
                  <span className="font-medium capitalize">{brushType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zoom:</span>
                  <span className="font-medium">{Math.round(scale * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Strokes:</span>
                  <span className="font-medium">{strokes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fills:</span>
                  <span className="font-medium">{fillHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) / 1000) % 60)}s
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Dica: Ctrl+Click para pan
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}