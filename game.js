const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

const player = {
  x: 50, y: 300,
  width: 30, height: 40,
  xVel: 0, yVel: 0,
  speed: 2.5,
  jumpPower: 8,
  grounded: false,
};

const gravity = 0.4;
const friction = 0.8;

const platforms = [
  { x: 0, y: 380, width: 800, height: 20 },
  { x: 150, y: 320, width: 100, height: 10 },
  { x: 300, y: 260, width: 100, height: 10 },
  { x: 450, y: 200, width: 100, height: 10 },
  { x: 600, y: 140, width: 100, height: 10 },
];

const goal = { x: 630, y: 100, width: 20, height: 20 };

function rectsCollide(r1, r2) {
  return r1.x < r2.x + r2.width &&
         r1.x + r1.width > r2.x &&
         r1.y < r2.y + r2.height &&
         r1.y + r1.height > r2.y;
}

function update() {
  if (keys['ArrowLeft']) player.xVel = -player.speed;
  else if (keys['ArrowRight']) player.xVel = player.speed;
  else player.xVel *= friction;

  if (keys['Space'] && player.grounded) {
    player.yVel = -player.jumpPower;
    player.grounded = false;
  }

  player.yVel += gravity;

  player.x += player.xVel;
  player.y += player.yVel;

  player.grounded = false;
  for (const plat of platforms) {
    if (rectsCollide(player, plat)) {
      if (player.y + player.height - player.yVel <= plat.y) {
        player.y = plat.y - player.height;
        player.yVel = 0;
        player.grounded = true;
      } else if (player.y - player.yVel >= plat.y + plat.height) {
        player.y = plat.y + plat.height;
        player.yVel = 0;
      } else if (player.x + player.width - player.xVel <= plat.x) {
        player.x = plat.x - player.width;
      } else if (player.x - player.xVel >= plat.x + plat.width) {
        player.x = plat.x + plat.width;
      }
    }
  }

  if (rectsCollide(player, goal)) {
    alert("You win!");
    player.x = 50; player.y = 300;
    player.xVel = player.yVel = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff4444";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#444";
  for (const plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  ctx.fillStyle = "gold";
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
