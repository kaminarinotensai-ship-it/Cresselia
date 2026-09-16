import React from 'react';
import { FileText, Copy, ExternalLink } from 'lucide-react';
import { HIGHLIGHT_COLORS } from './constants';
import { Rendition } from 'epubjs';

interface SelectionPopupProps {
  selectionPopup: { top: number; left: number; cfi: string; text: string } | null;
  setSelectionPopup: (popup: any) => void;
  rendition: Rendition | null;
  selectedHighlightColor: string;
  setSelectedHighlightColor: (color: string) => void;
  handleAddNote: () => void;
  handleCopy: () => void;
}

export function SelectionPopup({
  selectionPopup,
  setSelectionPopup,
  rendition,
  selectedHighlightColor,
  setSelectedHighlightColor,
  handleAddNote,
  handleCopy
}: SelectionPopupProps) {
  if (!selectionPopup) return null;

  return (
    <>
      {/* Global Click-away for selection popup */}
      <div className="absolute inset-0 z-40" onClick={() => {
        setSelectionPopup(null);
        const contents = rendition?.getContents()[0];
        contents?.window.getSelection()?.removeAllRanges();
      }}></div>

      {/* Floating Selection Menu */}
      <div 
        className="fixed z-50 bg-[#27272a] text-white rounded-lg shadow-xl px-2 py-1.5 flex items-center gap-2 transform -translate-x-1/2 -translate-y-full transition-all border border-white/10"
        style={{ top: selectionPopup.top, left: selectionPopup.left }}
      >
        {/* Colors */}
        <div className="flex items-center gap-2.5 px-3 border-r border-white/20">
          {HIGHLIGHT_COLORS.map(color => (
            <button 
              key={color}
              onClick={() => setSelectedHighlightColor(color)}
              className={`w-4 h-4 rounded-full transition-all ${
                selectedHighlightColor === color 
                  ? 'scale-110' 
                  : 'opacity-50 hover:opacity-100'
              }`}
              style={{ 
                backgroundColor: color,
                boxShadow: selectedHighlightColor === color ? `0 0 0 2px #27272a, 0 0 0 4px ${color}` : 'none'
              }}
            />
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 pr-1">
          <button onClick={handleAddNote} className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-md text-xs font-medium transition-colors">
            <FileText className="w-3.5 h-3.5" /> Note
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-md text-xs font-medium transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
          <button className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-white/50 cursor-not-allowed">
            <ExternalLink className="w-3.5 h-3.5" /> Card
          </button>
        </div>
        
        {/* Triangle pointer */}
        <div className="absolute top-[98%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-t-[#27272a] border-l-transparent border-r-transparent"></div>
      </div>
    </>
  );
}
