// script.js

// Select the canvas and set its dimensions
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 40; // Leave some margin
canvas.height = window.innerHeight - 100;

// Game variables
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 5,
  angle: 0, // Player's direction in degrees
  health: 100, // Player health
};

const enemies = [];
const bullets = [];
let gameOver = false; // Track if the game is over
const maxEnemies = 5; // Maximum number of enemies at any time

// Generate random enemies farther away from the player
function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    let enemyX, enemyY;
    do {
      enemyX = Math.random() * canvas.width;
      enemyY = Math.random() * canvas.height;
    } while (
      Math.sqrt(
        (enemyX - player.x) ** 2 + (enemyY - player.y) ** 2
      ) < 200 // Minimum distance of 200 pixels
    );

    enemies.push({
      x: enemyX,
      y: enemyY,
      size: 15,
      speed: 2,
    });
  }
}

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// Shoot bullets in the direction the player is facing
function shoot() {
  const bulletSpeed = 10;
  const angleRad = player.angle * (Math.PI / 180); // Convert angle to radians
  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angleRad) * bulletSpeed, // Horizontal velocity
    dy: Math.sin(angleRad) * bulletSpeed, // Vertical velocity
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') { // Spacebar to shoot
    shoot();
  }
});

// Update game state
function update() {
  if (gameOver) return; // Stop updating if the game is over

  // Move player
  if (keys['ArrowUp'] || keys['w']) {
    player.y -= player.speed;
  }
  if (keys['ArrowDown'] || keys['s']) {
    player.y += player.speed;
  }
  if (keys['ArrowLeft'] || keys['a']) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] || keys['d']) {
    player.x += player.speed;
  }

  // Rotate player
  if (keys['q']) {
    player.angle -= 5; // Rotate left
  }
  if (keys['e']) {
    player.angle += 5; // Rotate right
  }

  // Update bullets
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;

    // Remove bullets that go off-screen
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });

  // Update enemies
  enemies.forEach((enemy, index) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Move enemies toward the player
    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;

    // Check for collisions with bullets
    bullets.forEach((bullet, bIndex) => {
      const bdx = bullet.x - enemy.x;
      const bdy = bullet.y - enemy.y;
      const bDistance = Math.sqrt(bdx * bdx + bdy * bdy);

      if (bDistance < enemy.size) {
        // Enemy hit
        enemies.splice(index, 1);
        bullets.splice(bIndex, 1);
      }
    });

    // Check for collision with player
    if (distance < player.size + enemy.size) {
      player.health -= 10; // Reduce player health
      enemies.splice(index, 1); // Remove the enemy

      if (player.health <= 0) {
        gameOver = true; // End the game
        showRestartButton(); // Show the restart button
      }
    }
  });

  // Spawn more enemies if the count is below the threshold
  if (enemies.length < maxEnemies) {
    spawnEnemies(maxEnemies - enemies.length);
  }
}

// Draw everything
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate((player.angle * Math.PI) / 180); // Rotate the player
  ctx.fillStyle = 'blue';
  ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
  ctx.restore();

  // Draw bullets
  ctx.fillStyle = 'yellow';
  bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
  });

  // Draw enemies
  ctx.fillStyle = 'red';
  enemies.forEach((enemy) => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  // Draw health bar
  ctx.fillStyle = 'green';
  ctx.fillRect(10, 10, (player.health / 100) * 200, 20); // Green health bar
  ctx.strokeStyle = 'white';
  ctx.strokeRect(10, 10, 200, 20); // Outline of the health bar

  // Display "Game Over" text
  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
  }
}

// Show restart button
function showRestartButton() {
  const restartButton = document.createElement('button');
  restartButton.innerText = 'Restart';
  restartButton.style.position = 'absolute';
  restartButton.style.top = '50%';
  restartButton.style.left = '50%';
  restartButton.style.transform = 'translate(-50%, 50px)';
  restartButton.style.padding = '10px 20px';
  restartButton.style.fontSize = '16px';
  restartButton.style.cursor = 'pointer';

  // Add event listener to restart the game
  restartButton.addEventListener('click', () => {
    resetGame();
    restartButton.remove(); // Remove the button after restarting
  });

  document.body.appendChild(restartButton);
}

// Reset the game
function resetGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.angle = 0;
  player.health = 100; // Reset health
  bullets.length = 0;
  enemies.length = 0;
  gameOver = false;
  spawnEnemies(maxEnemies); // Respawn initial enemies
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
spawnEnemies(maxEnemies); // Spawn initial enemies
gameLoop();
