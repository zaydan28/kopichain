require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const qrcode = require('qrcode'); // Pastikan Anda sudah menjalankan 'npm install qrcode'

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE SEMENTARA (CACHE) ---
// Ini akan menyimpan data yang berhasil dikirim ke blockchain.
// Catatan: Data ini akan hilang jika server di-restart. Untuk produksi nyata,
// data ini akan disimpan di database seperti MongoDB atau PostgreSQL.
const dataCache = {};

// --- KONEKSI KE DATABASE MYSQL ---
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = mysql.createPool({
  host: 'localhost',      // Alamat server database Anda (biasanya 'localhost' untuk XAMPP)
  user: 'root',           // Username default untuk XAMPP
  password: '',           // Password default untuk XAMPP biasanya kosong
  database: 'db_kopichain'  // Nama database yang sudah Anda buat
}).promise();

console.log("Terhubung ke database MySQL...");

// --- KONFIGURASI KONEKSI BLOCKCHAIN ---
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_idLot",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_namaPetani",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_lokasiPanen",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_tanggalPanen",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_metodeProses",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_beratPanen",
				"type": "uint256"
			}
		],
		"name": "buatLotKopiBaru",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "idLot",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "namaPetani",
				"type": "string"
			}
		],
		"name": "LotDibuat",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "idLot",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "namaDistributor",
				"type": "string"
			}
		],
		"name": "StatusDiupdate",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_idLot",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_namaDistributor",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_tanggalDiterima",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_tujuanPengiriman",
				"type": "string"
			}
		],
		"name": "updateStatusDistribusi",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "daftarLot",
		"outputs": [
			{
				"internalType": "string",
				"name": "idLot",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "namaPetani",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "lokasiPanen",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "tanggalPanen",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "metodeProses",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "beratPanen",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "namaDistributor",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "tanggalDiterima",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "tujuanPengiriman",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isDistribusiUpdated",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_idLot",
				"type": "string"
			}
		],
		"name": "getRiwayatKopi",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "idLot",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "namaPetani",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "lokasiPanen",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "tanggalPanen",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "metodeProses",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "beratPanen",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "namaDistributor",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "tanggalDiterima",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "tujuanPengiriman",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isDistribusiUpdated",
						"type": "bool"
					}
				],
				"internalType": "struct CoffeeTrace.LotKopi",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getSemuaIdLot",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "semuaIdLot",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; 
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
const coffeeTraceContract = new ethers.Contract(contractAddress, contractABI, wallet);

console.log("Terhubung ke contract di alamat:", contractAddress);

// --- API ENDPOINTS ---


// Endpoint BARU untuk login pengguna
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Cari pengguna berdasarkan username
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    // Jika pengguna tidak ditemukan
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Username tidak ditemukan." });
    }

    const user = rows[0];

    // 2. Bandingkan password yang diinput dengan password di database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // Jika password tidak cocok
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "Password salah." });
    }

    // 3. Jika password cocok, buat JSON Web Token (JWT)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }); // Token berlaku 8 jam

    res.status(200).json({
      success: true,
      message: "Login berhasil!",
      token: token
    });

  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ success: false, message: "Terjadi galat internal." });
  }
});


// Middleware BARU untuk memverifikasi token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak tersedia." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa." });
    }
    req.user = user; // Simpan data pengguna (payload) ke object request
    next(); // Lanjutkan ke endpoint tujuan
  });
};


// Endpoint untuk membuat lot baru oleh petani (MODIFIED FOR MYSQL)
app.post('/api/buat-lot', authenticateToken, async (req, res) => {
  // 1. Ambil data dari request body
  const { idLot, namaPetani, lokasiPanen, tanggalPanen, metodeProses, beratPanen } = req.body;
  
  try {
    // 2. Kirim transaksi ke Blockchain (bagian ini tetap sama)
    const tanggalPanenTimestamp = Math.floor(new Date(tanggalPanen).getTime() / 1000);
    console.log(`Mencoba membuat lot baru dengan ID: ${idLot} di Blockchain...`);
    const tx = await coffeeTraceContract.buatLotKopiBaru(idLot, namaPetani, lokasiPanen, tanggalPanenTimestamp, metodeProses, beratPanen);
    await tx.wait();
    console.log(`Transaksi Blockchain sukses! Hash: ${tx.hash}`);

    // 3. Simpan data ke Database MySQL (INI BAGIAN BARUNYA)
    console.log(`Menyimpan data lot ${idLot} ke database MySQL...`);
    const query = `
		INSERT INTO harvest_lots 
		(lot_id, farmer_name, harvest_location, harvest_date, process_method, harvest_weight, tx_hash_harvest) 
		VALUES (?, ?, ?, ?, ?, ?, ?)
		`;
	const values = [idLot, namaPetani, lokasiPanen, tanggalPanen, metodeProses, beratPanen, tx.hash];

	await db.query(query, values);
    console.log("Data berhasil disimpan ke MySQL.");

    // 4. Kirim response sukses ke frontend
    res.status(201).json({ success: true, message: "Lot kopi berhasil dibuat dan dicatat!", txHash: tx.hash });

  } catch (error) {
    console.error("Error saat membuat lot:", error);
    res.status(500).json({ success: false, message: "Gagal membuat lot kopi." });
  }
});

