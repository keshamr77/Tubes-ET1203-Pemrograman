// Select canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200; // Enlarged canvas width
canvas.height = 550; // Enlarged canvas height

// Load assets
const backgroundImg = new Image();
backgroundImg.src = '/static/assets/images/background.gif';
const playerImg = new Image();
playerImg.src = '/static/assets/images/player.gif';
const playerProjectileImg = new Image();
playerProjectileImg.src = '/static/assets/images/player_projectile.gif';
const enemyImg = new Image();
enemyImg.src = '/static/assets/images/enemy.gif';
const enemyProjectileImg = new Image();
enemyProjectileImg.src = '/static/assets/images/enemy_projectile.png';
const obstacleImg = new Image();
obstacleImg.src = '/static/assets/images/obstacle.gif';
const powerupSpeedImg = new Image();
powerupSpeedImg.src = '/static/assets/images/powerup_speed.png';
const gameplaySound = new Audio('/static/assets/sounds/gameplay.mp3');
const shootingSound = new Audio('/static/sounds/fire.wav');
// Game state variables
let score = 0;
let lives = 3;
let isGameOver = false;
let timeElapsed = 0;  
let soundPlayed = false;  // Variabel untuk menandakan apakah suara sudah diputar

let backgroundMusic = new Audio('/static/sounds/gameplay.mp3');
backgroundMusic.loop = true
// Fungsi untuk memutar suara gameplay
function playGameplaySound() {
    const gameplaySound = new Audio('/static/sounds/gameplay.mp3');
    gameplaySound.loop = true;  // Suara diputar berulang
    gameplaySound.play().catch(error => console.error("Error memutar suara:", error)); // Tangani error
}

// Fungsi untuk memeriksa dan memutar suara ketika skor lebih dari 100
function checkAndPlaySound() {
    if (score > 100 && !soundPlayed) {
        playGameplaySound();  // Panggil fungsi untuk memutar suara
        soundPlayed = true;   // Tandai bahwa suara sudah diputar
    }
}

// Fungsi untuk memutar suara tembakan
function playShootingSound() {
    shootingSound.play();
}

// Player
const player = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 150,
    width: 100, // Larger player
    height: 100,
    speed: 7,
};

// Arrays for game objects
const bullets = [];
const enemies = [];
const enemyProjectiles = [];
const obstacles = [];
const powerups = [];

// Key events
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === ' ') {
        shootBullet();
    }
});

// Function to draw background
function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Hitbox untuk player (80% dari ukuran)
    const playerHitbox = {
        x: player.x + player.width * 0.1, // Margin 10% kiri
        y: player.y + player.height * 0.1, // Margin 10% atas
        width: player.width * 0.8, // Lebar 80%
        height: player.height * 0.8, // Tinggi 80%
    };

    // Debugging: Visualisasi hitbox player
    //ctx.strokeStyle = 'blue';
    //ctx.strokeRect(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height);
}

// Function to draw bullets
function drawBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += 5; // Speed up projectile
        ctx.drawImage(playerProjectileImg, bullet.x, bullet.y, 40, 40); // Larger projectile

        // Check collision with enemies
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + 40 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 40 > enemy.y
            ) {
                // Remove the enemy and the bullet
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);

                // Hitbox untuk player projectile
    const bulletHitbox = {
        x: bullet.x + 5, // Sedikit margin untuk hitbox
        y: bullet.y + 5,
        width: 10,
        height: 10,
    };

    // Debugging: Visualisasi hitbox player projectile
    ctx.strokeStyle = 'green';
    ctx.strokeRect(bulletHitbox.x, bulletHitbox.y, bulletHitbox.width, bulletHitbox.height);
                // Increase the score
                score += 1000;
            }
        });

        // Remove bullet if out of screen
        if (bullet.x > canvas.width) bullets.splice(bulletIndex, 1);
    });
}

// Function to shoot bullet
function shootBullet() {
    bullets.push({ x: player.x + player.width, y: player.y + player.height / 2 - 10 });
    playShootingSound()
}


// Function to draw enemies
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x -= 3; // Slower movement
        enemy.y += enemy.movement;
        if (enemy.y <= 0 || enemy.y >= canvas.height - enemy.height) {
            enemy.movement *= -1; // Reverse direction if hitting boundary
        }

        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

        // Enemy shoots projectiles
        if (Math.random() < 0.01) {
            enemyProjectiles.push({
                x: enemy.x,
                y: enemy.y + enemy.height / 2,
                width: 10,
                height: 10,
            });
        }
    });
}

