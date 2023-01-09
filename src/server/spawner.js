const { RootEnemy } = require('./enemy.js');

global.eid = 0;

module.exports = class Spawner {
  constructor(type, rarity, delay, amount) {
    this.timer = 3 * delay;
    this.delay = Math.min(2200, delay);
    this.type = type;
    this.rarity = rarity;
    this.amount = amount;
    this.enemyRadius = new RootEnemy({ id: eid, arena: arena, type: this.type, rarity: this.rarity }).r;
  }
  simulate(dt, arena, enemies) {
    if (global.totalEnemyArea/*+this.enemyRadius*/ > 600) {
      return;
    }
    this.timer -= dt;//&& global.collisionAmount/(this.enemyRadius**2) < Object.keys(enemies).length+1
    if (this.timer < 0) {
      this.timer = this.delay + dt;
      enemies[eid] = new RootEnemy({ id: eid, arena: arena, type: this.type, rarity: this.rarity });
      broadcast({ spawn: enemies[eid].initPack() })

      eid++;

      this.timer += this.delay;

      this.amount--;
      if (this.amount <= 0) {
        return true;
      }
    }
  }
}