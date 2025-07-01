document.addEventListener('DOMContentLoaded', () => {
    const gameButton = document.getElementById('game-button');
    const playContainer = document.getElementById('play-container');
    const gameButtonContainer = document.getElementById('game-button-container');
    const playButton = document.getElementById('play-button');
    const usernameInput = document.getElementById('username');
    const homeContainer = document.getElementById('home-container');
    const introSound = document.getElementById('intro-sound');
    
    // Play intro sound
    introSound.play().catch((error) => {
        console.log('Error playing intro sound:', error);
    });

    // Modal setup
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');

    // Game button click event
    gameButton.addEventListener('click', () => {
        console.log('Game button clicked');
        const clickSound = document.getElementById('click-sound');
        clickSound.play().then(() => {
            console.log('Click sound played');
        }).catch((error) => {
            console.log('Error playing click sound:', error);
        });
    
        // Hide game button and show the play form with fade effect
        gameButtonContainer.style.opacity = '0';
        setTimeout(() => {
            gameButtonContainer.style.display = 'none';
            playContainer.style.display = 'flex';
            playContainer.style.opacity = '0';
            setTimeout(() => {
                playContainer.style.opacity = '1';
            }, 100);
        }, 300);
    });

    playButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        console.log('Play button clicked');
    
        if (!username) {
            console.log('Username empty, showing modal');
            // Show modal notification
            modal.style.display = 'block';

            // Play notice sound
            const noticeSound = document.getElementById('notice-sound');
            noticeSound.play().then(() => {
                console.log('Notice sound played');
            }).catch((error) => {
                console.log('Error playing notice sound:', error);
            });
            return;
        }
    
        // Add fade-out effect before navigating to gameplay
        homeContainer.style.opacity = '0';
        setTimeout(() => {
            window.location.href = `/game?username=${encodeURIComponent(username)}`;
        }, 500);
    });

    // Close modal on click
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal if clicked outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
