import React, { useEffect, useRef, useState } from 'react';
import ePub, { Book as EpubBook, Rendition } from 'epubjs';
import { ChevronLeft, ChevronRight, ChevronDown, PlusSquare, FileText, Copy, ExternalLink, Trash2, Edit2, Search, SlidersHorizontal, Maximize, Bookmark, ArrowLeft, ArrowRight, Minimize, X, ChevronRight as ChevronRightIcon, Book as BookIcon, BookOpen, ArrowUpDown, Crosshair, AlignJustify, AlignLeft, Minus, Plus } from 'lucide-react';
import { Book } from '../types';

const TocNode = ({ item, level = 0, currentChapter, goToLocation }: { item: any, level?: number, currentChapter: string, goToLocation: (href: string) => void }) => {
  const hasChildren = item.subitems && item.subitems.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand this folder if the current active chapter is inside it
  useEffect(() => {
    const containsActive = (node: any): boolean => {
      if (node.label.trim() === currentChapter) return true;
      if (node.subitems) return node.subitems.some(containsActive);
      return false;
    };
    if (containsActive(item)) {
      setIsExpanded(true);
    }
  }, [currentChapter, item]);

  const isActive = currentChapter === item.label.trim();

  return (
    <li className="flex flex-col w-full mb-1">
      <div 
        className={`flex items-start w-full py-2.5 rounded-lg transition-colors group relative cursor-pointer ${
          isActive ? 'bg-[#e5ddd3]' : 'hover:bg-black/5'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px`, paddingRight: '12px' }}
        onClick={() => goToLocation(item.href)}
      >
        {/* Active state left border accent */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a87d60] rounded-l-lg"></div>
        )}

        {hasChildren ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
            className={`mt-0.5 p-0.5 mr-2 rounded transition-colors shrink-0 ${isActive ? 'text-[#a87d60]' : 'text-folio-tertiary hover:text-folio-primary hover:bg-black/10'}`}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-4 mr-2 shrink-0 flex items-center justify-center mt-1.5">
             <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-[#a87d60]' : 'bg-folio-hairline'}`}></div>
          </div>
        )}
        
        <div 
          className={`flex-1 text-left text-[13px] leading-snug py-0.5 truncate ${isActive ? 'text-[#a87d60] font-bold' : 'text-folio-secondary font-medium'}`} 
          title={item.label}
        >
          {item.label}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <ul className="flex flex-col mt-1 w-full">
          {item.subitems.map((sub: any, i: number) => (
            <TocNode 
              key={i} 
              item={sub} 
              level={level + 1} 
              currentChapter={currentChapter} 
              goToLocation={goToLocation} 
            />
          ))}
        </ul>
      )}
    </li>
  );
};

interface ReaderProps {
  book: Book;
}

interface Note {
  id: string;
  cfi: string;
  text: string;
  date: Date;
  color: string;
  chapterIndex: number;
}

const HIGHLIGHT_COLORS = ['#f3b79b', '#f6dfcc', '#d0dbe5'];

