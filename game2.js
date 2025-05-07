window.onload = function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const keys = {};
  document.addEventListener("keydown", (e) => keys[e.code] = true);
  document.addEventListener("keyup", (e) => keys[e.code] = false);

  const waterHeight = 60;
  const platformY = canvas.height - waterHeight - 20;

  const rocket = {
    x: 100, // start on first platform
    y: platformY - 20,
    xVel: 0,
    yVel: 0,
    angle: 0,
    thrust: 0.4, // increased
    gravity: 0.15,
    width: 20,
    height: 40,
    gearDeployed: false
  };

  const camera = { x: 0, y: 0 };

  const platforms = [];
  function generatePlatforms() {
    // Start platform at x = 100
    platforms.push({ x: 100, y: platformY, width: 100, height: 10 });

    for (let i = 300; i <= 2000; i += 400) {
      platforms.push({
        x: i,
        y: platformY + Math.random() * 30 - 15,
        width: 100,
        height: 10,
      });
    }
  }

  function toggleGear() {
    if (keys["Space"]) {
      rocket.gearDeployed = !rocket.gearDeployed;
      keys["Space"] = false; // prevent repeating toggle
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

    camera.x = rocket.x - canvas.width / 2;
    camera.y = rocket.y - canvas.height / 2;
  }

  function drawRocket() {
    ctx.save();
    ctx.translate(rocket.x - camera.x, rocket.y - camera.y);
    ctx.rotate(rocket.angle);

    // Rocket body
    ctx.fillStyle = "#ccc";
    ctx.beginPath();
    ctx.moveTo(0, -rocket.height / 2);
    ctx.lineTo(rocket.width / 2, rocket.height / 2);
    ctx.lineTo(-rocket.width / 2, rocket.height / 2);
    ctx.closePath();
    ctx.fill();

    // Flame
    if (keys["ArrowUp"]) {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.moveTo(0, rocket.height / 2);
      ctx.lineTo(-5, rocket.height / 2 + 15);
      ctx.lineTo(5, rocket.height / 2 + 15);
      ctx.closePath();
      ctx.fill();
    }

    // Landing Gear
    if (rocket.gearDeployed) {
      ctx.strokeStyle = "#333";
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
    platforms.forEach((p) => {
      ctx.fillRect(p.x - camera.x, p.y - camera.y, p.width, p.height);
    });
  }

  function drawWater() {
    ctx.fillStyle = "#4dc0ff";
    ctx.fillRect(0, canvas.height - waterHeight, canvas.width, waterHeight);
  }

  function drawGUI() {
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText("← ↑ → to fly | SPACE to toggle landing gear", 10, 20);
    ctx.fillText(
      `Thrust: ${rocket.gearDeployed ? "HALF" : "FULL"} | Gear: ${
        rocket.gearDeployed ? "DOWN" : "UP"
      }`,
      10,
      40
    );
    ctx.fillText(`X: ${rocket.x.toFixed(1)} Y: ${rocket.y.toFixed(1)}`, 10, 60);
  }

  function checkLanding() {
    for (const p of platforms) {
      const withinX = rocket.x > p.x && rocket.x < p.x + p.width;
      const hittingY =
        rocket.y + rocket.height / 2 >= p.y &&
        rocket.y + rocket.height / 2 <= p.y + 5;

      if (withinX && hittingY && rocket.yVel >= 0) {
        // "land" on the platform
        rocket.yVel = 0;
        rocket.y = p.y - rocket.height / 2;
        rocket.xVel *= 0.9;
      }
    }

    // prevent falling below water
    const waterY = canvas.height - waterHeight;
    if (rocket.y > camera.y + waterY) {
      rocket.y = camera.y + waterY;
      rocket.yVel = 0;
      rocket.xVel = 0;
    }
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

  generatePlatforms();
  gameLoop();
};
