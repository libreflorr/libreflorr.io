class RootEnemy {
  constructor(init) {
    switch (init.type) {
      case 'evadesnormal':
        return new EvadesBall(init);
      case 'diep':
        return new DiepEnemy(init);
      case 'boss':
        return new Boss(init);
      case 'homing':
        return new Homing(init);
      case 'bullet':
        return new Bullet(init);
      default:
        return new EvadesBall(init);
    }
  }
}

class EvadesBall {
  constructor(init) {
    this.type = init.type;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.rarity = init.rarity;
    this.id = init.id;
    this.r = init.r;
    this.lastUpdateTime = performance.now();
    this.lastDamage = 0;
  }
  render(damaged = false) {
    const dt = (performance.now() - this.lastUpdateTime) * 30 / 1000;

    this.renderX = linearLerp(this.lastX, this.x, dt);
    this.renderY = linearLerp(this.lastY, this.y, dt);

    // body       
    ctx.lineWidth = 4;
    if (damaged) {
      ctx.fillStyle = 'red';
      ctx.strokeStyle = '#cccccc';
      ctx.globalAlpha = 1 - (performance.now() - this.lastDamage) / 100;
    } else {
      configureEnemyRender(this.type);
    }

    const pos = offset(this.renderX, this.renderY);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    if (!damaged && performance.now() - this.lastDamage < 100) {
      this.render(true);
    }
    ctx.globalAlpha = 1;
  }
  updatePack(data) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = data.x;
    this.y = data.y;
    this.lastUpdateTime = performance.now();
  }
}

class Homing {
  constructor(init) {
    this.type = init.type;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.rarity = init.rarity;
    this.id = init.id;
    this.r = init.r;
    this.lastUpdateTime = performance.now();
    this.lastDamage = 0;
    this.angle = init.angle;
  }
  render(damaged = false) {
    const dt = (performance.now() - this.lastUpdateTime) * 30 / 1000;

    this.renderX = linearLerp(this.lastX, this.x, dt);
    this.renderY = linearLerp(this.lastY, this.y, dt);

    // body       
    ctx.lineWidth = 4;
    if (damaged) {
      ctx.fillStyle = 'red';
      ctx.strokeStyle = '#cccccc';
      ctx.globalAlpha = 1 - (performance.now() - this.lastDamage) / 100;
    } else {
      ctx.fillStyle = '#333333';
      ctx.strokeStyle = '#292929';
    }
    let nearestPlayer = null;
    let nearestDistance = 160 + this.r * 6;// detection radius
    for (let e of Object.values(players)) {
      let d = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestPlayer = e;
      }
    }
    if (nearestPlayer !== null) {
      this.angle *= Math.PI / 180;
      const dX = nearestPlayer.x - this.x;
      const dY = nearestPlayer.y - this.y;
      const targetAngle = Math.atan2(dY, dX);
      this.angle = interpolateDirection(this.angle, targetAngle, dt / 4);
      this.angle *= 180 / Math.PI;
    }
    if (this.rarity === 'mythic' || this.rarity === 'omnipotent') {
      const points = [
        pointAtAngle(this.renderX, this.renderY, 0 + this.angle, this.r / 2),
        pointAtAngle(this.renderX, this.renderY, 120 + this.angle, this.r / 2),
        pointAtAngle(this.renderX, this.renderY, 240 + this.angle, this.r / 2),
      ];
      renderTriangle(points[0].x, points[0].y, this.r / 2, this.angle);
      renderTriangle(points[1].x, points[1].y, this.r / 2, this.angle);
      renderTriangle(points[2].x, points[2].y, this.r / 2, this.angle);
      if (this.rarity === 'omnipotent') {
        renderTriangle(this.renderX, this.renderY, this.r / 6, this.angle + 180);
      }
    } else {
      renderTriangle(this.renderX, this.renderY, this.r, this.angle);
    }

    if (!damaged && performance.now() - this.lastDamage < 100) {
      this.render(true);
    }
    ctx.globalAlpha = 1;
  }
  updatePack(data) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = data.x;
    this.y = data.y;
    this.lastUpdateTime = performance.now();
  }
}

