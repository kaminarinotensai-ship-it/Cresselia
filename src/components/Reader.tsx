import React, { useEffect, useRef, useState } from 'react';
import { Book as EpubBook } from 'epubjs';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Book } from '../types';
import { CANVAS_TONES, HIGHLIGHT_COLORS } from './reader/constants';
import { useEpubReader } from './reader/useEpubReader';
import { SelectionPopup } from './reader/SelectionPopup';
import { ReaderHeader } from './reader/ReaderHeader';
import { TocSidebar } from './reader/TocSidebar';
import { AnnotationSidebar } from './reader/AnnotationSidebar';

interface ReaderProps {
  book: Book;
  onProgressUpdate?: (id: string, progress: string, status?: 'reading' | 'finished') => void;
}

export function Reader({ book, onProgressUpdate }: ReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const epubBookRef = useRef<EpubBook | null>(null);

  const [selectionPopup, setSelectionPopup] = useState<{
    cfi: string;
    text: string;
    top: number;
    left: number;
  } | null>(null);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(HIGHLIGHT_COLORS[0]);

  const {
    rendition,
    isLoading,
    currentChapter,
    currentIndex,
    progressText,
    toc,
    notes,
    handlePrev,
    handleNext,
    goToLocation,
    handleAddNote,
    handleDeleteNote
  } = useEpubReader(
    book,
    onProgressUpdate,
    viewerRef,
    epubBookRef,
    selectionPopup,
    setSelectionPopup,
    selectedHighlightColor
  );

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Typography / Aa Settings State
  const [isAaMenuOpen, setIsAaMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Lora');
  const [canvasTone, setCanvasTone] = useState('Cream');
  const aaContainerRef = useRef<HTMLDivElement>(null);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ cfi: string, excerpt: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Layout Settings State
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'single' | 'spread' | 'continuous' | 'focus'>('single');
  const [isPureFocus, setIsPureFocus] = useState(false);
  const layoutContainerRef = useRef<HTMLDivElement>(null);

  // Close search on outside click or iframe click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (aaContainerRef.current && !aaContainerRef.current.contains(event.target as Node)) {
        setIsAaMenuOpen(false);
      }
      if (layoutContainerRef.current && !layoutContainerRef.current.contains(event.target as Node)) {
        setIsLayoutMenuOpen(false);
      }
    };
    
    const handleRenditionClick = () => {
      setIsSearchOpen(false);
      setIsAaMenuOpen(false);
      setIsLayoutMenuOpen(false);
    };

    if (isSearchOpen || isAaMenuOpen || isLayoutMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (rendition) {
        rendition.on('mousedown', handleRenditionClick);
        rendition.on('touchstart', handleRenditionClick);
      }
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (rendition) {
        rendition.off('mousedown', handleRenditionClick);
        rendition.off('touchstart', handleRenditionClick);
      }
    };
  }, [isSearchOpen, isAaMenuOpen, isLayoutMenuOpen, rendition]);

  // Focus Search Input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Apply Typography Theme
  useEffect(() => {
    if (rendition) {
      const fontMap: Record<string, string> = {
        'Lora': "'Lora', serif",
        'Merriweather': "'Merriweather', serif",
        'DM Sans': "'DM Sans', sans-serif",
        'Space Grotesk': "'Space Grotesk', sans-serif"
      };

      const currentTone = CANVAS_TONES.find(t => t.id === canvasTone) || CANVAS_TONES[0];
      const themeName = `theme-${Date.now()}`;

      rendition.themes.register(themeName, {
        "*": {
          "font-family": `${fontMap[fontFamily]} !important`,
        },
        "body": {
          "font-family": `${fontMap[fontFamily]} !important`,
          "background": `${currentTone.bg} !important`,
          "color": `${currentTone.color} !important`,
        },
        "h1, h2, h3, h4, p, span, a, div, li, td, em, strong, i, b, blockquote": {
          "font-family": `${fontMap[fontFamily]} !important`,
          "color": `${currentTone.color} !important`,
        },
        "::selection": {
          "background": `${currentTone.selection} !important`
        }
      });
      rendition.themes.select(themeName);
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [rendition, fontFamily, fontSize, canvasTone]);

  // Layout Dynamic Application
  useEffect(() => {
    if (rendition) {
      // Toggle Spread
      if (layoutMode === 'spread') {
        rendition.spread('auto');
      } else {
        rendition.spread('none');
      }

      // Update flow (note: some versions of epubjs handle this poorly without re-rendering, 
      // but 'scrolled-doc' gives continuous scroll if supported)
      // For focus mode we also might inject some CSS.
      // We will handle focus mode through CSS injection below.
    }
  }, [rendition, layoutMode]);

  // Handle Focus Stream Mode CSS
  useEffect(() => {
    if (rendition) {
      // Injects a CSS rule that dims paragraphs and highlights on hover
      const focusStyleId = 'focus-mode-style';
      
      rendition.hooks?.content?.register((contents: any) => {
        let styleEl = contents.document.getElementById(focusStyleId);
        
        if (layoutMode === 'focus') {
          if (!styleEl) {
            styleEl = contents.document.createElement('style');
            styleEl.id = focusStyleId;
            styleEl.innerHTML = `
              p {
                opacity: 0.3 !important;
                transition: opacity 0.3s ease !important;
              }
              p:hover, p:active {
                opacity: 1 !important;
              }
            `;
            contents.document.head.appendChild(styleEl);
          }
        } else {
          if (styleEl) {
            styleEl.remove();
          }
        }
      });
      
      // If rendition is already displayed and we toggle it, we need to manually inject/remove for the current iframe
      try {
        const iframe = (rendition.getContents() as any)?.[0]?.document;
        if (iframe) {
          let styleEl = iframe.getElementById(focusStyleId);
          if (layoutMode === 'focus') {
            if (!styleEl) {
              styleEl = iframe.createElement('style');
              styleEl.id = focusStyleId;
              styleEl.innerHTML = `
                p {
                  opacity: 0.3 !important;
                  transition: opacity 0.3s ease !important;
                }
                p:hover, p:active {
                  opacity: 1 !important;
                }
              `;
              iframe.head.appendChild(styleEl);
            }
          } else {
            if (styleEl) {
              styleEl.remove();
            }
          }
        }
      } catch (e) {
        // Ignore if iframe not accessible yet
      }
    }
  }, [rendition, layoutMode]);

  // Fullscreen Listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };


  const handleCopy = () => {
    if (selectionPopup) {
      navigator.clipboard.writeText(selectionPopup.text);
      setSelectionPopup(null);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !epubBookRef.current || !rendition) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Use the actual current location from rendition for accuracy
      const location = rendition.currentLocation();
      if (!location || !location.start) {
        setIsSearching(false);
        return;
      }

      // Get the spine item for the current chapter
      const spineItem = (epubBookRef.current.spine as any).get(location.start.href);
      if (spineItem) {
        // Load the spine item if not already loaded
        await spineItem.load(epubBookRef.current.load.bind(epubBookRef.current));
        
        const query = searchQuery.trim();
        // Use .search() if available (better cross-tag support), otherwise .find()
        let results = [];
        if (typeof spineItem.search === 'function') {
          results = spineItem.search(query);
        } else if (typeof spineItem.find === 'function') {
          results = spineItem.find(query);
        }
        
        setSearchResults(results || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to highlight the search query in the excerpt text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-[#a87d60]/30 text-[#a87d60] font-semibold px-0.5 rounded">{part}</span> 
            : part
        )}
      </>
    );
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') rendition?.next();
      if (e.key === 'ArrowLeft') rendition?.prev();
      if (e.key === 'Escape' && isPureFocus) setIsPureFocus(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rendition, isPureFocus]);

  const activeToneData = CANVAS_TONES.find(t => t.id === canvasTone) || CANVAS_TONES[0];

  return (
    <div className={`flex-1 flex flex-col items-center w-full max-w-[1800px] mx-auto h-full overflow-hidden min-h-0 relative transition-all duration-500 ${isPureFocus ? 'p-4 md:p-8 lg:p-12' : 'px-4 md:px-8 lg:px-12 py-6'}`}>
      
      
      <SelectionPopup
        selectionPopup={selectionPopup}
        setSelectionPopup={setSelectionPopup}
        rendition={rendition}
        selectedHighlightColor={selectedHighlightColor}
        setSelectedHighlightColor={setSelectedHighlightColor}
        handleAddNote={handleAddNote}
        handleCopy={handleCopy}
      />

      <ReaderHeader
        book={book}
        isPureFocus={isPureFocus}
        setIsPureFocus={setIsPureFocus}
        searchContainerRef={searchContainerRef}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        handleSearchSubmit={handleSearchSubmit}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        highlightMatch={highlightMatch}
        goToLocation={goToLocation}
        rendition={rendition}
        layoutContainerRef={layoutContainerRef}
        isLayoutMenuOpen={isLayoutMenuOpen}
        setIsLayoutMenuOpen={setIsLayoutMenuOpen}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        canvasTone={canvasTone}
        setCanvasTone={setCanvasTone}
        aaContainerRef={aaContainerRef}
        isAaMenuOpen={isAaMenuOpen}
        setIsAaMenuOpen={setIsAaMenuOpen}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        handleFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Main Content Area (Sidebar + Reader) */}
      <div className="w-full flex-1 flex flex-row items-stretch gap-8 lg:gap-16 overflow-hidden min-h-0">
        
        <TocSidebar
          isPureFocus={isPureFocus}
          progressText={progressText}
          toc={toc}
          isLoading={isLoading}
          currentChapter={currentChapter}
          goToLocation={goToLocation}
        />

        {/* Reader Container */}
        <div 
          className="w-full flex-1 rounded-xl shadow-sm border relative flex flex-col overflow-hidden min-h-0 transition-colors duration-300"
          style={{ 
            backgroundColor: activeToneData.bg,
            borderColor: activeToneData.border
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur z-10 text-folio-tertiary font-serif">
              Loading EPUB...
            </div>
          )}

          {/* EPUB Viewer */}
          <div 
            ref={viewerRef} 
            className="flex-1 relative min-h-0 w-full py-4 md:py-8 px-4 md:px-10 lg:px-14 transition-all duration-300"
          />

          {/* Bottom Navigation Footer */}
          {!isPureFocus && (
            <div 
              className="shrink-0 flex items-center justify-between px-8 md:px-16 py-6 text-xs font-bold tracking-widest border-t transition-colors duration-300"
              style={{ 
                borderColor: activeToneData.border, 
                color: canvasTone === 'Night' || canvasTone === 'Slate' ? '#a1a1aa' : '#71717a'
              }}
            >
            <button 
              onClick={handlePrev}
              className="flex items-center gap-3 hover:text-folio-primary transition-colors uppercase group"
              aria-label="Previous Page"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Previous</span>
            </button>
            
            <span className="text-[#a87d60] font-medium tracking-widest uppercase">
              {progressText.replace('P.', 'PAGE')}
            </span>
            
            <button 
              onClick={handleNext}
              className="flex items-center gap-3 hover:text-folio-primary transition-colors uppercase group"
              aria-label="Next Page"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          )}
        </div>

        <AnnotationSidebar
          isPureFocus={isPureFocus}
          notes={notes}
          currentIndex={currentIndex}
          handleDeleteNote={handleDeleteNote}
        />

      </div>
    </div>
  );
}
