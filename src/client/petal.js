class PetalContainer {
  constructor(init) {
    this.x = init.x;
    this.y = init.y;
    this.petalRadius = init.petalRadius;
    this.w = Math.max(this.petalRadius * 2 + 5, 50);
    this.h = Math.max(this.petalRadius * 2 + 5, 50);
    // string representing petal name
    this.petal = init.petal;
    this.rarity = init.rarity;
    this.id = init.id;
    this.decayTime = init.decayTime;
    this.initDecayTime = init.decayTime;
    this.petalRotation = Math.random() * 360;
  }
  render() {
    if (this.hp < 0) {
      return;
    }
    //const dt = (performance.now()-window.lastUpdateTime)*2;
    this.decayTime -= window.delta;//dt;
    if (this.initDecayTime - this.decayTime < 300) {
      ctx.globalAlpha = (this.initDecayTime - this.decayTime) / 300;
    } else if (this.decayTime < 300) {
      ctx.globalAlpha = Math.max(0, this.decayTime) / 300;
      if (this.decayTime < 0) {
        if (petalContainers[this.id] !== undefined) {
          pushDeadObject(petalContainers[this.id]);
        }
        delete petalContainers[this.id];
      }
    } else if (this.decayTime < 350) {
      ctx.globalAlpha = (this.decayTime - 50) / 100;
    }

    const pos = offset(this.x, this.y);
    ctx.fillStyle = '#70e46b';
    ctx.strokeStyle = '#5bbe59';
    ctx.fillStyle = consts.rarityColors[this.rarity][0];
    ctx.strokeStyle = consts.rarityColors[this.rarity][1];
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(pos.x - this.w / 2, pos.y - this.h / 2, this.w, this.h);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    renderPetal({ x: this.x, y: this.y, type: this.petal, rarity: this.rarity, rotation: this.petalRotation, r: this.petalRadius });
    ctx.globalAlpha = 1;
  }
}

class RootPetal {
  constructor(init) {
    switch (init.type) {
      case 'stinger':
        return new Stinger(init);
      case 'diep':
        return new DiepPetal(init);
      default:
        return new Default(init);
    }
  }
}

class Default {
  constructor(init) {
    this.angle = init.angle;
    this.lastAngle = init.angle;
    this.r = init.r;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.type = init.type;
    this.rarity = init.rarity;
    this.parentId = init.parentId;
    this.rotationSpeed = init.rotationSpeed;
    this.rotationDistance = init.rotationDistance;
    this.desiredRotationDistance = init.rotationDistance;
    this.rechargeTime = init.rechargeTime;
    this.rechargeTimer = init.rechargeTime;
    this.dead = init.dead;
    this.lastDeadTime = performance.now();
    this.id = init.id;
  }
  setRotationDistance(dist) {
    this.desiredRotationDistance = dist;
  }
  render(dt) {
    if (!players[this.parentId]) {
      return;
    }
    // we also have to update stuff here because we don't do that elsewhere...
    const interpolatedAngle = interpolateDirection(this.lastAngle, this.angle, dt);

    this.angle += this.rotationSpeed * 0.24//*dt;
    this.rotationDistance = linearLerp(this.rotationDistance, this.desiredRotationDistance, 0.24);
    this.x = players[this.parentId].renderX + Math.cos(interpolatedAngle) * this.rotationDistance;
    this.y = players[this.parentId].renderY + Math.sin(interpolatedAngle) * this.rotationDistance;

    if (this.dead && !this.deadTimer) {
      // fake petal rendering with deadtimer
      return;
    } else {
      // real petal
      ctx.globalAlpha = (performance.now() - this.lastDeadTime) / 200;
    }
    renderPetal({ parent: players[this.parentId], ...this });
    ctx.globalAlpha = 1;
  }
  updateAngle(data) {
    this.lastAngle = this.angle;
    this.angle = data;
  }
}

class Stinger {
  constructor(init) {
    this.angle = init.angle;
    this.lastAngle = init.angle;
    this.r = init.r;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.type = init.type;
    this.rarity = init.rarity;
    this.parentId = init.parentId;
    this.rotationSpeed = init.rotationSpeed;
    this.rotationDistance = init.rotationDistance;
    this.desiredRotationDistance = init.rotationDistance;
    this.rechargeTime = init.rechargeTime;
    this.rechargeTimer = init.rechargeTime;
    this.dead = init.dead;
    this.lastDeadTime = performance.now();
    this.id = init.id;
  }
  setRotationDistance(dist) {
    this.desiredRotationDistance = dist;
  }
  render(dt) {
    if (!players[this.parentId]) {
      return;
    }
    // we also have to update stuff here because we don't do that elsewhere...
    const interpolatedAngle = interpolateDirection(this.lastAngle, this.angle, dt);
    this.angle += this.rotationSpeed * dt;
    this.rotationDistance = linearLerp(this.rotationDistance, this.desiredRotationDistance, /*dt/2.4*/0.24);
    this.x = players[this.parentId].renderX + Math.cos(interpolatedAngle) * this.rotationDistance;
    this.y = players[this.parentId].renderY + Math.sin(interpolatedAngle) * this.rotationDistance;

    if (this.dead && !this.deadTimer) {
      // fake petal rendering with deadtimer
      return;
    } else {
      // real petal
      ctx.globalAlpha = (performance.now() - this.lastDeadTime) / 200;
    }
    renderPetal({ parent: players[this.parentId], ...this });
    ctx.globalAlpha = 1;
  }
  updateAngle(data) {
    this.lastAngle = this.angle;
    this.angle = data;
  }
}

