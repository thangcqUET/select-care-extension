import React, { useRef } from 'react';
import { BasedSelection } from '../content_scripts/types';

interface KnowledgeCardProps {
  selection: BasedSelection;
  userStats?: {
    totalSelections: number;
    todayCount: number;
  };
}

interface GradientOption {
  id: string;
  name: string;
  colors: [string, string];
  preview: string;
}

const gradientOptions: GradientOption[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#ff9a9e', '#fecfef'],
    preview: 'bg-gradient-to-br from-pink-300 to-pink-200'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#667eea', '#764ba2'],
    preview: 'bg-gradient-to-br from-blue-400 to-purple-400'
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#11998e', '#38ef7d'],
    preview: 'bg-gradient-to-br from-teal-400 to-green-300'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: ['#4facfe', '#00f2fe'],
    preview: 'bg-gradient-to-br from-blue-400 to-cyan-300'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: ['#e0c3fc', '#9bb5ff'],
    preview: 'bg-gradient-to-br from-purple-200 to-blue-200'
  }
];

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ selection, userStats }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedGradient, setSelectedGradient] = React.useState<GradientOption>(gradientOptions[0]);

  const getSourceDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  };

  const getActionEmoji = (type: string) => {
    switch (type) {
      case 'learn': return '🌐';
      case 'note': return '💡';
      case 'chat': return '🤖';
      default: return '📚';
    }
  };

  const generateCardImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Helper function to draw rounded rectangles
      const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      // High-quality settings
      const scale = 2; // For retina/high-DPI displays
      
      // Pre-calculate text dimensions to determine card height
      ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const words = selection.text.split(' ');
      const tempLines = [];
      let currentLine = '';
      const maxWidth = 1020; // cardWidth - 120 (considering margins)

      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && currentLine !== '') {
          tempLines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      tempLines.push(currentLine.trim());

      // Calculate dynamic card height based on content
      const baseHeight = 600;
      const textHeight = tempLines.length * 36; // lineHeight
      const minCardHeight = 480;
      const dynamicHeight = Math.max(baseHeight, minCardHeight + Math.max(0, textHeight - 200));
      
      canvas.width = 1200 * scale; // Twitter optimal 2:1 ratio width
      canvas.height = dynamicHeight * scale; // Dynamic height based on content
      
      // Scale the context to ensure correct drawing operations
      ctx.scale(scale, scale);
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.textBaseline = 'top';

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, dynamicHeight);
      gradient.addColorStop(0, selectedGradient.colors[0]);
      gradient.addColorStop(1, selectedGradient.colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, dynamicHeight);

      // Main card with rounded corners and soft shadow
      const cardX = 60;
      const cardY = 60;
      const cardWidth = 1080;
      const cardHeight = dynamicHeight - 120; // Adjust to dynamic height
      const borderRadius = 24;

      // Soft shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.filter = 'blur(8px)';
      roundRect(ctx, cardX + 8, cardY + 8, cardWidth, cardHeight, borderRadius);
      ctx.fill();
      ctx.restore();

      // Card background with subtle inner shadow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      roundRect(ctx, cardX, cardY, cardWidth, cardHeight, borderRadius);
      ctx.fill();

      // Subtle inner shadow
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      roundRect(ctx, cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 4, borderRadius - 2);
      ctx.fill();
      ctx.restore();

      // Header with emoji and title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textBaseline = 'top';
      
      const emoji = getActionEmoji(selection.type);
      const headerText = `${emoji} Learning Discovery`;
      ctx.fillText(headerText, cardX + 40, cardY + 40);

      // Main content text with dynamic sizing - NO TRUNCATION
      const fullText = selection.text; // Use full text, no truncation
      ctx.fillStyle = '#334155';
      
      // Start with optimal font size
      let fontSize = 28;
      let lineHeight = 36;
      
      // Function to calculate lines with given font size, respecting line breaks
      const calculateLines = (fontSz: number): string[] => {
        ctx.font = `${fontSz}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const paragraphs = fullText.split('\n'); // Split by line breaks first
        const lines: string[] = [];
        const maxWidth = cardWidth - 120;

        paragraphs.forEach((paragraph) => {
          if (paragraph.trim() === '') {
            // Empty line - add spacing
            lines.push('');
            return;
          }

          const words = paragraph.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine + word + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth && currentLine !== '') {
              lines.push(currentLine.trim());
              currentLine = word + ' ';
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
        });

        return lines;
      };

      // Calculate lines with current font size - no restrictions on length
      let lines = calculateLines(fontSize);

      // For very long text, we can slightly reduce font size to improve layout
      if (lines.length > 12) {
        fontSize = 24;
        lineHeight = 30;
        lines = calculateLines(fontSize);
      } else if (lines.length > 8) {
        fontSize = 26;
        lineHeight = 33;
        lines = calculateLines(fontSize);
      }

            // Draw quote marks and text with soft shadows
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;

      // Calculate the width of the longest line to center the text block
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      let maxLineWidth = 0;
      lines.forEach(line => {
        if (line !== '') {
          const lineWidth = ctx.measureText(line).width;
          maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }
      });
      
      // Calculate starting positions to center the text block
      const textBlockHeight = lines.length * lineHeight;
      const availableHeight = cardHeight - 200; // Space between header and metadata
      const textStartY = cardY + 120 + (availableHeight - textBlockHeight) / 2;
      const centerX = cardX + cardWidth / 2; // Center X position
      const textBlockStartX = centerX - maxLineWidth / 2; // Left edge of the centered text block

      // Draw main text lines - LEFT ALIGNED within the centered block
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'left'; // Keep text left-aligned
      
      lines.forEach((line, index) => {
        if (line !== '') {
          ctx.fillText(line, textBlockStartX, textStartY + (index * lineHeight));
        }
      });
      
      ctx.restore();

      // Position metadata at the bottom of the card
      const metaY = cardY + cardHeight - 120; // Fixed position from bottom
      ctx.fillStyle = '#64748b';
      ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      // Source
      const source = getSourceDomain(selection.context.sourceUrl);
      ctx.fillText(`🌐 ${source}`, cardX + 40, metaY);

      // Tags
      if (selection.tags && selection.tags.length > 0) {
        const visibleTags = selection.tags
          .filter(tag => !tag.startsWith('fn_'))
          .slice(0, 3);
        if (visibleTags.length > 0) {
          ctx.fillText(`🏷️ ${visibleTags.join(' • ')}`, cardX + 40, metaY + 35);
        }
      }

      // Stats section
      if (userStats) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`📊 Selection #${userStats.totalSelections} • Today: ${userStats.todayCount}`, cardX + 40, metaY + 70);
      }

      // Branding with gradient - align with bottom and same line as stats
      const brandGradient = ctx.createLinearGradient(0, 0, 300, 0);
      brandGradient.addColorStop(0, '#6366f1');
      brandGradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = brandGradient;
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('✨ Saved with SelectCare', cardX + cardWidth - 40, metaY + 70);
      ctx.textAlign = 'left'; // Reset alignment

      return canvas.toDataURL('image/png', 1.0); // Maximum quality
    } catch (error) {
      console.error('Error generating card image:', error);
      return null;
    }
  };

  const shareToTwitter = async () => {
    // Generate the card image first
    const imageData = await generateCardImage();
    
    // Use comment as tweet text if available, otherwise fall back to a default message
    let tweetText = '';
    
    if (selection.comments && selection.comments.length > 0) {
      // Use the first comment as tweet text
      tweetText = selection.comments[0];
    }
    // Download the image for manual upload
    if (imageData) {
      // Download the card image
      const link = document.createElement('a');
      link.download = `share-card-${Date.now()}.png`;
      link.href = imageData;
      link.click();
    }
    
    // Open Twitter with the comment text
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const downloadCard = async () => {
    const imageData = await generateCardImage();
    if (imageData) {
      const link = document.createElement('a');
      link.download = `learning-card-${Date.now()}.png`;
      link.href = imageData;
      link.click();
    }
  };

  return (
    <div className="mt-2">
      {/* Gradient Selection */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Choose Background:</div>
        <div className="flex gap-2 flex-wrap">
          {gradientOptions.map((gradient) => (
            <button
              key={gradient.id}
              onClick={() => setSelectedGradient(gradient)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedGradient.id === gradient.id 
                  ? 'border-blue-500 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${gradient.preview}`}
              title={gradient.name}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Preview Card */}
      <div 
        ref={cardRef}
        className="relative overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${selectedGradient.colors[0]}, ${selectedGradient.colors[1]})`
        }}
      >
        <div className="p-6">
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{getActionEmoji(selection.type)}</span>
              <span className="text-sm font-bold text-gray-800">Learning Discovery</span>
            </div>

            {/* Main Content with Quote Styling */}
            <div className="mb-4 relative">
              <div className="text-4xl text-gray-300 absolute -top-2 -left-1 font-serif">"</div>
              <div className="pl-6 pr-6">
                <p className="text-sm text-gray-700 leading-relaxed" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {selection.text}
                </p>
              </div>
              <div className="text-4xl text-gray-300 absolute -bottom-6 right-2 font-serif">"</div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-xs text-gray-500 mt-6">
              <div className="flex items-center gap-1">
                <span>🌐</span>
                <span>{getSourceDomain(selection.context.sourceUrl)}</span>
              </div>
              
              {selection.tags && selection.tags.filter(tag => !tag.startsWith('fn_')).length > 0 && (
                <div className="flex items-center gap-1">
                  <span>🏷️</span>
                  <span>{selection.tags.filter(tag => !tag.startsWith('fn_')).slice(0, 3).join(' • ')}</span>
                </div>
              )}

              {userStats && (
                <div className="flex items-center gap-1 text-blue-600 font-medium">
                  <span>📊</span>
                  <span>Selection #{userStats.totalSelections} • Today: {userStats.todayCount}</span>
                </div>
              )}
            </div>

            {/* Branding */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Saved with SelectCare
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={shareToTwitter}
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium shadow-sm"
        >
          <span>🐦</span>
          Share on X
        </button>
        <button
          onClick={downloadCard}
          className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm"
        >
          <span>⬇️</span>
          Download HD
        </button>
      </div>
    </div>
  );
};

export default KnowledgeCard;
