window.onload = function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const keys = {};
  document.addEventListener('keydown', e => keys[e.code] = true);
  document.addEventListener('keyup', e => keys[e.code] = false);

  const rocket = {
    x: 100,  // Starts at bottom-left platform
    y: 380,  // Position above the water
    xVel: 0,
    yVel: 0,
    angle: 0,
    thrust: 0.3,  // Increased thrust
    gravity: 0.1,
    width: 20,
    height: 40,
    gearDeployed: false,
  };

  const waterHeight = 40;  // Height of the water
  let camera = { x: 0, y: 0 };
  const platforms = [];
  const groundY = canvas.height - waterHeight;

  // Generate platforms
  function generatePlatforms(range = 2000) {
    for (let i = 200; i <= range; i += 400) {
      // Platforms are floating above the water
      platforms.push({ x: i, y: groundY - Math.random() * 30 - 10, width: 100, height: 10 });
    }
  }

  function updateRocket() {
    if (keys['ArrowLeft']) rocket.angle -= 0.05;
    if (keys['ArrowRight']) rocket.angle += 0.05;

    // Thrust effect, reduced by 50% when landing gear is deployed
    const effectiveThrust = rocket.gearDeployed ? rocket.thrust / 2 : rocket.thrust;

    if (keys['ArrowUp']) {
      rocket.xVel += Math.cos(rocket.angle - Math.PI / 2) * effectiveThrust;
      rocket.yVel += Math.sin(rocket.angle - Math.PI / 2) * effectiveThrust;
    }

    // Gravity
    rocket.yVel += rocket.gravity;

    // Update position
    rocket.x += rocket.xVel;
    rocket.y += rocket.yVel;

    // Camera follows the rocket
    camera.x = rocket.x - canvas.width / 2;
    camera.y = rocket.y - canvas.height / 2;
  }

  function drawRocket() {
    ctx.save();
    ctx.translate(rocket.x - camera.x, rocket.y - camera.y);
    ctx.rotate(rocket.angle);

    // Rocket body
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

  function drawWater() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, canvas.height - waterHeight, canvas.width, waterHeight);
  }

  function drawGUI() {
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText('← ↑ → to control | SPACE to deploy landing gear', 10, 20);
    ctx.fillText(`X: ${Math.round(rocket.x)} Y: ${Math.round(rocket.y)}`, 10, 40);
  }

  function checkLanding() {
    for (let platform of platforms) {
      if (rocket.y + rocket.height / 2 >= platform.y &&
        rocket.x > platform.x && rocket.x < platform.x + platform.width) {
        // Land on platform
        if (Math.abs(rocket.yVel) < 2 && rocket.y + rocket.height / 2 <= platform.y) {
          rocket.yVel = 0;
          rocket.y = platform.y - rocket.height / 2;
          if (rocket.gearDeployed) {
            rocket.gearDeployed = false;  // Retract gear on landing
          }
        }
      }
    }
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateRocket();
    checkLanding();
    drawWater();
    drawPlatforms();
    drawRocket();
    drawGUI();
    requestAnimationFrame(gameLoop);
  }

  generatePlatforms(2000); // Generate platforms across the map
  gameLoop();
};
