const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');

let bullets = [];
let enemies = [];
let powerUps = [];
let gameOver = false;
let score = 0;
let rapidFireActive = false; // Tracks if rapid fire is active
let rapidFireTimeout = null; // To track the rapid fire timer

// Set up player movement with mouse
gameContainer.addEventListener('mousemove', (e) => {
  if (!gameOver) {
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - player.offsetWidth / 2;
    const y = e.clientY - rect.top - player.offsetHeight / 2;

    // Prevent player from moving outside the game container
    if (x >= 0 && x <= gameContainer.offsetWidth - player.offsetWidth) {
      player.style.left = `${x}px`;
    }
    if (y >= 0 && y <= gameContainer.offsetHeight - player.offsetHeight) {
      player.style.top = `${y}px`;
    }
  }
});

// Rapid fire minigun
gameContainer.addEventListener('mousedown', () => {
  if (!gameOver) {
    const shootInterval = setInterval(() => {
      if (!gameOver) {
        createBullet();
      } else {
        clearInterval(shootInterval);
      }
    }, rapidFireActive ? 50 : 100); // Faster shooting when rapid fire is active
    gameContainer.addEventListener('mouseup', () => clearInterval(shootInterval), { once: true });
  }
});

// Create a bullet
function createBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  const playerRect = player.getBoundingClientRect();
  const gameRect = gameContainer.getBoundingClientRect();

  bullet.style.left = `${playerRect.left - gameRect.left + player.offsetWidth / 2 - 2.5}px`;
  bullet.style.top = `${playerRect.top - gameRect.top}px`;

  gameContainer.appendChild(bullet);
  bullets.push(bullet);

  moveBullet(bullet);
}

// Move the bullet
function moveBullet(bullet) {
  const interval = setInterval(() => {
    const top = parseInt(bullet.style.top);
    if (top <= -10 || gameOver) {
      clearInterval(interval);
      bullet.remove();
      bullets = bullets.filter((b) => b !== bullet);
    } else {
      bullet.style.top = `${top - 10}px`;
      checkCollision(bullet);
    }
  }, 20);
}

// Create enemies
function createEnemy() {
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');
  const x = Math.random() * (gameContainer.offsetWidth - 40); // Random horizontal position
  enemy.style.left = `${x}px`;
  enemy.style.top = '0px';

  // Assign a random speed to the enemy (between 1 and 5 pixels per frame)
  const speed = Math.floor(Math.random() * 4) + 1; // Random speed between 1 and 5
  enemy.dataset.speed = speed; // Store the speed in the enemy's dataset

  gameContainer.appendChild(enemy);
  enemies.push(enemy);

  moveEnemy(enemy);
}

// Move the enemy
function moveEnemy(enemy) {
  const interval = setInterval(() => {
    const top = parseInt(enemy.style.top);
    if (top >= gameContainer.offsetHeight || gameOver) {
      clearInterval(interval);
      enemy.remove();
      enemies = enemies.filter((e) => e !== enemy);
    } else {
      const speed = parseInt(enemy.dataset.speed); // Retrieve the speed from the dataset
      enemy.style.top = `${top + speed}px`; // Move the enemy based on its speed
      checkPlayerCollision(enemy); // Check for collision with the player
    }
  }, 30);
}

// Spawn power-ups at regular intervals
function spawnPowerUp() {
  setInterval(() => {
    if (!gameOver) {
      createPowerUp();
    }
  }, 10000); // Spawn a new power-up every 10 seconds
}

// Spawn bombs at regular intervals
function spawnBomb() {
  setInterval(() => {
    if (!gameOver) {
      createBomb();
    }
  }, 15000); // Spawn a new bomb every 15 seconds
}

// Create a power-up
function createPowerUp() {
  const powerUp = document.createElement('div');
  powerUp.classList.add('power-up');
  const x = Math.random() * (gameContainer.offsetWidth - 30); // Random horizontal position
  powerUp.style.left = `${x}px`;
  powerUp.style.top = '0px';

  // Add a label to the power-up
  const label = document.createElement('div');
  label.classList.add('power-up-label');
  label.textContent = 'Power-Up';
  powerUp.appendChild(label);

  gameContainer.appendChild(powerUp);
  powerUps.push(powerUp);

  movePowerUp(powerUp);
}

// Create a bomb
function createBomb() {
  const bomb = document.createElement('div');
  bomb.classList.add('bomb');
  const x = Math.random() * (gameContainer.offsetWidth - 30); // Random horizontal position
  bomb.style.left = `${x}px`;
  bomb.style.top = '0px';

  // Add a label to the bomb
  const label = document.createElement('div');
  label.classList.add('bomb-label');
  label.textContent = 'Bomb';
  bomb.appendChild(label);

  gameContainer.appendChild(bomb);
  powerUps.push(bomb); // Treat the bomb as a power-up

  movePowerUp(bomb); // Use the same movement logic as other power-ups
}

