import { useState, useEffect, useRef, MutableRefObject, RefObject } from 'react';
import ePub, { Book as EpubBook, Rendition } from 'epubjs';
import { get, set } from 'idb-keyval';
import { Book } from '../../types';

export interface Note {
  id: string;
  cfi: string;
  text: string;
  date: Date;
  color: string;
  chapterIndex: number;
}

export function useEpubReader(
  book: Book,
  onProgressUpdate: ((id: string, progress: string, status?: 'reading' | 'finished') => void) | undefined,
  viewerRef: RefObject<HTMLDivElement | null>,
  epubBookRef: MutableRefObject<EpubBook | null>,
  selectionPopup: any,
  setSelectionPopup: (popup: any) => void,
  selectedHighlightColor: string
) {
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

  useEffect(() => {
    if (!viewerRef.current || !book.file) return;

    let isMounted = true;
    let epubBook: EpubBook | null = null;
    let newRendition: Rendition | null = null;

    const loadBook = async () => {
      setIsLoading(true);
      try {
        const savedNotes = await get<Note[]>(`notes-${book.id}`);
        if (savedNotes && isMounted) {
          setNotes(savedNotes);
        }

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
        
        newRendition.hooks?.content?.register((contents: any) => {
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
        
        newRendition.on('relocated', (location: any) => {
          setSelectionPopup(null); // Hide popup on page turn
          if (!location.start || !epubBook) return;
          
          set(`progress-${book.id}`, location.start.cfi).catch(console.error);
          
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
          const navItem = epubBook!.navigation.get(location.start.href);
          if (navItem && navItem.label) {
            setCurrentChapter(navItem.label.trim());
          }
          
          // Update page numbers
          let currentProgressText = '';
          const isFinished = location.atEnd || false;
          
          if (location.start.displayed && location.start.displayed.total) {
            currentProgressText = `P. ${location.start.displayed.page} OF ${location.start.displayed.total}`;
          } else {
            const percent = Math.round(location.start.percentage * 100) || 0;
            currentProgressText = `${percent}%`;
          }
          setProgressText(currentProgressText);

          if (onProgressUpdate) {
            onProgressUpdate(book.id, currentProgressText, isFinished ? 'finished' : 'reading');
          }
        });

        const savedCfi = await get(`progress-${book.id}`);
        if (savedCfi) {
          await newRendition.display(savedCfi as string);
        } else {
          await newRendition.display();
        }

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
  }, [book.id]);

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
    
    setNotes(prev => {
      const updatedNotes = [newNote, ...prev];
      set(`notes-${book.id}`, updatedNotes).catch(console.error);
      return updatedNotes;
    });
    
    // Clear selection UI
    setSelectionPopup(null);
    const contents = rendition.getContents();
    contents.forEach((c: any) => c.window.getSelection().removeAllRanges());
  };

  const handleDeleteNote = (noteId: string, cfi: string) => {
    setNotes(prev => {
      const updatedNotes = prev.filter(n => n.id !== noteId);
      set(`notes-${book.id}`, updatedNotes).catch(console.error);
      return updatedNotes;
    });
    if (rendition) {
      rendition.annotations.remove(cfi, "highlight");
    }
  };

  return {
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
  };
}
