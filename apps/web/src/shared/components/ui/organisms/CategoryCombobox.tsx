'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, Plus, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { adminApi } from '@/shared/services/api.service';

interface Category {
  id: string;
  name: string;
}

interface CategoryComboboxProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedIds = Array.isArray(value) ? value : [];

  React.useEffect(() => {
    loadCategories();
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const res = await adminApi.categories.findAll(1, 100);
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) && 
    !selectedIds.includes(c.id)
  );
  
  const exactMatch = categories.find(c => c.name.toLowerCase() === search.toLowerCase());

  const handleSelect = (id: string) => {
    onChange([...selectedIds, id]);
    setSearch('');
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter(i => i !== id));
  };

  const handleCreate = async () => {
    if (!search || isCreating) return;
    setIsCreating(true);
    try {
      const newCat = await adminApi.categories.create({ name: search });
      setCategories(prev => [...prev, newCat]);
      handleSelect(newCat.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Selector Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between bg-black/50 border border-white/10 h-11 px-3 text-sm text-neutral-400 rounded-lg hover:border-primary/50 transition-all focus:outline-none"
        >
          <span className="truncate">Thêm thể loại...</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="absolute z-[1001] mt-1 w-full rounded-lg border border-white/10 bg-[#181818] shadow-xl shadow-black/50 animate-scale-in origin-top">
            <div className="flex items-center border-b border-white/10 px-3 h-10">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-neutral-400" />
              <input
                autoFocus
                className="flex h-full w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
                placeholder="Tìm thể loại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {isLoading && <p className="p-4 text-center text-xs text-neutral-500 animate-pulse">Đang tải...</p>}
              {filtered.length === 0 && !search && !isLoading && (
                <p className="p-4 text-center text-xs text-neutral-500">Tất cả đã được chọn.</p>
              )}
              {filtered.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat.id)}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-3 pr-9 text-sm text-neutral-300 outline-none transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="truncate">{cat.name}</span>
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

      {/* Selected Badges */}
      <div className="flex flex-wrap gap-2">
        {selectedIds.map(id => {
          const cat = categories.find(c => c.id === id);
          if (!cat) return null;
          return (
            <div 
              key={id} 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-bold animate-in zoom-in-95 duration-200"
            >
              {cat.name}
              <button 
                type="button" 
                onClick={() => handleRemove(id)}
                className="hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