// Function to draw enemy projectiles
function drawEnemyProjectiles() {
    enemyProjectiles.forEach((proj, index) => {
        proj.x -= 5;
        ctx.drawImage(enemyProjectileImg, proj.x, proj.y, 40, 40); // Enlarged enemy projectile

        // Hitbox untuk enemy projectile
        const projHitbox = {
            x: proj.x + 10,  // Adjusted hitbox to match the larger projectile size
            y: proj.y + 10,
            width: 20,  // Adjusted width for the larger projectile
            height: 20, // Adjusted height for the larger projectile
        };

        // Debugging: Visualisasi hitbox enemy projectile
        ctx.strokeStyle = 'yellow';
        ctx.strokeRect(projHitbox.x, projHitbox.y, projHitbox.width, projHitbox.height);

        // Collision dengan player
        if (
            projHitbox.x < player.x + player.width &&
            projHitbox.x + projHitbox.width > player.x &&
            projHitbox.y < player.y + player.height &&
            projHitbox.y + projHitbox.height > player.y
        ) {
            lives--;
            enemyProjectiles.splice(index, 1);
        }

        // Hapus projectile jika keluar dari layar
        if (proj.x < 0) enemyProjectiles.splice(index, 1);
    });
}
function drawObstacles() {
    obstacles.forEach((obs, index) => {
        obs.x -= 3;
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);

        // Hitbox untuk obstacle
        const hitbox = {
            x: obs.x + obs.width * 0.1,
            y: obs.y + obs.height * 0.1,
            width: obs.width * 0.8,
            height: obs.height * 0.8,
        };

        // Debugging: Visualisasi hitbox obstacle
        //ctx.strokeStyle = 'red';
        //ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

        // Collision dengan player
        if (
            hitbox.x < player.x + player.width &&
            hitbox.x + hitbox.width > player.x &&
            hitbox.y < player.y + player.height &&
            hitbox.y + hitbox.height > player.y
        ) {
            lives--;
            obstacles.splice(index, 1); // Hapus obstacle setelah tabrakan
        }
    });
}

// Function to draw power-ups
function drawPowerups() {
    powerups.forEach((powerup, index) => {
        powerup.x -= 3;
        ctx.drawImage(powerupSpeedImg, powerup.x, powerup.y, 30, 30); // Slightly larger powerup

        // Collision with player
        if (
            powerup.x < player.x + player.width &&
            powerup.x + 30 > player.x &&
            powerup.y < player.y + player.height &&
            powerup.y + 30 > player.y
        ) {
            powerups.splice(index, 1);
            activateSpeedBoost();
        }
    });
}

// Activate speed boost for player
function activateSpeedBoost() {
    player.speedBoost = true;
    player.speed = 14; // Double speed
    setTimeout(() => {
        player.speedBoost = false;
        player.speed = 7; // Reset speed after 5 seconds
    }, 5000);
}

// Function to update score over time (like the Chrome Dinosaur game)
function updateScoreOverTime() {
    timeElapsed++;
    score += 1;  // Meningkatkan skor setiap detik
    document.getElementById('score').textContent = `Score: ${score}`;
    checkAndPlaySound()
}

function getUsernameFromInput() {
    return document.getElementById('username').value;  // Ambil username dari input hidden
}


function getScoreFromGame() {
    // Ambil skor dari variabel skor game
    return score;
}

/// Update logika updateGame untuk memanggil gameOver ketika lives habis
function updateGame() {
    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

    // Spawn enemies randomly
    if (Math.random() < 0.001) {
        enemies.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 100),
            width: 100,
            height: 100,
            movement: Math.random() < 0.5 ? -1 : 1,
        });
    }

    // Spawn obstacles randomly
    if (Math.random() < 0.005) {
        obstacles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 50),
            width: 100,
            height: 100,
        });
    }

    // Spawn power-ups randomly
    if (Math.random() < 0.002) {
        powerups.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 30),
        });
    }

    // End game jika lives habis
    if (lives <= 0 && !isGameOver) {
        gameOver();
        backgroundMusic.pause();
    }

    // Update score over time
    updateScoreOverTime();
}

// Fungsi untuk menampilkan Game Over Screen
function showGameOverScreen() {
    // Tampilkan elemen Game Over
    const gameOverScreen = document.getElementById("game-over-screen");
    const finalScore = document.getElementById("final-score");

    // Update skor akhir di layar game over
    finalScore.textContent = `Score: ${score}`;

    // Tampilkan layar Game Over
    gameOverScreen.style.display = "block";

    // Nonaktifkan game loop
    isGameOver = true;
}

// Modifikasi fungsi gameOver untuk menggunakan Game Over Screen
function gameOver() {
    isGameOver =  true
    backgroundMusic.pause()
    backgroundMusic.currentTime = 0
    // Tampilkan layar Game Over
    showGameOverScreen();

    // Kirimkan skor ke server
    saveScore();
}

function saveScore() {
    const username = getUsernameFromInput();  // Ambil username dari input atau session
    const score = getScoreFromGame();  // Ambil skor dari game

    fetch('/gameover', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, score: score })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            // Jika ada error dalam menyimpan skor, tampilkan pesan kesalahan
            alert('Error saving score to the database');
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
        alert('Network error while saving score');
    });
}



// Menambahkan event listener pada tombol "End Game"
document.getElementById("end-game-btn").addEventListener("click", function() {
    // Pastikan game sudah berakhir sebelum menyimpan skor
    if (isGameOver) {
        saveScore();
        window.location.href = "/leaderboard";  // Arahkan ke halaman leaderboard setelah game selesai
    }
});



/// Game loop tetap dijalankan kecuali game sudah berakhir
function gameLoop() {
    if (isGameOver) {
        return; // Jangan lanjutkan game loop jika game over
    }
    // Cek dan mainkan musik jika perlu
    if (!backgroundMusic.paused && !isGameOver) {
        checkAndPlaySound(); // Jika game belum selesai, teruskan cek suara
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and update game objects
    drawBackground();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawEnemyProjectiles();
    drawObstacles();
    drawPowerups();
    updateGame();

    // Display score and lives
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;

    // Loop the game
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
