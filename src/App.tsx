import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  FolderOpen, 
  FileCheck, 
  Layers, 
  RefreshCw, 
  Percent, 
  HardDrive, 
  Grid, 
  Sparkles, 
  ArrowLeft, 
  Info,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CardLogo from './components/CardLogo';
import ZipUploader from './components/ZipUploader';
import ZipExplorer from './components/ZipExplorer';
import FilePreviewer from './components/FilePreviewer';
import { ZipItem, ExplorerState, SortField, SortOrder } from './types';
import { buildZipStructure, triggerDownload, formatBytes } from './utils/zipParser';

export default function App() {
  const [file, setFile] = useState<File | Blob | null>(null);
  const [zipName, setZipName] = useState<string>('');
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [zipItems, setZipItems] = useState<ZipItem[]>([]);
  
  // App states
  const [currentPath, setCurrentPath] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<ZipItem | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // Loading flags
  const [isZippingLoad, setIsZippingLoad] = useState<boolean>(false);
  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Mobile layout state
  const [mobileView, setMobileView] = useState<'explorer' | 'preview'>('explorer');

  // Revoke previous URLs to avoid browser memory leaks
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Read raw files from zip container on demand
  const handleSelectFile = async (item: ZipItem) => {
    if (!zipInstance) return;
    
    setSelectedFile(item);
    setIsContentLoading(true);
    setMobileView('preview'); // Auto focus on preview pane for mobile devices

    // Revoke old URL if existing
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setFileContent(null);

    try {
      const ext = item.name.split('.').pop()?.toLowerCase() || '';
      const zipFileEntry = zipInstance.file(item.path);

      if (!zipFileEntry) {
        throw new Error("Berkas tidak ditemukan dalam arsip.");
      }

      // Check if image format
      const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];
      if (imageExts.includes(ext)) {
        const imageBlob = await zipFileEntry.async('blob');
        const url = URL.createObjectURL(imageBlob);
        setFileUrl(url);
      } else {
        // Read text/code content
        const rawText = await zipFileEntry.async('text');
        setFileContent(rawText);
      }
    } catch (err) {
      console.error("Gagal memuat isi berkas:", err);
      setFileContent("Error: Gagal memuat muatan berkas ini.");
    } finally {
      setIsContentLoading(false);
    }
  };

  // Main Zip loading handoff
  const handleZipSelected = async (selectedFile: File | Blob, name: string) => {
    setIsZippingLoad(true);
    setFile(selectedFile);
    setZipName(name);
    setCurrentPath('');
    setSearchQuery('');
    setSelectedFile(null);
    setFileContent(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }

    try {
      const jszip = new JSZip();
      const instance = await jszip.loadAsync(selectedFile);
      setZipInstance(instance);

      const items = buildZipStructure(instance);
      setZipItems(items);
    } catch (err: any) {
      alert("Kesalahan membaca berkas ZIP: " + err.message);
      setFile(null);
      setZipName('');
    } finally {
      setIsZippingLoad(false);
    }
  };

  // Downloading a single item extracted on-the-fly
  const handleDownloadItem = async (item: ZipItem) => {
    if (!zipInstance) return;
    try {
      const zipFileEntry = zipInstance.file(item.path);
      if (zipFileEntry) {
        const blob = await zipFileEntry.async('blob');
        triggerDownload(item.name, blob);
      }
    } catch (err: any) {
      alert("Gagal mengunduh berkas: " + err.message);
    }
  };

  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleResetArchive = () => {
    setFile(null);
    setZipName('');
    setZipInstance(null);
    setZipItems([]);
    setSelectedFile(null);
    setFileContent(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  // Archive statistics calculator
  const totalFiles = zipItems.filter(i => i.type === 'file').length;
  const totalFolders = zipItems.filter(i => i.type === 'folder').length;
  const totalSize = zipItems.reduce((acc, i) => acc + (i.size || 0), 0);
  const totalCompressedSize = zipItems.reduce((acc, i) => acc + (i.sizeCompressed || 0), 0);
  const averageCompRatio = totalSize > 0 
    ? Math.round(((totalSize - totalCompressedSize) / totalSize) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300" id="main-applet-root">
      
      {/* Visual background gradient accents to give top-tier design presence */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#e0f2fe]/40 via-transparent to-transparent dark:from-[#1e1b4b]/20 pointer-events-none" />

      {/* Modern, clean Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3.5 px-6 shrink-0 flex items-center justify-between" id="app-navigation-header">
        <div className="flex items-center gap-2">
          <CardLogo size="md" />
        </div>

        {/* Action icons or indicator strictly human-friendly */}
        <div className="flex items-center gap-3">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <Laptop className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative" id="workspace-wrapper">
        <AnimatePresence mode="wait">
          {!file ? (
            /* Upload layout screen when no files are set */
            <motion.div
              key="uploader-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <ZipUploader onZipSelected={handleZipSelected} isLoading={isZippingLoad} />
            </motion.div>
          ) : (
            /* Explorer layout screen with double/triple grid cards */
            <motion.div
              key="explorer-stage"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 max-w-7xl w-full mx-auto"
              id="workspace-explorer-view"
            >
              {/* Quick Zip Overall Stats Card Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5" id="zip-overall-stats">
                {/* Stat 1 */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-500">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Berkas</span>
                    <span className="text-xl font-extrabold font-display text-slate-800 dark:text-white leading-tight">
                      {totalFiles}
                    </span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-500">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Folder</span>
                    <span className="text-xl font-extrabold font-display text-slate-800 dark:text-white leading-tight">
                      {totalFolders}
                    </span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Ukuran Total</span>
                    <span className="text-xl font-extrabold font-display text-slate-800 dark:text-white leading-tight">
                      {formatBytes(totalSize)}
                    </span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                  <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-teal-500">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Metrik Rasio</span>
                    <span className="text-xl font-extrabold font-display text-slate-800 dark:text-white leading-tight">
                      {averageCompRatio}% hemat
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile View Toggle Switch */}
              <div className="md:hidden flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-250 dark:border-slate-800 mb-4 shadow" id="mobile-navigation-tabs">
                <button
                  onClick={() => setMobileView('explorer')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mobileView === 'explorer' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow' : 'text-slate-500'}`}
                >
                  Daftar Berkas ({zipItems.length})
                </button>
                <button
                  onClick={() => setMobileView('preview')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mobileView === 'preview' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow' : 'text-slate-500'}`}
                >
                  Pratinjau ({selectedFile ? selectedFile.name : 'Kosong'})
                </button>
              </div>

              {/* Responsive main split screen panel layout */}
              <div className="flex-1 flex gap-5 overflow-hidden min-h-0" id="main-panes-layout">
                {/* Left Drawer / Sidebar list */}
                <div className={`w-full md:w-[360px] lg:w-[400px] bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-2xl overflow-hidden shadow-lg flex flex-col shrink-0 ${mobileView === 'explorer' ? 'block' : 'hidden md:flex'}`}>
                  <ZipExplorer
                    items={zipItems}
                    currentPath={currentPath}
                    searchQuery={searchQuery}
                    selectedFile={selectedFile}
                    onSelectFolder={setCurrentPath}
                    onSelectFile={handleSelectFile}
                    onSearchChange={setSearchQuery}
                    onSortChange={handleSortChange}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onDownloadItem={handleDownloadItem}
                    zipName={zipName}
                    onChangeArchive={handleResetArchive}
                  />
                </div>

                {/* Right Content reader panel */}
                <div className={`flex-1 h-full overflow-hidden ${mobileView === 'preview' ? 'block' : 'hidden md:block'}`}>
                  {/* On Mobile preview, add a handy back button */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setMobileView('explorer')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 mb-3 cursor-pointer"
                      id="mobile-back-to-explorer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 text-rose-500" />
                      Kembali ke Jelajah Berkas
                    </button>
                  </div>

                  <FilePreviewer
                    item={selectedFile}
                    content={fileContent}
                    fileUrl={fileUrl}
                    isLoading={isContentLoading}
                    onDownload={handleDownloadItem}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-xs text-gray-400 font-semibold shrink-0 z-10" id="app-footer-copyright">
        <p>© {new Date().getFullYear()} <span className="text-gray-700 dark:text-gray-300 font-extrabold uppercase tracking-wider">eckomaro</span>. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>
    </div>
  );
}
