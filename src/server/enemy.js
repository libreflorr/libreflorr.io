const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'omnipotent'];
const scaleFactors = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3.5,
  legendary: 12,
  unique: 16,
  mythic: 20,
  omnipotent: 48
}

class RootEnemy {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    switch (data.type) {
      case 'evadesnormal':
        return new EvadesBall(data.id, data.arena, data.rarity, data.type, data.x, data.y);
      case 'diep':
        return new DiepEnemy(data.id, data.arena, data.rarity, data.type, data.x, data.y);
      case 'bullet':
        return new Bullet(data.id, data.arena, data.rarity, data.type, data.x, data.y, data.angle, data.isBoss);
      case 'homing':
        return new Homing(data.id, data.arena, data.rarity, data.type, data.x, data.y);
      case 'boss':
        return new Boss(data.id, data.arena, data.type);
      default:
        return new EvadesBall(data.id, { w: 1200, h: 1200 }, 'common', 'evadesnormal', data.x, data.y);
    }
  }
}

class EvadesBall {
  constructor(id, arena, rarity, type, x, y) {
    this.id = id;
    this.r = Math.sqrt(scaleFactors[rarity]) * 30 - 22;
    this.speed = scaleFactors[rarity] / 100;
    this.x = x || this.r + Math.random() * (arena.w - 2 * this.r);
    this.y = y || this.r + Math.random() * (arena.h - 2 * this.r);
    this.angle = Math.random() * Math.PI * 2;
    this.xv = Math.cos(this.angle) * this.speed;
    this.yv = Math.sin(this.angle) * this.speed;
    this.health = 10 + (scaleFactors[rarity] ** 1.5) * 10;
    this.damage = 8 + (Math.sqrt(scaleFactors[rarity])) / 1.5;
    this.rarity = rarity;
    this.type = type;
    this.grav = { x: 0, y: 0 };
    if (rarityToNumber[this.rarity] >= 5) {
      this.spawnRarity = rarities[rarityToNumber[this.rarity] - 5];
      this.timer = 10000 / rarityToNumber[this.rarity];
      this.delay = this.timer;
    }
    this.maxSpawns = 20;
  }
  simulate(dt, players, enemies, arena) {
    this.x += this.xv * dt;
    this.y += this.yv * dt;

    this.x += this.grav.x * dt;
    this.y += this.grav.y * dt;
    this.grav.x *= Math.pow(0.98, dt * 30 / 1000);
    this.grav.y *= Math.pow(0.98, dt * 30 / 1000);

    if (this.x + this.r > arena.w) {
      this.x = arena.w - this.r;
      this.xv = -Math.abs(this.xv);
    } else if (this.x - this.r < 0) {
      this.x = this.r;
      this.xv = Math.abs(this.xv);
    }
    if (this.y + this.r > arena.h) {
      this.y = arena.h - this.r;
      this.yv = -Math.abs(this.yv);
    } else if (this.y - this.r < 0) {
      this.y = this.r;
      this.yv = Math.abs(this.yv);
    }

    if (this.spawnRarity && this.maxSpawns > 0 && global.totalEnemyArea < 600) {
      this.timer -= dt;
      if (this.timer < 0) {
        this.timer = this.delay + dt;
        this.maxSpawns--;
        const angle = Math.random() * Math.PI * 2;
        enemies[eid] = new RootEnemy({
          id: eid,
          arena: global.arena,
          type: this.type,
          rarity: this.spawnRarity,
          x: this.x + Math.cos(angle) * this.r,
          y: this.y + Math.sin(angle) * this.r
        });
        broadcast({ spawn: enemies[eid].initPack() });

        eid++;

        this.timer += this.delay;
        this.delay *= 1.01;
      }
    }
  }
  initPack() {
    return this;
  }
  pack() {
    return {
      x: roundPack(this.x),
      y: roundPack(this.y),
      id: this.id
    };
  }
}