// Endpoint untuk update data oleh distributor
// Endpoint untuk update data oleh distributor (MODIFIED FOR MYSQL)
app.post('/api/update-distribusi', authenticateToken, async (req, res) => {
  // 1. Ambil data dari request body
  const { idLot, namaDistributor, tanggalDiterima, tujuanPengiriman } = req.body;
  
  try {
    // 2. Validasi: Pastikan lot sudah ada di database harvest_lots
    const [rows] = await db.query('SELECT * FROM harvest_lots WHERE lot_id = ?', [idLot]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "ID Lot tidak ditemukan. Pastikan ID dibuat oleh petani terlebih dahulu."});
    }

    // 3. Kirim transaksi ke Blockchain (bagian ini tetap sama)
    const tanggalDiterimaTimestamp = Math.floor(new Date(tanggalDiterima).getTime() / 1000);
    console.log(`Mencoba update distribusi untuk ID: ${idLot} di Blockchain...`);
    const tx = await coffeeTraceContract.updateStatusDistribusi(idLot, namaDistributor, tanggalDiterimaTimestamp, tujuanPengiriman);
    await tx.wait();
    console.log(`Update Blockchain sukses! Hash: ${tx.hash}`);

    // 4. Simpan data ke Database MySQL (INI BAGIAN BARUNYA)
    console.log(`Menyimpan data distribusi ${idLot} ke database MySQL...`);
    const query = `
		INSERT INTO distribution_records
		(lot_id, distributor_name, date_received, shipping_destination, tx_hash_distribution)
		VALUES (?, ?, ?, ?, ?)
		`;
	const values = [idLot, namaDistributor, tanggalDiterima, tujuanPengiriman, tx.hash]; // Tambahkan tx.hash

	await db.query(query, values);
    console.log("Data distribusi berhasil disimpan ke MySQL.");

    // 5. Buat QR Code (bagian ini tetap sama)
    const frontendURL = `http://127.0.0.1:5500/frontend/index.html?id=${idLot}`;
    const qrCodeDataUrl = await qrcode.toDataURL(frontendURL);

    // 6. Kirim response sukses ke frontend
    res.status(200).json({ 
      success: true, 
      message: "Status distribusi berhasil diupdate!", 
      txHash: tx.hash,
      qrCodeDataUrl: qrCodeDataUrl
    });

  } catch (error) {
    console.error("Error saat update distribusi:", error);
    res.status(500).json({ success: false, message: "Gagal update status distribusi." });
  }
});

// Endpoint untuk mendapatkan riwayat kopi (diambil dari cache)
// Endpoint untuk mendapatkan riwayat satu kopi (MODIFIED FOR MYSQL)
app.get('/api/riwayat/:idLot', async (req, res) => {
  try {
    const { idLot } = req.params;
    console.log(`Mencari riwayat untuk ID: ${idLot} dari MySQL...`);

	const query = `
	SELECT 
		h.lot_id, 
		h.farmer_name, 
		h.harvest_location, 
		h.harvest_date, 
		h.process_method, 
		h.harvest_weight, 
		h.tx_hash_harvest, -- Ambil tx_hash_harvest
		d.distributor_name, 
		d.date_received, 
		d.shipping_destination,
		d.tx_hash_distribution -- Ambil tx_hash_distribution
	FROM harvest_lots h
	LEFT JOIN distribution_records d ON h.lot_id = d.lot_id
	WHERE h.lot_id = ?
	`;

    const [rows] = await db.query(query, [idLot]);

    if (rows.length > 0) {
      const lot = rows[0];
      const riwayat = {
        idLot: lot.lot_id,
        namaPetani: lot.farmer_name,
        lokasiPanen: lot.harvest_location,
        tanggalPanen: lot.harvest_date.toISOString().split('T')[0], // Format tanggal
        metodeProses: lot.process_method,
        beratPanen: lot.harvest_weight,
        isDistribusiUpdated: !!lot.distributor_name,
        namaDistributor: lot.distributor_name || "",
        tanggalDiterima: lot.date_received ? lot.date_received.toISOString().split('T')[0] : null,
        tujuanPengiriman: lot.shipping_destination || "",
		txHashHarvest: lot.tx_hash_harvest,
    	txHashDistribution: lot.tx_hash_distribution || null
      };
      res.status(200).json({ success: true, data: riwayat });
    } else {
      res.status(404).json({ success: false, message: "ID Lot tidak ditemukan di database." });
    }
  } catch (error) {
    console.error("Error saat mengambil riwayat dari MySQL:", error);
    res.status(500).json({ success: false, message: "Terjadi galat internal." });
  }
});


// Endpoint BARU untuk mendapatkan SEMUA lot panen (untuk halaman petani)
app.get('/api/lots', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM harvest_lots');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching all lots:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data lot." });
  }
});

// Endpoint BARU untuk mendapatkan SEMUA riwayat distribusi (untuk halaman distributor)
app.get('/api/distribusi', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM distribution_records');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching all distribution records:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data distribusi." });
  }
});


// --- Menjalankan Server ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});