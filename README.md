# IT Care

**IT Care** adalah aplikasi helpdesk internal untuk pengelolaan keluhan IT karyawan. Aplikasi ini telah direfaktor menggunakan arsitektur **PERN Stack** (PostgreSQL, Express API, React, Node.js) dengan desain modern.

## Tech Stack

- **Backend:** Node.js, Express.js REST API
- **Frontend:** React, Vite, React Router DOM, Axios, Lucide React
- **Database:** PostgreSQL / Neon
- **Authentication:** session-cookie (express-session)
- **Styling:** Custom Vanilla CSS (Modern Clean UI)

## Prerequisites

Pastikan sudah terpasang:
- Node.js 18 atau lebih baru
- npm
- Git
- Akun dan database Neon PostgreSQL

## Installation

Clone repository:
```bash
git clone https://github.com/haidarpriatama/IT-care.git
cd IT-care
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```
Isi file `backend/.env`:
```env
PORT=3000
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
SESSION_SECRET=change_this_to_a_random_secret
CLIENT_URL=http://localhost:5173
```
Jalankan migrasi dan seed:
```bash
npm run db:schema
npm run db:seed
```

### Frontend Setup

Buka terminal baru:
```bash
cd frontend
npm install
cp .env.example .env
```
Isi file `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

Jalankan backend (dari folder `backend`):
```bash
npm run dev
```

Jalankan frontend (dari folder `frontend`):
```bash
npm run dev
```
Aplikasi frontend bisa diakses di `http://localhost:5173`.

## Demo Accounts

Gunakan akun berikut untuk login:
| Role | Email | Password |
|---|---|---|
| Admin | admin@itcare.id | password |
| Teknisi | teknisi@itcare.id | password |
| Karyawan | karyawan@itcare.id | password |

## Project Structure

```text
IT-care/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

---
IT Care — Internal IT Helpdesk System