class Homing {
  constructor(id, arena, rarity, type, x, y) {
    this.id = id;
    this.r = Math.sqrt(scaleFactors[rarity]) * 30 - 22;
    this.speed = 0.05 + (scaleFactors[rarity] ** 1.5) / 1000;
    this.x = x || this.r + Math.random() * (arena.w - 2 * this.r);
    this.y = y || this.r + Math.random() * (arena.h - 2 * this.r);
    this.angle = Math.random() * Math.PI * 2;
    this.xv = Math.cos(this.angle) * this.speed;
    this.yv = Math.sin(this.angle) * this.speed;
    this.health = 10 + (scaleFactors[rarity] ** 1.5) * 6;
    this.damage = this.health / (scaleFactors[rarity] ** 0.2) / 1.5;
    this.rarity = rarity;
    this.type = type;
    this.grav = { x: 0, y: 0 };
    this.damageDelay = 1.5;
  }
  simulate(dt, players, enemies, arena) {
    if (this.damageDelay > 0) {
      this.damageDelay -= dt / 1000;
    }
    this.x += this.xv * dt;
    this.y += this.yv * dt;

    this.x += this.grav.x * dt * 2;
    this.y += this.grav.y * dt * 2;
    this.grav.x *= Math.pow(0.985, dt * 30 / 1000);
    this.grav.y *= Math.pow(0.985, dt * 30 / 1000);

    if (this.x + this.r > arena.w) {
      this.x = arena.w - this.r;
      this.xv = -Math.abs(this.xv);
    } else if (this.x - this.r < 0) {
      this.x = this.r;
      this.xv = Math.abs(this.xv);
    }
    if (this.y + this.r > arena.h) {
      this.y = arena.h - this.r;
      this.yv = -Math.abs(this.yv);
    } else if (this.y - this.r < 0) {
      this.y = this.r;
      this.yv = Math.abs(this.yv);
    }

    // homing
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
      const dX = nearestPlayer.x - this.x;
      const dY = nearestPlayer.y - this.y;
      const targetAngle = Math.atan2(dY, dX);
      this.xv = Math.cos(targetAngle) * this.speed;
      this.yv = Math.sin(targetAngle) * this.speed;
      // const dif = targetAngle - this.angle;
      // const angleDif = Math.atan2(Math.sin(dif), Math.cos(dif));
      // const angleIncrement = 0.04;
      // if (Math.abs(angleDif) >= angleIncrement) {
      //     if (angleDif < 0) {
      //         this.angle -= angleIncrement*dt;
      //     } else {
      //         this.angle += angleIncrement*dt;
      //     }
      //     this.xv = Math.cos(this.angle) * this.speed;
      //     this.yv = Math.sin(this.angle) * this.speed;
      // }
    }
  }
  initPack() {
    return this;
  }
  pack() {
    return {
      x: roundPack(this.x),
      y: roundPack(this.y),
      id: this.id
    };
  }
}

global.interpolateDirection = (start, end, time) => {
  const absD = Math.abs((end - start));
  if (absD >= Math.PI) {
    // The angle between the directions is large - we should rotate the other way
    if (start > end) {
      return start + (end + 2 * Math.PI - start) * time;
    } else {
      return start - (end - 2 * Math.PI - start) * time;
    }
  } else {
    // Normal interp
    return start + (end - start) * time;
  }
}

class DiepEnemy {
  constructor(id, arena, rarity, type, x, y) {
    this.id = id;
    this.r = Math.sqrt(scaleFactors[rarity] ** 1.22) * 15 - 7;
    this.speed = scaleFactors[rarity] ** (1 / 4) / 84;
    this.x = x || this.r + Math.random() * (arena.w - 2 * this.r);
    this.y = y || this.r + Math.random() * (arena.h - 2 * this.r);
    this.angle = Math.random() * Math.PI * 2;
    this.xv = 0;
    this.yv = 0;
    this.health = 10 + (scaleFactors[rarity] ** 1.5) * 10;
    this.damage = 5 + (Math.sqrt(scaleFactors[rarity]));
    this.rarity = rarity;
    this.type = type;
    this.grav = { x: 0, y: 0 };
    this.nearestPlayer = null;
    this.maxShootTimer = 5000 / (Math.sqrt(scaleFactors[rarity]) + 4);
    if (this.rarity === 'omnipotent') {
      this.maxShootTimer *= 1.65;
    }
    this.shootTimer = this.maxShootTimer * 2;
  }
  simulate(dt, players, enemies, arena) {
    this.x += this.xv * dt;
    this.y += this.yv * dt;
    this.xv *= Math.pow(0.9, dt * 30 / 1000);
    this.yv *= Math.pow(0.9, dt * 30 / 1000);

    this.x += this.grav.x * dt;
    this.y += this.grav.y * dt;
    this.grav.x *= Math.pow(0.98, dt * 30 / 1000);
    this.grav.y *= Math.pow(0.98, dt * 30 / 1000);

    let nearestPlayer = null;
    let nearestDistance = 300 + this.r * 3;// detection radius
    for (let p of Object.values(players)) {
      let d = Math.sqrt((p.x - this.x) ** 2 + (p.y - this.y) ** 2);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestPlayer = p;
      }
    }

