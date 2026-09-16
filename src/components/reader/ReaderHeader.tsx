import React, { RefObject } from 'react';
import { 
  Grid3x3, Search, ChevronRight as ChevronRightIcon, 
  Book as BookIcon, FileText, BookOpen, ArrowUpDown, Crosshair, 
  SlidersHorizontal, Bookmark, Minimize, Maximize 
} from 'lucide-react';
import { Book } from '../../types';
import { CANVAS_TONES } from './constants';
import { Rendition } from 'epubjs';

interface ReaderHeaderProps {
  book: Book;
  isPureFocus: boolean;
  setIsPureFocus: (val: boolean) => void;
  searchContainerRef: RefObject<HTMLDivElement | null>;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isSearching: boolean;
  searchResults: { cfi: string, excerpt: string }[];
  highlightMatch: (text: string, query: string) => React.ReactNode;
  goToLocation: (href: string) => void;
  rendition: Rendition | null;
  layoutContainerRef: RefObject<HTMLDivElement | null>;
  isLayoutMenuOpen: boolean;
  setIsLayoutMenuOpen: (val: boolean) => void;
  layoutMode: string;
  setLayoutMode: (val: any) => void;
  canvasTone: string;
  setCanvasTone: (val: string) => void;
  aaContainerRef: RefObject<HTMLDivElement | null>;
  isAaMenuOpen: boolean;
  setIsAaMenuOpen: (val: boolean) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  fontFamily: string;
  setFontFamily: (val: string) => void;
  handleFullscreen: () => void;
  isFullscreen: boolean;
}

