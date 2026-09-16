import React from 'react';
import { TocNode } from './TocNode';

interface TocSidebarProps {
  isPureFocus: boolean;
  progressText: string;
  toc: any[];
  isLoading: boolean;
  currentChapter: string;
  goToLocation: (href: string) => void;
}

export function TocSidebar({
  isPureFocus,
  progressText,
  toc,
  isLoading,
  currentChapter,
  goToLocation
}: TocSidebarProps) {
  if (isPureFocus) return null;

  return (
    <div className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 space-y-6 min-h-0">
      {/* TOC List Container */}
      <div className="flex-1 bg-[#eeede8] rounded-xl border border-folio-hairline overflow-hidden flex flex-col min-h-0 relative">
        <div className="px-4 pt-4 pb-2 shrink-0 bg-[#eeede8] z-10 relative">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-folio-tertiary">
            <span>Book Contents</span>
            <span className="text-[#a87d60]">{progressText === 'Loading...' ? '' : progressText.replace(/P\. \d+ OF \d+/, 'READ')}</span>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {toc.length === 0 && !isLoading && (
            <li className="text-sm text-folio-tertiary italic px-2">No table of contents found.</li>
          )}
          {toc.map((item, index) => (
            <TocNode 
              key={index} 
              item={item} 
              currentChapter={currentChapter} 
              goToLocation={goToLocation} 
            />
          ))}
        </ul>
        
        {/* Fade out at bottom of scroll */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#eeede8] to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
}
