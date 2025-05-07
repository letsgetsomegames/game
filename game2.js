window.onload = function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const keys = {};
  document.addEventListener('keydown', e => keys[e.code] = true);
  document.addEventListener('keyup', e => keys[e.code] = false);

  const rocket = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 40,
    xVel: 0,
    yVel: 0,
    angle: 0,
    thrust: 0.15
  };

  function resetRocket() {
    rocket.x = canvas.width / 2;
    rocket.y = canvas.height / 2;
    rocket.xVel = 0;
    rocket.yVel = 0;
    rocket.angle = 0;
  }

  function updateRocket() {
    if (keys['ArrowLeft']) rocket.angle -= 0.05;
    if (keys['ArrowRight']) rocket.angle += 0.05;

    if (keys['ArrowUp']) {
      rocket.xVel += Math.cos(rocket.angle - Math.PI / 2) * rocket.thrust;
      rocket.yVel += Math.sin(rocket.angle - Math.PI / 2) * rocket.thrust;
    }

    rocket.x += rocket.xVel;
    rocket.y += rocket.yVel;

    // Screen wrap
    if (rocket.x < 0) rocket.x = canvas.width;
    if (rocket.x > canvas.width) rocket.x = 0;
    if (rocket.y < 0) rocket.y = canvas.height;
    if (rocket.y > canvas.height) rocket.y = 0;

    // Slight drag
    rocket.xVel *= 0.995;
    rocket.yVel *= 0.995;
  }

  function drawRocket() {
    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    ctx.rotate(rocket.angle);

    // Rocket body
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(0, -rocket.height / 2);
    ctx.lineTo(rocket.width / 2, rocket.height / 2);
    ctx.lineTo(-rocket.width / 2, rocket.height / 2);
    ctx.closePath();
    ctx.fill();

    // Thrust flame
    if (keys['ArrowUp']) {
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.moveTo(0, rocket.height / 2);
      ctx.lineTo(-5, rocket.height / 2 + 15);
      ctx.lineTo(5, rocket.height / 2 + 15);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawGUI() {
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText('Use ← ↑ → to control the rocket', 10, 20);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateRocket();
    drawRocket();
    drawGUI();
    requestAnimationFrame(gameLoop);
  }

  resetRocket();
  gameLoop();
};
