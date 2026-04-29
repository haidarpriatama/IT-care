# IT Care - Internal IT Helpdesk System

> Sistem helpdesk internal untuk pengaduan keluhan IT dari karyawan, dibangun menggunakan **Node.js, Express.js, PostgreSQL (Neon), EJS, Bootstrap 5**, dan **Custom CSS**.

---

## 🚀 Fitur Utama

| Fitur | Admin | Teknisi | Karyawan |
|---|:---:|:---:|:---:|
| Login & Registrasi | ✅ | ✅ | ✅ |
| Dashboard statistik | ✅ | ✅ | ✅ |
| Buat tiket | ✅ | - | ✅ |
| Lihat semua tiket | ✅ | - | - |
| Lihat tiket sendiri | - | - | ✅ |
| Lihat tiket ditugaskan | - | ✅ | - |
| Edit tiket (semua field) | ✅ | - | - |
| Edit tiket (status) | - | ✅ | - |
| Edit tiket (open only) | - | - | ✅ |
| Tambah catatan | ✅ | ✅ | ✅ |
| Assign teknisi | ✅ | - | - |
| Soft delete & restore | ✅ | - | ✅* |
| Hard delete | ✅ | - | - |
| Kelola user (CRUD) | ✅ | - | - |
| Kelola kategori (CRUD) | ✅ | - | - |
| Laporan JOIN multi-tabel | ✅ | - | - |
| Pencarian & filter | ✅ | ✅ | ✅ |

> *Karyawan hanya bisa soft delete tiket miliknya yang masih berstatus **open**.

---

## 🗂️ Struktur Folder

```
it-care/
├── src/
│   ├── app.js                # Entry point
│   ├── config/
│   │   └── db.js             # Koneksi PostgreSQL (pg)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   ├── reportController.js
│   │   ├── ticketController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js  # ensureAuthenticated
│   │   └── roleMiddleware.js  # authorizeRoles
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── userRoutes.js
│   ├── views/
│   │   ├── auth/             # login.ejs, register.ejs
│   │   ├── dashboard/        # index.ejs
│   │   ├── tickets/          # index, create, edit, detail, trash
│   │   ├── categories/       # index, create, edit
│   │   ├── users/            # index, create, edit
│   │   ├── reports/          # index.ejs
│   │   └── partials/         # sidebar, navbar, flash
│   ├── public/
│   │   ├── css/style.css     # Custom CSS (dark purple sidebar)
│   │   └── js/app.js
│   └── database/
│       ├── schema.sql
│       └── seed.sql
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Instalasi & Setup

### 1. Clone atau masuk ke folder project
```bash
cd it-care
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```
Edit `.env` dan isi:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SESSION_SECRET=random_secret_string
PORT=3000
```

### 4. Jalankan schema di database Neon
Buka **Neon Console → SQL Editor** atau gunakan tool seperti `psql`, lalu jalankan:
```sql
-- Buat semua tabel
\i src/database/schema.sql

-- Isi data contoh (opsional)
\i src/database/seed.sql
```

### 5. Jalankan server
```bash
npm run dev
```
Buka browser: **http://localhost:3000**

---

## 👤 Akun Demo

Setelah menjalankan `seed.sql`, akun berikut tersedia:

| Role | Email | Password |
|---|---|---|
| Admin | admin@itcare.id | password123 |
| Teknisi | teknisi@itcare.id | password123 |
| Karyawan | karyawan@itcare.id | password123 |

---

## 🗄️ Tabel Database

1. **users** — data pengguna (admin, teknisi, karyawan)
2. **categories** — kategori tiket (Hardware, Software, Jaringan, dll.)
3. **tickets** — tiket pengaduan dengan soft delete (`deleted_at`)
4. **ticket_notes** — catatan/diskusi per tiket
5. **status_logs** — riwayat perubahan status tiket
6. **session** — tabel sesi PostgreSQL (connect-pg-simple)

---

## 🔑 Routes

| Method | Path | Deskripsi | Akses |
|---|---|---|---|
| GET | `/login` | Halaman login | Public |
| POST | `/login` | Proses login | Public |
| GET | `/register` | Halaman register | Public |
| POST | `/register` | Proses register | Public |
| GET | `/logout` | Logout | Auth |
| GET | `/dashboard` | Dashboard | Auth |
| GET | `/tickets` | Daftar tiket | Auth |
| GET | `/tickets/create` | Form buat tiket | Admin, Karyawan |
| POST | `/tickets` | Simpan tiket baru | Admin, Karyawan |
| GET | `/tickets/:id` | Detail tiket | Auth |
| GET | `/tickets/:id/edit` | Form edit tiket | Auth |
| PUT | `/tickets/:id` | Update tiket | Auth |
| DELETE | `/tickets/:id` | Soft delete | Auth |
| POST | `/tickets/:id/notes` | Tambah catatan | Auth |
| GET | `/tickets/trash` | Halaman trash | Admin |
| POST | `/tickets/:id/restore` | Restore tiket | Admin |
| DELETE | `/tickets/:id/hard` | Hard delete | Admin |
| GET | `/categories` | Daftar kategori | Auth |
| GET | `/categories/create` | Form tambah | Admin |
| POST | `/categories` | Simpan kategori | Admin |
| GET | `/categories/:id/edit` | Form edit | Admin |
| PUT | `/categories/:id` | Update kategori | Admin |
| DELETE | `/categories/:id` | Hapus kategori | Admin |
| GET | `/users` | Daftar user | Admin |
| GET | `/users/create` | Form tambah user | Admin |
| POST | `/users` | Simpan user | Admin |
| GET | `/users/:id/edit` | Form edit user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Hapus user | Admin |
| GET | `/reports` | Laporan JOIN | Admin |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: PostgreSQL (Neon) via `pg` (raw SQL, no ORM)
- **Session Store**: `connect-pg-simple`
- **Auth**: `express-session` + `bcrypt`
- **Template Engine**: EJS
- **UI**: Bootstrap 5.3 + Bootstrap Icons + Custom CSS
- **Dev**: Nodemon

---

## 📝 Catatan Pengembangan

- Semua query menggunakan **raw SQL** melalui `pg.Pool`, tidak ada ORM
- Halaman `/reports` menggunakan **JOIN lebih dari 2 tabel**: `tickets JOIN users JOIN categories JOIN status_logs`
- Soft delete menggunakan kolom `deleted_at` pada tabel `tickets`
- Session disimpan di PostgreSQL menggunakan `connect-pg-simple`
- Password di-hash menggunakan `bcrypt` dengan salt rounds 10
- Method override (`_method=PUT/DELETE`) untuk form HTML

---

*IT Care © 2025 - Internal IT Helpdesk System*
