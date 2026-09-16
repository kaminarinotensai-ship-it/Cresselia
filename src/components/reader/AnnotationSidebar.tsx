import React from 'react';
import { Trash2 } from 'lucide-react';
import { Note } from './useEpubReader';

interface AnnotationSidebarProps {
  isPureFocus: boolean;
  notes: Note[];
  currentIndex: number;
  handleDeleteNote: (noteId: string, cfi: string) => void;
}

export function AnnotationSidebar({
  isPureFocus,
  notes,
  currentIndex,
  handleDeleteNote
}: AnnotationSidebarProps) {
  if (isPureFocus) return null;

  return (
    <div className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 space-y-6 min-h-0">
      <div className="flex flex-col shrink-0">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-folio-tertiary">Archival Notes</span>
          <span className="text-[10px] font-medium text-[#a87d60]">
            {notes.filter(n => n.chapterIndex === currentIndex).length} {notes.filter(n => n.chapterIndex === currentIndex).length === 1 ? 'Note' : 'Notes'}
          </span>
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
  );
}
