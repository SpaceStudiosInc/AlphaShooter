// Game Over Screen Implementation
const gameOverScreen = document.getElementById('gameOverScreen');

// This will be called from game.js
window.showGameOver = function(score, waves) {
    gameOverScreen.innerHTML = `
        <h1 style="font-size: 48px; margin-bottom: 20px;">GAME OVER</h1>
        <div style="font-size: 24px; margin: 10px 0;">Final Score: ${score}</div>
        <div style="font-size: 24px; margin: 10px 0;">Waves Survived: ${waves}</div>
        
        <div style="margin-top: 40px; display: flex; gap: 20px; justify-content: center;">
            <div class="character-option" onclick="window.location.reload()" 
                 style="padding: 15px 30px; background: rgba(0,0,0,0.7); border-radius: 5px;">
                PLAY AGAIN
            </div>
            
            <div class="character-option" onclick="returnToTitle()" 
                 style="padding: 15px 30px; background: rgba(0,0,0,0.7); border-radius: 5px;">
                MAIN MENU
            </div>
        </div>
    `;
}

window.returnToTitle = function() {
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('titleScreen').style.display = 'flex';
    
    // Reset title sequence
    currentTextIndex = 0;
    opacity = 0;
    fadeState = 'fadeIn';
    showTitleScreen();
};