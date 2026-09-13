import { Sun, Quote, RefreshCw, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'library', label: 'Library' },
    { id: 'reader', label: 'Reader' },
    { id: 'highlights', label: 'Highlights & Notes' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <nav className="flex items-center justify-between py-6 px-4 md:px-12 lg:px-16 max-w-[1800px] mx-auto w-full">
      <div className="font-serif text-2xl tracking-tight">Cresellia</div>
      
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-folio-tertiary">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`transition-colors ${
              activeTab === tab.id 
                ? 'bg-folio-primary text-white px-4 py-1.5 rounded'
                : 'hover:text-folio-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-5 text-folio-tertiary">
        <button className="hover:text-folio-primary transition-colors"><Sun className="w-5 h-5" /></button>
        <button className="hover:text-folio-primary transition-colors"><Quote className="w-5 h-5" /></button>
        <button className="hover:text-folio-primary transition-colors"><RefreshCw className="w-5 h-5" /></button>
        <button className="w-8 h-8 rounded-full bg-folio-surface-elevated border border-folio-hairline overflow-hidden">
          <User className="w-full h-full p-1.5 text-folio-tertiary" />
        </button>
      </div>
    </nav>
  );
}
