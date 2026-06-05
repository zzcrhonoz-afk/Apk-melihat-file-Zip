import React from 'react';
import { 
  Folder, 
  FileCode, 
  FileJson, 
  FileImage, 
  FileText, 
  File, 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Download, 
  ArrowUpDown,
  FileCheck,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ZipItem, SortField, SortOrder } from '../types';
import { formatBytes } from '../utils/zipParser';

interface ZipExplorerProps {
  items: ZipItem[];
  currentPath: string;
  searchQuery: string;
  selectedFile: ZipItem | null;
  onSelectFolder: (path: string) => void;
  onSelectFile: (item: ZipItem) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (field: SortField) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onDownloadItem: (item: ZipItem) => void;
  zipName: string;
  onChangeArchive: () => void;
}

export default function ZipExplorer({
  items,
  currentPath,
  searchQuery,
  selectedFile,
  onSelectFolder,
  onSelectFile,
  onSearchChange,
  onSortChange,
  sortBy,
  sortOrder,
  onDownloadItem,
  zipName,
  onChangeArchive
}: ZipExplorerProps) {

  // Breadcrumb segments helper
  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    
    // Split and filter empty
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [];
    let accumulated = '';
    
    for (const part of parts) {
      accumulated += part + '/';
      breadcrumbs.push({
        path: accumulated,
        name: part
      });
    }
    return breadcrumbs;
  };

  // Filter items based on current structural path or search query
  const getFilteredItems = () => {
    let list = [...items];

    // Filter by text search if query is provided
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q));
    } else {
      // Otherwise, filter items matching the current directory path hierarchy exactly
      list = list.filter(item => item.dir === currentPath);
    }

    // Sort the resulting listing
    list.sort((a, b) => {
      // Put folders always on top first unless sorting by something else
      if (sortBy === 'name') {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
      
      if (sortBy === 'size') {
        return sortOrder === 'asc' ? a.size - b.size : b.size - a.size;
      }
      
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? a.date.getTime() - b.date.getTime() 
          : b.date.getTime() - a.date.getTime();
      }

      if (sortBy === 'type') {
        return sortOrder === 'asc' 
          ? a.type.localeCompare(b.type) 
          : b.type.localeCompare(a.type);
      }

      return 0;
    });

    return list;
  };

  const filteredItems = getFilteredItems();

  const getFileIcon = (item: ZipItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-5 w-5 text-amber-500 fill-amber-400/20" />;
    }
    
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'json':
        return <FileJson className="h-5 w-5 text-indigo-500" />;
      case 'html':
      case 'css':
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
      case 'py':
      case 'go':
      case 'sh':
        return <FileCode className="h-5 w-5 text-blue-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImage className="h-5 w-5 text-emerald-500" />;
      case 'md':
      case 'markdown':
      case 'txt':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-slate-500" />;
    }
  };

  const getFileThemeClass = (item: ZipItem) => {
    const isSelected = selectedFile?.path === item.path;
    if (isSelected) {
      return 'border-rose-400 bg-rose-50/70 shadow-sm dark:bg-rose-950/20 dark:border-rose-800';
    }
    
    if (item.type === 'folder') {
      return 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/10 dark:bg-slate-900 dark:border-slate-800';
    }

    return 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/10 dark:bg-slate-900 dark:border-slate-800';
  };

  const toggleSort = (field: SortField) => {
    onSortChange(field);
  };

  return (
    <div className="flex flex-col h-full" id="zip-explorer-component">
      {/* Search & Header card */}
      <div className="p-4 bg-white/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800" id="explorer-header-section">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-500">
              <FileCheck className="h-4 w-4" />
            </span>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Arsip Aktif</p>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate max-w-xs">{zipName}</h3>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onChangeArchive}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
            id="ganti-arsip-btn"
          >
            Ganti ZIP
          </button>
        </div>

        {/* Search bar inside the explorer */}
        <div className="relative mb-3" id="explorer-search-wrapper">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari dalam berkas zip..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
            id="inline-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Sorting options Bar */}
        <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto pb-1" id="sorting-options-tabs">
          <span className="shrink-0 font-medium text-[10px] uppercase tracking-wider text-gray-400 mr-1">Urutan:</span>
          
          <button
            onClick={() => toggleSort('name')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition cursor-pointer shrink-0 ${
              sortBy === 'name' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Nama <ArrowUpDown className="h-3 w-3" />
          </button>

          <button
            onClick={() => toggleSort('size')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition cursor-pointer shrink-0 ${
              sortBy === 'size' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Ukuran <ArrowUpDown className="h-3 w-3" />
          </button>

          <button
            onClick={() => toggleSort('date')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition cursor-pointer shrink-0 ${
              sortBy === 'date' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tanggal <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs navigation - only when not actively searching */}
      {!searchQuery && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs flex items-center gap-1.5 overflow-x-auto whitespace-nowrap" id="breadcrumb-navigation">
          <button
            onClick={() => onSelectFolder('')}
            className={`font-semibold cursor-pointer ${currentPath === '' ? 'text-rose-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Beranda
          </button>
          
          {getBreadcrumbs().map((bc, idx) => (
            <React.Fragment key={bc.path}>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <button
                onClick={() => onSelectFolder(bc.path)}
                className={`font-semibold truncate max-w-[120px] cursor-pointer ${
                  idx === getBreadcrumbs().length - 1 ? 'text-rose-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {bc.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main listings area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5" id="explorer-items-list-container">
        
        {/* Go back folder button if inside directory and not searching */}
        {!searchQuery && currentPath !== '' && (
          <button
            onClick={() => {
              const parts = currentPath.split('/').filter(Boolean);
              parts.pop();
              const parent = parts.length > 0 ? parts.join('/') + '/' : '';
              onSelectFolder(parent);
            }}
            className="w-full flex items-center gap-3 p-3 border border-dashed border-slate-200 hover:border-rose-400 dark:border-slate-800 dark:hover:border-rose-900 rounded-xl bg-slate-50/50 dark:bg-slate-950/10 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white text-left transition cursor-pointer"
            id="back-one-directory-btn"
          >
            <ArrowLeft className="h-4 w-4 text-rose-500 animate-pulse" />
            <span className="font-semibold">Kembali ke folder sebelumnya (..)</span>
          </button>
        )}

        {/* Empty status */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center" id="explorer-empty-state">
            <Folder className="h-10 w-10 text-slate-300 mb-2 dark:text-slate-700" />
            <p className="text-sm font-semibold text-slate-400">Tidak ada berkas ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">Coba sesuaikan bar pencarian atau filter Anda.</p>
          </div>
        )}

        {/* Items loop */}
        <AnimatePresence initial={false}>
          {filteredItems.map((item) => {
            const isFolder = item.type === 'folder';
            const compRatio = item.size > 0 && item.sizeCompressed 
              ? Math.round(((item.size - item.sizeCompressed) / item.size) * 100) 
              : 0;

            return (
              <motion.div
                key={item.path}
                layoutId={`item-${item.path}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`group border rounded-xl p-3 flex items-center justify-between gap-3 text-left transition duration-150 cursor-pointer ${getFileThemeClass(item)}`}
                onClick={() => {
                  if (isFolder) {
                    onSelectFolder(item.path);
                  } else {
                    onSelectFile(item);
                  }
                }}
                id={`card-item-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* File Type Visual Icon */}
                  <div className={`p-2 rounded-lg shrink-0 transition-all ${
                    isFolder 
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-500' 
                      : 'bg-slate-50 dark:bg-slate-800'
                  }`}>
                    {getFileIcon(item)}
                  </div>

                  {/* Metas */}
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      {isFolder ? (
                        <span>Folder Kategori</span>
                      ) : (
                        <>
                          <span>{formatBytes(item.size)}</span>
                          {compRatio > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-teal-50 text-teal-600 rounded dark:bg-teal-950/40 dark:text-teal-400 text-[10px] font-semibold">
                              <Percent className="h-2 w-2" />
                              {compRatio}% hemat
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card side interactive icons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isFolder ? (
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadItem(item);
                      }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                      title="Unduh berkas secara mandiri"
                      id={`download-inline-${item.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