class DiepPetal {
  constructor(init) {
    this.angle = init.angle;
    this.lastAngle = init.angle;
    this.r = init.r;
    this.x = init.x;
    this.y = init.y;
    this.lastX = init.x;
    this.lastY = init.y;
    this.type = init.type;
    this.rarity = init.rarity;
    this.parentId = init.parentId;
    this.rotationSpeed = init.rotationSpeed;
    this.rotationDistance = init.rotationDistance;
    this.desiredRotationDistance = init.rotationDistance;
    this.rechargeTime = init.rechargeTime;
    this.rechargeTimer = init.rechargeTime;
    this.dead = init.dead;
    this.lastDeadTime = performance.now();
    this.id = init.id;
    this.bullets = init.bullets;
    this.shootAngle = init.shootAngle;
    this.bulletSpeed = init.bulletSpeed;
    this.targetAngle = init.targetAngle;
    this.maxShootTimer = init.maxShootTimer;
    this.shootTimer = init.shootTimer;
  }
  setRotationDistance(dist) {
    this.desiredRotationDistance = dist;
  }
  simulate(dt) {
    if (this.dead) {
      return;
    }

    let nearestEnemy = null;
    let nearestDistance = 300 + this.r * 3;// detection radius
    for (let e of Object.values(enemies)) {
      let d = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestEnemy = e;
      }
    }

    if (nearestEnemy !== null) {
      this.targetAngle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);
      this.shootAngle = interpolateDirection(this.shootAngle, this.targetAngle, dt / 250);
    } else {
      this.targetAngle += dt * Math.PI / 3200;
      this.shootAngle += dt * Math.PI / 3200;
    }

    this.shootTimer -= dt;
    if (this.shootTimer < 0) {
      this.shootTimer = this.maxShootTimer;
      if (this.rarity === 'mythic' || this.rarity === 'omnipotent') {
        // twin and triplet
        const angle = this.shootAngle;
        const newBullets = [
          { x: this.x + Math.cos(angle + Math.PI / 2) * 0.6 * this.r, y: this.y + Math.sin(angle + Math.PI / 2) * 0.6 * this.r, angle: angle, life: 5000 },
          { x: this.x - Math.cos(angle + Math.PI / 2) * 0.6 * this.r, y: this.y - Math.sin(angle + Math.PI / 2) * 0.6 * this.r, angle: angle, life: 5000 },
        ];
        if (this.rarity === 'omnipotent') {
          newBullets.push({ x: this.x, y: this.y, angle: angle, life: 5000 });
        }
        for (let newBullet of newBullets) {
          this.bullets.push(newBullet);
        }
      } else {
        const newBullet = { x: this.x, y: this.y, angle: this.shootAngle, life: 5000 }
        this.bullets.push(newBullet);
      }
    }
  }
  render(dt) {

    if (!players[this.parentId]) {
      return;
    }

    if (this.simulate) {
      this.simulate(window.delta);
    }
    // we also have to update stuff here because we don't do that elsewhere...
    const interpolatedAngle = interpolateDirection(this.lastAngle, this.angle, dt);

    for (let b of this.bullets) {
      b.x += Math.cos(b.angle) * this.bulletSpeed * window.delta;
      b.y += Math.sin(b.angle) * this.bulletSpeed * window.delta;
    }// fix renderX and renderY 

    this.angle += this.rotationSpeed * dt;
    this.rotationDistance = linearLerp(this.rotationDistance, this.desiredRotationDistance, /*dt/2.4*/0.24);
    this.x = players[this.parentId].renderX + Math.cos(interpolatedAngle) * this.rotationDistance;
    this.y = players[this.parentId].renderY + Math.sin(interpolatedAngle) * this.rotationDistance;

    if (!this.deadTimer) {
      ctx.globalAlpha = 1;
      ctx.lineWidth = 6;
      ctx.fillStyle = '#00b0e1';
      ctx.strokeStyle = '#0083a8';
      for (let b of this.bullets) {
        ctx.globalAlpha = Math.max(0, Math.min(1, b.life / 1000));
        ctx.beginPath();
        const bdt = (performance.now() - b.lastUpdateTime) * 30 / 1000;

        // b.renderX = linearLerp(b.lastX,b.x,bdt);
        // b.renderY = linearLerp(b.lastY,b.y,bdt);
        const bpos = offset(/*b.renderX,b.renderY*/b.x, b.y);
        ctx.beginPath();
        ctx.arc(bpos.x, bpos.y, this.r / 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      }
    }

    if (this.dead && !this.deadTimer) {
      // fake petal rendering with deadtimer
      return;
    }

    if (!this.dead || this.deadTimer) {
      ctx.globalAlpha = (performance.now() - this.lastDeadTime) / 200;
    }
    renderPetal({ parent: players[this.parentId], ...this });
    ctx.globalAlpha = 1;
  }
  updateAngle(data) {
    this.lastAngle = this.angle;
    this.angle = data;
  }
}