    if (nearestPlayer !== null) {
      // TODO:
      // we can do prediction later on but for rn 
      // just shoot at the player's angle
      this.targetAngle = Math.atan2(this.y - nearestPlayer.y, this.x - nearestPlayer.x);
      if (nearestDistance > 250 + this.r) {
        this.xv -= Math.cos(this.targetAngle) * this.speed;
        this.yv -= Math.sin(this.targetAngle) * this.speed;
      } else if (nearestDistance < 100 + this.r) {
        this.xv += Math.cos(this.targetAngle) * this.speed;
        this.yv += Math.sin(this.targetAngle) * this.speed;
      } else {
        // rotate around the player
        let angleIncrement = this.targetAngle + dt * Math.PI / 1600;
        let nearestDist = Math.sqrt((this.y - nearestPlayer.y) ** 2 + (this.x - nearestPlayer.x) ** 2);
        let targetPosition = {
          x: nearestPlayer.x + Math.cos(angleIncrement) * nearestDist,
          y: nearestPlayer.y + Math.sin(angleIncrement) * nearestDist
        }
        let realTargetAngle = Math.atan2(this.y - targetPosition.y, this.x - targetPosition.x);
        this.xv -= Math.cos(realTargetAngle) * this.speed / 10;
        this.yv -= Math.sin(realTargetAngle) * this.speed / 10;
      }
      this.angle = interpolateDirection(this.angle, this.targetAngle, dt / 250);
    } else {
      this.angle += dt * Math.PI / 1600;
    }
    this.angle = (this.angle + Math.PI * 2000) % (Math.PI * 2);

    if (this.x + this.r > arena.w) {
      this.x = arena.w - this.r;
      this.xv = -Math.abs(this.xv);
    } else if (this.x - this.r < 0) {
      this.x = this.r;
      this.xv = Math.abs(this.xv);
    }
    if (this.y + this.r > arena.h) {
      this.y = arena.h - this.r;
      this.yv = -Math.abs(this.yv);
    } else if (this.y - this.r < 0) {
      this.y = this.r;
      this.yv = Math.abs(this.yv);
    }

    // bullets
    this.shootTimer -= dt;
    if (this.shootTimer < 0 && nearestPlayer !== null) {
      this.shootTimer = this.maxShootTimer;
      const offset = {
        x: Math.cos(this.angle + Math.PI) * this.r,
        y: Math.sin(this.angle + Math.PI) * this.r
      }
      if (this.rarity === 'mythic' || this.rarity === 'omnipotent') {
        this.spawnEnemy(
          this.x + offset.x + Math.cos(this.angle + Math.PI / 2) * this.r * 0.6,
          this.y + offset.y + Math.sin(this.angle + Math.PI / 2) * this.r * 0.6
        );
        this.spawnEnemy(
          this.x + offset.x - Math.cos(this.angle + Math.PI / 2) * this.r * 0.6,
          this.y + offset.y - Math.sin(this.angle + Math.PI / 2) * this.r * 0.6
        );
        if (this.rarity === 'omnipotent') {
          this.spawnEnemy(
            this.x + offset.x,
            this.y + offset.y
          )
        }
      } else {
        this.spawnEnemy(
          this.x + offset.x,
          this.y + offset.y
        )
      }
    }
  }
  spawnEnemy(x, y) {
    enemies[eid] = new RootEnemy({
      id: eid,
      arena: global.arena,
      type: 'bullet',
      rarity: this.rarity,
      x: x,
      y: y,
      angle: this.angle + Math.PI
    });
    broadcast({ spawn: enemies[eid].initPack() });
    eid++;
  }
  initPack() {
    return this;
  }
  pack() {
    return {
      x: roundPack(this.x),
      y: roundPack(this.y),
      angle: Math.round(this.angle * 1000) / 1000,
      id: this.id,
    };
  }
}

