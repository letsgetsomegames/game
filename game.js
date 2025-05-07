const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

const player = {
  x: 50, y: 300,
  size: 40,
  xVel: 0, yVel: 0,
  speed: 2.5,
  jumpPower: 8,
  grounded: false,
  blinkTimer: 0,
};

const gravity = 0.4;
const friction = 0.8;

let currentLevel = 0;
const levels = [
  {
    platforms: [
      { x: 0, y: 380, width: 800, height: 20 },
      { x: 150, y: 320, width: 100, height: 10 },
      { x: 300, y: 260, width: 100, height: 10 },
      { x: 450, y: 200, width: 100, height: 10 },
      { x: 600, y: 140, width: 100, height: 10 },
    ],
    goal: { x: 630, y: 100, width: 20, height: 20 },
  },
  {
    platforms: [
      { x: 0, y: 380, width: 800, height: 20 },
      { x: 100, y: 330, width: 150, height: 10 },
      { x: 300, y: 280, width: 150, height: 10 },
      { x: 500, y: 220, width: 150, height: 10 },
    ],
    goal: { x: 640, y: 180, width: 20, height: 20 },
  }
];

function getCurrentLevel() {
  return levels[currentLevel];
}

function resetPlayer() {
  player.x = 50;
  player.y = 300;
  player.xVel = 0;
  player.yVel = 0;
}

function rectsCollide(r1, r2) {
  return r1.x < r2.x + r2.width &&
         r1.x + player.size > r2.x &&
         r1.y < r2.y + r2.height &&
         r1.y + player.size > r2.y;
}

function update() {
  // Movement
  if (keys['ArrowLeft']) player.xVel = -player.speed;
  else if (keys['ArrowRight']) player.xVel = player.speed;
  else player.xVel *= friction;

  if (keys['ArrowUp'] && player.grounded) {
    player.yVel = -player.jumpPower;
    player.grounded = false;
  }

  player.yVel += gravity;
  player.x += player.xVel;
  player.y += player.yVel;

  player.grounded = false;
  const { platforms, goal } = getCurrentLevel();
  for (const plat of platforms) {
    if (rectsCollide(player, plat)) {
      if (player.y + player.size - player.yVel <= plat.y) {
        player.y = plat.y - player.size;
        player.yVel = 0;
        player.grounded = true;
      } else if (player.y - player.yVel >= plat.y + plat.height) {
        player.y = plat.y + plat.height;
        player.yVel = 0;
      } else if (player.x + player.size - player.xVel <= plat.x) {
        player.x = plat.x - player.size;
      } else if (player.x - player.xVel >= plat.x + plat.width) {
        player.x = plat.x + plat.width;
      }
    }
  }

  if (rectsCollide(player, goal)) {
    currentLevel++;
    if (currentLevel >= levels.length) {
      win = true;
    } else {
      resetPlayer();
    }
  }

  // Eye blinking
  player.blinkTimer++;
  if (player.blinkTimer > 60) {
    player.blinkTimer = 0;
  }
}

let win = false;

function drawPlayer() {
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Eyes
  ctx.fillStyle = "#fff";
  const eyeY = player.blinkTimer > 55 ? 2 : 10; // Blink
  ctx.fillRect(player.x + 8, player.y + eyeY, 5, 5);
  ctx.fillRect(player.x + 26, player.y + eyeY, 5, 5);
}

function drawGUI() {
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText("Level: " + (win ? "Complete!" : currentLevel + 1), 10, 20);
  if (win) {
    ctx.fillStyle = "gold";
    ctx.font = "24px Arial";
    ctx.fillText("🎉 You beat all levels!", 280, 200);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { platforms, goal } = getCurrentLevel();

  // Draw platforms
  ctx.fillStyle = "#444";
  for (const plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  // Draw goal
  ctx.fillStyle = "gold";
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

  drawPlayer();
  drawGUI();
}

function gameLoop() {
  if (!win) update();
  draw();
  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
