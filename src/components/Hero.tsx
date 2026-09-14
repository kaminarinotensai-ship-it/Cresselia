import { BookOpen, List, CloudUpload, X, ChevronRight, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ePub from 'epubjs';

export function Hero({ currentBook, onUpload, onRead }: { currentBook?: any, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onRead: () => void }) {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [toc, setToc] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isLoadingToc, setIsLoadingToc] = useState(false);

  // Clear TOC cache when book changes
  useEffect(() => {
    setToc([]);
    setExpandedItems({});
  }, [currentBook?.id]);

  useEffect(() => {
    if (isTocOpen && currentBook?.file && toc.length === 0) {
      const loadToc = async () => {
        setIsLoadingToc(true);
        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            const epub = ePub(buffer);
            const navigation = await epub.loaded.navigation;
            setToc(navigation.toc || []);
            setIsLoadingToc(false);
          };
          reader.readAsArrayBuffer(currentBook.file);
        } catch (err) {
          console.error("Failed to load TOC", err);
          setIsLoadingToc(false);
        }
      };
      loadToc();
    }
  }, [isTocOpen, currentBook, toc.length]);

  if (!currentBook) {
    return (
      <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-16 py-6 w-full">
        <div className="bg-[#efede7] rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 lg:gap-24 items-center relative overflow-hidden">
          {/* Soft radial glow in top right */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f5e6d3] opacity-60 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none z-0"></div>
          
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-[44px] leading-[1.15] tracking-tight mb-4 text-folio-primary">
              Welcome to Cresellia
            </h1>
            <p className="font-serif text-lg md:text-xl text-folio-tertiary leading-relaxed mb-10 max-w-2xl">
              An elegant, quiet-luxury reading environment. Deposit an EPUB file to begin building your personal archival shelf, complete with local parsing, typographical cleanup, and cloud sync.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative overflow-hidden cursor-pointer">
                <input type="file" accept=".epub" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <button className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded hover:bg-[#27272a] transition-colors text-sm font-medium">
                  <CloudUpload className="w-4 h-4" />
                  Deposit EPUB
                </button>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-end lg:w-1/3 relative opacity-50 grayscale z-10">
            <div className="relative w-64 h-96 bg-[#efeee9] shadow-[0_20px_40px_-15px_rgba(24,24,27,0.1)] rounded-[2px] flex flex-col items-center justify-center p-8 text-center border border-[#d6d4ce] z-10 isolate">
               <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-[rgba(0,0,0,0.05)] to-transparent border-r border-[rgba(0,0,0,0.03)] z-20"></div>
               <BookOpen className="w-12 h-12 text-folio-tertiary/40 mb-4" />
               <h2 className="font-serif text-lg uppercase tracking-widest text-folio-tertiary">No Active<br/>Book</h2>
            </div>
            <div className="absolute top-4 right-4 w-64 h-96 bg-[#e8e8e5] rounded-[2px] border border-folio-hairline z-0"></div>
            <div className="absolute top-8 right-8 w-64 h-96 bg-[#dfdfdc] rounded-[2px] border border-folio-hairline -z-10"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-16 py-6 w-full">
      <div className="bg-[#efede7] rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 lg:gap-24 relative overflow-hidden">
        {/* Soft radial glow in top right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f5e6d3] opacity-60 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none z-0"></div>
        
        {/* Left Content */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="uppercase tracking-[0.12em] text-[10px] font-medium text-folio-tertiary bg-[#f5e6dc] px-2 py-0.5 rounded text-[#8b5e3c]">Selected Volume</span>
            <div className="flex items-center text-xs text-folio-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-folio-tertiary mr-2"></span>
              Added {currentBook.date}
            </div>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[44px] leading-[1.15] tracking-tight mb-4 text-folio-primary">
            {currentBook.title}
          </h1>
          <p className="text-folio-secondary text-lg font-serif italic mb-8">
            {currentBook.author || 'Unknown Author'}
          </p>
          
          <div className="mb-10">
            <div className="flex justify-between text-sm font-medium mb-3">
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Reading</span>
              <span className="text-folio-tertiary">0%</span>
            </div>
            <div className="h-[2px] w-full bg-folio-hairline rounded-full overflow-hidden mb-3">
              <div className="h-full bg-folio-secondary w-[0%]"></div>
            </div>
            <div className="flex justify-between text-xs text-folio-tertiary font-medium">
              <span>Page 1</span>
              <span>0 annotations saved</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onRead}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded hover:bg-[#27272a] transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Resume Reading
            </button>
            <button 
              onClick={() => setIsTocOpen(true)}
              className="flex items-center gap-2 bg-[#f0ebe4] text-folio-primary px-6 py-2.5 rounded hover:bg-[#e6dfd6] transition-colors text-sm font-medium"
            >
              <List className="w-4 h-4" />
              Table of Contents
            </button>
          </div>
        </div>

        {/* Right Content - Book Mockup */}
        <div className="hidden md:flex justify-end lg:w-1/3 relative items-center z-10">
          <div 
            className="relative w-64 h-96 shadow-[0_30px_60px_-20px_rgba(24,24,27,0.25)] rounded-xl flex flex-col items-center justify-center text-center border border-[#d6d4ce] z-10 isolate overflow-hidden transition-transform hover:scale-[1.02] duration-500"
            style={{ backgroundColor: currentBook.bgColor }}
          >
            <div className="absolute top-4 left-4 text-[10px] tracking-[0.12em] font-medium text-folio-tertiary uppercase z-30 mix-blend-multiply">Epub</div>
            <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent border-r border-[rgba(0,0,0,0.03)] z-30"></div>
            
            {currentBook.coverUrl ? (
              <img src={currentBook.coverUrl} alt={currentBook.title} className="absolute inset-0 w-full h-full object-cover z-20" />
            ) : (
              <div className="z-20 p-8 flex flex-col items-center">
                <h2 className="font-serif text-2xl uppercase tracking-widest mb-6 pt-4 line-clamp-3 mix-blend-multiply">{currentBook.title}</h2>
                <div className="flex-1 w-full border-t border-b border-[#18181b]/10 my-4 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full border border-[#18181b]/20"></div>
                </div>
                <div className="text-[10px] tracking-[0.12em] text-[#8b5e3c] uppercase mb-1 truncate w-full mix-blend-multiply">{currentBook.author}</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TOC Modal */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f9f9f6] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-folio-hairline">
            <div className="px-6 py-5 border-b border-folio-hairline flex justify-between items-center bg-white">
              <h2 className="font-serif text-xl text-folio-primary">Table of Contents</h2>
              <button 
                onClick={() => setIsTocOpen(false)}
                className="p-2 text-folio-tertiary hover:text-folio-primary hover:bg-[#eeede8] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {isLoadingToc ? (
                <div className="flex justify-center items-center h-32 text-folio-tertiary font-serif">
                  Loading contents...
                </div>
              ) : toc.length > 0 ? (
                <ul className="space-y-1">
                  {toc.map((item, index) => {
                    const hasSubitems = item.subitems && item.subitems.length > 0;
                    const isExpanded = expandedItems[index];

                    return (
                      <li key={index}>
                        <div 
                          onClick={() => {
                            if (hasSubitems) {
                              setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
                            }
                          }}
                          className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg hover:bg-black/5 text-folio-secondary hover:text-folio-primary transition-colors text-sm ${hasSubitems ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span>{item.label.trim()}</span>
                          {hasSubitems && (
                            <span className="text-folio-tertiary">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                          )}
                        </div>
                        
                        {/* Sub-items if any */}
                        {hasSubitems && isExpanded && (
                          <ul className="pl-4 mt-1 space-y-1">
                            {item.subitems.map((sub: any, subIdx: number) => (
                              <li key={subIdx}>
                                <div className="w-full text-left px-4 py-2 rounded-lg hover:bg-black/5 text-folio-tertiary hover:text-folio-primary transition-colors text-xs cursor-default">
                                  {sub.label.trim()}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex justify-center items-center h-32 text-folio-tertiary font-serif italic text-sm">
                  No table of contents found in this book.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