class Boss {
  constructor(id, arena, type) {
    this.id = id;
    this.r = 280;
    this.speed = 0;
    this.x = arena.w / 2;
    this.y = arena.h / 2;
    this.angle = Math.random() * Math.PI * 2;
    this.xv = 0;
    this.yv = 0;
    this.health = 10000;
    this.damage = 28;
    this.rarity = 'omnipotent';
    this.type = type;
    this.grav = { x: 0, y: 0 };
    this.nearestPlayer = null;
    this.maxShootTimer = 322 / 1.06;
    this.shootTimer = this.maxShootTimer * 2;
  }
  simulate(dt, players, enemies, arena) {
    this.x += this.xv * dt;
    this.y += this.yv * dt;
    this.xv *= Math.pow(0.9, dt * 30 / 1000);
    this.yv *= Math.pow(0.9, dt * 30 / 1000);

    this.x = arena.w / 2;
    this.y = arena.h / 2;

    let nearestPlayer = null;
    let nearestDistance = 300 + this.r * 3;// detection radius
    for (let p of Object.values(players)) {
      let d = Math.sqrt((p.x - this.x) ** 2 + (p.y - this.y) ** 2);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestPlayer = p;
      }
    }

    this.radius = this.health / 10000 * 280;

    this.angle = (this.angle + dt * Math.PI / 3800 + Math.PI * 2000) % (Math.PI * 2);

    if (this.x + this.r > arena.w) {
      this.x = arena.w - this.r;
      this.xv = -Math.abs(this.xv);
    } else if (this.x - this.r < 0) {
      this.x = this.r;
      this.xv = Math.abs(this.xv);
    }
    if (this.y + this.r > arena.h) {
      this.y = arena.h - this.r;
      this.yv = -Math.abs(this.yv);
    } else if (this.y - this.r < 0) {
      this.y = this.r;
      this.yv = Math.abs(this.yv);
    }

    // bullets
    this.shootTimer -= dt;
    if (this.shootTimer < 0 && nearestPlayer !== null) {
      this.shootTimer = this.maxShootTimer;
      for (let i = 0; i < 8; i++) {
        const offset = {
          x: Math.cos(this.angle + Math.PI + Math.PI * 2 * i / 8) * this.r,
          y: Math.sin(this.angle + Math.PI + Math.PI * 2 * i / 8) * this.r
        }
        this.spawnEnemy(
          this.x + offset.x,
          this.y + offset.y,
          this.angle + Math.PI + Math.PI * 2 * i / 8
        )
      }
    }
  }
  spawnEnemy(x, y, angle) {
    enemies[eid] = new RootEnemy({
      id: eid,
      arena: global.arena,
      type: 'bullet',
      rarity: 'omnipotent',
      x: x,
      y: y,
      angle: angle,
      isBoss: true,
    });
    broadcast({ spawn: enemies[eid].initPack() });
    eid++;
  }
  initPack() {
    return this;
  }
  pack() {
    return {
      x: roundPack(this.x),
      y: roundPack(this.y),
      angle: Math.round(this.angle * 1000) / 1000,
      radius: roundPack(this.radius),
      id: this.id,
    };
  }
}

class Bullet {
  constructor(id, arena, rarity, type, x, y, angle, isBoss = false) {
    this.id = id;
    this.x = x || this.r + Math.random() * (arena.w - 2 * this.r);
    this.y = y || this.r + Math.random() * (arena.h - 2 * this.r);
    this.angle = angle || Math.random() * Math.PI * 2;
    this.speed = Math.sqrt(scaleFactors[rarity]) / 10.5;
    this.xv = Math.cos(this.angle) * this.speed;
    this.yv = Math.sin(this.angle) * this.speed;
    this.damage = 8 + (Math.sqrt(scaleFactors[rarity]));
    this.health = 10 + (scaleFactors[rarity]);
    this.r = (Math.sqrt(scaleFactors[rarity] ** 1.2) * 15 - 7) / 3;
    this.rarity = rarity;
    this.type = type;
    this.grav = { x: 0, y: 0 };
    this.life = 3000;
    this.boss = isBoss;
    if (this.boss) {
      this.r *= 2.2;
      this.damage *= 1.8;
      this.speed *= 1.25;
    }
  }
  simulate(dt, players, enemies, arena) {
    this.x += this.xv * dt;
    this.y += this.yv * dt;

    this.x += this.grav.x * dt;
    this.y += this.grav.y * dt;
    this.grav.x *= Math.pow(0.98, dt * 30 / 1000);
    this.grav.y *= Math.pow(0.98, dt * 30 / 1000);

    this.life -= dt;
    if (this.life < 0) {
      return true;
    }
  }
  initPack() {
    return this;
  }
  pack() {
    return {
      x: roundPack(this.x),
      y: roundPack(this.y),
      id: this.id
    };
  }
}

module.exports = {
  RootEnemy,
  EvadesBall,
  DiepEnemy,
  Boss,
  Homing
}