export function Reader({ book }: ReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const epubBookRef = useRef<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState('Front Matter');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progressText, setProgressText] = useState('Loading...');
  const [toc, setToc] = useState<any[]>([]);
  
  // Highlighting & Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const notesRef = useRef<Note[]>([]);
  
  // Sync notes to ref for the relocated callback
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  const [selectionPopup, setSelectionPopup] = useState<{
    cfi: string;
    text: string;
    top: number;
    left: number;
  } | null>(null);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(HIGHLIGHT_COLORS[0]);

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

      const toneMap: Record<string, {bg: string, color: string, selection: string}> = {
        'Cream': { bg: '#f9f9f6', color: '#2d241e', selection: 'rgba(168, 125, 96, 0.3)' },
        'Parchment': { bg: '#f1e6d1', color: '#4a3b32', selection: 'rgba(168, 125, 96, 0.3)' },
        'Sage': { bg: '#eef2ee', color: '#2a3b2c', selection: 'rgba(92, 117, 96, 0.3)' },
        'Dusty Rose': { bg: '#f6eceb', color: '#4a2f2d', selection: 'rgba(189, 137, 133, 0.3)' },
        'Slate': { bg: '#1c2127', color: '#abb2bf', selection: 'rgba(100, 120, 140, 0.4)' },
        'Night': { bg: '#121212', color: '#999999', selection: 'rgba(255, 255, 255, 0.15)' },
      };

      const currentTone = toneMap[canvasTone] || toneMap['Cream'];
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
      
      rendition.hooks.content.register((contents: any) => {
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

  useEffect(() => {
    if (!viewerRef.current || !book.file) return;

    let isMounted = true;
    let epubBook: EpubBook | null = null;
    let newRendition: Rendition | null = null;

    const loadBook = async () => {
      setIsLoading(true);
      try {
        const buffer = await book.file.arrayBuffer();
        epubBook = ePub(buffer);
        epubBookRef.current = epubBook;
        
        if (!isMounted || !viewerRef.current) return;

        newRendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        
        await epubBook.ready;
        
        newRendition.hooks.content.register((contents: any) => {
          const style = contents.document.createElement('style');
          style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Space+Grotesk:wght@300..700&display=swap');

            * {
              font-family: inherit !important;
            }

            body {
              text-align: justify;
            }

            p {
              text-indent: 1.5em;
              margin-bottom: 0;
            }

            h1 + p, h2 + p, h3 + p, body > p:first-of-type, .chapter-title + p {
              text-indent: 0 !important;
              margin-top: 1.5em;
            }

            h1, h2, h3 {
              text-align: center !important;
              font-weight: 400 !important;
            }

            h1 {
              font-size: 2.6em !important;
              margin-top: 2em !important;
              margin-bottom: 1.5em !important;
            }
            
            h2 {
              font-size: 2em !important;
              margin-top: 1.5em !important;
              margin-bottom: 1.2em !important;
            }

            h1::after, h2::after {
              content: "";
              display: block;
              width: 50px;
              height: 1px;
              background-color: #dcbfa6;
              margin: 2rem auto 3rem auto;
            }

            .chapter-number, .eyebrow {
              font-family: 'Inter', sans-serif !important;
              text-transform: uppercase !important;
              letter-spacing: 0.2em !important;
              font-size: 0.7em !important;
              text-align: center !important;
              font-weight: 600 !important;
              display: block !important;
              margin-bottom: -1em !important;
            }
          `;
          contents.document.head.appendChild(style);
        });
        
        // Extract Table of Contents
        const navigation = await epubBook.loaded.navigation;
        if (isMounted) {
          setToc(navigation.toc || []);
        }

        // Generate locations in the background for accurate page numbers
        epubBook.locations.generate(1600).then(() => {
          if (isMounted) {
            const currentLocation = newRendition?.location;
            if (currentLocation && currentLocation.start && currentLocation.start.displayed) {
              setProgressText(`P. ${currentLocation.start.displayed.page} OF ${currentLocation.start.displayed.total}`);
            }
          }
        }).catch(console.error);
        
        await newRendition.display();
        
        newRendition.on('relocated', (location: any) => {
          setSelectionPopup(null); // Hide popup on page turn
          if (!location.start || !epubBook) return;
          
          setCurrentIndex(location.start.index);
          
          // Re-render annotations for the current chapter
          notesRef.current.forEach(note => {
            if (note.chapterIndex === location.start.index && newRendition) {
              try {
                // Remove first to avoid duplicates
                newRendition.annotations.remove(note.cfi, "highlight");
                newRendition.annotations.highlight(
                  note.cfi, 
                  {}, 
                  (e: any) => { console.log("highlight clicked", e); },
                  undefined,
                  { "fill": note.color, "fill-opacity": "0.25", "mix-blend-mode": "multiply" }
                );
              } catch (e) {
                console.error("Error re-rendering annotation", e);
              }
            }
          });
          
          // Update chapter name
          const navItem = epubBook.navigation.get(location.start.href);
          if (navItem && navItem.label) {
            setCurrentChapter(navItem.label.trim());
          }
          
          // Update page numbers
          if (location.start.displayed && location.start.displayed.total) {
            setProgressText(`P. ${location.start.displayed.page} OF ${location.start.displayed.total}`);
          } else {
            const percent = Math.round(location.start.percentage * 100) || 0;
            setProgressText(`${percent}%`);
          }
        });

        // Setup Selection Events
        newRendition.on('selected', (cfiRange: string, contents: any) => {
          const selection = contents.window.getSelection();
          const text = selection.toString().trim();
          
          if (!text) {
            setSelectionPopup(null);
            return;
          }

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const iframe = contents.document.defaultView.frameElement;
          const iframeRect = iframe.getBoundingClientRect();

          setSelectionPopup({
            cfi: cfiRange,
            text: text,
            top: iframeRect.top + rect.top - 50, // Position above selection
            left: iframeRect.left + rect.left + (rect.width / 2)
          });
        });

        // Dismiss popup when clicking elsewhere in the iframe
        newRendition.on('click', () => {
          const contents = newRendition?.getContents()[0];
          const selection = contents?.window.getSelection();
          if (selection && selection.toString().trim().length > 0) {
            return; // Prevent dismissing if user just highlighted text
          }
          setSelectionPopup(null);
        });

        setRendition(newRendition);
      } catch (err) {
        console.error("Error loading epub:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBook();

    return () => {
      isMounted = false;
      if (newRendition) {
        newRendition.destroy();
      }
      if (epubBook) {
        epubBook.destroy();
      }
    };
  }, [book]);

  const handlePrev = () => rendition?.prev();
  const handleNext = () => rendition?.next();
  const goToLocation = (href: string) => rendition?.display(href);

  const handleAddNote = () => {
    if (!selectionPopup || !rendition) return;
    
    // Apply visual highlight in EPUB
    rendition.annotations.highlight(
      selectionPopup.cfi, 
      {}, 
      (e: any) => { console.log("highlight clicked", e); },
      undefined,
      { "fill": selectedHighlightColor, "fill-opacity": "0.25", "mix-blend-mode": "multiply" }
    );
    
    // Add note to state
    const newNote = {
      id: crypto.randomUUID(),
      cfi: selectionPopup.cfi,
      text: selectionPopup.text,
      date: new Date(),
      color: selectedHighlightColor,
      chapterIndex: currentIndex
    };
    setNotes(prev => [newNote, ...prev]);
    
    // Clear selection UI
    setSelectionPopup(null);
    const contents = rendition.getContents();
    contents.forEach((c: any) => c.window.getSelection().removeAllRanges());
  };

  const handleDeleteNote = (noteId: string, cfi: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (rendition) {
      rendition.annotations.remove(cfi, "highlight");
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

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-[1800px] mx-auto px-4 md:px-12 lg:px-16 py-6 h-full overflow-hidden min-h-0 relative">
      
      {/* Global Click-away for selection popup */}
      {selectionPopup && (
        <div className="absolute inset-0 z-40" onClick={() => {
          setSelectionPopup(null);
          const contents = rendition?.getContents()[0];
          contents?.window.getSelection()?.removeAllRanges();
        }}></div>
      )}

      {/* Floating Selection Menu */}
      {selectionPopup && (
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
      )}

      {/* Reader Header */}
      <div className="w-full relative flex items-center justify-between mb-8 flex-shrink-0">
        <div className="flex items-baseline space-x-3 z-10">
          <h2 className="font-serif text-2xl text-folio-primary truncate max-w-lg">{book.title}</h2>
          <span className="text-sm font-medium text-folio-tertiary whitespace-nowrap">by {book.author}</span>
        </div>
        
        {/* Top Right Navigation Icons */}
        <div className="flex items-center space-x-2 z-10 relative">
          
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
                    {[
                      { id: 'Cream', bg: '#f9f9f6', border: '#e5e5e0' },
                      { id: 'Parchment', bg: '#f1e6d1', border: '#d9cbb0' },
                      { id: 'Sage', bg: '#eef2ee', border: '#d0d8d0' },
                      { id: 'Dusty Rose', bg: '#f6eceb', border: '#e3d2d0' },
                      { id: 'Slate', bg: '#1c2127', border: '#2d3540' },
                      { id: 'Night', bg: '#121212', border: '#2a2a2a' }
                    ].map(tone => (
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

      {/* Main Content Area (Sidebar + Reader) */}
      <div className="w-full flex-1 flex flex-row items-stretch gap-8 lg:gap-16 overflow-hidden min-h-0">
        
        {/* Left Sidebar (TOC) */}
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

        {/* Reader Container */}
        <div 
          className="w-full max-w-5xl flex-1 rounded-xl shadow-sm border border-folio-hairline relative flex flex-col overflow-hidden min-h-0 transition-colors duration-300"
          style={{ 
            backgroundColor: canvasTone === 'Cream' ? '#f9f9f6' : canvasTone === 'Pristine' ? '#ffffff' : canvasTone === 'Sepia' ? '#f4ecd8' : '#18181b',
            borderColor: canvasTone === 'Night' ? '#3f3f46' : ''
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
            className="flex-1 relative min-h-0 w-full py-4 md:py-8 px-4 md:px-16 transition-all duration-300"
          />

          {/* Bottom Navigation Footer */}
          <div 
            className={`shrink-0 flex items-center justify-between px-8 md:px-16 py-6 text-xs font-bold tracking-widest border-t transition-colors duration-300 ${canvasTone === 'Night' ? 'border-[#3f3f46] text-[#a1a1aa]' : 'border-folio-hairline text-folio-tertiary'}`}
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
        </div>

        {/* Right Sidebar (Archival Notes) */}
        <div className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 space-y-6 min-h-0">
          <div className="flex flex-col shrink-0">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-folio-tertiary">Archival Notes</span>
              <span className="text-[10px] font-medium text-[#a87d60]">{notes.filter(n => n.chapterIndex === currentIndex).length} {notes.filter(n => n.chapterIndex === currentIndex).length === 1 ? 'Note' : 'Notes'}</span>
            </div>
          </div>
          
          {/* Notes Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4 pr-2">
            
            {notes.filter(n => n.chapterIndex === currentIndex).length === 0 && (
              <div className="text-center py-8 text-folio-tertiary">
                <p className="text-sm italic">No annotations in this chapter.</p>
              </div>
            )}

            {notes.filter(n => n.chapterIndex === currentIndex).map((note) => (
              <div key={note.id} className="bg-[#eeede8] rounded-xl p-4 border border-folio-hairline shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: note.color }}></div>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-[#a87d60]">Highlight</span>
                  </div>
                  <span className="text-[9px] font-medium text-folio-tertiary uppercase tracking-wider">
                    {note.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-[13px] leading-relaxed text-folio-primary mb-4 italic">
                  "{note.text}"
                </p>
                
                <div className="flex justify-between items-center pt-3 border-t border-folio-hairline/60">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-folio-tertiary">Added Today</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteNote(note.id, note.cfi)} className="text-folio-tertiary hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
