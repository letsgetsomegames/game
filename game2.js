window.onload = function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const keys = {};
  document.addEventListener("keydown", e => keys[e.code] = true);
  document.addEventListener("keyup", e => keys[e.code] = false);

  const rocket = {
    x: 500,
    y: 50,
    xVel: 0,
    yVel: 0,
    angle: 0,
    thrust: 0.4,
    gravity: -0.15,
    width: 20,
    height: 40,
    gearDeployed: true,
  };

  const camera = { x: 0, y: 0 };
  const platforms = [];
  const platformSpacing = 500;
  const platformY = 50;

  // Generate platforms for positive X
  function generatePlatforms(upToX) {
    platforms.length = 0;
    for (let x = platformSpacing; x <= upToX; x += platformSpacing) {
      platforms.push({ x, y: platformY, width: 100, height: 10 });
    }
    // Add first platform under starting rocket
    platforms.unshift({ x: 450, y: platformY, width: 100, height: 10 });
  }

  function toggleGear() {
    if (keys["Space"]) {
      rocket.gearDeployed = !rocket.gearDeployed;
      keys["Space"] = false;
    }
  }

  function updateRocket() {
    toggleGear();

    if (keys["ArrowLeft"]) rocket.angle -= 0.05;
    if (keys["ArrowRight"]) rocket.angle += 0.05;

    const effectiveThrust = rocket.gearDeployed ? rocket.thrust / 2 : rocket.thrust;

    if (keys["ArrowUp"]) {
      rocket.xVel += Math.cos(rocket.angle - Math.PI / 2) * effectiveThrust;
      rocket.yVel += Math.sin(rocket.angle - Math.PI / 2) * effectiveThrust;
    }

    rocket.yVel += rocket.gravity;

    rocket.x += rocket.xVel;
    rocket.y += rocket.yVel;

    // Collision with left wall
    if (rocket.x < 0) {
      rocket.x = 0;
      rocket.xVel = 0;
    }

    camera.x = rocket.x - canvas.width / 2;
    camera.y = rocket.y - canvas.height / 2;

    // Generate more platforms as you move right
    if (rocket.x > platforms[platforms.length - 1].x) {
      generatePlatforms(rocket.x + 1000);
    }
  }

  function checkLanding() {
    for (let p of platforms) {
      if (
        rocket.x > p.x &&
        rocket.x < p.x + p.width &&
        rocket.y - rocket.height / 2 <= p.y + 5 &&
        rocket.y - rocket.height / 2 >= p.y - 10 &&
        rocket.yVel <= 0
      ) {
        rocket.yVel = 0;
        rocket.y = p.y + rocket.height / 2;
        rocket.xVel *= 0.9;
      }
    }

    // Prevent falling below water
    if (rocket.y < 0) {
      rocket.y = 0;
      rocket.yVel = 0;
      rocket.xVel = 0;
    }
  }

  function drawRocket() {
    ctx.save();
    ctx.translate(rocket.x - camera.x, canvas.height - (rocket.y - camera.y));
    ctx.rotate(rocket.angle);

    ctx.fillStyle = "#ccc";
    ctx.beginPath();
    ctx.moveTo(0, -rocket.height / 2);
    ctx.lineTo(rocket.width / 2, rocket.height / 2);
    ctx.lineTo(-rocket.width / 2, rocket.height / 2);
    ctx.closePath();
    ctx.fill();

    if (keys["ArrowUp"]) {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.moveTo(0, rocket.height / 2);
      ctx.lineTo(-5, rocket.height / 2 + 15);
      ctx.lineTo(5, rocket.height / 2 + 15);
      ctx.closePath();
      ctx.fill();
    }

    if (rocket.gearDeployed) {
      ctx.strokeStyle = "#444";
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
    ctx.fillStyle = "#444";
    for (let p of platforms) {
      const screenX = p.x - camera.x;
      const screenY = canvas.height - (p.y - camera.y);
      ctx.fillRect(screenX, screenY, p.width, p.height);
    }
  }

  function drawWater() {
    const screenY = canvas.height - (0 - camera.y);
    ctx.fillStyle = "#4dc0ff";
    ctx.fillRect(0, screenY, canvas.width, canvas.height - screenY);
  }

  function drawGUI() {
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`↑ to thrust | ←/→ to rotate | Space to toggle gear`, 10, 20);
    ctx.fillText(
      `Thrust: ${rocket.gearDeployed ? "HALF" : "FULL"} | Gear: ${rocket.gearDeployed ? "DOWN" : "UP"}`,
      10,
      40
    );
    ctx.fillText(`X: ${rocket.x.toFixed(1)} Y: ${rocket.y.toFixed(1)}`, 10, 60);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWater();
    drawPlatforms();
    updateRocket();
    checkLanding();
    drawRocket();
    drawGUI();
    requestAnimationFrame(gameLoop);
  }

  generatePlatforms(1000);
  gameLoop();
};
