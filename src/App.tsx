import React, { useState, useEffect } from 'react';
import ePub from 'epubjs';
import { get, set } from 'idb-keyval';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Book } from './types';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const storedBooks = await get<Book[]>('folio-books');
        if (storedBooks && storedBooks.length > 0) {
          const booksWithProgress = await Promise.all(storedBooks.map(async (book) => {
            const progress = await get(`progressText-${book.id}`);
            const status = await get(`status-${book.id}`);
            return {
              ...book,
              progress: progress || book.progress,
              status: status || book.status
            };
          }));
          setBooks(booksWithProgress);
          setCurrentBook(booksWithProgress[0]);
        }
      } catch (error) {
        console.error("Failed to load books from IndexedDB", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadBooks();
  }, []);

  const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const reader = new FileReader();
      
      reader.onerror = () => {
        setUploadError("Couldn't read this file — it may be corrupted or have incorrect permissions.");
        console.error("FileReader error", reader.error);
        event.target.value = '';
      };
      
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const epub = ePub(buffer);
          const metadata = await epub.loaded.metadata;
          
          // Try extracting cover, this might fail or return null depending on epub
          let coverUrl = null;
        try {
          const coverPath = await epub.coverUrl();
          if (coverPath) {
             const coverBlob = await (await fetch(coverPath)).blob();
             coverUrl = await blobToDataUrl(coverBlob);
          }
        } catch (err) {
          console.warn("Cover could not be extracted", err);
        }

        const colors = ['#e3dfd3', '#c2b3a1', '#b4c4ce', '#e2ddcd', '#aab6c4', '#e5d9d4'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const title = metadata.title || file.name.replace('.epub', '');
        const author = metadata.creator || 'Unknown Author';

        const newBook: Book = {
          id: crypto.randomUUID(),
          title,
          author,
          coverUrl,
          file,
          progress: 'Not started',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          status: 'new',
          bgColor: randomColor,
          coverText: title,
          coverSub: author,
        };

        setBooks(prev => {
          const newBooks = [newBook, ...prev];
          set('folio-books', newBooks).catch(console.error);
          return newBooks;
        });
        
        setCurrentBook(prev => {
          if (!prev) return newBook;
          return prev;
        });
        } catch (err) {
          console.error("Failed to parse EPUB", err);
          setUploadError("Couldn't open this file — it may not be a valid EPUB.");
        } finally {
          event.target.value = '';
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Failed to start file reader", err);
      setUploadError("Couldn't open this file — it may not be a valid EPUB.");
      event.target.value = '';
    }
  };

  const handleRemoveBook = (id: string) => {
    setBookToDelete(id);
  };

  const confirmRemoveBook = () => {
    if (!bookToDelete) return;
    const id = bookToDelete;
    
    setBooks(prev => {
      const newBooks = prev.filter(book => book.id !== id);
      set('folio-books', newBooks).catch(console.error);
      return newBooks;
    });
    setCurrentBook(prev => {
      if (prev && prev.id === id) return null;
      return prev;
    });
    setBookToDelete(null);
  };

  const handleProgressUpdate = (id: string, progress: string, status?: 'reading' | 'finished') => {
    set(`progressText-${id}`, progress).catch(console.error);
    if (status) {
      set(`status-${id}`, status).catch(console.error);
    }
    
    setBooks(prev => {
      const newBooks = prev.map(book => {
        if (book.id === id) {
          return {
            ...book,
            progress,
            status: status || book.status
          };
        }
        return book;
      });
      return newBooks;
    });
    
    setCurrentBook(prev => {
      if (prev && prev.id === id) {
        return { ...prev, progress, status: status || prev.status };
      }
      return prev;
    });
  };

  return (
    <div className={`flex flex-col font-sans text-folio-primary bg-[#f5f4f1] selection:bg-[#fdc39a] selection:text-[#301400] ${activeTab === 'reader' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <header className="w-full border-b border-folio-hairline/50 bg-[#f5f4f1]/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      </header>
      
      <main className={`flex-1 flex flex-col w-full ${activeTab === 'reader' ? 'min-h-0 overflow-hidden' : ''}`}>
        {!isLoaded ? (
          <div className="flex-1 flex items-center justify-center py-20 text-folio-tertiary">
            <p>Loading your library...</p>
          </div>
        ) : (
          <>
            {activeTab === 'library' && (
              <>
                {uploadError && (
                  <div className="max-w-7xl mx-auto w-full px-6 md:px-12 mt-6">
                    <div className="bg-[#f9f9f6] border border-[#a87d60]/30 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-[#9e4747]" />
                        <span className="text-sm font-medium text-folio-primary">{uploadError}</span>
                      </div>
                      <button onClick={() => setUploadError(null)} className="text-folio-tertiary hover:text-folio-primary transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <Hero currentBook={currentBook} onUpload={handleFileUpload} onRead={() => setActiveTab('reader')} />
                <Metrics books={books} />
                <Library books={books} onUpload={handleFileUpload} onSelectBook={setCurrentBook} onDeleteBook={handleRemoveBook} />
              </>
            )}
            
            {activeTab === 'reader' && (
              currentBook ? (
                <Reader book={currentBook} onProgressUpdate={handleProgressUpdate} />
              ) : (
                <div className="flex-1 flex items-center justify-center py-20 text-folio-tertiary">
                  <p>Select a book from the Library to start reading.</p>
                </div>
              )
            )}
            
            {activeTab === 'highlights' && (
              <div className="flex-1 flex items-center justify-center py-20 text-folio-tertiary">
                <p>Highlights and notes will appear here.</p>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="flex-1 flex items-center justify-center py-20 text-folio-tertiary">
                <p>Settings will appear here.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Custom Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f9f9f6] w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-folio-hairline animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <p className="text-folio-secondary text-[15px] font-serif mb-6 leading-relaxed text-center mt-2">
                Are you sure you want to remove this book from your library? This action cannot be undone and will erase your reading progress.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setBookToDelete(null)}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-folio-tertiary hover:text-folio-primary hover:bg-[#eeede8] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemoveBook}
                  className="px-6 py-2 rounded-lg text-sm font-medium bg-[#9e4747] text-white hover:bg-[#853939] transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
