import { useState, useMemo } from 'react';
import { LayoutGrid, List, ChevronDown, Plus, CheckCircle2, BookOpen, Users, Trash2 } from 'lucide-react';
import { Book } from '../types';

type FilterType = 'all' | 'reading' | 'finished';
type SortType = 'recent' | 'title' | 'author';
type LayoutType = 'grid' | 'list' | 'authors';

export function Library({ books, onUpload, onSelectBook, onDeleteBook }: { books: Book[], onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onSelectBook: (book: Book) => void, onDeleteBook: (id: string) => void }) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [layoutMode, setLayoutMode] = useState<LayoutType>('grid');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (filter === 'reading') {
      result = result.filter(b => b.status === 'reading');
    } else if (filter === 'finished') {
      result = result.filter(b => b.status === 'finished');
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'author') {
      result.sort((a, b) => a.author.localeCompare(b.author));
    }
    // 'recent' uses the original array order (assumes array is already sorted newest first)

    return result;
  }, [books, filter, sortBy]);

  return (
    <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-16 py-8 w-full">
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        <div className="flex flex-wrap gap-2 text-xs font-medium tracking-wide">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${filter === 'all' ? 'bg-[#0f0f0f] text-white' : 'bg-[#e8e6e1] text-[#7a756d] hover:text-folio-primary'}`}
          >
            All Books <span className={`${filter === 'all' ? 'opacity-60 text-white/60' : 'text-[#7a756d]/60'} text-[10px]`}>{books.length}</span>
          </button>
          <button 
            onClick={() => setFilter('reading')}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${filter === 'reading' ? 'bg-[#0f0f0f] text-white' : 'bg-[#e8e6e1] text-[#7a756d] hover:text-folio-primary'}`}
          >
            Currently Reading <span className={`${filter === 'reading' ? 'opacity-60 text-white/60' : 'text-[#7a756d]/60'} text-[10px]`}>{books.filter(b => b.status === 'reading').length}</span>
          </button>
          <button 
            onClick={() => setFilter('finished')}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${filter === 'finished' ? 'bg-[#0f0f0f] text-white' : 'bg-[#e8e6e1] text-[#7a756d] hover:text-folio-primary'}`}
          >
            Finished <span className={`${filter === 'finished' ? 'opacity-60 text-white/60' : 'text-[#7a756d]/60'} text-[10px]`}>{books.filter(b => b.status === 'finished').length}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 relative">
          <div className="flex items-center gap-1 bg-[#e8e6e1] p-1 rounded text-[#7a756d]">
            <button onClick={() => setLayoutMode('grid')} className={`p-1.5 rounded transition-colors ${layoutMode === 'grid' ? 'bg-white shadow-sm text-folio-primary' : 'hover:text-folio-primary'}`} title="Grid View"><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setLayoutMode('list')} className={`p-1.5 rounded transition-colors ${layoutMode === 'list' ? 'bg-white shadow-sm text-folio-primary' : 'hover:text-folio-primary'}`} title="List View"><List className="w-4 h-4" /></button>
            <button onClick={() => setLayoutMode('authors')} className={`p-1.5 rounded transition-colors ${layoutMode === 'authors' ? 'bg-white shadow-sm text-folio-primary' : 'hover:text-folio-primary'}`} title="Group by Author"><Users className="w-4 h-4" /></button>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 text-xs font-medium text-folio-primary bg-[#e8e6e1] hover:bg-[#dfdddb] px-4 py-2.5 rounded transition-colors"
            >
              Sort: {sortBy === 'recent' ? 'Recently Added' : sortBy === 'title' ? 'Title (A-Z)' : 'Author (A-Z)'} <ChevronDown className="w-3 h-3" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-folio-hairline rounded shadow-lg py-1 z-50 w-40 text-xs text-folio-primary font-medium">
                <button className={`block w-full text-left px-4 py-2 hover:bg-[#e8e6e1] ${sortBy === 'recent' ? 'text-folio-primary bg-[#e8e6e1]/50' : 'text-folio-tertiary'}`} onClick={() => { setSortBy('recent'); setShowSortMenu(false); }}>Recently Added</button>
                <button className={`block w-full text-left px-4 py-2 hover:bg-[#e8e6e1] ${sortBy === 'title' ? 'text-folio-primary bg-[#e8e6e1]/50' : 'text-folio-tertiary'}`} onClick={() => { setSortBy('title'); setShowSortMenu(false); }}>Title (A-Z)</button>
                <button className={`block w-full text-left px-4 py-2 hover:bg-[#e8e6e1] ${sortBy === 'author' ? 'text-folio-primary bg-[#e8e6e1]/50' : 'text-folio-tertiary'}`} onClick={() => { setSortBy('author'); setShowSortMenu(false); }}>Author (A-Z)</button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 text-xs font-medium text-[#8c5e3c] bg-[#f6e8dc] border border-[#f0e0d1] px-4 py-2.5 rounded hover:bg-[#f0e0d1] transition-colors cursor-pointer relative overflow-hidden group">
            <input type="file" accept=".epub" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <Plus className="w-3.5 h-3.5" /> Add EPUB
          </button>
        </div>
      </div>

      {/* Book Grid / Empty State */}
      {filteredBooks.length > 0 ? (
        layoutMode === 'list' ? (
          <div className="flex flex-col gap-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="flex items-center gap-4 group cursor-pointer p-3 rounded-lg hover:bg-folio-surface-elevated transition-colors border border-transparent hover:border-folio-hairline" onClick={() => onSelectBook(book)}>
                <div 
                  className="w-12 md:w-16 aspect-[1/1.5] relative rounded shadow-sm overflow-hidden flex-shrink-0 bg-folio-surface-elevated"
                  style={{ backgroundColor: book.coverUrl ? 'transparent' : book.bgColor }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent border-r border-[rgba(0,0,0,0.03)] z-30"></div>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover z-20" />
                  ) : (
                    <div className="z-20 p-1 flex flex-col items-center justify-center w-full h-full">
                      <h3 className="font-serif text-[6px] md:text-[8px] leading-tight uppercase tracking-widest text-center mix-blend-multiply">{book.coverText}</h3>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-[15px] font-medium text-folio-primary leading-tight mb-0.5 truncate">{book.title}</h4>
                  <p className="text-xs text-folio-tertiary mb-1.5 truncate">{book.author}</p>
                </div>
                <div className="hidden md:flex flex-col items-end justify-center text-[10px] tracking-wide font-medium min-w-[120px]">
                  <span className={book.status === 'finished' ? 'text-emerald-700' : 'text-folio-secondary'}>
                    {book.progress}
                  </span>
                  <span className="text-folio-tertiary">{book.date}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                  className="p-2 ml-2 text-folio-tertiary/50 hover:text-red-500 hover:bg-red-50 transition-colors rounded opacity-0 group-hover:opacity-100"
                  title="Delete Book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : layoutMode === 'authors' ? (
          <div className="flex flex-col gap-12">
            {Object.entries(
              filteredBooks.reduce((acc, book) => {
                const author = book.author || 'Unknown Author';
                if (!acc[author]) acc[author] = [];
                acc[author].push(book);
                return acc;
              }, {} as Record<string, Book[]>)
            ).sort(([a], [b]) => a.localeCompare(b))
            .map(([author, authorBooks]) => (
              <div key={author}>
                <h3 className="font-serif text-xl text-folio-primary border-b border-folio-hairline pb-2 mb-6">{author}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
                  {authorBooks.map((book) => (
                    <div key={book.id} className="group cursor-pointer" onClick={() => onSelectBook(book)}>
                      {/* Cover Mockup */}
                      <div 
                        className="relative aspect-[1/1.5] bg-folio-surface-elevated mb-3 border border-folio-hairline rounded-sm shadow-sm overflow-hidden flex flex-col items-center justify-center text-center group-hover:brightness-[0.98] transition-all"
                        style={{ backgroundColor: book.coverUrl ? 'transparent' : book.bgColor }}
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent border-r border-[rgba(0,0,0,0.03)] z-30"></div>
                        <div className="absolute top-2 left-2 text-[8px] tracking-[0.12em] font-medium text-folio-tertiary uppercase z-30 mix-blend-multiply">Epub</div>
                        
                        {book.status === 'finished' && (
                          <div className="absolute top-2 right-2 text-emerald-600 z-30">
                             <CheckCircle2 className="w-4 h-4 fill-white" />
                          </div>
                        )}
                        {book.status === 'new' && (
                          <div className="absolute bottom-2 right-2 text-[9px] font-bold tracking-widest text-folio-tertiary uppercase bg-white/80 px-1.5 py-0.5 rounded-sm z-30 shadow-sm">New</div>
                        )}

                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover z-20" />
                        ) : (
                          <div className="z-20 p-3 flex flex-col items-center">
                            <h3 className="font-serif text-[15px] leading-tight uppercase tracking-widest mb-2 mix-blend-multiply">{book.coverText}</h3>
                            <p className="text-[7px] tracking-[0.15em] text-[#8b5e3c] uppercase mix-blend-multiply">{book.coverSub}</p>
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all z-40 backdrop-blur-sm"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Metadata */}
                      <div>
                        <h4 className="font-serif text-[15px] font-medium text-folio-primary leading-tight mb-0.5 truncate">{book.title}</h4>
                        <div className="flex justify-between items-center text-[10px] tracking-wide font-medium">
                          <span className={book.status === 'finished' ? 'text-emerald-700' : 'text-folio-secondary'}>
                            {book.progress}
                          </span>
                          <span className="text-folio-tertiary">{book.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
            {filteredBooks.map((book) => (
              <div key={book.id} className="group cursor-pointer" onClick={() => onSelectBook(book)}>
                {/* Cover Mockup */}
                <div 
                  className="relative aspect-[1/1.5] bg-folio-surface-elevated mb-3 border border-folio-hairline rounded-sm shadow-sm overflow-hidden flex flex-col items-center justify-center text-center group-hover:brightness-[0.98] transition-all"
                  style={{ backgroundColor: book.coverUrl ? 'transparent' : book.bgColor }}
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent border-r border-[rgba(0,0,0,0.03)] z-30"></div>
                  <div className="absolute top-2 left-2 text-[8px] tracking-[0.12em] font-medium text-folio-tertiary uppercase z-30 mix-blend-multiply">Epub</div>
                  
                  {book.status === 'finished' && (
                    <div className="absolute top-2 right-2 text-emerald-600 z-30">
                       <CheckCircle2 className="w-4 h-4 fill-white" />
                    </div>
                  )}
                  {book.status === 'new' && (
                    <div className="absolute bottom-2 right-2 text-[9px] font-bold tracking-widest text-folio-tertiary uppercase bg-white/80 px-1.5 py-0.5 rounded-sm z-30 shadow-sm">New</div>
                  )}

                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover z-20" />
                  ) : (
                    <div className="z-20 p-3 flex flex-col items-center">
                      <h3 className="font-serif text-[15px] leading-tight uppercase tracking-widest mb-2 mix-blend-multiply">{book.coverText}</h3>
                      <p className="text-[7px] tracking-[0.15em] text-[#8b5e3c] uppercase mix-blend-multiply">{book.coverSub}</p>
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all z-40 backdrop-blur-sm"
                    title="Delete Book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metadata */}
                <div>
                  <h4 className="font-serif text-[15px] font-medium text-folio-primary leading-tight mb-0.5 truncate">{book.title}</h4>
                  <p className="text-xs text-folio-tertiary mb-1.5 truncate">{book.author}</p>
                  <div className="flex justify-between items-center text-[10px] tracking-wide font-medium">
                    <span className={book.status === 'finished' ? 'text-emerald-700' : 'text-folio-secondary'}>
                      {book.progress}
                    </span>
                    <span className="text-folio-tertiary">{book.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : books.length > 0 ? (
        <div className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-folio-hairline rounded-lg bg-folio-surface-elevated/30">
          <BookOpen className="w-12 h-12 text-folio-tertiary/50 mb-4" />
          <h3 className="font-serif text-xl font-medium text-folio-primary mb-2">No books found</h3>
          <p className="text-folio-tertiary text-sm max-w-md text-center mb-6">
            There are no books matching your current filter.
          </p>
          <button onClick={() => setFilter('all')} className="bg-folio-surface border border-folio-hairline text-folio-primary px-6 py-2.5 rounded hover:bg-folio-surface-elevated transition-colors text-sm font-medium">
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-folio-hairline rounded-lg bg-folio-surface-elevated/30">
          <BookOpen className="w-12 h-12 text-folio-tertiary/50 mb-4" />
          <h3 className="font-serif text-xl font-medium text-folio-primary mb-2">Your library is empty</h3>
          <p className="text-folio-tertiary text-sm max-w-md text-center mb-6">
            Upload an EPUB file to begin building your personal archival shelf.
          </p>
          <div className="relative overflow-hidden cursor-pointer">
            <input type="file" accept=".epub" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <button className="bg-black text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-[#27272a] transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Deposit EPUB
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