export function ReaderHeader({
  book,
  isPureFocus,
  setIsPureFocus,
  searchContainerRef,
  isSearchOpen,
  setIsSearchOpen,
  handleSearchSubmit,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  highlightMatch,
  goToLocation,
  rendition,
  layoutContainerRef,
  isLayoutMenuOpen,
  setIsLayoutMenuOpen,
  layoutMode,
  setLayoutMode,
  canvasTone,
  setCanvasTone,
  aaContainerRef,
  isAaMenuOpen,
  setIsAaMenuOpen,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  handleFullscreen,
  isFullscreen
}: ReaderHeaderProps) {
  return (
    <div className={`w-full relative flex items-center justify-between flex-shrink-0 transition-all duration-500 ${isPureFocus ? 'mb-4' : 'mb-8'}`}>
      <div className={`flex items-baseline space-x-3 z-10 transition-opacity duration-500 ${isPureFocus ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <h2 className="font-serif text-2xl text-folio-primary truncate max-w-lg">{book.title}</h2>
        <span className="text-sm font-medium text-folio-tertiary whitespace-nowrap">by {book.author}</span>
      </div>
      
      {/* Top Right Navigation Icons */}
      <div className="flex items-center space-x-2 z-10 relative">
        
        <button 
          onClick={() => setIsPureFocus(!isPureFocus)}
          className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full transition-colors mr-1 md:mr-2 ${isPureFocus ? 'bg-[#a87d60] text-white shadow-md' : 'bg-[#eeede8] text-[#8b5e3c] hover:bg-[#e5ddd3]'}`}
          aria-label="Toggle Pure Focus"
        >
          <Grid3x3 className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Pure Focus</span>
        </button>

        <div className="relative" ref={searchContainerRef}>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'text-folio-primary bg-[#eeede8]' : 'text-folio-tertiary hover:text-folio-primary hover:bg-[#eeede8]'}`}
            aria-label="Search in chapter"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          
          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-folio-hairline p-4 z-50 flex flex-col">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-4">
                <Search className="w-4 h-4 text-folio-tertiary absolute left-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in this chapter..."
                  className="w-full bg-[#eeede8] border border-transparent focus:border-[#a87d60]/50 rounded-lg py-2 pl-9 pr-16 text-sm text-folio-primary outline-none transition-all placeholder:text-folio-tertiary"
                />
                {isSearching ? (
                  <div className="absolute right-3 w-4 h-4 border-2 border-folio-tertiary border-t-[#a87d60] rounded-full animate-spin"></div>
                ) : (
                  <div className="absolute right-2 text-[9px] font-bold text-folio-tertiary/70 uppercase tracking-wider bg-[#e5e4df] px-1.5 py-1 rounded pointer-events-none">
                    ↵ Enter
                  </div>
                )}
              </form>

              <div className="flex flex-col max-h-96 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center py-8 text-folio-tertiary text-sm italic">
                    No results found in this chapter.
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="text-[10px] font-bold tracking-widest uppercase text-folio-tertiary mb-3 flex justify-between items-center">
                    <span>{searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}</span>
                    <span className="text-[#a87d60]">Current Chapter</span>
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  {searchResults.map((res, i) => (
                    <div key={i} className="group relative bg-[#eeede8]/50 hover:bg-[#eeede8] rounded-lg p-3 transition-colors border border-transparent hover:border-folio-hairline">
                      <p className="text-sm italic text-folio-primary leading-relaxed line-clamp-3 relative">
                        <span className="opacity-50">...</span>
                        {highlightMatch(res.excerpt, searchQuery)}
                        <span className="opacity-50">...</span>
                      </p>
                      
                      <div className="mt-3 flex justify-end">
                        <button 
                          onClick={() => {
                            goToLocation(res.cfi);
                            setIsSearchOpen(false);
                            if (rendition) {
                              rendition.annotations.add("underline", res.cfi, {}, undefined, "", { 
                                "stroke": "#a87d60", 
                                "stroke-width": "3px", 
                                "stroke-opacity": "0.8" 
                              });
                              setTimeout(() => {
                                try {
                                  rendition.annotations.remove(res.cfi, "underline");
                                } catch (e) {}
                              }, 2500);
                            }
                          }} 
                          className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-[#a87d60] hover:text-folio-primary transition-colors"
                        >
                          Go to text <ChevronRightIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={layoutContainerRef}>
          <button 
            onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
            className={`p-2 rounded-full transition-colors ml-1 ${isLayoutMenuOpen ? 'text-folio-primary bg-[#eeede8]' : 'text-folio-tertiary hover:text-folio-primary hover:bg-[#eeede8]'}`}
            aria-label="Reading and Layout Settings"
          >
            <BookIcon className="w-[18px] h-[18px]" />
          </button>
          
          {/* Layout & Reading Settings Dropdown */}
          {isLayoutMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-2xl border border-folio-hairline p-5 z-50 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-folio-tertiary">Reading Settings</span>
              </div>
              
              {/* Layout Mode */}
              <div className="flex flex-col gap-2 mb-6">
                <span className="text-[11px] font-bold text-folio-tertiary">Layout Formats</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'single', label: 'Single Page', sub: 'Standard column', icon: FileText },
                    { id: 'spread', label: 'Two-Page Spread', sub: 'Dual leaf folio', icon: BookOpen },
                    { id: 'continuous', label: 'Continuous', sub: 'Fluid vertical scroll', icon: ArrowUpDown },
                    { id: 'focus', label: 'Focus Stream', sub: 'Paragraph dimming', icon: Crosshair }
                  ].map(layout => {
                    const Icon = layout.icon;
                    return (
                      <button 
                        key={layout.id}
                        onClick={() => setLayoutMode(layout.id as any)}
                        className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-colors relative ${layoutMode === layout.id ? 'border-[#c2a38c] bg-[#f9f7f4]' : 'border-folio-hairline hover:bg-black/5'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${layoutMode === layout.id ? 'text-[#8b5e3c]' : 'text-folio-tertiary'}`} />
                          <span className={`font-medium text-[13px] ${layoutMode === layout.id ? 'text-[#8b5e3c]' : 'text-folio-primary'}`}>{layout.label}</span>
                        </div>
                        <span className="text-[10px] text-folio-tertiary leading-tight">{layout.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Canvas Tone (Moved from Aa Menu) */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-folio-tertiary">Canvas Tone</span>
                <div className="grid grid-cols-3 gap-2">
                  {CANVAS_TONES.map(tone => (
                    <button 
                      key={tone.id}
                      onClick={() => setCanvasTone(tone.id)}
                      className={`flex flex-col items-center gap-2 p-2.5 rounded-lg bg-[#f3f3ee] transition-all ${canvasTone === tone.id ? 'ring-2 ring-[#a87d60] ring-offset-1' : 'hover:bg-[#e5e5df]'}`}
                    >
                      <div className="w-7 h-7 rounded-full border shadow-sm" style={{ backgroundColor: tone.bg, borderColor: tone.border }}></div>
                      <span className="text-[9px] font-medium text-folio-tertiary whitespace-nowrap">{tone.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={aaContainerRef}>
          <button 
            onClick={() => setIsAaMenuOpen(!isAaMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ml-1 ${isAaMenuOpen ? 'bg-[#a87d60] text-white' : 'bg-[#eeede8] text-folio-primary hover:bg-[#e5ddd3]'}`} 
            aria-label="Typography Settings"
          >
            <span className="font-serif font-medium text-[15px] leading-none">Aa</span>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          
          {/* Typography Dropdown */}
          {isAaMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-xl shadow-2xl border border-folio-hairline p-5 z-50 flex flex-col">
              
              <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-folio-tertiary">Type & Appearance</span>
                <button 
                  onClick={() => {
                    setFontSize(18);
                    setFontFamily('Lora');
                    setCanvasTone('Cream');
                  }}
                  className="text-[10px] font-bold tracking-widest uppercase text-folio-tertiary hover:text-folio-primary transition-colors"
                >
                  Reset to Default
                </button>
              </div>
              
              {/* Font Family */}
              <div className="flex flex-col gap-2 mb-5">
                <span className="text-[11px] font-bold text-folio-tertiary">Typeface</span>
                <div className="grid grid-cols-2 bg-[#f3f3ee] p-1 rounded-lg gap-1">
                  {[
                    { id: 'Lora', label: 'Lora', cls: 'font-serif' },
                    { id: 'Merriweather', label: 'Merriweather', cls: 'font-serif' },
                    { id: 'DM Sans', label: 'DM Sans', cls: 'font-sans' },
                    { id: 'Space Grotesk', label: 'Grotesk', cls: 'font-sans' }
                  ].map(font => (
                    <button 
                      key={font.id}
                      className={`py-2 px-3 text-sm text-left transition-colors ${fontFamily === font.id ? 'bg-white shadow-sm rounded-md text-folio-primary' : 'text-folio-tertiary hover:text-folio-primary'} ${font.cls}`} 
                      onClick={() => setFontFamily(font.id)}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-folio-tertiary">Font Size</span>
                  <span className="text-[11px] font-bold text-folio-primary">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3 mt-2 px-1">
                  <span className="text-sm font-serif text-folio-tertiary">A</span>
                  <input 
                    type="range" 
                    min="12" 
                    max="32" 
                    step="1" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value))} 
                    className="flex-1 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                  />
                  <span className="text-xl font-serif text-folio-tertiary">A</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button className="p-2 text-[#8b5e3c] hover:text-[#a87d60] hover:bg-[#eeede8] rounded-full transition-colors ml-1" aria-label="Bookmark">
          <Bookmark className="w-[18px] h-[18px] fill-current" />
        </button>
        <button 
          onClick={handleFullscreen}
          className="p-2 text-folio-tertiary hover:text-folio-primary hover:bg-[#eeede8] rounded-full transition-colors ml-1" 
          aria-label="Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
        </button>
      </div>
    </div>
  );
}
