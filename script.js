const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const restartButton = document.getElementById('restart-button');

let bullets = [];
let enemies = [];
let gameOver = false;

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
    }, 100);
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
    alert('You were hit by an enemy! Game Over!');
    restartGame(); // Restart the game automatically
  }
}

// Restart the game
function restartGame() {
  gameOver = false;
  bullets.forEach((bullet) => bullet.remove());
  enemies.forEach((enemy) => enemy.remove());
  bullets = [];
  enemies = [];
  player.style.left = '380px';
  player.style.top = '550px';
}

// Spawn enemies at regular intervals
function spawnEnemies() {
  setInterval(() => {
    if (!gameOver) {
      createEnemy();
    }
  }, 1000); // Spawn a new enemy every second
}

// Start the game
spawnEnemies();

// Game over logic (example: after 20 seconds)
setTimeout(() => {
  if (!gameOver) {
    gameOver = true;
    alert('Time is up! Game Over!');
    restartGame();
  }
}, 20000);
