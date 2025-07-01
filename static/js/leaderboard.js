// leaderboard.js
const leaderboardSound = new Audio('/static/sounds/leaderboard.wav');
const clickSound = new Audio('/static/sounds/click.wav');

function loadLeaderboard() {
    fetch('/leaderboard', {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Mengubah respons ke format JSON
    })
    .then(data => {
        // Cek jika data yang diterima kosong
        if (data.length === 0) {
            document.getElementById('leaderboard-table').innerHTML = "<tr><td colspan='2'>No leaderboard data available.</td></tr>";
            return; // Tidak melanjutkan jika tidak ada data
        }

        // Menampilkan data leaderboard dalam tabel
        const leaderboardTable = document.getElementById('leaderboard-table').getElementsByTagName('tbody')[0];
        leaderboardTable.innerHTML = ''; // Clear tabel terlebih dahulu

        // Menambahkan data leaderboard ke dalam tabel
        data.forEach(entry => {
            const row = document.createElement('tr');
            const usernameCell = document.createElement('td');
            usernameCell.textContent = entry.username;
            const scoreCell = document.createElement('td');
            scoreCell.textContent = entry.score;
            row.appendChild(usernameCell);
            row.appendChild(scoreCell);
            leaderboardTable.appendChild(row);
        });
        // Memainkan suara leaderboard.wav setelah data berhasil dimuat
        const leaderboardSound = new Audio('/static/sounds/leaderboard.wav');
        leaderboardSound.play().catch(error => {
            console.error("Error playing leaderboard sound:", error);
        });
    })
    .catch(error => {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard-table').innerHTML = "<tr><td colspan='2'>Error loading leaderboard.</td></tr>";
    });

    // Menambahkan event listener untuk tombol "Back to Homepage"
    const backToHomepageButton = document.querySelector('a.button');
    if (backToHomepageButton) {
        backToHomepageButton.addEventListener('click', function() {
            // Memainkan suara click.wav saat tombol diklik
            const clickSound = new Audio('/static/sounds/click.wav');
            clickSound.play().catch(error => {
                console.error("Error playing click sound:", error);
            });
        });
    }
}

// Panggil fungsi loadLeaderboard saat halaman selesai dimuat
window.onload = function() {
    loadLeaderboard();
};
