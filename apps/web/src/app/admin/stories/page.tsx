'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Upload,
  BookOpen,
  FileText,
  ChevronRight,
  Layout,
  Clock,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  Star,
  Search,
  Filter,
  ListOrdered
} from 'lucide-react';
import Link from 'next/link';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { Select } from '@/shared/components/ui/atoms/Select';
import { AuthorCombobox } from '@/shared/components/ui/organisms/AuthorCombobox';
import { CategoryCombobox } from '@/shared/components/ui/organisms/CategoryCombobox';
import { StatusSelect } from '@/shared/components/ui/organisms/StatusSelect';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { cn } from '@/shared/utils/cn';
import { uploadToCloudinary } from '@/shared/utils/cloudinary';
import { toast, Toaster } from 'sonner';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';

interface ChapterForm {
  title: string;
  order: number;
  content: string;
}

const EmptyState = ({ icon: Icon, title, description, action }: any) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
      <Icon className="h-10 w-10 text-neutral-600" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-neutral-500 max-w-xs mb-8">{description}</p>
    {action}
  </div>
);

export default function AdminStoriesPage() {
  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [limit, setLimit] = React.useState(25);
  const [allAuthors, setAllAuthors] = React.useState<any[]>([]);
  const [allCategories, setAllCategories] = React.useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = React.useState(false);
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<{ type: 'success' | 'error' | 'progress'; message: string } | null>(null);
  const [editingChapterIdx, setEditingChapterIdx] = React.useState<number | null>(null);

  const [newChapter, setNewChapter] = React.useState<ChapterForm>({
    title: '',
    order: 1,
    content: ''
  });

  const [form, setForm] = React.useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    bannerImage: '',
    status: 'ONGOING',
    authorId: '',
    categoryIds: [] as string[],
    tempAuthorName: '',
    tempCategoryNames: [] as string[],
    chapters: [] as ChapterForm[]
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData(currentPage, limit);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, limit, search, statusFilter]);

  async function loadData(page = 1, l = 10) {
    setIsLoading(true);
    try {
      const res = await adminApi.stories.findAll(page, l, search, statusFilter);
      setStories(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.total || 0);

      // Load authors and categories for mapping if not loaded
      if (allAuthors.length === 0) {
        const authorsRes = await adminApi.authors.findAll(1, 1000);
        setAllAuthors(authorsRes.data || []);
      }
      if (allCategories.length === 0) {
        const catsRes = await adminApi.categories.findAll(1, 1000);
        setAllCategories(catsRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };

      // Auto-generate slug from title if title is being changed
      if (name === 'title' && !editingId) {
        const generatedSlug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd')
          .replace(/([^0-9a-z-\s])/g, '')
          .replace(/(\s+)/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        newForm.slug = generatedSlug;
      }

      return newForm;
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      description: '',
      coverImage: '',
      bannerImage: '',
      status: 'ONGOING',
      authorId: '',
      categoryIds: [],
      tempAuthorName: '',
      tempCategoryNames: [],
      chapters: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (story: any) => {
    setEditingId(story.id);
    setForm({
      title: story.title,
      slug: story.slug,
      description: story.description || '',
      coverImage: story.coverImage || '',
      bannerImage: story.bannerImage || '',
      status: story.status,
      authorId: story.authorId || '',
      categoryIds: story.categories?.map((c: any) => c.id) || [],
      tempAuthorName: '',
      tempCategoryNames: [],
      chapters: []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.stories.delete(id);
      loadData(currentPage, limit);
      toast.success('Đã xóa truyện thành công');
    } catch (err) {
      toast.error('Lỗi khi xóa truyện.');
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    const MAX_SIZE_MB = 100;
    const WARN_SIZE_MB = 10;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
      setImportStatus({ type: 'error', message: `File quá lớn (${fileSizeMB.toFixed(1)}MB). Tối đa ${MAX_SIZE_MB}MB.` });
      setTimeout(() => setImportStatus(null), 5000);
      return;
    }

    setIsImporting(true);
    setImportStatus({ type: 'progress', message: `Đang đọc file (${fileSizeMB.toFixed(1)}MB)...` });

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setImportStatus({ type: 'progress', message: `Đang đọc file... ${pct}%` });
      }
    };

    reader.onload = (event) => {
      try {
        setImportStatus({ type: 'progress', message: 'Đang phân tích JSON...' });
        const json = JSON.parse(event.target?.result as string);

        // Map chapters (handle 'name' -> 'title' if needed)
        const rawChapters = json.chapters || [];
        const chapters = rawChapters.map((ch: any, idx: number) => ({
          title: ch.name || ch.title || `Chương ${idx + 1}`,
          content: ch.content || '',
          order: ch.order || idx + 1
        }));

        // Smart mapping for author
        let authorId = form.authorId;
        let tempAuthorName = '';
        if (json.author) {
          const match = allAuthors.find(a =>
            a.name.toLowerCase().trim() === json.author.toLowerCase().trim()
          );
          if (match) {
            authorId = match.id;
            tempAuthorName = '';
          } else {
            authorId = '';
            tempAuthorName = json.author;
          }
        }

        // Smart mapping for categories
        let categoryIds = [...form.categoryIds];
        let tempCategoryNames: string[] = [];
        if (json.categories) {
          const catNames = typeof json.categories === 'string'
            ? json.categories.split(',').map((s: string) => s.trim())
            : Array.isArray(json.categories) ? json.categories.map((s: any) => String(s).trim()) : [];

          const matchedIds: string[] = [];
          const missingNames: string[] = [];

          catNames.forEach(name => {
            const match = allCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (match) matchedIds.push(match.id);
            else missingNames.push(name);
          });

          categoryIds = matchedIds;
          tempCategoryNames = missingNames;
        }

        setForm(prev => ({
          ...prev,
          title: json.title || prev.title,
          slug: json.slug || prev.slug,
          description: json.description || prev.description,
          coverImage: json.coverImage || prev.coverImage,
          authorId,
          tempAuthorName,
          categoryIds,
          tempCategoryNames,
          chapters,
        }));

        const statusMsg = `✓ Đã import ${chapters.length} chương. ` +
          (tempAuthorName ? `Sẽ tạo mới tác giả: "${tempAuthorName}". ` : `Khớp tác giả. `) +
          (tempCategoryNames.length > 0 ? `Sẽ tạo mới ${tempCategoryNames.length} thể loại.` : `Khớp thể loại.`);

        setImportStatus({ type: 'success', message: statusMsg });

        if (!isModalOpen) {
          setEditingId(null);
          setIsModalOpen(true);
        }
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        console.error('[JSON Import] Parse error:', err);
        setImportStatus({ type: 'error', message: 'File JSON không hợp lệ hoặc sai định dạng.' });
        setTimeout(() => setImportStatus(null), 5000);
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      setImportStatus({ type: 'error', message: 'Không thể đọc file. Vui lòng thử lại.' });
      setTimeout(() => setImportStatus(null), 5000);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'cover') setUploadingCover(true);
    else setUploadingBanner(true);

    try {
      const url = await uploadToCloudinary(file);
      setForm(prev => ({
        ...prev,
        [type === 'cover' ? 'coverImage' : 'bannerImage']: url
      }));
      toast.success(`Đã tải lên ${type === 'cover' ? 'ảnh bìa' : 'ảnh nền'} thành công!`);
    } catch (err: any) {
      console.error('[Upload Error]', err);
      toast.error(`Lỗi upload: ${err.message}`);
    } finally {
      if (type === 'cover') setUploadingCover(false);
      else setUploadingBanner(false);
    }
  };

  const addManualChapter = () => {
    if (!newChapter.title || !newChapter.content) {
      toast.warning('Vui lòng nhập đầy đủ tiêu đề và nội dung chương');
      return;
    }

    if (editingChapterIdx !== null) {
      // Update existing chapter
      setForm(prev => {
        const updated = [...prev.chapters];
        updated[editingChapterIdx] = { ...newChapter };
        return { ...prev, chapters: updated };
      });
      setEditingChapterIdx(null);
    } else {
      // Add new chapter
      setForm(prev => ({
        ...prev,
        chapters: [...prev.chapters, { ...newChapter, order: prev.chapters.length + 1 }]
      }));
    }

    setNewChapter({ title: '', order: form.chapters.length + (editingChapterIdx !== null ? 1 : 2), content: '' });
  };

  const handleEditChapter = (index: number) => {
    setEditingChapterIdx(index);
    setNewChapter({ ...form.chapters[index] });
    // Scroll to form? 
    document.getElementById('chapter-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeChapter = (index: number) => {
    if (editingChapterIdx === index) setEditingChapterIdx(null);
    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index).map((ch, i) => ({ ...ch, order: i + 1 }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    // Basic validation
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề truyện');
      return;
    }
    if (!form.authorId && !form.tempAuthorName) {
      toast.error('Vui lòng chọn tác giả hoặc để lại tên tác giả để tạo mới');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Auto-provision Author if needed
      let finalAuthorId = form.authorId;
      if (!finalAuthorId && form.tempAuthorName) {
        setImportStatus({ type: 'progress', message: `Đang tạo tác giả mới: ${form.tempAuthorName}...` });
        const newAuthor = await adminApi.authors.create({ name: form.tempAuthorName });
        finalAuthorId = newAuthor.id;
        // Refresh author list for future use
        const authorsRes = await adminApi.authors.findAll(1, 1000);
        setAllAuthors(authorsRes.data || []);
      }

      // 2. Auto-provision Categories if needed
      let finalCategoryIds = [...form.categoryIds];
      if (form.tempCategoryNames.length > 0) {
        setImportStatus({ type: 'progress', message: `Đang tạo ${form.tempCategoryNames.length} thể loại mới...` });
        for (const catName of form.tempCategoryNames) {
          const newCat = await adminApi.categories.create({ name: catName });
          finalCategoryIds.push(newCat.id);
        }
        // Refresh category list
        const catsRes = await adminApi.categories.findAll(1, 1000);
        setAllCategories(catsRes.data || []);
      }

      const finalForm = {
        ...form,
        authorId: finalAuthorId,
        categoryIds: finalCategoryIds
      };

      if (editingId) {
        await adminApi.stories.update(editingId, finalForm);
        setIsModalOpen(false);
        loadData(currentPage, limit);
        toast.success('Lưu thay đổi thành công!');
        setImportStatus({ type: 'success', message: 'Lưu thay đổi thành công!' });
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        // Remove chapters from the initial create payload to avoid server timeout/payload size issues
        const { chapters, tempAuthorName, tempCategoryNames, ...storyData } = finalForm;
        const newStory = await adminApi.stories.create(storyData);

        // Chunk and upload chapters if any
        if (chapters && chapters.length > 0) {
          const CHUNK_SIZE = 200;
          for (let i = 0; i < chapters.length; i += CHUNK_SIZE) {
            const batch = chapters.slice(i, i + CHUNK_SIZE);
            setImportStatus({ type: 'progress', message: `Đang lưu chương ${i + 1} đến ${Math.min(i + CHUNK_SIZE, chapters.length)}...` });
            await adminApi.stories.addChapter(newStory.id, batch);
          }
        }

        setIsModalOpen(false);
        loadData(currentPage, limit);
        toast.success('Tạo truyện và lưu chương thành công!');
        setImportStatus({ type: 'success', message: 'Tạo truyện và lưu chương thành công!' });
        setTimeout(() => setImportStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu dữ liệu. Vui lòng thử lại.');
      setImportStatus({ type: 'error', message: 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.' });
      setTimeout(() => setImportStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      <Toaster position="bottom-left" richColors theme="dark" />
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Content Management</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Truyện</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleJsonImport} />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="h-10 rounded-xl border-white/10 hover:bg-white/5 px-4 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            {isImporting ? (
              <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Đang Import...</>
            ) : (
              <><Upload className="h-4 w-4" /> Import JSON</>
            )}
          </Button>
          <Button
            onClick={openCreateModal}
            className="h-10 rounded-xl bg-primary hover:bg-primary-hover px-5 font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white"
          >
            <Plus className="h-4 w-4" /> Thêm Truyện
          </Button>
        </div>
      </div>

      {/* Import status banner */}
      {importStatus && (
        <div className={cn(
          'flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-bold mb-2 animate-in fade-in slide-in-from-top-2 duration-300',
          importStatus.type === 'success' && 'bg-green-500/10 border-green-500/20 text-green-400',
          importStatus.type === 'error' && 'bg-red-500/10 border-red-500/20 text-red-400',
          importStatus.type === 'progress' && 'bg-primary/10 border-primary/20 text-primary-light',
        )}>
          {importStatus.type === 'progress' && <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary-light animate-spin shrink-0" />}
          {importStatus.message}
        </div>
      )}

      <div className="flex-1 flex flex-col gap-6 mb-8 lg:mb-0">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm kiếm theo tên truyện, slug..."
                className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
              />
            </div>
            <AdminSelect
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ONGOING', label: 'Đang ra' },
                { value: 'COMPLETED', label: 'Hoàn thành' },
                { value: 'PAUSED', label: 'Tạm dừng' },
                { value: 'DROPPED', label: 'Đã bỏ' },
              ]}
              className="w-56"
            />
          </div>
        </div>

        {/* Stories Table */}
        <div className="flex-1 bg-[#121212] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-200">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
              </div>
            )}

            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Truyện</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng Thái</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Chỉ Số</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Ngày Tạo</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stories.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={BookOpen}
                        title="Chưa có truyện nào"
                        description={search ? `Không tìm thấy kết quả nào cho "${search}"` : "Hệ thống chưa có truyện nào. Hãy thêm truyện mới ngay!"}
                        action={!search && (
                          <Button onClick={openCreateModal} className="h-10 rounded-lg bg-primary/10 text-primary-light border border-primary/20 px-6 font-bold text-xs">
                            Thêm Truyện Mới
                          </Button>
                        )}
                      />
                    </td>
                  </tr>
                ) : stories.map((story) => (
                  <tr key={story.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-12 rounded-lg bg-neutral-800 border border-white/10 overflow-hidden shrink-0">
                          {story.coverImage ? (
                            <img src={story.coverImage} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-600">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-base font-bold text-white group-hover:text-primary-light transition-colors truncate max-w-xs">{story.title}</p>
                          <p className="text-xs font-medium text-neutral-500">bởi {story.author?.name || 'Vô danh'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        story.status === 'COMPLETED' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          story.status === 'ONGOING' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      )}>
                        {story.status === 'COMPLETED' ? 'Hoàn Thành' : 'Đang Ra'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 text-xs font-bold text-neutral-400">
                        <div className="flex items-center gap-1.5" title="Chương">
                          <BookOpen className="h-4 w-4" /> {story._count?.chapters || 0}
                        </div>
                        <div className="flex items-center gap-1.5" title="Lượt xem">
                          <Eye className="h-4 w-4" /> {story.views || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-400" title="Đánh giá">
                          <Star className="h-4 w-4 fill-current" /> {(story.rating || 0).toFixed(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-neutral-300">{new Date(story.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-[10px] text-neutral-600 font-medium">{new Date(story.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/stories/${story.id}/chapters`}
                          className="p-2 rounded-lg text-neutral-500 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Quản lý chương"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/10 hover:text-white" asChild>
                          <Link href={`/read/${story.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/10 hover:text-white" onClick={() => openEditModal(story)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-red-500" onClick={() => handleDelete(story.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
          />
        </div>
      </div>

      {/* Slide-over Modal */}
      <Portal>
        <div className={cn(
          "fixed inset-0 z-[1000] transition-all duration-500 flex justify-end",
          isModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-500" onClick={() => setIsModalOpen(false)} />

          <div className={cn(
            "relative w-full md:w-[85%] lg:w-[80%] xl:w-[75%] h-full bg-[#0a0a0a] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out flex flex-col border-l border-white/10",
            isModalOpen ? "translate-x-0" : "translate-x-full"
          )}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{editingId ? 'Chỉnh Sửa Truyện' : 'Thêm Truyện Mới'}</h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{editingId ? 'Story Metadata' : 'New Creation'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (form.title && !confirm('Bạn có chắc chắn muốn đóng? Mọi thay đổi chưa lưu sẽ bị mất.')) return;
                  setIsModalOpen(false);
                }}
                className="h-11 w-11 rounded-xl border border-white/10 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form id="story-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/30">
              <div className="p-8 space-y-12 pb-24">

                {/* Media Cinematic Asset Production */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]">
                        <ImageIcon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Production Assets</h3>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Media & Identity</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Cover Upload Zone */}
                    <div className="lg:col-span-4 group/card">
                      <div className="relative h-[420px] rounded-xl border border-white/10 bg-black/40 overflow-hidden transition-all duration-500 hover:border-primary/40 shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Truyện Cover (3:4)</span>
                          {form.coverImage && (
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))}
                              className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="flex-1 relative group/upload cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                          {form.coverImage ? (
                            <img src={form.coverImage} className="h-full w-full object-cover transition-transform duration-700 group-hover/upload:scale-110" />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-gradient-to-b from-transparent to-primary/5">
                              <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/upload:bg-primary/20 group-hover/upload:border-primary/40 transition-all duration-300">
                                <Upload className="h-6 w-6 text-neutral-500 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Drop cover here</p>
                                <p className="text-[9px] font-bold text-neutral-500 uppercase leading-relaxed">Recommended size:<br />600 x 800px</p>
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="px-4 py-2 rounded-lg bg-black/60 border border-white/20 text-[9px] font-black text-white uppercase tracking-widest">
                              Change Asset
                            </div>
                          </div>

                          {uploadingCover && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-20">
                              <div className="h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Uploading</span>
                            </div>
                          )}
                        </div>
                        <input type="file" className="hidden" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} accept="image/*" />
                      </div>
                    </div>

                    {/* Banner Upload Zone */}
                    <div className="lg:col-span-8 group/card">
                      <div className="relative h-[420px] rounded-xl border border-white/10 bg-black/40 overflow-hidden transition-all duration-500 hover:border-primary/40 shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Banner Cinematic (21:9)</span>
                          {form.bannerImage && (
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, bannerImage: '' }))}
                              className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="flex-1 relative group/upload cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                          {form.bannerImage ? (
                            <img src={form.bannerImage} className="h-full w-full object-cover transition-transform duration-1000 group-hover/upload:scale-105" />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-12 text-center bg-gradient-to-b from-transparent to-primary/5">
                              <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/upload:bg-primary/20 group-hover/upload:border-primary/40 transition-all duration-300">
                                <ImageIcon className="h-8 w-8 text-neutral-500 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Cinematic Backdrop Production</p>
                                <p className="text-[10px] font-bold text-neutral-600 uppercase max-w-xs mx-auto leading-relaxed">
                                  Drag and drop your widescreen banner asset. Higher resolutions recommended for high-DPI displays.
                                </p>
                              </div>
                              <div className="px-6 py-2.5 rounded-lg border border-white/10 text-[9px] font-black text-neutral-400 uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                Select File
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="px-6 py-3 rounded-lg bg-black/60 border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                              Replace Cinematic Asset
                            </div>
                          </div>

                          {uploadingBanner && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-20">
                              <div className="h-12 w-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" />
                              <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Processing Master</span>
                            </div>
                          )}
                        </div>
                        <input type="file" className="hidden" ref={bannerInputRef} onChange={(e) => handleImageUpload(e, 'banner')} accept="image/*" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Basic Info Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layout className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Thông Tin Cơ Bản</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tiêu đề truyện</label>
                      <input
                        name="title" value={form.title} onChange={handleFormChange} required
                        placeholder="Ví dụ: Tiên Nghịch..."
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all shadow-inner placeholder:text-neutral-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Đường dẫn (Slug)</label>
                      <input
                        name="slug" value={form.slug} onChange={handleFormChange} required
                        placeholder="tien-nghich"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all shadow-inner placeholder:text-neutral-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Mô tả chi tiết</label>
                    <textarea
                      name="description" value={form.description} onChange={handleFormChange} rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-neutral-300 outline-none focus:border-primary/50 transition-all resize-none shadow-inner placeholder:text-neutral-600"
                      placeholder="Nội dung tóm tắt của truyện..."
                    />
                  </div>
                </section>

                {/* Classification Section - FIXED ALIGNMENT */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Phân Loại & Trạng Thái</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tác giả</label>
                      <AuthorCombobox
                        value={form.authorId}
                        onChange={(id) => setForm(prev => ({ ...prev, authorId: id, tempAuthorName: id ? '' : prev.tempAuthorName }))}
                      />
                      {form.tempAuthorName && (
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest px-1">
                          Sẽ tạo mới: {form.tempAuthorName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Thể loại</label>
                      <CategoryCombobox
                        value={form.categoryIds}
                        onChange={(ids) => setForm(prev => ({ ...prev, categoryIds: ids }))}
                      />
                      {form.tempCategoryNames.length > 0 && (
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest px-1">
                          Thêm mới: {form.tempCategoryNames.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng thái</label>
                      <StatusSelect
                        value={form.status}
                        onChange={(val) => setForm(prev => ({ ...prev, status: val }))}
                      />
                    </div>
                  </div>
                </section>

                {/* Chapter Section (Manual Add & List) */}
                {!editingId && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Quản Lý Chương ({form.chapters.length})</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleJsonImport} />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-black uppercase tracking-widest text-primary-light hover:bg-primary/10"
                        >
                          <Upload className="h-3 w-3 mr-1" /> Import JSON
                        </Button>
                      </div>
                    </div>

                    {/* New Chapter Form */}
                    <div id="chapter-form-anchor" className={cn(
                      "p-6 rounded-xl border transition-all duration-300 space-y-4",
                      editingChapterIdx !== null ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-white/5 border-white/10"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-light">
                          {editingChapterIdx !== null ? `Editing Chapter ${editingChapterIdx + 1}` : 'Quick Add Chapter'}
                        </label>
                        {editingChapterIdx !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingChapterIdx(null);
                              setNewChapter({ title: '', order: form.chapters.length + 1, content: '' });
                            }}
                            className="text-[9px] font-black uppercase text-neutral-500 hover:text-white"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tiêu đề chương</label>
                          <input
                            value={newChapter.title}
                            onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ví dụ: Chương 1: Khởi đầu..."
                            className="w-full h-11 bg-black/30 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="md:col-span-4 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Số thứ tự</label>
                          <input
                            type="number"
                            value={newChapter.order}
                            onChange={(e) => setNewChapter(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                            className="w-full h-11 bg-black/30 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Nội dung chương</label>
                        <textarea
                          value={newChapter.content}
                          onChange={(e) => setNewChapter(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                          placeholder="Dán nội dung chương tại đây..."
                          className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-xs font-medium text-neutral-300 outline-none focus:border-primary/50 resize-none custom-scrollbar"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addManualChapter}
                        className={cn(
                          "w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                          editingChapterIdx !== null
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10"
                        )}
                      >
                        {editingChapterIdx !== null ? 'Save Changes' : 'Add Chapter to List'}
                      </Button>
                    </div>

                    {/* Chapters List */}
                    {form.chapters.length > 0 && (
                      <div className="max-h-[500px] overflow-y-auto border border-white/10 rounded-xl bg-black/20 divide-y divide-white/5 custom-scrollbar">
                        {form.chapters.map((ch, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleEditChapter(idx)}
                            className={cn(
                              "flex items-center justify-between p-4 group cursor-pointer transition-all",
                              editingChapterIdx === idx ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors",
                                editingChapterIdx === idx ? "bg-primary text-white" : "bg-white/5 border border-white/10 text-neutral-500"
                              )}>
                                {ch.order}
                              </div>
                              <div>
                                <p className={cn(
                                  "text-xs font-bold transition-colors",
                                  editingChapterIdx === idx ? "text-primary-light" : "text-white"
                                )}>{ch.title}</p>
                                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{ch.content.length.toLocaleString()} characters</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to edit</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeChapter(idx);
                                }}
                                className="p-2 rounded-lg text-neutral-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Stats Info (View only for Edit) */}
                {editingId && (
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-sm">
                    <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-black text-white">Chế Độ Chỉnh Sửa Metadata</p>
                      <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                        Bạn đang cập nhật thông tin chung của truyện. Để quản lý nội dung chi tiết từng chương, vui lòng truy cập
                        <span className="text-primary-light font-bold"> "Quản lý chương" </span>
                        trong danh sách truyện.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Modal Footer - NEW */}
            <div className="px-8 py-5 border-t border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between sticky bottom-0 z-20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (form.title && !confirm('Bạn có chắc chắn muốn hủy?')) return;
                  setIsModalOpen(false);
                }}
                className="h-11 rounded-xl px-6 font-bold text-neutral-500 hover:text-white hover:bg-white/5 transition-all"
              >
                Hủy Bỏ
              </Button>
              <div className="flex flex-col items-end">
                <Button
                  type="submit"
                  form="story-form"
                  disabled={isSubmitting || uploadingCover || uploadingBanner}
                  className="h-11 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.02] active:scale-95 px-10 font-black text-white shadow-xl shadow-primary/20 transition-all border-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Đang Xử Lý...</span>
                    </div>
                  ) : (
                    editingId ? 'Cập Nhật Truyện' : 'Tạo Truyện Ngay'
                  )}
                </Button>
                {isSubmitting && form.chapters.length > 0 && !editingId && (
                  <p className="text-[10px] font-black text-amber-500 mt-2 animate-pulse flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Đang lưu {form.chapters.length} chương...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
}
