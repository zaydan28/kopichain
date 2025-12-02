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
    if (userRole !== 'distributor') {
      alert('Akses ditolak. Halaman ini hanya untuk distributor.');
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
  const API_URL = 'http://localhost:3001';
  
  let allData = [];       // Menyimpan SEMUA data dari database
  let filteredData = [];  // Menyimpan data yang sedang ditampilkan (hasil search)
  let currentPage = 1;
  const itemsPerPage = 10;

  // --- ELEMEN DOM ---
  const formDistributor = document.querySelector('#formDistributor');
  const qrCodeContainer = document.getElementById('qr-code-container');
  const listBody = document.querySelector('#distributor-list-body');
  const paginationContainer = document.querySelector('#distributor-pagination');
  const searchInput = document.querySelector('#searchDistribusiInput'); // Input Search Baru
  const paginationInfo = document.querySelector('#paginationInfo');

  // =======================================================
  // BAGIAN 2: FETCH DATA & INITIALIZATION
  // =======================================================
  async function fetchAndDisplayDistributionHistory() {
    try {
      const response = await fetch(`${API_URL}/api/distribusi`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = 'login.html';
          return;
      }
      if (!response.ok) throw new Error('Gagal mengambil data distribusi.');
      
      const result = await response.json();
      
      // Simpan data asli (reverse agar terbaru di atas)
      allData = result.data.reverse();
      
      // Awalnya filter = semua data
      filteredData = [...allData];

      renderTable();
      renderPagination();

    } catch (error) {
      console.error("Fetch Error:", error);
      listBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Gagal memuat data: ${error.message}</td></tr>`;
    }
  }

  // =======================================================
  // BAGIAN 3: LOGIKA SEARCH (PENCARIAN)
  // =======================================================
  if (searchInput) {
      searchInput.addEventListener('input', function(e) {
          const keyword = e.target.value.toLowerCase();
          
          // Filter berdasarkan lot_id atau nama distributor
          filteredData = allData.filter(item => 
              item.lot_id.toLowerCase().includes(keyword) || 
              item.distributor_name.toLowerCase().includes(keyword)
          );

          currentPage = 1; // Reset ke halaman 1 saat mencari
          renderTable();
          renderPagination();
      });
  }

  // =======================================================
  // BAGIAN 4: RENDER TABEL & PAGINATION
  // =======================================================
  function renderTable() {
    listBody.innerHTML = '';

    if (filteredData.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">Data tidak ditemukan.</td></tr>`;
        if(paginationInfo) paginationInfo.textContent = "Menampilkan 0 data";
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const dataToRender = filteredData.slice(startIndex, endIndex);

    let html = '';
    dataToRender.forEach(item => {
      // Format Tanggal
      const dateObj = new Date(item.date_received);
      const formattedDate = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

      // Logika Status Badge (Cek tx_hash_distribution)
      const statusBadge = item.tx_hash_distribution 
          ? `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3"><i class="bi bi-check-circle me-1"></i> On-Chain</span>`
          : `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3"><i class="bi bi-hourglass-split me-1"></i> Pending</span>`;

      // Render Baris Tabel sesuai kolom HTML Distributor
      html += `
        <tr>
          <td class="font-monospace text-electric-blue fw-bold">${item.lot_id}</td>
          <td>${item.distributor_name}</td>
          <td>${formattedDate}</td>
          <td><span class="text-white-50 small d-block"></span> ${item.shipping_destination}</td>
          <td class="text-end pe-4">${statusBadge}</td>
        </tr>
      `;
    });

    listBody.innerHTML = html;

    // Update Info Text
    if(paginationInfo) {
        paginationInfo.textContent = `Menampilkan ${startIndex + 1}-${Math.min(endIndex, filteredData.length)} dari ${filteredData.length} data`;
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Tombol Previous
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    let paginationHTML = `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-page="${currentPage - 1}"><i class="bi bi-chevron-left"></i></a></li>`;

    // Angka Halaman
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    // Tombol Next
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    paginationHTML += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" data-page="${currentPage + 1}"><i class="bi bi-chevron-right"></i></a></li>`;

    paginationContainer.innerHTML = paginationHTML;
  }

  // Event Listener Pagination Click
  if(paginationContainer){
    paginationContainer.addEventListener('click', function(e){
        e.preventDefault();
        const targetLink = e.target.closest('.page-link');
        if(targetLink && !targetLink.parentElement.classList.contains('disabled')){
            const newPage = parseInt(targetLink.dataset.page);
            if (newPage > 0 && newPage <= Math.ceil(filteredData.length / itemsPerPage)) {
                currentPage = newPage;
                renderTable();
                renderPagination();
            }
        }
    });
  }

  // =======================================================
  // BAGIAN 5: FORM UPDATE DISTRIBUSI
  // =======================================================
  if (formDistributor) {
    formDistributor.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = this.querySelector('button[type="submit"]');
      const originalContent = submitButton.innerHTML;
      
      // UI Loading State
      qrCodeContainer.style.display = 'none';
      submitButton.disabled = true;
      submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Memproses...`;

      const dataToSend = {
        idLot: document.getElementById('pilihIdLot').value,
        namaDistributor: document.getElementById('namaDistributor').value,
        tanggalDiterima: document.getElementById('tanggalDiterima').value,
        tujuanPengiriman: document.getElementById('tujuanPengiriman').value,
      };

      try {
        const response = await fetch(`${API_URL}/api/update-distribusi`, {
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
        alert(`Sukses! Status distribusi ID ${dataToSend.idLot} tercatat.`);
        formDistributor.reset();

        // Tampilkan QR Code
        if (result.qrCodeDataUrl) {
          document.getElementById('qr-code-image').src = result.qrCodeDataUrl;
          document.getElementById('download-qr-link').href = result.qrCodeDataUrl;
          qrCodeContainer.style.display = 'block'; // Tampilkan Modal Overlay
        }
        
        // Refresh Tabel
        currentPage = 1;
        if(searchInput) searchInput.value = '';
        fetchAndDisplayDistributionHistory();

      } catch (error) {
        console.error('Error:', error);
        alert(`Gagal mengupdate status: ${error.message}`);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalContent;
      }
    });
  }

  // Load Data Awal
  fetchAndDisplayDistributionHistory();
});