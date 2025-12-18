import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Undo, Redo, Eraser, Save, Download, X, Paintbrush, Grid3x3, ZoomIn, ZoomOut, Maximize2, Share2, Palette } from 'lucide-react';
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
  bookData = null
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
  const [fillTolerance, setFillTolerance] = useState(30);

  // Load background image
  useEffect(() => {
    if (illustrationUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImage(img);
        redrawCanvas();
      };
      img.src = illustrationUrl;
    }
  }, [illustrationUrl]);

  // Redraw canvas whenever strokes or fills change
  useEffect(() => {
    redrawCanvas();
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

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = brush.opacity;
    
    // Apply blur for airbrush/watercolor
    if (brush.blur > 0) {
      ctx.shadowBlur = brush.blur;
      ctx.shadowColor = stroke.color;
    }
    
    // Add texture for crayon/marker
    if (brush.texture === 'crayon') {
      ctx.globalCompositeOperation = 'multiply';
    } else if (brush.texture === 'marker') {
      ctx.lineCap = 'square';
    }
    
    if (stroke.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    // Draw multiple passes for airbrush effect
    const passes = brush.id === 'airbrush' ? 3 : 1;
    
    for (let pass = 0; pass < passes; pass++) {
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
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
    
    if (paintMode === 'fill') {
      const point = getCanvasPoint(e);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const newFill = { x: Math.floor(point.x), y: Math.floor(point.y), color: currentColor };
      const newFillHistory = [...fillHistory, newFill];
      setFillHistory(newFillHistory);
      
      saveToHistory(strokes, newFillHistory);
      addToRecentColors(currentColor);
      
      floodFill(ctx, Math.floor(point.x), Math.floor(point.y), currentColor, true);
    }
  };

  const floodFill = (ctx, startX, startY, fillColor, addToHistory = true) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Convert hex color to RGB
    const fillRGB = hexToRgb(fillColor);
    if (!fillRGB) return;
    
    // Get target color at click point
    const targetIndex = (startY * width + startX) * 4;
    const targetR = data[targetIndex];
    const targetG = data[targetIndex + 1];
    const targetB = data[targetIndex + 2];
    
    // Don't fill if target is same as fill color
    if (targetR === fillRGB.r && targetG === fillRGB.g && targetB === fillRGB.b) return;
    
    // Flood fill algorithm using stack
    const stack = [[startX, startY]];
    const visited = new Set();
    const tolerance = fillTolerance; // Use adjustable tolerance
    
    while (stack.length > 0) {
      const point = stack.pop();
      if (!point) continue;
      
      const [x, y] = point;
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      // Check if color matches target (within tolerance)
      const dr = Math.abs(r - targetR);
      const dg = Math.abs(g - targetG);
      const db = Math.abs(b - targetB);
      
      if (dr > tolerance || dg > tolerance || db > tolerance) continue;
      
      visited.add(key);
      
      // Fill this pixel
      data[index] = fillRGB.r;
      data[index + 1] = fillRGB.g;
      data[index + 2] = fillRGB.b;
      data[index + 3] = 255;
      
      // Add neighbors to stack
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

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

      ctx.strokeStyle = isErasing ? '#FFFFFF' : currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = isErasing ? 1.0 : brush.opacity;

      if (brush.blur > 0 && !isErasing) {
        ctx.shadowBlur = brush.blur;
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
        brushType: brushType
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
              style={{ cursor: isPanning ? 'grabbing' : (paintMode === 'fill' ? 'pointer' : 'crosshair') }}
            >
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
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Click on areas to fill them with your selected color
                  </p>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Fill Tolerance: {fillTolerance}</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={fillTolerance}
                      onChange={(e) => setFillTolerance(Number(e.target.value))}
                      className="w-full accent-blue-500 mt-1"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Precise</span>
                      <span>Loose</span>
                    </div>
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