import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownRight, X, Layers } from 'lucide-react';
import { navigationData, type SubMenuItem } from '@/data/navigation';
import { useTranslation } from '@/hooks/useTranslation';

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

interface FlattenedItem {
  id: string;
  title: string;
  group: string;
  path: string;
  isSubItem: boolean;
}

export const SearchCommandModal: React.FC<SearchCommandModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentLanguage } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all navigation items with hierarchy
  const allItems: FlattenedItem[] = React.useMemo(() => {
    const list: FlattenedItem[] = [];

    navigationData.forEach((group) => {
      const groupName = group.groupName;

      group.items.forEach((item) => {
        const itemTitle = item.title;

        if (item.items && item.items.length > 0) {
          item.items.forEach((sub: SubMenuItem) => {
            list.push({
              id: sub.id,
              title: `${itemTitle} › ${sub.title}`,
              group: groupName,
              path: sub.path,
              isSubItem: true,
            });
          });
        } else {
          list.push({
            id: item.id,
            title: itemTitle,
            group: groupName,
            path: item.path,
            isSubItem: false,
          });
        }
      });
    });

    return list;
  }, []);

  // Filter items by query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return allItems;
    const lower = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.group.toLowerCase().includes(lower) ||
        item.path.toLowerCase().includes(lower)
    );
  }, [allItems, query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? (filteredItems.length ? filteredItems.length - 1 : 0) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex].path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (path: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(path);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-popover/98 text-popover-foreground shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/70">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              currentLanguage === 'id'
                ? 'Ketik perintah atau cari halaman...'
                : 'Type a command or search...'
            }
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none text-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hover">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Layers className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40 stroke-1" />
              {currentLanguage === 'id'
                ? 'Tidak ada halaman yang cocok dengan pencarian Anda.'
                : 'No matching pages found for your search.'}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                      : 'text-foreground/80 hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CornerDownRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isSelected ? 'text-primary translate-x-0.5' : 'text-muted-foreground/50'
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>

                  <span className="ml-3 shrink-0 text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    {item.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer with Keyboard shortcut hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/30 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigasi:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
              ↓
            </kbd>
            <span className="ml-1">Pilih:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
              ↵ Enter
            </kbd>
          </div>
          <div className="flex items-center gap-1">
            <span>Tutup:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
