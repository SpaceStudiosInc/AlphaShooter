// Character Selection Screen
const selectScreen = document.getElementById('selectScreen');

const CHARACTERS = [
    {
        name: 'Scout',
        description: 'Fast but fragile',
        stats: { speed: 5, health: 100, fireRate: 0.2, damage: 20 },
        sprite: './players/p1.png'
    },
    {
        name: 'Marksman',
        description: 'Balanced fighter',
        stats: { speed: 3.5, health: 150, fireRate: 0.3, damage: 25 },
        sprite: './players/p2.png'
    },
    {
        name: 'Tank',
        description: 'Slow but powerful',
        stats: { speed: 2.5, health: 200, fireRate: 0.5, damage: 30 },
        sprite: './players/p3.png'
    },
    {
        name: 'Specialist',
        description: 'Unique abilities',
        stats: { speed: 4, health: 120, fireRate: 0.25, damage: 22 },
        sprite: './players/p4.png'
    },
    {
        name: 'Engineer',
        description: 'Technical expert',
        stats: { speed: 3, health: 180, fireRate: 0.4, damage: 18 },
        sprite: './players/p5.png'
    },
    {
        name: 'Commando',
        description: 'Stealth operative',
        stats: { speed: 4.5, health: 110, fireRate: 0.15, damage: 28 },
        sprite: './players/p6.png'
    }
];

// Character selection
function selectCharacter(index) {
    const selectedCharacter = CHARACTERS[index];
    
    // Hide select screen
    document.getElementById('selectScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    
    // Start game with selected character
    startGame(selectedCharacter);
}

function initSelectScreen() {
    selectScreen.innerHTML = `
        <h1>SELECT YOUR WARRIOR</h1>
        <div class="character-grid">
            ${CHARACTERS.map((char, index) => `
                <div class="character-option" onclick="selectCharacter(${index})">
                    <img src="${char.sprite}" alt="${char.name}" style="width: 100px; height: 100px;">
                    <div>${char.name}</div>
                    <div>${char.description}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// This will be called from game.js
function startGame(character) {}