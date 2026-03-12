/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Download, Type, Palette, Layers, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const FONTS = [
  { id: 'font-modern', name: 'Modern Sans' },
  { id: 'font-handwritten', name: 'Playful Script' },
  { id: 'font-bold-comic', name: 'Bold Comic' },
  { id: 'font-elegant', name: 'Elegant Handwriting' },
  { id: 'font-monospace', name: 'Retro Mono' },
];

export default function App() {
  const [text, setText] = useState('STAY COOL');
  const [fontFamily, setFontFamily] = useState('font-bold-comic');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#4f46e5');
  const [borderWidth, setBorderWidth] = useState(8);
  const [fontSize, setFontSize] = useState(72);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getShadowStyle = () => {
    const steps = 16;
    let shadow = '';
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * (2 * Math.PI);
      const x = Math.cos(angle) * borderWidth;
      const y = Math.sin(angle) * borderWidth;
      shadow += `${x}px ${y}px 0 ${borderColor}${i === steps - 1 ? '' : ','}`;
    }
    return shadow;
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Map font class to actual font family name
    let fontFace = 'Inter';
    switch (fontFamily) {
      case 'font-modern': fontFace = 'Inter'; break;
      case 'font-handwritten': fontFace = 'Pacifico'; break;
      case 'font-bold-comic': fontFace = 'Bangers'; break;
      case 'font-elegant': fontFace = 'Caveat'; break;
      case 'font-monospace': fontFace = 'Roboto Mono'; break;
    }

    const exportFontSize = fontSize * 2;
    ctx.font = `900 ${exportFontSize}px ${fontFace}`;

    const lines = text.split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    const exportLineHeight = exportFontSize * lineHeight;
    const scaledStrokeWidth = borderWidth * 2; // High res scaling

    canvas.width = maxWidth + (scaledStrokeWidth * 4) + 100;
    canvas.height = (exportLineHeight * lines.length) + (scaledStrokeWidth * 4) + 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Re-set font after resize
    ctx.font = `900 ${exportFontSize}px ${fontFace}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const centerX = canvas.width / 2;
    const startY = (canvas.height / 2) - ((lines.length - 1) * exportLineHeight / 2);

    // Draw stroke first (Back)
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = scaledStrokeWidth * 2;
    lines.forEach((line, i) => {
      ctx.strokeText(line, centerX, startY + (i * exportLineHeight));
    });

    // Draw actual text (Front)
    ctx.fillStyle = textColor;
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, startY + (i * exportLineHeight));
    });

    // Trigger Download
    const link = document.createElement('a');
    link.download = `sticker-${text.slice(0, 10).toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">StickerMaker</h1>
          </div>
          <p className="text-xs text-gray-500 hidden sm:block">Design, Preview, & Export</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customization Panel */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 border-b pb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Customization</h2>
            </div>

            {/* Sticker Text */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Type className="w-4 h-4" /> Sticker Text
              </label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                placeholder="Type your message here..."
                rows={3}
              />
            </div>

            {/* Font Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Layers className="w-4 h-4" /> Font Style
              </label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              >
                {FONTS.map(font => (
                  <option key={font.id} value={font.id}>{font.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Text Color */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette className="w-4 h-4" /> Text Color
                </label>
                <div className="relative group">
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-12 w-full rounded-xl cursor-pointer border-2 border-gray-100 p-1 bg-white hover:border-indigo-200 transition-all"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette className="w-4 h-4" /> Border Color
                </label>
                <input 
                  type="color" 
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="h-12 w-full rounded-xl cursor-pointer border-2 border-gray-100 p-1 bg-white hover:border-indigo-200 transition-all"
                />
              </div>
            </div>

            {/* Border Width */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Border Width</label>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{borderWidth}px</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="24" 
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Text Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Text Size</label>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{fontSize}px</span>
              </div>
              <input 
                type="range" 
                min="24" 
                max="120" 
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Advanced Settings Accordion */}
            <div className="pt-4">
              <button 
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <span>Advanced Settings</span>
                <motion.span
                  animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.span>
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: isAdvancedOpen ? 'auto' : 0, opacity: isAdvancedOpen ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Line Height</label>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{lineHeight.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3" 
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Export Button */}
            <div className="pt-4">
              <button 
                onClick={handleExport}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Export as PNG Image
              </button>
            </div>
          </motion.section>

          {/* Preview Area */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold px-2">Live Preview</h2>
            <motion.div 
              layout
              className="flex-grow min-h-[450px] rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center p-8 bg-white overflow-hidden relative shadow-inner"
              id="sticker-canvas-container"
            >
              <div className="relative inline-block text-center transform transition-all duration-300 hover:scale-105">
                <div 
                  className={`${fontFamily} leading-tight whitespace-pre-wrap px-8 py-4 select-none`}
                  style={{
                    color: textColor,
                    textShadow: getShadowStyle(),
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight
                  }}
                >
                  {text || " "}
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
            <p className="text-sm text-center text-gray-500">
              Preview may differ slightly from final export based on font rendering.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>© 2026 StickerMaker Pro. Clean & Simple.</p>
      </footer>
    </div>
  );
}