class DiepEnemy {
  constructor(init) {
    this.type = init.type;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.rarity = init.rarity;
    this.id = init.id;
    this.r = init.r;
    this.lastUpdateTime = performance.now();
    this.lastDamage = 0;

    this.angle = init.angle;
  }
  render(damaged = false) {
    const dt = (performance.now() - this.lastUpdateTime) * 30 / 1000;

    this.renderX = linearLerp(this.lastX, this.x, dt);
    this.renderY = linearLerp(this.lastY, this.y, dt);

    // body
    const pos = offset(this.renderX, this.renderY);

    ctx.lineWidth = 6;
    if (damaged) {
      ctx.fillStyle = 'red';
      ctx.strokeStyle = '#cccccc';
      ctx.globalAlpha = 1 - (performance.now() - this.lastDamage) / 100;
    } else {
      ctx.translate(pos.x, pos.y);
      ctx.rotate(this.angle + Math.PI / 2);
      ctx.beginPath();
      ctx.fillStyle = '#999999';
      ctx.strokeStyle = '#727272';
      if (this.rarity === 'mythic' || this.rarity === 'omnipotent') {
        ctx.fillRect(-this.r / 3 * 2.4, 0, this.r / 3 * 2, this.r * 1.45);
        ctx.strokeRect(-this.r / 3 * 2.4, 0, this.r / 3 * 2, this.r * 1.45);
        ctx.fillRect(this.r / 3 * .4, 0, this.r / 3 * 2, this.r * 1.45);
        ctx.strokeRect(this.r / 3 * .4, 0, this.r / 3 * 2, this.r * 1.45);
        if (this.rarity === 'omnipotent') {
          ctx.fillRect(-this.r / 3, 0, this.r / 3 * 2, this.r * 1.6);
          ctx.strokeRect(-this.r / 3, 0, this.r / 3 * 2, this.r * 1.6);
        }
      } else {
        ctx.fillRect(-this.r / 3, 0, this.r / 3 * 2, this.r * 1.3);
        ctx.strokeRect(-this.r / 3, 0, this.r / 3 * 2, this.r * 1.3);
      }
      ctx.closePath();
      ctx.rotate(-this.angle - Math.PI / 2);
      ctx.translate(-pos.x, -pos.y);
      configureEnemyRender(this.type);
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    if (!damaged && performance.now() - this.lastDamage < 100) {
      this.render(true);
    }
    ctx.globalAlpha = 1;
  }
  updatePack(data) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = data.x;
    this.y = data.y;
    this.angle = data.angle;
    this.lastUpdateTime = performance.now();
  }
}

class Boss {
  constructor(init) {
    this.type = init.type;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.rarity = init.rarity;
    this.id = init.id;
    this.r = init.r;
    this.lastUpdateTime = performance.now();
    this.lastDamage = 0;

    this.angle = init.angle;
  }
  render(damaged = false) {
    const dt = (performance.now() - this.lastUpdateTime) * 30 / 1000;

    this.renderX = linearLerp(this.lastX, this.x, dt);
    this.renderY = linearLerp(this.lastY, this.y, dt);

    // body
    const pos = offset(this.renderX, this.renderY);

    ctx.lineWidth = 6;
    if (damaged) {
      ctx.fillStyle = 'red';
      ctx.strokeStyle = '#cccccc';
      ctx.globalAlpha = 1 - (performance.now() - this.lastDamage) / 100;
    } else {
      ctx.translate(pos.x, pos.y);

      ctx.fillStyle = '#999999';
      ctx.strokeStyle = '#727272';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.rotate(this.angle + Math.PI / 2 + Math.PI * 2 * i / 8);
        ctx.fillRect(-this.r / 3, 0, this.r / 3 * 2, this.r * 1.5);
        ctx.strokeRect(-this.r / 3, 0, this.r / 3 * 2, this.r * 1.5);
        ctx.rotate(-this.angle - Math.PI / 2 - Math.PI * 2 * i / 8);
        ctx.closePath();
      }

      ctx.translate(-pos.x, -pos.y);
      configureEnemyRender(this.type);
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    if (!damaged && performance.now() - this.lastDamage < 100) {
      this.render(true);
    }
    ctx.globalAlpha = 1;
  }
  updatePack(data) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = data.x;
    this.y = data.y;
    this.angle = data.angle;
    this.lastUpdateTime = performance.now();
  }
}

class Bullet {
  constructor(init) {
    this.type = init.type;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.rarity = init.rarity;
    this.id = init.id;
    this.r = init.r;
    this.lastUpdateTime = performance.now();
    this.lastDamage = 0;

    this.angle = init.angle;
  }
  render(damaged = false) {
    const dt = (performance.now() - this.lastUpdateTime) * 30 / 1000;

    this.renderX = linearLerp(this.lastX, this.x, dt);
    this.renderY = linearLerp(this.lastY, this.y, dt);

    // body
    const pos = offset(this.renderX, this.renderY);

    ctx.fillStyle = '#00b0e1';
    ctx.strokeStyle = '#0083a8';
    if (damaged) {
      ctx.globalAlpha = (1 - (performance.now() - this.lastDamage) / 100) / 4;
      ctx.lineWidth = 6;
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    if (!damaged && performance.now() - this.lastDamage < 100) {
      this.render(true);
    }
    ctx.globalAlpha = 1;
  }
  updatePack(data) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = data.x;
    this.y = data.y;
    this.angle = data.angle;
    this.lastUpdateTime = performance.now();
  }
}

function configureEnemyRender(type) {
  switch (type) {
    case 'homing':
      ctx.fillStyle = 'brown'
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      break;
    case 'boss':
    case 'diep':
      ctx.fillStyle = '#00b0e1';
      ctx.strokeStyle = '#0083a8';
      break;
    default:
      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#cccccc';
  }
}