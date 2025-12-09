import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Undo, Redo, Eraser, Save, Download, X, Paintbrush, Grid3x3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  '#009C3B', '#FFDF00', '#002776', '#FFFFFF', // Brazilian flag
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', // Reds, Pinks, Purples
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', // Blues
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39', // Greens
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', // Yellows, Oranges
  '#795548', '#9E9E9E', '#607D8B', '#000000'  // Browns, Grays, Black
];

export default function ColoringCanvas({ 
  pageId, 
  bookId, 
  profileId, 
  illustrationUrl,
  onSave,
  onClose,
  initialStrokes = []
}) {
  const canvasRef = useRef(null);
  const fillCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [strokes, setStrokes] = useState(initialStrokes);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isErasing, setIsErasing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [startTime] = useState(Date.now());
  const [paintMode, setPaintMode] = useState('freeform'); // 'freeform' or 'fill'
  const [fillHistory, setFillHistory] = useState([]);

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

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e) => {
    e.preventDefault();
    
    if (paintMode === 'fill') {
      const point = getCanvasPoint(e);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Save fill action for undo
      const newFill = { x: Math.floor(point.x), y: Math.floor(point.y), color: currentColor };
      const newFillHistory = [...fillHistory, newFill];
      setFillHistory(newFillHistory);
      
      // Perform flood fill
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
    const tolerance = 30; // Color similarity tolerance
    
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
      
      ctx.strokeStyle = isErasing ? '#FFFFFF' : currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      const newStroke = {
        points: currentStroke,
        color: currentColor,
        size: brushSize,
        isEraser: isErasing
      };
      
      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      setUndoStack([...undoStack, newStrokes]);
      setRedoStack([]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (paintMode === 'freeform' && strokes.length > 0) {
      const newStrokes = strokes.slice(0, -1);
      setRedoStack([...redoStack, strokes]);
      setStrokes(newStrokes);
    } else if (paintMode === 'fill' && fillHistory.length > 0) {
      setFillHistory(fillHistory.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const lastState = redoStack[redoStack.length - 1];
    setStrokes(lastState);
    setRedoStack(redoStack.slice(0, -1));
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const thumbnail = canvas.toDataURL('image/jpeg', 0.5);
    const coloringTime = Math.floor((Date.now() - startTime) / 1000);
    
    if (onSave) {
      await onSave({
        strokes: JSON.stringify({ strokes, fillHistory }),
        thumbnail_data: thumbnail,
        coloring_time: coloringTime,
        is_completed: strokes.length > 10 || fillHistory.length > 5
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `coloring-${pageId}.png`;
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
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
            <div className="relative max-w-3xl w-full aspect-square bg-white rounded-lg shadow-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1024}
                height={1024}
                className={`w-full h-full touch-none ${paintMode === 'fill' ? 'cursor-pointer' : 'cursor-crosshair'}`}
                onMouseDown={paintMode === 'fill' ? handleCanvasClick : startDrawing}
                onMouseMove={paintMode === 'freeform' ? draw : undefined}
                onMouseUp={paintMode === 'freeform' ? stopDrawing : undefined}
                onMouseLeave={paintMode === 'freeform' ? stopDrawing : undefined}
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
                <p className="text-xs text-gray-500 mt-2">
                  Click on areas to fill them with your selected color
                </p>
              )}
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Colors</h3>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((color) => (
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
                  />
                ))}
              </div>
            </div>

            {/* Brush Size - Only show in freeform mode */}
            {paintMode === 'freeform' && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Brush Size</h3>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Thin</span>
                  <span className="font-semibold">{brushSize}px</span>
                  <span>Thick</span>
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
                disabled={(paintMode === 'freeform' && strokes.length === 0) || (paintMode === 'fill' && fillHistory.length === 0)}
                className="w-full justify-start"
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              {paintMode === 'freeform' && (
                <Button
                  variant="outline"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="w-full justify-start"
                >
                  <Redo className="w-4 h-4 mr-2" />
                  Redo
                </Button>
              )}
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
              <Button
                variant="outline"
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
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
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}