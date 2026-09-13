import { TrendingUp, Hourglass, Library } from 'lucide-react';
import { Book } from '../types';

export function Metrics({ books }: { books?: Book[] }) {
  const totalBooks = books?.length || 0;
  const finishedBooks = books?.filter(b => b.status === 'finished').length || 0;
  const readingBooks = books?.filter(b => b.status === 'reading').length || 0;
  const unreadBooks = books?.filter(b => b.status === 'new').length || 0;
  const completionPercentage = totalBooks > 0 ? Math.round((finishedBooks / totalBooks) * 100) : 0;
  return (
    <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-16 py-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-[#efede7] p-6 rounded-2xl relative overflow-hidden">
           <div className="text-[10px] uppercase tracking-[0.12em] text-folio-tertiary mb-4 font-medium flex justify-between">
              Reading Velocity
           </div>
           <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-4xl text-folio-primary">0</span>
              <span className="text-sm text-folio-tertiary font-serif italic">pages / hour</span>
           </div>
           <div className="flex items-center text-xs font-medium text-folio-tertiary mb-6">
              <TrendingUp className="w-3 h-3 mr-1" />
              -- vs last week
           </div>
           
           {/* Simple sparkline mockup */}
           <div className="absolute bottom-4 right-4 w-24 h-12 flex items-end">
             <svg viewBox="0 0 100 40" className="w-full h-full stroke-folio-hairline fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M0 35 Q 20 35, 40 35 T 70 35 T 100 35" />
             </svg>
           </div>
        </div>

        {/* Metric 2 */}
        <div className={`bg-[#efede7] p-6 rounded-2xl flex items-center justify-between ${totalBooks === 0 ? 'opacity-75' : 'opacity-100'}`}>
           <div>
             <div className="text-[10px] uppercase tracking-[0.12em] text-folio-tertiary mb-4 font-medium flex items-center gap-1">
                Library Collection
             </div>
             <div className="flex items-baseline gap-2 mb-1">
                <span className="font-serif text-4xl text-folio-primary">{totalBooks}</span>
                <span className="text-sm text-folio-tertiary font-serif italic">{totalBooks === 1 ? 'Volume' : 'Volumes'}</span>
             </div>
             <div className="text-xs font-medium text-folio-tertiary">
                {unreadBooks} unread &bull; {readingBooks} in progress
             </div>
           </div>
           
           {/* Circular progress mockup for library completion */}
           <div className="relative w-16 h-16 mr-2">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="stroke-folio-hairline fill-none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-folio-secondary fill-none" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-folio-primary">
                <Library className="w-4 h-4 text-folio-tertiary" />
              </div>
           </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#efede7] p-6 rounded-2xl relative">
           <div className="absolute top-6 right-6 text-[#9a7b5e]">
             <Hourglass className="w-5 h-5" />
           </div>
           <div className="text-[10px] uppercase tracking-[0.12em] text-folio-tertiary mb-4 font-medium">
              Deep Focus Duration
           </div>
           <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl text-folio-primary">0h 0m</span>
                <span className="text-xs text-folio-tertiary uppercase tracking-wider ml-2">this week</span>
              </div>
           </div>
           <div className="flex items-center text-xs font-medium text-folio-tertiary mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-folio-hairline mr-2"></span>
              Daily avg: 0 min
           </div>
        </div>

      </div>
    </section>
  );
}
