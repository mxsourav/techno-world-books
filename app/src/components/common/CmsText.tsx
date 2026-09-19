import React, { useState, useRef, useEffect } from 'react';
import { useCms } from '@/context/CmsContext';
import { Edit3, GripVertical } from 'lucide-react';

interface CmsTextProps {
  contentKey: string;
  defaultText: string;
  label?: string;
  as?: any;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export const CmsText: React.FC<CmsTextProps> = ({
  contentKey,
  defaultText,
  label,
  as: Component = 'span',
  className = '',
  style,
  multiline = false,
}) => {
  const { t, getStyle, isEditMode, selectedKey, selectElement, updateDraftStyle } = useCms();
  const [isHovered, setIsHovered] = useState(false);
  const [, setIsDragging] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number | null>(null);
  const [liveFontSize, setLiveFontSize] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const displayText = t(contentKey, defaultText);
  const customStyles = getStyle(contentKey);
  const isSelected = selectedKey === contentKey;
  const friendlyLabel = label || contentKey.split('.').pop()?.replace(/_/g, ' ') || contentKey;

  // Merge custom CMS font-size, max-width, text-align with passed style
  const mergedStyle: React.CSSProperties = {
    ...customStyles,
    ...style,
    ...(liveWidth !== null ? { maxWidth: `${liveWidth}px`, display: 'inline-block' } : {}),
    ...(liveFontSize !== null ? { fontSize: `${liveFontSize}px` } : {}),
  };

  // Horizontal Right Grip Drag Handler (Resizes field width)
  const handleRightGripMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isSelected) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const initialRect = containerRef.current?.getBoundingClientRect();
    const startWidth = initialRect ? initialRect.width : 300;

