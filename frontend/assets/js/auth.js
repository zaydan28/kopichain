// Alamat base URL untuk API backend Anda
const API_URL = 'https://kopichain-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.querySelector('#formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('loginUser').value; // Sesuaikan jika ID Anda beda
            const password = document.getElementById('loginPassword').value;
            
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message);
                }

                // Jika login berhasil, simpan token dan data pengguna
                localStorage.setItem('authToken', result.token);
                
                // Cek peran (role) dari token untuk redirect ke halaman yang benar
                const decodedToken = JSON.parse(atob(result.token.split('.')[1]));
                if (decodedToken.role === 'petani') {
                    window.location.href = 'petani.html';
                } else if (decodedToken.role === 'distributor') {
                    window.location.href = 'distributor.html';
                } else {
                    alert('Peran pengguna tidak dikenali.');
                }

            } catch (error) {
                alert(`Login Gagal: ${error.message}`);
            }
        });
    }

});
