import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  HardDrive, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  Code, 
  Info, 
  LineChart, 
  ExternalLink,
  Percent
} from 'lucide-react';
import { motion } from 'motion/react';
import { ZipItem } from '../types';
import { formatBytes, detectFileType } from '../utils/zipParser';

interface FilePreviewerProps {
  item: ZipItem | null;
  content: string | null;
  fileUrl: string | null;
  isLoading: boolean;
  onDownload: (item: ZipItem) => void;
}

export default function FilePreviewer({
  item,
  content,
  fileUrl,
  isLoading,
  onDownload
}: FilePreviewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'meta'>('preview');
  const [copied, setCopied] = useState(false);

  // Default to preview when selection changes
  useEffect(() => {
    setActiveTab('preview');
    setCopied(false);
  }, [item]);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" id="empty-previewer">
        {/* Visual cue: a modern placeholder mockup resembling card stacks */}
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-x-2 -top-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-t-lg" />
          <div className="absolute inset-x-1 -top-0 w-full h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center animate-pulse">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 shadow-md">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>

        <h3 className="text-lg font-bold font-display text-gray-850 dark:text-gray-100">
          Siap Membuka Berkas Kartu
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1.5 leading-relaxed">
          Pilih salah satu berkas di samping untuk membongkar, membaca isi, menyalin kode mentah, atau mengunduhnya secara aman.
        </p>
      </div>
    );
  }

  const fileType = detectFileType(item.name);

  // Copy handler
  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe split for rendering text lines with row numbers
  const renderTextContent = () => {
    if (!content) return <div className="p-4 text-slate-450 italic text-sm">Tidak ada teks atau isi kosong</div>;
    const lines = content.split('\n');
    return (
      <div className="font-mono text-xs overflow-auto h-full bg-[#1e293b] text-slate-200 p-4 rounded-xl shadow-inner select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-slate-800">
                <td className="w-8 select-none text-slate-500 text-right pr-4 align-top border-r border-slate-700/50">
                  {index + 1}
                </td>
                <td className="pl-4 whitespace-pre-wrap align-top break-all">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Simple custom Markdown parse card helper to keep app client-friendly and safe
  const renderMarkdownAlternative = () => {
    if (!content) return null;
    
    // Parse headers, lists, code block blocks simply for rich typography
    const lines = content.split('\n');
    let insideCodeBlock = false;

    return (
      <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-slate-900 rounded-xl max-h-[500px] overflow-y-auto border border-slate-150 dark:border-slate-850 shadow-inner select-text">
        {lines.map((line, idx) => {
          // Code block markers
          if (line.trim().startsWith('```')) {
            insideCodeBlock = !insideCodeBlock;
            return null;
          }

          if (insideCodeBlock) {
            return (
              <pre key={idx} className="bg-slate-100 dark:bg-slate-950 p-2 text-xs rounded font-mono my-1 scroll-x overflow-auto border-l-2 border-rose-500">
                <code>{line}</code>
              </pre>
            );
          }

          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4 mb-2 border-b pb-1">{line.slice(2)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-xl font-extrabold font-display text-slate-850 dark:text-gray-150 mt-3 mb-2">{line.slice(3)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-lg font-bold font-display text-slate-800 dark:text-slate-200 mt-3 mb-1">{line.slice(4)}</h3>;
          }

          // Lists
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <li key={idx} className="text-sm text-slate-650 dark:text-slate-300 ml-4 list-disc my-1">
                {line.trim().substring(2)}
              </li>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(line.trim())) {
            const cleanText = line.trim().replace(/^\d+\.\s/, '');
            return (
              <li key={idx} className="text-sm text-slate-650 dark:text-slate-300 ml-4 list-decimal my-1">
                {cleanText}
              </li>
            );
          }

          // Horizontal Rule
          if (line.trim() === '---') {
            return <hr key={idx} className="my-4 border-slate-200 dark:border-slate-800" />;
          }

          // Simple blank line
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-sm leading-relaxed text-slate-650 dark:text-slate-350 my-1.5 font-sans">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // Render different previews depending on the type
  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-xs font-semibold animate-pulse">Menyiapkan pratinjau kartu berkas...</p>
        </div>
      );
    }

    if (fileType === 'image' && fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[300px]">
          <img
            src={fileUrl}
            alt={item.name}
            className="max-h-[360px] max-w-full rounded-lg object-contain shadow-md hover:scale-102 transition duration-200"
            referrerPolicy="no-referrer"
          />
          <div className="mt-4 flex gap-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 shadow-inner">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Format Gambar</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono text-emerald-500 font-bold">{item.name.split('.').pop()?.toUpperCase()}</span>
          </div>
        </div>
      );
    }

    if (fileType === 'text' && (item.name.endsWith('.md') || item.name.endsWith('.markdown'))) {
      return renderMarkdownAlternative();
    }

    if (fileType === 'text' || fileType === 'code' || fileType === 'json') {
      return renderTextContent();
    }

    // Binary / fallback representation
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 dark:bg-amber-950/30 dark:text-amber-400">
          <Info className="h-8 w-8" />
        </div>
        <h4 className="text-md font-bold text-gray-800 dark:text-gray-200">Berkas Biner / Format Tidak Didukung</h4>
        <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
          Pratinjau visual langsung tidak tersedia untuk format berekstensi <span className="font-mono font-bold text-amber-600">.{item.name.split('.').pop()}</span>. Anda tetap dapat mengunduh salinan berkas asli secara aman.
        </p>
        <button
          onClick={() => onDownload(item)}
          className="mt-5 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Unduh Berkas Ini
        </button>
      </div>
    );
  };

  const compRatio = item.size > 0 && item.sizeCompressed 
    ? Math.round(((item.size - item.sizeCompressed) / item.size) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xl" id="file-previewer-component">
      
      {/* File preview toolbar and name */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        
        {/* Title details */}
        <div className="overflow-hidden">
          <h3 className="text-base font-extrabold font-display text-gray-850 dark:text-gray-100 truncate">
            {item.name}
          </h3>
          <p className="text-[11px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
            <span>{detectFileType(item.name).toUpperCase()}</span>
            <span>•</span>
            <span>{formatBytes(item.size)}</span>
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {content && (
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-slate-800 transition cursor-pointer ${copied ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-white dark:bg-slate-900 text-slate-500'}`}
              title="Salin isi berkas"
              id="copy-file-content-btn"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          )}

          <button
            onClick={() => onDownload(item)}
            className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
            title="Unduh berkas"
            id="download-preview-btn"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs font-bold hidden sm:inline">Unduh</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation - Preview / Detail metadata */}
      <div className="px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('preview')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'preview' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
          id="preview-tab"
        >
          <Eye className="h-3.5 w-3.5" />
          Pratinjau Isi
        </button>

        <button
          onClick={() => setActiveTab('meta')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'meta' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
          id="meta-tab"
        >
          <Info className="h-3.5 w-3.5" />
          Detail Kartu Berkas
        </button>
      </div>

      {/* Main Container body */}
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900" id="previewer-main-body">
        {activeTab === 'preview' ? (
          <div>{renderPreviewContent()}</div>
        ) : (
          /* File METADATA structure rendered beautifully as a high-fidelity CARD stats layout */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
            id="metadata-card-container"
          >
            <div className="relative border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/20 via-white to-pink-50/20 dark:from-indigo-950/20 dark:via-slate-900 to-pink-950/10 p-6 rounded-2xl overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-rose-500" />
                Matriks Kompresi Berkas
              </h4>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-inner">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Ukuran Normal</span>
                  <span className="text-lg font-extrabold font-display text-gray-850 dark:text-white inline-flex items-center gap-1.5 mt-1">
                    <HardDrive className="h-4 w-4 text-emerald-500" />
                    {formatBytes(item.size)}
                  </span>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-inner">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Ukuran Terkompresi</span>
                  <span className="text-lg font-extrabold font-display text-gray-855 dark:text-white inline-flex items-center gap-1.5 mt-1">
                    <Percent className="h-4 w-4 text-indigo-500" />
                    {formatBytes(item.sizeCompressed || 0)}
                  </span>
                </div>
              </div>

              {/* Compression Ratio Banner */}
              {compRatio > 0 && (
                <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between dark:bg-teal-950/20 dark:border-teal-900/50">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-teal-500 text-white rounded-md">
                      <LineChart className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-bold text-teal-805 dark:text-teal-300">Efisiensi Penyimpanan</span>
                  </div>
                  <span className="text-xs font-extrabold bg-teal-500 text-white px-2 py-0.5 rounded-lg">
                    {compRatio}% Lebih Hemat
                  </span>
                </div>
              )}
            </div>

            {/* Other detail records */}
            <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-150 dark:divide-slate-850">
              <div className="p-4 flex items-center justify-between gap-4 text-xs font-semibold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Format Ekstensi
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-100 uppercase font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  .{item.name.split('.').pop()}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between gap-4 text-xs font-semibold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Waktu Pembuatan / Modifikasi
                </span>
                <span className="text-slate-800 dark:text-slate-150">
                  {item.date.toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="p-4 text-xs font-semibold">
                <span className="text-slate-400 block mb-2">Lokasi Berkas dalam Arsip</span>
                <code className="text-[10px] block p-2.5 bg-slate-50 dark:bg-slate-950/50 text-indigo-500 rounded-lg break-all font-mono select-all">
                  {item.path}
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}