    setIsDragging(true);
    let latestWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(120, Math.min(1400, Math.round(startWidth + deltaX)));
      latestWidth = newWidth;
      setLiveWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      updateDraftStyle(contentKey, { maxWidth: `${latestWidth}px` });
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'TW_CMS_STYLE_UPDATE',
            key: contentKey,
            maxWidth: `${latestWidth}px`,
          },
          '*'
        );
      }
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Corner Drag Handler (Proportionally resizes width & font-size)
  const handleCornerMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isSelected) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const initialRect = containerRef.current?.getBoundingClientRect();
    const startWidth = initialRect ? initialRect.width : 300;

    let startFontSize = 16;
    if (containerRef.current) {
      const comp = window.getComputedStyle(containerRef.current);
      startFontSize = parseFloat(comp.fontSize) || 16;
    }
    if (customStyles.fontSize) {
      startFontSize = parseFloat(String(customStyles.fontSize)) || startFontSize;
    }

    setIsDragging(true);
    let latestWidth = startWidth;
    let latestFontSize = startFontSize;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(120, Math.min(1400, Math.round(startWidth + deltaX)));
      const ratio = newWidth / (startWidth || 1);
      const newFontSize = Math.max(11, Math.min(84, Math.round(startFontSize * ratio)));

      latestWidth = newWidth;
      latestFontSize = newFontSize;
      setLiveWidth(newWidth);
      setLiveFontSize(newFontSize);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      updateDraftStyle(contentKey, {
        maxWidth: `${latestWidth}px`,
        fontSize: `${latestFontSize}px`,
      });
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'TW_CMS_STYLE_UPDATE',
            key: contentKey,
            maxWidth: `${latestWidth}px`,
            fontSize: `${latestFontSize}px`,
          },
          '*'
        );
      }
    };

    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Clean up live preview overrides & perform smooth auto-scroll when selected
  useEffect(() => {
    if (!isSelected) {
      setLiveWidth(null);
      setLiveFontSize(null);
    } else if (containerRef.current) {
      // 1. Native scrollIntoView
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      // 2. Direct window.scrollTo guarantee for reliable centering
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = scrollTop + rect.top - (window.innerHeight / 2) + (rect.height / 2);
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, [isSelected]);

  const hasTextGradient = Boolean(style?.WebkitBackgroundClip === 'text' || (style as any)?.['-webkit-background-clip'] === 'text');

  const containerStyle: React.CSSProperties = {
    ...mergedStyle,
    minHeight: '1em',
    boxSizing: 'border-box',
    ...(hasTextGradient ? {
      WebkitBackgroundClip: 'border-box',
      WebkitTextFillColor: 'initial',
      backgroundImage: undefined,
      filter: undefined,
    } : {}),
  };

  const textGradientStyle: React.CSSProperties = hasTextGradient ? {
    backgroundImage: style?.backgroundImage,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: style?.filter,
    display: 'inline-block',
  } : {};

  // When not in CMS edit mode, render normal element
  if (!isEditMode) {
    return (
      <Component
        ref={containerRef}
        data-cms-key={contentKey}
        data-cms-label={friendlyLabel}
        className={className}
        style={{
          ...containerStyle,
          ...(customStyles.maxWidth ? { display: 'inline-block' } : {}),
        }}
      >
        <span style={textGradientStyle}>
          {multiline ? displayText.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < displayText.split('\n').length - 1 && <br />}
            </React.Fragment>
          )) : displayText}
        </span>
      </Component>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectElement(contentKey, friendlyLabel, defaultText);
  };

  // Active / computed dimensions for badge display
  const displayBadgeWidth = liveWidth !== null
    ? liveWidth
    : (containerRef.current ? Math.round(containerRef.current.getBoundingClientRect().width) : 'Auto');
  const displayBadgeFont = liveFontSize !== null
    ? `${liveFontSize}px`
    : (customStyles.fontSize || 'Default');

  return (
    <Component
      ref={containerRef}
      data-cms-key={contentKey}
      data-cms-label={friendlyLabel}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block transition-all duration-150 cursor-pointer ${className}`}
      style={containerStyle}
      title={`Click to edit: "${friendlyLabel}"`}
    >
      {/* Outer Dotted Bounding Box with Corner & Resize Handles */}
      {isSelected && (
        <div
          style={{
            WebkitTextFillColor: 'initial',
            WebkitBackgroundClip: 'border-box',
          }}
          className="absolute -inset-2 pointer-events-none z-50 border-2 border-dashed border-emerald-500 rounded-lg ring-2 ring-emerald-500/25 bg-emerald-500/10"
        >
          {/* 4 Corner Square Nodes */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-xs bg-white border-2 border-emerald-600 shadow-md" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-xs bg-white border-2 border-emerald-600 shadow-md" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-xs bg-white border-2 border-emerald-600 shadow-md" />

          {/* Bottom-Right Corner Scale Handle */}
          <div
            onMouseDown={handleCornerMouseDown}
            title="Drag corner to scale font size & field width proportionally"
            className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-sm bg-gradient-to-br from-white to-emerald-100 border-2 border-emerald-600 shadow-lg pointer-events-auto cursor-se-resize hover:scale-125 transition-transform flex items-center justify-center group z-50"
          >
            <div className="w-2 h-2 bg-emerald-600 rounded-2xs group-hover:bg-emerald-700" />
          </div>

          {/* Right Edge Width Resize Pill */}
          <div
            onMouseDown={handleRightGripMouseDown}
            title="Drag horizontally to resize text field width"
            className="absolute top-1/2 -translate-y-1/2 -right-4 h-9 w-3.5 rounded-full bg-emerald-600 border border-white shadow-xl pointer-events-auto cursor-ew-resize hover:scale-125 active:scale-110 transition-transform flex items-center justify-center z-50"
          >
            <GripVertical className="h-3 w-3 text-white stroke-[2.5]" />
          </div>

          {/* Live Dimension Measurement Pill */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold tracking-tight shadow-xl border border-white/20 pointer-events-none whitespace-nowrap flex items-center gap-1.5 z-50">
            <span className="text-emerald-400">↔ {displayBadgeWidth}px</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">Aa {displayBadgeFont}</span>
          </div>
        </div>
      )}

      {/* Hover Dotted Box when not selected */}
      {isHovered && !isSelected && (
        <div
          style={{
            WebkitTextFillColor: 'initial',
            WebkitBackgroundClip: 'border-box',
          }}
          className="absolute -inset-1.5 pointer-events-none z-40 border-2 border-dashed border-cyan-400 rounded-lg bg-cyan-400/10 shadow-sm"
        />
      )}

      {/* Floating Tag Label Badge on Hover or Selection */}
      {(isHovered || isSelected) && (
        <span
          style={{
            WebkitTextFillColor: 'initial',
            WebkitBackgroundClip: 'border-box',
          }}
          className={`absolute -top-7 left-0 z-50 px-2 py-0.5 text-[10px] font-black rounded-md shadow-lg pointer-events-none flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap border ${
            isSelected
              ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white border-emerald-400/60'
              : 'bg-gradient-to-r from-cyan-700 to-cyan-900 text-white border-cyan-400/60'
          }`}
        >
          <Edit3 className="h-2.5 w-2.5" />
          <span>{friendlyLabel}</span>
        </span>
      )}

      {/* Actual Content Render */}
      <span style={textGradientStyle}>
        {multiline ? (
          displayText.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < displayText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))
        ) : (
          displayText
        )}
      </span>
    </Component>
  );
};
