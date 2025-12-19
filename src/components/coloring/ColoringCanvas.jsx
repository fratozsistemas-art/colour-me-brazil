import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Undo, Redo, Eraser, Save, Download, X, Paintbrush, Grid3x3, ZoomIn, ZoomOut, Maximize2, Share2, Palette, Loader2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ShareButton from '../social/ShareButton';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookPalette, THEME_PALETTES, getAllPaletteNames } from './colorPalettes';
import BrushSelector, { BRUSH_TYPES } from './BrushSelector';

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

  // Use lineArtUrl if provided, otherwise fall back to illustrationUrl
  const effectiveImageUrl = lineArtUrl || illustrationUrl;

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
      img.onerror = () => {
        console.error('Failed to load illustration from:', effectiveImageUrl);
        setIsLoading(false);
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
      floodFill(ctx, fill.x, fill.y, fill.color, false);
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
  };

  const handleCanvasHover = (e) => {
    if (paintMode !== 'fill' || !showFillPreview || isLoading) {
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
        canvas: canvas
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Color Your Page 🎨</h2>
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
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading image...</p>
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
            <div className="mb-6">
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
                  onClick={() => setPaintMode('fill')}
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
            <div className="mb-6">
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
              <div className="mb-6">
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

            {/* Tools */}
            <div className="space-y-2 mb-6">
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
                  <span className="font-medium capitalize">{paintMode}</span>
                </div>
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