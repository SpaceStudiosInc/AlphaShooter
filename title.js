// Title Screen Implementation
const titleScreen = document.getElementById('titleScreen');
const titleTexts = [
    "SPACE STUDIOS PRESENTS",
    "ALPHA SHOOTER",
    "LOADING SYSTEMS..."
];

let currentTextIndex = 0;
let opacity = 0;
let fadeState = 'fadeIn';

function showTitleScreen() {
    titleScreen.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">${titleTexts[currentTextIndex]}</div>
        <div style="font-size: 16px; opacity: 0.7;">PRESS ANY KEY TO CONTINUE</div>
    `;
    
    // Start fade animation
    requestAnimationFrame(animateTitle);
}

function animateTitle(timestamp) {
    if (fadeState === 'fadeIn') {
        opacity += 0.02;
        if (opacity >= 1) {
            opacity = 1;
            fadeState = 'hold';
            setTimeout(() => fadeState = 'fadeOut', 2000);
        }
    } else if (fadeState === 'fadeOut') {
        opacity -= 0.02;
        if (opacity <= 0) {
            opacity = 0;
            fadeState = 'fadeIn';
            currentTextIndex = (currentTextIndex + 1) % titleTexts.length;
            showTitleScreen();
            
            // After last text, move to select screen
            if (currentTextIndex === titleTexts.length - 1) {
                document.getElementById('titleScreen').style.display = 'none';
                document.getElementById('selectScreen').style.display = 'flex';
                window.initSelectScreen();
                return;
            }
        }
    }
    
    titleScreen.style.opacity = opacity;
    requestAnimationFrame(animateTitle);
}

// Start title sequence when page loads
window.addEventListener('load', () => {
    showTitleScreen();
    
    // Skip to select screen on any key press
    document.addEventListener('keydown', () => {
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('selectScreen').style.display = 'flex';
        window.initSelectScreen();
    });
});

// This will be called from select.js
window.initSelectScreen = function() {};