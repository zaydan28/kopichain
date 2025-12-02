document.addEventListener('DOMContentLoaded', function() {

  // =======================================================
  // BAGIAN 1: PROTEKSI HALAMAN & AUTH
  // =======================================================
  const token = localStorage.getItem('authToken');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const userRole = JSON.parse(atob(token.split('.')[1])).role;
    if (userRole !== 'petani') {
      alert('Akses ditolak. Halaman ini hanya untuk petani.');
      window.location.href = 'login.html';
      return;
    }
  } catch (e) {
    console.error('Token tidak valid:', e);
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
    return;
  }

  // --- KONFIGURASI & VARIABEL STATE ---
  const API_URL = 'https://kopichain-production.up.railway.app';
  
  let allLots = [];      // Menyimpan SEMUA data dari database
  let filteredLots = []; // Menyimpan data yang sedang ditampilkan (hasil search)
  let currentPage = 1;
  const itemsPerPage = 10;

  // --- ELEMEN DOM ---
  const formPetani = document.querySelector('#formPetani');
  const lotListBody = document.querySelector('#petani-lot-list-body');
  const paginationContainer = document.querySelector('#petani-pagination');
  const searchInput = document.querySelector('#searchLotInput'); // Input Search Baru
  const paginationInfo = document.querySelector('#paginationInfo'); // Teks info "Menampilkan..."

  // =======================================================
  // BAGIAN 2: FETCH DATA & INITIALIZATION
  // =======================================================
  async function fetchAndDisplayLots() {
    try {
      const response = await fetch(`${API_URL}/api/lots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          window.location.href = 'login.html';
          return;
      }

      if (!response.ok) throw new Error('Gagal mengambil data.');
      
      const result = await response.json();
      
      // Simpan data asli (reverse agar yang terbaru di atas)
      allLots = result.data.reverse();
      
      // Awalnya, data yang difilter = semua data
      filteredLots = [...allLots];

      // Render Tabel & Pagination
      renderTable();
      renderPagination();

    } catch (error) {
      console.error("Fetch Error:", error);
      lotListBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Gagal memuat data: ${error.message}</td></tr>`;
    }
  }

  // =======================================================
  // BAGIAN 3: LOGIKA SEARCH (PENCARIAN)
  // =======================================================
  if (searchInput) {
      searchInput.addEventListener('input', function(e) {
          const keyword = e.target.value.toLowerCase();
          
          // Filter array allLots berdasarkan lot_id
          filteredLots = allLots.filter(lot => 
              lot.lot_id.toLowerCase().includes(keyword)
          );

          // Reset ke halaman 1 setiap kali mencari
          currentPage = 1;
          
          // Render ulang
          renderTable();
          renderPagination();
      });
  }

  // =======================================================
  // BAGIAN 4: RENDER TABEL & PAGINATION
  // =======================================================
  function renderTable() {
    lotListBody.innerHTML = '';

    if (filteredLots.length === 0) {
        lotListBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-secondary">Data tidak ditemukan.</td></tr>`;
        if(paginationInfo) paginationInfo.textContent = "Menampilkan 0 data";
        return;
    }

    // Logika Slicing Data untuk Halaman saat ini
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const dataToRender = filteredLots.slice(startIndex, endIndex);

    let html = '';
    
    dataToRender.forEach(lot => {
      // Logika Status: Jika ada hash, berarti On-Chain (Hijau)
      const statusBadge = lot.tx_hash_harvest 
          ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3"><i class="bi bi-check-circle me-1"></i> On-Chain</span>`
          : `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3"><i class="bi bi-hourglass-split me-1"></i> Pending</span>`;

      // Format Tanggal
      const dateObj = new Date(lot.harvest_date);
      const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

      html += `
        <tr>
          <td class="font-monospace text-neon-green fw-bold">${lot.lot_id}</td>
          <td>${lot.farmer_name}</td>
          <td>${formattedDate}</td>
          <td><span class="badge bg-light bg-opacity-10 text-white fw-normal border border-secondary border-opacity-25">${lot.process_method}</span></td>
          <td class="font-monospace">${lot.harvest_weight} Kg</td>
          <td class="text-end pe-4">${statusBadge}</td>
        </tr>
      `;
    });

    lotListBody.innerHTML = html;

    // Update Info Text
    if(paginationInfo) {
        paginationInfo.textContent = `Menampilkan ${startIndex + 1}-${Math.min(endIndex, filteredLots.length)} dari ${filteredLots.length} data`;
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredLots.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return; // Sembunyikan jika cuma 1 halaman

    // Tombol Previous
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    let paginationHTML = `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-page="${currentPage - 1}"><i class="bi bi-chevron-left"></i></a></li>`;

    // Angka Halaman
    // (Opsional: Bisa ditambah logika "..." jika halaman sangat banyak)
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    // Tombol Next
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    paginationHTML += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" data-page="${currentPage + 1}"><i class="bi bi-chevron-right"></i></a></li>`;

    paginationContainer.innerHTML = paginationHTML;
  }

  // Event Listener Klik Pagination
  if(paginationContainer){
    paginationContainer.addEventListener('click', function(e) {
        e.preventDefault();
        // Cari elemen <a> terdekat yang diklik
        const targetLink = e.target.closest('.page-link');
        
        if (targetLink && !targetLink.parentElement.classList.contains('disabled')) {
            const newPage = parseInt(targetLink.dataset.page);
            if (newPage > 0 && newPage <= Math.ceil(filteredLots.length / itemsPerPage)) {
                currentPage = newPage;
                renderTable();
                renderPagination();
            }
        }
    });
  }

  // =======================================================
  // BAGIAN 5: FORM SUBMIT (INPUT DATA BARU)
  // =======================================================
  if (formPetani) {
    formPetani.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = this.querySelector('button[type="submit"]');
      const originalContent = submitButton.innerHTML;
      
      // Loading State
      submitButton.disabled = true;
      submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Menyimpan...`;

      // Generate ID Lot Otomatis (GAYO-YYYYMMDD-XXX)
      const tanggalPanen = document.getElementById('tanggalPanen').value;
      const date = new Date(tanggalPanen);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 900) + 100); // 3 Digit Random
      const idLot = `GAYO-${year}${month}${day}-${randomNum}`;

      const dataToSend = {
        idLot,
        namaPetani: document.getElementById('namaPetani').value,
        lokasiPanen: document.getElementById('lokasiPanen').value,
        tanggalPanen,
        metodeProses: document.getElementById('metodeProses').value,
        beratPanen: document.getElementById('beratPanen').value,
      };

      try {
        const response = await fetch(`${API_URL}/api/buat-lot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        // Sukses
        alert(`Sukses! Lot kopi berhasil dibuat.\nID Lot: ${idLot}`);
        formPetani.reset();
        
        // Refresh data tabel (kembali ke halaman 1)
        currentPage = 1;
        if(searchInput) searchInput.value = ''; // Clear search
        fetchAndDisplayLots(); 

      } catch (error) {
        console.error('Error:', error);
        alert(`Gagal membuat lot kopi: ${error.message}`);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalContent;
      }
    });
  }

  // Jalankan saat load
  fetchAndDisplayLots();

});
