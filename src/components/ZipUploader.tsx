import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { createDemoZipBlob } from '../utils/demoZip';

interface ZipUploaderProps {
  onZipSelected: (file: File | Blob, name: string) => void;
  isLoading: boolean;
}

export default function ZipUploader({ onZipSelected, isLoading }: ZipUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      setErrorStatus('Format berkas salah! Harap unggah berkas berekstensi .ZIP');
      return;
    }
    setErrorStatus(null);
    onZipSelected(file, file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleLoadDemoZip = async () => {
    try {
      setErrorStatus(null);
      const demoBlob = await createDemoZipBlob();
      onZipSelected(demoBlob, "kartu_berkas_contoh.zip");
    } catch (err: any) {
      setErrorStatus('Gagal memproses berkas contoh: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4" id="zip-uploader-panel">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">
          Unggah & Jelajahi Berkas <span className="text-amber-500">ZIP</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
          Tarik berkas arsip Anda ke sini untuk membaca isinya secara instan tanpa perlu ekstraksi manual, aman dalam sandbox browser.
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${
          isDragging
            ? 'border-rose-500 bg-rose-50/10'
            : 'border-slate-300 hover:border-amber-500 bg-white shadow-xl hover:shadow-2xl dark:bg-slate-900 dark:border-slate-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelectFile}
        id="uploader-dropzone"
      >
        {/* Subtle decorative glowing balls strictly for premium design */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".zip"
          className="hidden"
          id="zip-file-input"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-14 w-14 animate-spin text-amber-500" />
            <p className="text-md font-semibold animate-pulse">Menghurai arsip berkas zip...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-5 shadow-inner">
              <FileArchive className="h-12 w-12 text-rose-500 animate-bounce" />
            </div>

            <p className="text-lg font-bold font-display text-gray-800 dark:text-gray-200">
              {isDragging ? 'Lepaskan Berkas Sekarang!' : 'Seret & Lepas Berkas ZIP'}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              atau klik untuk mencari berkas dari media perangkat Anda
            </p>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-rose-500 shadow-md hover:shadow-rose-400/20 transition duration-200 mb-6 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                triggerSelectFile();
              }}
              id="select-file-btn"
            >
              Pilih Berkas ZIP
            </button>
          </div>
        )}
      </motion.div>

      {/* Error Alert Card */}
      {errorStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 shadow-sm dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300"
          id="uploader-error-card"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{errorStatus}</span>
        </motion.div>
      )}

      {/* Demo Instant Trigger Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-12 text-center"
      >
        <span className="text-xs text-gray-400 block mb-3 font-semibold uppercase tracking-widest">
          Belum punya Berkas .Zip?
        </span>
        <button
          type="button"
          onClick={handleLoadDemoZip}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm hover:shadow-md transition cursor-pointer"
          id="load-demo-zip-btn"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          Muat Berkas Contoh Zip (.ZIP)
        </button>
      </motion.div>
    </div>
  );
}
