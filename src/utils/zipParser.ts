import JSZip from 'jszip';
import { ZipItem } from '../types';

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

export function detectFileType(filename: string): 'text' | 'image' | 'code' | 'json' | 'pdf' | 'binary' {
  const ext = getFileExtension(filename);
  
  const textExts = ['txt', 'csv', 'log', 'ini', 'cfg', 'md', 'markdown'];
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
  const codeExts = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'sh', 'php', 'rb', 'rs', 'swift', 'kt', 'sql', 'yaml', 'yml', 'xml'];
  const jsonExts = ['json'];
  const pdfExts = ['pdf'];

  if (textExts.includes(ext)) return 'text';
  if (imageExts.includes(ext)) return 'image';
  if (codeExts.includes(ext)) return 'code';
  if (jsonExts.includes(ext)) return 'json';
  if (pdfExts.includes(ext)) return 'pdf';
  return 'binary';
}

/**
 * Parses JSZip data and populates structural ZipItem list.
 * Includes explicit folder additions for implicit folder hierarchies in file paths.
 */
export function buildZipStructure(jszip: JSZip): ZipItem[] {
  const itemsMap = new Map<string, ZipItem>();

  jszip.forEach((relativePath, entry) => {
    // Standardize path: remove trailing slash for comparison
    const cleanPath = relativePath.endsWith('/') ? relativePath.slice(0, -1) : relativePath;
    if (!cleanPath) return;

    const parts = cleanPath.split('/');
    const name = parts[parts.length - 1];
    
    // Calculate folder and depth
    const dirParts = parts.slice(0, -1);
    const dir = dirParts.length > 0 ? dirParts.join('/') + '/' : '';
    const depth = dirParts.length;

    // Check if it's explicitly marked as folder or ends with trailing slash
    const isFolder = entry.dir || relativePath.endsWith('/');

    // Add immediate node
    itemsMap.set(cleanPath, {
      path: cleanPath + (isFolder ? '/' : ''),
      name,
      type: isFolder ? 'folder' : 'file',
      size: (entry as any)._data?.uncompressedSize || 0,
      sizeCompressed: (entry as any)._data?.compressedSize || 0,
      date: entry.date,
      dir,
      depth,
    });

    // Backfill any implicit missing parent directories in the zip structure
    let currentDirAccumulator = '';
    for (let i = 0; i < dirParts.length; i++) {
      const part = dirParts[i];
      const parentPath = currentDirAccumulator ? `${currentDirAccumulator}/${part}` : part;
      
      const parentDirParts = dirParts.slice(0, i);
      const parentDir = parentDirParts.length > 0 ? parentDirParts.join('/') + '/' : '';

      if (!itemsMap.has(parentPath)) {
        itemsMap.set(parentPath, {
          path: parentPath + '/',
          name: part,
          type: 'folder',
          size: 0,
          sizeCompressed: 0,
          date: entry.date,
          dir: parentDir,
          depth: i,
        });
      }
      currentDirAccumulator = parentPath;
    }
  });

  return Array.from(itemsMap.values());
}

/**
 * Formats file sizes elegantly
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Download a blob file to the user's local disk
 */
export function triggerDownload(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