// Move the power-up (and bomb)
function movePowerUp(powerUp) {
  const interval = setInterval(() => {
    const top = parseInt(powerUp.style.top);
    if (top >= gameContainer.offsetHeight || gameOver) {
      clearInterval(interval);
      powerUp.remove();
      powerUps = powerUps.filter((p) => p !== powerUp);
    } else {
      powerUp.style.top = `${top + 2}px`; // Power-up moves downward
      checkPowerUpCollision(powerUp); // Check for collision with the player
    }
  }, 30);
}

// Check collision between player and power-ups (including bombs)
function checkPowerUpCollision(powerUp) {
  const playerRect = player.getBoundingClientRect();
  const powerUpRect = powerUp.getBoundingClientRect();

  if (
    playerRect.left < powerUpRect.right &&
    playerRect.right > powerUpRect.left &&
    playerRect.top < powerUpRect.bottom &&
    playerRect.bottom > powerUpRect.top
  ) {
    // Player collects the power-up
    powerUp.remove();
    powerUps = powerUps.filter((p) => p !== powerUp);

    if (powerUp.classList.contains('bomb')) {
      activateBomb(); // Activate bomb effect
    } else {
      activateRapidFire(); // Activate rapid fire for other power-ups
    }
  }
}

// Activate rapid fire
function activateRapidFire() {
  if (!rapidFireActive) {
    rapidFireActive = true;
    displayMessage('Rapid Fire Activated!', 2000); // Display message on screen
    rapidFireTimeout = setTimeout(() => {
      rapidFireActive = false;
      displayMessage('Rapid Fire Deactivated!', 2000); // Display message on screen
    }, 5000); // Rapid fire lasts for 5 seconds
  }
}

// Activate bomb effect
function activateBomb() {
  displayMessage('Bomb Activated! All enemies destroyed!', 2000); // Display message on screen

  // Remove all enemies from the screen
  enemies.forEach((enemy) => {
    enemy.remove();
  });
  enemies = []; // Clear the enemies array
}

// Display a message on the screen
function displayMessage(message, duration) {
  const messageBox = document.createElement('div');
  messageBox.textContent = message;
  messageBox.style.position = 'absolute';
  messageBox.style.top = '50%';
  messageBox.style.left = '50%';
  messageBox.style.transform = 'translate(-50%, -50%)';
  messageBox.style.color = '#fff';
  messageBox.style.fontSize = '24px';
  messageBox.style.fontFamily = 'Arial, sans-serif';
  messageBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  messageBox.style.padding = '10px 20px';
  messageBox.style.borderRadius = '5px';
  messageBox.style.zIndex = '1000';

  gameContainer.appendChild(messageBox);

  setTimeout(() => {
    messageBox.remove();
  }, duration);
}

// Update the score display
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

// Check collision between bullets and enemies
function checkCollision(bullet) {
  const bulletRect = bullet.getBoundingClientRect();
  enemies.forEach((enemy) => {
    const enemyRect = enemy.getBoundingClientRect();
    if (
      bulletRect.left < enemyRect.right &&
      bulletRect.right > enemyRect.left &&
      bulletRect.top < enemyRect.bottom &&
      bulletRect.bottom > enemyRect.top
    ) {
      // Collision detected
      bullet.remove();
      enemy.remove();
      bullets = bullets.filter((b) => b !== bullet);
      enemies = enemies.filter((e) => e !== enemy);

      // Get the enemy's speed
      const speed = parseInt(enemy.dataset.speed);

      // Calculate the score based on speed (faster enemies give more points)
      const points = speed * 10; // Example: Speed 1 = 10 points, Speed 5 = 50 points
      score += points;

      // Update the score display
      updateScore();
    }
  });
}

// Check collision between player and enemies
function checkPlayerCollision(enemy) {
  const playerRect = player.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();

  if (
    playerRect.left < enemyRect.right &&
    playerRect.right > enemyRect.left &&
    playerRect.top < enemyRect.bottom &&
    playerRect.bottom > enemyRect.top
  ) {
    // Player touched by an enemy
    gameOver = true;
    displayMessage(`You were hit by an enemy! Game Over!\nFinal Score: ${score}`, 3000);
    restartGame(); // Restart the game automatically
  }
}

// Restart the game
function restartGame() {
  gameOver = false;
  bullets.forEach((bullet) => bullet.remove());
  enemies.forEach((enemy) => enemy.remove());
  powerUps.forEach((powerUp) => powerUp.remove());
  bullets = [];
  enemies = [];
  powerUps = [];
  score = 0; // Reset the score
  updateScore(); // Update the score display
  rapidFireActive = false; // Reset rapid fire
  clearTimeout(rapidFireTimeout); // Clear rapid fire timeout
  player.style.left = '380px';
  player.style.top = '550px';
}

// Spawn enemies at regular intervals
function spawnEnemies() {
  setInterval(() => {
    if (!gameOver) {
      createEnemy();
    }
  }, 250); // Spawn a new enemy every second
}

// Start the game
spawnEnemies();
spawnPowerUp();
spawnBomb();

// Game over logic (example: after 20 seconds)
setTimeout(() => {
  if (!gameOver) {
    gameOver = true;
    displayMessage(`Time is up! Game Over!\nFinal Score: ${score}`, 3000);
    restartGame();
  }
}, 20000);
