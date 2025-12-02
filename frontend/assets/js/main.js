document.addEventListener('DOMContentLoaded', function() {

  // --- BASE URL UNTUK API BACKEND ---
  const API_URL = 'https://kopichain-production.up.railway.app';
  let html5QrCodeScanner = null; // Ini akan menyimpan objek scanner
  const qrScannerContainer = document.getElementById('qr-scanner-container');
  const btnMulaiScan = document.getElementById('btnMulaiScan');
  const btnHentikanScan = document.getElementById('btnHentikanScan');
  

  // ==============================================================
  // ▼▼▼ LOGIKA QR SCANNER ▼▼▼
  // ==============================================================

  // 1. Fungsi untuk MEMULAI Scan
  function mulaiScan() {
    // Sembunyikan hasil lacak/error lama jika ada
    document.getElementById('hasil-lacak').style.display = 'none';
    document.getElementById('hasil-tidak-ditemukan').style.display = 'none';

    // Tampilkan container scanner
    qrScannerContainer.style.display = 'block';

    // Buat objek scanner baru JIKA belum ada
    if (!html5QrCodeScanner) {
      html5QrCodeScanner = new Html5Qrcode("qr-reader");
    }

    // Konfigurasi kamera
    const config = { 
      fps: 10, // Frame per second
      qrbox: { width: 250, height: 250 } // Ukuran kotak scan
    };

    // Fungsi callback sukses (INI SUDAH DIISI)
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        console.log(`Scan Berhasil: ${decodedText}`);

        // 1. Masukkan hasil scan ke input box
        // 1. Cek apakah hasil scan adalah URL dan ambil ID-nya
        let finalId = decodedText;
        try {
            // Coba perlakukan teks sebagai URL
            const url = new URL(decodedText);

            // Cek apakah di URL itu ada parameter 'id'
            if (url.searchParams.has('id')) {
                finalId = url.searchParams.get('id'); // Ambil ID-nya saja
                console.log("URL terdeteksi, ID diambil:", finalId);
            }
        } catch (_) {
            // Jika gagal (bukan URL), berarti finalId sudah benar (teks biasa)
            console.log("Teks biasa terdeteksi:", finalId);
        }

        // 2. Masukkan ID yang sudah bersih ke input box
        document.getElementById('idLacak').value = finalId;

        // 2. Matikan kamera & sembunyikan container
        hentikanScan();

        // 3. Otomatis submit form untuk melacak
        // Kita panggil fungsi requestSubmit yang sudah ada di kode Anda
        const formKonsumen = document.querySelector('#formKonsumen');
        if (formKonsumen) {
            // Kita gunakan helper 'requestSubmit' yang sudah ada di kode Anda
            // untuk memastikan submit berjalan lancar
            requestSubmit(formKonsumen); 
        }
    };

    // Fungsi callback error (bisa diabaikan)
    const qrCodeErrorCallback = (errorMessage) => {
      // console.warn(`QR error: ${errorMessage}`);
    };

    // Mulai scan!
    // Kita minta kamera 'environment' (kamera belakang HP)
    html5QrCodeScanner.start(
        { facingMode: "environment" }, 
        config, 
        qrCodeSuccessCallback, 
        qrCodeErrorCallback
    ).catch((err) => {
        // Gagal memulai kamera (mungkin tidak ada, atau diblokir izinnya)
        alert('Gagal mengakses kamera. Pastikan Anda memberi izin atau memiliki webcam.');
        console.error("Gagal memulai QR Scanner:", err);
        hentikanScan(); // Tutup container jika gagal
    });
  }

  // 2. Fungsi untuk MENGHENTIKAN Scan
  function hentikanScan() {
    if (html5QrCodeScanner) {
      html5QrCodeScanner.stop().then(() => {
        console.log("QR Scanner dihentikan.");
        qrScannerContainer.style.display = 'none';
      }).catch((err) => {
        console.error("Gagal menghentikan scanner:", err);
      });
    } else {
      qrScannerContainer.style.display = 'none';
    }
  }

  // 3. Pasang Event Listener ke Tombol
  if (btnMulaiScan) {
    btnMulaiScan.addEventListener('click', (e) => {
      e.preventDefault(); // Mencegah form ter-submit
      mulaiScan();
    });
  }

  if (btnHentikanScan) {
    btnHentikanScan.addEventListener('click', () => {
      hentikanScan();
    });
  }


  // ==============================================================
  // BAGIAN 1: FUNGSI UI & NAVIGASI (Scroll & Navbar)
  // ==============================================================
  const navbar = document.querySelector('.navbar');
  
  // Efek Navbar Transparan ke Solid saat Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled'); // Pastikan ada CSS untuk class ini atau biarkan default
      navbar.classList.remove('bg-transparent');
      navbar.style.background = 'rgba(10, 14, 26, 0.95)'; // Warna Obsidian
    } else {
      navbar.classList.remove('navbar-scrolled');
      navbar.classList.add('bg-transparent');
      navbar.style.background = 'transparent';
    }
  });

  // Smooth Scroll untuk Link Anchor
  // Smooth Scroll untuk Link Anchor
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      
      // [PERBAIKAN DISINI] 
      // Ambil href terbaru saat diklik (karena bisa saja sudah diubah oleh JS ke https://...)
      const targetId = this.getAttribute('href');

      // Jika link sudah berubah jadi URL Eksternal (tidak diawali #), biarkan browser membukanya
      if (!targetId.startsWith('#')) {
          return; 
      }

      // Abaikan jika link kosong '#' saja (placeholder)
      if(targetId === '#') return;
      
      // Hanya cegah default jika benar-benar link internal halaman
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ==============================================================
  // BAGIAN 2: LOGIKA PELACAKAN (CONSUMER TRACKING)
  // ==============================================================
  const formKonsumen = document.querySelector('#formKonsumen');
  const hasilLacakContainer = document.getElementById('hasil-lacak');
  const hasilTidakDitemukanContainer = document.getElementById('hasil-tidak-ditemukan');

  // A. Cek apakah ada ID di URL (misal: ?id=GAYO-123) saat halaman dimuat
  const prosesLacakDariUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const idLacakDariUrl = params.get('id');
      if (idLacakDariUrl) {
          document.getElementById('idLacak').value = idLacakDariUrl;
          // Trigger event submit secara manual
          requestSubmit(formKonsumen); 
      }
  };

  // Helper untuk trigger submit yang aman
  function requestSubmit(form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }

  // B. Event Listener Form Submit
  if (formKonsumen) {
    formKonsumen.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const inputId = document.getElementById('idLacak');
      const idLacak = inputId.value.trim();
      const btnSubmit = this.querySelector('button[type="submit"]');
      const originalBtnText = btnSubmit.innerHTML;

      if (!idLacak) return;

      // UX: Loading State
      btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Melacak...';
      btnSubmit.disabled = true;
      hasilLacakContainer.style.display = 'none';
      hasilTidakDitemukanContainer.style.display = 'none';
      
      try {
        const response = await fetch(`${API_URL}/api/riwayat/${idLacak}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Data tidak ditemukan');
        }

        const data = result.data;

        // --- 1. UPDATE TAMPILAN DATA ---
        
        // --- 1. UPDATE TAMPILAN DATA ---
        
        // Header ID
        document.getElementById('displayIdLacak').textContent = data.idLot;

        // A. Timeline Item 1: Petani & Hash Panen
        const infoPetaniElem = document.getElementById('infoPetani');
        infoPetaniElem.innerHTML = `
            <span class="text-electric-blue">${data.namaPetani}</span><br>
            <span class="small text-secondary">Lokasi: ${data.lokasiPanen}</span><br>
            <span class="small text-secondary">Proses: ${data.metodeProses} (${data.beratPanen} kg)</span>
        `;
        document.getElementById('infoTanggalPanen').textContent = formatDate(data.tanggalPanen);

        // TAMBAHAN: Set Link & Teks Hash Panen (tx_hash_harvest)
        const linkHashPanen = document.getElementById('linkHashPanen');
        const textHashPanen = document.getElementById('textHashPanen');
        
        if (data.txHashHarvest) {
            linkHashPanen.href = `https://sepolia.etherscan.io/tx/${data.txHashHarvest}`;
            // Tampilkan 10 karakter pertama...10 karakter terakhir agar rapi
            textHashPanen.textContent = `${data.txHashHarvest.substring(0, 15)}...${data.txHashHarvest.substring(data.txHashHarvest.length - 10)}`;
        } else {
            linkHashPanen.href = "#";
            textHashPanen.textContent = "Pending / Not Found";
            linkHashPanen.classList.add('text-secondary');
        }

        // B. Timeline Item 2: Distributor & Hash Distribusi
        const infoDistributorElem = document.getElementById('infoDistributor');
        const infoTanggalDiterimaElem = document.getElementById('infoTanggalDiterima');
        const containerHashDistribusi = document.getElementById('containerHashDistribusi');
        const linkHashDistribusi = document.getElementById('linkHashDistribusi');
        const textHashDistribusi = document.getElementById('textHashDistribusi');
        
        if (data.isDistribusiUpdated) {
            infoDistributorElem.innerHTML = `
                <span class="text-electric-blue">${data.namaDistributor}</span><br>
                <span class="small text-secondary">Tujuan: ${data.tujuanPengiriman}</span>
            `;
            infoTanggalDiterimaElem.textContent = formatDate(data.tanggalDiterima);
            
            // Tampilkan Hash Distribusi (tx_hash_distribution)
            containerHashDistribusi.style.display = 'block';
            if (data.txHashDistribution) {
                linkHashDistribusi.href = `https://sepolia.etherscan.io/tx/${data.txHashDistribution}`;
                textHashDistribusi.textContent = `${data.txHashDistribution.substring(0, 15)}...${data.txHashDistribution.substring(data.txHashDistribution.length - 10)}`;
            } else {
                textHashDistribusi.textContent = "Processing...";
            }

        } else {
            infoDistributorElem.innerHTML = `<span class="text-warning">Menunggu Distribusi...</span>`;
            infoTanggalDiterimaElem.textContent = "-";
            // Sembunyikan container hash jika belum ada distribusi
            containerHashDistribusi.style.display = 'none';
        }

        // --- 2. UPDATE GRAFIK RASA (Opsional / Dummy Data) ---
        // Fitur ini memberikan efek visual "hidup" pada redesign
        if (window.flavorChart) {
            updateFlavorChart(data.metodeProses);
        }

        // Tampilkan Container Hasil (Gunakan 'block' agar sesuai Bootstrap container)
        hasilLacakContainer.style.display = 'block'; 
        
        // Auto scroll ke hasil
        setTimeout(() => {
            hasilLacakContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

      } catch (error) {
        console.error('Error saat melacak:', error);
        hasilTidakDitemukanContainer.style.display = 'block';
      } finally {
        // Reset Tombol
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
      }
    });
  }

  // Helper: Format Tanggal Indonesia
  function formatDate(dateString) {
      if(!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  // Helper: Update Grafik Dummy berdasarkan Metode Proses (Visual Candy)
  function updateFlavorChart(metode) {
      let newData = [5, 5, 5, 5, 5];
      // Logika dummy sederhana untuk mengubah bentuk grafik sesuai metode
      if (metode === 'Natural') newData = [8, 9, 9, 9, 4]; // Fruity, Sweet
      if (metode === 'Full Washed') newData = [9, 6, 8, 6, 5]; // Clean, Acidic
      if (metode === 'Honey') newData = [7, 8, 8, 9, 4]; // Balanced, Sweet

      window.flavorChart.data.datasets[0].data = newData;
      window.flavorChart.update();
  }

  // ==============================================================
  // BAGIAN BARU: FUNGSI TICKER DINAMIS
  // ==============================================================
  function updateTicker() {
      // 1. SIMULASI DATA DINAMIS
      // Ini mensimulasikan data "live" dari jaringan
      const gasPrice = Math.floor(Math.random() * (25 - 15 + 1)) + 15; // Gas acak antara 15-25
      const latestBlock = 5129102 + Math.floor(Math.random() * 3); // Blok bertambah
      
      // 2. AMBIL DATA NYATA (TOTAL LOTS)
      // Ini akan memanggil backend Anda untuk data nyata
      fetch(`${API_URL}/api/stats/total-lots`) // Asumsi Anda membuat endpoint ini
          .then(response => response.json())
          .then(data => {
              const totalLots = data.total || 1240; // Ambil total dari API
              document.getElementById('ticker-total-lots').textContent = totalLots;
              document.getElementById('ticker-total-lots-clone').textContent = totalLots;
          })
          .catch(() => {
              // Jika Gagal API, biarkan default
              console.warn('Gagal mengambil data total lots untuk ticker.');
          });

      // 3. UPDATE DATA SIMULASI KE HTML
      document.getElementById('ticker-gas').textContent = gasPrice;
      document.getElementById('ticker-gas-clone').textContent = gasPrice;
      document.getElementById('ticker-block').textContent = `#${latestBlock}`;
      document.getElementById('ticker-block-clone').textContent = `#${latestBlock}`;
  }

  // Panggil updateTicker setiap 5 detik (5000 ms)
  setInterval(updateTicker, 2000);

  // Panggil sekali saat load untuk data pertama
  updateTicker();

  // Jalankan cek URL saat load
  prosesLacakDariUrl();

});
