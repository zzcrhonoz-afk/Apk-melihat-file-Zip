import JSZip from 'jszip';

export async function createDemoZipBlob(): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add README in Markdown
  zip.file("README_Mulai_Disini.md", `# 🗃️ Selamat Datang di Zip Card Explorer!

Aplikasi penjelajah berkas **ZIP** interaktif berpenampilan modern, ditenagai oleh antarmuka kartu digital yang elegan dan responsif.

### 🌟 Fitur Utama Aplikasi
1. 📂 **Struktur Pohon Berkas**: Telusuri folder bersarang secara intuitif.
2. 🔍 **Pencarian Instan**: Temukan berkas dalam sekejap menggunakan filter teks.
3. 📑 **Pratinjau Interaktif**: Baca berkas Teks, Markdown, JSON, HTML, CSS, JavaScript, bahkan berkas Gambar secara langsung tanpa ekstrak manual!
4. 💳 **Detail Kartu Berkas**: Lihat ukuran berkas asli, ukuran kompresi, tanggal pembuatan, dan metrik rasio kompresi.
5. 📥 **Unduh Mandiri**: Unduh satu per satu berkas pilihan kapan saja.

---

### 💡 Cara Menggunakan Berkas Anda Sendiri
- Siapkan berkas **.zip** pada komputer Anda.
- **Tarik & Lepaskan (Drag & Drop)** berkas tersebut ke area unggah di atas, atau klik tombol untuk memilih berkas dari komputer.
- Selesai! Aplikasi akan memuat struktur di panel samping, dan Anda siap menjelajahinya secara instan!

*Dikembangkan menggunakan React, Tailwind CSS, JSZip, dan Motion untuk transisi visual yang mulus.*
`);

  // 2. Add subfolder config with JSON
  zip.file("config/app_settings.json", JSON.stringify({
    "appName": "Zip Card Explorer",
    "version": "1.0.4",
    "engine": "JSZip Browser Client",
    "features": [
      "Zip Parsing",
      "Dynamic File Type Preview",
      "Card UI Layout",
      "Instant Text Copying",
      "Responsive Sidebar System"
    ],
    "author": {
      "role": "AI Coding Agent",
      "platform": "Google AI Studio"
    },
    "requirements": {
      "react": "v19+",
      "tailwind": "v4+"
    },
    "active": true
  }, null, 2));

  // 3. Add src/index.html
  zip.file("src/index.html", `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pratinjau HTML Kreatif</title>
  <style>
    body {
      background: linear-gradient(to right, #e0f2fe, #f0fdf4);
      font-family: 'Segoe UI', system-ui, sans-serif;
      text-align: center;
      padding: 40px;
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      display: inline-block;
      max-width: 400px;
    }
    h1 { color: #f43f5e; margin-bottom: 8px; }
    p { color: #475569; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🎉 Berhasil Membaca HTML!</h1>
    <p>Ini adalah dokumen HTML nyata yang diekstrak langsung dari berkas ZIP Anda di browser!</p>
  </div>
</body>
</html>
`);

  // 4. Add src/style.css
  zip.file("src/style.css", `/* Gaya Desain Kartu Berkas */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #ec4899;
}

.file-item-card {
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  background-color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.15);
}
`);

  // 5. Add custom source code JavaScript file
  zip.file("src/utils/math_helper.js", `/**
 * Utilitas Matematika Sederhana untuk Perhitungan Berkas
 */

export function hitungRasioKompresi(asli, kompresi) {
  if (!asli || asli <= 0) return 0;
  const rasio = ((asli - kompresi) / asli) * 100;
  return Math.max(0, parseFloat(rasio.toFixed(1)));
}

export function formatUkuranBerkas(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
`);

  // 6. Add assets/informasi_penting.txt
  zip.file("assets/kontak_tim.txt", `=== NOTA DUKUNGAN PENGGUNA ===

Untuk bantuan, saran pengembangan, dan konsultasi lainnya mengenai modul ZIP ini, silakan hubungi tim kami via surel ke:
- admin@zipcardexplorer.io
- support@googleaistudio.dev

Jam operasional tanggapan:
Senin - Jumat | 09.00 - 18.00 WIB

Terima kasih atas dedikasi dan kepercayaan Anda memakai Zip Card Explorer kami!
`);

  // Generate ZIP file as blob
  return await zip.generateAsync({ type: "blob" });
}
