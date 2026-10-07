# Project Memory & Task Manager

Aplikasi web modern gabungan **Todo List**, **Project Management**, dan **Knowledge Base pribadi** yang terintegrasi penuh dengan Supabase, Next.js (App Router), TypeScript, Tailwind CSS, dan dnd-kit.

---

## 🌟 Fitur Utama

1. **Dashboard Command Center**
   - Ringkasan Metrik: Total task, task selesai, task belum selesai, total project.
   - Progress bar dinamis rata-rata semua project.
   - Kalender tugas yang jatuh tempo hari ini.
   - Status sinkronisasi memori (Supabase / Offline LocalStorage fallback).

2. **Project Management Hub (`/projects`)**
   - Manajemen multi-project (Trading AI, Thesis, Data Science Learning, DNI Analytics, English Learning).
   - Penanda warna project, status (Planning, Active, Pause, Completed), deadline, dan tag.
   - Perhitungan otomatis progress (%) dari rasio task yang selesai.

3. **Todo List Kanban Board (`/tasks`)**
   - Drag-and-drop antar 5 kolom status:
     1. Backlog
     2. To Do
     3. In Progress
     4. Review
     5. Done
   - Detail task komprehensif: Checklist sub-tugas, level prioritas (Low, Medium, High), tanggal mulai, deadline, reminder, attach file/screenshot, prompt AI, dan catatan takeaways.
   - Efek konfeti visual saat menyelesaikan task atau seluruh checklist.

4. **Kalender & Timeline (`/calendar`)**
   - Tampilan **Daily**, **Weekly**, dan **Monthly**.
   - Navigasi tanggal, deadline task, reminder, dan warna badge project.

5. **AI Prompt Library (`/prompts`)**
   - Penyimpanan prompt AI, respons/output kode AI, rating kualitas (1-5 bintang), tag, dan project terkait.
   - Filter berdasarkan model: **ChatGPT**, **Claude**, **Gemini**, **DeepSeek**, **OpenCode**.
   - Tombol satu-klik untuk copy prompt dan hasil AI.

6. **Screenshot Knowledge Base (`/screenshots`)**
   - Galeri visual untuk chart trading, hasil backtest, arsitektur kode, dan diagram.
   - Lightbox modal preview gambar resolusi penuh.

7. **Learning Journal (`/journal`)**
   - Jurnal refleksi pembelajaran harian dengan 5 pilar terstruktur:
     - *Apa yang dipelajari*
     - *Insight & prinsip utama*
     - *Kesalahan (Mistakes)*
     - *Solusi (Solutions)*
     - *Next step*

8. **Smart Universal Search (`Header`) & API Endpoint (`/api/search`)**
   - Pencarian instan melintasi 5 entitas sekaligus: Task, Prompt, Screenshot, Learning Note, dan Project.

9. **Desain UI Modern**
   - Minimalis & elegan ala **Notion + Trello + ClickUp**.
   - Dukungan **Dark Mode & Light Mode** dengan tombol toggle instan.
   - Desain kartu responsif untuk desktop dan mobile.

---

## 🚀 Struktur Direktori

```
d:/notes and task management/
├── supabase-schema.sql         # Skema database PostgreSQL lengkap (RLS + Triggers + Storage)
├── .env.example                # Format konfigurasi variabel lingkungan
├── .env.local                  # Konfigurasi Supabase lokal
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout Next.js
│   │   ├── globals.css         # Styling global Tailwind
│   │   ├── page.tsx            # Halaman Dashboard
│   │   ├── projects/page.tsx   # Project Hub
│   │   ├── tasks/page.tsx      # Kanban Board (Drag-and-Drop)
│   │   ├── calendar/page.tsx   # Kalender Daily, Weekly, Monthly
│   │   ├── prompts/page.tsx    # AI Prompt Library
│   │   ├── screenshots/page.tsx# Galeri Screenshot
│   │   ├── journal/page.tsx    # Learning Journal
│   │   └── api/
│   │       └── search/route.ts # API pencarian pintar
│   ├── components/
│   │   ├── AppLayout.tsx       # Layout wrapper
│   │   ├── Sidebar.tsx         # Navigasi & filter project
│   │   ├── Header.tsx          # Smart search bar & modal
│   │   ├── KanbanColumn.tsx    # Kolom dnd-kit
│   │   └── TaskCard.tsx        # Card task dengan checklist & badge
│   ├── context/
│   │   └── AppContext.tsx      # State management & Supabase sync
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client initializer
│   │   └── mockData.ts         # Data awal yang kaya untuk offline usage
│   └── types/
│       └── index.ts            # Type definitions TypeScript
```

---

## 🛠️ Langkah Instalasi & Menjalankan

### 1. Kloning / Buka Direktori
```bash
cd "d:\notes and task management"
```

### 2. Instalasi Dependensi (Sudah selesai disiapkan)
```bash
npm install
```

### 3. Setup Database Supabase
1. Buka [Supabase Dashboard](https://supabase.com).
2. Buat project baru.
3. Buka menu **SQL Editor**, buka file `supabase-schema.sql` di repository ini, lalu jalankan query-nya. File ini sudah mencakup:
   - Tabel `projects`, `tasks`, `prompts`, `screenshots`, `learning_notes`.
   - **PostgreSQL Trigger** `update_project_progress()` untuk menghitung progress project secara otomatis saat status task berubah.
   - **Row Level Security (RLS)** untuk user autentikasi.
   - Storage bucket `project-files` untuk upload screenshot dan file lampiran.
4. Salin URL dan Anon Key project dari **Settings > API** ke file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Menjalankan Aplikasi di Development Mode
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### 5. Build Versi Production
```bash
npm run build
npm run start
```
Aplikasi sudah terverifikasi **100% build pass** tanpa error!
