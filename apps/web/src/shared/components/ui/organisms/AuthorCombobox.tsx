'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, Plus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { adminApi } from '@/shared/services/api.service';

interface Author {
  id: string;
  name: string;
}

interface AuthorComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function AuthorCombobox({ value, onChange }: AuthorComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [authors, setAuthors] = React.useState<Author[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    loadAuthors();
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadAuthors() {
    setIsLoading(true);
    try {
      const res = await adminApi.authors.findAll(1, 100);
      setAuthors(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = authors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = authors.find(a => a.name.toLowerCase() === search.toLowerCase());

  const selectedAuthor = authors.find(a => a.id === value);

  const handleCreate = async () => {
    if (!search || isCreating) return;
    setIsCreating(true);
    try {
      const newAuthor = await adminApi.authors.create({ name: search });
      setAuthors(prev => [...prev, newAuthor]);
      onChange(newAuthor.id);
      setOpen(false);
      setSearch('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-black/50 border border-white/10 h-11 px-3 text-sm text-neutral-200 rounded-lg hover:border-primary/50 transition-all focus:outline-none"
      >
        <span className="truncate">{selectedAuthor ? selectedAuthor.name : (isLoading ? 'Đang tải...' : 'Chọn tác giả...')}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-[1001] mt-1 w-full rounded-lg border border-white/10 bg-[#181818] shadow-xl shadow-black/50 animate-scale-in origin-top">
          <div className="flex items-center border-b border-white/10 px-3 h-10">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-neutral-400" />
            <input
              autoFocus
              className="flex h-full w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
              placeholder="Tìm kiếm tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {isLoading && <p className="p-4 text-center text-xs text-neutral-500 animate-pulse">Đang tải...</p>}
            {filtered.length === 0 && !search && !isLoading && (
              <p className="p-4 text-center text-xs text-neutral-500">Không tìm thấy tác giả.</p>
            )}
            {filtered.map(author => (
              <button
                key={author.id}
                type="button"
                onClick={() => {
                  onChange(author.id);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-3 pr-9 text-sm outline-none transition-colors hover:bg-white/5",
                  value === author.id ? "text-primary-light font-bold" : "text-neutral-300"
                )}
              >
                <span className="truncate">{author.name}</span>
                {value === author.id && (
                  <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            ))}
            
            {search && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md py-2.5 px-3 text-sm outline-none transition-colors hover:bg-primary/10 text-primary mt-1 border border-primary/20 bg-primary/5"
              >
                <Plus className="h-4 w-4" />
                <span className="truncate font-semibold">{isCreating ? 'Đang thêm...' : `Thêm mới: "${search}"`}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
