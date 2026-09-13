import { useState, useEffect } from 'react';
import ePub from 'epubjs';
import { get, set } from 'idb-keyval';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Book } from './types';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('library');

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const storedBooks = await get<Book[]>('folio-books');
        if (storedBooks && storedBooks.length > 0) {
          setBooks(storedBooks);
          setCurrentBook(storedBooks[0]);
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

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
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
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Failed to parse EPUB", err);
    }
  };

  const handleRemoveBook = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    
    setBooks(prev => {
      const newBooks = prev.filter(book => book.id !== id);
      set('folio-books', newBooks).catch(console.error);
      return newBooks;
    });
    setCurrentBook(prev => {
      if (prev && prev.id === id) return undefined;
      return prev;
    });
  };

  return (
    <div className={`flex flex-col font-sans text-folio-primary bg-[#f5f4f1] selection:bg-[#fdc39a] selection:text-[#301400] ${activeTab === 'reader' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <header className="w-full border-b border-folio-hairline/50 bg-[#f5f4f1]/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      </header>
      
      <main className={`flex-1 flex flex-col w-full ${activeTab === 'reader' ? 'min-h-0 overflow-hidden' : ''}`}>
        {activeTab === 'library' && (
          <>
            <Hero currentBook={currentBook} onUpload={handleFileUpload} onRead={() => setActiveTab('reader')} />
            <Metrics books={books} />
            <Library books={books} onUpload={handleFileUpload} onSelectBook={setCurrentBook} onDeleteBook={handleRemoveBook} />
          </>
        )}
        
        {activeTab === 'reader' && (
          currentBook ? (
            <Reader book={currentBook} />
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
      </main>
    </div>
  );
}
