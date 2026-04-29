-- ============================================================
-- IT Care - Seed Data
-- Password for all users: "password123" (bcrypt hashed)
-- ============================================================

-- Users
INSERT INTO users (name, email, password_hash, role, department, phone) VALUES
('Admin IT', 'admin@itcare.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'IT Department', '081234567890'),
('Budi Teknisi', 'teknisi@itcare.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teknisi', 'IT Support', '081234567891'),
('Siti Karyawan', 'karyawan@itcare.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'karyawan', 'Finance', '081234567892'),
('Andi Teknisi', 'andi@itcare.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teknisi', 'IT Support', '081234567893'),
('Dewi Karyawan', 'dewi@itcare.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'karyawan', 'HR', '081234567894')
ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO categories (name, description) VALUES
('Hardware', 'Masalah terkait perangkat keras seperti komputer, printer, dll.'),
('Software', 'Masalah terkait aplikasi dan sistem operasi'),
('Jaringan', 'Masalah koneksi internet dan jaringan lokal'),
('Email & Akun', 'Masalah email kantor dan akun pengguna'),
('CCTV & Keamanan', 'Masalah kamera pengawas dan sistem keamanan'),
('Lainnya', 'Masalah IT lainnya yang tidak termasuk kategori di atas')
ON CONFLICT (name) DO NOTHING;

-- Tickets
INSERT INTO tickets (user_id, category_id, technician_id, title, description, location, priority, status) VALUES
(3, 1, 2, 'Komputer tidak bisa menyala', 'Komputer di meja saya tidak bisa dinyalakan sejak tadi pagi. Sudah dicoba tekan tombol power tapi tidak ada respons sama sekali.', 'Ruang Finance Lt. 2', 'high', 'in_progress'),
(3, 3, 2, 'Internet lambat', 'Koneksi internet sangat lambat, tidak bisa akses aplikasi ERP.', 'Ruang Finance Lt. 2', 'medium', 'open'),
(5, 2, NULL, 'Aplikasi HRIS error', 'Aplikasi HRIS menampilkan error 500 saat login.', 'Ruang HR Lt. 1', 'high', 'open'),
(5, 4, 4, 'Reset password email', 'Lupa password email kantor dan tidak bisa melakukan reset sendiri.', 'Ruang HR Lt. 1', 'low', 'resolved'),
(3, 1, 2, 'Printer tidak bisa print', 'Printer di ruang finance tidak bisa mencetak dokumen.', 'Ruang Finance Lt. 2', 'medium', 'resolved');

-- Ticket Notes
INSERT INTO ticket_notes (ticket_id, user_id, note) VALUES
(1, 2, 'Sudah dicek, power supply bermasalah. Sedang menunggu penggantian spare part.'),
(1, 3, 'Mohon dipercepat, banyak pekerjaan yang tertunda.'),
(4, 4, 'Password sudah direset. Silakan cek email untuk password sementara.'),
(5, 2, 'Printer sudah diperbaiki, driver diperbarui dan cartridge diganti.');

-- Status Logs
INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES
(1, 1, 'open', 'in_progress'),
(4, 4, 'open', 'in_progress'),
(4, 4, 'in_progress', 'resolved'),
(5, 2, 'open', 'in_progress'),
(5, 2, 'in_progress', 'resolved');
