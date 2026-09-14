import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const TocNode: React.FC<{ item: any, level?: number, currentChapter: string, goToLocation: (href: string) => void }> = ({ item, level = 0, currentChapter, goToLocation }) => {
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
