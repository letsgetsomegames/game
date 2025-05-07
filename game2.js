window.onload = function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const keys = {};
  document.addEventListener('keydown', e => keys[e.code] = true);
  document.addEventListener('keyup', e => keys[e.code] = false);

  const rocket = {
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0,
    angle: 0,
    thrust: 0.15,
    gravity: 0.1,
    width: 20,
    height: 40,
    gearDeployed: false,
  };

  let camera = { x: 0, y: 0 };

  const platforms = [];

  function generatePlatforms(range = 2000) {
    for (let i = -range; i <= range; i += 400) {
      for (let j = 200; j <= range; j += 500) {
        platforms.push({ x: i, y: j + Math.random() * 100 - 50, width: 100, height: 10 });
      }
    }
  }

  function updateRocket() {
    // Controls
    if (keys['ArrowLeft']) rocket.angle -= 0.05;
    if (keys['ArrowRight']) rocket.angle += 0.05;
    if (keys['ArrowUp']) {
      rocket.xVel += Math.cos(rocket.angle - Math.PI / 2) * rocket.thrust;
      rocket.yVel += Math.sin(rocket.angle - Math.PI / 2) * rocket.thrust;
    }

    if (keys['Space']) rocket.gearDeployed = true;

    // Gravity
    rocket.yVel += rocket.gravity;

    // Update position
    rocket.x += rocket.xVel;
    rocket.y += rocket.yVel;

    // Camera follows
    camera.x = rocket.x - canvas.width / 2;
    camera.y = rocket.y - canvas.height / 2;
  }

  function drawRocket() {
    ctx.save();
    ctx.translate(rocket.x - camera.x, rocket.y - camera.y);
    ctx.rotate(rocket.angle);

    // Body
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(0, -rocket.height / 2);
    ctx.lineTo(rocket.width / 2, rocket.height / 2);
    ctx.lineTo(-rocket.width / 2, rocket.height / 2);
    ctx.closePath();
    ctx.fill();

    // Flame
    if (keys['ArrowUp']) {
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.moveTo(0, rocket.height / 2);
      ctx.lineTo(-5, rocket.height / 2 + 15);
      ctx.lineTo(5, rocket.height / 2 + 15);
      ctx.closePath();
      ctx.fill();
    }

    // Landing gear
    if (rocket.gearDeployed) {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, rocket.height / 2);
      ctx.lineTo(-15, rocket.height / 2 + 10);
      ctx.moveTo(10, rocket.height / 2);
      ctx.lineTo(15, rocket.height / 2 + 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawPlatforms() {
    ctx.fillStyle = '#444';
    for (let platform of platforms) {
      const screenX = platform.x - camera.x;
      const screenY = platform.y - camera.y;
      ctx.fillRect(screenX, screenY, platform.width, platform.height);
    }
  }

  function drawGUI() {
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText('← ↑ → to control | SPACE to deploy landing gear', 10, 20);
    ctx.fillText(`X: ${Math.round(rocket.x)} Y: ${Math.round(rocket.y)}`, 10, 40);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateRocket();
    drawPlatforms();
    drawRocket();
    drawGUI();
    requestAnimationFrame(gameLoop);
  }

  generatePlatforms();
  gameLoop();
};
