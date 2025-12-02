// hashPasswords.js
// Skrip ini hanya perlu dijalankan sekali untuk meng-update password di database

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_kopichain'
};

const saltRounds = 10; // Standar keamanan untuk bcrypt

async function hashExistingPasswords() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Terhubung ke database untuk hashing...");

        // 1. Ambil semua pengguna dari database
        const [users] = await connection.execute('SELECT id, username, password FROM users');

        if (users.length === 0) {
            console.log("Tidak ada pengguna untuk di-hash.");
            return;
        }

        console.log(`Menemukan ${users.length} pengguna. Memulai proses hashing...`);

        // 2. Loop melalui setiap pengguna dan update password-nya
        for (const user of users) {
            // Cek apakah password sepertinya sudah di-hash atau belum
            // Hash bcrypt biasanya diawali dengan '$2a$', '$2b$', atau '$2y$'
            if (user.password.startsWith('$2')) {
                console.log(`-> Password untuk ${user.username} sepertinya sudah di-hash. Dilewati.`);
                continue;
            }

            // Hash password yang masih berupa teks biasa
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            
            // Update password di database dengan versi hash
            await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            console.log(`-> Password untuk ${user.username} berhasil di-hash dan di-update.`);
        }

        console.log("\nProses hashing selesai!");

    } catch (error) {
        console.error("Terjadi galat saat hashing:", error);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Koneksi database ditutup.");
        }
    }
}

hashExistingPasswords();