function renderPetal(d) {
  ctx.beginPath();
  const rarityNumber = consts.rarityToNumber[d.rarity];
  const pos = offset(d.x, d.y);
  ctx.lineWidth = 4;
  let angleToPlayer = 0;
  switch (d.type) {
    case 'stinger':
      ctx.fillStyle = '#333333';
      ctx.strokeStyle = '#292929';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      angleToPlayer = 0;
      if (d.parent) {
        angleToPlayer = Math.atan2(d.y - d.parent.y, d.x - d.parent.x) * 180 / Math.PI;
      }
      if (d.rarity === 'mythic' || d.rarity === 'omnipotent') {
        const points = [
          pointAtAngle(d.x, d.y, 0 + angleToPlayer, d.r / 2),
          pointAtAngle(d.x, d.y, 120 + angleToPlayer, d.r / 2),
          pointAtAngle(d.x, d.y, 240 + angleToPlayer, d.r / 2),
        ];
        renderTriangle(points[0].x, points[0].y, d.r / 2, angleToPlayer);
        renderTriangle(points[1].x, points[1].y, d.r / 2, angleToPlayer);
        renderTriangle(points[2].x, points[2].y, d.r / 2, angleToPlayer);
        if (d.rarity === 'omnipotent') {
          renderTriangle(d.x, d.y, d.r / 6, angleToPlayer + 180);
        }
      } else {
        renderTriangle(d.x, d.y, d.r, angleToPlayer);
      }
      break;
    case 'diep':
      ctx.lineWidth = 6;
      angleToPlayer = 0;
      if (d.shootAngle) {
        angleToPlayer = d.shootAngle//Math.atan2(d.y-d.parent.y,d.x-d.parent.x);
      }
      ctx.beginPath();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angleToPlayer - Math.PI / 2);
      ctx.beginPath();
      ctx.fillStyle = '#999999';
      ctx.strokeStyle = '#727272';
      if (d.rarity === 'mythic' || d.rarity === 'omnipotent') {
        ctx.fillRect(-d.r / 3 * 2.4, 0, d.r / 3 * 2, d.r * 1.45);
        ctx.strokeRect(-d.r / 3 * 2.4, 0, d.r / 3 * 2, d.r * 1.45);
        ctx.fillRect(d.r / 3 * .4, 0, d.r / 3 * 2, d.r * 1.45);
        ctx.strokeRect(d.r / 3 * .4, 0, d.r / 3 * 2, d.r * 1.45);
        if (d.rarity === 'omnipotent') {
          ctx.fillRect(-d.r / 3, 0, d.r / 3 * 2, d.r * 1.6);
          ctx.strokeRect(-d.r / 3, 0, d.r / 3 * 2, d.r * 1.6);
        }
      } else {
        ctx.fillRect(-d.r / 3, 0, d.r / 3 * 2, d.r * 1.3);
        ctx.strokeRect(-d.r / 3, 0, d.r / 3 * 2, d.r * 1.3);
      }
      ctx.rotate(-angleToPlayer + Math.PI / 2);
      ctx.translate(-pos.x, -pos.y);
      ctx.closePath();

      ctx.fillStyle = '#00b0e1';
      ctx.strokeStyle = '#0083a8';
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.arc(pos.x, pos.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      break;
    default:
      //basic
      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 4;
      ctx.arc(pos.x, pos.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }
  ctx.closePath();
}

function pointAtAngle(x, y, angle, radius) {
  return { x: x + Math.cos(angle * Math.PI / 180) * radius, y: y + Math.sin(angle * Math.PI / 180) * radius }
}

function renderTriangle(x, y, r, angle) {
  ctx.beginPath();
  const points = [
    pointAtAngle(x, y, 0 + angle, r),
    pointAtAngle(x, y, 120 + angle, r),
    pointAtAngle(x, y, 240 + angle, r),
  ]
  const offsets = [
    offset(points[0].x, points[0].y),
    offset(points[1].x, points[1].y),
    offset(points[2].x, points[2].y),
  ]
  ctx.moveTo(offsets[0].x, offsets[0].y);
  ctx.lineTo(offsets[1].x, offsets[1].y);
  ctx.lineTo(offsets[2].x, offsets[2].y);
  ctx.lineTo(offsets[0].x, offsets[0].y);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}